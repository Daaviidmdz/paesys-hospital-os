
export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  PATHOLOGIES = 'PATHOLOGIES',
  ASSISTANT = 'ASSISTANT',
  CALCULATORS = 'CALCULATORS',
  GLOSSARY = 'GLOSSARY',
  PROCEDURES = 'PROCEDURES',
  SEARCH = 'SEARCH',
  PHARMACOLOGY = 'PHARMACOLOGY',
  FOLLOWUP = 'FOLLOWUP',
  SETTINGS = 'SETTINGS',
  CHAT = 'CHAT',
  TEAM_CHAT = 'TEAM_CHAT'
}

export interface ViewParams {
    query?: string;
    tool?: string;
    category?: string;
    drug?: string;
    patientId?: string;
}

export type UserRole = 'STUDENT' | 'NURSE' | 'ADMIN';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    provider?: 'EMAIL' | 'GOOGLE' | 'APPLE';
    collegiateNumber?: string;
    unit?: string;
    shift?: 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'ROTATING';
    preferences?: {
        theme: 'light' | 'dark';
        notifications: boolean;
        offlineMode: boolean;
    };
    lastLogin?: string;
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    text: string;
    timestamp: string;
    role: UserRole;
    isSystem?: boolean;
    sources?: { title: string; uri: string }[];
    action?: {
        type: 'NAVIGATE';
        view: string;
        params?: any;
    };
    channelId?: string;
    type?: 'TEXT' | 'ALERT' | 'SYSTEM' | 'ACTION';
    attachments?: {
        type: 'IMAGE' | 'FILE' | 'VOICE';
        url: string;
        name: string;
        size?: string;
    }[];
    readBy?: string[]; // List of user IDs who read the message
    reactions?: Record<string, string[]>; // emoji -> array of userIds
    replyTo?: string; // ID of the message being replied to
    pinned?: boolean; // Whether the message is pinned
}

export interface ChatChannel {
    id: string;
    name: string;
    description: string;
    icon: string;
    type: 'GENERAL' | 'PATIENT' | 'EMERGENCY' | 'STAFF' | 'PRIVATE';
    patientId?: string;
    members?: string[]; // User IDs
    lastMessage?: string;
    unreadCount?: number;
}

export interface Drug {
  id: string;
  name: string;
  brandNames: string;
  group: string;
  presentation: string;
  indications: string[]; 
  dilution: string;
  administrationRoute: string;
  administrationTime: string;
  compatibility: string;
  sideEffects: string[];
  monitoring: string;
  safetyAlert: string;
  storage?: 'ROOM' | 'FRIDGE' | 'PROTECT_LIGHT';
  contraindications?: string[];
  pregnancy?: 'A' | 'B' | 'C' | 'D' | 'X';
  pharmacokinetics?: {
      onset: string;
      peak: string;
      duration: string;
  };
}

export interface Pathology {
  id: string;
  name: string;
  cie10?: string;
  family?: string;
  generalInfo: {
    definition: string;
    etiology: string;
    pathophysiology?: string;
    signsSymptoms: string[];
    diagnosticTests?: string[];
    differentialDiagnosis?: string[];
    complications?: string[];
    redFlags?: string;
    patientEducation?: string[];
  };
  pharmacology: {
    group: string;
    drug: string;
    effect: string;
  }[];
  pae: {
    nanda: {
        code: string;
        label: string;
        relatedTo: string;
        manifestedBy: string;
    }[];
    noc: {
        code: string;
        result: string;
        indicators?: string[];
    }[];
    nic: {
        code: string;
        intervention: string;
        activities: string[];
    }[];
  };
  sources?: { title: string; uri: string }[];
}

export interface TriageResult {
  level: 'RED' | 'ORANGE' | 'YELLOW' | 'GREEN' | 'BLUE';
  priorityScore: 1 | 2 | 3 | 4 | 5;
  title: string;
  justification: string;
  differential?: string[];
  vitals?: {
      ta?: string;
      fc?: string;
      sat?: string;
      temp?: string;
      gcs?: string;
      fr?: string;
      pain?: string;
  };
  actions: string[];
  tests: string[];
  suggestedPae?: {
    nanda: { code: string; label: string; relatedTo: string; manifestedBy: string }[];
    noc: { code: string; result: string; indicators: string[] }[];
    nic: { code: string; intervention: string; activities: string[] }[];
  };
  sbar?: {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  };
}

export interface TriageSession {
    id: string;
    userId: string;
    userName: string;
    timestamp: string;
    patientDescription: string;
    result: TriageResult;
    history: { role: 'USER' | 'AI'; text?: string; imageBase64?: string; triageResult?: TriageResult; timestamp: string }[];
}

export interface Term {
  id: string;
  term: string;
  definition: string;
  category: string;
  usage: string;
}

export type ClinicalRecordType = 'EVOLUTION' | 'VITALS' | 'FLUID_BALANCE' | 'PAE';

export interface ClinicalRecord {
    id: string;
    patientId?: string;
    authorId?: string;
    timestamp: string;
    type?: ClinicalRecordType;
}

export interface ClinicalAnalysis {
    detectedRisks: string[];
    suggestedNanda: string[];
    sbarSummary: string;
    actionPlan: string[];
    suggestedNic?: string[];
    suggestedNoc?: string[];
    interactionAlerts?: string[];
}

export interface Evolution extends ClinicalRecord {
  type?: 'EVOLUTION';
  note?: string; 
  vitals?: {
    temp?: string;
    sat?: string;
    ta?: string;
    fc?: string;
    fr?: string;
    gcs?: string;
  };
  mewsScore?: number;
  detectedRisks?: string[];
  riskLevel?: 'STABLE' | 'OBSERVATION' | 'UNSTABLE' | 'CRITICAL';
  tags?: string[];
  attachments?: { type: 'IMAGE' | 'AUDIO', url: string, label: string }[]; 
  analysis?: ClinicalAnalysis;
}

export interface NOC {
    id: string;
    label: string;
    score: number;
    target: number;
}

export interface NIC {
    id: string;
    label: string;
    completed: boolean;
}

export interface PaeEntry {
    id: string;
    nanda: string;
    relatedTo?: string;
    noc: NOC[];
    nic: NIC[];
    status: 'ACTIVE' | 'RESOLVED';
    updatedAt?: string;
}

export type PatientType = 'STANDARD' | 'CRITICAL' | 'POST_OP' | 'GERIATRIC' | 'PEDIATRIC' | 'TRAUMA';
export type ServiceType = 'UCI' | 'PLANTA' | 'URGENCIAS' | 'PEDIATRIA' | 'TRAUMA';

export interface DynamicTask {
    id: string;
    label: string;
    category: 'MONITORING' | 'ACTION' | 'MEDICATION' | 'POSITION';
    completed: boolean;
}

export interface ShiftChecklist {
    idBand: boolean;
    rails: boolean;
    access: boolean;
    hygiene: boolean;
    medication: boolean;
    diet: boolean;
    drains?: string;
    wounds?: string;
    glucose?: string;
    sedation?: string;
    ventilation?: string;
    restraints?: boolean;
    immobilization?: boolean;
}

export type AlertLevel = 'CRITICAL' | 'WARNING' | 'INFO';
export type AlertCategory = 'VITALS' | 'DEVICE' | 'MEDS' | 'BALANCE' | 'LAB';

export interface ClinicalAlert {
    id: string;
    patientId: string;
    patientName: string;
    level: AlertLevel;
    category: AlertCategory;
    title: string;
    message: string;
    timestamp: string;
    acknowledged: boolean;
}

export interface InvasiveDevice {
    id: string;
    type: 'VVP' | 'CVC' | 'PICC' | 'SNG' | 'SV' | 'DRAIN' | 'IOT';
    location: string;
    insertionDate: string;
    gauge?: string;
    status: 'ACTIVE' | 'REMOVED';
    lastCare?: string;
    notes?: string;
}

export interface WoundAnalysisResult {
    dimensions: {
        widthCm: number;
        heightCm: number;
        areaCm2: number;
    };
    tissueTypes: {
        granulationPct: number;
        sloughPct: number;
        necroticPct: number;
    };
    signs: {
        infection: boolean;
        erythema: boolean;
        exudate: boolean;
        edema: boolean;
    };
    recommendation: string;
    suggestedPae?: {
        nanda: { code: string; label: string }[];
        noc: { code: string; result: string }[];
        nic: { code: string; intervention: string }[];
    };
}

export interface WoundEntry {
    id: string;
    date: string;
    imageUrl: string;
    location: string;
    analysis: WoundAnalysisResult;
    notes?: string;
}

export interface FluidEntry {
    id: string;
    timestamp: string;
    type: 'INPUT' | 'OUTPUT';
    subtype: 'ORAL' | 'IV' | 'SONDA' | 'ORINA' | 'VOMITO' | 'DRENAJE' | 'HECES' | 'OTRO';
    amount: number;
    description?: string;
}

export interface Prescription {
    id: string;
    drugName: string;
    dose: string;
    route: 'IV' | 'VO' | 'SC' | 'IM' | 'NEB';
    frequency: string;
    schedule?: string[];
    lastAdmin?: string;
    nextAdmin?: string;
    status: 'ACTIVE' | 'STOPPED' | 'COMPLETED';
    type: 'SCHEDULED' | 'PRN' | 'STAT';
}

export interface LabParameter {
    name: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    isCritical?: boolean;
}

export interface LabReport {
    id: string;
    timestamp: string;
    category: 'HEMATOLOGY' | 'BIOCHEMISTRY' | 'COAGULATION' | 'GASOMETRY';
    values: LabParameter[];
}

export interface Patient {
    id: string;
    name: string;
    age: string;
    sex: 'M' | 'F';
    weight: string;
    type: PatientType;
    service?: ServiceType;
    status?: 'ACTIVE' | 'DISCHARGED';
    allergies: string;
    bed: string;
    diagnosis: string;
    admissionReason?: string;
    isDiabetic?: boolean;
    isolation?: 'NONE' | 'CONTACT' | 'DROPLET' | 'AIRBORNE' | 'PROTECTIVE';
    shiftGoal: string;
    checklist: ShiftChecklist;
    activePae: PaeEntry[];
    history: Evolution[]; 
    risk?: 'LOW' | 'MEDIUM' | 'HIGH';
    news2?: number;
    trend?: number[];
    task?: string;
    nextTaskTime?: string;
    vitals?: any;
    sbar?: {
        situation: string;
        background: string;
        assessment: string;
        recommendation: string;
    };
    diet?: string;
    dynamicChecklist?: DynamicTask[];
    activeDevices?: InvasiveDevice[]; 
    fluidBalance24h?: number;
    fluidEntries?: FluidEntry[]; 
    prescriptions?: Prescription[]; 
    lastMedicationTime?: string;
    nextMedicationTime?: string;
    wounds?: WoundEntry[];
    labReports?: LabReport[];
}
