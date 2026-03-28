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
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
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
            {analytics.realtime_users} active now
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

  // Group into categories
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
            {pages.slice(0, 15).map((page) => (
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
        <div className='text-muted-foreground flex items-center justify-center py-20'>
          No analytics data available
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
          <TopPagesTable analytics={analytics} />
        </div>
        {content && <ContentPerformanceSection content={content} />}
      </div>
    </PageContainer>
  );
}
