# Vibeshot Studio Creative Hub — Project Context & Hackathon Compliance

Vibeshot is an advanced agentic platform designed to help creative directors and video strategists generate, iterate, and orchestrate short-form video campaigns (e.g. TikTok, Instagram Reels, YouTube Shorts) instantly.

## 🛠️ Technology Stack

- **Runtime / Package Manager**: Bun
- **Meta-Framework**: TanStack Start (TS/Vite)
- **Database / Auth / Backend Services**: Supabase (PostgreSQL with RLS)
- **Deployment Platform**: Cloudflare Workers (Wrangler for the AI brief engine & Mayar checkout APIs)
- **Image Generation Model**: FLUX via Fal.ai API
- **AI Brief Orchestrator**: Gemini 2.5 Flash

---

## 🏆 Hackathon Compliance Specifications

This workspace incorporates clean integrations designed to score maximum points across three concurrent hackathons:

### 1. Google Cloud Agent Builder & MongoDB MCP Server

- **Problem**: Cloud agent builders require standard, structured JSON/BSON document representations of creative campaigns.
- **Solution**: Implemented a BSON-compliant document mapping adapter `toMongoDBDocument` in `backend/worker.js` that maps active Supabase schemas to standard MongoDB BSON shapes (with `$oid` and `$date` keys), ensuring out-of-the-box compatibility with the MongoDB MCP Server and Google Cloud Agents.

### 2. Pendo Adoption Challenge

- **Problem**: Capturing granular user behaviors and identifying active accounts to drive high activation.
- **Solution**: Safe injection of Pendo analytics into `<head>` inside `__root.tsx`, paired with `pendo.identify()` calls wired directly to Supabase's `onAuthStateChange` listener inside `VibeShotPlatform.tsx` to automatically sync active user profiles (UUID + Email) on auth events.

### 3. World Product Day (Novus.ai Integration)

- **Problem**: Dynamic product-led growth (PLG) analytics tracking for modern SaaS products.
- **Solution**: Inject Novus.ai telemetry scripts inside the routing layout `<head>` in `__root.tsx` to automatically log user pageviews and interaction triggers.

---

## 💳 Payment Integrations (Mayar & Stripe)

To monetize premium storyboard renders, Vibeshot supports both local Indonesian and international payment gateways:

- **Mayar Integration (IDN)**:
  - **Checkout Route (`POST /api/checkout`)**: Communicates with the `api.mayar.id/v1/payment-links` endpoint to generate payment links for Bank Transfers and QRIS, embedding the authenticated `user_id` inside checkout metadata.
  - **Public Webhook Processor (`POST /api/webhooks/mayar`)**: A secure webhook receiver that bypasses Supabase JWT session validations, parses successful checkout postbacks, and updates user subscription billing states to `premium` tier in the `profiles` table.
- **Stripe Integration (International)**:
  - **Checkout Session Route (`POST /api/stripe/checkout`)**: Creates a secure Stripe checkout session for global users, returning a checkout URL and tracking successful payments.
  - **Database Profiles Table (`profiles` in `database_schema.sql`)**: Tracks active user billing states (`free` vs `premium`) and remaining credits, locked down securely via PostgreSQL Row Level Security (RLS) policies.

---

## 🛡️ Security & Performance Hardening

- **CORS Configuration**: Banned default wildcard `*` headers on all mutating endpoints. Restricts allowed origins strictly to the production domains (e.g. `https://vibeshot-creative-hub.pages.dev`) with development fallbacks for local testing.
- **ReDoS Prevention**: Optimized backend base64 processing via a non-backtracking data URL parser (`extractDataUrlParts`) in the Cloudflare Worker, preventing ReDoS vulnerabilities and staying safely within Cloudflare's 10ms CPU limit.

---

## 🌐 Web3 Intelligence Hub

A premium, glassmorphic analytics sub-dashboard (`src/routes/web3-hub.tsx`) that consolidates:
- **Solana Wallet Connection**: Built-in adapter displaying connection status, public keys, and network information.
- **Campaign Document Adapter**: Interactive viewer displaying the live JSON/BSON schema translations optimized for the Google Cloud Agent Builder and MongoDB MCP Server.
- **Billing Telemetry**: Real-time feedback for Mayar payments and Stripe invoice details.

---

## ☁️ Google Cloud Platform Budget Guard

- **Script (`setup-gcp-budget.sh`)**: Automates creation of a GCP budget alert policy capped at **Rp8,000,000** (~$500 USD).
- **Triggers**: Connects GCP billing to Pub/Sub messaging and email/SMS alerts at 50%, 90%, and 100% consumption thresholds to guarantee no budget overruns.

---

## 📊 Social Scraper Extension

- **Service (`backend/socialScraper.ts`)**: A standalone Bun/Express HTTP service leveraging RapidAPI's SMVD host.
- **Extraction**: Efficiently scrapers high-fidelity TikTok and Instagram Reels metadata (video URLs, caption, views, likes, comments count) to guide video brief strategies with real-world viral telemetry.

