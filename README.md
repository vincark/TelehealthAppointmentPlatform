# Telehealth Appointment Platform

## Clone the Repository

In Command Prompt, paste this:

```bash
git clone https://github.com/vincark/TelehealthAppointmentPlatform.git
cd TelehealthAppointmentPlatform
```

---

## Set Up the Database

1. Open pgAdmin, or any PostgreSQL GUI
2. Create a new database
3. Open the query tool and run `telehealth.sql`

---

## Configure the Backend

1. Navigate to the backend folder
2. Run `npm install`
3. Create a `.env` file inside the backend folder:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=telehealth_db
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
JWT_SECRET=any_long_random_string_here
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

- Log in to Stripe → Developers → API Keys to get your Stripe secret key.

- Use an **App Password** for Gmail, not your regular password. Go to Google Account → search for App Passwords.

4. Start the backend with:

```bash
node server.js
```

If the backend has been configured properly, “Server is running on port 5000” should be seen.

---

## Configure the Frontend

1. Open a new terminal and navigate to the frontend folder
2. Run `npm install`
3. Create a `.env` file inside the frontend folder:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

4. Start the frontend:

```bash
npm run dev
```

The app will open at `http://localhost:5173`

---

## Create an Admin Account

1. Generate a bcrypt hash for your password by running this in the backend folder:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword123!', 10).then(h => console.log(h));"
```

2. In pgAdmin, run this SQL (replace the values as needed):

```sql
INSERT INTO users (first_name, last_name, email, password_hash, role_id, account_status)
VALUES ('Admin', 'User', 'admin@telehealth.com', 'paste_hash_here', 3, 'Active');
```

---

## Test Credentials

ADMIN
Email: admin@telehealth.com
Password: Password123!@#

PROVIDER
Email: sarah@example.com
Password: password123

PATIENT
Please register a new account.

STRIPE TEST CARD
4242 4242 4242 4242
Any future expiry date, any 3-digit CVC


---

## Common Issues and Fixes

1. Cannot find module 'express-session'

```bash
npm install express-session
```

2. Cannot find module 'passport'

```bash
npm install passport passport-google-oauth20
```

3. Database connection error

Check that your `.env` database credentials match your PostgreSQL setup.

4. Stripe payment fails

Make sure you're using test mode keys (`pk_test_` and `sk_test_`).

5. Port 5000 already in use

```bash
npx kill-port 5000
```

6. Port 5173 already in use

```bash
npx kill-port 5173
```
