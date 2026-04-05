import mongoose from 'mongoose';
import FeatureRequest from './src/models/FeatureRequest';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

async function check() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not defined in .env');
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGODB_URI, { dbName: 'featurehub' });
        console.log('--- DATABASE CONNECTION: SUCCESS ---');
        
        const count = await FeatureRequest.countDocuments();
        console.log(`Total feature requests: ${count}`);
        
        const latest = await FeatureRequest.findOne().sort({ createdAt: -1 });
        if (latest) {
            console.log('--- LATEST FEATURE REQUEST ---');
            console.log(`Title: ${latest.title}`);
            console.log(`Description: ${latest.description}`);
            console.log(`Email: ${latest.email}`);
            console.log(`Created At: ${latest.createdAt}`);
        } else {
            console.log('No feature requests found in the database.');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('--- DATABASE CONNECTION: FAILED ---');
        console.error(error);
    }
}

check();
