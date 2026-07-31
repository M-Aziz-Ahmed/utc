import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in .env.local');
}

let cached = global.mongoose;
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null, indexed: false };
}

async function ensureIndexes(db) {
    if (cached.indexed) return;
    try {
        const vehicleCol = db.collection('vehicles');
        await vehicleCol.createIndex({ yard: 1 }, { sparse: true });
        await vehicleCol.createIndex({ physicalIn: 1 }, { sparse: true });
        await vehicleCol.createIndex({ physicalOut: 1 }, { sparse: true });
        await vehicleCol.createIndex({ exportCountry: 1 }, { sparse: true });
        await vehicleCol.createIndex({ manufacturer: 1 }, { sparse: true });
        await vehicleCol.createIndex({ allocation: 1, physicalIn: 1, physicalOut: 1 });
        cached.indexed = true;
    } catch (err) {
        console.error('Index creation failed:', err.message);
    }
}

async function dbConnect() {
    // Already connected and healthy — reuse
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // If a previous promise is in-flight, wait for it
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 15000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        }).catch(err => {
            // Clear promise so next call retries
            cached.promise = null;
            throw err;
        });
    }

    cached.conn = await cached.promise;
    await ensureIndexes(cached.conn.db);
    return cached.conn;
}

export default dbConnect;
