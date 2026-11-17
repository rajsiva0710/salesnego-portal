# SaleNego Web Portal & Executive Client Portal
> **Production-Ready Single-Page Web Application for SaleNego ([salesnego.com](https://salesnego.com))**  
> Enterprise Go-to-Market Strategy, Deal Desk Architecture, and RLS-Secured Client Portal.

---

## 1. Executive Summary & Design System

SaleNego is built with an **executive, high-contrast monochrome aesthetic** engineered for B2B revenue leaders, founders, and private equity operating partners:

- **Editorial Typography**: Garamond serif headers (`EB Garamond`) paired with modern, clean sans-serif body text (`Inter`) and tabular monospace numerics (`JetBrains Mono`).
- **Brand Identity**: Custom geometric **RS Monogram** logo badge symbolizing *Raj S. / Revenue Strategy* & *SaleNego*.
- **Palette**: Deep monochrome obsidian black (`#09090b`), charcoal slate, metallic silver hairline borders (`rgba(255,255,255,0.12)`), and crisp white text.
- **Toggleable Light/Dark Theme**: Fluid, persisted theme switcher respecting executive viewing preferences.
- **Zero Stock Fluff**: Strictly no generic corporate stock photos or cartoon illustrations. Uses clean SVG architectural line art, metric pill tags, and interactive financial charts.

---

## 2. Core Architecture & Features

### A. Public GTM Landing & Interactive ROI Simulator
- **Strategic Methodology**: The 4 Levers of Deal Desk Institutionalization (Concession Audit, Negotiation Architecture, Live Deal War Room, Account Expansion/NRR).
- **Interactive ROI Simulator**:
  - **Inputs**: Real-time sliders for *Target ACV* ($20k–$500k+), *Annual Qualified Deals* (10–150), *Average Deal Cycle Length* (30–180 days), *Target Account Expansion Rate* (5%–50%), and *Current Close Rate* (10%–50%).
  - **Dynamic Engine**: Real-time calculation of **Projected 12-Month Net Revenue Lift**, **Deal Cycle Acceleration** (-25 days), **Net Additional Deals Won**, and **ACV Concession Defense Lift**.
  - **No Pricing Exposure**: Prominently displays the client's enterprise value creation and velocity multiple **without exposing public consulting pricing or retainer fees**.
  - **Interactive Chart**: Stacked comparison bar chart comparing baseline ARR vs. SaleNego-engineered ARR.

### B. Secure Client Portal & Supabase Authentication
- **Supabase Auth Integration**: Seamless login modal supporting Email/Password and token persistence.
- **Immediate Evaluation (Instant Demo Switcher)**: Pre-configured demo accounts for **Acme Enterprise Solutions** (`client@acme.com`) and **Apex Dynamics Global** (`vp@apexdynamics.io`) to test client data isolation with one click.
- **Live Supabase Config Modal**: Click the database icon in the header to enter and test your live Supabase Project URL and Public Anon Key at runtime.

### C. Strict Row-Level Security (RLS) Data Isolation
Each authenticated client can **strictly only view their own assigned records**, enforced mathematically at the database layer:
1. **GTM Strategic Roadmaps**: Current phase, progress percentage, target completion dates, strategic levers, and deliverables.
2. **Discovery Briefs & Deal War Room**: Target enterprise accounts, ACV sizing, risk rating, stakeholder power maps (Champion, Economic Buyer, Procurement Gatekeeper), Give-Get objection matrices, and confidential advisor notes.
3. **Pipeline & Deal Concession Matrix**: Live in-flight enterprise deals, win probability, cycle days elapsed, and next strategic move.
4. **Confidential Deliverables**: Downloadable custom playbooks, margin audit whitepapers, and executive memos.

---

## 3. Supabase Free Tier Setup (Under 3 Minutes)

This application is 100% compatible with Supabase's generous **Free Tier** (500MB PostgreSQL database, 50,000 monthly active users, unlimited API requests).

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and click **"Start your project"**.
2. Name your project (e.g., `salenego-portal`) and select your closest region.

### Step 2: Run the Database Schema & RLS Policies
1. In the Supabase dashboard, click on the **SQL Editor** tab in the left sidebar.
2. Open the file `supabase_schema.sql` in this repository.
3. Copy its entire content, paste it into the Supabase SQL Editor, and click **"Run"**.
4. This will create:
   - `organizations` table
   - `profiles` table (linked to `auth.users`)
   - `gtm_roadmaps` table
   - `discovery_briefs` table
   - `pipeline_metrics` table
   - `deliverables` table
   - `get_auth_org_id()` security helper function
   - Strict `ENABLE ROW LEVEL SECURITY` policies on all tables
   - Seed data for **Acme Enterprise Solutions** and **Apex Dynamics Global**

### Step 3: Connect Frontend to Your Supabase Instance
1. In your Supabase dashboard, go to **Project Settings** → **API**.
2. Copy your **Project URL** and **anon public key**.
3. You can connect in two ways:
   - **Method A (Zero-Rebuild UI)**: Open the web portal, click the **database icon** in the top navigation bar, paste the URL & Key, test connection, and click **Save & Connect**.
   - **Method B (Environment File)**: Copy `.env.example` to `.env` and fill in:
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```

---

## 4. Zero-Cost Static Hosting Deployment Guide

Because SaleNego is engineered as a clean, dependency-free static web application, it deploys in seconds to any zero-cost static hosting provider:

### Option A: Vercel (Recommended)
1. Push this repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import this repository.
4. Framework Preset: **Other** (Root directory: `.`).
5. (Optional) Under Environment Variables, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. Click **Deploy**. Vercel will deploy using the included `vercel.json`.

### Option B: Netlify
1. Go to [netlify.com](https://netlify.com) and sign in.
2. Drag and drop this folder directly into the Netlify "Deploys" pane, or link your GitHub repo.
3. Netlify will instantly serve the site using the included `netlify.toml`.

### Option C: GitHub Pages
1. Push this repository to GitHub.
2. In your GitHub repository, go to **Settings** → **Pages**.
3. Under **Build and deployment**, set Source to **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` will automatically build and publish the site to your `*.github.io` domain on every push!

---

## 5. Local Development & Preview

To preview the portal locally with zero dependencies:

```bash
# Start a simple local HTTP server with Python:
python3 -m http.server 8080
```

Then open your browser to [http://localhost:8080](http://localhost:8080).

- **Theme Switching**: Click `THEME` in the top right to test both obsidian dark and architectural light modes.
- **ROI Simulator**: Drag the sliders to test the real-time revenue velocity engine.
- **Client Portal**: Click `Client Sign In`, then click `Login: Acme (CRO)` or `Login: Apex (VP)` to immediately verify multi-tenant data isolation.

---

## 6. Security Architecture & RLS Verification

The PostgreSQL database enforces isolation at the database engine level:

```sql
-- Security verification: Only records matching user's org_id can be selected:
CREATE POLICY "Strict Client Isolation: Roadmaps Select"
    ON public.gtm_roadmaps FOR SELECT
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());
```

Even if a malicious client attempts to modify query parameters, PostgreSQL strictly returns empty sets for any record outside their authorized organization UUID.

---

**SaleNego Strategic Advisory** · [salesnego.com](https://salesnego.com) · Confidential Enterprise Architecture
