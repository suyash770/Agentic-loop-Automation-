import { IExecution } from '../models/Execution';
import ExecutionLog from '../models/ExecutionLog';
import Workflow from '../models/Workflow';

import axios from 'axios';
import puppeteer from 'puppeteer';

// Real implementations for nodes
const executeHttpNode = async (config: any, inputData: any) => {
  console.log('Executing HTTP Node:', config.url);
  const { url, method = 'GET', headers = {}, body } = config;
  
  // Implemented robust network retry logic (Phase 5)
  let retries = 3;
  while (retries > 0) {
    try {
      const response = await axios({
        url: url || inputData.url,
        method,
        headers,
        data: method !== 'GET' ? (body || inputData) : undefined,
        timeout: 10000
      });
      return { status: response.status, data: response.data };
    } catch (error: any) {
      retries--;
      if (retries === 0) throw new Error(`HTTP Node failed: ${error.message}`);
      await new Promise(res => setTimeout(res, 2000)); // wait 2s before retry
    }
  }
};

const executeScraperNode = async (config: any, inputData: any) => {
  console.log('Executing Scraper Node:', config.url);
  const browser = await puppeteer.launch({ 
    headless: true, 
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  try {
    const page = await browser.newPage();
    await page.goto(config.url || inputData.url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    let extractedData;
    if (config.selector) {
      extractedData = await page.$eval(config.selector, el => el.textContent);
    } else {
      extractedData = {
        title: await page.title(),
        url: page.url()
      };
    }
    return extractedData;
  } finally {
    await browser.close();
  }
};

const executeTransformerNode = async (config: any, inputData: any) => {
  console.log('Executing Transformer Node');
  if (config.extractKey && inputData[config.extractKey]) {
    return { [config.extractKey]: inputData[config.extractKey] };
  }
  return { ...inputData, _transformedAt: new Date() };
};

export const executeWorkflow = async (execution: IExecution) => {
  try {
    const workflow = await Workflow.findById(execution.workflowId);
    if (!workflow || workflow.nodes.length === 0) {
      throw new Error('Workflow not found or empty');
    }

    // BFS Queue to support branching (DAG execution)
    // The engine assumes the first node in the array is the root entry point
    const queue: { nodeId: string; inputData: any }[] = [
      { nodeId: workflow.nodes[0]!.id, inputData: execution.triggerData || {} }
    ];

    let hasFailed = false;

    while (queue.length > 0) {
      const currentTask = queue.shift()!;
      const node = workflow.nodes.find(n => n.id === currentTask.nodeId);
      
      if (!node) continue;

      const log = new ExecutionLog({
        executionId: execution._id,
        workflowId: workflow._id,
        nodeId: node.id,
        status: 'Running',
        inputData: currentTask.inputData,
        startedAt: new Date()
      });
      await log.save();

      try {
        let outputData;
        switch (node.type) {
          case 'HTTP':
            outputData = await executeHttpNode(node.config, currentTask.inputData);
            break;
          case 'Scraper':
            outputData = await executeScraperNode(node.config, currentTask.inputData);
            break;
          case 'Transformer':
            outputData = await executeTransformerNode(node.config, currentTask.inputData);
            break;
          default:
            throw new Error(`Unknown node type: ${node.type}`);
        }

        log.status = 'Success';
        log.outputData = outputData;
        log.completedAt = new Date();
        await log.save();

        // Engine Superpower: Enqueue downstream nodes (Branching & Parallel execution support!)
        if (node.next && node.next.length > 0) {
          for (const nextId of node.next) {
            queue.push({ nodeId: nextId, inputData: outputData });
          }
        }
      } catch (error: any) {
        log.status = 'Failed';
        log.error = error.message;
        log.completedAt = new Date();
        await log.save();

        hasFailed = true;
        // Fail fast: clear the queue if any branch encounters a fatal error
        queue.length = 0; 
      }
    }

    execution.status = hasFailed ? 'Failed' : 'Success';
    execution.completedAt = new Date();
    await execution.save();

  } catch (error) {
    console.error(`Execution ${execution._id} failed:`, error);
    execution.status = 'Failed';
    execution.completedAt = new Date();
    await execution.save();
  }
};
