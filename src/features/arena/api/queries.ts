import { queryOptions } from '@tanstack/react-query';
import type { ArenaData, ContentPerformance, HealthResponse } from './types';
import { getArenaData, getContentPerformance, getHealthStatus } from './service';

export const arenaKeys = {
  all: ['arena'] as const,
  data: () => [...arenaKeys.all, 'data'] as const,
  health: () => [...arenaKeys.all, 'health'] as const,
  content: () => [...arenaKeys.all, 'content'] as const
};

export const arenaDataOptions = () =>
  queryOptions({
    queryKey: arenaKeys.data(),
    queryFn: async (): Promise<ArenaData> => getArenaData(),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000
  });

export const healthOptions = () =>
  queryOptions({
    queryKey: arenaKeys.health(),
    queryFn: async (): Promise<HealthResponse> => getHealthStatus(),
    retry: 1,
    staleTime: 30 * 1000
  });

export const contentPerformanceOptions = () =>
  queryOptions({
    queryKey: arenaKeys.content(),
    queryFn: async (): Promise<ContentPerformance | null> => getContentPerformance(),
    staleTime: 5 * 60 * 1000
  });
