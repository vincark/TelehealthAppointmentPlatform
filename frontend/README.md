# Telehealth Appointment Platform — Frontend

A full-featured telehealth web application that connects patients with healthcare providers. Patients can browse doctors, book appointments, attend video consultations, and rate their experience. Providers manage their schedule and write consultation notes. Admins oversee the entire platform.

---

## Features

### Patient
- Register and log in securely
- Browse available doctors by name or specialty
- Book appointments from a doctor's available slots
- Attend video consultations via Jitsi Meet (no app required)
- View appointment history, consultation notes, and prescriptions
- Rate doctors after completed appointments
- Receive email and in-app notifications on appointment updates

### Provider (Doctor)
- Manage profile — photo, specialty, bio, spoken languages
- Set weekly availability and appointment slot duration
- Accept or decline pending appointments
- Start video calls and write consultation notes and prescriptions
- View dashboard with upcoming appointments and stats

### Admin
- Overview dashboard — patient/provider counts, appointments today, status breakdown
- User management — activate, deactivate, or suspend accounts
- Create new provider accounts directly
- View all appointments across the platform
- Generate and save reports (appointments, users, provider performance)

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, plain CSS           |
| Backend   | Node.js, Express                    |
| Database  | PostgreSQL                          |
| Auth      | JWT (JSON Web Tokens), bcrypt       |
| Email     | Resend (SMTP)                       |
| Video     | Jitsi Meet (no API key required)    |

---

## Project Structure

```
src/
├── components/
│   ├── AdminPortal/       # Admin dashboard, user & report management
│   ├── DoctorPortal/      # Provider profile, appointments, availability
│   ├── PatientPortal/     # Booking, history, ratings, video call
│   ├── Providers/         # Public provider listing with search & filter
│   ├── Login/             # Login page
│   ├── Register/          # Patient registration
│   ├── Navbar/            # Top navigation bar
│   ├── Footer/            # Footer
│   ├── Hero/              # Landing page hero section
│   ├── Specialties/       # Specialty cards section
│   ├── Steps/             # How it works section
│   └── WhyChooseUs/       # Value proposition section
├── hooks/
│   └── useTheme.js        # Dark/light mode toggle
├── App.jsx                # Route definitions
├── main.jsx               # App entry point
├── index.css              # Global styles
└── tokens.css             # Design tokens (colours, spacing, typography)
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend API running on `http://localhost:5000`

### Installation

```bash
# Clone the repository
git clone https://github.com/himali-shrestha/Telehealth-frontend.git
cd Telehealth-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

The frontend proxies all `/api/...` requests to the backend at `http://localhost:5000` — make sure the backend is running first.

---

## Backend Repository

The backend (Node.js / Express / PostgreSQL) is maintained by Vinca Ramos Kuswara:
[github.com/vincark/TelehealthAppointmentPlatform](https://github.com/vincark/TelehealthAppointmentPlatform)

---

## Team

| Name              | Role                  |
|-------------------|-----------------------|
| Himali Shrestha   | Frontend Developer    |
| Vinca Raquenchi Kurniawan | Backend Developer |
