import { NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
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
    console.log('Received external feedback:', { title, description, email, timestamp: new Date() });

    return NextResponse.json(
      { message: 'Feedback submitted successfully', success: true },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: corsHeaders }
    );
  }
}