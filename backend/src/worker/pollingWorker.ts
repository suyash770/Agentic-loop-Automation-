import Execution from '../models/Execution';
import { executeWorkflow } from './executionLogic';

let isPolling = false;

export const startPolling = () => {
  console.log('Starting polling worker...');
  
  setInterval(async () => {
    if (isPolling) return; // Prevent overlapping queries
    isPolling = true;

    try {
      // Find a pending execution and atomically lock it to 'Running'
      const execution = await Execution.findOneAndUpdate(
        { status: 'Pending' },
        { status: 'Running', startedAt: new Date() },
        { new: true, sort: { createdAt: 1 } } // Oldest first
      );

      if (execution) {
        console.log(`Picked up execution ${execution._id} for workflow ${execution.workflowId}`);
        // Run execution logic in background
        executeWorkflow(execution).catch(err => {
          console.error(`Error executing workflow ${execution._id}:`, err);
        });
      }
    } catch (error) {
      console.error('Polling error:', error);
    } finally {
      isPolling = false;
    }
  }, 5000); // Poll every 5 seconds
};
