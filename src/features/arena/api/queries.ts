import { queryOptions } from '@tanstack/react-query';
import type { ArenaData, ContentPerformance, HealthResponse } from './types';

const ARENA_API_URL =
  process.env.NEXT_PUBLIC_ARENA_API_URL || 'https://arena-api.jean-475.workers.dev';

export const arenaKeys = {
  all: ['arena'] as const,
  data: () => [...arenaKeys.all, 'data'] as const,
  health: () => [...arenaKeys.all, 'health'] as const,
  content: () => [...arenaKeys.all, 'content'] as const
};

export const arenaDataOptions = () =>
  queryOptions({
    queryKey: arenaKeys.data(),
    queryFn: async (): Promise<ArenaData> => {
      const res = await fetch('/api/arena-data');
      if (!res.ok) throw new Error('Failed to load arena data');
      return res.json();
    },
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
    staleTime: 2 * 60 * 1000
  });

export const healthOptions = () =>
  queryOptions({
    queryKey: arenaKeys.health(),
    queryFn: async (): Promise<HealthResponse> => {
      const res = await fetch(`${ARENA_API_URL}/health`);
      if (!res.ok) throw new Error('Health check failed');
      return res.json();
    },
    retry: 1,
    staleTime: 30 * 1000
  });

export const contentPerformanceOptions = () =>
  queryOptions({
    queryKey: arenaKeys.content(),
    queryFn: async (): Promise<ContentPerformance | null> => {
      try {
        const res = await fetch('/api/content-performance');
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000
  });
