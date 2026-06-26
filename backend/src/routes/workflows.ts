import express from 'express';
import Workflow from '../models/Workflow';

const router = express.Router();

// Get all workflows
router.get('/', async (req, res) => {
  try {
    const workflows = await Workflow.find().sort({ createdAt: -1 });
    res.json(workflows);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get single workflow
router.get('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Create workflow
router.post('/', async (req, res) => {
  try {
    const { name, isActive, nodes } = req.body;
    const workflow = new Workflow({ name, isActive, nodes });
    await workflow.save();
    res.status(201).json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Update workflow
router.put('/:id', async (req, res) => {
  try {
    const { name, isActive, nodes } = req.body;
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { name, isActive, nodes },
      { new: true }
    );
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json(workflow);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// Delete workflow
router.delete('/:id', async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) return res.status(404).json({ message: 'Workflow not found' });
    res.json({ message: 'Workflow deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
