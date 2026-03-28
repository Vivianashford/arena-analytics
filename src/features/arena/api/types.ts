// ============================================================
// Arena API Types
// ============================================================

export interface ArenaClient {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  stage: string;
  status: string;
  value: number;
  completed: string[];
  missing: string[];
  tags: string[];
  watchPct: number;
  maxWatchPct: number;
  videoSegment: string;
  leadScore: string;
  exitRiskScore: number;
  exitRiskLevel: string;
  exitTimeline: number;
  financialClean: number;
  sopScore: number;
  ebitdaScore: number;
  ownerDependency: number;
  customerConcentration: number;
  successionScore: number;
  lastUpdate: string;
  dateAdded: string;
  opportunityId: string;
}

export interface Scoreboard {
  conversations: number;
  calls_booked: number;
  pipeline: number;
  revenue: number;
}

export interface ArenaPipeline {
  new_lead: number;
  contacted: number;
  proposal: number;
  closed: number;
  no_show: number;
  nurture: number;
  total: number;
  total_value: number;
}

export interface FunnelData {
  'vsl-lead': number;
  'vsl-watched-25': number;
  'vsl-watched-50': number;
  'vsl-watched-75': number;
  'vsl-watched-100': number;
  'vsl-booked': number;
  'nda-signed': number;
  'company-info-submitted': number;
}

export interface AnalyticsWeek {
  users: number;
  sessions: number;
  pageviews: number;
  avg_duration: number;
  conversions: number;
}

export interface AnalyticsMonth {
  users: number;
  sessions: number;
  pageviews: number;
  conversions: number;
}

export interface TopPage {
  page: string;
  views: number;
  users: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
}

export interface DailyAnalytics {
  date: string;
  users: number;
  sessions: number;
  pageviews: number;
}

export interface AnalyticsData {
  realtime_users: number;
  week: AnalyticsWeek;
  month: AnalyticsMonth;
  top_pages: TopPage[];
  traffic_sources: TrafficSource[];
  daily: DailyAnalytics[];
  bounce_rate: number;
  blog: Record<string, unknown>;
  funnel: Record<string, unknown>;
  video_events: Record<string, unknown>;
  video_progress: Record<string, unknown>;
  devices: Array<Record<string, unknown>>;
  locations: Array<Record<string, unknown>>;
  all_events: Array<Record<string, unknown>>;
  utm: Array<Record<string, unknown>>;
}

export interface ArenaData {
  updated: string;
  updated_local: string;
  scoreboard: Scoreboard;
  arena_pipeline: ArenaPipeline;
  funnel: FunnelData;
  contacts: { total: number; real: number };
  appointments: { upcoming: number };
  clients: ArenaClient[];
  analytics: AnalyticsData;
}

export interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export interface ContentPost {
  id: string;
  title: string;
  text_preview: string;
  topic: string;
  hook_type: string;
  format: string;
  platform_ids: Record<string, string>;
  posted_at: string;
  posted_hour: number;
  metrics: {
    linkedin: {
      likes: number;
      comments: number;
      shares: number;
      impressions: number;
      clicks: number;
      engagement: number;
    };
    last_checked: string;
  };
  score: number;
  tags: string[];
  created: string;
}

export interface ContentPerformance {
  posts: ContentPost[];
}

// Pipeline stage definitions
export const PIPELINE_STAGES = [
  'VSL Lead',
  'Call Booked',
  'Assessment Done',
  'Call Complete',
  'NDA Signed',
  'Due Diligence',
  '2nd Call Proposal',
  'Closed Won',
  'No Show',
  'Long Term Nurture'
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

// Map GHL tag/stage values to display names
export const STAGE_MAP: Record<string, string> = {
  'vsl-lead': 'VSL Lead',
  vsl_lead: 'VSL Lead',
  call_booked: 'Call Booked',
  'call-booked': 'Call Booked',
  assessment_done: 'Assessment Done',
  'assessment-done': 'Assessment Done',
  call_complete: 'Call Complete',
  'call-complete': 'Call Complete',
  nda_signed: 'NDA Signed',
  'nda-signed': 'NDA Signed',
  due_diligence: 'Due Diligence',
  'due-diligence': 'Due Diligence',
  '2nd_call_proposal': '2nd Call Proposal',
  '2nd-call-proposal': '2nd Call Proposal',
  closed_won: 'Closed Won',
  'closed-won': 'Closed Won',
  no_show: 'No Show',
  'no-show': 'No Show',
  long_term_nurture: 'Long Term Nurture',
  'long-term-nurture': 'Long Term Nurture'
};

export function getStageDisplayName(stage: string): string {
  return STAGE_MAP[stage] || stage.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
