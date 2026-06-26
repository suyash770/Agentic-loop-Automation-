import express from 'express';
import Workflow from '../models/Workflow';
import Execution from '../models/Execution';

const router = express.Router();

// Webhook trigger endpoint
router.post('/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    
    // Check if workflow exists and is active
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }
    if (!workflow.isActive) {
      return res.status(400).json({ message: 'Workflow is inactive' });
    }

    // Create a new execution
    const execution = new Execution({
      workflowId: workflow._id,
      status: 'Pending',
      triggerData: req.body || {}
    });
    await execution.save();

    // Return 200 OK immediately as per requirements
    res.status(200).json({ message: 'Execution queued', executionId: execution._id });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
