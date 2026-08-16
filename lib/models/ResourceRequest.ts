import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IResourceRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  category: string;
  description: string;
  status: 'Pending' | 'Fulfilled' | 'Rejected';
  adminNote: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceRequestSchema = new Schema<IResourceRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    category: {
      type: String,
      enum: ['Syllabus', 'Notes', 'Books', 'Model Question Papers', 'Lab Manuals', 'Other'],
      required: true,
    },
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
