import mongoose from 'mongoose';
import { seedInitialData } from './seedData';

const MONGODB_URI = process.env.MONGODB_URI as string;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

let cached: MongooseCache = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return mongoose;
  }

  if (!MONGODB_URI || MONGODB_URI.includes('YOUR_USERNAME')) {
    throw new Error('MONGODB_URI is not configured in environment variables');
  }

  // ZERONE - Re-initialize MongoDB connection promise if disconnected or state is 0
  if (mongoose.connection.readyState === 0 || !cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      maxPoolSize: 2,         // Keeps connection pool very small per serverless function
      minPoolSize: 0,         // Don't keep connections open unnecessarily
      maxIdleTimeMS: 10000,   // Drop connections if idle for 10 seconds to clean up zombie connections
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (m) => {
      await seedInitialData();
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
