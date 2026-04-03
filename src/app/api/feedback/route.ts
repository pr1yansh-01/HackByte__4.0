import { NextResponse } from 'next/server';

// CORS headers configuration to allow any website to send requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, email } = body;

    // Validate the incoming data
    if (!title || !description || !email) {
      return NextResponse.json(
        { error: 'Missing required fields (title, description, email)' },
        { status: 400, headers: corsHeaders }
      );
    }

    // TODO: Connect to a database (e.g., MongoDB, Supabase) and save the feedback here.
    // For now, we simulate a successful database insert by logging it.
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
