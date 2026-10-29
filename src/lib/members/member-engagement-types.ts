export type MemberRole = 'LCVP' | 'MM_TL' | 'TM';

export type MemberDepartment =
  | 'EXTERNAL_BD'
  | 'INTERNAL_OPS'
  | 'CXP_QUALITY'
  | 'FINANCE';

export type EngagementTier =
  | 'TIER_1_CORE'
  | 'TIER_2_STRONG'
  | 'TIER_3_MODERATE'
  | 'TIER_4_RISK';

export interface MemberScoreBreakdown {
  attendance: number;       // 0 - 100
  quotaAttainment: number;  // 0 - 100
  slaOnTime: number;        // 0 - 100
  o2oParticipation: number; // 0 - 100
}

export interface MemberRecord {
  id: string;
  fullName: string;
  email: string;
  whatsappPhone: string;
  role: MemberRole;
  roleTitle: string;
  department: MemberDepartment;
  mandate: string;
  avatar?: string;
  attendanceScore: number;
  quotaScore: number;
  slaScore: number;
  o2oScore: number;
  compositeMes: number;
  tier: EngagementTier;
  assignedEpsCount: number;
  assignedDealsCount: number;
  lastActiveDate: string;
  notes?: string;
}

export type GovernanceRoutineType =
  | 'TEAM_MEETING'
  | 'CORE_MEETING'
  | 'DEPT_MEETING'
  | 'LCM'
  | 'O2O'
  | 'LCP_CALIBRATION';

export type AttendanceStatus = 'ON_TIME' | 'LATE' | 'ABSENT' | 'EXCUSED';

export interface RoutineAttendanceRecord {
  week: string; // 'W1' .. 'W16'
  routine: GovernanceRoutineType;
  status: AttendanceStatus;
  hasO2o: boolean;
  date: string;
}

export interface O2OSessionRecord {
  id: string;
  memberId: string;
  memberName: string;
  coachId: string;
  coachName: string;
  date: string;
  wellbeingScore: number; // 1 to 5
  kpiReviewNotes: string;
  blockers: string;
  actionItems: string;
  followUpDate: string;
}

export interface TeamStandardItem {
  id: string;
  stage: 'BUILDING' | 'PERFORMING' | 'CLOSING';
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  evidenceUrl?: string;
}

export interface TeamStandardsState {
  teamLeaderId: string;
  teamLeaderName: string;
  department: MemberDepartment;
  items: TeamStandardItem[];
}
