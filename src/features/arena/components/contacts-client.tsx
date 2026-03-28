'use client';

import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import type { ArenaClient } from '@/features/arena/api/types';
import { getStageDisplayName } from '@/features/arena/api/types';

interface ContactsClientProps {
  clients: ArenaClient[] | null;
  error: string | null;
}

function ContactDetailRow({ client }: { client: ArenaClient }) {
  return (
    <TableRow className='bg-muted/30'>
      <TableCell colSpan={8} className='p-4'>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          <div>
            <span className='text-muted-foreground text-xs'>Exit Risk</span>
            <p className='text-sm font-medium'>{client.exitRiskLevel || '—'}</p>
          </div>
          <div>
            <span className='text-muted-foreground text-xs'>EBITDA Score</span>
            <p className='text-sm font-medium'>{client.ebitdaScore || '—'}</p>
          </div>
          <div>
            <span className='text-muted-foreground text-xs'>SOP Score</span>
            <p className='text-sm font-medium'>{client.sopScore || '—'}</p>
          </div>
          <div>
            <span className='text-muted-foreground text-xs'>Owner Dependency</span>
            <p className='text-sm font-medium'>{client.ownerDependency || '—'}</p>
          </div>
          <div>
            <span className='text-muted-foreground text-xs'>Exit Timeline</span>
            <p className='text-sm font-medium'>
              {client.exitTimeline ? `${client.exitTimeline} years` : '—'}
            </p>
          </div>
          <div>
            <span className='text-muted-foreground text-xs'>Financial Clean</span>
            <p className='text-sm font-medium'>{client.financialClean || '—'}</p>
          </div>
          <div>
            <span className='text-muted-foreground text-xs'>Customer Concentration</span>
            <p className='text-sm font-medium'>{client.customerConcentration || '—'}</p>
          </div>
          <div>
            <span className='text-muted-foreground text-xs'>Video Watch</span>
            <p className='text-sm font-medium'>{client.watchPct ? `${client.watchPct}%` : '—'}</p>
          </div>
          <div className='col-span-2 md:col-span-4'>
            <span className='text-muted-foreground text-xs'>All Tags</span>
            <div className='mt-1 flex flex-wrap gap-1'>
              {client.tags?.map((tag) => (
                <Badge key={tag} variant='outline' className='text-xs'>
                  {tag}
                </Badge>
              ))}
              {(!client.tags || client.tags.length === 0) && (
                <span className='text-muted-foreground text-xs'>No tags</span>
              )}
            </div>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ContactsClient({ clients, error }: ContactsClientProps) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<'name' | 'dateAdded' | 'value' | 'exitRiskScore'>(
    'dateAdded'
  );
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const stages = useMemo(() => {
    if (!clients) return [];
    const s = new Set(clients.map((c) => getStageDisplayName(c.stage)));
    return Array.from(s).sort();
  }, [clients]);

  const filtered = useMemo(() => {
    if (!clients) return [];
    let result = [...clients];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      );
    }

    if (stageFilter !== 'all') {
      result = result.filter((c) => getStageDisplayName(c.stage) === stageFilter);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'name') cmp = (a.name || '').localeCompare(b.name || '');
      else if (sortField === 'dateAdded')
        cmp = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
      else if (sortField === 'value') cmp = a.value - b.value;
      else if (sortField === 'exitRiskScore') cmp = a.exitRiskScore - b.exitRiskScore;
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [clients, search, stageFilter, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  if (error) {
    return (
      <PageContainer pageTitle='Contacts' pageDescription='GHL Contacts'>
        <div className='flex flex-col items-center justify-center gap-4 py-20'>
          <Icons.alertCircle className='text-destructive size-12' />
          <p className='text-muted-foreground'>{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer pageTitle='Contacts' pageDescription='GHL Pipeline Contacts'>
      <div className='flex flex-col gap-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <div className='relative max-w-sm flex-1'>
            <Icons.search className='text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2' />
            <Input
              placeholder='Search contacts...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-9'
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue placeholder='All Stages' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Stages</SelectItem>
              {stages.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className='text-muted-foreground text-sm'>{filtered.length} contacts</span>
        </div>

        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='cursor-pointer' onClick={() => toggleSort('name')}>
                  Name {sortField === 'name' && (sortDir === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className='cursor-pointer' onClick={() => toggleSort('exitRiskScore')}>
                  Risk {sortField === 'exitRiskScore' && (sortDir === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className='cursor-pointer' onClick={() => toggleSort('dateAdded')}>
                  Created {sortField === 'dateAdded' && (sortDir === 'asc' ? '↑' : '↓')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className='text-muted-foreground py-8 text-center'>
                    No contacts found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((client) => (
                  <>
                    <TableRow
                      key={client.id}
                      className='cursor-pointer'
                      onClick={() => setExpandedId(expandedId === client.id ? null : client.id)}
                    >
                      <TableCell className='font-medium'>{client.name || '—'}</TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {client.email || '—'}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-sm'>
                        {client.phone || '—'}
                      </TableCell>
                      <TableCell className='text-sm'>{client.company || '—'}</TableCell>
                      <TableCell>
                        <Badge variant='outline' className='text-xs'>
                          {getStageDisplayName(client.stage)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className='flex gap-1'>
                          {client.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant='secondary' className='text-[10px]'>
                              {tag.replace(/-/g, ' ')}
                            </Badge>
                          ))}
                          {(client.tags?.length ?? 0) > 2 && (
                            <span className='text-muted-foreground text-[10px]'>
                              +{(client.tags?.length ?? 0) - 2}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {client.exitRiskScore > 0 ? (
                          <Badge
                            variant={
                              client.exitRiskScore >= 70
                                ? 'destructive'
                                : client.exitRiskScore >= 40
                                  ? 'default'
                                  : 'secondary'
                            }
                            className='text-[10px]'
                          >
                            {client.exitRiskScore}
                          </Badge>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className='text-muted-foreground text-xs tabular-nums'>
                        {client.dateAdded ? new Date(client.dateAdded).toLocaleDateString() : '—'}
                      </TableCell>
                    </TableRow>
                    {expandedId === client.id && (
                      <ContactDetailRow key={`${client.id}-detail`} client={client} />
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageContainer>
  );
}
