// ============================================================
// Arena Service — Data Access Layer
// ============================================================
// Fetches from GitHub Pages hosted data.json (updated every 5 min).
// Static export compatible - client-side fetch only.
// ============================================================

import type { ArenaData, HealthResponse, ContentPerformance } from './types';

const ARENA_API_URL =
  process.env.NEXT_PUBLIC_ARENA_API_URL || 'https://arena-api.jean-475.workers.dev';

export const DATA_URL = 'https://vivianashford.github.io/levelup-pm/data.json';
const CONTENT_PERF_URL = 'https://vivianashford.github.io/levelup-pm/content-performance.json';

async function fetchWithTimeout(url: string, options?: RequestInit, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    console.error(`[Arena] Fetch failed for ${url}:`, err);
    throw new Error(`Request to ${url} timed out or failed`);
  }
}

export async function getHealthStatus(): Promise<HealthResponse> {
  const res = await fetchWithTimeout(`${ARENA_API_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function getArenaData(): Promise<ArenaData> {
  try {
    console.log('[Arena] Fetching data from', DATA_URL);
    const res = await fetchWithTimeout(DATA_URL);
    if (!res.ok) {
      console.error(`[Arena] HTTP ${res.status} from ${DATA_URL}`);
      throw new Error(`Failed to load arena data: ${res.status}`);
    }
    const data = await res.json();
    console.log('[Arena] Data loaded successfully, updated:', data.updated_local);
    return data as ArenaData;
  } catch (err) {
    console.error('[Arena] getArenaData error:', err);
    throw err;
  }
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
