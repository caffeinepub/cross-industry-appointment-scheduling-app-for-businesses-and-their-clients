# Specification

## Summary
**Goal:** Deliver a multi-tenant appointment scheduling app where business owners authenticate with Internet Identity, manage their scheduling setup, and share a public booking link for clients.

**Planned changes:**
- Implement a single Motoko backend actor with isolated (per owner principal) data models and Candid CRUD APIs for business profile, services, availability rules, clients, and appointments (staff optional).
- Add backend validation to prevent double-booking and enforce weekly working-hours rules on appointment creation and rescheduling (cancelled appointments don’t block slots).
- Build frontend Internet Identity sign-in/sign-out and first-time onboarding to create business name + timezone, then route to an owner dashboard.
- Create owner dashboard screens for Services (CRUD), Availability (weekly hours editor), Clients (CRUD), and Appointments (list + calendar-like view with cancel/reschedule).
- Implement a public booking page per business (route param) to select a service, view only available time slots, enter client details, and confirm booking.
- Add React Query data fetching/mutations across all resources with loading/empty/error states and automatic updates after successful actions.
- Apply a consistent professional visual theme across dashboard and public flow, avoiding a blue/purple primary palette.
- Add static generated assets (logo + hero illustration) under `frontend/public/assets/generated` and render them in the UI.

**User-visible outcome:** A business owner can sign in, set up their business, services, and availability, manage clients and appointments, and share a public booking link that lets clients book available time slots with confirmation.
