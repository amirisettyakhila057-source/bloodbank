import { BLOOD_GROUPS, PRIORITIES, REQUEST_STATUSES } from './constants';
import { stockStatus } from './format';

const OPEN_STATUSES = ['Pending', 'Approved'];
export const isOpenEmergency = (r) => r.priority === 'Emergency' && OPEN_STATUSES.includes(r.status);

export function inventoryByGroup(inventory) {
  return BLOOD_GROUPS.map((group) => {
    const rows = inventory.filter((r) => r.bloodGroup === group);
    const available = rows.reduce((s, r) => s + r.availableUnits, 0);
    const reserved = rows.reduce((s, r) => s + r.reservedUnits, 0);
    return { group, available, reserved, total: available + reserved };
  });
}

export const lowStockRows = (inventory) => inventory.filter((r) => stockStatus(r.availableUnits) !== 'Available');

export function donorsByGroup(donors) {
  return BLOOD_GROUPS.map((group) => ({ group, donors: donors.filter((d) => d.bloodGroup === group).length }));
}

export function donationsByMonth(history, months = 6) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const units = history.filter((h) => h.date.startsWith(key)).reduce((s, h) => s + h.units, 0);
    return { month: d.toLocaleDateString('en-GB', { month: 'short' }), units };
  });
}

export const requestsByStatus = (requests) =>
  REQUEST_STATUSES.map((status) => ({ status, count: requests.filter((r) => r.status === status).length }));

export const requestsByPriority = (requests) =>
  PRIORITIES.map((priority) => ({ priority, count: requests.filter((r) => r.priority === priority).length }));

export function systemSummary({ donors, hospitals, inventory, requests, history }) {
  const byGroup = inventoryByGroup(inventory);
  return {
    totalDonors: donors.length,
    activeDonors: donors.filter((d) => d.status === 'Active').length,
    totalHospitals: hospitals.length,
    activeHospitals: hospitals.filter((h) => h.status === 'Active').length,
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === 'Pending').length,
    fulfilledRequests: requests.filter((r) => r.status === 'Fulfilled').length,
    emergencyOpen: requests.filter(isOpenEmergency).length,
    emergencyTotal: requests.filter((r) => r.priority === 'Emergency').length,
    availableUnits: byGroup.reduce((s, g) => s + g.available, 0),
    reservedUnits: byGroup.reduce((s, g) => s + g.reserved, 0),
    totalUnits: byGroup.reduce((s, g) => s + g.total, 0),
    lowStock: lowStockRows(inventory).length,
    totalDonations: history.reduce((s, h) => s + h.units, 0),
  };
}
