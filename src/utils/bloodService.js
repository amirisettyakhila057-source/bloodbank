/**
 * Business workflows. Every function validates the current state, updates the
 * affected Local Storage collections together and returns { ok, message }.
 */
import {
  getBloodInventory, saveBloodInventory, getBloodRequests, saveBloodRequests,
  getDonors, saveDonors, getDonationHistory, saveDonationHistory,
} from './localStorage';
import { BLOOD_BANKS, DONATION_GAP_DAYS } from './constants';
import { addDays, daysBetween, formatDate, nextId, todayISO } from './format';

const fail = (message) => ({ ok: false, message });
const now = () => new Date().toISOString();

function updateInventoryRow(bankId, bloodGroup, change) {
  const inventory = getBloodInventory();
  let row = inventory.find((r) => r.bankId === bankId && r.bloodGroup === bloodGroup);
  if (!row) {
    const bank = BLOOD_BANKS.find((b) => b.id === bankId);
    row = {
      id: `INV-${bankId}-${bloodGroup}`, bankId, bankName: bank.name, city: bank.city,
      contact: bank.contact, bloodGroup, availableUnits: 0, reservedUnits: 0,
    };
    inventory.push(row);
  }
  const updated = { ...row, ...change(row), lastUpdated: todayISO() };
  saveBloodInventory(inventory.map((r) => (r.id === row.id ? updated : r)));
  return updated;
}

function setRequest(id, patch) {
  saveBloodRequests(getBloodRequests().map((r) => (r.id === id ? { ...r, ...patch, updatedAt: now() } : r)));
}

/* ---------- Blood requests ---------- */

export function createRequest(values, user) {
  const requests = getBloodRequests();
  const request = {
    ...values,
    id: nextId(requests, 'R', 2001),
    units: Number(values.units),
    userId: user.id,
    status: 'Pending', bankId: null, bankName: '', adminNote: '',
    createdAt: now(), updatedAt: now(),
  };
  saveBloodRequests([request, ...requests]);
  return { ok: true, message: `Request ${request.id} submitted. You can track it under My Requests.`, request };
}

/** Bank with the most available units of a group – used as the default allocation. */
export function suggestBank(bloodGroup, units) {
  return getBloodInventory()
    .filter((r) => r.bloodGroup === bloodGroup && r.availableUnits >= units)
    .sort((a, b) => b.availableUnits - a.availableUnits)[0];
}

export function approveRequest(id, bankId) {
  const request = getBloodRequests().find((r) => r.id === id);
  if (!request || request.status !== 'Pending') return fail('Only pending requests can be approved.');
  const row = getBloodInventory().find((r) => r.bankId === bankId && r.bloodGroup === request.bloodGroup);
  if (!row || row.availableUnits < request.units) {
    return fail(`Not enough ${request.bloodGroup} units at the selected blood bank.`);
  }
  updateInventoryRow(bankId, request.bloodGroup, (r) => ({
    availableUnits: r.availableUnits - request.units,
    reservedUnits: r.reservedUnits + request.units,
  }));
  setRequest(id, { status: 'Approved', bankId, bankName: row.bankName });
  return { ok: true, message: `${request.id} approved. ${request.units} unit(s) reserved at ${row.bankName}.` };
}

export function rejectRequest(id, adminNote) {
  const request = getBloodRequests().find((r) => r.id === id);
  if (!request || request.status !== 'Pending') return fail('Only pending requests can be rejected.');
  setRequest(id, { status: 'Rejected', adminNote });
  return { ok: true, message: `${request.id} rejected.` };
}

export function fulfillRequest(id) {
  const request = getBloodRequests().find((r) => r.id === id);
  if (!request || request.status !== 'Approved') return fail('Only approved requests can be fulfilled.');
  updateInventoryRow(request.bankId, request.bloodGroup, (r) => ({
    reservedUnits: Math.max(0, r.reservedUnits - request.units),
  }));
  setRequest(id, { status: 'Fulfilled' });
  return { ok: true, message: `${request.id} marked as fulfilled. Units issued to ${request.hospitalName}.` };
}

export function cancelRequest(id) {
  const request = getBloodRequests().find((r) => r.id === id);
  if (!request || !['Pending', 'Approved'].includes(request.status)) {
    return fail('Only pending or approved requests can be cancelled.');
  }
  if (request.status === 'Approved') {
    // Release the reservation back to available stock.
    updateInventoryRow(request.bankId, request.bloodGroup, (r) => ({
      availableUnits: r.availableUnits + request.units,
      reservedUnits: Math.max(0, r.reservedUnits - request.units),
    }));
  }
  setRequest(id, { status: 'Cancelled' });
  return { ok: true, message: `${request.id} cancelled.` };
}

/* ---------- Inventory ---------- */

export function addStock(bankId, bloodGroup, units) {
  const row = updateInventoryRow(bankId, bloodGroup, (r) => ({ availableUnits: r.availableUnits + Number(units) }));
  return { ok: true, message: `Added ${units} unit(s) of ${bloodGroup} to ${row.bankName}.` };
}

export function updateStock(id, availableUnits, reservedUnits) {
  const row = getBloodInventory().find((r) => r.id === id);
  if (!row) return fail('Inventory entry not found.');
  updateInventoryRow(row.bankId, row.bloodGroup, () => ({
    availableUnits: Number(availableUnits), reservedUnits: Number(reservedUnits),
  }));
  return { ok: true, message: `${row.bloodGroup} stock updated at ${row.bankName}.` };
}

/* ---------- Donors & donations ---------- */

export function donationEligibility(lastDonationDate) {
  if (!lastDonationDate) return { eligible: true, nextDate: todayISO(), daysLeft: 0 };
  const nextDate = addDays(lastDonationDate, DONATION_GAP_DAYS);
  const daysLeft = Math.max(0, daysBetween(todayISO(), nextDate));
  return { eligible: daysLeft === 0, nextDate, daysLeft };
}

const normaliseDonor = (values) => ({
  ...values,
  fullName: values.fullName.trim(),
  email: values.email.trim().toLowerCase(),
  age: Number(values.age),
});

export function saveDonor(values, { id, userId } = {}) {
  const donors = getDonors();
  const email = values.email.trim().toLowerCase();
  const duplicate = donors.find((d) => d.email === email && d.id !== id);
  if (duplicate) return fail('A donor with this email address is already registered.');

  if (id) {
    saveDonors(donors.map((d) => (d.id === id ? { ...d, ...normaliseDonor(values) } : d)));
    return { ok: true, message: 'Donor details updated successfully.' };
  }
  const donor = {
    ...normaliseDonor(values),
    id: nextId(donors, 'D', 1001),
    status: values.status || 'Active',
    userId: userId ?? null,
    registeredAt: todayISO(),
  };
  saveDonors([donor, ...donors]);
  return { ok: true, message: 'Donor registration completed successfully.', donor };
}

export function setDonorStatus(id, status) {
  saveDonors(getDonors().map((d) => (d.id === id ? { ...d, status } : d)));
}

export function deleteDonor(id) {
  saveDonors(getDonors().filter((d) => d.id !== id));
}

export function recordDonation(donorId, bankId, date = todayISO()) {
  const donor = getDonors().find((d) => d.id === donorId);
  if (!donor) return fail('Donor not found.');
  if (donor.status !== 'Active') return fail('Inactive donors cannot donate. Activate the donor first.');
  const { eligible, nextDate } = donationEligibility(donor.lastDonationDate);
  if (!eligible) return fail(`${donor.fullName} is eligible to donate again from ${formatDate(nextDate)}.`);

  const bank = BLOOD_BANKS.find((b) => b.id === bankId);
  const history = getDonationHistory();
  saveDonationHistory([{
    id: nextId(history, 'DN', 5001), donorId, donorName: donor.fullName, bloodGroup: donor.bloodGroup,
    units: 1, date, bankId, bankName: bank.name, city: bank.city,
  }, ...history]);
  saveDonors(getDonors().map((d) => (d.id === donorId ? { ...d, lastDonationDate: date } : d)));
  updateInventoryRow(bankId, donor.bloodGroup, (r) => ({ availableUnits: r.availableUnits + 1 }));
  return { ok: true, message: `Donation recorded. 1 unit of ${donor.bloodGroup} added to ${bank.name}.` };
}
