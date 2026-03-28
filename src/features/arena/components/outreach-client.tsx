'use client';

import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';

function SetupCard({
  title,
  description,
  buttonText,
  icon
}: {
  title: string;
  description: string;
  buttonText: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className='border-dashed'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          {icon}
          <div>
            <CardTitle className='text-lg'>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='text-muted-foreground rounded-lg border border-dashed p-8 text-center'>
          <p className='mb-4 text-sm'>No data flowing yet. Connect to start tracking.</p>
          <Button variant='outline' disabled>
            {buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PlaceholderStats({
  title,
  stats
}: {
  title: string;
  stats: { label: string; value: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>{title}</CardTitle>
        <CardDescription>Placeholder - connect integration to see real data</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-3 gap-4'>
          {stats.map((stat) => (
            <div key={stat.label} className='text-center'>
              <p className='text-muted-foreground text-2xl font-semibold tabular-nums'>
                {stat.value}
              </p>
              <p className='text-muted-foreground text-xs'>{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <span className='text-muted-foreground text-xs'>Data will appear once connected</span>
      </CardFooter>
    </Card>
  );
}

export function OutreachClient() {
  return (
    <PageContainer pageTitle='Outreach' pageDescription='Email & LinkedIn Outreach'>
      <div className='flex flex-col gap-6'>
        <PlaceholderStats
          title='Email Sequences'
          stats={[
            { label: 'Emails Sent', value: '—' },
            { label: 'Opened', value: '—' },
            { label: 'Replied', value: '—' }
          ]}
        />

        <PlaceholderStats
          title='LinkedIn Outreach'
          stats={[
            { label: 'Connections Sent', value: '—' },
            { label: 'Accepted', value: '—' },
            { label: 'Messages Sent', value: '—' }
          ]}
        />

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <SetupCard
            title='Connect Instantly.ai'
            description='Cold email sequences and deliverability tracking'
            buttonText='Connect Instantly.ai'
            icon={<Icons.send className='text-[#C9A84C] size-8' />}
          />

          <SetupCard
            title='Connect LinkedIn'
            description='LinkedIn outreach, connection requests, and message tracking'
            buttonText='Connect LinkedIn'
            icon={<Icons.user className='text-[#C9A84C] size-8' />}
          />
        </div>
      </div>
    </PageContainer>
  );
}
