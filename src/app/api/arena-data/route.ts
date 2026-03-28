import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.resolve('/Users/vivianashford/.openclaw/workspace/levelup-pm/data.json');

export async function GET() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60'
      }
    });
  } catch {
    return NextResponse.json({ error: 'Failed to read arena data' }, { status: 500 });
  }
}
