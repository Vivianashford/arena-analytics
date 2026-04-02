'use client';

import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import type { AnalyticsData, ContentPerformance } from '@/features/arena/api/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

interface AnalyticsClientProps {
  analytics: AnalyticsData | null;
  content: ContentPerformance | null;
  error: string | null;
}

const COLORS = ['#C9A84C', '#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

function TrafficOverview({ analytics }: { analytics: AnalyticsData }) {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
      <Card className={`${(analytics.realtime_users ?? 0) > 0 ? 'border-green-500/30 bg-green-500/5' : 'border-zinc-700/30'}`}>
        <CardHeader>
          <CardDescription className={(analytics.realtime_users ?? 0) > 0 ? 'text-green-400' : 'text-muted-foreground'}>Realtime</CardDescription>
          <CardTitle className={`text-2xl tabular-nums ${(analytics.realtime_users ?? 0) > 0 ? 'text-green-400 animate-pulse' : 'text-muted-foreground'}`}>{analytics.realtime_users ?? 0}</CardTitle>
        </CardHeader>
        <CardFooter>
          {(analytics.realtime_users ?? 0) > 0 ? (
            <span className='flex items-center gap-1.5 text-xs text-green-400'><span className='inline-block h-2 w-2 animate-pulse rounded-full bg-green-400'></span>Live on site</span>
          ) : (
            <span className='text-muted-foreground text-xs'>No active users</span>
          )}
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Sessions (Week)</CardDescription>
          <CardTitle className='text-2xl tabular-nums'>{analytics.week?.sessions ?? '—'}</CardTitle>
        </CardHeader>
        <CardFooter>
          <span className='text-muted-foreground text-xs'>
            {analytics.month?.sessions ?? '—'} this month
          </span>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Users (Week)</CardDescription>
          <CardTitle className='text-2xl tabular-nums'>{analytics.week?.users ?? '—'}</CardTitle>
        </CardHeader>
        <CardFooter>
          <span className='text-muted-foreground text-xs'>
            {analytics.month?.users ?? '—'} this month
          </span>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Pageviews (Week)</CardDescription>
          <CardTitle className='text-2xl tabular-nums'>
            {analytics.week?.pageviews ?? '—'}
          </CardTitle>
        </CardHeader>
        <CardFooter>
          <span className='text-muted-foreground text-xs'>
            {analytics.month?.pageviews ?? '—'} this month
          </span>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>Bounce Rate</CardDescription>
          <CardTitle className='text-2xl tabular-nums'>
            {analytics.bounce_rate != null ? `${analytics.bounce_rate}%` : '—'}
          </CardTitle>
        </CardHeader>
        <CardFooter>
          <span className='text-muted-foreground text-xs'>
            Avg duration {analytics.week?.avg_duration ? `${Math.round(analytics.week.avg_duration)}s` : '—'}
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}

function DailyTrafficChart({ analytics }: { analytics: AnalyticsData }) {
  const daily = analytics.daily || [];
  if (daily.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Daily Traffic</CardDescription>
        <CardTitle className='text-lg'>Sessions & Users Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={daily}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis
              dataKey='date'
              stroke='hsl(var(--muted-foreground))'
              fontSize={11}
              tickFormatter={(val) => {
                const d = new Date(val);
                return `${d.getMonth() + 1}/${d.getDate()}`;
              }}
            />
            <YAxis stroke='hsl(var(--muted-foreground))' fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Area
              type='monotone'
              dataKey='sessions'
              stroke='#C9A84C'
              fill='#C9A84C'
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type='monotone'
              dataKey='users'
              stroke='#6366f1'
              fill='#6366f1'
              fillOpacity={0.08}
              strokeWidth={2}
            />
            <Area
              type='monotone'
              dataKey='pageviews'
              stroke='#22c55e'
              fill='#22c55e'
              fillOpacity={0.05}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TrafficSourcesChart({ analytics }: { analytics: AnalyticsData }) {
  const sources = analytics.traffic_sources || [];
  if (sources.length === 0) return null;

  const categories: Record<string, number> = {};
  for (const src of sources) {
    const medium =
      src.medium === '(none)'
        ? 'Direct'
        : src.medium === 'organic'
          ? 'Organic'
          : src.medium === 'referral'
            ? 'Referral'
            : src.medium === 'social'
              ? 'Social'
              : src.medium === 'cpc'
                ? 'Paid'
                : 'Other';
    categories[medium] = (categories[medium] || 0) + src.sessions;
  }

  const chartData = Object.entries(categories)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader>
        <CardDescription>Traffic Sources</CardDescription>
        <CardTitle className='text-lg'>By Medium</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx='50%'
              cy='50%'
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey='value'
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TopPagesTable({ analytics }: { analytics: AnalyticsData }) {
  const pages = analytics.top_pages || [];
  if (pages.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Top Pages</CardDescription>
        <CardTitle className='text-lg'>Most Viewed Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className='text-right'>Views</TableHead>
              <TableHead className='text-right'>Users</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pages.slice(0, 10).map((page) => (
              <TableRow key={page.page}>
                <TableCell className='max-w-[300px] truncate font-mono text-sm'>
                  {page.page}
                </TableCell>
                <TableCell className='text-right tabular-nums'>{page.views}</TableCell>
                <TableCell className='text-right tabular-nums'>{page.users}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TrafficSourcesTable({ analytics }: { analytics: AnalyticsData }) {
  const sources = analytics.traffic_sources || [];
  if (sources.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Traffic Sources</CardDescription>
        <CardTitle className='text-lg'>Detailed Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead>Medium</TableHead>
              <TableHead className='text-right'>Sessions</TableHead>
              <TableHead className='text-right'>Users</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.map((src, i) => (
              <TableRow key={`${src.source}-${src.medium}-${i}`}>
                <TableCell className='text-sm'>{src.source}</TableCell>
                <TableCell className='text-muted-foreground text-sm'>{src.medium}</TableCell>
                <TableCell className='text-right tabular-nums'>{src.sessions}</TableCell>
                <TableCell className='text-right tabular-nums'>{src.users}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function DevicesChart({ analytics }: { analytics: AnalyticsData }) {
  const devices = (analytics.devices || []) as Array<{ device: string; sessions: number }>;
  if (devices.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Devices</CardDescription>
        <CardTitle className='text-lg'>Desktop vs Mobile</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={250}>
          <PieChart>
            <Pie
              data={devices.map((d) => ({ name: d.device, value: d.sessions }))}
              cx='50%'
              cy='50%'
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
              dataKey='value'
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {devices.map((_entry, index) => (
                <Cell key={`device-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function LocationsTable({ analytics }: { analytics: AnalyticsData }) {
  const locations = (analytics.locations || []) as Array<{ city: string; users: number; sessions: number }>;
  if (locations.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Locations</CardDescription>
        <CardTitle className='text-lg'>Top Cities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead className='text-right'>Users</TableHead>
              <TableHead className='text-right'>Sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.slice(0, 10).map((loc) => (
              <TableRow key={loc.city}>
                <TableCell className='text-sm'>{loc.city}</TableCell>
                <TableCell className='text-right tabular-nums'>{loc.users}</TableCell>
                <TableCell className='text-right tabular-nums'>{loc.sessions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function EventsTable({ analytics }: { analytics: AnalyticsData }) {
  const events = (analytics.all_events || []) as Array<{ event: string; count: number }>;
  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Events</CardDescription>
        <CardTitle className='text-lg'>All Tracked Events</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead className='text-right'>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((evt) => (
              <TableRow key={evt.event}>
                <TableCell className='font-mono text-sm'>{evt.event}</TableCell>
                <TableCell className='text-right tabular-nums'>{evt.count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SiteFunnelChart({ analytics }: { analytics: AnalyticsData }) {
  const funnel = analytics.funnel as Record<string, { views: number }> | undefined;
  if (!funnel || Object.keys(funnel).length === 0) return null;

  const funnelData = Object.entries(funnel)
    .map(([page, info]) => ({
      page: page.length > 25 ? page.slice(0, 25) + '...' : page,
      views: typeof info === 'object' && info !== null ? (info as { views: number }).views : 0
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <CardDescription>Site Funnel</CardDescription>
        <CardTitle className='text-lg'>Page Flow</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={funnelData} layout='vertical' margin={{ left: 10 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis type='number' stroke='hsl(var(--muted-foreground))' fontSize={12} />
            <YAxis
              dataKey='page'
              type='category'
              width={140}
              stroke='hsl(var(--muted-foreground))'
              fontSize={10}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Bar dataKey='views' fill='#C9A84C' radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function BlogPerformance({ analytics }: { analytics: AnalyticsData }) {
  const blog = analytics.blog as { total_views?: number; total_users?: number; articles?: Array<{ title: string; page: string; views: number; users: number }> } | undefined;
  if (!blog || !blog.articles || blog.articles.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Blog Performance</CardDescription>
        <CardTitle className='text-lg'>
          {blog.total_views ?? 0} views from {blog.total_users ?? 0} users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Article</TableHead>
              <TableHead className='text-right'>Views</TableHead>
              <TableHead className='text-right'>Users</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blog.articles.map((article) => (
              <TableRow key={article.page}>
                <TableCell className='max-w-[300px] truncate text-sm'>{article.title || article.page}</TableCell>
                <TableCell className='text-right tabular-nums'>{article.views}</TableCell>
                <TableCell className='text-right tabular-nums'>{article.users}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ContentPerformanceSection({ content }: { content: ContentPerformance }) {
  const posts = content.posts || [];
  if (posts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardDescription>Content Performance</CardDescription>
        <CardTitle className='text-lg'>Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead className='text-right'>Impressions</TableHead>
              <TableHead className='text-right'>Engagement</TableHead>
              <TableHead className='text-right'>Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts.slice(0, 10).map((post) => (
              <TableRow key={post.id}>
                <TableCell className='max-w-[250px] truncate text-sm font-medium'>
                  {post.title}
                </TableCell>
                <TableCell>
                  <Badge variant='outline' className='text-xs'>
                    {post.topic}
                  </Badge>
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {post.metrics?.linkedin?.impressions ?? 0}
                </TableCell>
                <TableCell className='text-right tabular-nums'>
                  {post.metrics?.linkedin?.engagement ?? 0}
                </TableCell>
                <TableCell className='text-right tabular-nums'>{post.score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function AnalyticsClient({ analytics, content, error }: AnalyticsClientProps) {
  if (error) {
    return (
      <PageContainer pageTitle='Analytics' pageDescription='Website & Content Analytics'>
        <div className='flex flex-col items-center justify-center gap-4 py-20'>
          <Icons.alertCircle className='text-destructive size-12' />
          <p className='text-muted-foreground'>{error}</p>
        </div>
      </PageContainer>
    );
  }

  if (!analytics) {
    return (
      <PageContainer pageTitle='Analytics' pageDescription='Website & Content Analytics'>
        <div className='text-muted-foreground flex flex-col items-center justify-center gap-2 py-20'>
          <Icons.spinner className='size-8 animate-spin' />
          <span>Loading analytics data...</span>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle='Analytics' pageDescription='Website & Content Analytics'>
      <div className='flex flex-col gap-6'>
        <TrafficOverview analytics={analytics} />
        <DailyTrafficChart analytics={analytics} />

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <TrafficSourcesChart analytics={analytics} />
          <DevicesChart analytics={analytics} />
        </div>

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <TopPagesTable analytics={analytics} />
          <TrafficSourcesTable analytics={analytics} />
        </div>

        <SiteFunnelChart analytics={analytics} />

        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <LocationsTable analytics={analytics} />
          <EventsTable analytics={analytics} />
        </div>

        <BlogPerformance analytics={analytics} />

        {content && <ContentPerformanceSection content={content} />}
      </div>
    </PageContainer>
  );
}
