import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResourceRequest extends Document {
  studentId?: any;
  studentEmail?: string;
  subjectTitle?: string;
  department?: string;
  semester?: string;
  url?: string;
  category: string;
  description: string;
  status: 'Pending' | 'Fulfilled' | 'Rejected';
  adminNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceRequestSchema = new Schema<IResourceRequest>(
  {
    studentId: { type: Schema.Types.Mixed },
    studentEmail: { type: String, default: '' },
    subjectTitle: { type: String, default: '' },
    department: { type: String, default: '' },
    semester: { type: String, default: '' },
    url: { type: String, default: '' },
    category: { type: String, default: 'Notes' },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Fulfilled', 'Rejected'],
      default: 'Pending',
    },
    adminNote: { type: String, default: '' },
  },
  { timestamps: true }
);

const ResourceRequest: Model<IResourceRequest> =
  mongoose.models.ResourceRequest ||
  mongoose.model<IResourceRequest>('ResourceRequest', ResourceRequestSchema);
export default ResourceRequest;
