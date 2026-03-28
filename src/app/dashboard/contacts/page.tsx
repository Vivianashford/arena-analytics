import { loadArenaDataFromFile } from '@/features/arena/api/service';
import { ContactsClient } from '@/features/arena/components/contacts-client';

export const metadata = {
  title: 'Arena Analytics : Contacts'
};

export default async function ContactsPage() {
  let clients = null;
  let error = null;

  try {
    const data = await loadArenaDataFromFile();
    clients = data.clients || [];
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load contacts';
  }

  return <ContactsClient clients={clients} error={error} />;
}
