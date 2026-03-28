import { loadArenaDataFromFile } from '@/features/arena/api/service';
import { PipelineClient } from '@/features/arena/components/pipeline-client';

export const metadata = {
  title: 'Arena Analytics : Pipeline'
};

export default async function PipelinePage() {
  let data = null;
  let error = null;

  try {
    data = await loadArenaDataFromFile();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load data';
  }

  return <PipelineClient initialData={data} error={error} />;
}
