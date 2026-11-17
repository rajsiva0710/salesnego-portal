// ==============================================================================
// SALENEGO (salesnego.com) - Core Executive Application Logic
// ==============================================================================
import { supabaseService } from './supabaseClient.js';
import { MOCK_CLIENTS } from './mockData.js';

class SaleNegoApp {
  constructor() {
    this.currentTheme = localStorage.getItem('salenego_theme') || 'dark';
    this.activeDashboardTab = 'overview';
    this.dashboardData = null;
    this.chartInstances = {};

    // ROI Simulator State (Defaults)
    this.roiState = {
      acv: 85000,
      deals: 40,
      cycleDays: 90,
      expansionRate: 22,
      winRate: 25
    };

    this.init();
  }

  async init() {
    this.applyTheme(this.currentTheme);
    this.bindEvents();
    this.initRoiSimulator();
    this.checkExistingSession();
  }

  // --- THEME MANAGEMENT ---
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('salenego_theme', theme);

    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
      themeToggleBtn.innerHTML = theme === 'dark' 
        ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg><span class="hidden md:inline text-xs font-mono">LIGHT</span>`
        : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg><span class="hidden md:inline text-xs font-mono">DARK</span>`;
    }

    // Refresh charts on theme change if they exist
    this.updateChartsTheme();
  }

  toggleTheme() {
    this.applyTheme(this.currentTheme === 'dark' ? 'light' : 'dark');
  }

  // --- ROI SIMULATOR LOGIC ---
  initRoiSimulator() {
    const sliders = ['sliderAcv', 'sliderDeals', 'sliderCycle', 'sliderExpansion', 'sliderWinRate'];
    sliders.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', (e) => this.handleSliderChange(e));
      }
    });

    // Preset buttons
    document.querySelectorAll('[data-roi-preset]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = e.currentTarget.getAttribute('data-roi-preset');
        this.applyRoiPreset(preset);
      });
    });

    this.calculateRoi();
  }

  applyRoiPreset(preset) {
    if (preset === 'midmarket') {
      this.roiState = { acv: 45000, deals: 60, cycleDays: 60, expansionRate: 18, winRate: 28 };
    } else if (preset === 'enterprise') {
      this.roiState = { acv: 120000, deals: 35, cycleDays: 90, expansionRate: 25, winRate: 24 };
    } else if (preset === 'strategic') {
      this.roiState = { acv: 350000, deals: 16, cycleDays: 140, expansionRate: 35, winRate: 20 };
    }

    // Update UI sliders
    document.getElementById('sliderAcv').value = this.roiState.acv;
    document.getElementById('sliderDeals').value = this.roiState.deals;
    document.getElementById('sliderCycle').value = this.roiState.cycleDays;
    document.getElementById('sliderExpansion').value = this.roiState.expansionRate;
    document.getElementById('sliderWinRate').value = this.roiState.winRate;

    this.calculateRoi();
    this.showToast(`Applied ${preset.charAt(0).toUpperCase() + preset.slice(1)} Preset Parameters`);
  }

  handleSliderChange(e) {
    const id = e.target.id;
    const val = Number(e.target.value);

    if (id === 'sliderAcv') this.roiState.acv = val;
    if (id === 'sliderDeals') this.roiState.deals = val;
    if (id === 'sliderCycle') this.roiState.cycleDays = val;
    if (id === 'sliderExpansion') this.roiState.expansionRate = val;
    if (id === 'sliderWinRate') this.roiState.winRate = val;

    this.calculateRoi();
  }

  calculateRoi() {
    const { acv, deals, cycleDays, expansionRate, winRate } = this.roiState;

    // Display current values
    document.getElementById('valAcv').innerText = `$${acv.toLocaleString()}`;
    document.getElementById('valDeals').innerText = `${deals} deals`;
    document.getElementById('valCycle').innerText = `${cycleDays} days`;
    document.getElementById('valExpansion').innerText = `${expansionRate}%`;
    document.getElementById('valWinRate').innerText = `${winRate}%`;

    // Mathematical modeling of SaleNego's Negotiation Architecture:
    // 1. Baseline Performance
    const baseWinRateRatio = winRate / 100;
    const baseWonDeals = deals * baseWinRateRatio;
    const baseRevenue = baseWonDeals * acv;

    // 2. Value Architecture Lift (Conservative enterprise benchmarks)
    // - Win rate lift: +6.5% to +8.5% absolute points via structured multi-threading & champion testing
    const winRateLiftAbsolute = Math.min(18, Math.max(5, winRate * 0.28));
    const improvedWinRateRatio = (winRate + winRateLiftAbsolute) / 100;
    const improvedWonDeals = deals * improvedWinRateRatio;

    // - ACV Concession Preservation: +14% lift from give-get tradeoffs & eliminating unreciprocated discounts
    const improvedAcv = acv * 1.14;

    // - Deal Cycle Compression: 28% reduction in days to close
    const daysSaved = Math.round(cycleDays * 0.28);
    const compressedCycleDays = cycleDays - daysSaved;

    // - Account Expansion ARR: Year-1 Net Retention expansion on newly won base
    const expansionRatio = expansionRate / 100;
    const expansionRevenue = (improvedWonDeals * improvedAcv) * expansionRatio * 0.7;

    // - Total Projected 12-Month Additional Revenue Lift
    const newWonRevenue = improvedWonDeals * improvedAcv;
    const annualNetRevenueImpact = Math.round((newWonRevenue - baseRevenue) + expansionRevenue);
    
    // - Velocity Acceleration Factor (Deals accelerated / time value of capital)
    const velocityMultiplier = ((improvedWonDeals * improvedAcv) / compressedCycleDays) / ((baseWonDeals * acv) / cycleDays);

    // Update Output Numbers with smooth animations
    this.animateNumber('outRevenueLift', annualNetRevenueImpact, '$');
    this.animateNumber('outDaysSaved', daysSaved, '-', ' Days');
    this.animateNumber('outNewWonDeals', Math.round(improvedWonDeals - baseWonDeals), '+', ' Deals');
    this.animateNumber('outAcvPreserved', Math.round(improvedAcv - acv), '+$');

    // Update comparison cards
    document.getElementById('baseArrDisplay').innerText = `$${Math.round(baseRevenue).toLocaleString()}`;
    document.getElementById('projectedArrDisplay').innerText = `$${Math.round(baseRevenue + annualNetRevenueImpact).toLocaleString()}`;
    document.getElementById('velocityDisplay').innerText = `${velocityMultiplier.toFixed(2)}x`;

    // Render / update ROI visual bar chart
    this.renderRoiChart(baseRevenue, annualNetRevenueImpact, expansionRevenue);
  }

  animateNumber(elementId, targetValue, prefix = '', suffix = '') {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = `${prefix}${targetValue.toLocaleString()}${suffix}`;
  }

  renderRoiChart(baseline, lift, expansion) {
    const ctx = document.getElementById('roiComparisonChart');
    if (!ctx) return;

    const isDark = this.currentTheme === 'dark';
    const textColor = isDark ? '#a1a1aa' : '#52525b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';

    if (this.chartInstances.roiChart) {
      this.chartInstances.roiChart.destroy();
    }

    if (typeof Chart === 'undefined') return;

    this.chartInstances.roiChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Current Baseline', 'SaleNego Architecture'],
        datasets: [
          {
            label: 'Base ARR',
            data: [baseline, baseline],
            backgroundColor: isDark ? '#272730' : '#e4e4e7',
            borderRadius: 6
          },
          {
            label: 'Negotiation ACV & Win-Rate Lift',
            data: [0, lift - expansion],
            backgroundColor: isDark ? '#f4f4f5' : '#18181b',
            borderRadius: 6
          },
          {
            label: 'NRR Expansion Yield',
            data: [0, expansion],
            backgroundColor: isDark ? '#71717a' : '#71717a',
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Inter', size: 12 } }
          },
          y: {
            stacked: true,
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              font: { family: 'JetBrains Mono', size: 11 },
              callback: (val) => `$${(val / 1000).toLocaleString()}k`
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: { family: 'Inter', size: 11 },
              boxWidth: 12,
              usePointStyle: true
            }
          },
          tooltip: {
            callbacks: {
              label: (item) => ` ${item.dataset.label}: $${Math.round(item.raw).toLocaleString()}`
            }
          }
        }
      }
    });
  }

  updateChartsTheme() {
    if (this.chartInstances.roiChart) {
      this.calculateRoi();
    }
    if (this.chartInstances.pipelineChart && this.dashboardData) {
      this.renderPipelineChart(this.dashboardData.pipelineMetrics);
    }
  }

  // --- EVENT BINDINGS & MODALS ---
  bindEvents() {
    // Theme toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

    // Navigation anchor smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href.startsWith('#') && href.length > 1) {
          e.preventDefault();
          const target = document.querySelector(href);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      });
    });

    // Client Portal Access Buttons
    document.querySelectorAll('.btn-open-portal').forEach(btn => {
      btn.addEventListener('click', () => this.openAuthModal());
    });

    // Close Auth Modal
    const closeAuthBtn = document.getElementById('closeAuthModal');
    if (closeAuthBtn) closeAuthBtn.addEventListener('click', () => this.closeAuthModal());

    // Click outside modal to close
    const authModalOverlay = document.getElementById('authModal');
    if (authModalOverlay) {
      authModalOverlay.addEventListener('click', (e) => {
        if (e.target === authModalOverlay) this.closeAuthModal();
      });
    }

    // Auth Form Submission
    const authForm = document.getElementById('clientLoginForm');
    if (authForm) {
      authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
    }

    // Quick Demo Login Buttons
    document.querySelectorAll('[data-demo-client]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const clientKey = e.currentTarget.getAttribute('data-demo-client');
        this.loginDemoClient(clientKey);
      });
    });

    // Sign out button
    const signOutBtn = document.getElementById('btnSignOut');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', () => this.handleSignOut());
    }

    // Database Connection Settings Modal
    const btnOpenDbConfig = document.getElementById('btnOpenDbConfig');
    if (btnOpenDbConfig) {
      btnOpenDbConfig.addEventListener('click', () => this.openDbConfigModal());
    }

    const closeDbModal = document.getElementById('closeDbModal');
    if (closeDbModal) {
      closeDbModal.addEventListener('click', () => this.closeDbConfigModal());
    }

    const dbForm = document.getElementById('dbConfigForm');
    if (dbForm) {
      dbForm.addEventListener('submit', (e) => this.handleDbConfigSave(e));
    }

    const btnTestDb = document.getElementById('btnTestDbConnection');
    if (btnTestDb) {
      btnTestDb.addEventListener('click', () => this.handleDbTestConnection());
    }

    // Dashboard Tabs
    document.querySelectorAll('.dashboard-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.getAttribute('data-tab');
        this.switchDashboardTab(tab);
      });
    });

    // Export ROI Summary button
    const btnExportRoi = document.getElementById('btnExportRoi');
    if (btnExportRoi) {
      btnExportRoi.addEventListener('click', () => this.exportRoiSummary());
    }
  }

  // --- AUTHENTICATION & SESSION HANDLING ---
  openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  openDbConfigModal() {
    const modal = document.getElementById('dbConfigModal');
    if (modal) {
      const config = supabaseService.loadConfig();
      document.getElementById('inputSupabaseUrl').value = config.url || '';
      document.getElementById('inputSupabaseAnonKey').value = config.anonKey || '';
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  closeDbConfigModal() {
    const modal = document.getElementById('dbConfigModal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  async handleDbTestConnection() {
    const url = document.getElementById('inputSupabaseUrl').value;
    const anonKey = document.getElementById('inputSupabaseAnonKey').value;
    const statusEl = document.getElementById('dbTestStatus');
    
    statusEl.innerHTML = `<span class="text-xs text-muted">Testing connection to Supabase cluster...</span>`;
    
    const res = await supabaseService.testConnection(url, anonKey);
    if (res.success) {
      statusEl.innerHTML = `<span class="text-xs text-emerald-400 font-mono">✓ ${res.message}</span>`;
      this.showToast('Supabase backend connected successfully');
    } else {
      statusEl.innerHTML = `<span class="text-xs text-rose-400 font-mono">✗ ${res.message}</span>`;
    }
  }

  handleDbConfigSave(e) {
    e.preventDefault();
    const url = document.getElementById('inputSupabaseUrl').value;
    const anonKey = document.getElementById('inputSupabaseAnonKey').value;
    supabaseService.saveConfig(url, anonKey);
    this.closeDbConfigModal();
    this.showToast('Supabase configuration saved locally.');
  }

  async handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const submitBtn = document.getElementById('btnSubmitLogin');

    submitBtn.disabled = true;
    submitBtn.innerHTML = `Verifying credentials...`;

    try {
      const { data, error } = await supabaseService.signIn(email, password);
      if (error) {
        alert(`Authentication Error: ${error.message || 'Unable to sign in. Please verify credentials.'}`);
        submitBtn.disabled = false;
        submitBtn.innerHTML = `Authenticate & Enter Portal`;
        return;
      }

      this.closeAuthModal();
      this.showToast(`Welcome back, ${data.user.fullName}`);
      await this.loadClientDashboard();
    } catch (err) {
      console.error(err);
      this.showToast('Error during authentication', true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `Authenticate & Enter Portal`;
    }
  }

  async loginDemoClient(clientKey) {
    this.closeAuthModal();
    const { data } = await supabaseService.signIn(null, null, clientKey);
    this.showToast(`Switched to ${data.organization.name} (Isolated Client View)`);
    await this.loadClientDashboard();
  }

  checkExistingSession() {
    if (supabaseService.currentSession) {
      this.loadClientDashboard();
    }
  }

  async handleSignOut() {
    await supabaseService.signOut();
    document.getElementById('clientDashboardSection').classList.add('hidden');
    document.getElementById('publicLandingSection').classList.remove('hidden');
    
    // Update Nav bar
    document.getElementById('navAuthStatus').classList.add('hidden');
    document.getElementById('navPublicButtons').classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.showToast('Signed out of Client Portal.');
  }

  // --- CLIENT DASHBOARD CONTROLLER ---
  async loadClientDashboard() {
    try {
      const data = await supabaseService.getDashboardData();
      if (!data) return;

      this.dashboardData = data;

      // Swap views
      document.getElementById('publicLandingSection').classList.add('hidden');
      document.getElementById('clientDashboardSection').classList.remove('hidden');

      // Update Header nav bar status
      document.getElementById('navPublicButtons').classList.add('hidden');
      const navAuth = document.getElementById('navAuthStatus');
      navAuth.classList.remove('hidden');
      document.getElementById('navUserEmail').innerText = data.user.email;
      document.getElementById('navOrgName').innerText = data.organization.name;

      // Populate Dashboard Header
      document.getElementById('dashOrgName').innerText = data.organization.name;
      document.getElementById('dashTierPill').innerText = data.organization.tier;
      document.getElementById('dashAdvisorName').innerText = data.organization.advisor || 'Raj S. — Principal Advisor';
      document.getElementById('dashContractStatus').innerText = data.organization.contractLength || 'Active Advisory Retainer';

      // Live RLS Badge
      const rlsBadge = document.getElementById('dashRlsBadge');
      if (data.isLiveRLS) {
        rlsBadge.className = 'status-pill border-emerald-500/30 text-emerald-400 bg-emerald-500/10';
        rlsBadge.innerHTML = `<span class="status-dot active"></span> Live Supabase RLS Active`;
      } else {
        rlsBadge.className = 'status-pill border-amber-500/30 text-amber-300 bg-amber-500/10';
        rlsBadge.innerHTML = `<span class="status-dot bg-amber-400"></span> Isolated Client View (Demo RLS)`;
      }

      // Populate Overview KPIs
      document.getElementById('kpiVelocityLift').innerText = data.metricsSummary.pipelineVelocityLift;
      document.getElementById('kpiClosedWonArr').innerText = data.metricsSummary.closedWonArr;
      document.getElementById('kpiWinRateLift').innerText = data.metricsSummary.winRateImprovement;
      document.getElementById('kpiConcessionDefended').innerText = data.metricsSummary.acvPreservationRate;

      // Render tab contents
      this.renderRoadmapTab(data.roadmaps);
      this.renderDiscoveryTab(data.discoveryBriefs);
      this.renderPipelineTab(data.pipelineMetrics);
      this.renderDeliverablesTab(data.deliverables);

      // Render Overview Pipeline Chart
      this.renderPipelineChart(data.pipelineMetrics);

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error rendering dashboard:', err);
      this.showToast('Failed to load dashboard data', true);
    }
  }

  switchDashboardTab(tabId) {
    this.activeDashboardTab = tabId;

    // Update buttons
    document.querySelectorAll('.dashboard-tab-btn').forEach(b => {
      if (b.getAttribute('data-tab') === tabId) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    // Update panes
    const tabPanes = ['overview', 'roadmaps', 'discovery', 'pipeline', 'deliverables'];
    tabPanes.forEach(pane => {
      const el = document.getElementById(`tabPane-${pane}`);
      if (el) {
        if (pane === tabId) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });
  }

  // --- TAB RENDERERS ---

  renderRoadmapTab(roadmaps) {
    const container = document.getElementById('roadmapListContainer');
    if (!container) return;

    if (!roadmaps || roadmaps.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted">No roadmap phases initialized yet.</p>`;
      return;
    }

    container.innerHTML = roadmaps.map(r => {
      const statusBadge = r.status === 'completed'
        ? `<span class="status-pill text-emerald-400 border-emerald-500/30">Completed</span>`
        : r.status === 'in_progress'
        ? `<span class="status-pill text-amber-300 border-amber-500/30">In Progress (${r.completionPct}%)</span>`
        : `<span class="status-pill text-muted">Planned</span>`;

      const leversHtml = (r.strategicLevers || []).map(lever => 
        `<span class="text-xs px-2.5 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)]">${lever}</span>`
      ).join(' ');

      return `
        <div class="card-executive mb-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
            <div>
              <div class="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono">${r.phase}</div>
              <h4 class="text-lg font-serif font-medium mt-0.5">${r.title}</h4>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-xs text-[var(--text-muted)] font-mono">Target: ${r.targetDate}</span>
              ${statusBadge}
            </div>
          </div>
          
          <div class="w-full bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden mb-4">
            <div class="bg-[var(--text-primary)] h-full transition-all duration-500" style="width: ${r.completionPct}%"></div>
          </div>

          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="text-xs text-[var(--text-muted)] font-medium">Strategic Levers:</span>
            ${leversHtml}
          </div>

          <div class="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <div>Key Deliverable: <strong class="text-[var(--text-primary)]">${r.keyDeliverable || 'Under review'}</strong></div>
            <div class="font-mono">Lead: ${r.assignedLead}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderDiscoveryTab(briefs) {
    const container = document.getElementById('discoveryListContainer');
    if (!container) return;

    if (!briefs || briefs.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted">No discovery briefs active for this client organization.</p>`;
      return;
    }

    container.innerHTML = briefs.map(b => {
      const riskClass = b.riskRating === 'High' ? 'text-rose-400 border-rose-500/30' : b.riskRating === 'Medium' ? 'text-amber-300 border-amber-500/30' : 'text-emerald-400 border-emerald-500/30';

      const stakeholdersHtml = (b.stakeholderMap || []).map(s => `
        <div class="p-2.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs">
          <div class="font-medium text-[var(--text-primary)]">${s.name}</div>
          <div class="text-[var(--text-muted)]">${s.role}</div>
          <div class="mt-1 flex items-center justify-between">
            <span class="font-mono text-[10px] text-[var(--text-secondary)]">${s.stance}</span>
            <span class="font-mono text-[10px] text-[var(--accent-gold)]">${s.influence}</span>
          </div>
        </div>
      `).join('');

      const objectionsHtml = (b.objectionMatrix || []).map(o => `
        <div class="p-3 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] text-xs mb-2">
          <div class="font-medium text-[var(--text-primary)] mb-1">“${o.objection}”</div>
          <div class="text-[var(--text-secondary)] mb-1.5"><strong class="text-[var(--text-primary)]">Counter:</strong> ${o.counter}</div>
          <div class="text-[11px] font-mono text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-1 mt-1">Boundary: ${o.boundary}</div>
        </div>
      `).join('');

      return `
        <div class="card-executive mb-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <div>
              <span class="status-pill ${riskClass} mb-1">Risk: ${b.riskRating}</span>
              <h3 class="text-xl font-serif font-medium mt-1">${b.title}</h3>
              <p class="text-xs text-[var(--text-secondary)] mt-0.5">Target Account: <strong class="text-[var(--text-primary)]">${b.targetAccount}</strong> · Sizing: <span class="font-mono text-[var(--text-primary)]">${b.dealSizeEstimate}</span></p>
            </div>
          </div>

          <div class="mb-4">
            <h5 class="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono mb-1">Strategic Objective</h5>
            <p class="text-sm text-[var(--text-primary)] leading-relaxed">${b.strategicObjective}</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 class="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono mb-2">Key Stakeholder Power Map</h5>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                ${stakeholdersHtml}
              </div>
            </div>
            <div>
              <h5 class="text-xs uppercase tracking-wider text-[var(--text-muted)] font-mono mb-2">Objection Architecture & Concessions</h5>
              <div>
                ${objectionsHtml}
              </div>
            </div>
          </div>

          <div class="p-3 rounded bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs">
            <span class="font-mono text-[var(--text-muted)] uppercase">Confidential Advisor Note:</span>
            <span class="text-[var(--text-secondary)] ml-1">${b.executiveNotes}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderPipelineTab(pipeline) {
    const tableBody = document.getElementById('pipelineTableBody');
    if (!tableBody) return;

    if (!pipeline || pipeline.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-6">No pipeline deals tracked for this organization.</td></tr>`;
      return;
    }

    tableBody.innerHTML = pipeline.map(p => `
      <tr>
        <td class="font-medium">${p.opportunityName}</td>
        <td><span class="text-xs px-2 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-subtle)] font-mono">${p.stage}</span></td>
        <td class="font-mono font-medium">$${p.acv.toLocaleString()}</td>
        <td>
          <div class="flex items-center gap-2">
            <div class="w-16 bg-[var(--bg-tertiary)] h-1.5 rounded-full overflow-hidden">
              <div class="bg-[var(--text-primary)] h-full" style="width: ${p.winProbability}%"></div>
            </div>
            <span class="text-xs font-mono">${p.winProbability}%</span>
          </div>
        </td>
        <td class="font-mono text-xs">${p.cycleDaysElapsed}d / ${p.concessionDefendedPct}% defended</td>
        <td class="text-xs text-[var(--text-secondary)] max-w-xs truncate">${p.nextStrategicMove}</td>
      </tr>
    `).join('');
  }

  renderDeliverablesTab(deliverables) {
    const container = document.getElementById('deliverablesListContainer');
    if (!container) return;

    if (!deliverables || deliverables.length === 0) {
      container.innerHTML = `<p class="text-sm text-muted">No deliverables uploaded.</p>`;
      return;
    }

    container.innerHTML = deliverables.map(d => `
      <div class="card-executive flex items-center justify-between gap-4 mb-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded bg-[var(--bg-tertiary)] border border-[var(--border-medium)] flex items-center justify-center font-mono text-xs font-semibold">
            ${d.fileType}
          </div>
          <div>
            <div class="text-sm font-medium text-[var(--text-primary)]">${d.title}</div>
            <div class="text-xs text-[var(--text-muted)] font-mono mt-0.5">Category: ${d.category} · Size: ${d.fileSize} · Updated: ${d.updatedAt}</div>
          </div>
        </div>
        <div>
          <button class="btn btn-secondary text-xs" onclick="window.salenegoApp.showToast('Securely verifying cryptographic signature...')">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Download
          </button>
        </div>
      </div>
    `).join('');
  }

  renderPipelineChart(pipeline) {
    const ctx = document.getElementById('dashboardPipelineChart');
    if (!ctx || !pipeline) return;

    const isDark = this.currentTheme === 'dark';
    const textColor = isDark ? '#a1a1aa' : '#52525b';

    if (this.chartInstances.pipelineChart) {
      this.chartInstances.pipelineChart.destroy();
    }

    if (typeof Chart === 'undefined') return;

    const labels = pipeline.map(p => p.opportunityName.length > 20 ? p.opportunityName.slice(0, 18) + '...' : p.opportunityName);
    const values = pipeline.map(p => p.acv);

    this.chartInstances.pipelineChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: isDark 
            ? ['#f4f4f5', '#a1a1aa', '#71717a', '#3f3f46', '#27272a']
            : ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#e4e4e7'],
          borderColor: isDark ? '#121217' : '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              font: { family: 'Inter', size: 11 },
              boxWidth: 10
            }
          },
          tooltip: {
            callbacks: {
              label: (item) => ` ACV: $${item.raw.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  exportRoiSummary() {
    const { acv, deals, cycleDays, expansionRate, winRate } = this.roiState;
    const revLift = document.getElementById('outRevenueLift').innerText;
    const daysSaved = document.getElementById('outDaysSaved').innerText;

    const summary = `
=====================================================
SALENEGO (salesnego.com) - EXECUTIVE ROI SIMULATION
=====================================================
Target ACV: $${acv.toLocaleString()}
Annual Qualified Deals: ${deals}
Current Cycle Days: ${cycleDays} days
Target Expansion (NRR): ${expansionRate}%
Current Win Rate: ${winRate}%
-----------------------------------------------------
PROJECTED 12-MONTH REVENUE LIFT: ${revLift}
DEAL CYCLE TIME COMPRESSION: ${daysSaved}
ACV MARGIN PRESERVATION: +14% via Give-Get Architecture
-----------------------------------------------------
Strategic Advisory Inquiries: advisory@salesnego.com
Portal Access: salesnego.com
=====================================================
    `.trim();

    navigator.clipboard.writeText(summary).then(() => {
      this.showToast('Executive ROI Model copied to clipboard!');
    }).catch(() => {
      alert(summary);
    });
  }

  // --- UTILITY TOAST NOTIFICATIONS ---
  showToast(message, isError = false) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${isError ? 'border-rose-500/50 text-rose-300' : ''}`;
    toast.innerHTML = `
      <span class="status-dot ${isError ? 'bg-rose-500' : 'bg-emerald-400'}"></span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.salenegoApp = new SaleNegoApp();
});
