/**
 * ARES Platform — Domain Models
 * Pure TypeScript interfaces. No Angular dependencies.
 * These represent the core domain language of the platform.
 */

// ============================================================
// DEVICE DOMAIN
// ============================================================

export type DeviceStatus = 'online' | 'offline' | 'compromised' | 'quarantined' | 'analyzing';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';
export type AndroidVersion = '12' | '13' | '14' | '15';
export type ConnectionType = 'wifi' | '5g' | '4g' | '3g' | 'offline';
export type Operator = 'Movistar' | 'Vodafone' | 'Orange' | 'MásMóvil' | 'Yoigo' | 'Digi' | 'Simulated';

export interface GeoLocation {
  lat: number;
  lng: number;
  city: string;
  country: string;
  region: string;
}

export interface AppProcess {
  id: string;
  name: string;
  packageName: string;
  cpuPercent: number;
  memoryMb: number;
  suspicious: boolean;
}

export interface DeviceMetrics {
  batteryPercent: number;
  cpuPercent: number;
  memoryPercent: number;
  storagePercent: number;
  networkLatencyMs: number;
  signalStrength: number; // -dBm
}

export interface AndroidDevice {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  androidVersion: AndroidVersion;
  status: DeviceStatus;
  riskLevel: RiskLevel;
  location: GeoLocation;
  operator: Operator;
  connectionType: ConnectionType;
  imei: string;
  ipAddress: string;
  metrics: DeviceMetrics;
  runningApps: AppProcess[];
  tags: string[];
  enrolledAt: Date;
  lastSeenAt: Date;
  exerciseId?: string;
}

// ============================================================
// THREAT DOMAIN
// ============================================================

export type ThreatSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type ThreatStatus = 'active' | 'mitigated' | 'investigating' | 'false_positive' | 'contained';
export type AttackVector = 'network' | 'application' | 'physical' | 'social_engineering' | 'supply_chain';
export type ThreatCategory =
  | 'malware'
  | 'ransomware'
  | 'spyware'
  | 'exploit'
  | 'c2_communication'
  | 'data_exfiltration'
  | 'privilege_escalation'
  | 'lateral_movement'
  | 'persistence'
  | 'zero_day';

export interface ThreatIndicator {
  type: 'ip' | 'domain' | 'hash' | 'url' | 'certificate';
  value: string;
  confidence: number;
}

export interface ThreatEvent {
  id: string;
  title: string;
  description: string;
  severity: ThreatSeverity;
  category: ThreatCategory;
  status: ThreatStatus;
  attackVector: AttackVector;
  affectedDeviceIds: string[];
  indicators: ThreatIndicator[];
  origin: string;
  originCountry: string;
  detectedAt: Date;
  updatedAt: Date;
  mitigatedAt?: Date;
  aiAnalysis?: AIAnalysis;
  cvss?: number;
  mitreTactics: string[];
}

// ============================================================
// EXERCISE DOMAIN
// ============================================================

export type ExerciseStatus = 'draft' | 'running' | 'paused' | 'completed' | 'failed';
export type ExerciseType = 'red_team' | 'blue_team' | 'purple_team' | 'capture_the_flag' | 'simulation';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ExerciseObjective {
  id: string;
  title: string;
  completed: boolean;
  points: number;
}

export interface ExerciseEvent {
  id: string;
  exerciseId: string;
  timestamp: Date;
  type: 'attack' | 'defense' | 'alert' | 'breach' | 'mitigation' | 'info';
  description: string;
  deviceId?: string;
  severity: ThreatSeverity;
}

export interface CyberExercise {
  id: string;
  title: string;
  description: string;
  type: ExerciseType;
  difficulty: DifficultyLevel;
  status: ExerciseStatus;
  targetDeviceIds: string[];
  objectives: ExerciseObjective[];
  events: ExerciseEvent[];
  threatScenarios: string[];
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  duration: number; // minutes
  score?: number;
  maxScore: number;
}

// ============================================================
// AI ANALYSIS DOMAIN
// ============================================================

export type AnomalyType = 'behavioral' | 'network' | 'process' | 'file_system' | 'authentication';
export type RecommendationPriority = 'immediate' | 'high' | 'medium' | 'low';

export interface AIAnalysis {
  id: string;
  timestamp: Date;
  threatId?: string;
  deviceId?: string;
  riskScore: number; // 0-100
  confidence: number; // 0-1
  summary: string;
  anomalies: AIAnomaly[];
  recommendations: AIRecommendation[];
  correlations: ThreatCorrelation[];
  modelVersion: string;
  processingTimeMs: number;
}

export interface AIAnomaly {
  id: string;
  type: AnomalyType;
  description: string;
  score: number;
  evidence: string[];
  deviceId: string;
  detectedAt: Date;
}

export interface AIRecommendation {
  id: string;
  priority: RecommendationPriority;
  action: string;
  rationale: string;
  estimatedRiskReduction: number; // percentage
  automated: boolean;
}

export interface ThreatCorrelation {
  threatIds: string[];
  correlationScore: number;
  pattern: string;
  description: string;
}

// ============================================================
// SCENARIO DOMAIN
// ============================================================

export interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  category: ThreatCategory;
  difficulty: DifficultyLevel;
  estimatedDuration: number; // minutes
  requiredDeviceCount: number;
  threatSequence: ThreatCategory[];
  tags: string[];
}

export interface ScenarioConfig {
  id: string;
  name: string;
  templateId: string;
  selectedDeviceIds: string[];
  selectedThreats: ThreatCategory[];
  duration: number;
  autoMitigate: boolean;
  createdAt: Date;
}

// ============================================================
// TELEMETRY DOMAIN
// ============================================================

export interface TelemetryDataPoint {
  timestamp: Date;
  deviceId: string;
  metric: string;
  value: number;
  unit: string;
}

export interface LiveMetrics {
  totalDevices: number;
  onlineDevices: number;
  activeThreats: number;
  criticalAlerts: number;
  activeExercises: number;
  mitigatedThreats: number;
  aiAnalysesRunning: number;
  networkTrafficMbps: number;
  systemHealthScore: number; // 0-100
}

// ============================================================
// NOTIFICATION DOMAIN
// ============================================================

export interface SystemNotification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}
