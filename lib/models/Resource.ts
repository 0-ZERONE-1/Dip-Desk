import mongoose, { Schema, Document, Model } from 'mongoose';

export type ResourceCategory = 'Notes' | 'Books' | 'Model Question Papers' | 'Lab Manuals';

export interface IRating {
  userId: mongoose.Types.ObjectId;
  vote: 'up' | 'down';
}

export interface IResource extends Document {
  title: string;
  description: string;
  url: string;
  category: ResourceCategory;
  subjectId: mongoose.Types.ObjectId;
  uploaderId: mongoose.Types.ObjectId;
  uploaderModel: 'Admin' | 'User';
  ratings: IRating[];
  upvotes: number;
  downvotes: number;
  isActive: boolean;
  lastChecked: Date | null;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema = new Schema<IRating>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    vote: { type: String, enum: ['up', 'down'], required: true },
  },
  { _id: false }
);

const ResourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    url: { type: String, required: true },
    category: {
      type: String,
      enum: ['Notes', 'Books', 'Model Question Papers', 'Lab Manuals'],
      required: true,
    },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    uploaderId: { type: Schema.Types.ObjectId, required: false },
    uploaderModel: { type: String, enum: ['Admin', 'User'], default: 'Admin' },
    ratings: [RatingSchema],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastChecked: { type: Date, default: null },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

ResourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
ResourceSchema.index({ subjectId: 1, category: 1 });

const Resource: Model<IResource> =
  mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);
export default Resource;
