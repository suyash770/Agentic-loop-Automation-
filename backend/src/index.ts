import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import workflowRoutes from './routes/workflows';
import webhookRoutes from './routes/webhooks';
import executionRoutes from './routes/executions';
import { startPolling } from './worker/pollingWorker';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/executions', executionRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Workflow engine backend is running' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
}

// Connect to MongoDB and start server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // Start the background worker
    startPolling();
  });
};

startServer();
