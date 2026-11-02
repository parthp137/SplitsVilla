# SplitsVilla

A full-stack web application for planning group villa getaways, coordinating member stays, and settling shared trip expenses.

**Live Demo**: [https://splits-villa.vercel.app](https://splits-villa.vercel.app)

---

## Features

* **Group Trip Planning**: Create trips with destinations, dates, and member counts; invite friends with unique invite codes; track status (`planning`, `booked`, `completed`).
* **Property Discovery & Host Listings**: Search properties by location, type, price, and amenities; explore stays with interactive Leaflet map integration; host portal for creating and editing villa listings.
* **Consensus Voting**: Shortlist properties to a shared trip and cast upvotes or downvotes to reach group agreement.
* **Expense Management & Debt Settlement**: Add categorized shared expenses with receipt attachments; view simplified balances and settlement instructions (balances are recorded in the database; no real payments are processed).
* **Budget Estimator**: Rule-based cost estimation calculating category breakdowns (accommodation, food, activities, transit) based on group size and duration (deterministic calculations, no external AI service).
* **Currency Converter**: Static indicative exchange rate table supporting 10 currencies for trip cost estimation (indicative rates only, no live forex feed).

---

## Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Leaflet
* **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs

---

## Highlights

* **Debt-Minimizing Settlement Algorithm** ([`backend/utils/algorithms.js`](backend/utils/algorithms.js)): Uses a greedy two-pointer creditor/debtor matching algorithm to resolve net shared balances in the minimum possible number of transactions.
* **Consensus Voting & Ranking** ([`backend/routes/votes.js`](backend/routes/votes.js), [`backend/utils/algorithms.js`](backend/utils/algorithms.js)): Aggregates member upvotes and downvotes to rank shortlisted villas by a composite score balancing affordability, ratings, amenities, and group votes.
* **JWT Authentication with Rate Limiting** ([`backend/middleware/auth.js`](backend/middleware/auth.js), [`backend/middleware/rateLimiter.js`](backend/middleware/rateLimiter.js)): Enforces route-level JWT authentication alongside multi-tier rate limiting (general API rate limiting and stricter limits on authentication endpoints).
* **Client-Side Image Compression** ([`frontend/src/utils/imageCompressor.ts`](frontend/src/utils/imageCompressor.ts)): Resizes and compresses property and receipt photos in the browser via HTML Canvas (max 1280×1280 JPEG, ~180KB target) before upload to prevent payload exhaustion.

---

## Project Structure

```
SplitsVilla/
├── backend/               # Express REST API (controllers, models, routes, middleware)
├── frontend/              # React 18 SPA (pages, components, contexts, hooks)
└── package.json           # Root workspace scripts
```

---

## Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/parthp137/SplitsVilla.git
cd SplitsVilla
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Local Environment
Copy the template configuration to create your local backend environment file:
```bash
cp backend/.env.example backend/.env
```
Refer to [`backend/.env.example`](backend/.env.example) for required configuration settings (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URLS`, `CLIENT_URL`).

### 4. Run Development Servers
```bash
npm run dev
```
Runs both backend (`http://localhost:5000`) and frontend (`http://localhost:8080`) concurrently.

### 5. Run Tests
```bash
npm test --prefix frontend
```
