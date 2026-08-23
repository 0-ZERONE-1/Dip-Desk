import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IStat extends Document {
  key: string;
  overrideResources?: number | null;
  overrideSubjects?: number | null;
  overrideStudents?: number | null;
  overrideVisitors?: number | null;
  customLogoUrl?: string;
  totalVisitors: number;
  updatedAt: Date;
}

const StatSchema = new Schema<IStat>(
  {
    key: { type: String, required: true, unique: true, default: 'hero_stats' },
    overrideResources: { type: Number, default: null },
    overrideSubjects: { type: Number, default: null },
    overrideStudents: { type: Number, default: null },
    overrideVisitors: { type: Number, default: null },
    customLogoUrl: { type: String, default: '' },
    totalVisitors: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Stat: Model<IStat> = mongoose.models.Stat || mongoose.model<IStat>('Stat', StatSchema);
export default Stat;
