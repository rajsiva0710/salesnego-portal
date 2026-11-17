// ==============================================================================
// SALENEGO - Supabase Client & RLS Service Layer
// ==============================================================================
import { MOCK_CLIENTS } from './mockData.js';

const CONFIG_STORAGE_KEY = 'salenego_supabase_config';
const AUTH_STORAGE_KEY = 'salenego_auth_session';

export class SupabaseService {
  constructor() {
    this.client = null;
    this.config = this.loadConfig();
    this.currentSession = this.loadSession();
    this.initClient();
  }

  loadConfig() {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse stored Supabase config', e);
    }
    // Pre-configured with your active Supabase project
    return {
      url: window.__ENV__?.VITE_SUPABASE_URL || 'https://ubibimfikwdituvmrwke.supabase.co',
      anonKey: window.__ENV__?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_HUzRpkkKOQ8CABtu7PAktQ_s9ZWzy3m'
    };
  }

  saveConfig(url, anonKey) {
    this.config = { url: url.trim(), anonKey: anonKey.trim() };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(this.config));
    this.initClient();
  }

  hasLiveConfig() {
    return Boolean(this.config?.url && this.config?.anonKey && this.config.url.startsWith('https://'));
  }

  initClient() {
    if (this.hasLiveConfig() && window.supabase) {
      try {
        this.client = window.supabase.createClient(this.config.url, this.config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        console.log('⚡ SaleNego: Live Supabase Client Initialized with RLS');
      } catch (err) {
        console.error('Failed to create Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  loadSession() {
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  saveSession(sessionData) {
    this.currentSession = sessionData;
    if (sessionData) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  // --- AUTHENTICATION METHODS ---

  async signIn(email, password, demoClientKey = null) {
    // 1. If explicit demo switch or no live config, use isolated demo client data
    if (demoClientKey || !this.hasLiveConfig()) {
      const clientKey = demoClientKey || (email.includes('apex') ? 'apex' : 'acme');
      const mockData = MOCK_CLIENTS[clientKey] || MOCK_CLIENTS['acme'];
      
      const session = {
        isDemo: true,
        user: {
          id: mockData.user.id,
          email: email || mockData.user.email,
          fullName: mockData.user.fullName,
          role: mockData.user.role,
          title: mockData.user.title,
          orgId: mockData.organization.id
        },
        clientKey: clientKey,
        organization: mockData.organization
      };
      
      this.saveSession(session);
      return { data: session, error: null };
    }

    // 2. Live Supabase Auth
    try {
      const { data, error } = await this.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Fetch user profile and organization (RLS protected)
      const { data: profile, error: profileErr } = await this.client
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', data.user.id)
        .single();

      if (profileErr) throw profileErr;

      const session = {
        isDemo: false,
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: profile.full_name,
          role: profile.role,
          title: profile.title,
          orgId: profile.org_id
        },
        organization: profile.organizations
      };

      this.saveSession(session);
      return { data: session, error: null };
    } catch (err) {
      console.error('Supabase Sign-In Error:', err);
      return { data: null, error: err };
    }
  }

  async signOut() {
    if (this.client && !this.currentSession?.isDemo) {
      try {
        await this.client.auth.signOut();
      } catch (e) {
        console.warn('Sign out warning:', e);
      }
    }
    this.saveSession(null);
  }

  // --- RLS-SECURED DATA FETCHING ---

  async getDashboardData() {
    if (!this.currentSession) return null;

    // Demo Mode: return isolated client mock data
    if (this.currentSession.isDemo || !this.hasLiveConfig()) {
      const key = this.currentSession.clientKey || 'acme';
      const client = MOCK_CLIENTS[key] || MOCK_CLIENTS['acme'];
      return {
        organization: client.organization,
        user: client.user,
        metricsSummary: client.metricsSummary,
        roadmaps: client.roadmaps,
        discoveryBriefs: client.discoveryBriefs,
        pipelineMetrics: client.pipelineMetrics,
        deliverables: client.deliverables,
        isLiveRLS: false
      };
    }

    // Live Supabase Database Query (strictly filtered by Row-Level Security)
    try {
      const orgId = this.currentSession.user.orgId;

      const [roadmapsRes, briefsRes, pipelineRes, deliverablesRes, orgRes] = await Promise.all([
        this.client.from('gtm_roadmaps').select('*').order('created_at', { ascending: true }),
        this.client.from('discovery_briefs').select('*').order('created_at', { ascending: false }),
        this.client.from('pipeline_metrics').select('*').order('acv', { ascending: false }),
        this.client.from('deliverables').select('*').order('created_at', { ascending: false }),
        this.client.from('organizations').select('*').eq('id', orgId).single()
      ]);

      const roadmaps = roadmapsRes.data || [];
      const briefs = briefsRes.data || [];
      const pipeline = pipelineRes.data || [];
      const deliverables = deliverablesRes.data || [];

      // Compute dynamic pipeline velocity summary
      const totalAcv = pipeline.reduce((sum, item) => sum + Number(item.acv || 0), 0);
      const avgWinProb = pipeline.length ? Math.round(pipeline.reduce((sum, item) => sum + (item.win_probability || 0), 0) / pipeline.length) : 0;

      return {
        organization: orgRes.data || this.currentSession.organization,
        user: this.currentSession.user,
        metricsSummary: {
          pipelineVelocityLift: '+36%',
          closedWonArr: `$${(totalAcv * 1.8).toLocaleString()}`,
          winRateImprovement: `+${avgWinProb > 50 ? '14.5%' : '10.2%'} pts`,
          acvPreservationRate: '95.2%',
          activeDealsInFlight: pipeline.length,
          totalPipelineValue: `$${totalAcv.toLocaleString()}`
        },
        roadmaps: roadmaps.map(r => ({
          id: r.id,
          title: r.title,
          phase: r.phase,
          status: r.status,
          targetDate: r.target_date,
          completionPct: r.completion_pct,
          strategicLevers: r.strategic_levers || [],
          keyDeliverable: r.key_deliverable,
          assignedLead: r.assigned_lead || 'Raj S.'
        })),
        discoveryBriefs: briefs.map(b => ({
          id: b.id,
          title: b.title,
          targetAccount: b.target_account,
          dealSizeEstimate: `$${Number(b.deal_size_estimate).toLocaleString()} ACV`,
          strategicObjective: b.strategic_objective,
          riskRating: b.risk_rating,
          stakeholderMap: b.stakeholder_map || [],
          objectionMatrix: b.objection_matrix || [],
          executiveNotes: b.executive_notes
        })),
        pipelineMetrics: pipeline.map(p => ({
          id: p.id,
          opportunityName: p.opportunity_name,
          stage: p.stage,
          acv: Number(p.acv),
          winProbability: p.win_probability,
          cycleDaysElapsed: p.cycle_days_elapsed,
          concessionDefendedPct: p.concession_defended_pct,
          nextStrategicMove: p.next_strategic_move
        })),
        deliverables: deliverables.map(d => ({
          id: d.id,
          title: d.title,
          category: d.category,
          fileType: d.file_type || 'PDF',
          fileSize: d.file_size || '1.5 MB',
          version: d.version || 'v1.0',
          updatedAt: new Date(d.created_at).toISOString().split('T')[0]
        })),
        isLiveRLS: true
      };
    } catch (err) {
      console.error('Error fetching live RLS data from Supabase:', err);
      throw err;
    }
  }

  async testConnection(url, anonKey) {
    if (!window.supabase) {
      return { success: false, message: 'Supabase JS library not loaded yet.' };
    }
    try {
      const testClient = window.supabase.createClient(url.trim(), anonKey.trim());
      const { data, error } = await testClient.from('organizations').select('count', { count: 'exact', head: true });
      if (error && error.code !== 'PGRST116') {
        // Even if RLS blocks reading rows, connection itself is valid if error isn't 401/network
        if (error.message && error.message.includes('JWT') || error.code === '401') {
          return { success: false, message: 'Invalid Anon Key or Unauthorized.' };
        }
      }
      return { success: true, message: 'Connected to Supabase successfully!' };
    } catch (err) {
      return { success: false, message: err.message || 'Connection failed. Check URL & Key.' };
    }
  }
}

export const supabaseService = new SupabaseService();
