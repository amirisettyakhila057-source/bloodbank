# Building LifeFlow: A Blood Banking System Web App (Project Review 1)

*Suggested LinkedIn post title: "From phone calls to a dashboard: what I learned building a Blood Banking System"*

---

## 1. Introduction

For our Project Review 1, I built **LifeFlow**, a responsive web application that connects blood donors, blood banks and hospitals in one place. It handles donor registration, blood inventory, blood requests and emergency requirements, with separate experiences for administrators and users.

This article covers the problem, the modules I designed, the UI decisions, and the Design Thinking & Innovation (DTI) concepts behind the project.

## 2. Problem statement

When a patient needs blood urgently, the process often depends on phone calls, paper registers and spreadsheets. That makes it hard to:

- find a donor with a specific (sometimes rare) blood group quickly,
- know how many units each blood bank has,
- track whether a hospital's request has been approved or issued, and
- tell an emergency request apart from a routine one.

## 3. Proposed solution

LifeFlow centralises these operations:

- a **donor registry** with blood group, contact details and a 90-day donation eligibility check,
- **live inventory** for each blood bank and blood group, with automatic *Available / Low Stock / Critical / Out of Stock* status,
- a **digital request workflow**: Pending → Approved (units reserved) → Fulfilled, with Rejected and Cancelled states, and
- **highlighted emergency requests**, shown first and counted in the navigation.

## 4. Business modules

1. Authentication (login, signup, forgot-password screen, logout)
2. Admin and user dashboards
3. Donor management
4. Hospital management
5. Blood inventory
6. Blood requests and emergency requests
7. Blood availability search
8. Reports

## 5. Admin responsibilities

The admin (blood bank team) can view system statistics; manage donors, hospitals and user accounts; add and update blood stock; record donations; approve, reject and fulfil requests; prioritise emergencies; and view reports.

## 6. User responsibilities

A user (donor, hospital staff member or member of the public) can sign up, manage their profile, register as a donor, search blood availability by group and city, submit blood requests, track their status, and view their donation history.

## 7. UI/UX design

I wanted the app to look like a real healthcare dashboard rather than a basic form-based project:

- a calm, consistent design system: one primary colour, neutral surfaces, and status colours used only for status,
- reusable components: statistic cards, data tables with sorting and pagination, modals, badges, toast notifications and empty states,
- inline validation messages such as "Passwords do not match" and "Required units must be greater than 0",
- small conveniences: the blood search pre-fills the request form, and the login page offers one-click demo accounts.

## 8. CSS Grid and Flexbox

The layout uses no CSS framework:

- **CSS Grid** for page structure: the `sidebar | content` shell, statistic-card grids, chart grids, two-column forms and blood group tiles.
- **Flexbox** for alignment inside components: headers, toolbars, buttons, list rows, modals and toasts.
- **Responsive behaviour:** on tablets and phones the sidebar becomes a slide-in drawer, forms collapse to one column and tables scroll horizontally.

## 9. Local Storage authentication

Since Review 1 is frontend-only, all data is stored in the browser's Local Storage under separate keys (`users`, `donors`, `hospitals`, `bloodInventory`, `bloodRequests`, `donationHistory`, `currentUser`). Signup checks for duplicate emails and always creates a normal user account, so admin accounts cannot be created publicly. The app uses role-based routes to keep users out of admin pages.

I also built a small subscription layer, so that when data is saved, every screen that uses it updates immediately. For example, when the admin approves a request, the user's request status changes without a page reload.

**An important caveat:** Local Storage is not secure storage. It is acceptable for an academic demo, but a production system would need a backend with hashed passwords, token-based authentication, server-side authorization, HTTPS and an encrypted database.

## 10. DTI concepts applied

- **Digital Transformation:** replacing manual, phone-based coordination with a shared digital platform.
- **Data Management:** structured, validated records for donors, hospitals, inventory, requests and donations.
- **Process Automation:** approving a request reserves units automatically, fulfilling it issues them, and cancelling releases them.
- **User-Centered Design:** separate, focused menus per role, clear feedback, and helpful empty states.
- **Data Visualization:** charts for inventory, monthly donations, blood group distribution and request status, each with a table view.
- **Accessibility:** labelled form fields, visible focus states, readable contrast, status communicated with text and not colour alone, and a responsive layout.
- **Security Awareness:** being clear about what a frontend-only demo can and cannot protect.

## 11. Challenges

- **Keeping data consistent:** approving, fulfilling and cancelling requests all affect inventory. I kept every such change in one service module so the rules live in one place.
- **Keeping the UI in sync with Local Storage** across pages without a backend.
- **Responsive tables:** data-heavy tables needed to stay usable on a phone.
- **Restraint in design:** keeping colour meaningful so that emergencies actually stand out.

## 12. Learning outcomes

- Breaking a real-world business process into modules and user roles
- Building reusable React components driven by props, with state managed through hooks and context
- Designing layouts with CSS Grid and Flexbox and making them responsive
- Writing form validation and clear error messages
- Using Git with meaningful, feature-wise commits and deploying a single-page app to static hosting

## 13. Future improvements

- A backend API and database with secure authentication
- SMS or email alerts to matching donors for emergency requests
- Blood unit expiry tracking
- Map-based search for the nearest blood bank
- Donation camp scheduling and appointment booking

## 14. GitHub and deployment

- **Source code:** `https://github.com/<your-username>/bloodbank`
- **Live demo:** `<your deployment URL>`
- **Demo login:** admin@bloodbank.com / admin123 · user@bloodbank.com / user123

All demo data (names, phone numbers, hospitals and blood banks) is fictional.

I'd welcome feedback, especially from anyone who has worked with blood bank or hospital workflows.

#WebDevelopment #ReactJS #CSSGrid #Flexbox #DesignThinking #DTI #HealthcareTech #StudentProject #Frontend
