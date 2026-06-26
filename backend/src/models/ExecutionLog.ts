import mongoose, { Document, Schema } from 'mongoose';

export interface IExecutionLog extends Document {
  executionId: mongoose.Types.ObjectId;
  workflowId: mongoose.Types.ObjectId;
  nodeId: string;
  status: 'Running' | 'Success' | 'Failed';
  inputData: Record<string, any>;
  outputData?: Record<string, any>;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

const ExecutionLogSchema = new Schema({
  executionId: { type: Schema.Types.ObjectId, ref: 'Execution', required: true },
  workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  nodeId: { type: String, required: true },
  status: { type: String, enum: ['Running', 'Success', 'Failed'], required: true },
  inputData: { type: Schema.Types.Mixed, default: {} },
  outputData: { type: Schema.Types.Mixed, default: {} },
  error: { type: String },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model<IExecutionLog>('ExecutionLog', ExecutionLogSchema);
