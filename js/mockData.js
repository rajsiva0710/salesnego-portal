// ==============================================================================
// SALENEGO - Mock Client Database for Seamless Offline & Demo Testing
// ==============================================================================
// Strictly mirrors the Supabase PostgreSQL schema with RLS data isolation.

export const MOCK_CLIENTS = {
  // CLIENT 1: Acme Enterprise Solutions
  'acme': {
    organization: {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Acme Enterprise Solutions',
      slug: 'acme-enterprise',
      domain: 'acme.com',
      tier: 'Enterprise Advisory',
      status: 'active',
      advisor: 'Raj S. — Principal Advisor',
      contractLength: '12-Month Retainer',
      securityLevel: 'Restricted Executive RLS'
    },
    user: {
      id: 'usr_acme_ceo_001',
      email: 'client@acme.com',
      fullName: 'David Sterling',
      title: 'Chief Revenue Officer',
      role: 'client_admin',
      orgId: '11111111-1111-1111-1111-111111111111'
    },
    metricsSummary: {
      pipelineVelocityLift: '+38%',
      closedWonArr: '$3,840,000',
      winRateImprovement: '+14.2% pts',
      acvPreservationRate: '94.8%',
      activeDealsInFlight: 4,
      totalPipelineValue: '$1,180,000'
    },
    roadmaps: [
      {
        id: 'rd_acme_1',
        title: 'Enterprise Margin Leakage & Concession Audit',
        phase: 'Phase 1: Deal Audit',
        status: 'completed',
        targetDate: '2026-09-30',
        completionPct: 100,
        strategicLevers: ['Discounting Floor Governance', 'Historical Win/Loss Analysis', 'Margin Recovery Protocol'],
        keyDeliverable: 'Margin Diagnostic Whitepaper (Delivered)',
        assignedLead: 'Raj S.'
      },
      {
        id: 'rd_acme_2',
        title: 'Multi-Threaded Negotiation Architecture',
        phase: 'Phase 2: Negotiation Architecture',
        status: 'in_progress',
        targetDate: '2026-11-30',
        completionPct: 75,
        strategicLevers: ['Economic Buyer Alignment Matrix', 'Give-Get Concession Tradeoffs', 'Procurement Counter-Tactics'],
        keyDeliverable: 'Custom Negotiation Playbook v2.4',
        assignedLead: 'Raj S.'
      },
      {
        id: 'rd_acme_3',
        title: 'Tier-1 Deal Desk Shadowing & War Room',
        phase: 'Phase 3: Live War Room',
        status: 'in_progress',
        targetDate: '2026-12-20',
        completionPct: 40,
        strategicLevers: ['Live Call Preparation', 'Term Sheet Restructuring', 'Contract Redline Guidance'],
        keyDeliverable: 'Active Deal War Room Protocol',
        assignedLead: 'Raj S.'
      },
      {
        id: 'rd_acme_4',
        title: 'Strategic Expansion & NRR Maximization',
        phase: 'Phase 4: Land-and-Expand',
        status: 'planned',
        targetDate: '2027-02-15',
        completionPct: 0,
        strategicLevers: ['Year-1 Renewal Trajectory', 'Multi-Year Escalator Clauses', 'Executive QBR Scripting'],
        keyDeliverable: 'NRR Acceleration Framework',
        assignedLead: 'Raj S.'
      }
    ],
    discoveryBriefs: [
      {
        id: 'db_acme_1',
        title: 'Global Tier-1 Banking Modernization',
        targetAccount: 'J.P. Morgan Chase & Co. / Asset Management',
        dealSizeEstimate: '$485,000 ACV',
        strategicObjective: 'Defend multi-year contract floor without conceding on SLA tier or software pricing multipliers.',
        riskRating: 'Medium',
        stakeholderMap: [
          { name: 'Marcus Vance', role: 'Chief Information Officer', stance: 'Champion', influence: 'Executive Sign-Off' },
          { name: 'Elena Rostova', role: 'Head of Global Procurement', stance: 'Aggressive Buyer', influence: 'Price Decider' },
          { name: 'David Cho', role: 'VP Infrastructure Engineering', stance: 'Technical Evaluator', influence: 'High Influence' }
        ],
        objectionMatrix: [
          {
            objection: 'Demanding 35% discount based on multi-year commitment',
            counter: 'Trade volume discount strictly for 3-year prepay and case study participation',
            boundary: 'Zero price concession without executive prepay and co-marketing agreement'
          },
          {
            objection: 'Procurement threatening alternative open-source wrapper RFP',
            counter: 'Quantify 14-month compliance delay & regulatory penalty exposure under non-certified alternatives',
            boundary: 'Anchor on audit-ready SOC2 Type II SLA liability transfer'
          }
        ],
        executiveNotes: 'Procurement sent standard RFP boilerplate. Do not respond with baseline rate cards. We have scheduled an executive alignment session with the CIO before the next formal pricing submission.'
      },
      {
        id: 'db_acme_2',
        title: 'European Core Platform Expansion',
        targetAccount: 'Barclays International',
        dealSizeEstimate: '$310,000 ACV',
        strategicObjective: 'Re-anchor expansion proposal on risk reduction rather than incremental seat additions.',
        riskRating: 'Low',
        stakeholderMap: [
          { name: 'Arthur Pendelton', role: 'VP Operations', stance: 'Supportive', influence: 'Operational Approver' },
          { name: 'Clara Oswald', role: 'Director of Compliance', stance: 'Neutral', influence: 'Regulatory Gatekeeper' }
        ],
        objectionMatrix: [
          {
            objection: 'Internal budget freeze until next fiscal Q2',
            counter: 'Deferred billing start with immediate deployment kickoff to avoid delivery backlog',
            boundary: 'Firm signed commitment required in current calendar quarter'
          }
        ],
        executiveNotes: 'Budget confirmed inside divisional contingency reserve. Position implementation delay as severe regulatory compliance exposure.'
      }
    ],
    pipelineMetrics: [
      {
        id: 'pm_acme_1',
        opportunityName: 'Global Tier-1 Banking Modernization',
        stage: 'Final Negotiation',
        acv: 485000,
        winProbability: 85,
        cycleDaysElapsed: 42,
        concessionDefendedPct: 94,
        nextStrategicMove: 'Executive sponsor check-in and concession matrix finalization'
      },
      {
        id: 'pm_acme_2',
        opportunityName: 'European Core Platform Expansion',
        stage: 'Executive Alignment',
        acv: 310000,
        winProbability: 70,
        cycleDaysElapsed: 28,
        concessionDefendedPct: 100,
        nextStrategicMove: 'Deliver risk-reduction economic model to VP Ops'
      },
      {
        id: 'pm_acme_3',
        opportunityName: 'Nordic Commercial Bank Deployment',
        stage: 'Value Architecture',
        acv: 225000,
        winProbability: 60,
        cycleDaysElapsed: 19,
        concessionDefendedPct: 100,
        nextStrategicMove: 'Technical feasibility sign-off with enterprise architect'
      },
      {
        id: 'pm_acme_4',
        opportunityName: 'APAC Wealth Management Pilot',
        stage: 'Discovery',
        acv: 160000,
        winProbability: 45,
        cycleDaysElapsed: 12,
        concessionDefendedPct: 100,
        nextStrategicMove: 'Champion identification and business pain quantification'
      }
    ],
    deliverables: [
      {
        id: 'dl_acme_1',
        title: 'SaleNego Enterprise Negotiation Playbook v2.4',
        category: 'Playbook',
        fileType: 'PDF',
        fileSize: '2.8 MB',
        version: 'v2.4',
        updatedAt: '2026-11-10'
      },
      {
        id: 'dl_acme_2',
        title: 'Acme Q4 Margin Leakage & Concession Audit',
        category: 'Diagnostic Report',
        fileType: 'PDF',
        fileSize: '1.6 MB',
        version: 'v1.1',
        updatedAt: '2026-10-28'
      },
      {
        id: 'dl_acme_3',
        title: 'Procurement Counter-Tactics & Give-Get Matrix',
        category: 'Deal Architecture',
        fileType: 'PDF',
        fileSize: '890 KB',
        version: 'v3.0',
        updatedAt: '2026-11-04'
      },
      {
        id: 'dl_acme_4',
        title: 'Executive Board Strategic Alignment Briefing',
        category: 'Executive Memo',
        fileType: 'PDF',
        fileSize: '640 KB',
        version: 'v1.0',
        updatedAt: '2026-10-15'
      }
    ]
  },

  // CLIENT 2: Apex Dynamics Global (Isolated Account)
  'apex': {
    organization: {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Apex Dynamics Global',
      slug: 'apex-dynamics',
      domain: 'apexdynamics.io',
      tier: 'Core Advisory',
      status: 'active',
      advisor: 'Raj S. — Principal Advisor',
      contractLength: '6-Month Engagement',
      securityLevel: 'Restricted Executive RLS'
    },
    user: {
      id: 'usr_apex_vp_002',
      email: 'vp@apexdynamics.io',
      fullName: 'Sarah Chen',
      title: 'VP of Global Enterprise Sales',
      role: 'client_admin',
      orgId: '22222222-2222-2222-2222-222222222222'
    },
    metricsSummary: {
      pipelineVelocityLift: '+29%',
      closedWonArr: '$1,920,000',
      winRateImprovement: '+11.8% pts',
      acvPreservationRate: '91.2%',
      activeDealsInFlight: 3,
      totalPipelineValue: '$675,000'
    },
    roadmaps: [
      {
        id: 'rd_apex_1',
        title: 'Commercial Deal Sizing & Packaging Diagnostic',
        phase: 'Phase 1: Packaging Diagnostic',
        status: 'completed',
        targetDate: '2026-10-15',
        completionPct: 100,
        strategicLevers: ['Value-Metric Realignment', 'Tiered Packaging Restructure'],
        keyDeliverable: 'Pricing & Packaging Matrix v1.2',
        assignedLead: 'Raj S.'
      },
      {
        id: 'rd_apex_2',
        title: 'Mid-Market to Enterprise Pivot Architecture',
        phase: 'Phase 2: Sales Velocity Engine',
        status: 'in_progress',
        targetDate: '2026-12-10',
        completionPct: 60,
        strategicLevers: ['Inbound Qualification Protocol', 'Executive Champion Testing', 'Competitive Fencing'],
        keyDeliverable: 'Enterprise Playbook v1.0',
        assignedLead: 'Raj S.'
      }
    ],
    discoveryBriefs: [
      {
        id: 'db_apex_1',
        title: 'Automated Logistics Fleet Optimization Deal',
        targetAccount: 'Maersk Supply Chain Operations',
        dealSizeEstimate: '$275,000 ACV',
        strategicObjective: 'Secure multi-region automated logistics rollout with structured scale triggers.',
        riskRating: 'High',
        stakeholderMap: [
          { name: 'Klaus Lind', role: 'Director of Logistics Strategy', stance: 'Champion', influence: 'High Influence' },
          { name: 'Helena Berg', role: 'Head of IT Procurement', stance: 'Skeptical', influence: 'Commercial Gatekeeper' }
        ],
        objectionMatrix: [
          {
            objection: 'Concerns over legacy API downtime during rollout',
            counter: 'Parallel staging environment backed by zero-downtime SLA guarantee',
            boundary: 'Zero penalty clauses without reciprocal telemetry access'
          }
        ],
        executiveNotes: 'Ensure legal review on cross-border data residency requirements before final redlines are exchanged.'
      }
    ],
    pipelineMetrics: [
      {
        id: 'pm_apex_1',
        opportunityName: 'Maersk Automated Logistics Fleet',
        stage: 'Final Negotiation',
        acv: 275000,
        winProbability: 75,
        cycleDaysElapsed: 34,
        concessionDefendedPct: 92,
        nextStrategicMove: 'Finalize SLA guarantee structure with Head of Procurement'
      },
      {
        id: 'pm_apex_2',
        opportunityName: 'Kuehne+Nagel Cold-Chain Optimization',
        stage: 'Executive Alignment',
        acv: 240000,
        winProbability: 65,
        cycleDaysElapsed: 22,
        concessionDefendedPct: 96,
        nextStrategicMove: 'Present business case to Regional VP'
      },
      {
        id: 'pm_apex_3',
        opportunityName: 'DB Schenker Predictive Routing Pilot',
        stage: 'Value Architecture',
        acv: 160000,
        winProbability: 50,
        cycleDaysElapsed: 15,
        concessionDefendedPct: 100,
        nextStrategicMove: 'Technical validation session with dispatch operations'
      }
    ],
    deliverables: [
      {
        id: 'dl_apex_1',
        title: 'Apex Dynamics Pricing & Packaging Restructure v1.2',
        category: 'Diagnostic Report',
        fileType: 'PDF',
        fileSize: '1.9 MB',
        version: 'v1.2',
        updatedAt: '2026-10-18'
      },
      {
        id: 'dl_apex_2',
        title: 'Enterprise Champion Mobilization Guide',
        category: 'Playbook',
        fileType: 'PDF',
        fileSize: '1.2 MB',
        version: 'v1.0',
        updatedAt: '2026-11-02'
      }
    ]
  }
};
