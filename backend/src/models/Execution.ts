import mongoose, { Document, Schema } from 'mongoose';

export interface IExecution extends Document {
  workflowId: mongoose.Types.ObjectId;
  status: 'Pending' | 'Running' | 'Success' | 'Failed';
  startedAt?: Date;
  completedAt?: Date;
  triggerData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ExecutionSchema = new Schema({
  workflowId: { type: Schema.Types.ObjectId, ref: 'Workflow', required: true },
  status: { type: String, enum: ['Pending', 'Running', 'Success', 'Failed'], default: 'Pending' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  triggerData: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

export default mongoose.model<IExecution>('Execution', ExecutionSchema);
