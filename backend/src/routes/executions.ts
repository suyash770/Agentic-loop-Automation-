import express from 'express';
import Execution from '../models/Execution';
import ExecutionLog from '../models/ExecutionLog';

const router = express.Router();

// Get aggregated stats (7-day sparkline and 30-day heatmap)
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get executions for the last 30 days
    const recentExecutions = await Execution.find({
      createdAt: { $gte: last30Days }
    });

    // Group by day for the 30-day heatmap
    const heatmapMap = new Map<string, number>();
    // Group by day for the 7-day sparkline
    const sparklineMap = new Map<string, number>();

    // Initialize the maps to have 0 counts for missing days to ensure full arrays
    for (let i = 0; i < 30; i++) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0] as string;
      heatmapMap.set(dateStr, 0);
      if (i < 7) {
        sparklineMap.set(dateStr, 0);
      }
    }

    recentExecutions.forEach(exec => {
      const dateStr = new Date(exec.createdAt).toISOString().split('T')[0] as string;
      if (heatmapMap.has(dateStr)) {
        heatmapMap.set(dateStr, heatmapMap.get(dateStr)! + 1);
      }
      if (sparklineMap.has(dateStr)) {
        sparklineMap.set(dateStr, sparklineMap.get(dateStr)! + 1);
      }
    });

    // Format for frontend arrays
    const heatmap = Array.from(heatmapMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const sparkline = Array.from(sparklineMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      heatmap,
      sparkline,
      totalExecutions30d: recentExecutions.length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get recent node execution logs (for Live Terminal)
router.get('/recent-logs', async (req, res) => {
  try {
    const logs = await ExecutionLog.find()
      .populate('workflowId', 'name')
      .sort({ createdAt: -1, startedAt: -1 })
      .limit(20);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get pipeline velocity (executions and errors over last 24h)
router.get('/velocity', async (req, res) => {
  try {
    const today = new Date();
    const last24Hours = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const logs = await ExecutionLog.find({
      startedAt: { $gte: last24Hours }
    });

    const velocityMap = new Map<string, { time: string, executions: number, errors: number }>();

    // Initialize the last 24 hours in the map
    for (let i = 23; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 60 * 60 * 1000);
      const hourStr = d.toLocaleTimeString([], { hour: 'numeric', hour12: true }); // "1 PM"
      const mapKey = d.toISOString().substring(0, 13); // yyyy-mm-ddThh
      velocityMap.set(mapKey, { time: hourStr, executions: 0, errors: 0 });
    }

    logs.forEach(log => {
      const d = new Date(log.startedAt);
      const mapKey = d.toISOString().substring(0, 13);
      
      if (velocityMap.has(mapKey)) {
        const entry = velocityMap.get(mapKey)!;
        if (log.status === 'Success') {
          entry.executions += 1;
        } else if (log.status === 'Failed') {
          entry.errors += 1;
        }
      }
    });

    const velocityData = Array.from(velocityMap.values());
    res.json(velocityData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get all executions, populated with workflow details
router.get('/', async (req, res) => {
  try {
    const executions = await Execution.find()
      .populate('workflowId', 'name')
      .sort({ createdAt: -1 });
    res.json(executions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get a single execution and its logs
router.get('/:id', async (req, res) => {
  try {
    const execution = await Execution.findById(req.params.id)
      .populate('workflowId', 'name nodes');
      
    if (!execution) return res.status(404).json({ message: 'Execution not found' });

    const logs = await ExecutionLog.find({ executionId: req.params.id })
      .sort({ startedAt: 1 });

    res.json({ execution, logs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
