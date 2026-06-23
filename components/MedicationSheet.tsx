
import React, { useState } from 'react';
import { Prescription } from '../types';
import { Pill, Clock, Check, AlertTriangle, Plus, X, AlertOctagon, Sparkles, Loader2, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { checkDrugInteractions } from '../services/geminiService';

interface MedicationSheetProps {
    prescriptions: Prescription[];
    onUpdate: (updatedList: Prescription[]) => void;
}

export const MedicationSheet: React.FC<MedicationSheetProps> = ({ prescriptions, onUpdate }) => {
    const [interactionAlerts, setInteractionAlerts] = useState<string[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newMeds, setNewMeds] = useState<Partial<Prescription>>({ drugName: '', dose: '', route: 'IV', frequency: '24h', type: 'SCHEDULED' });

    const handleAdminister = (id: string) => {
        const now = new Date();
        const updated = prescriptions.map(p => {
            if (p.id === id) {
                let next = new Date(now);
                if (p.frequency.includes('8h')) next.setHours(next.getHours() + 8);
                else if (p.frequency.includes('12h')) next.setHours(next.getHours() + 12);
                else if (p.frequency.includes('24h')) next.setHours(next.getHours() + 24);
                return { ...p, lastAdmin: now.toISOString(), nextAdmin: p.type === 'SCHEDULED' ? next.toISOString() : undefined };
            }
            return p;
        });
        onUpdate(updated);
    };

    const handleCheckInteractions = async () => {
        const drugNames = prescriptions.map(p => p.drugName);
        if (drugNames.length < 2) return;
        setIsChecking(true);
        try {
            const alerts = await checkDrugInteractions(drugNames);
            setInteractionAlerts(alerts);
        } catch(e) { console.error(e); }
        finally { setIsChecking(false); }
    };

    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex gap-4">
                <button onClick={() => setShowAddModal(true)} className="flex-1 bg-indigo-600 text-white py-3 rounded-2xl text-xs font-black shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-5 h-5"/> AÑADIR ORDEN
                </button>
                <button onClick={handleCheckInteractions} disabled={isChecking || prescriptions.length < 2} className="flex-1 bg-white text-violet-600 border border-violet-200 py-3 rounded-2xl text-xs font-black shadow-sm hover:bg-violet-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {isChecking ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>} ANALIZAR CARRO
                </button>
            </div>

            {interactionAlerts.length > 0 && (
                <div className="bg-rose-50 p-5 rounded-3xl border border-rose-200 border-l-[12px] border-l-rose-500 animate-fade-in shadow-xl shadow-rose-900/5">
                    <h4 className="text-[10px] font-black text-rose-800 uppercase mb-3 flex items-center"><AlertOctagon className="w-4 h-4 mr-2"/> Alertas de Seguridad IA</h4>
                    <ul className="text-xs text-rose-700 space-y-2 font-bold ml-1">
                        {interactionAlerts.map((a, i) => <li key={i} className="flex gap-2"><span>•</span> {a}</li>)}
                    </ul>
                    <button onClick={() => setInteractionAlerts([])} className="mt-4 text-[9px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest">Desestimar alertas</button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 pb-20">
                {prescriptions.map(p => {
                    const isLate = p.nextAdmin && new Date(p.nextAdmin) < new Date();
                    return (
                        <div key={p.id} className={`p-5 rounded-[2rem] border transition-all shadow-sm ${isLate ? 'bg-rose-50 border-rose-200 ring-2 ring-rose-100' : 'bg-white border-slate-200'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase ${p.type === 'PRN' ? 'bg-amber-100 text-amber-700' : 'bg-slate-900 text-white'}`}>{p.type === 'PRN' ? 'Si precisa' : 'Programada'}</span>
                                        <span className="text-[9px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">{p.route}</span>
                                    </div>
                                    <h4 className="font-black text-lg text-slate-800 uppercase tracking-tight leading-none flex items-center gap-2">
                                        {p.drugName}
                                        {p.lastAdmin && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        )}
                                    </h4>
                                    <p className="text-sm font-bold text-indigo-600 mt-1">{p.dose} {p.route} <span className="text-slate-400 text-xs ml-1">/ {p.frequency}</span></p>
                                </div>
                                {p.lastAdmin && (
                                    <div className="text-right">
                                        <div className="text-[9px] font-black text-slate-400 uppercase mb-1">Última Admin</div>
                                        <div className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">{new Date(p.lastAdmin).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                                <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                    <Clock className={`w-4 h-4 ${isLate ? 'text-rose-500 animate-pulse' : ''}`}/>
                                    {p.nextAdmin ? <span>Próxima: <span className={isLate ? 'text-rose-600 font-black' : 'font-black text-slate-800'}>{new Date(p.nextAdmin).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></span> : 'Condicional'}
                                </div>
                                <button onClick={() => handleAdminister(p.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-emerald-900/10 active:scale-95 flex items-center gap-2">
                                    <Check className="w-4 h-4"/> CONFIRMAR 5C
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {showAddModal && (
                <div className="absolute inset-0 bg-white/95 z-30 p-6 flex flex-col animate-fade-in backdrop-blur-md">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="font-black text-xl text-slate-800 uppercase tracking-tighter">Nueva Orden Médica</h3>
                        <button onClick={() => setShowAddModal(false)}><X className="w-7 h-7 text-slate-400"/></button>
                    </div>
                    <div className="space-y-6 flex-1">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Fármaco (Principio Activo)</label>
                            <input value={newMeds.drugName} onChange={e => setNewMeds({...newMeds, drugName: e.target.value})} className="w-full bg-slate-100 border-2 border-transparent rounded-2xl p-4 text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all" placeholder="Ej: Piperacilina-Tazobactam"/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Dosis</label><input value={newMeds.dose} onChange={e => setNewMeds({...newMeds, dose: e.target.value})} className="w-full bg-slate-100 rounded-2xl p-4 text-sm font-bold outline-none" placeholder="Ej: 4g"/></div>
                            <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Frecuencia</label><select value={newMeds.frequency} onChange={e => setNewMeds({...newMeds, frequency: e.target.value})} className="w-full bg-slate-100 rounded-2xl p-4 text-sm font-bold outline-none"><option value="24h">Cada 24h</option><option value="12h">Cada 12h</option><option value="8h">Cada 8h</option><option value="6h">Cada 6h</option></select></div>
                        </div>
                    </div>
                    <button onClick={() => {onUpdate([...prescriptions, {...newMeds, id: `rx-${Date.now()}`, status:'ACTIVE'} as any]); setShowAddModal(false);}} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-indigo-900/20 active:scale-95 transition-all">REGISTRAR EN TRATAMIENTO</button>
                </div>
            )}
        </div>
    );
};
