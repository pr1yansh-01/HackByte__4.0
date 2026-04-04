import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import FeatureRequest from '@/models/FeatureRequest';

export async function GET() {
  try {
    const conn = await connectDB();
    const count = await FeatureRequest.countDocuments();
    const latest = await FeatureRequest.findOne().sort({ createdAt: -1 });

    return NextResponse.json({
      status: 'success',
      message: 'Database is connected',
      total_records: count,
      latest_record: latest,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to connect to database',
      error: error.message,
    }, { status: 500 });
  }
}
