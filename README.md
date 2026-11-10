# EmergencyConnect

**Project Title:** *Utilization of Natural Language Processing for Emergency Communication*

EmergencyConnect is an academic prototype that demonstrates how natural language processing can interpret everyday human incident descriptions into structured emergency categories, urgency assessments, and extracted key details for coordinator review.

> **Disclaimer:** This is an academic prototype and does not dispatch real-world emergency services. For actual emergencies, contact your local emergency number immediately.

## Local Development

1. Copy `.env.example` to `.env.local` and configure your Neon PostgreSQL `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize database tables and seed initial categories and demo accounts:
   ```bash
   npx tsx src/db/migrate-and-seed.ts
   ```
4. Build and start locally:
   ```bash
   npm run build
   npm start
   ```
   Open [http://localhost:4000](http://localhost:4000).

## Vercel Deployment

1. Import this repository (`https://github.com/deliveRance123/emergency.git`) into Vercel.
2. Add the required Environment Variables in Vercel Project Settings:
   - `DATABASE_URL` (your Neon PostgreSQL connection string)
   - `JWT_SECRET` (random 32+ character string)
   - `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL, e.g., `https://emergency-connect.vercel.app`)
3. Deploy — Vercel will automatically run `npm run build`.
