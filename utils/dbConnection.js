import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://azizahmed:jchfksjfhskjfshkfh@app.ipk7p3c.mongodb.net/?appName=app'

// Log the connection string (without password) for debugging
console.log('🔍 Attempting to connect to MongoDB...');
console.log('🔍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully');
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error.message);
      console.error('❌ Error code:', error.code);
      cached.promise = null; // Reset promise on error
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
