import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubject extends Document {
  name: string;
  slug: string;
  semesterNumber: number;
  departmentId: mongoose.Types.ObjectId;
  description: string;
  isActive: boolean;
  createdAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true },
    semesterNumber: { type: Number, required: true, min: 1, max: 6 },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound unique index: slug must be unique per department per semester
SubjectSchema.index({ slug: 1, departmentId: 1, semesterNumber: 1 }, { unique: true });

const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
export default Subject;
