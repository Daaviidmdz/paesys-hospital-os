import React from 'react';
import { ShieldAlert, AlertCircle, FileText, Activity } from 'lucide-react';
import { Patient } from '../../types';

interface PatientCardProps {
    patient: Patient;
    activeAlerts?: Record<string, any>;
    onNavigate: (view: any, params?: any) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, activeAlerts = {}, onNavigate }) => {
    return (
        <div className="group relative bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all overflow-hidden flex flex-col border-t-4 cursor-pointer" style={{borderTopColor: patient.risk === 'HIGH' || (patient.news2 && patient.news2 >= 7) ? '#f43f5e' : (patient.risk === 'MEDIUM' || (patient.news2 && patient.news2 >= 5) ? '#f59e0b' : '#10b981')}} onClick={() => onNavigate('FOLLOWUP', {patientId: patient.id})}>
            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-1 rounded-full uppercase tracking-wider">Ver Detalles ➔</span>
            </div>
            <div className="p-4 md:p-5 flex-1">
                <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className="flex gap-3 md:gap-4">
                        <div className="bg-slate-900 text-white font-black text-[10px] md:text-xs px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl h-fit">{patient.bed}</div>
                        <div className="min-w-0">
                            <h4 className="font-black text-sm text-slate-800 dark:text-white truncate uppercase">{patient.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase truncate">{patient.diagnosis}</p>
                                {patient.allergies && patient.allergies.toLowerCase() !== 'no conocidas' && (
                                    <span className="bg-rose-100 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase flex items-center gap-1">
                                        <ShieldAlert className="w-2 h-2"/> NAM
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[9px] md:text-[10px] font-black ${patient.risk === 'HIGH' || (patient.news2 && patient.news2 >= 7) ? 'bg-rose-50 text-rose-600 border border-rose-200' : (patient.risk === 'MEDIUM' || (patient.news2 && patient.news2 >= 5) ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200')}`}>NEWS2 {patient.news2}</div>
                </div>
                
                {patient.vitals && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {patient.vitals.ta && <span className="text-[10px] bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-300"><b>TA:</b> {patient.vitals.ta}</span>}
                        {patient.vitals.fc && <span className="text-[10px] bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-300"><b>FC:</b> {patient.vitals.fc}</span>}
                        {patient.vitals.sat && <span className="text-[10px] bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-300"><b>SatO2:</b> {patient.vitals.sat}%</span>}
                        {patient.vitals.temp && <span className="text-[10px] bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded font-mono text-slate-600 dark:text-slate-300"><b>Tª:</b> {patient.vitals.temp}</span>}
                    </div>
                )}

                {activeAlerts[patient.id] && (
                    <div className="flex items-center gap-2 p-2 md:p-2.5 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-xl animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500"/>
                        <span className="text-[9px] md:text-[10px] font-black text-rose-700 dark:text-rose-400 uppercase">{activeAlerts[patient.id].title}</span>
                    </div>
                )}
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 flex gap-2 md:gap-3 border-t border-slate-100 dark:border-slate-700">
                <button onClick={(e) => { e.stopPropagation(); onNavigate('FOLLOWUP', {patientId: patient.id}); }} className="flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center gap-1.5 md:gap-2 uppercase tracking-wide active:scale-95 transition-transform">
                    <FileText className="w-3 h-3 md:w-3.5 md:h-3.5"/> HISTORIAL
                </button>
                <button onClick={(e) => { e.stopPropagation(); onNavigate('FOLLOWUP', {patientId: patient.id}); }} className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-[9px] md:text-[10px] font-black shadow-lg flex items-center justify-center gap-1.5 md:gap-2 uppercase tracking-wide active:scale-95 transition-transform">
                    <Activity className="w-3 h-3 md:w-3.5 md:h-3.5"/> EVOLUCIÓN
                </button>
            </div>
        </div>
    );
};
