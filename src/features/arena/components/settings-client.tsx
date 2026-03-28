'use client';

import { useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';

const ARENA_API_DEFAULT = 'https://arena-api.jean-475.workers.dev';
const GHL_LOCATION_ID = 'LSvdgiiT7ManCRx9CCwE';
const GHL_PIPELINE_ID = 'PdlZRdFi8hty46vcVyx8';

type HealthStatus = 'idle' | 'checking' | 'ok' | 'error';

export function SettingsClient() {
  const [apiUrl, setApiUrl] = useState(ARENA_API_DEFAULT);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('idle');
  const [healthMessage, setHealthMessage] = useState('');

  const checkHealth = async () => {
    setHealthStatus('checking');
    setHealthMessage('');
    try {
      const res = await fetch(`${apiUrl}/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setHealthStatus('ok');
      setHealthMessage(`Service: ${data.service} | Status: ${data.status} | ${data.timestamp}`);
    } catch (e) {
      setHealthStatus('error');
      setHealthMessage(e instanceof Error ? e.message : 'Health check failed');
    }
  };

  const integrations = [
    {
      name: 'Arena Worker API',
      description: 'Cloudflare Worker handling API proxy',
      status: 'connected' as const,
      url: apiUrl
    },
    {
      name: 'Google Analytics 4',
      description: 'Website traffic and user analytics',
      status: 'connected' as const,
      url: 'Via Arena API'
    },
    {
      name: 'GoHighLevel',
      description: 'CRM pipeline and contact management',
      status: 'connected' as const,
      url: `Location: ${GHL_LOCATION_ID}`
    },
    {
      name: 'Facebook Ads',
      description: 'Ad campaign performance tracking',
      status: 'disconnected' as const,
      url: 'Not configured'
    },
    {
      name: 'Instantly.ai',
      description: 'Cold email sequences',
      status: 'disconnected' as const,
      url: 'Not configured'
    },
    {
      name: 'LinkedIn',
      description: 'Social outreach tracking',
      status: 'disconnected' as const,
      url: 'Not configured'
    }
  ];

  return (
    <PageContainer pageTitle='Settings' pageDescription='API Connections & Configuration'>
      <div className='flex flex-col gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Arena API</CardTitle>
            <CardDescription>Configure the Arena Worker API endpoint</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-4'>
            <div className='flex gap-3'>
              <Input
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder='https://arena-api.jean-475.workers.dev'
                className='flex-1'
              />
              <Button onClick={checkHealth} disabled={healthStatus === 'checking'}>
                {healthStatus === 'checking' ? (
                  <Icons.spinner className='mr-2 size-4 animate-spin' />
                ) : null}
                Check Health
              </Button>
            </div>
            {healthStatus !== 'idle' && (
              <div
                className={`rounded-md p-3 text-sm ${
                  healthStatus === 'ok'
                    ? 'bg-green-500/10 text-green-500'
                    : healthStatus === 'error'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {healthStatus === 'checking' ? 'Checking...' : healthMessage}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GHL Configuration</CardTitle>
            <CardDescription>GoHighLevel pipeline settings</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col gap-3'>
            <div className='flex items-center justify-between rounded-md border p-3'>
              <div>
                <span className='text-muted-foreground text-xs'>Location ID</span>
                <p className='font-mono text-sm'>{GHL_LOCATION_ID}</p>
              </div>
              <Badge variant='secondary'>Read-only</Badge>
            </div>
            <div className='flex items-center justify-between rounded-md border p-3'>
              <div>
                <span className='text-muted-foreground text-xs'>Pipeline ID</span>
                <p className='font-mono text-sm'>{GHL_PIPELINE_ID}</p>
              </div>
              <Badge variant='secondary'>Read-only</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connected services and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex flex-col gap-3'>
              {integrations.map((integration) => (
                <div
                  key={integration.name}
                  className='flex items-center justify-between rounded-md border p-3'
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`size-2 rounded-full ${
                        integration.status === 'connected' ? 'bg-green-500' : 'bg-muted-foreground'
                      }`}
                    />
                    <div>
                      <p className='text-sm font-medium'>{integration.name}</p>
                      <p className='text-muted-foreground text-xs'>{integration.description}</p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-xs'>{integration.url}</span>
                    <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                      {integration.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
