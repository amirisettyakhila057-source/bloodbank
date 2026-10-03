/**
 * Local Storage data layer.
 *
 * Every collection is read through an in-memory cache so React components can
 * subscribe to it (see hooks/useStore.js). Each save writes to Local Storage,
 * refreshes the cache and notifies subscribers, so the UI updates immediately.
 */
import { seedDemoData } from './seedData';

export const STORAGE_KEYS = {
  users: 'users',
  donors: 'donors',
  hospitals: 'hospitals',
  bloodInventory: 'bloodInventory',
  bloodRequests: 'bloodRequests',
  donationHistory: 'donationHistory',
  currentUser: 'currentUser',
};
const SEED_FLAG = 'bloodBankSeeded';

const cache = new Map();
const listeners = new Set();

function read(key, fallback) {
  if (!cache.has(key)) {
    try {
      const raw = localStorage.getItem(key);
      cache.set(key, raw ? JSON.parse(raw) : fallback);
    } catch {
      cache.set(key, fallback);
    }
  }
  return cache.get(key);
}

function write(key, value) {
  if (value === null || value === undefined) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
  cache.set(key, value ?? null);
  listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// Keep multiple open tabs in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key) cache.delete(event.key);
    else cache.clear();
    listeners.forEach((listener) => listener());
  });
}

export const getUsers = () => read(STORAGE_KEYS.users, []);
export const saveUsers = (users) => write(STORAGE_KEYS.users, users);

export const getDonors = () => read(STORAGE_KEYS.donors, []);
export const saveDonors = (donors) => write(STORAGE_KEYS.donors, donors);

export const getHospitals = () => read(STORAGE_KEYS.hospitals, []);
export const saveHospitals = (hospitals) => write(STORAGE_KEYS.hospitals, hospitals);

export const getBloodInventory = () => read(STORAGE_KEYS.bloodInventory, []);
export const saveBloodInventory = (inventory) => write(STORAGE_KEYS.bloodInventory, inventory);

export const getBloodRequests = () => read(STORAGE_KEYS.bloodRequests, []);
export const saveBloodRequests = (requests) => write(STORAGE_KEYS.bloodRequests, requests);

export const getDonationHistory = () => read(STORAGE_KEYS.donationHistory, []);
export const saveDonationHistory = (history) => write(STORAGE_KEYS.donationHistory, history);

export const getCurrentUser = () => read(STORAGE_KEYS.currentUser, null);
export const setCurrentUser = (user) => {
  // Never keep the password in the session object.
  const { password: _password, ...safeUser } = user;
  write(STORAGE_KEYS.currentUser, safeUser);
};
export const logoutUser = () => write(STORAGE_KEYS.currentUser, null);

/** Seeds demo data on first launch. */
export function initializeStorage() {
  if (localStorage.getItem(SEED_FLAG)) return;
  resetDemoData();
}

/** Restores the original demo dataset (keeps nobody signed in). */
export function resetDemoData() {
  const data = seedDemoData();
  saveUsers(data.users);
  saveDonors(data.donors);
  saveHospitals(data.hospitals);
  saveBloodInventory(data.bloodInventory);
  saveBloodRequests(data.bloodRequests);
  saveDonationHistory(data.donationHistory);
  logoutUser();
  localStorage.setItem(SEED_FLAG, new Date().toISOString());
}
