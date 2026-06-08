# Local Development Setup

Setting up PulseBoard for local development is fully structured around Firebase Emulators to ensure zero external hosting costs and offline capability.

## Quick Start (3 Steps)

### 1. Install Dependencies
Verify you are using Node.js 18+ or 20+, and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory. You can copy the values from `.env.example`:
```bash
cp .env.example .env.local
```

For purely local emulation, ensure this toggle is set to `true`:
```env
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
```

### 3. Spin Up Emulators and Dev Server
Start the Firebase Emulator Suite (Auth + Firestore) along with the Next.js development server:
```bash
npm run dev
```

The app will be accessible at `http://localhost:3000`. The Firebase Emulator UI dashboard will be available at `http://localhost:4000`.

---

## Seeding Mock Data

To test the application with pre-populated workspaces, monitors, response times, and historic incident logs, run:
```bash
# While the dev server is running
curl http://localhost:3000/api/demo/seed
```
This inserts high-fidelity mock data into your local emulator so you can immediately see graph rendering, status filters, and timeline listings.

---

## Running E2E Playwright Tests

PulseBoard includes a comprehensive test suite of 20 automated tests validating UI features, auth locks, and API responses.

```bash
# Run tests in headless mode
npm run test:e2e

# Run tests with the visual UI browser
npm run test:e2e:ui
```
*Note: Make sure your dev server is active at `http://localhost:3000` before running the test commands.*
