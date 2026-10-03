import { STOCK_THRESHOLDS } from './constants';

const DAY_MS = 24 * 60 * 60 * 1000;

export const todayISO = () => toISODate(new Date());

export function toISODate(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

export const daysAgo = (days) => toISODate(Date.now() - days * DAY_MS);
export const addDays = (iso, days) => toISODate(new Date(iso).getTime() + days * DAY_MS);
export const daysBetween = (fromIso, toIso) =>
  Math.round((new Date(toIso).setHours(0, 0, 0, 0) - new Date(fromIso).setHours(0, 0, 0, 0)) / DAY_MS);

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export const formatNumber = (n) => Number(n || 0).toLocaleString('en-IN');

export function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export function stockStatus(availableUnits) {
  if (availableUnits <= 0) return 'Out of Stock';
  if (availableUnits <= STOCK_THRESHOLDS.critical) return 'Critical';
  if (availableUnits <= STOCK_THRESHOLDS.low) return 'Low Stock';
  return 'Available';
}

// Single source of truth for which badge tone a status/priority uses.
const TONES = {
  Active: 'success', Inactive: 'neutral', Disabled: 'neutral',
  Available: 'success', 'Low Stock': 'warning', Critical: 'danger', 'Out of Stock': 'solid-danger',
  Pending: 'warning', Approved: 'info', Rejected: 'danger', Fulfilled: 'success', Cancelled: 'neutral',
  Normal: 'neutral', Urgent: 'warning', Emergency: 'solid-danger',
  admin: 'info', user: 'neutral',
};
export const toneFor = (value) => TONES[value] || 'neutral';

export function nextId(list, prefix, start) {
  const max = list.reduce((acc, item) => {
    const n = Number(String(item.id).replace(/\D/g, ''));
    return Number.isFinite(n) && n > acc ? n : acc;
  }, start - 1);
  return prefix ? `${prefix}-${max + 1}` : max + 1;
}

export const matchesSearch = (record, query, fields) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((f) => String(record[f] ?? '').toLowerCase().includes(q));
};
