import {
  loadArenaDataFromFile,
  loadContentPerformanceFromFile
} from '@/features/arena/api/service';
import { AnalyticsClient } from '@/features/arena/components/analytics-client';

export const metadata = {
  title: 'Arena Analytics : Website Analytics'
};

export default async function AnalyticsPage() {
  let analytics = null;
  let content = null;
  let error = null;

  try {
    const data = await loadArenaDataFromFile();
    analytics = data.analytics || null;
    content = await loadContentPerformanceFromFile();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load analytics';
  }

  return <AnalyticsClient analytics={analytics} content={content} error={error} />;
}
