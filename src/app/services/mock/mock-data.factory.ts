/**
 * MockDataFactory — Deterministic fake data generator
 * Generates consistent mock data for the ARES MVP.
 * FUTURE: Replace with real API calls by swapping the service interface.
 */

import {
  AndroidDevice, ThreatEvent, CyberExercise, AIAnalysis,
  DeviceStatus, RiskLevel, ThreatSeverity, ThreatCategory,
  ExerciseStatus, AnomalyType, LiveMetrics, SystemNotification,
  ScenarioTemplate, ThreatCorrelation, AIAnomaly, AIRecommendation,
  ExerciseObjective
} from '../../models/domain';

// ── Helpers ────────────────────────────────────────────────────────────────

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min: number, max: number) => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const randDate = (daysBack: number) => new Date(Date.now() - rand(0, daysBack) * 86400000);
const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();

// ── Device constants ────────────────────────────────────────────────────────

const MANUFACTURERS = ['Samsung', 'Google', 'Xiaomi', 'OnePlus', 'Motorola', 'Huawei', 'Sony', 'Nokia'];
const MODELS: Record<string, string[]> = {
  Samsung: ['Galaxy S24', 'Galaxy A54', 'Galaxy S23 Ultra', 'Galaxy Z Fold5'],
  Google:  ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 9'],
  Xiaomi:  ['14 Pro', '13T', 'Redmi Note 13', 'POCO F6'],
  OnePlus: ['12', '11', 'Nord 3', 'Open'],
  Motorola:['Edge 50', 'G84', 'Razr+', 'G54'],
  Huawei:  ['P60 Pro', 'Mate 60', 'Nova 12', 'P50'],
  Sony:    ['Xperia 1 V', 'Xperia 5 V', 'Xperia 10 V'],
  Nokia:   ['XR21', 'G60', 'C32', 'X30'],
};
const CITIES: Array<{ city: string; country: string; region: string; lat: number; lng: number }> = [
  { city: 'Madrid',     country: 'Spain',      region: 'Europe',  lat: 40.41,  lng: -3.70  },
  { city: 'Barcelona',  country: 'Spain',      region: 'Europe',  lat: 41.38,  lng: 2.17   },
  { city: 'London',     country: 'UK',         region: 'Europe',  lat: 51.50,  lng: -0.12  },
  { city: 'Berlin',     country: 'Germany',    region: 'Europe',  lat: 52.52,  lng: 13.40  },
  { city: 'Paris',      country: 'France',     region: 'Europe',  lat: 48.85,  lng: 2.35   },
  { city: 'Warsaw',     country: 'Poland',     region: 'Europe',  lat: 52.22,  lng: 21.01  },
  { city: 'Kyiv',       country: 'Ukraine',    region: 'Europe',  lat: 50.45,  lng: 30.52  },
  { city: 'Tallinn',    country: 'Estonia',    region: 'Europe',  lat: 59.43,  lng: 24.75  },
  { city: 'Bucharest',  country: 'Romania',    region: 'Europe',  lat: 44.43,  lng: 26.10  },
  { city: 'Amsterdam',  country: 'Netherlands',region: 'Europe',  lat: 52.37,  lng: 4.90   },
];
const OPERATORS = ['Movistar','Vodafone','Orange','MásMóvil','Yoigo','Digi','Simulated'] as const;
const ANDROID_VERSIONS = ['12','13','14','15'] as const;
const CONNECTION_TYPES = ['wifi','5g','4g','3g'] as const;
const STATUSES: DeviceStatus[] = ['online','online','online','online','offline','compromised','quarantined','analyzing'];
const RISK_LEVELS: RiskLevel[] = ['none','low','medium','high','critical'];
const PACKAGE_NAMES = [
  'com.android.chrome','com.google.android.gm','com.spotify.music',
  'com.whatsapp','com.telegram.messenger','com.microsoft.teams',
  'com.android.settings','com.malware.fake.c2','com.spyware.monitor',
];

// ── Device Factory ──────────────────────────────────────────────────────────

export function generateDevices(count = 100): AndroidDevice[] {
  return Array.from({ length: count }, (_, i) => {
    const manufacturer = pick(MANUFACTURERS);
    const model = pick(MODELS[manufacturer]);
    const location = pick(CITIES);
    const status: DeviceStatus = pick(STATUSES);
    const risk: RiskLevel = status === 'compromised' ? 'critical'
                          : status === 'quarantined'  ? 'high'
                          : pick(RISK_LEVELS);

    return {
      id: `DEV-${String(i + 1).padStart(4, '0')}`,
      name: `ARES-${manufacturer.slice(0,3).toUpperCase()}-${uid()}`,
      model,
      manufacturer,
      androidVersion: pick(ANDROID_VERSIONS),
      status,
      riskLevel: risk,
      location: { ...location, lat: location.lat + randFloat(-0.5, 0.5), lng: location.lng + randFloat(-0.5, 0.5) },
      operator: pick(OPERATORS),
      connectionType: pick(CONNECTION_TYPES),
      imei: `${rand(100000000000000, 999999999999999)}`,
      ipAddress: `10.${rand(0,255)}.${rand(0,255)}.${rand(1,254)}`,
      metrics: {
        batteryPercent: rand(5, 100),
        cpuPercent: rand(2, 95),
        memoryPercent: rand(20, 95),
        storagePercent: rand(10, 90),
        networkLatencyMs: rand(5, 450),
        signalStrength: rand(-110, -50),
      },
      runningApps: Array.from({ length: rand(3, 8) }, () => {
        const pkg = pick(PACKAGE_NAMES);
        return {
          id: uid(),
          name: pkg.split('.').pop()!,
          packageName: pkg,
          cpuPercent: randFloat(0.1, 25),
          memoryMb: rand(20, 600),
          suspicious: pkg.includes('malware') || pkg.includes('spyware'),
        };
      }),
      tags: [manufacturer, status, risk].filter(Boolean),
      enrolledAt: randDate(180),
      lastSeenAt: status === 'online' ? new Date(Date.now() - rand(0, 60000)) : randDate(7),
      exerciseId: Math.random() > 0.7 ? `EX-${rand(1, 5)}` : undefined,
    };
  });
}

// ── Threat Constants ────────────────────────────────────────────────────────

const THREAT_TITLES: Record<ThreatCategory, string[]> = {
  malware:             ['Android.BankBot detected', 'FluBot variant identified', 'Joker malware active'],
  ransomware:          ['CryptoLocker mobile variant', 'Android ransomware spreading', 'File encryption detected'],
  spyware:             ['Pegasus indicators found', 'Commercial spyware activity', 'Keylogger process active'],
  exploit:             ['CVE-2024-0044 exploitation', 'Kernel privilege escalation', 'WebView exploit chain'],
  c2_communication:    ['C2 beacon detected', 'DNS tunneling active', 'Suspicious outbound connection'],
  data_exfiltration:   ['Mass contact exfiltration', 'Media upload to unknown host', 'Clipboard data leak'],
  privilege_escalation:['Root access attempt', 'SELinux bypass detected', 'Sudo exploit attempt'],
  lateral_movement:    ['ADB lateral pivot', 'WiFi credential theft', 'Bluetooth attack chain'],
  persistence:         ['Boot receiver installed', 'Accessibility service abuse', 'Device admin persistence'],
  zero_day:            ['Unknown exploit signature', '0-day behavioral match', 'Novel attack pattern'],
};

const MITRE_TACTICS = ['TA0001','TA0002','TA0003','TA0004','TA0005','TA0006','TA0007','TA0008','TA0009','TA0010','TA0011'];
const ORIGINS = ['Moscow, RU','Beijing, CN','Pyongyang, KP','Tehran, IR','Unknown VPN','Tor Exit Node','Frankfurt, DE'];
const CATEGORIES: ThreatCategory[] = Object.keys(THREAT_TITLES) as ThreatCategory[];
const SEVERITIES: ThreatSeverity[] = ['critical','critical','high','high','medium','low','info'];

export function generateThreats(devices: AndroidDevice[], count = 60): ThreatEvent[] {
  return Array.from({ length: count }, (_, i) => {
    const cat = pick(CATEGORIES);
    const sev = pick(SEVERITIES);
    const affectedCount = rand(1, 8);
    return {
      id: `THR-${String(i + 1).padStart(4, '0')}`,
      title: pick(THREAT_TITLES[cat]),
      description: `Threat actor activity detected across ${affectedCount} device(s). Immediate analysis recommended.`,
      severity: sev,
      category: cat,
      status: pick(['active','active','investigating','mitigated','contained','false_positive']),
      attackVector: pick(['network','application','physical','social_engineering','supply_chain']),
      affectedDeviceIds: devices.slice(rand(0, 90), rand(91, 99)).slice(0, affectedCount).map(d => d.id),
      indicators: Array.from({ length: rand(1, 4) }, () => ({
        type: pick(['ip','domain','hash','url','certificate']),
        value: `indicator-${uid()}.malicious.io`,
        confidence: randFloat(0.3, 0.99),
      })),
      origin: pick(ORIGINS),
      originCountry: pick(['RU','CN','KP','IR','Unknown','US','DE']),
      detectedAt: randDate(14),
      updatedAt: randDate(3),
      cvss: randFloat(3.0, 10.0),
      mitreTactics: Array.from({ length: rand(1, 4) }, () => pick(MITRE_TACTICS)),
    };
  });
}

// ── Exercise Factory ────────────────────────────────────────────────────────

const EXERCISE_NAMES = [
  'Operation Red Storm','BlackOut Protocol','Phantom Intrusion','Iron Shield Exercise',
  'Digital Fortress','Silent Serpent','Cyber Dragon Hunt','Arctic Fox Defense',
];

export function generateExercises(devices: AndroidDevice[]): CyberExercise[] {
  return Array.from({ length: 8 }, (_, i) => {
    const status: ExerciseStatus = pick(['running','running','paused','completed','draft']);
    const objectives: ExerciseObjective[] = Array.from({ length: rand(3,6) }, (__, j) => ({
      id: uid(),
      title: pick(['Detect C2 beacon','Isolate compromised device','Trace data exfiltration','Block lateral movement','Identify zero-day']),
      completed: status === 'completed' ? true : Math.random() > 0.5,
      points: pick([100, 150, 200, 250, 300]),
    }));
    return {
      id: `EX-${i + 1}`,
      title: EXERCISE_NAMES[i] ?? `Exercise Alpha-${i}`,
      description: 'Simulated mobile cyber attack scenario targeting Android device fleet.',
      type: pick(['red_team','blue_team','purple_team','simulation','capture_the_flag']),
      difficulty: pick(['beginner','intermediate','advanced','expert']),
      status,
      targetDeviceIds: devices.filter(d => d.exerciseId === `EX-${i+1}`).map(d => d.id),
      objectives,
      events: [],
      threatScenarios: Array.from({ length: rand(2,5) }, () => pick(CATEGORIES)),
      createdAt: randDate(30),
      startedAt: status !== 'draft' ? randDate(7) : undefined,
      duration: pick([30, 60, 90, 120, 180]),
      score: status === 'completed' ? rand(500, 2000) : undefined,
      maxScore: 2000,
    };
  });
}

// ── AI Analysis Factory ─────────────────────────────────────────────────────

export function generateAIAnalyses(count = 20): AIAnalysis[] {
  const anomalyTypes: AnomalyType[] = ['behavioral','network','process','file_system','authentication'];
  return Array.from({ length: count }, (_, i) => {
    const anomalies: AIAnomaly[] = Array.from({ length: rand(1,4) }, () => ({
      id: uid(),
      type: pick(anomalyTypes),
      description: pick([
        'Unusual outbound data pattern detected at 03:14 UTC',
        'Process spawning chain inconsistent with known-good baseline',
        'Network traffic entropy exceeds threshold (0.94)',
        'Authentication attempt from geographically impossible location',
        'File system write rate 12x above device baseline',
      ]),
      score: randFloat(0.5, 1.0),
      evidence: [`Pattern #${uid()}`, `Hash: ${uid()}`],
      deviceId: `DEV-${String(rand(1,100)).padStart(4,'0')}`,
      detectedAt: randDate(2),
    }));

    const recs: AIRecommendation[] = Array.from({ length: rand(2,4) }, () => ({
      id: uid(),
      priority: pick(['immediate','high','medium','low']),
      action: pick([
        'Quarantine device immediately',
        'Block outbound connection to 185.220.x.x/16',
        'Revoke device admin privileges',
        'Force MDM compliance check',
        'Capture full memory dump for forensics',
        'Update Android Security Patch Level',
      ]),
      rationale: 'Based on behavioral correlation across 14 similar incidents in the last 30 days.',
      estimatedRiskReduction: rand(15, 85),
      automated: Math.random() > 0.6,
    }));

    const corrs: ThreatCorrelation[] = rand(0,1) > 0 ? [{
      threatIds: [`THR-${String(rand(1,60)).padStart(4,'0')}`, `THR-${String(rand(1,60)).padStart(4,'0')}`],
      correlationScore: randFloat(0.6, 0.99),
      pattern: 'APT-style multi-stage attack pattern',
      description: 'Common C2 infrastructure shared across threat actors.',
    }] : [];

    return {
      id: `AI-${String(i + 1).padStart(4, '0')}`,
      timestamp: randDate(3),
      riskScore: rand(10, 98),
      confidence: randFloat(0.55, 0.99),
      summary: pick([
        'High-confidence APT activity detected. Immediate containment recommended.',
        'Behavioral anomaly consistent with commercial spyware deployment.',
        'Data exfiltration attempt in progress — blocking recommended.',
        'Novel malware signature. Sandboxing initiated for deep analysis.',
        'False positive probability: 8%. Threat actor pivot detected.',
      ]),
      anomalies,
      recommendations: recs,
      correlations: corrs,
      modelVersion: 'ARES-AI-v2.4.1',
      processingTimeMs: rand(120, 3200),
    };
  });
}

// ── Live Metrics ────────────────────────────────────────────────────────────

export function generateLiveMetrics(devices: AndroidDevice[], threats: ThreatEvent[]): LiveMetrics {
  const online = devices.filter(d => d.status === 'online').length;
  const active = threats.filter(t => t.status === 'active').length;
  const critical = threats.filter(t => t.severity === 'critical' && t.status === 'active').length;
  return {
    totalDevices: devices.length,
    onlineDevices: online,
    activeThreats: active,
    criticalAlerts: critical,
    activeExercises: rand(1, 4),
    mitigatedThreats: threats.filter(t => t.status === 'mitigated').length,
    aiAnalysesRunning: rand(2, 8),
    networkTrafficMbps: randFloat(120, 980),
    systemHealthScore: Math.max(20, 100 - critical * 12 - active * 3),
  };
}

// ── Scenario Templates ──────────────────────────────────────────────────────

export function generateScenarioTemplates(): ScenarioTemplate[] {
  return [
    {
      id: 'SCN-001', name: 'Banking Trojan Campaign', category: 'malware',
      description: 'Simulate a banking malware campaign targeting financial apps.',
      difficulty: 'intermediate', estimatedDuration: 60, requiredDeviceCount: 10,
      threatSequence: ['malware','c2_communication','data_exfiltration'],
      tags: ['financial','mobile','banking'],
    },
    {
      id: 'SCN-002', name: 'Pegasus-like Spyware', category: 'spyware',
      description: 'Zero-click spyware deployment simulation.',
      difficulty: 'expert', estimatedDuration: 120, requiredDeviceCount: 5,
      threatSequence: ['zero_day','exploit','spyware','persistence'],
      tags: ['apt','spyware','zero-click'],
    },
    {
      id: 'SCN-003', name: 'Ransomware Outbreak', category: 'ransomware',
      description: 'Mobile ransomware spreading through enterprise WiFi.',
      difficulty: 'advanced', estimatedDuration: 90, requiredDeviceCount: 20,
      threatSequence: ['lateral_movement','ransomware','data_exfiltration'],
      tags: ['ransomware','enterprise','wifi'],
    },
    {
      id: 'SCN-004', name: 'Supply Chain Attack', category: 'malware',
      description: 'Malicious SDK injection in legitimate application.',
      difficulty: 'advanced', estimatedDuration: 75, requiredDeviceCount: 15,
      threatSequence: ['persistence','c2_communication','data_exfiltration'],
      tags: ['supply-chain','sdk','stealthy'],
    },
    {
      id: 'SCN-005', name: 'Insider Threat Exfiltration', category: 'data_exfiltration',
      description: 'Employee device used for unauthorized data exfiltration.',
      difficulty: 'intermediate', estimatedDuration: 45, requiredDeviceCount: 3,
      threatSequence: ['privilege_escalation','data_exfiltration'],
      tags: ['insider','exfiltration','dlp'],
    },
    {
      id: 'SCN-006', name: 'Nation-State Reconnaissance', category: 'zero_day',
      description: 'APT group conducting mobile reconnaissance operation.',
      difficulty: 'expert', estimatedDuration: 180, requiredDeviceCount: 30,
      threatSequence: ['zero_day','exploit','spyware','lateral_movement','persistence'],
      tags: ['apt','nation-state','advanced'],
    },
  ];
}

// ── Notifications Factory ───────────────────────────────────────────────────

export function generateNotifications(): SystemNotification[] {
  return [
    { id: uid(), type: 'alert',   title: 'Critical threat detected', message: 'C2 beacon on DEV-0023', timestamp: new Date(Date.now()-120000), read: false },
    { id: uid(), type: 'warning', title: 'Device offline', message: 'DEV-0047 lost connection', timestamp: new Date(Date.now()-300000), read: false },
    { id: uid(), type: 'success', title: 'Threat mitigated', message: 'THR-0012 contained', timestamp: new Date(Date.now()-600000), read: true },
    { id: uid(), type: 'info',    title: 'Exercise started', message: 'Operation Red Storm is live', timestamp: new Date(Date.now()-900000), read: true },
    { id: uid(), type: 'alert',   title: 'Zero-day signature', message: 'Novel pattern on 3 devices', timestamp: new Date(Date.now()-1800000), read: false },
  ];
}
