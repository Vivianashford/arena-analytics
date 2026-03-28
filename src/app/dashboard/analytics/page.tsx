'use client';
import { useEffect, useState } from 'react';
import { AnalyticsClient } from '@/features/arena/components/analytics-client';
import { getArenaData, getContentPerformance } from '@/features/arena/api/service';
import type { ArenaData, ContentPerformance } from '@/features/arena/api/types';

export default function AnalyticsPage() {
  const [data, setData] = useState<ArenaData | null>(null);
  const [content, setContent] = useState<ContentPerformance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getArenaData().catch(() => null), getContentPerformance().catch(() => null)]).then(
      ([d, c]) => {
        if (d) setData(d);
        else setError('Failed to load analytics data');
        if (c) setContent(c);
      }
    );
  }, []);

  return <AnalyticsClient analytics={data?.analytics ?? null} content={content} error={error} />;
}
