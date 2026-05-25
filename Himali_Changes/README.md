# Himali's Changes

This folder contains all the files modified or added by Himali.
Apply these changes to get the full working backend + database.

---

## Database

**File:** `database/migration.sql`

Run this once against your existing PostgreSQL database:

```bash
psql -U postgres -d <your_db_name> -f Himali_Changes/database/migration.sql
```

**What it adds:**
- `provider_profiles.base_fee` — doctor consultation fee
- `appointments.fee` — fee locked at booking time
- `appointments.payment_status` — Unpaid / Paid
- `appointments.payment_intent_id` — Stripe payment reference
- `appointments.prescription` — doctor's prescription notes
- `appointments` status constraint updated to include `Rescheduled`
- `ratings` table — patient star ratings for providers

---

## Backend Files Changed

| File | What changed |
|---|---|
| `backend/server.js` | Added hourly cleanup job to delete past unbooked availability slots |
| `backend/src/routes/providers.js` | Added `has_available_slots` (dynamic Available Now badge); added `base_fee` to profile upsert |
| `backend/src/routes/availability.js` | Added `DELETE /clear-future` endpoint so saving a new schedule replaces old slots |
| `backend/src/routes/appointments.js` | Booking stores `fee`; notifications show correct time; reschedule & consult notes fixes |

Copy these files into the matching paths in the main backend folder to apply the changes.
