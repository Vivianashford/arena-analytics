import { NavGroup } from '@/types';

export const navGroups: NavGroup[] = [
  {
    label: 'Dashboard',
    items: [
      {
        title: 'Overview',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: []
      },
      {
        title: 'Pipeline',
        url: '/dashboard/pipeline',
        icon: 'kanban',
        shortcut: ['p', 'p'],
        isActive: false,
        items: []
      },
      {
        title: 'Contacts',
        url: '/dashboard/contacts',
        icon: 'teams',
        shortcut: ['c', 'c'],
        isActive: false,
        items: []
      },
      {
        title: 'Analytics',
        url: '/dashboard/analytics',
        icon: 'trendingUp',
        shortcut: ['a', 'a'],
        isActive: false,
        items: []
      },
      {
        title: 'Outreach',
        url: '/dashboard/outreach',
        icon: 'send',
        shortcut: ['o', 'o'],
        isActive: false,
        items: []
      }
    ]
  },
  {
    label: '',
    items: [
      {
        title: 'Settings',
        url: '/dashboard/settings',
        icon: 'settings',
        shortcut: ['s', 's'],
        isActive: false,
        items: []
      }
    ]
  }
];
