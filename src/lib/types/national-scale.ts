/**
 * Multi-LC National Scale & MC Morocco Command Center Types
 * Statutory References: AIESEC International Constitution, AIESEC Morocco National Compendium, AFPM, Law 09-08 (CNDP)
 * Invariants: INV-04 (Multi-Tenant Partition Isolation), Section 9 National RBAC
 */

export type MoroccanLC =
  | 'LC_RABAT'
  | 'LC_CASABLANCA'
  | 'LC_MARRAKECH'
  | 'LC_FES'
  | 'LC_TANGIER'
  | 'LC_AGADIR';

export type NationalRole = 'MCP' | 'MCVP_ICX' | 'MCVP_FNL' | 'ECB_AUDIT';

export interface LocalEntityMetadata {
  lcId: MoroccanLC;
  code: string;
  name: string;
  city: string;
  foundedYear: number;
  status: 'FULL_MEMBER' | 'OFFICIAL_EXPANSION';
}

export interface TenantRequestContext {
  userId: string;
  userRole: string;
  homeLcId: MoroccanLC | 'MC_MOROCCO';
  isNationalOfficer: boolean;
}

export interface LCOperationalMetric {
  lcId: MoroccanLC;
  lcName: string;
  totalApproved: number;
  totalRealized: number;
  totalCompleted: number;
  standardsDeliveryRate: number; // e.g. 0.94
  activeQualityCases: number;
  sustainabilityRatio: number; // e.g. 1.45
  healthStatus: 'EXCELLENT' | 'STABLE' | 'NEEDS_ATTENTION';
}

export interface NationalConsolidatedDashboard {
  generatedAt: string;
  reportingTerm: string;
  multiLcFeatureFlag: boolean;
  totalNationalRealizations: number;
  totalNationalCompletions: number;
  averageStandardsDeliveryRate: number;
  nationalExchangeSustainabilityRatio: number;
  lcBreakdown: LCOperationalMetric[];
  partitionAudits: {
    totalQueriesAudited: number;
    crossLcDataLeaksDetected: 0;
    isRlsIsolationVerified: boolean;
  };
}
