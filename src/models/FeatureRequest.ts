import mongoose, { Schema, models, model } from 'mongoose';

const ReplySchema = new Schema({
    body: String,
    authorName: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    upvoteCount: { type: Number, default: 0 },
    downvoteCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});

const FeatureRequestSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed'],
            default: 'pending',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        votes: {
            type: Number,
            default: 0,
        },
        replies: [ReplySchema],
    },
    { timestamps: true }
);

const FeatureRequest =
    models.FeatureRequest || model('FeatureRequest', FeatureRequestSchema);

export default FeatureRequest;