'use client';

import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';

// ── Types ──────────────────────────────────────────────────────────────

interface KeywordRanking {
  keyword: string;
  volume: number;
  rankings: Record<string, number>;
  history: { date: string; position: number | null }[];
}

interface CompetitorSummary {
  keywordsTracked: number;
  avgPosition: number | null;
  topKeywords: { keyword: string; position: number }[];
}

interface CompetitorChange {
  date: string;
  domain: string;
  type: string;
  description: string;
}

interface SeoData {
  lastUpdated: string;
  rankings: {
    lastUpdated: string;
    keywords: KeywordRanking[];
    competitors: Record<string, CompetitorSummary>;
  };
  competitorMonitor: {
    lastUpdated: string;
    changes: CompetitorChange[];
  };
}

interface SEOClientProps {
  data: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
}

const GOLD = '#C9A84C';
const OUR_DOMAIN = 'thearenapartners.com';
const LINE_COLORS = ['#C9A84C', '#6366f1', '#22c55e', '#ef4444', '#f59e0b'];

type SortKey = 'keyword' | 'position' | 'bestCompetitor' | 'volume';
type SortDir = 'asc' | 'desc';

// ── Component ──────────────────────────────────────────────────────────

export function SEOClient({ data, loading, error }: SEOClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>('position');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const seo = data as unknown as SeoData | null;
  const keywords = seo?.rankings?.keywords ?? [];
  const competitors = seo?.rankings?.competitors ?? {};
  const changes = seo?.competitorMonitor?.changes ?? [];

  // ── Computed metrics ──────────────────────────────────────────────

  const metrics = useMemo(() => {
    const positions = keywords
      .map((k) => k.rankings?.[OUR_DOMAIN])
      .filter((p): p is number => p != null);

    const avgPosition = positions.length
      ? Math.round((positions.reduce((a, b) => a + b, 0) / positions.length) * 10) / 10
      : null;

    const top10 = positions.filter((p) => p <= 10).length;

    // Competitor gap: avg of best competitor position vs ours
    let gapScore = 0;
    let gapCount = 0;
    for (const kw of keywords) {
      const ourPos = kw.rankings?.[OUR_DOMAIN];
      const competitorPositions = Object.entries(kw.rankings || {})
        .filter(([d]) => d !== OUR_DOMAIN)
        .map(([, p]) => p)
        .filter((p): p is number => p != null);
      if (ourPos && competitorPositions.length > 0) {
        const bestComp = Math.min(...competitorPositions);
        gapScore += ourPos - bestComp;
        gapCount++;
      }
    }

    // History trend: compare last position to first for avg
    let trendDirection: 'up' | 'down' | 'flat' = 'flat';
    if (keywords.length > 0) {
      let improved = 0;
      let declined = 0;
      for (const kw of keywords) {
        const hist = kw.history?.filter((h) => h.position != null) ?? [];
        if (hist.length >= 2) {
          const first = hist[0].position!;
          const last = hist[hist.length - 1].position!;
          if (last < first) improved++;
          else if (last > first) declined++;
        }
      }
      if (improved > declined) trendDirection = 'up';
      else if (declined > improved) trendDirection = 'down';
    }

    return {
      avgPosition,
      keywordsTracked: keywords.length,
      top10,
      gapScore: gapCount > 0 ? Math.round(gapScore / gapCount) : null,
      trendDirection
    };
  }, [keywords]);

  // ── Sorted keywords table ────────────────────────────────────────

  const sortedKeywords = useMemo(() => {
    const copy = [...keywords];
    copy.sort((a, b) => {
      let aVal: number | string = 0;
      let bVal: number | string = 0;

      if (sortKey === 'keyword') {
        aVal = a.keyword;
        bVal = b.keyword;
      } else if (sortKey === 'position') {
        aVal = a.rankings?.[OUR_DOMAIN] ?? 999;
        bVal = b.rankings?.[OUR_DOMAIN] ?? 999;
      } else if (sortKey === 'bestCompetitor') {
        const aComps = Object.entries(a.rankings || {})
          .filter(([d]) => d !== OUR_DOMAIN)
          .map(([, p]) => p);
        const bComps = Object.entries(b.rankings || {})
          .filter(([d]) => d !== OUR_DOMAIN)
          .map(([, p]) => p);
        aVal = aComps.length ? Math.min(...aComps) : 999;
        bVal = bComps.length ? Math.min(...bComps) : 999;
      } else if (sortKey === 'volume') {
        aVal = a.volume ?? 0;
        bVal = b.volume ?? 0;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return copy;
  }, [keywords, sortKey, sortDir]);

  // ── Competitor bar chart data ────────────────────────────────────

  const competitorChartData = useMemo(() => {
    const entries: { name: string; avgPosition: number; fill: string }[] = [];

    // Our avg
    if (metrics.avgPosition != null) {
      entries.push({
        name: 'Arena',
        avgPosition: metrics.avgPosition,
        fill: GOLD
      });
    }

    for (const [domain, info] of Object.entries(competitors)) {
      if (info.avgPosition != null) {
        entries.push({
          name: domain.replace('.com', ''),
          avgPosition: info.avgPosition,
          fill: '#6366f1'
        });
      }
    }

    entries.sort((a, b) => a.avgPosition - b.avgPosition);
    return entries;
  }, [competitors, metrics.avgPosition]);

  // ── History line chart data ──────────────────────────────────────

  const historyChartData = useMemo(() => {
    // Get top 5 keywords by best position
    const ranked = keywords
      .filter((k) => k.history && k.history.length > 0)
      .sort((a, b) => {
        const aPos = a.rankings?.[OUR_DOMAIN] ?? 999;
        const bPos = b.rankings?.[OUR_DOMAIN] ?? 999;
        return aPos - bPos;
      })
      .slice(0, 5);

    if (ranked.length === 0) return { data: [], keys: [] };

    // Collect all unique dates
    const allDates = new Set<string>();
    for (const kw of ranked) {
      for (const h of kw.history) {
        allDates.add(h.date);
      }
    }

    const sortedDates = Array.from(allDates).sort();
    const data = sortedDates.map((date) => {
      const point: Record<string, unknown> = { date };
      for (const kw of ranked) {
        const entry = kw.history.find((h) => h.date === date);
        point[kw.keyword] = entry?.position ?? null;
      }
      return point;
    });

    return {
      data,
      keys: ranked.map((k) => k.keyword)
    };
  }, [keywords]);

  // ── Helpers ──────────────────────────────────────────────────────

  function positionBadge(pos: number | null | undefined) {
    if (pos == null)
      return (
        <Badge variant='outline' className='text-muted-foreground'>
          N/F
        </Badge>
      );
    if (pos <= 10)
      return <Badge className='bg-green-600/20 text-green-400 hover:bg-green-600/30'>#{pos}</Badge>;
    if (pos <= 30)
      return (
        <Badge className='bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'>#{pos}</Badge>
      );
    return <Badge className='bg-red-600/20 text-red-400 hover:bg-red-600/30'>#{pos}</Badge>;
  }

  function trendArrow(kw: KeywordRanking) {
    const hist = kw.history?.filter((h) => h.position != null) ?? [];
    if (hist.length < 2)
      return <span className='text-muted-foreground text-xs'>—</span>;
    const prev = hist[hist.length - 2].position!;
    const curr = hist[hist.length - 1].position!;
    if (curr < prev)
      return <span className='text-sm text-green-400'>▲ {prev - curr}</span>;
    if (curr > prev)
      return <span className='text-sm text-red-400'>▼ {curr - prev}</span>;
    return <span className='text-muted-foreground text-xs'>—</span>;
  }

  function bestCompetitor(kw: KeywordRanking) {
    const comps = Object.entries(kw.rankings || {}).filter(([d]) => d !== OUR_DOMAIN);
    if (comps.length === 0)
      return { domain: '—', position: null };
    comps.sort((a, b) => a[1] - b[1]);
    return { domain: comps[0][0], position: comps[0][1] };
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return '';
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }

  function changeIcon(type: string) {
    switch (type) {
      case 'new_blog_post':
        return '📝';
      case 'title_change':
        return '🏷️';
      case 'meta_change':
        return '📋';
      case 'pages_added':
        return '📄';
      case 'schema_change':
        return '🔧';
      case 'initial_scan':
        return '🔍';
      default:
        return '🔔';
    }
  }

  // ── Render ────────────────────────────────────────────────────────

  const noData = !seo || keywords.length === 0;

  return (
    <PageContainer scrollable pageTitle='SEO Rankings' pageDescription='Keyword tracking & competitor intelligence for The Arena Partners'>
      {loading ? (
        <div className='flex flex-1 animate-pulse flex-col gap-4'>
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='bg-muted h-28 rounded-lg' />
            ))}
          </div>
          <div className='bg-muted h-64 rounded-lg' />
        </div>
      ) : error && noData ? (
        <div className='text-muted-foreground flex flex-1 items-center justify-center text-lg'>
          <div className='text-center'>
            <p className='mb-2 text-2xl'>📊</p>
            <p>No data yet</p>
            <p className='mt-1 text-sm'>Run the rank tracker to seed initial data</p>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-4'>
          {/* ── Metric Cards ─────────────────────────────────── */}
          <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Average Position</CardDescription>
                <CardTitle className='text-2xl'>
                  {metrics.avgPosition != null ? (
                    <span className='flex items-center gap-2'>
                      #{metrics.avgPosition}
                      {metrics.trendDirection === 'up' && (
                        <span className='text-sm text-green-400'>▲</span>
                      )}
                      {metrics.trendDirection === 'down' && (
                        <span className='text-sm text-red-400'>▼</span>
                      )}
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Keywords Tracked</CardDescription>
                <CardTitle className='text-2xl'>{metrics.keywordsTracked}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Top 10 Rankings</CardDescription>
                <CardTitle className='text-2xl'>
                  <span style={{ color: metrics.top10 > 0 ? '#22c55e' : undefined }}>
                    {metrics.top10}
                  </span>
                </CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardDescription>Competitor Gap</CardDescription>
                <CardTitle className='text-2xl'>
                  {metrics.gapScore != null ? (
                    <span className={metrics.gapScore > 0 ? 'text-red-400' : 'text-green-400'}>
                      {metrics.gapScore > 0 ? '+' : ''}
                      {metrics.gapScore}
                    </span>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='pb-3'>
                <p className='text-muted-foreground text-xs'>
                  Avg positions behind best competitor
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Keyword Rankings Table ──────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Keyword Rankings</CardTitle>
              <CardDescription>
                {seo?.rankings?.lastUpdated
                  ? `Updated ${new Date(seo.rankings.lastUpdated).toLocaleDateString()}`
                  : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {noData ? (
                <p className='text-muted-foreground py-8 text-center'>No data yet</p>
              ) : (
                <div className='-mx-4 overflow-x-auto px-4'>
                  <table className='w-full text-sm'>
                    <thead>
                      <tr className='text-muted-foreground border-b text-left'>
                        <th
                          className='cursor-pointer pb-3 pr-4'
                          onClick={() => handleSort('keyword')}
                        >
                          Keyword{sortIndicator('keyword')}
                        </th>
                        <th
                          className='cursor-pointer pb-3 pr-4 text-center'
                          onClick={() => handleSort('position')}
                        >
                          Our Rank{sortIndicator('position')}
                        </th>
                        <th
                          className='cursor-pointer pb-3 pr-4 text-center'
                          onClick={() => handleSort('bestCompetitor')}
                        >
                          Best Competitor{sortIndicator('bestCompetitor')}
                        </th>
                        <th
                          className='cursor-pointer pb-3 pr-4 text-right'
                          onClick={() => handleSort('volume')}
                        >
                          Volume{sortIndicator('volume')}
                        </th>
                        <th className='pb-3 text-center'>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedKeywords.map((kw) => {
                        const best = bestCompetitor(kw);
                        return (
                          <tr key={kw.keyword} className='border-b border-white/5'>
                            <td className='max-w-[200px] truncate py-3 pr-4 font-medium'>
                              {kw.keyword}
                            </td>
                            <td className='py-3 pr-4 text-center'>
                              {positionBadge(kw.rankings?.[OUR_DOMAIN])}
                            </td>
                            <td className='py-3 pr-4 text-center'>
                              <div className='flex flex-col items-center gap-0.5'>
                                {positionBadge(best.position)}
                                <span className='text-muted-foreground text-[10px]'>
                                  {best.domain}
                                </span>
                              </div>
                            </td>
                            <td className='text-muted-foreground py-3 pr-4 text-right'>
                              {kw.volume?.toLocaleString()}
                            </td>
                            <td className='py-3 text-center'>{trendArrow(kw)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ── Charts Row ─────────────────────────────────── */}
          <div className='grid gap-4 md:grid-cols-2'>
            {/* Competitor Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Competitor Comparison</CardTitle>
                <CardDescription>Average position (lower is better)</CardDescription>
              </CardHeader>
              <CardContent>
                {competitorChartData.length === 0 ? (
                  <p className='text-muted-foreground py-8 text-center'>No data yet</p>
                ) : (
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={competitorChartData} layout='vertical'>
                      <CartesianGrid strokeDasharray='3 3' stroke='#333' />
                      <XAxis type='number' domain={[0, 'auto']} stroke='#888' fontSize={12} />
                      <YAxis
                        dataKey='name'
                        type='category'
                        stroke='#888'
                        fontSize={12}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid #333',
                          borderRadius: 8
                        }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`#${value}`, 'Avg Position']}
                      />
                      <Bar dataKey='avgPosition' radius={[0, 4, 4, 0]}>
                        {competitorChartData.map((entry, idx) => (
                          <rect key={idx} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Ranking History */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking History</CardTitle>
                <CardDescription>Position over time (top 5 keywords)</CardDescription>
              </CardHeader>
              <CardContent>
                {historyChartData.data.length === 0 ? (
                  <p className='text-muted-foreground py-8 text-center'>
                    History will appear after multiple runs
                  </p>
                ) : (
                  <ResponsiveContainer width='100%' height={300}>
                    <LineChart data={historyChartData.data}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#333' />
                      <XAxis dataKey='date' stroke='#888' fontSize={11} />
                      <YAxis
                        reversed
                        domain={[1, 'auto']}
                        stroke='#888'
                        fontSize={12}
                        label={{
                          value: 'Position',
                          angle: -90,
                          position: 'insideLeft',
                          style: { fill: '#888' }
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid #333',
                          borderRadius: 8,
                          fontSize: 12
                        }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: unknown) =>
                          value != null ? [`#${value}`, ''] : ['N/F', '']
                        }
                      />
                      <Legend
                        wrapperStyle={{ fontSize: 10 }}
                        formatter={(value: string) =>
                          value.length > 25 ? value.slice(0, 25) + '...' : value
                        }
                      />
                      {historyChartData.keys.map((key, idx) => (
                        <Line
                          key={key}
                          type='monotone'
                          dataKey={key}
                          stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Competitor Activity Feed ────────────────────── */}
          <Card>
            <CardHeader>
              <CardTitle>Competitor Activity</CardTitle>
              <CardDescription>Recent changes detected on competitor sites</CardDescription>
            </CardHeader>
            <CardContent>
              {changes.length === 0 ? (
                <p className='text-muted-foreground py-8 text-center'>
                  No competitor changes detected yet
                </p>
              ) : (
                <div className='space-y-3'>
                  {changes.slice(0, 20).map((change, idx) => (
                    <div
                      key={idx}
                      className='flex items-start gap-3 border-b border-white/5 pb-3 last:border-0'
                    >
                      <span className='text-lg'>{changeIcon(change.type)}</span>
                      <div className='min-w-0 flex-1'>
                        <p className='text-sm'>{change.description}</p>
                        <div className='text-muted-foreground mt-1 flex items-center gap-2 text-xs'>
                          <span>{change.domain}</span>
                          <span>·</span>
                          <span>
                            {change.date
                              ? new Date(change.date).toLocaleDateString()
                              : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
