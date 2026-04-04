import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { normalizeFeatureKey } from '@/lib/featureVoteKey';

export const runtime = 'nodejs';

const DATA_PATH = path.join(process.cwd(), 'data', 'feature-votes.json');

type VoteEntry = { total: number; sessions: Record<string, boolean> };
type Store = Record<string, VoteEntry>;

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw) as Store;
  } catch {
    return {};
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
  await fs.writeFile(DATA_PATH, JSON.stringify(store, null, 2), 'utf8');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-id',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/** GET: all vote totals; optional ?sessionId= for per-key myVotes */
export async function GET(request: NextRequest) {
  const store = await readStore();
  const totals: Record<string, number> = {};
  for (const [k, v] of Object.entries(store)) {
    totals[k] = v.total;
  }

  const sessionId = request.nextUrl.searchParams.get('sessionId')?.trim();
  let myVotes: Record<string, boolean> | undefined;
  if (sessionId) {
    myVotes = {};
    for (const [k, v] of Object.entries(store)) {
      myVotes[k] = !!v.sessions[sessionId];
    }
  }

  return NextResponse.json({ totals, myVotes }, { headers: corsHeaders });
}

/** POST: toggle vote for key (body.key); requires x-session-id */
export async function POST(request: NextRequest) {
  let body: { key?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400, headers: corsHeaders }
    );
  }

  const rawKey = body.key;
  if (typeof rawKey !== 'string' || !rawKey.trim()) {
    return NextResponse.json(
      { error: 'key required' },
      { status: 400, headers: corsHeaders }
    );
  }

  const key = normalizeFeatureKey(rawKey);
  let sessionId = request.headers.get('x-session-id');
  if (!sessionId?.trim()) {
    return NextResponse.json(
      { error: 'x-session-id header required' },
      { status: 400, headers: corsHeaders }
    );
  }
  sessionId = sessionId.trim().slice(0, 128);

  const store = await readStore();
  const entry: VoteEntry = store[key] ?? { total: 0, sessions: {} };

  if (entry.sessions[sessionId]) {
    delete entry.sessions[sessionId];
    entry.total = Math.max(0, entry.total - 1);
  } else {
    entry.sessions[sessionId] = true;
    entry.total += 1;
  }

  store[key] = entry;
  await writeStore(store);

  return NextResponse.json(
    {
      key,
      total: entry.total,
      userVoted: !!entry.sessions[sessionId],
    },
    { headers: corsHeaders }
  );
}
