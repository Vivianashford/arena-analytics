import { loadArenaDataFromFile } from '@/features/arena/api/service';
import { OverviewClient } from '@/features/arena/components/overview-client';

export default async function OverviewPage() {
  let data = null;
  let error = null;

  try {
    data = await loadArenaDataFromFile();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load data';
  }

  return <OverviewClient initialData={data} error={error} />;
}
