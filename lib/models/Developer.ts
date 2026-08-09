import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDeveloper extends Document {
  name: string;
  role: string;
  bio?: string;
  imageUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  emailUrl?: string;
  portfolioUrl?: string;
  twitterUrl?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DeveloperSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    bio: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    emailUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Developer: Model<IDeveloper> =
  mongoose.models.Developer || mongoose.model<IDeveloper>('Developer', DeveloperSchema);

export default Developer;
