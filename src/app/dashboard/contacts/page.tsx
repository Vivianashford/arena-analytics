'use client';
import { useEffect, useState } from 'react';
import { ContactsClient } from '@/features/arena/components/contacts-client';
import { getArenaData } from '@/features/arena/api/service';
import type { ArenaClient } from '@/features/arena/api/types';

export default function ContactsPage() {
  const [clients, setClients] = useState<ArenaClient[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArenaData()
      .then((d) => setClients(d?.clients ?? []))
      .catch((e) => setError(e.message));
  }, []);

  return <ContactsClient clients={clients} error={error} />;
}
