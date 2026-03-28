// ============================================================
// Arena Service — Data Access Layer
// ============================================================
// Fetches from Arena Worker API + static data file.
// The static data file at /api/arena-data is the primary source
// since the Worker API endpoints may not be active yet.
// ============================================================

import type { ArenaData, HealthResponse, ContentPerformance } from './types';

const ARENA_API_URL =
  process.env.NEXT_PUBLIC_ARENA_API_URL || 'https://arena-api.jean-475.workers.dev';

async function fetchWithTimeout(url: string, options?: RequestInit, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch {
    clearTimeout(id);
    throw new Error(`Request to ${url} timed out or failed`);
  }
}

export async function getHealthStatus(): Promise<HealthResponse> {
  const res = await fetchWithTimeout(`${ARENA_API_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function getArenaData(): Promise<ArenaData> {
  // Read from the Next.js API route that serves the static data
  const res = await fetchWithTimeout('/api/arena-data', {
    next: { revalidate: 300 } // revalidate every 5 minutes
  });
  if (!res.ok) throw new Error(`Failed to load arena data: ${res.status}`);
  return res.json();
}

export async function getContentPerformance(): Promise<ContentPerformance | null> {
  try {
    const res = await fetchWithTimeout('/api/content-performance');
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Server-side data loaders (used in server components)
export async function loadArenaDataFromFile(): Promise<ArenaData> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const dataPath = path.resolve('/Users/vivianashford/.openclaw/workspace/levelup-pm/data.json');
  try {
    const raw = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    throw new Error('Failed to read arena data file');
  }
}

export async function loadContentPerformanceFromFile(): Promise<ContentPerformance | null> {
  const fs = await import('fs/promises');
  const path = await import('path');
  const dataPath = path.resolve(
    '/Users/vivianashford/.openclaw/workspace/content-performance.json'
  );
  try {
    const raw = await fs.readFile(dataPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
