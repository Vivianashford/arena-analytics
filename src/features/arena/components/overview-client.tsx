'use client';

import PageContainer from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter,
  CardContent
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import type { ArenaData } from '@/features/arena/api/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface OverviewClientProps {
  initialData: ArenaData | null;
  error: string | null;
}

const COLORS = ['#C9A84C', '#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6'];

function IntegrationStatusBar({ data }: { data: ArenaData | null }) {
  const integrations = [
    { name: 'Arena API', connected: true, icon: '🟢' },
    { name: 'GA4', connected: !!data?.analytics, icon: data?.analytics ? '🟢' : '🔴' },
    {
      name: 'GHL',
      connected: (data?.clients?.length ?? 0) > 0 || (data?.contacts?.total ?? 0) > 0,
      icon: (data?.clients?.length ?? 0) > 0 || (data?.contacts?.total ?? 0) > 0 ? '🟢' : '🔴'
    },
    { name: 'LinkedIn', connected: true, icon: '🟢' },
    { name: 'Facebook', connected: true, icon: '🟢' },
    { name: 'Instantly', connected: false, icon: '⚪' }
  ];

  return (
    <div className='flex flex-wrap items-center gap-3 rounded-lg border px-4 py-2'>
      <span className='text-muted-foreground text-xs font-medium uppercase tracking-wider'>
        Integrations
      </span>
      {integrations.map((i) => (
        <div key={i.name} className='flex items-center gap-1.5 text-sm'>
          <span className='text-xs'>{i.icon}</span>
          <span className={i.connected ? 'text-foreground' : 'text-muted-foreground'}>
            {i.name}
          </span>
        </div>
      ))}
    </div>
  );
}

function FunnelChart({ data }: { data: ArenaData }) {
  const funnelData = [
    { stage: 'VSL Lead', count: data.funnel['vsl-lead'] ?? 0 },
    { stage: 'Watched 25%', count: data.funnel['vsl-watched-25'] ?? 0 },
    { stage: 'Watched 50%', count: data.funnel['vsl-watched-50'] ?? 0 },
    { stage: 'Watched 75%', count: data.funnel['vsl-watched-75'] ?? 0 },
    { stage: 'Watched 100%', count: data.funnel['vsl-watched-100'] ?? 0 },
    { stage: 'Booked', count: data.funnel['vsl-booked'] ?? 0 },
    { stage: 'NDA Signed', count: data.funnel['nda-signed'] ?? 0 },
    { stage: 'Info Submitted', count: data.funnel['company-info-submitted'] ?? 0 }
  ];

  return (
    <Card>
      <CardHeader>
        <CardDescription>Pipeline Funnel</CardDescription>
        <CardTitle className='text-lg'>Lead Progression</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={funnelData} layout='vertical' margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis type='number' stroke='hsl(var(--muted-foreground))' fontSize={12} />
            <YAxis
              dataKey='stage'
              type='category'
              width={100}
              stroke='hsl(var(--muted-foreground))'
              fontSize={11}
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
            <Bar dataKey='count' fill='#C9A84C' radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TrafficChart({ data }: { data: ArenaData }) {
  const daily = data.analytics?.daily || [];

  if (daily.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Website Traffic</CardDescription>
          <CardTitle className='text-lg'>No Data Available</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-muted-foreground flex h-[300px] items-center justify-center'>
            GA4 data not available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardDescription>Website Traffic</CardDescription>
        <CardTitle className='text-lg'>Daily Sessions & Users</CardTitle>
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
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Area
              type='monotone'
              dataKey='users'
              stroke='hsl(var(--primary))'
              fill='hsl(var(--primary))'
              fillOpacity={0.05}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function TrafficSourcesChart({ data }: { data: ArenaData }) {
  const sources = data.analytics?.traffic_sources || [];
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

export function OverviewClient({ initialData, error }: OverviewClientProps) {
  if (error) {
    return (
      <PageContainer>
        <div className='flex flex-1 flex-col items-center justify-center gap-4 py-20'>
          <Icons.alertCircle className='text-destructive size-12' />
          <h2 className='text-xl font-semibold'>Failed to load dashboard</h2>
          <p className='text-muted-foreground'>{error}</p>
        </div>
      </PageContainer>
    );
  }

  if (!initialData) {
    return (
      <PageContainer>
        <div className='text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 py-20'>
          <Icons.spinner className='size-8 animate-spin' />
          <span>Loading dashboard data...</span>
        </div>
      </PageContainer>
    );
  }

  const data = initialData;

  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight'>
            <span className='text-[#C9A84C]'>Arena</span> Dashboard
          </h2>
          <span className='text-muted-foreground text-xs'>Updated: {data.updated_local}</span>
        </div>

        <IntegrationStatusBar data={data} />

        {/* Row 1: CRM KPIs */}
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Total Contacts</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.contacts?.total ?? '—'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.user className='size-3' />
                  {data.contacts?.real ?? 0} real
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                {data.arena_pipeline?.total ?? 0} in pipeline
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pipeline Value</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                ${(data.arena_pipeline?.total_value ?? 0).toLocaleString()}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp className='size-3' />
                  {data.arena_pipeline?.total ?? 0} deals
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                {data.arena_pipeline?.closed ?? 0} closed won
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Calls Booked</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.scoreboard?.calls_booked ?? '—'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.calendar className='size-3' />
                  {data.appointments?.upcoming ?? 0} upcoming
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                {data.arena_pipeline?.no_show ?? 0} no-shows
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Real Contacts</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.contacts?.real ?? '—'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.user className='size-3' />
                  verified
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                of {data.contacts?.total ?? 0} total contacts
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Row 2: Traffic KPIs */}
        <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs md:grid-cols-2 lg:grid-cols-4'>
          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Weekly Sessions</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.analytics?.week?.sessions ?? '—'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp className='size-3' />
                  This week
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                {data.analytics?.realtime_users ?? 0} active now
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Weekly Users</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.analytics?.week?.users ?? '—'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.user className='size-3' />
                  Unique
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                {data.analytics?.month?.users ?? '—'} this month
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Pageviews</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.analytics?.week?.pageviews ?? '—'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp className='size-3' />
                  This week
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                Avg {data.analytics?.week?.avg_duration ? `${Math.round(data.analytics.week.avg_duration)}s` : '—'} duration
              </div>
            </CardFooter>
          </Card>

          <Card className='@container/card'>
            <CardHeader>
              <CardDescription>Bounce Rate</CardDescription>
              <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
                {data.analytics?.bounce_rate != null ? `${data.analytics.bounce_rate}%` : '—'}
              </CardTitle>
              <CardAction>
                <Badge variant='outline'>
                  <Icons.trendingUp className='size-3' />
                  Site avg
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className='flex-col items-start gap-1.5 text-sm'>
              <div className='text-muted-foreground'>
                {data.analytics?.week?.conversions ?? 0} conversions
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Charts */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <FunnelChart data={data} />
          <TrafficChart data={data} />
        </div>

        {/* Traffic Sources */}
        <TrafficSourcesChart data={data} />
      </div>
    </PageContainer>
  );
}
