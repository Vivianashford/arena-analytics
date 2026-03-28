// ============================================================
// Arena Service — Data Access Layer
// ============================================================
// Fetches from Arena Worker API + GitHub Pages hosted data.
// Static export compatible - no server-side file reads.
// ============================================================

import type { ArenaData, HealthResponse, ContentPerformance } from './types';

const ARENA_API_URL =
  process.env.NEXT_PUBLIC_ARENA_API_URL || 'https://arena-api.jean-475.workers.dev';

const DATA_URL = 'https://vivianashford.github.io/levelup-pm/data.json';
const CONTENT_PERF_URL = 'https://vivianashford.github.io/levelup-pm/content-performance.json';

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
  // Fetch from GitHub Pages data.json (updated every 5 min by stats engine)
  const res = await fetchWithTimeout(DATA_URL);
  if (!res.ok) throw new Error(`Failed to load arena data: ${res.status}`);
  return res.json() as Promise<ArenaData>;
}

export async function getContentPerformance(): Promise<ContentPerformance | null> {
  try {
    const res = await fetchWithTimeout(CONTENT_PERF_URL);
    if (!res.ok) return null;
    return res.json() as Promise<ContentPerformance>;
  } catch {
    return null;
  }
}
