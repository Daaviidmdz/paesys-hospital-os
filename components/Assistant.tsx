import React, { useState, useRef, useEffect } from 'react';
import { getClinicalTriage } from '../services/geminiService';
import { TriageResult, Patient, ViewState, ViewParams } from '../types';
import { Bot, Send, Loader2, AlertCircle, CheckCircle, Activity, ClipboardCheck, History, Sparkles, Zap, HeartPulse, Brain, Thermometer, Wind, Mic, Clock, Siren, ShieldAlert, Stethoscope, ArrowRight, ArrowLeft, X, Copy, Check, ChevronRight, AlertTriangle, Baby, Bone, UserPlus, Calculator, CheckSquare, Square, BookOpen, AlertOctagon, Share2, HelpCircle, ChevronDown, ChevronUp, Camera, Image as ImageIcon, Volume2, Save, Plus, Home } from 'lucide-react';
import { VoiceInput } from './VoiceInput';
import { AdmissionModal } from './AdmissionModal';
import { CameraCapture } from './CameraCapture';
import { PatientService, TriageService, AuthService } from '../services/firebaseMock';
import { TOOLS_LIST } from './Calculators';
import { TriageSession } from '../types';

interface AssistantProps {
    onNavigate: (view: ViewState, params?: ViewParams) => void;
}

interface ChatMessage {
    id: string;
    role: 'USER' | 'AI';
    text?: string;
    imageBase64?: string;
    triageResult?: TriageResult;
    timestamp: string; 
    completedActions?: number[]; 
    isCollapsed?: boolean;
}

export const Assistant: React.FC<AssistantProps> = ({ onNavigate }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [isSaved, setIsSaved] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<TriageSession[]>([]);
  
  const currentUser = AuthService.getCurrentUser();

  const fetchSessions = async () => {
      if (currentUser) {
          const data = await TriageService.getSessions(currentUser.id);
          setSessions(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
  };

  useEffect(() => {
      if (showHistory) fetchSessions();
  }, [showHistory]);

  // PERSISTENCE: Initial load safely
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
      try {
        const saved = localStorage.getItem('paesys_triage_history');
        if(!saved || saved === 'null') return [{
            id: 'init',
            role: 'AI',
            text: 'Sistema de Triaje Activo. Escribe el motivo de consulta, constantes o sube una imagen clínica para valoración.',
            timestamp: new Date().toISOString()
        }];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
  });

  const [showAdmissionModal, setShowAdmissionModal] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [admissionData, setAdmissionData] = useState<Partial<Patient>>({});
  const [admissionSuccess, setAdmissionSuccess] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);

  const QUICK_ACTIONS = [
    { label: 'Dolor Torácico', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Dificultad Resp.', icon: Wind, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Síncope/Mareo', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Fiebre Alta', icon: Thermometer, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // AUTO-SAVE EFFECT
  useEffect(() => {
      setIsSaved(false);
      const timer = setTimeout(() => {
          localStorage.setItem('paesys_triage_history', JSON.stringify(messages));
          setIsSaved(true);
      }, 500);
      return () => clearTimeout(timer);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && !attachedImage) return;

    const userText = input;
    const userImage = attachedImage;
    setInput('');
    setAttachedImage(null);
    
    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'USER',
        text: userText,
        imageBase64: userImage || undefined,
        timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setShowQuickActions(false);

    const steps = userImage 
        ? ["Analizando imagen clínica...", "Interpretando hallazgos visuales...", "Generando informe de triaje..."]
        : ["Analizando sintomatología...", "Verificando protocolos...", "Clasificando urgencia..."];
    
    let stepIdx = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
        stepIdx = (stepIdx + 1) % steps.length;
        setLoadingStep(steps[stepIdx]);
    }, 400); // Reduced from 800 to 400 for better perceived performance

    try {
      const data = await getClinicalTriage(userText, userImage || undefined);
      clearInterval(stepInterval);
      const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'AI',
          triageResult: data,
          timestamp: new Date().toISOString(),
          completedActions: [],
          isCollapsed: false 
      };
      const updatedMessages = [...messages, userMsg, aiMsg];
      setMessages(updatedMessages);

      // Save to history
      if (currentUser) {
          await TriageService.saveSession({
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: new Date().toISOString(),
              patientDescription: userText || "Consulta con imagen",
              result: data,
              history: updatedMessages
          });
      }
    } catch (error) {
      clearInterval(stepInterval);
      setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'AI',
          text: "Error de conexión con el motor clínico. Inténtalo de nuevo.",
          timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleReset = () => {
      if(confirm("¿Reiniciar sesión de triaje? Se borrará el historial de esta pantalla.")) {
          setMessages([{
              id: 'init_' + Date.now(),
              role: 'AI',
              text: 'Sistema de Triaje Activo. Escribe el motivo de consulta, constantes o sube una imagen clínica.',
              timestamp: new Date().toISOString()
          }]);
      }
  };

  const loadSession = (session: TriageSession) => {
      setMessages(session.history.map((msg, i) => ({
          ...msg,
          id: `hist_${session.id}_${i}`
      })));
      setShowHistory(false);
  };

  const handleAdmission = (result: TriageResult) => {
      setAdmissionData({ 
          diagnosis: result.title, 
          admissionReason: result.justification, 
          vitals: result.vitals,
          sbar: result.sbar,
          activePae: result.suggestedPae ? [{
              id: `pae-${Date.now()}`,
              nanda: (result.suggestedPae.nanda && Array.isArray(result.suggestedPae.nanda)) ? (result.suggestedPae.nanda[0]?.label || 'Riesgo de deterioro') : 'Riesgo de deterioro',
              relatedTo: (result.suggestedPae.nanda && Array.isArray(result.suggestedPae.nanda)) ? result.suggestedPae.nanda[0]?.relatedTo : undefined,
              noc: Array.isArray(result.suggestedPae.noc) ? result.suggestedPae.noc.map((n, i) => ({ id: `noc-${i}`, label: n.result, score: 3, target: 5 })) : [],
              nic: Array.isArray(result.suggestedPae.nic) ? result.suggestedPae.nic.map((n, i) => ({ id: `nic-${i}`, label: n.intervention, completed: false })) : [],
              status: 'ACTIVE'
          }] : []
      });
      setShowAdmissionModal(true);
  };

  const onAdmissionSave = async (patient: Patient) => {
      await PatientService.admitPatient(patient);
      setAdmissionSuccess(true);
      setShowAdmissionModal(false);
      setTimeout(() => setAdmissionSuccess(false), 3000);
  };

  const toggleAction = (msgId: string, actionIndex: number) => {
      setMessages(prev => prev.map(msg => {
          if (msg.id !== msgId) return msg;
          const currentActions = msg.completedActions || [];
          const newActions = currentActions.includes(actionIndex) 
              ? currentActions.filter(i => i !== actionIndex)
              : [...currentActions, actionIndex];
          return { ...msg, completedActions: newActions };
      }));
  };

  const toggleCollapse = (msgId: string) => {
      setMessages(prev => prev.map(msg => msg.id === msgId ? { ...msg, isCollapsed: !msg.isCollapsed } : msg));
  };

  const handleSpeak = (text: string) => {
      if(isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); }
      else {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = 'es-ES'; u.onend = () => setIsSpeaking(false);
          setIsSpeaking(true); window.speechSynthesis.speak(u);
      }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-100 relative overflow-hidden font-sans">
       
       {admissionSuccess && (
           <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in-up">
               <CheckCircle className="w-6 h-6"/>
               <span className="font-bold text-sm">Paciente ingresado correctamente</span>
           </div>
       )}

       {/* Header with Save Indicator */}
       <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 md:p-4 shrink-0 flex items-center justify-between shadow-sm z-20 transition-colors">
           <div className="flex items-center gap-2 md:gap-3">
               <button 
                   onClick={() => onNavigate(ViewState.DASHBOARD)}
                   className="p-2 -ml-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                   title="Volver al Inicio"
               >
                   <Home className="w-5 h-5" />
               </button>
               <div className="bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 p-2 rounded-lg md:p-2.5 md:rounded-xl text-white shadow-lg">
                   <Siren className="w-4 h-4 md:w-5 md:h-5 animate-pulse"/>
               </div>
               <div>
                   <h2 className="text-xs md:text-sm font-black text-slate-800 dark:text-white uppercase tracking-wide">Triaje IA Manchester</h2>
                   <div className="flex items-center gap-2">
                       <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest">Protocolo Dinámico</p>
                       <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-full border border-slate-100 dark:border-slate-700">
                           <div className={`w-1.5 h-1.5 rounded-full ${isSaved ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                           <span className="text-[8px] font-black text-slate-400 uppercase">{isSaved ? 'Sincronizado' : 'Guardando...'}</span>
                       </div>
                   </div>
               </div>
           </div>
           <div className="flex items-center gap-1 md:gap-2">
               <button 
                   onClick={() => setShowHistory(true)} 
                   className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all text-[10px] md:text-xs font-bold"
                   title="Historial de Casos"
               >
                   <History className="w-3.5 h-3.5 md:w-4 md:h-4"/>
                   <span className="hidden sm:inline">Historial</span>
               </button>
               <button onClick={handleReset} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all" title="Nueva Sesión">
                   <Plus className="w-4 h-4 md:w-5 md:h-5"/>
               </button>
           </div>
       </div>

       {/* History Overlay */}
       {showHistory && (
           <div className="absolute inset-0 z-50 bg-slate-100 flex flex-col animate-fade-in">
               <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
                   <div className="flex items-center gap-3">
                       <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                           <History className="w-5 h-5"/>
                       </div>
                       <h3 className="font-black text-slate-800 uppercase tracking-wide text-sm">Historial de Triaje</h3>
                   </div>
                   <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                       <X className="w-6 h-6"/>
                   </button>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-3">
                   {sessions.length === 0 ? (
                       <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                           <History className="w-12 h-12 opacity-20"/>
                           <p className="font-bold text-sm uppercase tracking-widest">No hay sesiones guardadas</p>
                       </div>
                   ) : (
                       sessions.map(session => (
                           <div 
                               key={session.id} 
                               onClick={() => loadSession(session)}
                               className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
                           >
                               <div className="flex items-center justify-between mb-2">
                                   <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                                       session.result.level === 'RED' ? 'bg-rose-100 text-rose-600' :
                                       session.result.level === 'ORANGE' ? 'bg-orange-100 text-orange-600' :
                                       session.result.level === 'YELLOW' ? 'bg-amber-100 text-amber-600' :
                                       session.result.level === 'GREEN' ? 'bg-emerald-100 text-emerald-600' :
                                       'bg-blue-100 text-blue-600'
                                   }`}>
                                       {session.result.level}
                                   </div>
                                   <span className="text-[10px] font-bold text-slate-400">
                                       {new Date(session.timestamp).toLocaleString()}
                                   </span>
                               </div>
                               <h4 className="font-black text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors uppercase">{session.result.title}</h4>
                               <p className="text-xs text-slate-500 line-clamp-2 italic">"{session.patientDescription}"</p>
                               <div className="mt-3 flex items-center justify-between">
                                   <div className="flex items-center gap-2">
                                       <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500">
                                           {session.userName.charAt(0)}
                                       </div>
                                       <span className="text-[10px] font-bold text-slate-400">{session.userName}</span>
                                   </div>
                                   <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-all"/>
                               </div>
                           </div>
                       ))
                   )}
               </div>
           </div>
       )}

               {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-slate-50/50 pb-44">
            {showQuickActions && messages.length <= 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4 animate-fade-in">
                    {QUICK_ACTIONS.map((action, i) => (
                        <button 
                            key={i}
                            onClick={() => { setInput(action.label); }}
                            className="flex flex-col items-center gap-1.5 md:gap-3 p-3 md:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all active:scale-95 group"
                        >
                            <div className={`p-2.5 md:p-4 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                                <action.icon className="w-5 h-5 md:w-7 md:h-7"/>
                            </div>
                            <span className="text-[9px] md:text-[11px] font-black text-slate-600 uppercase tracking-tighter text-center">{action.label}</span>
                        </button>
                    ))}
                </div>
            )}
            {messages && messages.map((msg) => (
               <div key={msg.id} className={`flex ${msg.role === 'USER' ? 'justify-end' : 'justify-start'} animate-fade-in-up group px-1`}>
                   {msg.role === 'AI' && (
                       <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm mr-1.5 md:mr-2 shrink-0 self-start mt-1">
                           <Bot className="w-5 h-5 text-indigo-600"/>
                       </div>
                   )}
                    <div className={`max-w-[94%] md:max-w-[85%] lg:max-w-[650px] flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'}`}>
                        {(msg.text || msg.imageBase64) && (
                            <div className={`px-3.5 py-2 md:px-5 md:py-3.5 rounded-2xl text-xs md:text-sm font-medium shadow-sm leading-relaxed ${
                                msg.role === 'USER' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-600 rounded-bl-none italic'
                            }`}>
                                {msg.imageBase64 && (
                                    <div className="mb-2 rounded-lg overflow-hidden border border-white/20 shadow-md">
                                        <img src={msg.imageBase64} className="w-full h-auto max-h-48 md:max-h-56 object-cover" alt="Clínica"/>
                                    </div>
                                )}
                                {msg.text}
                            </div>
                        )}

                       {msg.triageResult && (
                           <div className="mt-3 w-full bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden ring-1 ring-black/5 animate-fade-in">
                               <div 
                                    className={`p-4 md:p-5 flex items-center justify-between relative overflow-hidden cursor-pointer transition-colors duration-500 ${
                                        msg.triageResult.level === 'RED' ? 'bg-rose-600 text-white' : 
                                        msg.triageResult.level === 'ORANGE' ? 'bg-orange-500 text-white' :
                                        msg.triageResult.level === 'YELLOW' ? 'bg-amber-400 text-white' :
                                        msg.triageResult.level === 'GREEN' ? 'bg-emerald-500 text-white' :
                                        'bg-blue-500 text-white'
                                    }`}
                                    onClick={() => toggleCollapse(msg.id)}
                                >
                                   <div className="relative z-10 w-full">
                                       <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                {msg.triageResult.level === 'RED' ? <Siren className="w-5 h-5 animate-pulse"/> : <CheckCircle className="w-5 h-5"/>}
                                                <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded backdrop-blur-sm shadow-sm">
                                                    Prioridad {msg.triageResult.priorityScore || (msg.triageResult.level === 'RED' ? '1' : msg.triageResult.level === 'ORANGE' ? '2' : msg.triageResult.level === 'YELLOW' ? '3' : msg.triageResult.level === 'GREEN' ? '4' : '5')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <button onClick={(e) => { e.stopPropagation(); handleSpeak(`${msg.triageResult!.title}. ${msg.triageResult!.justification}`); }} className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg">
                                                    <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse' : ''}`}/>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); toggleCollapse(msg.id); }} className="ml-1 bg-white/20 rounded-full p-1 transition-transform">
                                                    {msg.isCollapsed ? <ChevronDown className="w-4 h-4"/> : <ChevronUp className="w-4 h-4"/>}
                                                </button>
                                            </div>
                                       </div>
                                       <h3 className="text-lg md:text-2xl font-black leading-tight tracking-tight uppercase truncate">{msg.triageResult.title}</h3>
                                   </div>
                               </div>

                               {msg.triageResult.vitals && Object.keys(msg.triageResult.vitals).length > 0 && (
                                   <div className="bg-slate-50 border-b border-slate-100 px-3 md:px-4 py-2 md:py-3 flex gap-1.5 md:gap-2 overflow-x-auto custom-scrollbar shadow-inner">
                                       {Object.entries(msg.triageResult.vitals).map(([k, v]) => v && (
                                           <div key={k} className="flex items-center gap-1.5 md:gap-2 bg-white px-2.5 md:px-3 py-1.5 md:py-2 rounded-xl border border-slate-200 shadow-sm min-w-fit">
                                               <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase">{k}</span>
                                               <span className="text-[11px] md:text-xs font-black text-slate-800">{v}</span>
                                           </div>
                                       ))}
                                   </div>
                                )}

                               {!msg.isCollapsed && (
                                   <div className="p-4 md:p-6 space-y-4 md:space-y-6 animate-fade-in">
                                       <div className="bg-slate-50 p-3.5 md:p-4 rounded-2xl border border-slate-100 relative">
                                           <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-1.5 md:mb-2 flex items-center tracking-widest"><ClipboardCheck className="w-4 h-4 mr-1.5 text-indigo-500"/> Juicio Clínico</h4>
                                           <p className="text-xs md:text-sm font-semibold text-slate-700 leading-relaxed">{msg.triageResult.justification}</p>
                                       </div>

                                       {msg.triageResult.sbar && (
                                           <div className="grid grid-cols-2 md:grid-cols-2 gap-2 md:gap-4">
                                               <div className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                                                   <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-0.5 md:mb-1">Situación</div>
                                                   <p className="text-[10px] md:text-xs font-bold text-slate-700 line-clamp-2 md:line-clamp-none">{msg.triageResult.sbar.situation}</p>
                                               </div>
                                               <div className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                                                   <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-0.5 md:mb-1">Antecedentes</div>
                                                   <p className="text-[10px] md:text-xs font-bold text-slate-700 line-clamp-2 md:line-clamp-none">{msg.triageResult.sbar.background}</p>
                                               </div>
                                               <div className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                                                   <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-0.5 md:mb-1">Evaluación</div>
                                                   <p className="text-[10px] md:text-xs font-bold text-slate-700 line-clamp-2 md:line-clamp-none">{msg.triageResult.sbar.assessment}</p>
                                               </div>
                                               <div className="bg-slate-50 p-3 md:p-4 rounded-2xl border border-slate-100">
                                                   <div className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase mb-0.5 md:mb-1">Recomendación</div>
                                                   <p className="text-[10px] md:text-xs font-bold text-slate-700 line-clamp-2 md:line-clamp-none">{msg.triageResult.sbar.recommendation}</p>
                                               </div>
                                           </div>
                                       )}

                                       {msg.triageResult.suggestedPae && (
                                           <div className="bg-indigo-50/50 p-3.5 md:p-4 rounded-2xl border border-indigo-100 relative">
                                               <h4 className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase mb-2 md:mb-3 flex items-center tracking-widest"><Brain className="w-4 h-4 mr-1.5 text-indigo-500"/> Plan de Cuidados Sugerido</h4>
                                               <div className="space-y-3 md:space-y-4">
                                                   {Array.isArray(msg.triageResult.suggestedPae.nanda) && msg.triageResult.suggestedPae.nanda.map((n, i) => (
                                                       <div key={i} className="bg-white p-2.5 md:p-3 rounded-xl border border-indigo-100 shadow-sm">
                                                           <div className="text-[8px] md:text-[9px] font-black text-indigo-400 uppercase mb-0.5 md:mb-1">Diagnóstico NANDA</div>
                                                           <div className="text-[11px] md:text-xs font-bold text-slate-700">{n.label}</div>
                                                           <div className="text-[8px] md:text-[9px] text-slate-400 mt-0.5 md:mt-1 italic">Relacionado con: {n.relatedTo}</div>
                                                       </div>
                                                   ))}
                                                   <div className="grid grid-cols-2 gap-2 md:gap-3">
                                                       <div className="bg-white p-2.5 md:p-3 rounded-xl border border-emerald-100 shadow-sm">
                                                           <div className="text-[8px] md:text-[9px] font-black text-emerald-500 uppercase mb-0.5 md:mb-1">Resultados NOC</div>
                                                           <ul className="space-y-0.5 md:space-y-1">
                                                               {Array.isArray(msg.triageResult.suggestedPae.noc) && msg.triageResult.suggestedPae.noc.map((n, i) => (
                                                                   <li key={i} className="text-[9px] md:text-[10px] font-bold text-slate-600 flex items-center gap-1 md:gap-1.5">
                                                                       <div className="w-1 h-1 rounded-full bg-emerald-500"/> {n.result}
                                                                   </li>
                                                               ))}
                                                           </ul>
                                                       </div>
                                                       <div className="bg-white p-2.5 md:p-3 rounded-xl border border-amber-100 shadow-sm">
                                                           <div className="text-[8px] md:text-[9px] font-black text-amber-500 uppercase mb-0.5 md:mb-1">Intervenciones NIC</div>
                                                           <ul className="space-y-0.5 md:space-y-1">
                                                               {Array.isArray(msg.triageResult.suggestedPae.nic) && msg.triageResult.suggestedPae.nic.map((n, i) => (
                                                                   <li key={i} className="text-[9px] md:text-[10px] font-bold text-slate-600 flex items-center gap-1 md:gap-1.5">
                                                                       <div className="w-1 h-1 rounded-full bg-amber-500"/> {n.intervention}
                                                                   </li>
                                                               ))}
                                                           </ul>
                                                       </div>
                                                   </div>
                                               </div>
                                           </div>
                                       )}

                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                           <div>
                                               <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 md:mb-3 flex items-center tracking-widest"><ShieldAlert className="w-4 h-4 mr-1.5 text-rose-500"/> Plan de Acción</h4>
                                               <ul className="space-y-1.5 md:space-y-2">
                                                   {msg.triageResult.actions && msg.triageResult.actions.map((act, i) => (
                                                       <li key={i} onClick={() => toggleAction(msg.id, i)} className={`flex items-start gap-2 md:gap-3 text-[11px] md:text-sm p-2.5 md:p-3 rounded-xl cursor-pointer transition-all ${msg.completedActions?.includes(i) ? 'bg-emerald-50 text-slate-400 line-through' : 'bg-white border border-slate-100 hover:border-indigo-200 shadow-sm'}`}>
                                                           <div className={`mt-0.5 ${msg.completedActions?.includes(i) ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                               {msg.completedActions?.includes(i) ? <CheckSquare className="w-3.5 h-3.5 md:w-4 md:h-4"/> : <Square className="w-3.5 h-3.5 md:w-4 md:h-4"/>}
                                                           </div>
                                                           <span className="font-bold">{act}</span>
                                                       </li>
                                                   ))}
                                               </ul>
                                           </div>
                                           <div className="space-y-4 md:space-y-6">
                                               <div>
                                                   <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 md:mb-3 flex items-center tracking-widest"><Stethoscope className="w-4 h-4 mr-1.5 text-indigo-500"/> Pruebas</h4>
                                                   <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                       {msg.triageResult.tests && msg.triageResult.tests.map((t, i) => <span key={i} className="text-[10px] md:text-[11px] font-bold bg-white text-slate-600 px-2.5 md:px-3 py-1 md:py-1.5 rounded-xl border border-slate-200 shadow-sm">{t}</span>)}
                                                   </div>
                                               </div>
                                               {msg.triageResult.differential && (
                                                   <div>
                                                       <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase mb-2 md:mb-3 flex items-center tracking-widest"><HelpCircle className="w-4 h-4 mr-1.5 text-amber-500"/> Rule Out</h4>
                                                       <div className="flex flex-wrap gap-1.5 md:gap-2">
                                                           {msg.triageResult.differential.map((d, i) => <span key={i} className="text-[9px] md:text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg italic">{d}</span>)}
                                                       </div>
                                                   </div>
                                               )}
                                           </div>
                                       </div>
                                       <div className="bg-slate-100/50 p-2.5 md:p-3 grid grid-cols-2 gap-2 md:gap-3 -mx-4 md:-mx-6 -mb-4 md:-mb-6 mt-3 md:mt-4 border-t border-slate-100">
                                           <button onClick={() => onNavigate(ViewState.PATHOLOGIES, { query: msg.triageResult!.title })} className="bg-white hover:bg-slate-50 text-indigo-600 border border-slate-200 font-bold py-2.5 md:py-3.5 rounded-xl md:rounded-2xl shadow-sm transition-all flex items-center justify-center text-[10px] md:text-xs uppercase"><BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2"/> Ver Guía</button>
                                           <button onClick={() => handleAdmission(msg.triageResult!)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 md:py-3.5 rounded-xl md:rounded-2xl shadow-lg transition-all flex items-center justify-center text-[10px] md:text-xs uppercase"><Save className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2"/> Ingresar</button>
                                       </div>
                                   </div>
                               )}
                           </div>
                       )}
                       <span className="text-[9px] text-slate-400 mt-2 font-bold opacity-60 ml-1">
                           {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                   </div>
               </div>
           ))}
           {loading && (
               <div className="flex justify-start animate-fade-in pl-2">
                   <div className="bg-white px-6 py-5 rounded-3xl rounded-tl-none shadow-xl border border-indigo-100 flex flex-col gap-2 min-w-[240px]">
                       <div className="flex items-center gap-3">
                           <Loader2 className="w-5 h-5 text-indigo-600 animate-spin"/>
                           <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Analizando caso...</span>
                       </div>
                       <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-8 animate-pulse">{loadingStep}</div>
                   </div>
               </div>
           )}
           <div ref={messagesEndRef} />
       </div>

       {/* Floating Input Area */}
       <div className="absolute bottom-0 left-0 w-full p-2 md:p-4 z-30 safe-area-pb pointer-events-none">
           <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-1.5 md:p-2.5 pointer-events-auto ring-1 ring-black/5">
                
                {attachedImage && (
                    <div className="absolute -top-28 left-6 bg-white p-2.5 rounded-2xl shadow-2xl border border-slate-100 animate-fade-in-up">
                        <div className="relative group">
                            <img src={attachedImage} className="h-24 w-auto rounded-xl" alt="Preview"/>
                            <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-rose-500 text-white p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"><X className="w-3.5 h-3.5"/></button>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                    <div className={`flex-1 rounded-[2rem] border-2 transition-all flex items-center px-2 relative group shadow-inner ${input.trim() ? 'bg-white border-indigo-500/30 shadow-indigo-100/50' : 'bg-slate-100/80 border-transparent focus-within:border-indigo-500/20 focus-within:bg-white'}`}>
                        <button type="button" onClick={() => setShowCamera(true)} className={`p-2 md:p-3 transition-colors ${attachedImage ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`} title="Imagen">
                            <Camera className="w-5 h-5 md:w-6 md:h-6"/>
                        </button>
                       <textarea 
                           ref={textareaRef}
                           value={input}
                           onChange={(e) => setInput(e.target.value)}
                           placeholder="Edad, motivo de consulta, constantes..."
                           className="w-full bg-transparent border-none focus:ring-0 outline-none text-[13px] md:text-sm font-bold text-slate-700 p-3 md:p-4 max-h-32 min-h-[48px] md:min-h-[56px] resize-none placeholder:text-slate-400 rounded-[2rem]"
                           rows={1}
                           onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
                       />
                       <div className="flex items-center mr-1">
                            <VoiceInput onTranscript={(t) => setInput(p => p + ' ' + t)} isCompact />
                            {input && (
                                <button type="button" onClick={() => setInput('')} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                                    <X className="w-5 h-5"/>
                                </button>
                            )}
                       </div>
                   </div>
                   <button 
                       type="submit" 
                       disabled={(!input.trim() && !attachedImage) || loading}
                       className={`p-3 md:p-4 rounded-full shadow-xl transition-all flex items-center justify-center shrink-0 h-12 w-12 md:h-14 md:w-14 ${input.trim() || attachedImage ? 'bg-indigo-600 text-white hover:scale-105 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                   >
                       <Send className="w-5 h-5 md:w-6 md:h-6 ml-0.5"/>
                   </button>
                </form>
           </div>
           <p className="text-center text-[9px] text-slate-400 font-black uppercase tracking-widest mt-3 opacity-60">Soporte a la decisión clínica IA • Paesys v21.0</p>
       </div>

       {showAdmissionModal && <AdmissionModal onClose={() => setShowAdmissionModal(false)} onSave={onAdmissionSave} initialData={admissionData} />}
       {showCamera && <CameraCapture mode="PHOTO" onCapture={(img) => { setAttachedImage(img); setShowCamera(false); }} onClose={() => setShowCamera(false)} />}
    </div>
  );
};