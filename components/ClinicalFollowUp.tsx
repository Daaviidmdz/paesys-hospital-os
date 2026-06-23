import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Patient, Evolution, ClinicalAnalysis, ChatMessage } from '../types';
import { analyzeClinicalNote, generateChatReply, FlorenceResponse, generatePatientProfileFromConversation } from '../services/geminiService';
import { PatientService } from '../services/firebaseMock';
import { ClipboardList, Search, User, AlertCircle, Monitor, Pill, BookOpen, FlaskConical, Cable, Megaphone, Ruler, PenTool, Activity, ShieldAlert, ArrowLeft, Bot, Send, X, Globe, Sparkles, Loader2, ChevronRight, Camera, Mic, Volume2, ShieldCheck, ExternalLink, Calendar, Clock, AlertTriangle, UserPlus, CheckCircle2, BrainCircuit, Plus } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { AdmissionModal } from './AdmissionModal';
import { CameraCapture } from './CameraCapture';
import { WoundAnalysis } from './WoundAnalysis';
import { MedicationSheet } from './MedicationSheet';
import { VitalSigns } from './VitalSigns';
import { AccessManager } from './AccessManager';
import { LabResults } from './LabResults';
import { CarePlanManager } from './CarePlanManager';
import { ShiftHandoff } from './ShiftHandoff';

const CLINICAL_MODULES = [
    { id: 'NOTES', label: 'Evolución', icon: PenTool, color: 'text-indigo-600' },
    { id: 'MONITOR', label: 'Monitor', icon: Monitor, color: 'text-emerald-600' },
    { id: 'MEDS', label: 'Fármacos', icon: Pill, color: 'text-blue-600' },
    { id: 'PAE', label: 'PAE', icon: BookOpen, color: 'text-violet-600' },
    { id: 'LABS', label: 'Laboratorio', icon: FlaskConical, color: 'text-purple-600' },
    { id: 'ACCESS', label: 'Disp.', icon: Cable, color: 'text-orange-600' },
    { id: 'WOUNDS', label: 'Heridas', icon: Ruler, color: 'text-rose-600' },
    { id: 'HANDOFF', label: 'Pase', icon: Megaphone, color: 'text-amber-600' },
] as const;

import { ViewState } from '../types';

export const ClinicalFollowUp: React.FC<{ initialPatientId?: string, onNavigate?: (view: ViewState) => void }> = ({ initialPatientId, onNavigate }) => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(initialPatientId || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [detailTab, setDetailTab] = useState<string>('NOTES');
    const [isFlorenceOpen, setIsFlorenceOpen] = useState(false);
    
    // Si cambia el prop mientras el componente ya está montado
    useEffect(() => {
        if (initialPatientId) {
            setSelectedPatientId(initialPatientId);
        }
    }, [initialPatientId]);
    
    const [showCamera, setShowCamera] = useState(false);
    const [showAdmissionModal, setShowAdmissionModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<ClinicalAnalysis | null>(null);
    const [noteText, setNoteText] = useState('');

    const [florenceMessages, setFlorenceMessages] = useState<ChatMessage[]>([]);
    const [florenceInput, setFlorenceInput] = useState('');
    const [isFlorenceTyping, setIsFlorenceTyping] = useState(false);

    const loadData = async () => {
        const data = await PatientService.getAll();
        setPatients(data);
    };

    useEffect(() => { loadData(); }, []);

    const selectedPatient = useMemo(() => patients.find(p => p.id === selectedPatientId), [patients, selectedPatientId]);

    const filteredPatients = useMemo(() => {
        const term = (searchTerm || '').toLowerCase().trim();
        return patients.filter(p => 
            (p.name || '').toLowerCase().includes(term) || 
            (p.bed || '').toLowerCase().includes(term) ||
            (p.diagnosis || '').toLowerCase().includes(term)
        );
    }, [patients, searchTerm]);

    const groupedHistory = useMemo(() => {
        if (!selectedPatient?.history) return {};
        const groups: Record<string, Evolution[]> = {};
        selectedPatient.history.forEach(h => {
            let label = new Date(h.timestamp).toLocaleDateString([], {day: 'numeric', month: 'long'});
            if (new Date(h.timestamp).toDateString() === new Date().toDateString()) label = 'Hoy';
            if (!groups[label]) groups[label] = [];
            groups[label].push(h);
        });
        return groups;
    }, [selectedPatient]);

    const handleSaveNote = async () => {
        if (!selectedPatientId || !noteText.trim()) return;
        const newNote: Evolution = {
            id: `ev-${Date.now()}`,
            timestamp: new Date().toISOString(),
            note: noteText,
            type: 'EVOLUTION',
            analysis: analysisResult || undefined
        };
        await PatientService.addEvolution(selectedPatientId, newNote);
        await loadData();
        setNoteText('');
        setAnalysisResult(null);
    };

    const handleAnalyzeNote = async () => {
        if (!noteText.trim()) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeClinicalNote(noteText);
            setAnalysisResult(result);
        } catch(e) { console.error(e); }
        finally { setIsAnalyzing(false); }
    };

    const handleFlorenceSend = async (textOverride?: string) => {
        const text = textOverride || florenceInput;
        if(!text.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), userId: 'me', userName: 'Yo', role: 'NURSE', text: text, timestamp: new Date().toISOString() };
        setFlorenceMessages(prev => [...prev, userMsg]);
        setFlorenceInput('');
        setIsFlorenceTyping(true);

        try {
            const response = await generateChatReply(text, 'MENTOR', selectedPatient || undefined);
            const aiMsg: ChatMessage = {
                id: 'ai-' + Date.now(), userId: 'florence', userName: 'Florence AI', role: 'ADMIN',
                text: JSON.stringify(response), timestamp: new Date().toISOString(), isSystem: true
            };
            setFlorenceMessages(prev => [...prev, aiMsg]);
        } catch(e) { console.error(e); }
        finally { setIsFlorenceTyping(false); }
    };

    return (
        <div className="flex h-full flex-col bg-slate-100 overflow-hidden font-sans">
            <header className="bg-slate-900 text-white border-b border-slate-800 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center z-20 shadow-xl shrink-0 transition-all">
                <div className="flex items-center gap-2 md:gap-3">
                    <button 
                        onClick={() => onNavigate ? onNavigate(ViewState.DASHBOARD) : window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'DASHBOARD' } }))}
                        className="p-1.5 -ml-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all md:hidden"
                    >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                    </button>
                    <div className="bg-indigo-600 p-1.5 md:p-2 rounded-lg md:rounded-xl"><ClipboardList className="w-4 h-4 md:w-5 md:h-5"/></div>
                    <div className="hidden sm:block">
                        <h1 className="text-sm md:text-lg font-black tracking-tight uppercase">Clinical <span className="text-indigo-400">v22</span></h1>
                        <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest">Unidad de Vigilancia</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <button 
                        onClick={() => {
                            setIsFlorenceOpen(true);
                            setFlorenceMessages([{
                                id: 'init',
                                userId: 'florence',
                                userName: 'Florence AI',
                                role: 'ADMIN',
                                text: 'Hola, soy Florence. Estoy lista para ayudarte con la evaluación de un nuevo paciente. Cuéntame sobre su motivo de ingreso, síntomas o antecedentes.',
                                timestamp: new Date().toISOString(),
                                isSystem: true
                            }]);
                        }} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black shadow-lg transition-all active:scale-95 border border-indigo-500 flex items-center gap-2"
                    >
                        <BrainCircuit className="w-3.5 h-3.5 md:w-4 md:h-4"/> <span className="hidden xs:inline">EVALUACIÓN IA</span><span className="xs:hidden">IA</span>
                    </button>
                    <button onClick={() => setShowAdmissionModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black shadow-lg transition-all active:scale-95 border border-emerald-500 flex items-center gap-2">
                        <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4"/> <span className="hidden xs:inline">ADMITIR</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <div className={`${selectedPatientId ? 'hidden lg:flex w-96' : 'flex w-full'} flex-col bg-white border-r border-slate-200 z-10 shadow-xl shrink-0`}>
                    <div className="p-5 border-b border-slate-100 bg-white">
                        <div className="relative">
                            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400"/>
                            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por nombre o cama..." className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"/>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50 custom-scrollbar">
                        {filteredPatients.map(patient => (
                            <button key={patient.id} onClick={() => setSelectedPatientId(patient.id)} className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${selectedPatientId === patient.id ? 'bg-white border-indigo-500 ring-2 ring-indigo-50 shadow-xl' : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'}`}>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-black text-sm text-slate-800 truncate pr-2 uppercase">{patient.name}</span>
                                        <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded">{patient.bed}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{patient.diagnosis}</p>
                                    <div className={`mt-2 inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${patient.risk === 'HIGH' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>NEWS2 {patient.news2}</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-slate-300 ml-3"/>
                            </button>
                        ))}
                    </div>
                </div>

                {selectedPatient ? (
                    <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden h-full">
                        <div className="bg-white border-b border-slate-200 shadow-sm p-4 md:p-6 shrink-0 z-10">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-4 min-w-0">
                                    <button onClick={() => setSelectedPatientId(null)} className="lg:hidden p-2.5 bg-slate-100 rounded-full text-slate-500"><ArrowLeft className="w-5 h-5"/></button>
                                    <div>
                                        <div className="flex items-center gap-3"><h2 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter truncate">{selectedPatient.name}</h2><span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg">{selectedPatient.bed}</span></div>
                                        <div className="flex gap-3 text-xs font-bold text-slate-400 uppercase mt-1"><span>{selectedPatient.age} Años</span><span>{selectedPatient.weight} kg</span><span className="text-rose-500 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5"/> {selectedPatient.allergies}</span></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => {
                                            setIsFlorenceOpen(true);
                                            const prompt = `Por favor, realiza una valoración estructurada y detallada del paciente ${selectedPatient.name} (Edad: ${selectedPatient.age}, Sexo: ${selectedPatient.sex}). Motivo / Diagnóstico: ${selectedPatient.diagnosis}. Analiza su historial, constantes y tratamiento actual para identificar riesgos y proponer sugerencias.`;
                                            handleFlorenceSend(prompt);
                                        }} 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-2xl shadow-xl active:scale-95 transition-all text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-indigo-500"
                                    >
                                        <BrainCircuit className="w-5 h-5"/>
                                        <span className="hidden sm:inline">Valoración IA</span>
                                    </button>
                                    <button onClick={() => setIsFlorenceOpen(true)} className="bg-gradient-to-tr from-violet-600 to-indigo-700 text-white p-3 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center">
                                        <Bot className="w-6 h-6"/>
                                    </button>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar scroll-smooth">{CLINICAL_MODULES.map(m => (
                                <button key={m.id} onClick={() => setDetailTab(m.id)} className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center whitespace-nowrap border-2 ${detailTab === m.id ? `bg-slate-900 text-white border-slate-900 shadow-xl` : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
                                    <m.icon className={`w-4 h-4 mr-2 ${detailTab === m.id ? 'text-indigo-400' : m.color}`}/> {m.label}
                                </button>
                            ))}</div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 custom-scrollbar pb-32">
                            <div className="max-w-5xl mx-auto">
                                {detailTab === 'NOTES' && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl relative overflow-hidden">
                                            <div className="flex justify-between items-center mb-6"><h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center"><PenTool className="w-4 h-4 mr-2 text-indigo-600"/> Evolución Enfermera</h3><div className="flex gap-2"><VoiceInput onTranscript={t => setNoteText(prev => prev + " " + t)} isCompact /><button onClick={() => setShowCamera(true)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-indigo-600"><Camera className="w-5 h-5"/></button></div></div>
                                            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Registre el estado del paciente..." className="w-full min-h-[160px] bg-slate-50/50 border-2 border-transparent rounded-3xl p-6 text-base font-bold text-slate-700 focus:bg-white focus:border-indigo-500/30 outline-none resize-none transition-all mb-6"/>
                                            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                                <button onClick={handleAnalyzeNote} disabled={!noteText.trim() || isAnalyzing} className="text-xs font-black text-indigo-600 flex items-center hover:bg-indigo-50 px-6 py-3 rounded-2xl transition-all disabled:opacity-50">{isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <Sparkles className="w-5 h-5 mr-2"/>} ANÁLISIS IA</button>
                                                <button onClick={handleSaveNote} disabled={!noteText.trim()} className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">REGISTRAR EVOLUCIÓN</button>
                                            </div>
                                            {analysisResult && (
                                                <div className="mt-6 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 animate-fade-in-up">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center"><BrainCircuit className="w-4 h-4 mr-2"/> Análisis Inteligente</h4>
                                                        <button onClick={() => setAnalysisResult(null)} className="text-slate-400 hover:text-rose-500"><X className="w-4 h-4"/></button>
                                                    </div>
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <div>
                                                                <div className="text-[9px] font-black text-slate-400 uppercase mb-2">Riesgos Detectados</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {analysisResult.detectedRisks.map((r, i) => <span key={i} className="text-[10px] font-bold bg-white text-rose-600 px-2 py-1 rounded-lg border border-rose-100">{r}</span>)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="text-[9px] font-black text-slate-400 uppercase mb-2">Sugerencias NANDA</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {analysisResult.suggestedNanda.map((n, i) => <span key={i} className="text-[10px] font-bold bg-white text-indigo-600 px-2 py-1 rounded-lg border border-indigo-100">{n}</span>)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm">
                                                            <div className="text-[9px] font-black text-indigo-400 uppercase mb-2">Resumen SBAR</div>
                                                            <p className="text-xs font-medium text-slate-600 leading-relaxed italic">{analysisResult.sbarSummary}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-6 pt-4 border-t border-indigo-100 flex justify-end">
                                                        <button 
                                                            onClick={() => {
                                                                if (selectedPatientId) {
                                                                    const newPae = {
                                                                        id: `pae-${Date.now()}`,
                                                                        nanda: analysisResult.suggestedNanda[0] || 'Diagnóstico sugerido',
                                                                        noc: (analysisResult.suggestedNoc || []).map((n, i) => ({ id: `noc-${i}`, label: n, score: 3, target: 5 })),
                                                                        nic: (analysisResult.suggestedNic || []).map((n, i) => ({ id: `nic-${i}`, label: n, completed: false })),
                                                                        status: 'ACTIVE' as const
                                                                    };
                                                                    PatientService.updatePatient(selectedPatientId, {
                                                                        activePae: [...(selectedPatient?.activePae || []), newPae]
                                                                    }).then(() => {
                                                                        loadData();
                                                                        setAnalysisResult(null);
                                                                    });
                                                                }
                                                            }}
                                                            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                                                        >
                                                            <Plus className="w-4 h-4"/> Aplicar al Plan de Cuidados
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-8">{Object.entries(groupedHistory).map(([date, entries]: [string, Evolution[]]) => (
                                            <div key={date} className="relative">
                                                <div className="sticky top-0 z-10 py-3 mb-6 bg-slate-50/90 backdrop-blur-xl flex items-center gap-4"><div className="bg-slate-200 px-3 py-1 rounded-xl text-[10px] font-black text-slate-600 uppercase tracking-widest border border-slate-300">{date}</div><div className="h-px bg-slate-300 flex-1"></div></div>
                                                <div className="space-y-6 relative ml-4 border-l-4 border-slate-200 pl-10">
                                                    {entries.map((h: Evolution) => (
                                                        <div key={h.id} className="relative bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm group">
                                                            <div className="absolute -left-[45px] top-6 w-5 h-5 bg-white border-4 border-indigo-600 rounded-full z-10 shadow-md"></div>
                                                            <div className="flex justify-between items-start mb-3"><span className="text-[11px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-1 rounded-lg flex items-center gap-1.5"><Clock className="w-4 h-4"/> {new Date(h.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div>
                                                            <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{h.note}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}</div>
                                    </div>
                                )}
                                {detailTab === 'MONITOR' && <VitalSigns history={selectedPatient.history} />}
                                {detailTab === 'MEDS' && <MedicationSheet prescriptions={selectedPatient.prescriptions || []} onUpdate={p => PatientService.updatePatient(selectedPatient.id, {prescriptions: p}).then(loadData)} />}
                                {detailTab === 'PAE' && <CarePlanManager patient={selectedPatient} carePlans={selectedPatient.activePae || []} onUpdate={p => PatientService.updatePatient(selectedPatient.id, {activePae: p}).then(loadData)} />}
                                {detailTab === 'LABS' && <LabResults reports={selectedPatient.labReports || []} />}
                                {detailTab === 'ACCESS' && <AccessManager devices={selectedPatient.activeDevices || []} onUpdate={d => PatientService.updatePatient(selectedPatient.id, {activeDevices: d}).then(loadData)} />}
                                {detailTab === 'WOUNDS' && (
                                    <WoundAnalysis 
                                        wounds={selectedPatient.wounds || []} 
                                        onAddWound={w => PatientService.updatePatient(selectedPatient.id, {wounds: [w, ...(selectedPatient.wounds||[])]}).then(loadData)} 
                                        onUpdatePae={(nanda, noc, nic) => {
                                            const newPae = {
                                                id: `pae-wound-${Date.now()}`,
                                                nanda,
                                                noc: noc.map((n, i) => ({ id: `noc-${i}`, label: n, score: 3, target: 5 })),
                                                nic: nic.map((n, i) => ({ id: `nic-${i}`, label: n, completed: false })),
                                                status: 'ACTIVE' as const
                                            };
                                            PatientService.updatePatient(selectedPatient.id, {
                                                activePae: [...(selectedPatient.activePae || []), newPae]
                                            }).then(loadData);
                                        }}
                                    />
                                )}
                                {detailTab === 'HANDOFF' && <ShiftHandoff patient={selectedPatient} onSendToChat={handleFlorenceSend} />}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-slate-50/50 text-slate-300">
                        <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-2xl mb-6"><User className="w-20 h-20 opacity-10"/></div>
                        <p className="text-sm font-black uppercase tracking-[0.4em]">Seleccione un Paciente</p>
                    </div>
                )}
            </div>

            {isFlorenceOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setIsFlorenceOpen(false)}></div>
                    <div className="w-full md:w-[600px] bg-slate-50 h-full shadow-2xl relative flex flex-col animate-slide-in-right border-l border-white/10">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shadow-2xl shrink-0">
                            <div className="flex items-center gap-4"><img src="https://ui-avatars.com/api/?name=Florence+AI&background=7c3aed&color=fff" className="w-12 h-12 rounded-2xl" alt="AI"/><div><h3 className="font-black text-xl tracking-tight uppercase">Florence AI <span className="text-indigo-400 text-xs ml-2 border border-indigo-500/50 px-2 py-0.5 rounded-full">v3.0</span></h3><div className="flex items-center text-[10px] font-black text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-full border border-indigo-500/30 w-fit mt-1"><Globe className="w-3.5 h-3.5 mr-2"/> EVALUACIÓN CLÍNICA</div></div></div>
                            <div className="flex items-center gap-2">
                                {!selectedPatient && florenceMessages.length > 1 && (
                                    <button 
                                        onClick={async () => {
                                            const history = florenceMessages.map(m => ({ role: m.userId === 'me' ? 'user' : 'model', text: m.text }));
                                            setIsFlorenceTyping(true);
                                            try {
                                                const profile = await generatePatientProfileFromConversation(history);
                                                // Open admission modal with pre-filled data or just admit
                                                const newPatient: Patient = {
                                                    id: `p-${Date.now()}`,
                                                    name: profile.name || 'Paciente Nuevo',
                                                    age: (profile.age || 0).toString(),
                                                    sex: profile.sex || 'M',
                                                    weight: (profile.weight || 70).toString(),
                                                    bed: profile.bed || 'SIN ASIGNAR',
                                                    diagnosis: profile.diagnosis || 'Evaluación pendiente',
                                                    allergies: profile.allergies || 'Ninguna conocida',
                                                    risk: profile.risk || 'MEDIUM',
                                                    news2: profile.news2 || 0,
                                                    type: 'STANDARD',
                                                    shiftGoal: 'Estabilización inicial',
                                                    checklist: {
                                                        idBand: true,
                                                        rails: true,
                                                        access: true,
                                                        hygiene: false,
                                                        medication: false,
                                                        diet: true,
                                                        ventilation: 'Aire ambiente',
                                                        immobilization: false
                                                    },
                                                    history: [{
                                                        id: 'h1',
                                                        timestamp: new Date().toISOString(),
                                                        type: 'EVOLUTION',
                                                        note: `Ingreso generado por evaluación IA Florence. Resumen: ${profile.diagnosis}`
                                                    }],
                                                    activePae: profile.activePae || [],
                                                    prescriptions: profile.prescriptions || [],
                                                    labReports: [],
                                                    activeDevices: [],
                                                    wounds: []
                                                };
                                                await PatientService.admitPatient(newPatient);
                                                await loadData();
                                                setIsFlorenceOpen(false);
                                                setSelectedPatientId(newPatient.id);
                                            } catch(e) { console.error(e); }
                                            finally { setIsFlorenceTyping(false); }
                                        }}
                                        className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4"/> GENERAR FICHA
                                    </button>
                                )}
                                <button onClick={() => setIsFlorenceOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6"/></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-100/30">
                            {/* Fix: explicit ChatMessage casting to resolve Property 'map' does not exist on type 'unknown' on line 193 */}
                            {florenceMessages && (florenceMessages as ChatMessage[]).map((msg: ChatMessage, i: number) => {
                                const isMe = msg.userId === 'me';
                                let data: FlorenceResponse | null = null;
                                if (!isMe) { try { data = msg.text?.trim().startsWith('{') ? (JSON.parse(msg.text) as FlorenceResponse) : null; } catch(e) { data = null; } }
                                const textValue = data ? data.answer : msg.text;
                                if (!textValue) return null;
                                return (
                                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                                        <div className={`max-w-[90%] p-5 rounded-[2rem] text-sm shadow-xl relative border ${isMe ? 'bg-indigo-600 text-white rounded-br-none border-indigo-500' : 'bg-white border-slate-200 text-slate-800 rounded-bl-none shadow-slate-200/50'}`}>
                                            {!isMe && data && (
                                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100"><span className="text-[10px] font-black text-violet-600 flex items-center gap-2 uppercase tracking-widest"><ShieldCheck className="w-4 h-4"/> JUICIO CLÍNICO</span><span className={`text-[8px] font-black px-2 py-0.5 rounded border ${data.confidence === 'HIGH' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>FIABILIDAD: {data.confidence}</span></div>
                                            )}
                                            <div className="whitespace-pre-wrap leading-relaxed font-medium">
                                                {/* Fix: ensure split result is explicitly cast to string[] to satisfy Property 'map' does not exist on type 'unknown' on line 207 */}
                                                {(String(textValue).split(/(\*\*.*?\*\*)/g) as string[]).map((part: string, idx: number) => 
                                                    part && part.startsWith('**') && part.endsWith('**') ? (
                                                        <strong key={idx} className={isMe ? "text-white" : "text-slate-900 dark:text-white font-black"}>
                                                            {part.slice(2, -2)}
                                                        </strong>
                                                    ) : (
                                                        part
                                                    )
                                                )}
                                            </div>

                                            {!isMe && data?.suggestedPae && (
                                                <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                                        <BrainCircuit className="w-3 h-3"/> Plan de Cuidados Sugerido
                                                    </div>
                                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                        <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">NANDA</div>
                                                        <div className="text-xs font-bold text-slate-700">{data.suggestedPae.nanda[0]?.label}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                                            <div className="text-[8px] font-bold text-emerald-600 uppercase mb-1">NOC</div>
                                                            <div className="text-[10px] font-medium text-slate-600 truncate">{data.suggestedPae.noc[0]?.result}</div>
                                                        </div>
                                                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                                                            <div className="text-[8px] font-bold text-amber-600 uppercase mb-1">NIC</div>
                                                            <div className="text-[10px] font-medium text-slate-600 truncate">{data.suggestedPae.nic[0]?.intervention}</div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => {
                                                            if (data?.suggestedPae && selectedPatientId) {
                                                                const newPae = {
                                                                    id: `pae-${Date.now()}`,
                                                                    nanda: data.suggestedPae.nanda[0]?.label || 'Diagnóstico sugerido',
                                                                    noc: Array.isArray(data.suggestedPae.noc) ? data.suggestedPae.noc.map((n, i) => ({ id: `noc-${i}`, label: n.result, score: 3, target: 5 })) : [],
                                                                    nic: Array.isArray(data.suggestedPae.nic) ? data.suggestedPae.nic.map((n, i) => ({ id: `nic-${i}`, label: n.intervention, completed: false })) : [],
                                                                    status: 'ACTIVE' as const
                                                                };
                                                                PatientService.updatePatient(selectedPatientId, {
                                                                    activePae: [...(selectedPatient?.activePae || []), newPae]
                                                                }).then(() => {
                                                                    loadData();
                                                                    setIsFlorenceOpen(false);
                                                                });
                                                            }
                                                        }}
                                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-2 rounded-lg shadow-md transition-all uppercase flex items-center justify-center gap-2"
                                                    >
                                                        <Plus className="w-3 h-3"/> Aplicar al Plan de Cuidados
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-6 bg-white border-t border-slate-200 shadow-2xl"><form onSubmit={(e) => { e.preventDefault(); handleFlorenceSend(); }} className="flex items-center gap-3"><div className="flex-1 bg-slate-100 rounded-[2rem] p-1.5 flex items-center border-2 border-transparent focus-within:border-indigo-500/20 focus-within:bg-white transition-all shadow-inner"><button type="button" className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors"><Mic className="w-5 h-5"/></button><input className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-sm font-bold text-slate-700 px-2" placeholder="Consulte guías v22..." value={florenceInput} onChange={e => setFlorenceInput(e.target.value)}/></div><button type="submit" disabled={!florenceInput.trim() || isFlorenceTyping} className="p-4 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-black transition-all active:scale-95 disabled:opacity-50"><Send className="w-6 h-6"/></button></form></div>
                    </div>
                </div>
            )}

            {showAdmissionModal && <AdmissionModal onClose={() => setShowAdmissionModal(false)} onSave={async (p) => { await PatientService.admitPatient(p); await loadData(); setShowAdmissionModal(false); }} />}
            {showCamera && <CameraCapture mode="PHOTO" onCapture={url => alert("Imagen capturada: " + url)} onClose={() => setShowCamera(false)} />}
        </div>
    );
};