import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://saporikitchens_db_user:8IeVakI0LgjcUnrJ@cluster0.yvurarx.mongodb.net/sapori_cafe?retryWrites=true&w=majority';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
global.mongooseCache = cached;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    console.warn('MONGODB_URI is not defined');
    return null;
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('✅ Connected to MongoDB Atlas (Sapori Kitchens - sapori_cafe)');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('❌ Failed to connect to MongoDB Atlas:', err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export async function getDatabaseStatus() {
  try {
    const conn = await connectToDatabase();
    if (conn && conn.connection.readyState === 1) {
      return {
        connected: true,
        database: conn.connection.name || 'sapori_cafe',
        host: conn.connection.host,
        status: 'Connected to MongoDB Atlas',
      };
    }
    return {
      connected: false,
      status: 'Disconnected',
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message,
      status: 'Connection Error',
    };
  }
}
