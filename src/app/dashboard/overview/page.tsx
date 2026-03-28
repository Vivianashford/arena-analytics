'use client';
import { useEffect, useState } from 'react';
import { OverviewClient } from '@/features/arena/components/overview-client';
import { getArenaData } from '@/features/arena/api/service';
import type { ArenaData } from '@/features/arena/api/types';

export default function OverviewPage() {
  const [data, setData] = useState<ArenaData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArenaData()
      .then((d) => setData(d))
      .catch((e) => setError(e.message));
  }, []);

  return <OverviewClient initialData={data} error={error} />;
}
