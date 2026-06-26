import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkflowNode {
  id: string;
  type: 'HTTP' | 'Scraper' | 'Transformer';
  config: Record<string, any>;
  next?: string[];
}

export interface IWorkflow extends Document {
  name: string;
  isActive: boolean;
  nodes: IWorkflowNode[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkflowNodeSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['HTTP', 'Scraper', 'Transformer'], required: true },
  config: { type: Schema.Types.Mixed, default: {} },
  next: [{ type: String }]
});

const WorkflowSchema = new Schema({
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  nodes: [WorkflowNodeSchema]
}, { timestamps: true });

export default mongoose.model<IWorkflow>('Workflow', WorkflowSchema);
