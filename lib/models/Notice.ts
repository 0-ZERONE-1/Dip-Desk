import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotice extends Document {
  title: string;
  content: string;
  badge: 'Important' | 'Exam' | 'Update' | 'Urgent' | 'General';
  isPinned: boolean;
  isActive: boolean;
  link?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    badge: {
      type: String,
      enum: ['Important', 'Exam', 'Update', 'Urgent', 'General'],
      default: 'Important',
    },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    link: { type: String },
  },
  { timestamps: true }
);

const Notice: Model<INotice> =
  mongoose.models.Notice || mongoose.model<INotice>('Notice', NoticeSchema);

export default Notice;
