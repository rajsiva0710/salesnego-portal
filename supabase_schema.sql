-- ==============================================================================
-- SALENEGO (salesnego.com) - Production Supabase Database Schema & RLS Policies
-- ==============================================================================
-- Description: Multi-tenant client portal schema with strict Row-Level Security (RLS).
-- Ensures each client organization can ONLY access its own GTM roadmaps, discovery briefs,
-- pipeline metrics, and deliverables.
-- Compatible with Supabase Free Tier.
-- ==============================================================================

-- 1. EXTENSIONS & SETUP
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ORGANIZATIONS (Clients)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT,
    tier TEXT DEFAULT 'Enterprise Advisory' CHECK (tier IN ('Growth Diagnostic', 'Core Advisory', 'Enterprise Advisory')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'onboarding', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER PROFILES (Linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'client_member' CHECK (role IN ('salenego_admin', 'client_admin', 'client_member')),
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GTM ROADMAPS (Strategic Phases & Key Milestones)
CREATE TABLE IF NOT EXISTS public.gtm_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    phase TEXT NOT NULL, -- e.g. "Phase 1: Deal Audit", "Phase 2: Negotiation Architecture"
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('planned', 'in_progress', 'completed', 'under_review')),
    target_date DATE NOT NULL,
    completion_pct INTEGER DEFAULT 0 CHECK (completion_pct >= 0 AND completion_pct <= 100),
    strategic_levers TEXT[] DEFAULT '{}',
    key_deliverable TEXT,
    assigned_lead TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. DISCOVERY BRIEFS & DEAL WAR ROOM NOTES
CREATE TABLE IF NOT EXISTS public.discovery_briefs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_account TEXT NOT NULL,
    deal_size_estimate NUMERIC(12,2),
    strategic_objective TEXT NOT NULL,
    stakeholder_map JSONB DEFAULT '[]'::jsonb, -- [{name, role, stance, influence_level}]
    objection_matrix JSONB DEFAULT '[]'::jsonb, -- [{objection, value_counter, concession_boundary}]
    risk_rating TEXT DEFAULT 'Medium' CHECK (risk_rating IN ('Low', 'Medium', 'High', 'Critical')),
    executive_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PIPELINE & DEAL VELOCITY METRICS
CREATE TABLE IF NOT EXISTS public.pipeline_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    opportunity_name TEXT NOT NULL,
    stage TEXT NOT NULL CHECK (stage IN ('Discovery', 'Value Architecture', 'Executive Alignment', 'Final Negotiation', 'Closed-Won')),
    acv NUMERIC(12,2) NOT NULL,
    win_probability INTEGER CHECK (win_probability >= 0 AND win_probability <= 100),
    cycle_days_elapsed INTEGER DEFAULT 0,
    concession_defended_pct INTEGER DEFAULT 0,
    next_strategic_move TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXECUTIVE DELIVERABLES & CONFIDENTIAL ASSETS
CREATE TABLE IF NOT EXISTS public.deliverables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Playbook', 'Deal Architecture', 'Executive Memo', 'Diagnostic Report')),
    file_type TEXT DEFAULT 'PDF',
    file_size TEXT DEFAULT '1.4 MB',
    is_confidential BOOLEAN DEFAULT true,
    download_url TEXT,
    version TEXT DEFAULT 'v1.0',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 8. ROW-LEVEL SECURITY (RLS) POLICIES & SECURITY ISOLATION
-- ==============================================================================

-- Enable RLS on all portal tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtm_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipeline_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- Helper security function: Extract current user's organization UUID
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS UUID AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper security function: Check if current user is a SaleNego internal advisor
CREATE OR REPLACE FUNCTION public.is_salenego_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'salenego_admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- RLS: ORGANIZATIONS
-- ------------------------------------------------------------------------------
CREATE POLICY "Clients can view their own organization record"
    ON public.organizations FOR SELECT
    USING (id = public.get_auth_org_id() OR public.is_salenego_admin());

-- ------------------------------------------------------------------------------
-- RLS: PROFILES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view profiles within their own organization"
    ON public.profiles FOR SELECT
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());

CREATE POLICY "Users can update their own personal profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- ------------------------------------------------------------------------------
-- RLS: GTM ROADMAPS
-- ------------------------------------------------------------------------------
CREATE POLICY "Strict Client Isolation: Roadmaps Select"
    ON public.gtm_roadmaps FOR SELECT
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());

CREATE POLICY "Strict Client Isolation: Roadmaps Modification"
    ON public.gtm_roadmaps FOR ALL
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());

-- ------------------------------------------------------------------------------
-- RLS: DISCOVERY BRIEFS
-- ------------------------------------------------------------------------------
CREATE POLICY "Strict Client Isolation: Discovery Briefs Select"
    ON public.discovery_briefs FOR SELECT
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());

CREATE POLICY "Strict Client Isolation: Discovery Briefs Modification"
    ON public.discovery_briefs FOR ALL
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());

-- ------------------------------------------------------------------------------
-- RLS: PIPELINE METRICS
-- ------------------------------------------------------------------------------
CREATE POLICY "Strict Client Isolation: Pipeline Metrics Select"
    ON public.pipeline_metrics FOR SELECT
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());

CREATE POLICY "Strict Client Isolation: Pipeline Metrics Modification"
    ON public.pipeline_metrics FOR ALL
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());

-- ------------------------------------------------------------------------------
-- RLS: DELIVERABLES
-- ------------------------------------------------------------------------------
CREATE POLICY "Strict Client Isolation: Deliverables Select"
    ON public.deliverables FOR SELECT
    USING (org_id = public.get_auth_org_id() OR public.is_salenego_admin());

-- ==============================================================================
-- 9. REALISTIC SEED DATA (For 2 Distinct Client Organizations to test RLS)
-- ==============================================================================

-- Client 1: Acme Enterprise (FinTech / Infrastructure)
INSERT INTO public.organizations (id, name, slug, domain, tier)
VALUES ('11111111-1111-1111-1111-111111111111', 'Acme Enterprise Solutions', 'acme-enterprise', 'acme.com', 'Enterprise Advisory')
ON CONFLICT (id) DO NOTHING;

-- Client 2: Apex Dynamics (AI & Logistics B2B)
INSERT INTO public.organizations (id, name, slug, domain, tier)
VALUES ('22222222-2222-2222-2222-222222222222', 'Apex Dynamics Global', 'apex-dynamics', 'apexdynamics.io', 'Core Advisory')
ON CONFLICT (id) DO NOTHING;

-- Roadmaps for Acme Enterprise
INSERT INTO public.gtm_roadmaps (org_id, title, phase, status, target_date, completion_pct, strategic_levers, key_deliverable, assigned_lead)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Enterprise Margin Leakage Audit', 'Phase 1: Deal Audit', 'completed', '2026-09-30', 100, ARRAY['Discounting Floor Governance', 'Historical Win/Loss Analysis', 'Margin Recovery Protocol'], 'Margin Diagnostic Whitepaper', 'Raj S.'),
('11111111-1111-1111-1111-111111111111', 'Multi-Threaded Negotiation Playbook', 'Phase 2: Negotiation Architecture', 'in_progress', '2026-11-30', 75, ARRAY['Economic Buyer Alignment Matrix', 'Give-Get Concession Tradeoffs', 'Procurement Counter-Tactics'], 'Custom Negotiation Playbook v2.4', 'Raj S.'),
('11111111-1111-1111-1111-111111111111', 'Tier-1 Deal Desk Shadowing & Coaching', 'Phase 3: Live War Room', 'in_progress', '2026-12-20', 40, ARRAY['Live Call Preparation', 'Term Sheet Restructuring', 'Contract Redline Guidance'], 'Executive Deal War Room Access', 'Raj S.'),
('11111111-1111-1111-1111-111111111111', 'Strategic Expansion & NRR Maximization', 'Phase 4: Land-and-Expand', 'planned', '2027-02-15', 0, ARRAY['Year-1 Renewal Trajectory', 'Multi-Year Escalator Clauses', 'Executive QBR Scripting'], 'NRR Acceleration Framework', 'Raj S.');

-- Roadmaps for Apex Dynamics (Separate Org)
INSERT INTO public.gtm_roadmaps (org_id, title, phase, status, target_date, completion_pct, strategic_levers, key_deliverable, assigned_lead)
VALUES 
('22222222-2222-2222-2222-222222222222', 'Commercial Deal Sizing & Packaging', 'Phase 1: Packaging Diagnostic', 'completed', '2026-10-15', 100, ARRAY['Value-Metric Realignment', 'Tiered Packaging Restructure'], 'Pricing & Packaging Matrix', 'Raj S.'),
('22222222-2222-2222-2222-222222222222', 'Mid-Market to Enterprise Pivot Architecture', 'Phase 2: Sales Velocity Engine', 'in_progress', '2026-12-10', 60, ARRAY['Inbound Qualification Protocol', 'Executive Champion Testing'], 'Enterprise Playbook v1.0', 'Raj S.');

-- Discovery Briefs for Acme Enterprise
INSERT INTO public.discovery_briefs (org_id, title, target_account, deal_size_estimate, strategic_objective, stakeholder_map, objection_matrix, risk_rating, executive_notes)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Global Tier-1 Banking Infrastructure Modernization', 'J.P. Morgan Chase & Co. / Asset Management', 485000.00, 'Defend multi-year contract floor without conceding on SLA tier or software pricing multipliers.',
 '[{"name": "Marcus Vance", "role": "Chief Information Officer", "stance": "Champion", "influence": "Executive Sign-Off"}, {"name": "Elena Rostova", "role": "Head of Global Procurement", "stance": "Aggressive Buyer", "influence": "Price Decider"}]'::jsonb,
 '[{"objection": "Demanding 35% discount based on multi-year commitment", "counter": "Trade volume discount strictly for 3-year prepay and case study participation", "boundary": "Zero price concession without executive prepay clause"}]'::jsonb,
 'Medium', 'Procurement has sent standard RFP boilerplate. Do not respond with baseline rate cards. Schedule executive session with CIO before next pricing submission.'),

('11111111-1111-1111-1111-111111111111', 'European Core Platform Expansion', 'Barclays International', 310000.00, 'Re-anchor expansion proposal on risk reduction rather than seat additions.',
 '[{"name": "Arthur Pendelton", "role": "VP Operations", "stance": "Neutral", "influence": "Operational Approver"}]'::jsonb,
 '[{"objection": "Internal budget freeze until Q2", "counter": "Deferred billing start with immediate deployment kickoff", "boundary": "Signed commitment required in current quarter"}]'::jsonb,
 'Low', 'Budget exists in contingency fund. Position implementation delay as severe regulatory compliance exposure.');

-- Discovery Briefs for Apex Dynamics (Separate Org)
INSERT INTO public.discovery_briefs (org_id, title, target_account, deal_size_estimate, strategic_objective, stakeholder_map, objection_matrix, risk_rating, executive_notes)
VALUES 
('22222222-2222-2222-2222-222222222222', 'Automated Logistics Fleet Optimization', 'Maersk Supply Chain', 275000.00, 'Secure annual pilot rollout with contractual scale milestones.',
 '[{"name": "Klaus Lind", "role": "Director of Logistics", "stance": "Champion", "influence": "High"}]'::jsonb,
 '[{"objection": "Integration timeline skepticism", "counter": "Dedicated architecture sprints backed by milestone SLAs", "boundary": "No penalty clauses"}]'::jsonb,
 'High', 'Ensure legal review on data residency requirements before final redlines.');

-- Pipeline Metrics for Acme Enterprise
INSERT INTO public.pipeline_metrics (org_id, opportunity_name, stage, acv, win_probability, cycle_days_elapsed, concession_defended_pct, next_strategic_move)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Global Tier-1 Banking Modernization', 'Final Negotiation', 485000.00, 85, 42, 94, 'Executive sponsor check-in and concession matrix finalization'),
('11111111-1111-1111-1111-111111111111', 'European Core Platform Expansion', 'Executive Alignment', 310000.00, 70, 28, 100, 'Deliver risk-reduction economic model to VP Ops'),
('11111111-1111-1111-1111-111111111111', 'Nordic Commercial Bank Deployment', 'Value Architecture', 225000.00, 60, 19, 100, 'Technical feasibility sign-off with enterprise architect'),
('11111111-1111-1111-1111-111111111111', 'APAC Wealth Management Pilot', 'Discovery', 160000.00, 45, 12, 100, 'Champion identification and business pain quantification');

-- Deliverables for Acme Enterprise
INSERT INTO public.deliverables (org_id, title, category, file_type, file_size, is_confidential, version)
VALUES 
('11111111-1111-1111-1111-111111111111', 'SaleNego Enterprise Negotiation Playbook v2.4', 'Playbook', 'PDF', '2.8 MB', true, 'v2.4'),
('11111111-1111-1111-1111-111111111111', 'Acme Q4 Margin Leakage & Concession Audit', 'Diagnostic Report', 'PDF', '1.6 MB', true, 'v1.1'),
('11111111-1111-1111-1111-111111111111', 'Procurement Counter-Tactics & Give-Get Matrix', 'Deal Architecture', 'PDF', '890 KB', true, 'v3.0'),
('11111111-1111-1111-1111-111111111111', 'Executive Board Strategic Alignment Briefing', 'Executive Memo', 'PDF', '640 KB', true, 'v1.0');
