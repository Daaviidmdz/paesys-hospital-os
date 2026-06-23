
import React, { useState } from 'react';
import { PaeEntry, NOC, NIC, Patient } from '../types';
import { Target, CheckCircle2, Circle, TrendingUp, BookOpen, ChevronDown, ChevronUp, Plus, Activity, Check, Sparkles, Loader2, BrainCircuit } from 'lucide-react';
import { getCarePlanSuggestions, generateCarePlanFromPatient } from '../services/geminiService';

interface CarePlanManagerProps {
    carePlans: PaeEntry[];
    patient?: Patient;
    onUpdate: (plans: PaeEntry[]) => void;
}

const LIKERT_SCALE = [
    { val: 1, label: 'Grave', color: 'bg-rose-500', text: 'text-rose-600' },
    { val: 2, label: 'Sustancial', color: 'bg-orange-500', text: 'text-orange-600' },
    { val: 3, label: 'Moderado', color: 'bg-amber-400', text: 'text-amber-600' },
    { val: 4, label: 'Leve', color: 'bg-lime-500', text: 'text-lime-600' },
    { val: 5, label: 'Ninguno', color: 'bg-emerald-500', text: 'text-emerald-600' }
];

export const CarePlanManager: React.FC<CarePlanManagerProps> = ({ carePlans = [], patient, onUpdate }) => {
    const [expandedId, setExpandedId] = useState<string | null>(carePlans.length > 0 ? carePlans[0].id : null);
    const [isSuggesting, setIsSuggesting] = useState<string | null>(null);
    const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

    const handleGeneratePlan = async () => {
        if (!patient) return;
        setIsGeneratingPlan(true);
        try {
            const suggestions = await generateCarePlanFromPatient(patient);
            if (suggestions && suggestions.length > 0) {
                const newPlans: PaeEntry[] = suggestions.map((s, idx) => ({
                    id: `pae-ai-${Date.now()}-${idx}`,
                    nanda: s.nanda,
                    noc: s.noc.map((n, i) => ({ id: `noc-ai-${Date.now()}-${i}`, label: n, score: 3, target: 5 })),
                    nic: s.nic.map((n, i) => ({ id: `nic-ai-${Date.now()}-${i}`, label: n, completed: false })),
                    status: 'ACTIVE'
                }));
                onUpdate([...carePlans, ...newPlans]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingPlan(false);
        }
    };

    const handleAiSuggest = async (plan: PaeEntry) => {
        setIsSuggesting(plan.id);
        try {
            const suggestions = await getCarePlanSuggestions(plan.nanda);
            const updated = carePlans.map(p => {
                if (p.id === plan.id) {
                    const newNoc = [...p.noc];
                    const newNic = [...p.nic];
                    
                    suggestions.noc.forEach((label, i) => {
                        if (!newNoc.find(n => n.label === label)) {
                            newNoc.push({ id: `noc-ai-${Date.now()}-${i}`, label, score: 3, target: 5 });
                        }
                    });
                    
                    suggestions.nic.forEach((label, i) => {
                        if (!newNic.find(n => n.label === label)) {
                            newNic.push({ id: `nic-ai-${Date.now()}-${i}`, label, completed: false });
                        }
                    });

                    return { ...p, noc: newNoc, nic: newNic };
                }
                return p;
            });
            onUpdate(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSuggesting(null);
        }
    };

    const toggleNic = (planId: string, nicId: string) => {
        const updated = carePlans.map(plan => {
            if (plan.id === planId) {
                return {
                    ...plan,
                    nic: plan.nic.map(n => n.id === nicId ? { ...n, completed: !n.completed } : n)
                };
            }
            return plan;
        });
        onUpdate(updated);
    };

    const updateNocScore = (planId: string, nocId: string, newScore: number) => {
        const updated = carePlans.map(plan => {
            if (plan.id === planId) {
                return {
                    ...plan,
                    noc: plan.noc.map(n => n.id === nocId ? { ...n, score: newScore } : n)
                };
            }
            return plan;
        });
        onUpdate(updated);
    };

    const resolvePlan = (planId: string) => {
        if(confirm("¿Marcar diagnóstico como RESUELTO?")) {
            const updated = carePlans.map(plan => plan.id === planId ? { ...plan, status: 'RESOLVED' as const } : plan);
            onUpdate(updated);
        }
    };

    const activePlans = carePlans.filter(p => p.status === 'ACTIVE');

    return (
        <div className="h-full flex flex-col gap-6">
            
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <BookOpen className="w-4 h-4 mr-2"/> Diagnósticos Activos ({activePlans.length})
                </h3>
                <div className="flex gap-2">
                    {patient && (
                        <button 
                            onClick={handleGeneratePlan}
                            disabled={isGeneratingPlan}
                            className="bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-200 transition-all flex items-center active:scale-95 disabled:opacity-50"
                        >
                            {isGeneratingPlan ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin"/> : <BrainCircuit className="w-3.5 h-3.5 mr-1.5"/>}
                            Sugerir Plan IA
                        </button>
                    )}
                    <button className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-700 transition-all flex items-center active:scale-95">
                        <Plus className="w-3.5 h-3.5 mr-1.5"/> Añadir NANDA
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pb-32">
                {activePlans.length === 0 && (
                    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 m-2">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-20"/>
                        <p className="text-xs font-bold uppercase opacity-60">Sin planes de cuidados activos</p>
                    </div>
                )}

                {activePlans.map(plan => (
                    <div key={plan.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                        {/* Header */}
                        <div 
                            className={`p-4 cursor-pointer flex items-center justify-between transition-colors ${expandedId === plan.id ? 'bg-indigo-50/50 border-b border-indigo-100' : 'hover:bg-slate-50'}`}
                            onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[9px] font-black text-white bg-indigo-500 px-2 py-0.5 rounded uppercase tracking-wide shadow-sm">NANDA</span>
                                    <h4 className="font-bold text-sm text-slate-800 leading-tight">{plan.nanda}</h4>
                                </div>
                                {plan.relatedTo && <p className="text-xs text-slate-500 font-medium italic pl-1">r/c {plan.relatedTo}</p>}
                            </div>
                            <div className={`p-1 rounded-full transition-transform duration-300 ${expandedId === plan.id ? 'bg-indigo-100 text-indigo-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
                                <ChevronDown className="w-4 h-4"/>
                            </div>
                        </div>

                        {/* Body */}
                        {expandedId === plan.id && (
                            <div className="p-5 space-y-8 animate-fade-in bg-white">
                                
                                <div className="flex items-center justify-between bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                    <div className="flex items-center gap-2">
                                        <BrainCircuit className="w-4 h-4 text-indigo-600"/>
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Asistente Florence</span>
                                    </div>
                                    <button 
                                        onClick={() => handleAiSuggest(plan)}
                                        disabled={isSuggesting === plan.id}
                                        className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-200 shadow-sm hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {isSuggesting === plan.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Sparkles className="w-3 h-3"/>}
                                        Sugerir Actividades
                                    </button>
                                </div>
                                
                                {/* NOC Section (Interactive Slider) */}
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                                        <Target className="w-3 h-3 mr-1.5 text-blue-500"/> Resultados NOC (Evolución)
                                    </h5>
                                    <div className="space-y-6">
                                        {plan.noc.map(noc => (
                                            <div key={noc.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-xs font-bold text-slate-700">{noc.label}</span>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase flex items-center bg-white px-2 py-1 rounded border border-slate-200">
                                                        Meta: <span className="text-indigo-600 ml-1 text-xs">{noc.target}/5</span>
                                                    </div>
                                                </div>
                                                
                                                {/* Visual Segmented Control */}
                                                <div className="flex gap-1 h-10 w-full">
                                                    {LIKERT_SCALE.map((step) => {
                                                        const isActive = step.val === noc.score;
                                                        return (
                                                            <button 
                                                                key={step.val}
                                                                onClick={() => updateNocScore(plan.id, noc.id, step.val)}
                                                                className={`flex-1 relative group transition-all duration-300 flex items-center justify-center ${isActive ? 'flex-[1.5]' : ''}`}
                                                            >
                                                                <div className={`w-full h-2 rounded-full transition-all duration-300 ${step.val <= noc.score ? step.color : 'bg-slate-200'}`}></div>
                                                                
                                                                {/* Indicator Knob */}
                                                                {isActive && (
                                                                    <div className={`absolute w-6 h-6 bg-white border-2 rounded-full shadow-md flex items-center justify-center text-[10px] font-black z-10 transition-all scale-110 ${step.text.replace('text', 'border')}`}>
                                                                        {step.val}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex justify-between mt-2 px-1">
                                                    <span className="text-[9px] font-bold text-rose-400 uppercase">Grave</span>
                                                    <span className="text-[9px] font-bold text-emerald-500 uppercase">Normal</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* NIC Section (Toggle Cards) */}
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                                        <CheckCircle2 className="w-3 h-3 mr-1.5 text-emerald-500"/> Intervenciones NIC (Turno)
                                    </h5>
                                    <div className="grid gap-2">
                                        {plan.nic.map(nic => (
                                            <button 
                                                key={nic.id} 
                                                onClick={() => toggleNic(plan.id, nic.id)}
                                                className={`flex items-center text-left p-3 rounded-xl border-2 transition-all active:scale-[0.99] touch-manipulation group ${nic.completed ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-indigo-200'}`}
                                            >
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 shrink-0 transition-colors ${nic.completed ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm' : 'border-slate-300 text-transparent group-hover:border-indigo-300'}`}>
                                                    <Check className="w-3.5 h-3.5 stroke-[3]"/>
                                                </div>
                                                <span className={`text-xs font-bold ${nic.completed ? 'text-emerald-800 opacity-70' : 'text-slate-700'}`}>{nic.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end border-t border-slate-100">
                                    <button onClick={() => resolvePlan(plan.id)} className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg transition-colors border border-emerald-200 flex items-center">
                                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5"/> MARCAR RESUELTO
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
