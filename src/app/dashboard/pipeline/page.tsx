'use client';
import { useEffect, useState } from 'react';
import { PipelineClient } from '@/features/arena/components/pipeline-client';
import { getArenaData } from '@/features/arena/api/service';
import type { ArenaData } from '@/features/arena/api/types';

export default function PipelinePage() {
  const [data, setData] = useState<ArenaData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArenaData()
      .then((d) => setData(d))
      .catch((e) => setError(e.message));
  }, []);

  return <PipelineClient initialData={data} error={error} />;
}
