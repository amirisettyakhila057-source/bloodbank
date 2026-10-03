import {
  LayoutDashboard, Users, Building2, Droplets, ClipboardList, Siren, UserCog,
  BarChart3, UserCircle, Search, HeartHandshake, History,
} from 'lucide-react';

export const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/donors', label: 'Donors', icon: Users },
  { path: '/admin/hospitals', label: 'Hospitals', icon: Building2 },
  { path: '/admin/inventory', label: 'Blood Inventory', icon: Droplets },
  { path: '/admin/requests', label: 'Blood Requests', icon: ClipboardList },
  { path: '/admin/emergency', label: 'Emergency Requests', icon: Siren, badge: 'emergency' },
  { path: '/admin/users', label: 'Users', icon: UserCog },
  { path: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

export const USER_NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/search', label: 'Find Blood', icon: Search },
  { path: '/become-donor', label: 'Become a Donor', icon: HeartHandshake },
  { path: '/my-requests', label: 'My Requests', icon: ClipboardList },
  { path: '/donation-history', label: 'Donation History', icon: History },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

export function pageTitle(pathname) {
  const item = [...ADMIN_NAV, ...USER_NAV].find((n) => n.path === pathname);
  return item?.label || 'Page not found';
}
