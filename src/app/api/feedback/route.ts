import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FeatureRequest from '@/models/FeatureRequest';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    await connectDB();
    const feedbacks = await FeatureRequest.find().sort({ createdAt: -1 });
    return NextResponse.json(feedbacks, { headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, email } = body;

    if (!title || !description || !email) {
      return NextResponse.json(
        { error: 'Missing required fields (title, description, email)' },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();

    const newFeature = await FeatureRequest.create({
      title,
      description,
      email,
      status: 'pending',
      votes: 0,
    });

    return NextResponse.json(
      {
        message: 'Feedback submitted successfully',
        success: true,
        data: newFeature,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}