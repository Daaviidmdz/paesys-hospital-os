
import React, { useState, useEffect } from 'react';
import { Patient, ServiceType, PatientType } from '../types';
import { 
    UserPlus, BedDouble, Activity, AlertTriangle, ShieldAlert, Heart, Wind, 
    Thermometer, Brain, Stethoscope, Syringe, ClipboardList, CheckCircle2, 
    Baby, Bone, Ambulance, Siren, X, Save, Wand2, Biohazard, Droplets, Zap, Sparkles, Loader2
} from 'lucide-react';
import { extractPatientDataFromText } from '../services/geminiService';

interface AdmissionModalProps {
    onClose: () => void;
    onSave: (patient: Patient) => void;
    initialData?: Partial<Patient>; // Added prop for pre-filling
}

const SERVICES: { id: ServiceType, label: string, icon: any, color: string }[] = [
    { id: 'URGENCIAS', label: 'Urgencias', icon: Siren, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'UCI', label: 'UCI / Críticos', icon: Activity, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'PLANTA', label: 'Hosp. General', icon: BedDouble, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    { id: 'PEDIATRIA', label: 'Pediatría', icon: Baby, color: 'text-pink-600 bg-pink-50 border-pink-200' },
    { id: 'TRAUMA', label: 'Trauma', icon: Bone, color: 'text-slate-600 bg-slate-100 border-slate-200' },
];

export const AdmissionModal: React.FC<AdmissionModalProps> = ({ onClose, onSave, initialData }) => {
    // Step Control
    const [step, setStep] = useState(1); // 1: Filiación, 2: Clínica, 3: Plan

    // Form State with Initial Data Merge
    const [formData, setFormData] = useState({
        name: initialData?.name || '', 
        age: initialData?.age || '', 
        sex: initialData?.sex || 'M', 
        bed: initialData?.bed || '', 
        weight: initialData?.weight || '', 
        allergies: initialData?.allergies || '',
        service: initialData?.service || 'PLANTA' as ServiceType,
        diagnosis: initialData?.diagnosis || '', 
        reason: initialData?.admissionReason || '',
        isolation: initialData?.isolation || 'NONE',
        
        // Vitals
        fc: initialData?.vitals?.fc || '', 
        fr: initialData?.vitals?.fr || '', 
        tas: initialData?.vitals?.ta?.split('/')[0] || '', 
        tad: initialData?.vitals?.ta?.split('/')[1] || '', 
        sat: initialData?.vitals?.sat || '', 
        temp: initialData?.vitals?.temp || '', 
        gcs: initialData?.vitals?.gcs || '15',
        
        // Service Specifics
        ventilation: initialData?.checklist?.ventilation || '', 
        accessType: 'VVP', 
        immobilization: initialData?.checklist?.immobilization || false
    });

    // Auto-Computed Risks
    const [riskScore, setRiskScore] = useState(0); // NEWS2 or PEWS
    const [riskLevel, setRiskLevel] = useState<'LOW'|'MEDIUM'|'HIGH'>('LOW');
    const [autoAlerts, setAutoAlerts] = useState<string[]>([]);
    const [suggestedNIC, setSuggestedNIC] = useState<string[]>([]);
    const [isAiFilling, setIsAiFilling] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [showAiInput, setShowAiInput] = useState(false);

    // --- LOGIC: AUTO CALCULATOR & SUGGESTIONS ---
    useEffect(() => {
        // 1. Calculate NEWS2 (Simplified Logic)
        let score = 0;
        const rr = parseInt(formData.fr) || 16;
        const sat = parseInt(formData.sat) || 98;
        const hr = parseInt(formData.fc) || 80;
        const sbp = parseInt(formData.tas) || 120;
        const temp = parseFloat(formData.temp) || 36.5;

        // RR
        if (rr <= 8 || rr >= 25) score += 3;
        else if (rr >= 21) score += 2;
        // Sat
        if (sat <= 91) score += 3;
        else if (sat <= 93) score += 2;
        // HR
        if (hr <= 40 || hr >= 131) score += 3;
        else if (hr >= 111) score += 2;
        // BP
        if (sbp <= 90) score += 3;
        else if (sbp <= 100) score += 2;
        
        setRiskScore(score);
        setRiskLevel(score >= 7 ? 'HIGH' : score >= 5 ? 'MEDIUM' : 'LOW');

        // 2. Generate Alerts
        const alerts = [];
        if (score >= 5) alerts.push("ALTO RIESGO CLÍNICO");
        if (score >= 7) alerts.push("ACTIVAR MET/UCI");
        if (temp > 38.5 && hr > 100) alerts.push("POSIBLE SEPSIS");
        if (parseInt(formData.gcs) < 9) alerts.push("RIESGO VÍA AÉREA (GCS<9)");
        
        // Diagnosis based alerts
        const dx = (formData.diagnosis || '').toLowerCase();
        if (dx.includes('gripe') || dx.includes('covid') || dx.includes('tuber')) alerts.push("REQUIERE AISLAMIENTO");
        
        setAutoAlerts(alerts);

        // 3. Suggest Interventions (NIC)
        const nics = [];
        if (score >= 1) nics.push("Monitorización de signos vitales");
        if (sat < 94) nics.push("Oxigenoterapia");
        if (temp > 37.5) nics.push("Regulación de la temperatura");
        if (parseInt(formData.gcs) < 15) nics.push("Monitorización neurológica");
        if (formData.accessType === 'CVC') nics.push("Mantenimiento dispositivos acceso venoso central");
        if (formData.immobilization) nics.push("Cuidados de la inmovilización");
        
        setSuggestedNIC(nics);

    }, [formData]);

    // Handle Input Change
    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Auto-detect isolation from diagnosis keyword
        if (field === 'diagnosis') {
            const val = (value || '').toLowerCase();
            if (val.includes('covid') || val.includes('gripe')) setFormData(prev => ({ ...prev, isolation: 'DROPLET', diagnosis: value }));
            else if (val.includes('tuber') || val.includes('sarampion')) setFormData(prev => ({ ...prev, isolation: 'AIRBORNE', diagnosis: value }));
            else if (val.includes('clostrid') || val.includes('sarna')) setFormData(prev => ({ ...prev, isolation: 'CONTACT', diagnosis: value }));
        }
    };

    const handleSave = () => {
        // Map form data to Patient Object
        const patientType: PatientType = 
            formData.service === 'UCI' ? 'CRITICAL' : 
            formData.service === 'PEDIATRIA' ? 'PEDIATRIC' : 
            formData.service === 'TRAUMA' ? 'TRAUMA' : 
            formData.service === 'URGENCIAS' ? 'STANDARD' : 'STANDARD';

        const newPatient: Patient = {
            id: initialData?.id || `pat-${Date.now()}`, // Keep ID if passed (editing) or new
            name: formData.name,
            age: formData.age,
            sex: formData.sex as any,
            weight: formData.weight,
            type: patientType,
            service: formData.service,
            bed: formData.bed,
            allergies: formData.allergies || 'No conocidas',
            diagnosis: formData.diagnosis,
            admissionReason: formData.reason,
            isolation: formData.isolation as any,
            isDiabetic: false, // Could add field
            risk: riskLevel,
            news2: riskScore,
            trend: [80, 80, 80], // Dummy initial trend
            shiftGoal: 'Estabilización inicial',
            activePae: initialData?.activePae && initialData.activePae.length > 0 
                ? initialData.activePae 
                : suggestedNIC.map((nicLabel, i) => ({
                    id: `pae-${i}`,
                    nanda: 'Riesgo de deterioro',
                    noc: [{
                        id: `noc-${i}`,
                        label: 'Estado vital',
                        score: 3,
                        target: 5
                    }],
                    nic: [{
                        id: `nic-${i}`,
                        label: nicLabel,
                        completed: false
                    }],
                    status: 'ACTIVE'
                })),
            history: [],
            task: 'Valoración Ingreso',
            nextTaskTime: 'Ahora',
            vitals: { 
                fc: formData.fc, sat: formData.sat, 
                ta: `${formData.tas}/${formData.tad}`,
                temp: formData.temp, gcs: formData.gcs 
            },
            diet: 'NPO', // Default
            checklist: {
                idBand: true, rails: true, access: true, 
                hygiene: false, medication: false, diet: false,
                ventilation: formData.ventilation,
                immobilization: formData.immobilization
            }
        };

        onSave(newPatient);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
                
                {/* Header */}
                <div className="bg-slate-900 px-6 py-5 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-emerald-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-900/20">
                            <UserPlus className="w-6 h-6"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tight uppercase">Nueva Admisión Clínica</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase">Valoración Inicial Asistida</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setShowAiInput(!showAiInput)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[10px] font-black flex items-center gap-2 transition-all active:scale-95 border border-indigo-500 shadow-lg"
                        >
                            <Sparkles className="w-4 h-4" /> AUTO-COMPLETAR IA
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700">
                            <X className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {/* AI Input Area */}
                {showAiInput && (
                    <div className="bg-indigo-50 p-6 border-b border-indigo-100 animate-in slide-in-from-top duration-300">
                        <div className="max-w-2xl mx-auto">
                            <label className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">Pega el resumen clínico o nota de ingreso</label>
                            <div className="flex gap-3">
                                <textarea 
                                    className="flex-1 bg-white border-2 border-indigo-200 rounded-2xl p-4 text-sm font-bold text-slate-700 focus:border-indigo-500 outline-none min-h-[100px] shadow-inner"
                                    placeholder="Ej: Varón de 65 años con dolor torácico, TA 150/90, FC 110, sat 94%..."
                                    value={aiInput}
                                    onChange={(e) => setAiInput(e.target.value)}
                                />
                                <button 
                                    disabled={isAiFilling || !aiInput.trim()}
                                    onClick={async () => {
                                        setIsAiFilling(true);
                                        try {
                                            const data = await extractPatientDataFromText(aiInput);
                                            setFormData(prev => ({
                                                ...prev,
                                                name: data.name || prev.name,
                                                age: data.age?.toString() || prev.age,
                                                sex: data.sex || prev.sex,
                                                diagnosis: data.diagnosis || prev.diagnosis,
                                                reason: data.admissionReason || prev.reason,
                                                fc: data.vitals?.fc || prev.fc,
                                                fr: data.vitals?.fr || prev.fr,
                                                tas: data.vitals?.ta?.split('/')[0] || prev.tas,
                                                tad: data.vitals?.ta?.split('/')[1] || prev.tad,
                                                sat: data.vitals?.sat || prev.sat,
                                                temp: data.vitals?.temp || prev.temp,
                                                gcs: data.vitals?.gcs || prev.gcs,
                                                allergies: data.allergies || prev.allergies
                                            }));
                                            setShowAiInput(false);
                                            setAiInput('');
                                        } catch(e) { console.error(e); }
                                        finally { setIsAiFilling(false); }
                                    }}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 rounded-2xl font-black text-xs shadow-lg flex flex-col items-center justify-center gap-2 min-w-[120px] border border-indigo-500"
                                >
                                    {isAiFilling ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                                    <span>PROCESAR</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Progress Steps */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex gap-2">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`flex-1 h-1.5 rounded-full transition-all ${step >= s ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    
                    {/* STEP 1: FILIACIÓN Y SERVICIO */}
                    {step === 1 && (
                        <div className="space-y-6 md:space-y-8 animate-fade-in">
                            <div>
                                <h3 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center"><Ambulance className="w-4 h-4 mr-2"/> 1. Selección de Servicio</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
                                    {SERVICES.map(srv => (
                                        <button 
                                            key={srv.id} 
                                            onClick={() => handleChange('service', srv.id)}
                                            className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all ${formData.service === srv.id ? srv.color + ' shadow-md scale-[1.02]' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            <srv.icon className="w-6 h-6 mb-2"/>
                                            <span className="text-[10px] font-black uppercase">{srv.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nombre Completo</label>
                                        <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ej: Juan Pérez" value={formData.name} onChange={e => handleChange('name', e.target.value)}/>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Edad</label>
                                            <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="años" value={formData.age} onChange={e => handleChange('age', e.target.value)}/>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Sexo</label>
                                            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" value={formData.sex} onChange={e => handleChange('sex', e.target.value)}>
                                                <option value="M">H</option>
                                                <option value="F">M</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Cama</label>
                                            <input className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="30X" value={formData.bed} onChange={e => handleChange('bed', e.target.value)}/>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1 text-rose-500 flex items-center"><ShieldAlert className="w-3 h-3 mr-1"/> Alergias</label>
                                        <input className="w-full bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm font-bold text-rose-700 outline-none focus:ring-2 focus:ring-rose-500 placeholder-rose-300" placeholder="Alergias conocidas..." value={formData.allergies} onChange={e => handleChange('allergies', e.target.value)}/>
                                    </div>
                                </div>

                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                    <h4 className="text-xs font-black text-slate-400 uppercase mb-4">Motivo de Ingreso</h4>
                                    <input className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-bold mb-3 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Diagnóstico Principal..." value={formData.diagnosis} onChange={e => handleChange('diagnosis', e.target.value)}/>
                                    <textarea className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm h-32 resize-none outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Motivo de consulta, antecedentes relevantes..." value={formData.reason} onChange={e => handleChange('reason', e.target.value)}/>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: CLÍNICA Y CONSTANTES */}
                    {step === 2 && (
                        <div className="space-y-6 md:space-y-8 animate-fade-in">
                            <div className="flex flex-col lg:flex-row items-start gap-6">
                                <div className="flex-1 w-full space-y-6">
                                    <h3 className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4 flex items-center"><Activity className="w-4 h-4 mr-2"/> 2. Valoración Fisiológica</h3>
                                    
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {[
                                            { l: 'FC (lpm)', i: Heart, c: 'rose', v: formData.fc, k: 'fc' },
                                            { l: 'SatO2 (%)', i: Wind, c: 'cyan', v: formData.sat, k: 'sat' },
                                            { l: 'Temp (ºC)', i: Thermometer, c: 'amber', v: formData.temp, k: 'temp' },
                                            { l: 'Glasgow', i: Brain, c: 'purple', v: formData.gcs, k: 'gcs' },
                                        ].map((f, idx) => (
                                            <div key={idx} className="relative group">
                                                <label className={`text-[10px] font-bold uppercase mb-1 block text-${f.c}-600`}>{f.l}</label>
                                                <div className="relative">
                                                    <f.i className={`w-4 h-4 absolute left-3 top-3 text-${f.c}-400`}/>
                                                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 p-2.5 font-black text-lg outline-none focus:ring-2 focus:ring-indigo-500" value={f.v} onChange={e => handleChange(f.k, e.target.value)} placeholder="--"/>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Tensión Arterial</label>
                                            <div className="flex items-center gap-2">
                                                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-lg text-center outline-none focus:ring-2 focus:ring-indigo-500" placeholder="TAS" value={formData.tas} onChange={e => handleChange('tas', e.target.value)}/>
                                                <span className="text-slate-300">/</span>
                                                <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-lg text-center outline-none focus:ring-2 focus:ring-indigo-500" placeholder="TAD" value={formData.tad} onChange={e => handleChange('tad', e.target.value)}/>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Frec. Resp</label>
                                            <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-black text-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="rpm" value={formData.fr} onChange={e => handleChange('fr', e.target.value)}/>
                                        </div>
                                    </div>

                                    {/* DYNAMIC FIELDS PER SERVICE */}
                                    {formData.service === 'UCI' && (
                                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 animate-fade-in">
                                            <h4 className="text-xs font-black text-indigo-800 uppercase mb-3 flex items-center"><Activity className="w-3 h-3 mr-2"/> Soporte Avanzado (UCI)</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-indigo-600 uppercase mb-1 block">Ventilación</label>
                                                    <select className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-xs font-bold" value={formData.ventilation} onChange={e => handleChange('ventilation', e.target.value)}>
                                                        <option value="">Espontánea</option>
                                                        <option value="VMNI">VMNI / Gafas Alto Flujo</option>
                                                        <option value="VMI">Invasiva (Tubo ET)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-indigo-600 uppercase mb-1 block">Accesos</label>
                                                    <select className="w-full bg-white border border-indigo-200 rounded-lg p-2 text-xs font-bold" value={formData.accessType} onChange={e => handleChange('accessType', e.target.value)}>
                                                        <option value="VVP">Vía Periférica</option>
                                                        <option value="CVC">Vía Central</option>
                                                        <option value="PICC">PICC</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {formData.service === 'TRAUMA' && (
                                        <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 animate-fade-in flex items-center justify-between">
                                            <span className="text-xs font-black text-slate-600 uppercase flex items-center"><Bone className="w-4 h-4 mr-2"/> Inmovilización</span>
                                            <button onClick={() => handleChange('immobilization', !formData.immobilization)} className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.immobilization ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.immobilization ? 'translate-x-6' : ''}`}></div>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* REAL TIME RISK CALCULATOR */}
                                <div className="w-full lg:w-72 bg-slate-900 text-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-xl shrink-0 self-start lg:sticky lg:top-0">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center"><Wand2 className="w-4 h-4 mr-2 text-emerald-400"/> IA Monitor</h4>
                                    
                                    <div className="text-center mb-6">
                                        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Score {formData.service === 'PEDIATRIA' ? 'PEWS' : 'NEWS2'}</div>
                                        <div className={`text-6xl font-black tracking-tighter leading-none ${riskLevel === 'HIGH' ? 'text-rose-500' : riskLevel === 'MEDIUM' ? 'text-amber-400' : 'text-emerald-400'}`}>
                                            {riskScore}
                                        </div>
                                        <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase mt-2 ${riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                            Riesgo {riskLevel === 'HIGH' ? 'Alto' : riskLevel === 'MEDIUM' ? 'Medio' : 'Bajo'}
                                        </div>
                                    </div>

                                    {autoAlerts.length > 0 && (
                                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-2 mb-4">
                                            {autoAlerts.map((alert, i) => (
                                                <div key={i} className="flex items-center text-xs font-bold text-rose-300">
                                                    <AlertTriangle className="w-3 h-3 mr-2 shrink-0 animate-pulse"/> {alert}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase">Sugerencias IA</div>
                                        {formData.isolation !== 'NONE' && (
                                            <div className="flex items-center text-xs font-bold text-indigo-300 bg-indigo-500/10 p-2 rounded border border-indigo-500/30">
                                                <Biohazard className="w-3 h-3 mr-2"/> Aislamiento {formData.isolation}
                                            </div>
                                        )}
                                        {suggestedNIC.slice(0,2).map((nic, i) => (
                                            <div key={i} className="flex items-center text-xs font-medium text-slate-300 bg-white/5 p-2 rounded">
                                                <CheckCircle2 className="w-3 h-3 mr-2 text-emerald-500"/> {nic}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: RESUMEN Y PLAN */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in text-center py-10">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ClipboardList className="w-10 h-10 text-emerald-600"/>
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">Admisión Lista</h3>
                            <p className="text-slate-500 max-w-md mx-auto mb-8">
                                Se creará la ficha del paciente en <strong>{SERVICES.find(s=>s.id===formData.service)?.label}</strong> con un nivel de riesgo <strong>{riskLevel}</strong> y las alertas detectadas.
                            </p>
                            
                            <div className="flex justify-center gap-4">
                                <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 w-64">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Diagnóstico</div>
                                    <div className="font-bold text-slate-800 truncate">{formData.diagnosis || 'Pendiente'}</div>
                                </div>
                                <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 w-64">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Constantes</div>
                                    <div className="font-bold text-slate-800">TA {formData.tas}/{formData.tad} • Sat {formData.sat}%</div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-between shrink-0">
                    {step > 1 ? (
                        <button onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">
                            Atrás
                        </button>
                    ) : (
                        <div></div>
                    )}
                    
                    {step < 3 ? (
                        <button onClick={() => setStep(s => s + 1)} disabled={!formData.name || !formData.bed} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                            Siguiente
                        </button>
                    ) : (
                        <button onClick={handleSave} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center">
                            <Save className="w-4 h-4 mr-2"/> CONFIRMAR INGRESO
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};
