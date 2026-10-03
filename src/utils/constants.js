export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export const GENDERS = ['Male', 'Female', 'Other'];
export const CITIES = ['Hyderabad', 'Bengaluru', 'Chennai', 'Pune'];
export const PRIORITIES = ['Normal', 'Urgent', 'Emergency'];
export const REQUEST_STATUSES = ['Pending', 'Approved', 'Rejected', 'Fulfilled', 'Cancelled'];
export const RECORD_STATUSES = ['Active', 'Inactive'];
export const ACCOUNT_TYPES = [
  { value: 'donor', label: 'Donor' },
  { value: 'hospital', label: 'Hospital staff' },
  { value: 'general', label: 'General user' },
];

// Minimum gap between two whole-blood donations.
export const DONATION_GAP_DAYS = 90;

// Stock thresholds applied to a single blood bank × blood group entry.
export const STOCK_THRESHOLDS = { critical: 10, low: 25 };

export const BLOOD_BANKS = [
  { id: 'BB-01', name: 'Central Blood Bank', city: 'Hyderabad', contact: '040-2000-1100' },
  { id: 'BB-02', name: 'LifeLine Blood Bank', city: 'Bengaluru', contact: '080-2000-2200' },
  { id: 'BB-03', name: 'Hope Blood Centre', city: 'Chennai', contact: '044-2000-3300' },
  { id: 'BB-04', name: 'Sahyadri Blood Bank', city: 'Pune', contact: '020-2000-4400' },
];
