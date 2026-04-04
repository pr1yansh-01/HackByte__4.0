import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

const FeatureRequestSchema = new mongoose.Schema({
    title: String,
    description: String,
    email: String,
    createdAt: Date,
});

const FeatureRequest = mongoose.models.FeatureRequest || mongoose.model('FeatureRequest', FeatureRequestSchema);

async function check() {
    if (!MONGODB_URI) {
        console.error('MONGODB_URI is not defined');
        process.exit(1);
    }
    try {
        await mongoose.connect(MONGODB_URI, { dbName: 'featurehub' });
        console.log('--- DATABASE CONNECTION: SUCCESS ---');
        
        const latest = await FeatureRequest.findOne().sort({ createdAt: -1 });
        if (latest) {
            console.log('--- LATEST FEATURE REQUEST ---');
            console.log(JSON.stringify(latest, null, 2));
        } else {
            console.log('No feature requests found.');
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('--- DATABASE CONNECTION: FAILED ---');
        console.error(error);
    }
}

check();
