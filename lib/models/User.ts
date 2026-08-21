import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  googleId?: string;
  email: string;
  name: string;
  hashedPassword?: string;
  image?: string;
  designation: string;
  title?: string;
  role?: string;
  institute: string;
  regNumber: string;
  isBanned: boolean;
  isProfileComplete: boolean;
  bookmarks: mongoose.Types.ObjectId[];
  resourceRequests: mongoose.Types.ObjectId[];
  upvotedResources: mongoose.Types.ObjectId[];
  downvotedResources: mongoose.Types.ObjectId[];
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
    designation: { type: String, default: 'Student' },
    institute: { type: String, default: '' },
    regNumber: { type: String, default: '' },
    isBanned: { type: Boolean, default: false },
    isProfileComplete: { type: Boolean, default: false },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
    resourceRequests: [{ type: Schema.Types.ObjectId, ref: 'ResourceRequest' }],
    upvotedResources: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
    downvotedResources: [{ type: Schema.Types.ObjectId, ref: 'Resource' }],
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
