import React, { useState } from 'react';
import { Search, X, AlertTriangle, CheckCircle, Info, ScanLine, FlaskConical } from 'lucide-react';

// Basic mock data for incompatibilities
const INCOMPATIBILITY_DB: Record<string, string[]> = {
    'Amiodarona': ['Heparina Sódica', 'Bicarbonato Sódico', 'Furosemida'],
    'Furosemida': ['Amiodarona', 'Dobutamina', 'Milrinona', 'Midazolam'],
    'Bicarbonato Sódico': ['Amiodarona', 'Calcio', 'Dobutamina', 'Dopamina', 'Adrenalina', 'Noradrenalina'],
    'Heparina Sódica': ['Amiodarona', 'Haloperidol', 'Gentamicina'],
    'Midazolam': ['Furosemida', 'Omeprazol', 'Pantoprazol'],
    'Fenitoína': ['Prácticamente todo (solo compatible con SF)'],
    'Propofol': ['Amikacina', 'Gentamicina', 'Levofloxacino'],
};

interface Props {
    onBack?: () => void;
}

export const IncompatibilitiesCalculator: React.FC<Props> = ({ onBack }) => {
    const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
    const [query, setQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    const availableDrugs = Object.keys(INCOMPATIBILITY_DB).filter(d => 
        !selectedDrugs.includes(d) && 
        d.toLowerCase().includes(query.toLowerCase())
    );

    const addDrug = (drug: string) => {
        if (!selectedDrugs.includes(drug)) {
            setSelectedDrugs([...selectedDrugs, drug]);
        }
        setQuery('');
    };

    const removeDrug = (drug: string) => {
        setSelectedDrugs(selectedDrugs.filter(d => d !== drug));
    };

    const checkCompatibility = () => {
        if (selectedDrugs.length < 2) return null;

        const conflicts: { drugA: string, drugB: string }[] = [];

        for (let i = 0; i < selectedDrugs.length; i++) {
            for (let j = i + 1; j < selectedDrugs.length; j++) {
                const drugA = selectedDrugs[i];
                const drugB = selectedDrugs[j];

                const incompA = INCOMPATIBILITY_DB[drugA] || [];
                const incompB = INCOMPATIBILITY_DB[drugB] || [];

                if (incompA.includes(drugB) || incompB.includes(drugA) || incompA.includes('Prácticamente todo (solo compatible con SF)') || incompB.includes('Prácticamente todo (solo compatible con SF)')) {
                    conflicts.push({ drugA, drugB });
                }
            }
        }

        return conflicts;
    };

    const conflicts = checkCompatibility();

    return (
        <div className="flex-1 flex flex-col bg-slate-50 animate-fade-in h-full overflow-hidden">
            <div className="bg-white border-b border-slate-200 p-6 sticky top-0 z-10 shadow-sm">
                {onBack && (
                    <button onClick={onBack} className="mb-4 p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors active:scale-95 lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    </button>
                )}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                            <FlaskConical className="w-6 h-6 text-indigo-600"/>
                            Calculadora Incompatibilidades en "Y"
                        </h2>
                        <p className="text-xs font-bold text-slate-500 mt-1">Verifique compatibilidad antes de administrar por la misma luz venosa.</p>
                    </div>
                    <button 
                        onClick={() => setIsScanning(!isScanning)}
                        className={`p-3 rounded-xl flex items-center gap-2 transition-all shadow-sm ${isScanning ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <ScanLine className="w-5 h-5"/>
                        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Escanear Código</span>
                    </button>
                </div>

                {isScanning && (
                    <div className="mb-6 p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="w-full max-w-sm aspect-video bg-black rounded-xl border-2 border-slate-700 relative overflow-hidden flex items-center justify-center">
                            <div className="absolute inset-0 border-4 border-indigo-500/30 m-4 rounded-lg"></div>
                            <div className="w-full h-0.5 bg-red-500 absolute top-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                            <p className="text-slate-500 text-xs font-bold z-10">Cámara Activa (Simulación)</p>
                        </div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-3">Apunte al código de barras del vial</p>
                        <button onClick={() => setIsScanning(false)} className="absolute top-2 right-2 text-slate-400 hover:text-white"><X className="w-5 h-5"/></button>
                    </div>
                )}

                <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5"/>
                    <input 
                        value={query} 
                        onChange={e => setQuery(e.target.value)} 
                        placeholder="Añadir fármaco a la vía..." 
                        className="w-full pl-10 p-3 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-bold placeholder:text-slate-400"
                    />
                    {query && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-20">
                            {availableDrugs.length > 0 ? (
                                availableDrugs.map(drug => (
                                    <button 
                                        key={drug} 
                                        onClick={() => addDrug(drug)}
                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 text-sm font-bold text-slate-700 transition-colors"
                                    >
                                        {drug}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-sm text-slate-500 font-bold">No se encontraron fármacos</div>
                            )}
                        </div>
                    )}
                </div>

                {selectedDrugs.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {selectedDrugs.map(drug => (
                            <div key={drug} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100">
                                <span className="text-xs font-black uppercase tracking-tight">{drug}</span>
                                <button onClick={() => removeDrug(drug)} className="text-indigo-400 hover:text-indigo-600"><X className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                <div className="max-w-3xl mx-auto">
                    {selectedDrugs.length < 2 ? (
                        <div className="text-center py-20">
                            <FlaskConical className="w-16 h-16 text-slate-200 mx-auto mb-4"/>
                            <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Añada al menos 2 fármacos</h3>
                            <p className="text-sm text-slate-500 font-bold mt-2">Para comprobar su compatibilidad en la misma luz venosa.</p>
                        </div>
                    ) : conflicts && conflicts.length > 0 ? (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-rose-50 border-l-[12px] border-rose-500 p-6 rounded-r-3xl shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className="w-8 h-8 text-rose-600"/>
                                    <h3 className="text-xl font-black text-rose-800 uppercase tracking-tighter">Incompatibilidad Detectada</h3>
                                </div>
                                <div className="space-y-3">
                                    {conflicts.map((c, i) => (
                                        <div key={i} className="bg-white p-4 rounded-xl border border-rose-100 flex items-center justify-between shadow-sm">
                                            <span className="font-black text-slate-700">{c.drugA}</span>
                                            <X className="w-5 h-5 text-rose-500 mx-4"/>
                                            <span className="font-black text-slate-700">{c.drugB}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs font-bold text-rose-700 mt-4 flex items-center gap-2">
                                    <Info className="w-4 h-4"/>
                                    No administrar por la misma luz. Riesgo de precipitación o inactivación.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-fade-in">
                            <div className="bg-emerald-50 border-l-[12px] border-emerald-500 p-6 rounded-r-3xl shadow-sm">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-8 h-8 text-emerald-600"/>
                                    <h3 className="text-xl font-black text-emerald-800 uppercase tracking-tighter">Vía Segura</h3>
                                </div>
                                <p className="text-sm font-bold text-emerald-700">No se han detectado incompatibilidades conocidas entre los fármacos seleccionados.</p>
                                <div className="mt-4 p-4 bg-white rounded-xl border border-emerald-100">
                                    <p className="text-xs font-bold text-slate-500 flex items-start gap-2">
                                        <Info className="w-4 h-4 shrink-0 text-emerald-500"/>
                                        Nota: Esta información es orientativa. Siempre lave la vía con suero fisiológico entre administraciones si no se administran en perfusión continua simultánea.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
