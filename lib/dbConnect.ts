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
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 1500,
    };

    cached.promise = (async () => {
      // 2 second timeout — only attempted once; store.ts caches the result
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('DB Connection Timeout')), 2000)
      );

      const connectPromise = (async () => {
        if (MONGODB_URI && !MONGODB_URI.includes('YOUR_USERNAME')) {
          const conn = await mongoose.connect(MONGODB_URI, opts);
          await seedInitialData();
          return conn;
        }
        throw new Error('No MONGODB_URI configured');
      })();

      return Promise.race([connectPromise, timeoutPromise]);
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
