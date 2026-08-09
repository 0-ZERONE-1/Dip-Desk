import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name: string;
  hashedPassword?: string;
  image?: string;
  title: 'Student' | 'Alumni';
  institute: string;
  regNumber: string;
  role: 'student' | 'admin';
  isBanned: boolean;
  isProfileComplete: boolean;
  bookmarks: mongoose.Types.ObjectId[];
  resourceRequests: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    hashedPassword: { type: String },
    image: { type: String },
    title: { type: String, enum: ['Student', 'Alumni'], default: 'Student' },
    institute: { type: String, default: '' },
    regNumber: { type: String, default: '' },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    isBanned: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
    resourceRequests: [{ type: Schema.Types.ObjectId, ref: 'ResourceRequest' }],
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
