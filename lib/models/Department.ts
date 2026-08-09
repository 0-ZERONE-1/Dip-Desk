import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '📚' },
    color: { type: String, default: '#6366f1' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Department: Model<IDepartment> =
  mongoose.models.Department || mongoose.model<IDepartment>('Department', DepartmentSchema);
export default Department;
