import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    if (cached!.conn) {
        console.log('Using cached MongoDB connection');
        return cached!.conn;
    }

    if (!cached!.promise) {
        console.log('Connecting to MongoDB...');
        cached!.promise = mongoose.connect(MONGODB_URI, {
            dbName: 'featurehub',
        }).then((mongoose) => {
            console.log('MongoDB connected successfully');
            return mongoose;
        }).catch((err) => {
            console.error('MongoDB connection error:', err);
            throw err;
        });
    }

    cached!.conn = await cached!.promise;
    return cached!.conn;
}