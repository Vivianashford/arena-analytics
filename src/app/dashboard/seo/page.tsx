'use client';
import { useEffect, useState } from 'react';
import { SEOClient } from '@/features/arena/components/seo-client';

const SEO_DATA_URL = 'https://vivianashford.github.io/levelup-pm/seo-data.json';

async function fetchSeoData() {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(SEO_DATA_URL, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return null;
    return res.json();
  } catch {
    clearTimeout(id);
    return null;
  }
}

export default function SEOPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSeoData()
      .then((d) => {
        if (d) setData(d);
        else setError('Could not load SEO data');
      })
      .catch(() => setError('Failed to fetch SEO data'))
      .finally(() => setLoading(false));
  }, []);

  return <SEOClient data={data} loading={loading} error={error} />;
}
