'use client';

import { useEffect, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface OutreachData {
  lastUpdated: string;
  summary: {
    totalProspects: number;
    contacted: number;
    replied: number;
    meetingsBooked: number;
    activeSequences: number;
    replyRate: number;
    meetingRate: number;
  };
  byPartnerType: {
    CPA: { contacted: number; replied: number; meetings: number };
    Attorney: { contacted: number; replied: number; meetings: number };
    WealthAdvisor: { contacted: number; replied: number; meetings: number };
  };
  recentActivity: Array<{
    type: string;
    email: string;
    step?: number;
    subject?: string;
    timestamp: string;
  }>;
  sequencePerformance: {
    [key: string]: { sent: number; opened: number; replied: number };
  };
}

const DATA_URL =
  'https://vivianashford.github.io/levelup-pm/outreach-data.json';

const GOLD = '#C9A84C';
const COLORS = [GOLD, '#6366f1', '#22c55e', '#ef4444', '#f59e0b'];

// ---------------------------------------------------------------------------
// Metric Card
// ---------------------------------------------------------------------------
function MetricCard({
  title,
  value,
  icon,
  subtitle,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold tabular-nums'>{value}</div>
        {subtitle && (
          <p className='text-muted-foreground text-xs mt-1'>{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------
function EmptyState({ message }: { message: string }) {
  return (
    <div className='flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center'>
      <Icons.send className='text-muted-foreground mb-3 size-8 opacity-40' />
      <p className='text-muted-foreground text-sm'>{message}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sequence Performance Table
// ---------------------------------------------------------------------------
function SequenceTable({
  data,
}: {
  data: OutreachData['sequencePerformance'];
}) {
  const steps = [
    { key: 'email1', label: 'Email 1 — The Insight', day: 0 },
    { key: 'email2', label: 'Email 2 — The Case Study', day: 4 },
    { key: 'email3', label: 'Email 3 — The Value Drop', day: 9 },
    { key: 'email4', label: 'Email 4 — The Breakup Tease', day: 14 },
    { key: 'email5', label: 'Email 5 — The Clean Break', day: 21 },
  ];

  const hasData = steps.some((s) => (data[s.key]?.sent ?? 0) > 0);

  if (!hasData) {
    return <EmptyState message='No sequence data yet. Sends will appear here once outreach begins.' />;
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b text-left'>
            <th className='pb-2 font-medium'>Step</th>
            <th className='pb-2 font-medium text-right'>Day</th>
            <th className='pb-2 font-medium text-right'>Sent</th>
            <th className='pb-2 font-medium text-right'>Opened</th>
            <th className='pb-2 font-medium text-right'>Replied</th>
            <th className='pb-2 font-medium text-right'>Reply %</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((s) => {
            const perf = data[s.key] ?? { sent: 0, opened: 0, replied: 0 };
            const replyRate =
              perf.sent > 0
                ? ((perf.replied / perf.sent) * 100).toFixed(1)
                : '—';
            return (
              <tr key={s.key} className='border-b border-dashed'>
                <td className='py-2'>{s.label}</td>
                <td className='py-2 text-right text-muted-foreground'>
                  {s.day}
                </td>
                <td className='py-2 text-right tabular-nums'>{perf.sent}</td>
                <td className='py-2 text-right tabular-nums'>{perf.opened}</td>
                <td className='py-2 text-right tabular-nums'>
                  {perf.replied}
                </td>
                <td className='py-2 text-right tabular-nums'>{replyRate}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Partner Type Chart
// ---------------------------------------------------------------------------
function PartnerTypeChart({
  data,
}: {
  data: OutreachData['byPartnerType'];
}) {
  const chartData = [
    {
      name: 'CPA',
      contacted: data.CPA.contacted,
      replied: data.CPA.replied,
      meetings: data.CPA.meetings,
    },
    {
      name: 'Attorney',
      contacted: data.Attorney.contacted,
      replied: data.Attorney.replied,
      meetings: data.Attorney.meetings,
    },
    {
      name: 'Wealth Advisor',
      contacted: data.WealthAdvisor.contacted,
      replied: data.WealthAdvisor.replied,
      meetings: data.WealthAdvisor.meetings,
    },
  ];

  const hasData = chartData.some(
    (d) => d.contacted > 0 || d.replied > 0 || d.meetings > 0
  );

  if (!hasData) {
    return (
      <EmptyState message='No partner data yet. Bars will appear once prospects are contacted.' />
    );
  }

  return (
    <ResponsiveContainer width='100%' height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray='3 3' stroke='#333' />
        <XAxis dataKey='name' stroke='#888' fontSize={12} />
        <YAxis stroke='#888' fontSize={12} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: '8px',
          }}
        />
        <Bar dataKey='contacted' fill={GOLD} name='Contacted' radius={[4, 4, 0, 0]} />
        <Bar dataKey='replied' fill='#6366f1' name='Replied' radius={[4, 4, 0, 0]} />
        <Bar dataKey='meetings' fill='#22c55e' name='Meetings' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ---------------------------------------------------------------------------
// Pipeline Funnel
// ---------------------------------------------------------------------------
function PipelineFunnel({ data }: { data: OutreachData }) {
  const funnelData = [
    {
      name: 'Total Prospects',
      value: data.summary.totalProspects,
      fill: '#C9A84C',
    },
    { name: 'Contacted', value: data.summary.contacted, fill: '#6366f1' },
    { name: 'Replied', value: data.summary.replied, fill: '#f59e0b' },
    {
      name: 'Meeting Booked',
      value: data.summary.meetingsBooked,
      fill: '#22c55e',
    },
  ];

  const hasData = funnelData.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <EmptyState message='Pipeline funnel will populate as prospects move through stages.' />
    );
  }

  return (
    <div className='space-y-3'>
      {funnelData.map((stage, i) => {
        const maxVal = Math.max(...funnelData.map((d) => d.value), 1);
        const widthPct = Math.max((stage.value / maxVal) * 100, 8);
        return (
          <div key={stage.name} className='flex items-center gap-3'>
            <span className='text-muted-foreground w-32 text-xs shrink-0'>
              {stage.name}
            </span>
            <div className='flex-1 h-8 bg-muted/30 rounded relative overflow-hidden'>
              <div
                className='h-full rounded flex items-center px-3 transition-all'
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: stage.fill,
                  opacity: 0.85,
                }}
              >
                <span className='text-xs font-bold text-black'>
                  {stage.value}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activity Feed
// ---------------------------------------------------------------------------
function ActivityFeed({
  activities,
}: {
  activities: OutreachData['recentActivity'];
}) {
  if (!activities || activities.length === 0) {
    return (
      <EmptyState message='No activity yet. Sends and replies will appear here in real time.' />
    );
  }

  const typeIcon: Record<string, string> = {
    email_sent: '📤',
    reply_received: '📬',
    meeting_booked: '📅',
  };

  const typeLabel: Record<string, string> = {
    email_sent: 'Sent',
    reply_received: 'Reply',
    meeting_booked: 'Meeting',
  };

  return (
    <div className='space-y-2 max-h-64 overflow-y-auto'>
      {activities.map((a, i) => (
        <div
          key={i}
          className='flex items-start gap-3 rounded-lg border border-dashed p-3 text-sm'
        >
          <span className='text-base shrink-0'>
            {typeIcon[a.type] ?? '📧'}
          </span>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center gap-2'>
              <span className='font-medium'>
                {typeLabel[a.type] ?? a.type}
              </span>
              {a.step && (
                <span className='text-muted-foreground text-xs'>
                  Step {a.step}
                </span>
              )}
            </div>
            <p className='text-muted-foreground text-xs truncate'>
              {a.email}
              {a.subject ? ` — ${a.subject}` : ''}
            </p>
          </div>
          <span className='text-muted-foreground text-xs shrink-0'>
            {a.timestamp
              ? new Date(a.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Client
// ---------------------------------------------------------------------------
export function OutreachClient() {
  const [data, setData] = useState<OutreachData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: OutreachData) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <PageContainer
        pageTitle='Outreach'
        pageDescription='Cold Email & Referral Partner Pipeline'
        isLoading
      >
        <div />
      </PageContainer>
    );
  }

  // If fetch failed, show with zero state
  const d: OutreachData = data ?? {
    lastUpdated: '',
    summary: {
      totalProspects: 0,
      contacted: 0,
      replied: 0,
      meetingsBooked: 0,
      activeSequences: 0,
      replyRate: 0,
      meetingRate: 0,
    },
    byPartnerType: {
      CPA: { contacted: 0, replied: 0, meetings: 0 },
      Attorney: { contacted: 0, replied: 0, meetings: 0 },
      WealthAdvisor: { contacted: 0, replied: 0, meetings: 0 },
    },
    recentActivity: [],
    sequencePerformance: {
      email1: { sent: 0, opened: 0, replied: 0 },
      email2: { sent: 0, opened: 0, replied: 0 },
      email3: { sent: 0, opened: 0, replied: 0 },
      email4: { sent: 0, opened: 0, replied: 0 },
      email5: { sent: 0, opened: 0, replied: 0 },
    },
  };

  return (
    <PageContainer
      pageTitle='Outreach'
      pageDescription='Cold Email & Referral Partner Pipeline'
    >
      <div className='flex flex-col gap-6'>
        {/* Last updated */}
        {d.lastUpdated && (
          <p className='text-muted-foreground text-xs'>
            Last updated:{' '}
            {new Date(d.lastUpdated).toLocaleString('en-US', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
            {error && (
              <span className='text-red-400 ml-2'>
                (using cached data — fetch failed)
              </span>
            )}
          </p>
        )}

        {/* 4 Metric Cards */}
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <MetricCard
            title='Total Prospects'
            value={d.summary.totalProspects}
            icon={
              <Icons.user className='text-muted-foreground size-4' />
            }
            subtitle={
              d.summary.activeSequences > 0
                ? `${d.summary.activeSequences} active sequences`
                : 'No active sequences yet'
            }
          />
          <MetricCard
            title='Contacted'
            value={d.summary.contacted}
            icon={
              <Icons.send className='text-muted-foreground size-4' />
            }
          />
          <MetricCard
            title='Reply Rate'
            value={
              d.summary.contacted > 0
                ? `${d.summary.replyRate}%`
                : '—'
            }
            icon={
              <Icons.mail className='text-muted-foreground size-4' />
            }
            subtitle={
              d.summary.replied > 0
                ? `${d.summary.replied} total replies`
                : 'No replies yet'
            }
          />
          <MetricCard
            title='Meetings Booked'
            value={d.summary.meetingsBooked}
            icon={
              <Icons.calendar className='text-muted-foreground size-4' />
            }
            subtitle={
              d.summary.meetingsBooked > 0
                ? `${d.summary.meetingRate}% of replies`
                : 'No meetings yet'
            }
          />
        </div>

        {/* Middle row: Sequence Table + Partner Type Chart */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Sequence Performance</CardTitle>
              <CardDescription>
                5-step cold email sequence tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SequenceTable data={d.sequencePerformance} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>
                Partner Type Breakdown
              </CardTitle>
              <CardDescription>
                CPA vs Attorney vs Wealth Advisor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PartnerTypeChart data={d.byPartnerType} />
            </CardContent>
          </Card>
        </div>

        {/* Bottom row: Pipeline + Activity */}
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Pipeline Funnel</CardTitle>
              <CardDescription>
                Cold → Contacted → Replied → Meeting → Active Partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PipelineFunnel data={d} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Recent Activity</CardTitle>
              <CardDescription>
                Latest sends, replies, and meetings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={d.recentActivity} />
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
