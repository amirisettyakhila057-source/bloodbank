import { BLOOD_GROUPS } from './constants';
import { todayISO } from './format';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?\d{10,13}$/;

const isEmpty = (v) => v === undefined || v === null || String(v).trim() === '';
const cleanPhone = (v) => String(v).replace(/[\s-]/g, '');

/* Field rules: each returns an error message or '' */
export const rules = {
  required: (label) => (v) => (isEmpty(v) ? `${label} is required` : ''),
  email: (v) => (isEmpty(v) ? 'Email is required' : EMAIL_RE.test(v.trim()) ? '' : 'Invalid email address'),
  phone: (label = 'Phone number') => (v) => {
    if (isEmpty(v)) return `${label} is required`;
    return PHONE_RE.test(cleanPhone(v)) ? '' : `Enter a valid ${label.toLowerCase()} (10–13 digits)`;
  },
  password: (v) => {
    if (isEmpty(v)) return 'Password is required';
    return v.length < 6 ? 'Password must be at least 6 characters' : '';
  },
  bloodGroup: (v) => (BLOOD_GROUPS.includes(v) ? '' : 'Please select a blood group'),
  select: (label) => (v) => (isEmpty(v) ? `Please select ${label.toLowerCase()}` : ''),
  age: (v) => {
    if (isEmpty(v)) return 'Age is required';
    const n = Number(v);
    if (!Number.isInteger(n)) return 'Age must be a whole number';
    return n < 18 || n > 65 ? 'Donor age must be between 18 and 65' : '';
  },
  positiveInt: (label) => (v) => {
    if (isEmpty(v)) return `${label} is required`;
    const n = Number(v);
    return Number.isInteger(n) && n > 0 ? '' : `${label} must be greater than 0`;
  },
  nonNegativeInt: (label) => (v) => {
    if (isEmpty(v)) return `${label} is required`;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 ? '' : `${label} cannot be negative`;
  },
  maxUnits: (v) => (Number(v) > 10 ? 'A single request can be for at most 10 units' : ''),
  pastOrToday: (label) => (v) => (!isEmpty(v) && v > todayISO() ? `${label} cannot be in the future` : ''),
  todayOrFuture: (label) => (v) => {
    if (isEmpty(v)) return `${label} is required`;
    return v < todayISO() ? `${label} cannot be in the past` : '';
  },
  minLength: (label, n) => (v) => (!isEmpty(v) && v.trim().length < n ? `${label} must be at least ${n} characters` : ''),
};

/** Runs a schema ({ field: [rule, ...] | (values) => [rule, ...] }) and returns { field: message }. */
export function validate(values, schema) {
  const errors = {};
  Object.entries(schema).forEach(([field, fieldRules]) => {
    const list = typeof fieldRules === 'function' ? fieldRules(values) : fieldRules;
    for (const rule of list) {
      const message = rule(values[field] ?? '', values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  });
  return errors;
}

/* Schemas reused across pages */
export const loginSchema = {
  email: [rules.email],
  password: [rules.required('Password')],
};

export const signupSchema = {
  name: [rules.required('Full name'), rules.minLength('Full name', 3)],
  email: [rules.email],
  phone: [rules.phone()],
  accountType: [rules.select('an account type')],
  password: [rules.password],
  confirmPassword: [
    rules.required('Confirm password'),
    (v, values) => (v !== values.password ? 'Passwords do not match' : ''),
  ],
};

export const donorSchema = {
  fullName: [rules.required('Full name'), rules.minLength('Full name', 3)],
  age: [rules.age],
  gender: [rules.select('a gender')],
  bloodGroup: [rules.bloodGroup],
  phone: [rules.phone()],
  email: [rules.email],
  city: [rules.required('City')],
  address: [rules.required('Address')],
  lastDonationDate: [rules.pastOrToday('Last donation date')],
  emergencyContact: [
    rules.phone('Emergency contact'),
    (v, values) => (cleanPhone(v) === cleanPhone(values.phone) ? 'Emergency contact must differ from your phone' : ''),
  ],
};

export const hospitalSchema = {
  name: [rules.required('Hospital name')],
  contactPerson: [rules.required('Contact person')],
  phone: [rules.phone()],
  email: [rules.email],
  city: [rules.required('City')],
  address: [rules.required('Address')],
  registrationNumber: [rules.required('Registration number')],
};

export const requestSchema = {
  hospitalName: [rules.required('Hospital name')],
  patientName: [rules.required('Patient name')],
  bloodGroup: [rules.bloodGroup],
  units: [rules.positiveInt('Required units'), rules.maxUnits],
  requiredDate: [rules.todayOrFuture('Required date')],
  priority: [rules.select('a priority')],
  doctorName: [rules.required('Doctor name')],
  contactNumber: [rules.phone('Contact number')],
  reason: [rules.required('Reason')],
};

export const stockSchema = {
  bankId: [rules.select('a blood bank')],
  bloodGroup: [rules.bloodGroup],
  units: [rules.positiveInt('Units')],
};

export const stockUpdateSchema = {
  availableUnits: [rules.nonNegativeInt('Available units')],
  reservedUnits: [rules.nonNegativeInt('Reserved units')],
};

export const profileSchema = {
  name: [rules.required('Full name'), rules.minLength('Full name', 3)],
  phone: [rules.phone()],
  city: [rules.required('City')],
};

export const passwordSchema = {
  currentPassword: [rules.required('Current password')],
  newPassword: [rules.password],
  confirmPassword: [
    rules.required('Confirm password'),
    (v, values) => (v !== values.newPassword ? 'Passwords do not match' : ''),
  ],
};

export const searchSchema = {
  bloodGroup: [rules.bloodGroup],
  units: [rules.positiveInt('Required units')],
};
