import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('❌ MONGODB_URI is not defined in environment variables. Please add it to .env.local');
}

// Log the connection string (without password)
console.log('🔍 Attempting to connect to MongoDB...');
console.log('🔍 URI:', MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };

    // Clear cache whenever connection drops so next call reconnects cleanly
    mongoose.connection.on('disconnected', () => {
        cached.conn = null;
        cached.promise = null;
    });
    mongoose.connection.on('error', () => {
        cached.conn = null;
        cached.promise = null;
    });
}

async function dbConnect() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) throw new Error('MONGODB_URI is not set.');

    // Already connected
    if (mongoose.connection.readyState === 1 && cached.conn) {
        return cached.conn;
    }

    // Force clean state if not connecting
    if (mongoose.connection.readyState !== 2) {
        cached.conn = null;
        cached.promise = null;
        if (mongoose.connection.readyState !== 0) {
            try { await mongoose.disconnect(); } catch (_) {}
        }
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 1,
            heartbeatFrequencyMS: 5000,
        }).then(m => m).catch(err => {
            console.error('MongoDB connection error:', err.message);
            cached.conn = null;
            cached.promise = null;
            throw err;
        });
    }

    cached.conn = await cached.promise;
  cached = global.mongoose = { conn: null, promise: null };
}

export default dbConnect;
