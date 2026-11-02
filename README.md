# SplitsVilla — Group Villa Stays & Shared Expense Management

[![Vercel Deployment](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://splits-villa.vercel.app)
[![Render Deployment](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://splitsvilla.onrender.com/api/health)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)

SplitsVilla is a full-stack web application designed to simplify group villa travel. It combines villa discovery and booking simulation with group trip coordination, collaborative consensus voting on shortlisted stays, and expense splitting with debt simplification.

**Live Application**: [https://splits-villa.vercel.app](https://splits-villa.vercel.app)

> [!NOTE]
> **Free-Tier Cold Starts**: The backend API is hosted on Render's free tier, which spins down after 15 minutes of inactivity. When visiting the live demo after idle periods, the initial request or page load may take 50–60 seconds while the web service awakens. The frontend displays a non-blocking "Server is waking up..." status banner while this occurs.

---

## Architecture & Hosting

SplitsVilla uses a fully decoupled architecture:

* **Frontend**: Hosted on **Vercel (Hobby)**. A static single-page application (SPA) built with React 18, TypeScript, Vite 5, Tailwind CSS, shadcn/ui component primitives, TanStack React Query, and Leaflet.
* **Backend**: Hosted on **Render (Free Web Service, Singapore region)**. A RESTful API built with Node.js (ESM runtime, Node 22), Express 4, Mongoose 7, Helmet, and express-rate-limit.
* **Database**: Hosted on **MongoDB Atlas (M0 Free Tier)**. Managed cloud MongoDB database with resilient connection handling and exponential backoff.

---

## Core Features

### 1. Group Trip Coordination
* Create and manage trips with custom destinations, dates, and member counts.
* Unique invite codes for seamless member onboarding.
* Trip status tracking (`planning` → `booked` → `completed`).
* Trip history view for past getaways.

### 2. Property Discovery & Host Management
* Search properties by city, price range, property type, and amenities.
* Interactive map view powered by Leaflet.
* Wishlist system for bookmarking favorite villas.
* Host portal to create, update, archive, and restore listings with client-side compressed photo uploads (up to 5 images, max 1280×1280 JPEG).

### 3. Collaborative Shortlisting & Voting
* Shortlist properties directly into a shared group trip.
* Members cast upvotes and downvotes to reach group consensus.
* Automated voting score tallying to surface top recommendations.

### 4. Expense Splitting & Debt Simplification
* Log shared group expenses categorized by accommodation, food, activities, transit, and groceries.
* Attach expense receipts with automatic client-side canvas compression.
* Automated balance calculations and debt settlement flow to minimize the number of transactions required to settle up.

### 5. AI Budget Estimator (Deterministic Heuristic)
* Calculates estimated trip budgets based on group size, duration, and target spending.
* Provides a deterministic category breakdown (40% accommodation, 35% food, 15% activities, 10% transit) and travel tips.

### 6. Currency Converter (Static Indicative Table)
* Supports 10 currencies (INR, USD, EUR, GBP, AED, SGD, JPY, AUD, CAD, THB).
* Static indicative conversion table for quick estimation while planning international stays.

---

## Security & Reliability

The application implements 12 verified security and reliability behaviors:

1. **Fail-Fast Environment Validation**: Validates all critical environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URLS`, `CLIENT_URL`) at startup, immediately terminating with code 1 if configurations are missing or insecure in production.
2. **CORS Exact-Match Allowlist**: Strictly validates incoming request origins against an explicit allowed array from `CLIENT_URLS`. Wildcards are disallowed and credentials are set to `false`.
3. **HTTP Security Headers**: Employs `helmet` on the backend and comprehensive security headers on Vercel (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, `Permissions-Policy`).
4. **Multi-Tier Rate Limiting**:
   * General API limiter: 600 requests per 15-minute window.
   * Strict Auth limiter: 20 requests per 15-minute window for `/auth/login`, `/auth/register`, `/auth/request-password-reset`, and `/auth/reset-password` (`skipSuccessfulRequests: true`).
5. **Robust JWT Implementation**: Single JWT secret source with a minimum 32-character requirement in production, explicit `HS256` signing, and 30-day expiry.
6. **Single-Use Password Reset Tokens**: Password reset tokens are cryptographically bound to a hash of the user's current password hash. Changing the password automatically invalidates the token.
7. **Account Enumeration Defense**: The password reset request endpoint returns an identical generic response whether an email exists in the database or not.
8. **NoSQL Injection & Prototype Pollution Defense**: Configured with `app.set("query parser", "simple")` to block nested object query injection and validates parameter types on critical routes.
9. **Body Size Limits**: Request body size is capped at 4MB to prevent memory exhaustion, with client-side canvas compression ensuring image payloads stay well under ~1.2MB.
10. **Centralized Error Handling & JSON 404**: Converts Mongoose `CastError` (400), `ValidationError` (400), duplicate key `11000` (409 Conflict), and JWT errors (401) into clean JSON responses without leaking internal stack traces in production. Unknown `/api/*` endpoints return standardized JSON 404s.
11. **Health Checks & Connection Retry**:
    * Cheap `/api/health` endpoint returning server uptime and timestamp for load balancers without querying the database.
    * `/api/health/db` endpoint reporting live database connectivity (returns 503 if disconnected).
    * Initial database connection uses exponential backoff (2s doubling to 30s) to survive transient network drops.
12. **Frontend Cold-Start Resilience**: The frontend API client uses a 60-second timeout, retries idempotent GET requests up to 2 times on network timeouts or 502/503/504 gateway errors, keeps auth tokens intact across cold starts, and includes a production build guard requiring an HTTPS `VITE_API_URL`.

---

## Project Structure

```
SplitsVilla/
├── backend/                       # Express REST API (Node.js ESM)
│   ├── config/                    # Environment validation & fail-fast configuration
│   ├── middleware/                # Auth, rate limiting, error handling, validation
│   ├── models/                    # Mongoose schemas (User, Property, Trip, Booking, etc.)
│   ├── routes/                    # Express route handlers (auth, properties, trips, etc.)
│   ├── utils/                     # Algorithms (debt simplification), email, helpers
│   ├── .env.example               # Backend environment template
│   ├── .nvmrc                     # Node version configuration (22)
│   ├── package.json               # Backend dependencies and scripts
│   ├── seed.js                    # Non-destructive guarded database seed script
│   └── server.js                  # Entry point, health checks, and route mounting
├── frontend/                      # React 18 + Vite SPA
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── components/            # Reusable UI & domain-specific components
│   │   ├── contexts/              # AuthContext with cold-start session resilience
│   │   ├── hooks/                 # TanStack React Query hooks
│   │   ├── lib/                   # Styling and utility helpers
│   │   ├── pages/                 # Route page components
│   │   ├── services/              # Centralized ApiClient with exponential backoff
│   │   ├── test/                  # Vitest unit & component test suites
│   │   ├── types/                 # TypeScript interfaces and schema types
│   │   ├── utils/                 # Client-side image compressor & currency formatters
│   │   ├── App.tsx                # App routing & cold-start banner
│   │   └── main.tsx               # SPA entry point
│   ├── .nvmrc                     # Node version configuration (22)
│   ├── index.html                 # HTML template with metadata
│   ├── package.json               # Frontend dependencies and scripts
│   ├── vercel.json                # Vercel SPA rewrites, caching, and security headers
│   └── vite.config.ts             # Vite configuration with HTTPS production build guard
├── .env.example                   # Monorepo environment reference
├── .gitattributes                 # Cross-platform LF line-ending normalization
├── .gitignore                     # Git ignore rules
├── package.json                   # Root monorepo scripts
└── render.yaml                    # Render Blueprint deployment configuration
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example / Required in Production |
|---|---|---|
| `PORT` | Local server port | `5000` |
| `NODE_ENV` | Application environment | `production` or `development` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<password>@cluster.mongodb.net/splitsvilla` (Required) |
| `JWT_SECRET` | Secret key for signing auth tokens | Min 32 characters in production (Required) |
| `CLIENT_URLS` | Comma-separated list of allowed CORS origins | `https://splits-villa.vercel.app,http://localhost:8080` (Required) |
| `CLIENT_URL` | Primary frontend URL for email reset links | `https://splits-villa.vercel.app` (Required) |
| `EMAIL_USER` | SMTP email user (optional) | `your_email@gmail.com` |
| `EMAIL_PASSWORD`| SMTP email app password (optional) | `your_app_password` |
| `ALLOW_SEED` | Guard for running seed.js | Set to `true` to permit seeding (Optional) |
| `SEED_USER_PASSWORD` | Password for seeded demo host user | If omitted, generates a random hex password |

### Frontend (`frontend/.env` or Vercel Environment Variables)

| Variable | Description | Example / Required in Production |
|---|---|---|
| `VITE_API_URL` | Root URL for the backend API | `https://splitsvilla.onrender.com/api` (Required HTTPS in production) |

---

## Local Setup & Development

### Prerequisites
* **Node.js**: `>= 22.0.0`
* **npm**: `>= 10.0.0`
* **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster URI

### 1. Clone Repository
```bash
git clone https://github.com/parthp137/SplitsVilla.git
cd SplitsVilla
```

### 2. Install Dependencies
Install dependencies for both frontend and backend using the root command:
```bash
npm run install:all
```
*(Or navigate into `frontend/` and `backend/` individually and run `npm install`).*

### 3. Configure Environment Variables
Create a `.env` file in the `backend/` folder based on `backend/.env.example`:
```bash
cp backend/.env.example backend/.env
```
Update `MONGO_URI` and `JWT_SECRET` with your local values.

### 4. Run Development Servers
To run both backend and frontend concurrently:
```bash
npm run dev
```
Alternatively, run them in separate terminals:
* **Backend**:
  ```bash
  npm run dev:backend
  # Runs on http://localhost:5000
  ```
* **Frontend**:
  ```bash
  npm run dev:frontend
  # Runs on http://localhost:8080 (proxies /api to http://localhost:5000)
  ```

### 5. Running Tests & Typechecks
* **Run Unit Tests**:
  ```bash
  npm test --prefix frontend
  ```
* **Run TypeScript Check**:
  ```bash
  npm run typecheck --prefix frontend
  ```
* **Run Production Build**:
  ```bash
  # Windows PowerShell
  $env:VITE_API_URL="https://splitsvilla.onrender.com/api"; npm run build --prefix frontend

  # Linux / macOS
  VITE_API_URL="https://splitsvilla.onrender.com/api" npm run build --prefix frontend
  ```

---

## Known Limitations

* **Free-Tier Cold Starts**: Because the backend is deployed on Render's free tier, the service automatically spins down after 15 minutes of inactivity. The first request after an idle period takes approximately 50–60 seconds to respond.
* **Email Delivery on Free Render**: Render's free hosting tier blocks outbound SMTP ports (`465` and `587`). While password reset workflows function smoothly without throwing unhandled exceptions, automated emails will not deliver unless deployed with a dedicated third-party transactional email API (such as SendGrid or Resend) or on an unblocked network.
* **Deterministic AI Heuristics**: The AI travel and budget estimator relies on deterministic mathematical calculations and category allocation heuristics rather than live external LLM API calls.
* **Static Currency Rates**: Currency conversions use a fixed indicative reference table rather than live market foreign exchange APIs.
* **No WebSockets / Real-Time Sync**: Trip data, consensus votes, and expense updates synchronize on page loads and standard HTTP REST query invalidations rather than persistent WebSocket connections.
* **Simulated Payments & Bookings**: Property reservations and expense debt settlements are stored in the database for collaborative trip planning; no real payment gateway (such as Stripe or Razorpay) is integrated.
* **Sample Listing Data**: Demonstration properties are managed directly within the database or via the host dashboard rather than through external live property feeds.

---

## License

This project is licensed under the MIT License.
