'use client';

import React, { useCallback, useRef, useState } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Kanban, KanbanBoard, KanbanOverlay } from '@/components/ui/kanban';
import { KanbanColumn, KanbanColumnHandle } from '@/components/ui/kanban';
import { KanbanItem } from '@/components/ui/kanban';
import { Button } from '@/components/ui/button';
import type { ArenaData, ArenaClient } from '@/features/arena/api/types';
import { getStageDisplayName } from '@/features/arena/api/types';
import { createRestrictToContainer } from '@/features/kanban/utils/restrict-to-container';

const PIPELINE_COLUMNS = [
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
];

interface PipelineClientProps {
  initialData: ArenaData | null;
  error: string | null;
}

function ClientCard({
  client,
  ...props
}: { client: ArenaClient } & Omit<React.ComponentProps<typeof KanbanItem>, 'value'>) {
  return (
    <KanbanItem key={client.id} value={client.id} asChild {...props}>
      <div className='bg-card rounded-md border p-3 shadow-xs'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center justify-between gap-2'>
            <span className='line-clamp-1 text-sm font-medium'>{client.name}</span>
            {client.exitRiskScore > 0 && (
              <Badge
                variant={
                  client.exitRiskScore >= 70
                    ? 'destructive'
                    : client.exitRiskScore >= 40
                      ? 'default'
                      : 'secondary'
                }
                className='pointer-events-none h-5 rounded-sm px-1.5 text-[11px]'
              >
                Risk: {client.exitRiskScore}
              </Badge>
            )}
          </div>
          {client.company && (
            <span className='text-muted-foreground line-clamp-1 text-xs'>{client.company}</span>
          )}
          <div className='text-muted-foreground flex items-center justify-between text-xs'>
            {client.value > 0 && (
              <span className='font-medium text-[#C9A84C]'>${client.value.toLocaleString()}</span>
            )}
            {client.tags?.length > 0 && (
              <div className='flex gap-1'>
                {client.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant='outline' className='h-4 px-1 text-[9px]'>
                    {tag.replace(/-/g, ' ')}
                  </Badge>
                ))}
                {client.tags.length > 2 && (
                  <span className='text-[9px]'>+{client.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>
          <div className='text-muted-foreground flex items-center justify-between text-[10px]'>
            {client.dateAdded && (
              <time className='tabular-nums'>
                {new Date(client.dateAdded).toLocaleDateString()}
              </time>
            )}
          </div>
        </div>
      </div>
    </KanbanItem>
  );
}

export function PipelineClient({ initialData, error }: PipelineClientProps) {
  // Group clients into columns
  const buildColumns = useCallback((data: ArenaData | null) => {
    const cols: Record<string, ArenaClient[]> = {};
    for (const col of PIPELINE_COLUMNS) {
      cols[col] = [];
    }
    if (data?.clients) {
      for (const client of data.clients) {
        const stageName = getStageDisplayName(client.stage);
        if (cols[stageName]) {
          cols[stageName].push(client);
        } else {
          // Put in first column as fallback
          cols[PIPELINE_COLUMNS[0]].push(client);
        }
      }
    }
    return cols;
  }, []);

  const [columns, setColumns] = useState(() => buildColumns(initialData));
  const containerRef = useRef<HTMLDivElement>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const restrictToBoard = useCallback(
    createRestrictToContainer(() => containerRef.current),
    []
  );

  if (error) {
    return (
      <PageContainer pageTitle='Pipeline' pageDescription='GHL Pipeline - Kanban View'>
        <div className='flex flex-col items-center justify-center gap-4 py-20'>
          <Icons.alertCircle className='text-destructive size-12' />
          <p className='text-muted-foreground'>{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle='Pipeline' pageDescription='GHL Pipeline - Kanban View'>
      <div ref={containerRef}>
        <Kanban
          value={columns}
          onValueChange={(newCols) => setColumns(newCols as Record<string, ArenaClient[]>)}
          getItemValue={(item) => (item as ArenaClient).id}
          modifiers={[restrictToBoard]}
          autoScroll={false}
        >
          <ScrollArea className='w-full rounded-md pb-4'>
            <KanbanBoard className='flex items-start'>
              {Object.entries(columns).map(([columnValue, clients]) => (
                <KanbanColumn key={columnValue} value={columnValue} className='w-[280px] shrink-0'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold'>{columnValue}</span>
                      <Badge variant='secondary' className='pointer-events-none rounded-sm'>
                        {clients.length}
                      </Badge>
                    </div>
                    <KanbanColumnHandle asChild>
                      <Button variant='ghost' size='icon'>
                        <Icons.gripVertical className='h-4 w-4' />
                      </Button>
                    </KanbanColumnHandle>
                  </div>
                  <div className='flex flex-col gap-2 p-0.5'>
                    {clients.map((client) => (
                      <ClientCard key={client.id} client={client} asHandle />
                    ))}
                  </div>
                </KanbanColumn>
              ))}
            </KanbanBoard>
            <ScrollBar orientation='horizontal' />
          </ScrollArea>
          <KanbanOverlay>
            {({ value, variant }) => {
              if (variant === 'column') {
                const clients = columns[value] ?? [];
                return (
                  <KanbanColumn value={value} className='w-[280px] shrink-0'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-semibold'>{value}</span>
                      <Badge variant='secondary' className='rounded-sm'>
                        {clients.length}
                      </Badge>
                    </div>
                    <div className='flex flex-col gap-2 p-0.5'>
                      {clients.map((client) => (
                        <ClientCard key={client.id} client={client} />
                      ))}
                    </div>
                  </KanbanColumn>
                );
              }

              const client = Object.values(columns)
                .flat()
                .find((c) => c.id === value);

              if (!client) return null;
              return <ClientCard client={client} />;
            }}
          </KanbanOverlay>
        </Kanban>
      </div>
    </PageContainer>
  );
}
