/**
 * Fictional demo data. Names, phone numbers and emails are made up for the
 * academic demonstration and do not belong to real people.
 * Dates are generated relative to "today" so the demo always looks current.
 */
import { BLOOD_BANKS, BLOOD_GROUPS } from './constants';
import { daysAgo, addDays, todayISO } from './format';

const DONOR_ROWS = [
  // fullName, age, gender, bloodGroup, city, status
  ['Arjun Mehta', 28, 'Male', 'O+', 'Hyderabad', 'Active'],
  ['Kavya Raman', 31, 'Female', 'A+', 'Chennai', 'Active'],
  ['Rohan Kulkarni', 35, 'Male', 'B+', 'Pune', 'Active'],
  ['Sneha Iyer', 26, 'Female', 'AB+', 'Bengaluru', 'Active'],
  ['Vikram Rao', 42, 'Male', 'O-', 'Hyderabad', 'Active'],
  ['Meera Nair', 29, 'Female', 'B-', 'Chennai', 'Active'],
  ['Aditya Joshi', 38, 'Male', 'A-', 'Pune', 'Inactive'],
  ['Priya Sharma', 24, 'Female', 'O+', 'Bengaluru', 'Active'],
  ['Karthik Reddy', 33, 'Male', 'A+', 'Hyderabad', 'Active'],
  ['Ananya Das', 27, 'Female', 'AB-', 'Bengaluru', 'Active'],
  ['Farhan Qureshi', 45, 'Male', 'B+', 'Hyderabad', 'Active'],
  ['Divya Menon', 30, 'Female', 'O+', 'Chennai', 'Inactive'],
  ['Siddharth Patil', 36, 'Male', 'O-', 'Pune', 'Active'],
  ['Lakshmi Prasad', 41, 'Female', 'A+', 'Hyderabad', 'Active'],
  ['Nikhil Varma', 22, 'Male', 'B+', 'Bengaluru', 'Active'],
  ['Pooja Deshmukh', 34, 'Female', 'AB+', 'Pune', 'Active'],
  ['Rahul Krishnan', 39, 'Male', 'A-', 'Chennai', 'Active'],
  ['Zoya Khan', 25, 'Female', 'O+', 'Hyderabad', 'Active'],
];

const HOSPITAL_ROWS = [
  // name, contactPerson, city, regNo, status
  ['CityCare Multispeciality Hospital', 'Dr. Ramesh Gupta', 'Hyderabad', 'TS-HOS-2015-0412', 'Active'],
  ['Sunrise Children\'s Hospital', 'Ms. Anita Paul', 'Bengaluru', 'KA-HOS-2017-1180', 'Active'],
  ['Green Valley Medical Centre', 'Dr. Suresh Pillai', 'Chennai', 'TN-HOS-2012-0763', 'Active'],
  ['Lakeside General Hospital', 'Mr. Imran Sheikh', 'Hyderabad', 'TS-HOS-2019-0921', 'Active'],
  ['Riverside Trauma Centre', 'Dr. Neha Bhosale', 'Pune', 'MH-HOS-2016-1504', 'Active'],
  ['Hillview Community Clinic', 'Mr. George Thomas', 'Bengaluru', 'KA-HOS-2020-2231', 'Inactive'],
];

// Available units per blood group for each bank (order matches BLOOD_GROUPS).
const STOCK = {
  'BB-01': [58, 14, 64, 9, 22, 4, 92, 18],
  'BB-02': [46, 12, 51, 7, 19, 3, 74, 11],
  'BB-03': [39, 8, 44, 6, 15, 2, 61, 9],
  'BB-04': [33, 6, 40, 5, 12, 0, 55, 7],
};

const REQUEST_ROWS = [
  // userId, hospital, patient, group, units, dueInDays, priority, status, createdDaysAgo, bankId
  [1, 'CityCare Multispeciality Hospital', 'Patient A. Rao', 'O+', 2, 2, 'Urgent', 'Pending', 1, null],
  [1, 'Lakeside General Hospital', 'Patient S. Ali', 'B+', 3, -6, 'Normal', 'Fulfilled', 12, 'BB-01'],
  [1, 'CityCare Multispeciality Hospital', 'Patient M. Joseph', 'A+', 1, -20, 'Normal', 'Rejected', 25, null],
  [2, 'Sunrise Children\'s Hospital', 'Patient Baby K.', 'O-', 2, 0, 'Emergency', 'Pending', 0, null],
  [2, 'Sunrise Children\'s Hospital', 'Patient R. Shetty', 'AB+', 2, 3, 'Urgent', 'Approved', 2, 'BB-02'],
  [2, 'Green Valley Medical Centre', 'Patient L. Murthy', 'A-', 1, 5, 'Normal', 'Pending', 1, null],
  [2, 'Riverside Trauma Centre', 'Patient V. Jadhav', 'O+', 4, 0, 'Emergency', 'Approved', 1, 'BB-04'],
  [2, 'Green Valley Medical Centre', 'Patient P. Selvam', 'B-', 2, -3, 'Urgent', 'Fulfilled', 8, 'BB-03'],
  [2, 'Lakeside General Hospital', 'Patient H. Begum', 'AB-', 1, 1, 'Emergency', 'Pending', 0, null],
  [2, 'Riverside Trauma Centre', 'Patient D. More', 'A+', 3, -10, 'Normal', 'Fulfilled', 15, 'BB-04'],
  [2, 'CityCare Multispeciality Hospital', 'Patient T. Varghese', 'O+', 2, -14, 'Normal', 'Cancelled', 18, null],
  [2, 'Sunrise Children\'s Hospital', 'Patient N. Gowda', 'B+', 1, 4, 'Normal', 'Pending', 3, null],
];

const REASONS = ['Scheduled surgery', 'Accident trauma care', 'Anaemia treatment', 'Post-delivery complication', 'Dengue – low platelets'];
const DOCTORS = ['Dr. K. Srinivas', 'Dr. P. Menon', 'Dr. A. Fernandes', 'Dr. R. Bhat', 'Dr. S. Chatterjee'];

const slug = (name) => name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '');
const bankById = (id) => BLOOD_BANKS.find((b) => b.id === id);
const bankForCity = (city) => BLOOD_BANKS.find((b) => b.city === city) || BLOOD_BANKS[0];

export function seedDemoData() {
  const now = new Date().toISOString();

  const users = [
    {
      id: 100, name: 'System Admin', email: 'admin@bloodbank.com', password: 'admin123',
      phone: '9000000100', role: 'admin', accountType: 'general', city: 'Hyderabad',
      bloodGroup: '', status: 'Active', createdAt: daysAgo(400),
    },
    {
      id: 1, name: 'Arjun Mehta', email: 'user@bloodbank.com', password: 'user123',
      phone: '9000000101', role: 'user', accountType: 'donor', city: 'Hyderabad',
      bloodGroup: 'O+', status: 'Active', createdAt: daysAgo(380),
    },
    {
      id: 2, name: 'Hospital Desk', email: 'hospital@bloodbank.com', password: 'hospital123',
      phone: '9000000102', role: 'user', accountType: 'hospital', city: 'Bengaluru',
      bloodGroup: '', status: 'Active', createdAt: daysAgo(300),
    },
    {
      id: 3, name: 'Kavya Raman', email: 'kavya.raman@example.com', password: 'kavya123',
      phone: '9000000103', role: 'user', accountType: 'donor', city: 'Chennai',
      bloodGroup: 'A+', status: 'Active', createdAt: daysAgo(210),
    },
  ];

  // Donation history: each donor donates 1–3 times, at least 95 days apart.
  const donationHistory = [];
  const donors = DONOR_ROWS.map(([fullName, age, gender, bloodGroup, city, status], index) => {
    const id = `D-${1001 + index}`;
    const bank = bankForCity(city);
    const count = index === 0 ? 5 : 1 + (index % 3);
    const firstOffset = index === 0 ? 52 : 1 + ((index * 17) % 85);
    for (let i = 0; i < count; i += 1) {
      donationHistory.push({
        id: `DN-${5000 + donationHistory.length + 1}`,
        donorId: id, donorName: fullName, bloodGroup,
        units: 1, date: daysAgo(firstOffset + i * 95 + (i ? index % 10 : 0)),
        bankId: bank.id, bankName: bank.name, city: bank.city,
      });
    }
    return {
      id, fullName, age, gender, bloodGroup,
      phone: `90000${String(10200 + index)}`,
      email: `${slug(fullName)}@example.com`,
      city, address: `${12 + index * 3}, Demo Street, ${city}`,
      lastDonationDate: daysAgo(firstOffset),
      emergencyContact: `90000${String(20200 + index)}`,
      status,
      userId: index === 0 ? 1 : index === 1 ? 3 : null,
      registeredAt: daysAgo(firstOffset + count * 95 + 10),
    };
  });
  donationHistory.sort((a, b) => b.date.localeCompare(a.date));

  const hospitals = HOSPITAL_ROWS.map(([name, contactPerson, city, registrationNumber, status], index) => ({
    id: `H-${101 + index}`, name, contactPerson,
    phone: `90000${String(30100 + index)}`,
    email: `contact@${slug(name).split('.')[0]}-hospital.example.com`,
    city, address: `${5 + index * 7}, Health Avenue, ${city}`,
    registrationNumber, status,
  }));

  const bloodInventory = BLOOD_BANKS.flatMap((bank) =>
    BLOOD_GROUPS.map((group, i) => {
      const availableUnits = STOCK[bank.id][i];
      return {
        id: `INV-${bank.id}-${group}`,
        bankId: bank.id, bankName: bank.name, city: bank.city, contact: bank.contact,
        bloodGroup: group, availableUnits,
        reservedUnits: availableUnits === 0 ? 0 : Math.max(1, Math.round(availableUnits * 0.12)),
        lastUpdated: daysAgo((i + bank.id.length) % 6),
      };
    }));

  const bloodRequests = REQUEST_ROWS.map(
    ([userId, hospitalName, patientName, bloodGroup, units, dueInDays, priority, status, createdDaysAgo, bankId], index) => {
      const createdAt = new Date(Date.now() - createdDaysAgo * 86400000 - index * 3600000).toISOString();
      return {
        id: `R-${2001 + index}`, userId, hospitalName, patientName, bloodGroup, units,
        requiredDate: addDays(todayISO(), dueInDays), priority,
        doctorName: DOCTORS[index % DOCTORS.length],
        contactNumber: `90000${String(40100 + index)}`,
        reason: REASONS[index % REASONS.length],
        notes: priority === 'Emergency' ? 'Patient in ICU. Please process immediately.' : '',
        status, bankId, bankName: bankId ? bankById(bankId).name : '',
        adminNote: status === 'Rejected' ? 'Requested group not available at nearby banks on that date.' : '',
        createdAt, updatedAt: status === 'Pending' ? createdAt : now,
      };
    });

  return { users, donors, hospitals, bloodInventory, bloodRequests, donationHistory };
}
