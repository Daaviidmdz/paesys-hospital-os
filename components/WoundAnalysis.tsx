
import React, { useState } from 'react';
import { CameraCapture } from './CameraCapture';
import { analyzeWoundImage } from '../services/geminiService';
import { WoundEntry, WoundAnalysisResult } from '../types';
import { ScanLine, Ruler, Layers, AlertOctagon, Eye, EyeOff, Camera, Plus, ArrowRight, Activity, Calendar } from 'lucide-react';

interface WoundAnalysisProps {
    wounds: WoundEntry[];
    onAddWound: (entry: WoundEntry) => void;
    onUpdatePae?: (nanda: string, noc: string[], nic: string[]) => void;
}

export const WoundAnalysis: React.FC<WoundAnalysisProps> = ({ wounds = [], onAddWound, onUpdatePae }) => {
    const [showCamera, setShowCamera] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [privacyMode, setPrivacyMode] = useState(true);
    const [selectedWound, setSelectedWound] = useState<WoundEntry | null>(wounds.length > 0 ? wounds[0] : null);

    const handleCapture = async (imageData: string) => {
        setAnalyzing(true);
        try {
            const result = await analyzeWoundImage(imageData);
            
            const newEntry: WoundEntry = {
                id: `wound-${Date.now()}`,
                date: new Date().toISOString(),
                imageUrl: imageData,
                location: 'Sacro (Ejemplo)', // In real app, user selects this
                analysis: result
            };
            
            onAddWound(newEntry);
            setSelectedWound(newEntry);
        } catch (e) {
            alert("Error al analizar la herida.");
        } finally {
            setAnalyzing(false);
        }
    };

    // Comparison Logic (Previous vs Current)
    const previousWound = wounds.length > 1 && selectedWound 
        ? wounds.find(w => w.id !== selectedWound.id && new Date(w.date) < new Date(selectedWound.date)) 
        : null;

    const getTissueColor = (pct: number, type: string) => {
        if (type === 'GRAN') return `conic-gradient(#ef4444 ${pct}%, transparent 0)`; // Red
        if (type === 'SLOUGH') return `conic-gradient(#eab308 ${pct}%, transparent 0)`; // Yellow
        if (type === 'NECRO') return `conic-gradient(#1f2937 ${pct}%, transparent 0)`; // Black
        return '';
    };

    return (
        <div className="space-y-6 h-full flex flex-col">
            
            {/* Header / Toolbar */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-rose-100 p-2 rounded-lg text-rose-600"><Activity className="w-5 h-5"/></div>
                    <div>
                        <h3 className="font-black text-sm text-slate-800 uppercase">Clínica de Heridas</h3>
                        <p className="text-xs text-slate-500 font-bold">Seguimiento y Análisis IA</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setPrivacyMode(!privacyMode)} className={`p-2 rounded-lg border flex items-center gap-2 text-xs font-bold transition-all ${privacyMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}>
                        {privacyMode ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                        <span className="hidden md:inline">{privacyMode ? 'MODO PRIVADO' : 'VISIBLE'}</span>
                    </button>
                    <button onClick={() => setShowCamera(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                        <Camera className="w-4 h-4 mr-2"/> NUEVA CAPTURA
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid lg:grid-cols-2 gap-6 overflow-hidden">
                
                {/* LEFT: VISUALIZATION & COMPARISON */}
                <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                    
                    {/* Current Image Card */}
                    <div className="bg-black rounded-2xl overflow-hidden shadow-lg relative min-h-[300px] flex items-center justify-center group">
                        {analyzing ? (
                            <div className="text-center text-white">
                                <ScanLine className="w-12 h-12 text-emerald-400 animate-pulse mx-auto mb-4"/>
                                <p className="text-xs font-black uppercase tracking-widest animate-pulse">Escaneando Tejido...</p>
                            </div>
                        ) : selectedWound ? (
                            <>
                                <img 
                                    src={selectedWound.imageUrl} 
                                    className={`w-full h-full object-cover transition-all duration-500 ${privacyMode ? 'blur-xl opacity-50 group-hover:blur-md' : 'blur-0'}`} 
                                    alt="Wound"
                                />
                                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 to-transparent p-6 text-white">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1"/> {new Date(selectedWound.date).toLocaleDateString()}</div>
                                            <div className="text-lg font-black uppercase tracking-wide">Imagen Actual</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-black">{selectedWound.analysis.dimensions.areaCm2} <span className="text-sm font-medium text-slate-400">cm²</span></div>
                                            <div className="text-[10px] uppercase font-bold text-slate-500">Superficie</div>
                                        </div>
                                    </div>
                                </div>
                                {privacyMode && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-bold flex items-center">
                                            <EyeOff className="w-3 h-3 mr-2"/> Capa Oculta Activa
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-slate-500 flex flex-col items-center">
                                <Camera className="w-12 h-12 mb-2 opacity-20"/>
                                <span className="text-xs font-bold">Sin imágenes registradas</span>
                            </div>
                        )}
                    </div>

                    {/* Timeline / Comparison Strip */}
                    {wounds.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm overflow-x-auto whitespace-nowrap custom-scrollbar">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 sticky left-0">Historial Evolutivo</h4>
                            <div className="flex gap-3">
                                {wounds.map((w, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setSelectedWound(w)}
                                        className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${selectedWound?.id === w.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-100 opacity-60 hover:opacity-100'}`}
                                    >
                                        <img src={w.imageUrl} className={`w-full h-full object-cover ${privacyMode ? 'blur-sm' : ''}`} />
                                        <div className="absolute bottom-0 w-full bg-black/60 text-white text-[8px] font-bold text-center py-1">
                                            {new Date(w.date).toLocaleDateString()}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT: AI METRICS */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                    
                    {selectedWound ? (
                        <>
                            {/* 1. TISSUE COMPOSITION */}
                            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center"><Layers className="w-4 h-4 mr-2"/> Composición Tisular</h4>
                                <div className="flex gap-4 items-center justify-center py-2">
                                    {/* Granulation */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full relative bg-slate-100 flex items-center justify-center mb-2" style={{background: getTissueColor(selectedWound.analysis.tissueTypes.granulationPct, 'GRAN')}}>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xs font-black text-rose-600">{selectedWound.analysis.tissueTypes.granulationPct}%</div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Granulación</span>
                                    </div>
                                    {/* Slough */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full relative bg-slate-100 flex items-center justify-center mb-2" style={{background: getTissueColor(selectedWound.analysis.tissueTypes.sloughPct, 'SLOUGH')}}>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xs font-black text-yellow-600">{selectedWound.analysis.tissueTypes.sloughPct}%</div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Esfacelos</span>
                                    </div>
                                    {/* Necrotic */}
                                    <div className="flex flex-col items-center">
                                        <div className="w-16 h-16 rounded-full relative bg-slate-100 flex items-center justify-center mb-2" style={{background: getTissueColor(selectedWound.analysis.tissueTypes.necroticPct, 'NECRO')}}>
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-xs font-black text-slate-800">{selectedWound.analysis.tissueTypes.necroticPct}%</div>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Necrótico</span>
                                    </div>
                                </div>
                            </div>

                            {/* 2. DIMENSIONS & INFECTION */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center"><Ruler className="w-4 h-4 mr-2"/> Dimensiones</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium text-slate-600 border-b border-slate-50 pb-1">
                                            <span>Largo (cm)</span>
                                            <span className="font-bold text-slate-800">{selectedWound.analysis.dimensions.heightCm}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-slate-600 border-b border-slate-50 pb-1">
                                            <span>Ancho (cm)</span>
                                            <span className="font-bold text-slate-800">{selectedWound.analysis.dimensions.widthCm}</span>
                                        </div>
                                        <div className="flex justify-between text-xs font-medium text-slate-600 pt-1">
                                            <span>Área (cm²)</span>
                                            <span className="font-black text-indigo-600 text-sm">{selectedWound.analysis.dimensions.areaCm2}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={`p-5 rounded-xl shadow-sm border flex flex-col justify-between ${selectedWound.analysis.signs.infection ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                                    <h4 className={`text-xs font-black uppercase tracking-widest mb-2 flex items-center ${selectedWound.analysis.signs.infection ? 'text-rose-700' : 'text-emerald-700'}`}>
                                        <AlertOctagon className="w-4 h-4 mr-2"/> Signos Infección
                                    </h4>
                                    {selectedWound.analysis.signs.infection ? (
                                        <div className="space-y-1">
                                            {selectedWound.analysis.signs.erythema && <div className="text-[10px] font-bold text-rose-600 bg-white/50 px-2 py-1 rounded">• Eritema Perilesional</div>}
                                            {selectedWound.analysis.signs.exudate && <div className="text-[10px] font-bold text-rose-600 bg-white/50 px-2 py-1 rounded">• Exudado Purulento</div>}
                                            {selectedWound.analysis.signs.edema && <div className="text-[10px] font-bold text-rose-600 bg-white/50 px-2 py-1 rounded">• Edema Significativo</div>}
                                        </div>
                                    ) : (
                                        <div className="text-center py-2">
                                            <span className="text-2xl">👌</span>
                                            <div className="text-[10px] font-bold text-emerald-600 mt-1">Herida Limpia</div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 3. AI RECOMMENDATION */}
                            <div className="bg-indigo-600 text-white p-5 rounded-xl shadow-lg shadow-indigo-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-xs font-black uppercase tracking-widest opacity-80">Plan de Cura Sugerido</h4>
                                    {selectedWound.analysis.suggestedPae && onUpdatePae && (
                                        <button 
                                            onClick={() => {
                                                const pae = selectedWound.analysis.suggestedPae;
                                                if (pae) {
                                                    onUpdatePae(
                                                        pae.nanda[0]?.label || 'Deterioro de la integridad cutánea',
                                                        Array.isArray(pae.noc) ? pae.noc.map(n => n.result) : [],
                                                        Array.isArray(pae.nic) ? pae.nic.map(n => n.intervention) : []
                                                    );
                                                }
                                            }}
                                            className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-2"
                                        >
                                            <Plus className="w-3 h-3"/> Aplicar PAE
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm font-medium leading-relaxed">
                                    "{selectedWound.analysis.recommendation}"
                                </p>
                                {selectedWound.analysis.suggestedPae && (
                                    <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[8px] font-black uppercase opacity-60 mb-1">NANDA</div>
                                            <div className="text-[10px] font-bold truncate">{selectedWound.analysis.suggestedPae.nanda[0]?.label}</div>
                                        </div>
                                        <div>
                                            <div className="text-[8px] font-black uppercase opacity-60 mb-1">NIC Principal</div>
                                            <div className="text-[10px] font-bold truncate">{selectedWound.analysis.suggestedPae.nic[0]?.intervention}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                            <ArrowRight className="w-8 h-8 mb-2 opacity-20"/>
                            <p className="text-xs font-bold uppercase">Selecciona o captura una imagen</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {showCamera && (
                <CameraCapture 
                    mode="PHOTO" 
                    onCapture={handleCapture} 
                    onClose={() => setShowCamera(false)} 
                />
            )}
        </div>
    );
};
