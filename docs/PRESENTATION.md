# Project Review 1 — Presentation Guide

**Project:** LifeFlow — Blood Banking System
**Type:** Responsive frontend web application (React + Local Storage)

Suggested length: about 10–12 minutes, plus questions.

---

## Review requirement checklist

| # | Requirement | Where it is covered |
|---|---|---|
| 1 | Business system & module identification | Sections 1–4 below; README "Modules" |
| 2 | UI template & layout using CSS Grid/Flexbox | `src/styles/global.css`; Section 5 |
| 3 | Login & signup using Local Storage | `src/context/AuthContext.jsx`, `src/utils/localStorage.js` |
| 4 | Project demonstration & explanation | Section 6 (demo script) |
| 5 | LinkedIn article with DTI concepts | `docs/LINKEDIN_ARTICLE.md`; Section 7 |
| 6 | Git deployment | Git history, `vercel.json` / `netlify.toml`, README "Deployment" |

---

## 1. Problem

Blood management is often handled with phone calls, registers and spreadsheets. This causes:

- **Donors:** no central list, so finding a donor of a rare group (for example AB-) during an emergency takes many calls, and nobody tracks when a donor is next eligible.
- **Inventory:** stock levels at each blood bank are not visible to the others, so shortages are found too late.
- **Hospitals:** requests are made by phone, and their status (pending, approved, issued) is not tracked.
- **Emergencies:** urgent requests are not clearly separated from routine ones.

## 2. Solution

LifeFlow brings these operations into one web application:

- A single donor registry with blood group, contact details and donation eligibility
- Live inventory per blood bank and blood group, with automatic stock status
- A digital request workflow: **Pending → Approved (units reserved) → Fulfilled**, plus Rejected and Cancelled
- Emergency requests are highlighted, listed first and counted in the sidebar
- Dashboards and reports that turn the data into decisions

## 3. Roles

| Admin (blood bank team) | User (donor / hospital staff / public) |
|---|---|
| View dashboard and statistics | Sign up, log in, manage profile |
| Manage donors, record donations | Register as a blood donor |
| Manage hospitals | Search blood availability |
| Manage blood inventory and update stock | Submit blood requests |
| Approve, reject and fulfil requests | Track request status, cancel requests |
| Handle emergency requests | View donation history |
| Manage user accounts, view reports | See emergency requests that match their group |

Admins and users get different sidebars, and the routes are protected: a user who types `/admin` is sent back to their own dashboard.

## 4. Modules

1. **Authentication**: login, signup, forgot password (UI), logout, session kept in Local Storage
2. **Dashboard**: admin statistics and charts; user personal summary
3. **Donor Management**: CRUD, search and filter, activate/deactivate, donation recording, 90-day eligibility rule
4. **Hospital Management**: CRUD, search and filter, activate/deactivate
5. **Blood Inventory**: 4 blood banks × 8 blood groups; Available / Low Stock / Critical / Out of Stock
6. **Blood Requests**: request form, approval workflow, emergency highlighting
7. **Blood Search**: search by group, city and units, with a "Request Blood" call to action
8. **Reports**: summary cards, charts, tables, print

## 5. Technology

| Technology | How it is used |
|---|---|
| HTML | Semantic structure: `header`, `nav`, `main`, `aside`, `table`, labelled form fields |
| CSS | Custom design system using CSS variables, with no CSS framework |
| CSS Grid | App shell (`sidebar | content`), stat-card grid, chart grid, two-column forms, inventory tiles |
| Flexbox | Header, sidebar menu, toolbars, buttons, cards, list rows, modals, toasts |
| JavaScript | Validation, the business workflow (`bloodService.js`), statistics (`stats.js`) |
| Local Storage | Separate keys: `users`, `donors`, `hospitals`, `bloodInventory`, `bloodRequests`, `donationHistory`, `currentUser` |
| React | Reusable components (DataTable, Modal, StatCard, FormInput…) configured through **props** |
| State & Hooks | `useState` for forms and modals; custom hooks `useForm`, `useStore` (built on `useSyncExternalStore`) and `useMyDonor`; Context for auth and toasts |
| React Router | Nested routes, `ProtectedRoute` (role check), lazy-loaded pages, 404 page |
| Git/GitHub | Feature-wise commits; static deployment on Vercel/Netlify |

**Responsive behaviour:** above 960px the sidebar is fixed beside the content. Below that it becomes a drawer opened from the header menu button. Forms use two columns on desktop and one on mobile, and tables scroll horizontally.

**How the UI stays in sync:** every `save…()` function writes to Local Storage and then notifies subscribed components. When the admin approves a request, the dashboard, sidebar badge and user's request list all update immediately, without a page reload.

## 6. Live demonstration script

> Tip: before presenting, log in as admin and use **Profile → Reset demo data** so you start from a clean dataset.

| Step | Action | What to point out |
|---|---|---|
| 1 | Open the app and try `/admin` directly | Redirects to login (protected route) |
| 2 | **Signup**: submit empty, then mismatched passwords, then an existing email | Validation messages; duplicate-email check |
| 3 | Sign up with new details | Account saved in Local Storage (show DevTools → Application → Local Storage → `users`) |
| 4 | **Login** with the new account | Redirects to the **User Dashboard** |
| 5 | **Become a Donor**: fill the form | "Donor registration completed successfully." and eligibility card |
| 6 | **Find Blood**: O-, 2 units | Availability per blood bank with contact details |
| 7 | Click **Request Blood** and set priority to **Emergency** | Prefilled form; emergency warning; request appears as *Pending* |
| 8 | **Logout** | Session cleared |
| 9 | **Admin login** (demo button) | Admin dashboard: stats, emergency queue, low-stock alerts, charts |
| 10 | **Donors**: search for the new donor | The donor registered in step 5 is in the table |
| 11 | Record a donation for an eligible donor | Inventory +1 unit; donation history updated |
| 12 | **Blood Inventory**: Add stock (O-, 5 units) | Group tile and dashboard totals update |
| 13 | **Emergency Requests**: approve the new request | Choose a blood bank; units move from Available to Reserved |
| 14 | Log in as the user again and open **My Requests** | Status is now **Approved** and the timeline shows progress |
| 15 | Resize the browser / open on a phone | Drawer navigation, stacked forms, scrollable tables |

## 7. DTI concepts

| Concept | How LifeFlow applies it |
|---|---|
| **Digital Transformation** | Replaces phone calls and paper registers with a shared digital platform for donors, inventory and requests. |
| **Data Management** | Structured collections for donors, hospitals, inventory, requests and donations; unique IDs; validation before saving. |
| **Process Automation** | Approving a request reserves stock automatically, fulfilling it issues the units, and cancelling releases them. Recording a donation updates inventory, donor eligibility and history together. |
| **User-Centered Design** | Separate, simple menus for each role; prefilled forms (search → request, profile → donor form); clear empty states; one-click demo login. |
| **Data Visualization** | Charts for inventory, monthly donations, donor blood groups, request status and priority. Each chart has a table view for accessibility. |
| **Accessibility** | Labelled inputs, error text linked to fields, visible focus outlines, status shown as text and not only colour, readable contrast, reduced-motion support, responsive layout. |
| **Security Awareness** | Admin accounts cannot be created through public signup, routes are role-protected, and the password is not kept in the session. Local Storage is **not secure**: a production system would use a backend with hashed passwords, token-based auth, server-side authorization, HTTPS and an encrypted database. |

## 8. Likely questions

- **Why Local Storage?** The scope of Review 1 is frontend only. Local Storage gives persistence without a server. The data layer is isolated in `utils/localStorage.js`, so it can later be swapped for API calls.
- **How is stock kept consistent?** All stock changes go through `bloodService.js`, which checks the current state (for example, enough available units before approving) and updates requests and inventory together.
- **What if two tabs are open?** The app listens to the browser `storage` event, so other tabs refresh their data too.
- **Next steps?** Backend and database, SMS/email alerts for emergency matches, blood unit expiry tracking, and map-based search.
