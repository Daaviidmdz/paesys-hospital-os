import { User, ChatMessage, Patient, Evolution, Drug, Pathology, ChatChannel, TriageSession } from '../types';
import { db, auth } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const DB_KEYS = {
    STAFF: 'staff',
    MESSAGES: 'messages',
    PATIENTS: 'patients',
    DRUGS: 'drugs',
    PATHOLOGIES: 'pathologies',
    CHANNELS: 'channels',
    TRIAGE_SESSIONS: 'triage_sessions'
};

const INITIAL_PATIENTS_SEED: Patient[] = [
    {
        id: 'p1', name: 'Antonio García López', age: '78', sex: 'M', weight: '82', type: 'CRITICAL', status: 'ACTIVE', allergies: 'Penicilina', bed: '304-A', diagnosis: 'EPOC Exacerbado + ICC', shiftGoal: 'Mantener SatO2 >90%',
        isDiabetic: true,
        checklist: { idBand: true, rails: true, access: true, hygiene: false, medication: true, diet: true, glucose: '145', ventilation: 'VMNI' },
        activePae: [
            { 
                id: 'pae1', 
                nanda: 'Deterioro intercambio gases', 
                relatedTo: 'Desequilibrio V/Q',
                noc: [
                    { id: 'noc1', label: 'Estado respiratorio: Intercambio gaseoso', score: 2, target: 4 },
                    { id: 'noc2', label: 'Estado signos vitales', score: 3, target: 5 }
                ], 
                nic: [
                    { id: 'nic1', label: 'Monitorización respiratoria', completed: true },
                    { id: 'nic2', label: 'Oxigenoterapia', completed: true },
                    { id: 'nic3', label: 'Manejo de la vía aérea', completed: false }
                ], 
                status: 'ACTIVE' 
            }
        ],
        prescriptions: [
            { id: 'rx1', drugName: 'Metilprednisolona', dose: '40mg', route: 'IV', frequency: '12h', type: 'SCHEDULED', nextAdmin: new Date(Date.now() + 3600000).toISOString(), status: 'ACTIVE' },
            { id: 'rx2', drugName: 'Furosemida', dose: '20mg', route: 'IV', frequency: '8h', type: 'SCHEDULED', nextAdmin: new Date(Date.now() - 1800000).toISOString(), status: 'ACTIVE' },
            { id: 'rx3', drugName: 'Salbutamol', dose: '2.5mg', route: 'NEB', frequency: '6h', type: 'SCHEDULED', nextAdmin: new Date(Date.now() + 7200000).toISOString(), status: 'ACTIVE' }
        ],
        activeDevices: [
            { id: 'dev1', type: 'VVP', location: 'Antebrazo Izquierdo', gauge: '20G', insertionDate: new Date(Date.now() - 300000000).toISOString(), status: 'ACTIVE', lastCare: new Date().toISOString() },
            { id: 'dev2', type: 'SV', location: 'Uretral', gauge: '16Fr', insertionDate: new Date(Date.now() - 100000000).toISOString(), status: 'ACTIVE', lastCare: new Date().toISOString() }
        ],
        labReports: [],
        history: [
            { 
                id: 'e1', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Ingresa en planta. O2 a 2Lpm. Eupneico en reposo.', 
                vitals: { sat: '88', temp: '36.5', ta: '130/70', fc: '95', fr: '22', gcs: '15' }, 
                riskLevel: 'OBSERVATION', type: 'EVOLUTION'
            }
        ],
        risk: 'HIGH', news2: 7, task: 'Analgesia', nextTaskTime: '15 min', vitals: { fc: '90', sat: '94', ta: '135/75' }
    }
];

export const AuthService = {
    socialLogin: async (provider: 'GOOGLE' | 'APPLE'): Promise<User> => {
        if (provider !== 'GOOGLE') throw new Error('Only Google login is supported.');
        
        const googleProvider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, googleProvider);
        const fbUser = userCredential.user;
        
        let docSnap;
        try {
            docSnap = await getDoc(doc(db, DB_KEYS.STAFF, fbUser.uid));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `${DB_KEYS.STAFF}/${fbUser.uid}`);
        }
        
        if (docSnap && docSnap.exists()) {
            const u = docSnap.data() as User;
            localStorage.setItem('paesys_auth_token', JSON.stringify(u));
            return u;
        }
        
        const newStaff: User = {
            id: fbUser.uid, 
            email: fbUser.email || '', 
            name: fbUser.displayName || 'Usuario', 
            role: 'NURSE', 
            provider: 'GOOGLE',
            avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'U')}&background=0D9488&color=fff`,
            unit: 'General', 
            collegiateNumber: 'PENDIENTE',
            lastLogin: new Date().toISOString()
        };

        try {
            await setDoc(doc(db, DB_KEYS.STAFF, fbUser.uid), newStaff);
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `${DB_KEYS.STAFF}/${fbUser.uid}`);
        }
        
        localStorage.setItem('paesys_auth_token', JSON.stringify(newStaff));
        return newStaff;
    },
    login: async (email: string, password: string): Promise<User> => {
        // Fallback for mocked login to avoid breaking existing UI forms
        // Should really just use socialLogin now.
        return AuthService.socialLogin('GOOGLE');
    },
    register: async (email: string, password: string, name: string): Promise<User> => {
        // Fallback or disabled
        return AuthService.socialLogin('GOOGLE');
    },
    updateProfile: async (user: User): Promise<User> => {
        try {
            await setDoc(doc(db, DB_KEYS.STAFF, user.id!), user, { merge: true });
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `${DB_KEYS.STAFF}/${user.id!}`);
        }
        localStorage.setItem('paesys_auth_token', JSON.stringify(user));
        return user;
    },
    createSession: (user: User): User => {
        localStorage.setItem('paesys_auth_token', JSON.stringify(user));
        return user;
    },
    logout: async () => {
        await signOut(auth);
        localStorage.removeItem('paesys_auth_token');
    },
    getCurrentUser: (): User | null => {
        const data = localStorage.getItem('paesys_auth_token');
        if(!data || data === 'null') return null;
        try { return JSON.parse(data); } catch(e) { return null; }
    }
};

export const PatientService = {
    getAll: async (): Promise<Patient[]> => {
        let snapshot;
        try {
            snapshot = await getDocs(collection(db, DB_KEYS.PATIENTS));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, DB_KEYS.PATIENTS);
        }
        if (snapshot.empty) {
            // Seed
            for (const p of INITIAL_PATIENTS_SEED) {
                try {
                    await setDoc(doc(db, DB_KEYS.PATIENTS, p.id!), p);
                } catch (error) {
                    handleFirestoreError(error, OperationType.WRITE, `${DB_KEYS.PATIENTS}/${p.id!}`);
                }
            }
            return INITIAL_PATIENTS_SEED;
        }
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Patient));
    },
    getById: async (id: string): Promise<Patient | undefined> => {
        let d;
        try {
            d = await getDoc(doc(db, DB_KEYS.PATIENTS, id));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `${DB_KEYS.PATIENTS}/${id}`);
        }
        return d && d.exists() ? ({ ...d.data(), id: d.id } as Patient) : undefined;
    },
    admitPatient: async (patient: Patient): Promise<Patient> => {
        try {
            const newRef = doc(collection(db, DB_KEYS.PATIENTS));
            patient.id = newRef.id;
            await setDoc(newRef, patient);
            return patient;
        } catch (error: any) {
            // Ignore generic offline network errors if using persistent cache, otherwise handle
            if (error?.code !== 'unavailable') {
                handleFirestoreError(error, OperationType.CREATE, DB_KEYS.PATIENTS);
            }
            return patient;
        }
    },
    updatePatient: async (id: string, updates: Partial<Patient>): Promise<void> => {
        try {
            await updateDoc(doc(db, DB_KEYS.PATIENTS, id), updates);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `${DB_KEYS.PATIENTS}/${id}`);
        }
    },
    addEvolution: async (patientId: string, evolution: Evolution): Promise<void> => {
        let d;
        try {
            d = await getDoc(doc(db, DB_KEYS.PATIENTS, patientId));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `${DB_KEYS.PATIENTS}/${patientId}`);
        }
        if (d && d.exists()) {
            const data = d.data() as Patient;
            const history = [evolution, ...(data.history || [])];
            let vitals = data.vitals;
            if (evolution.vitals) vitals = { ...vitals, ...evolution.vitals };
            try {
                await updateDoc(doc(db, DB_KEYS.PATIENTS, patientId), { history, vitals });
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, `${DB_KEYS.PATIENTS}/${patientId}`);
            }
        }
    }
};

export const DrugService = {
    getAll: async (): Promise<Drug[]> => {
        let snapshot;
        try {
            snapshot = await getDocs(collection(db, DB_KEYS.DRUGS));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, DB_KEYS.DRUGS);
        }
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Drug));
    },
    add: async (drug: Drug): Promise<Drug> => {
        try {
            const newRef = doc(collection(db, DB_KEYS.DRUGS));
            drug.id = newRef.id;
            await setDoc(newRef, drug);
            return drug;
        } catch (error: any) {
            if (error?.code !== 'unavailable') {
                handleFirestoreError(error, OperationType.CREATE, DB_KEYS.DRUGS);
            }
            return drug;
        }
    },
    delete: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, DB_KEYS.DRUGS, id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `${DB_KEYS.DRUGS}/${id}`);
        }
    },
    update: async (id: string, updates: Partial<Drug>): Promise<void> => {
        try {
            await updateDoc(doc(db, DB_KEYS.DRUGS, id), updates);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `${DB_KEYS.DRUGS}/${id}`);
        }
    }
};

export const PathologyService = {
    getAll: async (): Promise<Pathology[]> => {
        let snapshot;
        try {
            snapshot = await getDocs(collection(db, DB_KEYS.PATHOLOGIES));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, DB_KEYS.PATHOLOGIES);
        }
        return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as Pathology));
    },
    add: async (path: Pathology): Promise<Pathology> => {
        try {
            const newRef = doc(collection(db, DB_KEYS.PATHOLOGIES));
            path.id = newRef.id;
            await setDoc(newRef, path);
            return path;
        } catch (error: any) {
            if (error?.code !== 'unavailable') {
                handleFirestoreError(error, OperationType.CREATE, DB_KEYS.PATHOLOGIES);
            }
            return path;
        }
    },
    delete: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, DB_KEYS.PATHOLOGIES, id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `${DB_KEYS.PATHOLOGIES}/${id}`);
        }
    },
    update: async (id: string, updates: Partial<Pathology>): Promise<void> => {
        try {
            await updateDoc(doc(db, DB_KEYS.PATHOLOGIES, id), updates);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, `${DB_KEYS.PATHOLOGIES}/${id}`);
        }
    }
};

export const ChatService = {
    getChannels: async (): Promise<ChatChannel[]> => {
        let snapshot;
        try {
            snapshot = await getDocs(collection(db, DB_KEYS.CHANNELS));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, DB_KEYS.CHANNELS);
        }
        let channels = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ChatChannel));
        
        if (channels.length === 0) {
            const initialChannels: ChatChannel[] = [
                { id: 'florence_direct', name: 'Florence AI', description: 'Asistente Clínico Inteligente', icon: 'Bot', type: 'GENERAL', members: ['u1', 'florence'] },
                { id: 'general', name: 'General', description: 'Chat general del equipo', icon: 'MessageSquare', type: 'GENERAL', members: ['u1', 'u2', 'u3', 'florence'] },
                { id: 'emergency', name: 'Urgencias', description: 'Alertas y emergencias', icon: 'AlertOctagon', type: 'EMERGENCY', members: ['u1', 'u2', 'u3'] },
                { id: 'staff', name: 'Solo Personal', description: 'Coordinación interna', icon: 'ShieldCheck', type: 'STAFF', members: ['u1', 'u2', 'u3'] }
            ];
            for (const ch of initialChannels) {
                try {
                    await setDoc(doc(db, DB_KEYS.CHANNELS, ch.id), ch);
                } catch (error) {
                    handleFirestoreError(error, OperationType.WRITE, `${DB_KEYS.CHANNELS}/${ch.id}`);
                }
            }
            channels = initialChannels;
        } else if (!channels.find((c: any) => c.id === 'florence_direct')) {
            const florenceChannel: ChatChannel = { id: 'florence_direct', name: 'Florence AI', description: 'Asistente Clínico Inteligente', icon: 'Bot', type: 'GENERAL', members: ['u1', 'florence'] };
            try {
                await setDoc(doc(db, DB_KEYS.CHANNELS, florenceChannel.id), florenceChannel);
            } catch (error) {
                handleFirestoreError(error, OperationType.WRITE, `${DB_KEYS.CHANNELS}/${florenceChannel.id}`);
            }
            channels.push(florenceChannel);
        }
        
        return channels.sort((a, b) => {
            if (a.id === 'florence_direct') return -1;
            if (b.id === 'florence_direct') return 1;
            if (a.id === 'general') return -1;
            if (b.id === 'general') return 1;
            if (a.id === 'emergency') return -1;
            if (b.id === 'emergency') return 1;
            return a.name.localeCompare(b.name);
        });
    },
    createChannel: async (channel: ChatChannel): Promise<ChatChannel> => {
        try {
            const newRef = doc(collection(db, DB_KEYS.CHANNELS));
            channel.id = newRef.id;
            await setDoc(newRef, channel);
            return channel;
        } catch (error: any) {
            if (error?.code !== 'unavailable') {
                handleFirestoreError(error, OperationType.CREATE, DB_KEYS.CHANNELS);
            }
            return channel;
        }
    },
    getMessages: async (channelId?: string): Promise<ChatMessage[]> => {
        let snapshot;
        try {
            snapshot = await getDocs(collection(db, DB_KEYS.MESSAGES));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, DB_KEYS.MESSAGES);
        }
        let allMsgs = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as ChatMessage));
        if (channelId) {
            allMsgs = allMsgs.filter((m: any) => m.channelId === channelId || (!m.channelId && channelId === 'general'));
        }
        return allMsgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    },
    clearMessages: async () => {
        let snapshot;
        try {
            snapshot = await getDocs(collection(db, DB_KEYS.MESSAGES));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, DB_KEYS.MESSAGES);
        }
        snapshot.docs.forEach(async (d) => {
            try {
                await deleteDoc(d.ref);
            } catch (error) {
                handleFirestoreError(error, OperationType.DELETE, `${DB_KEYS.MESSAGES}/${d.id}`);
            }
        });
    },
    getTeamMembers: async (): Promise<User[]> => {
        let snapshot;
        try {
            snapshot = await getDocs(collection(db, DB_KEYS.STAFF));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, DB_KEYS.STAFF);
        }
        const staff = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as User));
        const aiUser: User = { 
            id: 'florence', name: 'Florence AI', role: 'ADMIN', email: 'ai@paesys.com', 
            avatar: 'https://ui-avatars.com/api/?name=Florence+AI&background=7c3aed&color=fff', unit: 'Inteligencia Clínica'
        };
        if (staff.length < 2) {
            return [
                aiUser,
                { id: 'u2', name: 'Dr. Julián R.', role: 'ADMIN', email: 'julian@hosp.com', avatar: 'https://i.pravatar.cc/150?u=u2', unit: 'UCI' },
                { id: 'u3', name: 'Enf. Marta S.', role: 'NURSE', email: 'marta@hosp.com', avatar: 'https://i.pravatar.cc/150?u=u3', unit: 'Planta 3' }
            ];
        }
        return [aiUser, ...staff];
    },
    sendMessage: async (user: User, text: string, channelId: string = 'general', patientContext?: Patient, attachments?: any[], replyTo?: string) => {
        const newMsgPayload: Partial<ChatMessage> = { 
            id: `msg_${Date.now()}`, 
            userId: user.id!, 
            userName: user.name, 
            userAvatar: user.avatar, 
            role: user.role, 
            text, 
            timestamp: new Date().toISOString(),
            channelId,
            type: channelId === 'emergency' ? 'ALERT' : 'TEXT',
            readBy: [user.id!]
        };
        
        if (attachments !== undefined) newMsgPayload.attachments = attachments;
        if (replyTo !== undefined) newMsgPayload.replyTo = replyTo;

        const newMsg = newMsgPayload as ChatMessage;
        
        try {
            await setDoc(doc(db, DB_KEYS.MESSAGES, newMsg.id!), newMsg);
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `${DB_KEYS.MESSAGES}/${newMsg.id!}`);
        }
        window.dispatchEvent(new CustomEvent('messagesUpdated'));
        
        import('./geminiService').then(({ generateChatReply }) => {
            const isMentioned = text.toLowerCase().includes('@florence') || text.toLowerCase().includes('florence');
            const shouldReply = isMentioned || channelId === 'florence_direct' || (channelId !== 'staff' && patientContext);

            if (shouldReply) {
                ChatService.getMessages(channelId).then((history) => {
                    generateChatReply(text, 'MENTOR', patientContext, history).then(async (aiResponse) => {
                        
                        if (aiResponse.systemActions && aiResponse.systemActions.length > 0) {
                            for (const action of aiResponse.systemActions) {
                                if (action.type === 'UPDATE_PATIENT') {
                                    const { patientId, ...updates } = action.params;
                                    if (patientId) {
                                        const patientUpdates: Partial<Patient> = {};
                                        if (updates.diagnosis) patientUpdates.diagnosis = updates.diagnosis;
                                        if (updates.news2 !== undefined) patientUpdates.news2 = updates.news2;
                                        
                                        let vitalsUpdated = false;
                                        const newVitals: any = {};
                                        if (updates.vitals_fc) { newVitals.fc = updates.vitals_fc; vitalsUpdated = true; }
                                        if (updates.vitals_fr) { newVitals.fr = updates.vitals_fr; vitalsUpdated = true; }
                                        if (updates.vitals_ta) { newVitals.ta = updates.vitals_ta; vitalsUpdated = true; }
                                        if (updates.vitals_sat) { newVitals.sat = updates.vitals_sat; vitalsUpdated = true; }
                                        if (updates.vitals_temp) { newVitals.temp = updates.vitals_temp; vitalsUpdated = true; }
                                        if (updates.vitals_gcs) { newVitals.gcs = updates.vitals_gcs; vitalsUpdated = true; }
                                        
                                        if (vitalsUpdated) {
                                            patientUpdates.vitals = newVitals;
                                        }

                                        await PatientService.updatePatient(patientId, patientUpdates);

                                        if (updates.add_evolution_note) {
                                            const evoPayload: any = {
                                                id: `ev_${Date.now()}`,
                                                timestamp: new Date().toISOString(),
                                                note: updates.add_evolution_note,
                                                type: 'EVOLUTION',
                                                riskLevel: 'OBSERVATION'
                                            };
                                            if (vitalsUpdated) evoPayload.vitals = newVitals;
                                            
                                            await PatientService.addEvolution(patientId, evoPayload);
                                        }
                                    }
                                }
                            }
                        }

                        const aiMsg: ChatMessage = {
                            id: `msg_ai_${Date.now()}`, userId: 'florence', userName: 'Florence AI', 
                            userAvatar: "https://ui-avatars.com/api/?name=Florence+AI&background=7c3aed&color=fff",
                            role: 'ADMIN', text: JSON.stringify(aiResponse), timestamp: new Date().toISOString(), isSystem: true,
                            channelId,
                            type: 'SYSTEM',
                            replyTo: newMsg.id
                        };
                        try {
                            await setDoc(doc(db, DB_KEYS.MESSAGES, aiMsg.id!), aiMsg);
                        } catch (error) {
                            handleFirestoreError(error, OperationType.WRITE, `${DB_KEYS.MESSAGES}/${aiMsg.id!}`);
                        }
                        window.dispatchEvent(new CustomEvent('messagesUpdated'));
                    }).catch(console.error);
                });
            }
        });
    },
    addReaction: async (messageId: string, emoji: string, userId: string) => {
        let d;
        try {
            d = await getDoc(doc(db, DB_KEYS.MESSAGES, messageId));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `${DB_KEYS.MESSAGES}/${messageId}`);
        }
        if (d && d.exists()) {
            const msg = d.data() as ChatMessage;
            const reactions = msg.reactions || {};
            if (!reactions[emoji]) reactions[emoji] = [];
            if (!reactions[emoji].includes(userId)) {
                reactions[emoji].push(userId);
                try {
                    await updateDoc(doc(db, DB_KEYS.MESSAGES, messageId), { reactions });
                } catch (error) {
                    handleFirestoreError(error, OperationType.UPDATE, `${DB_KEYS.MESSAGES}/${messageId}`);
                }
                window.dispatchEvent(new CustomEvent('messagesUpdated'));
            }
        }
    },
    removeReaction: async (messageId: string, emoji: string, userId: string) => {
        let d;
        try {
            d = await getDoc(doc(db, DB_KEYS.MESSAGES, messageId));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `${DB_KEYS.MESSAGES}/${messageId}`);
        }
        if (d && d.exists()) {
            const msg = d.data() as ChatMessage;
            if (msg.reactions && msg.reactions[emoji]) {
                msg.reactions[emoji] = msg.reactions[emoji].filter((id: string) => id !== userId);
                if (msg.reactions[emoji].length === 0) {
                    delete msg.reactions[emoji];
                }
                try {
                    await updateDoc(doc(db, DB_KEYS.MESSAGES, messageId), { reactions: msg.reactions });
                } catch (error) {
                    handleFirestoreError(error, OperationType.UPDATE, `${DB_KEYS.MESSAGES}/${messageId}`);
                }
                window.dispatchEvent(new CustomEvent('messagesUpdated'));
            }
        }
    },
    deleteMessage: async (messageId: string) => {
        try {
            await deleteDoc(doc(db, DB_KEYS.MESSAGES, messageId));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `${DB_KEYS.MESSAGES}/${messageId}`);
        }
        window.dispatchEvent(new CustomEvent('messagesUpdated'));
    },
    togglePinMessage: async (messageId: string) => {
        let d;
        try {
            d = await getDoc(doc(db, DB_KEYS.MESSAGES, messageId));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `${DB_KEYS.MESSAGES}/${messageId}`);
        }
        if (d && d.exists()) {
            const msg = d.data() as ChatMessage;
            try {
                await updateDoc(doc(db, DB_KEYS.MESSAGES, messageId), { pinned: !msg.pinned });
            } catch (error) {
                handleFirestoreError(error, OperationType.UPDATE, `${DB_KEYS.MESSAGES}/${messageId}`);
            }
            window.dispatchEvent(new CustomEvent('messagesUpdated'));
        }
    }
};

export const TriageService = {
    saveSession: async (session: Omit<TriageSession, 'id'>): Promise<TriageSession> => {
        try {
            const newRef = doc(collection(db, DB_KEYS.TRIAGE_SESSIONS));
            const fullSession = { ...session, id: newRef.id } as TriageSession;
            await setDoc(newRef, fullSession);
            return fullSession;
        } catch (error: any) {
            if (error?.code !== 'unavailable') {
                handleFirestoreError(error, OperationType.CREATE, DB_KEYS.TRIAGE_SESSIONS);
            }
            return { ...session, id: `offline_${Date.now()}` } as TriageSession;
        }
    },
    getSessions: async (userId?: string): Promise<TriageSession[]> => {
        let snapshot;
        try {
            snapshot = await getDocs(collection(db, DB_KEYS.TRIAGE_SESSIONS));
        } catch (error) {
            handleFirestoreError(error, OperationType.LIST, DB_KEYS.TRIAGE_SESSIONS);
        }
        let sessions = snapshot.docs.map(d => ({ ...d.data(), id: d.id } as TriageSession));
        if (userId) {
            sessions = sessions.filter(s => s.userId === userId);
        }
        return sessions.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    getSessionById: async (id: string): Promise<TriageSession | null> => {
        let d;
        try {
            d = await getDoc(doc(db, DB_KEYS.TRIAGE_SESSIONS, id));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, `${DB_KEYS.TRIAGE_SESSIONS}/${id}`);
        }
        return d && d.exists() ? ({ ...d.data(), id: d.id } as TriageSession) : null;
    },
    deleteSession: async (id: string): Promise<void> => {
        try {
            await deleteDoc(doc(db, DB_KEYS.TRIAGE_SESSIONS, id));
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, `${DB_KEYS.TRIAGE_SESSIONS}/${id}`);
        }
    }
};
