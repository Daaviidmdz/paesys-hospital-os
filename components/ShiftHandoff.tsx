
import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { FileText, Copy, Send, Check, AlertCircle } from 'lucide-react';

interface ShiftHandoffProps {
    patient: Patient;
    onSendToChat: (text: string) => void;
}

export const ShiftHandoff: React.FC<ShiftHandoffProps> = ({ patient, onSendToChat }) => {
    const [isbar, setIsbar] = useState({
        i: '',
        s: '',
        b: '',
        a: '',
        r: ''
    });
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        generateSBAR();
    }, [patient]);

    const generateSBAR = () => {
        const activeAlerts = patient.news2 && patient.news2 >= 5 ? `⚠️ ALTO RIESGO (NEWS2: ${patient.news2})` : 'Estable';
        const pendingMeds = patient.prescriptions?.filter(p => !p.lastAdmin || new Date(p.nextAdmin || '').getTime() < new Date().getTime() + 3600000).length || 0;
        const activeLines = patient.activeDevices?.filter(d => d.status === 'ACTIVE').map(d => d.type).join(', ') || 'Ninguna';
        const paeStatus = patient.activePae?.length || 0;

        setIsbar({
            i: `Paciente: ${patient.name} (${patient.age}a). Cama: ${patient.bed}.`,
            s: `Dx: ${patient.diagnosis}.\nDía Ingreso: ${new Date().toLocaleDateString()}.\nAlerta: ${activeAlerts}.`,
            b: `Alergias: ${patient.allergies || 'No conocidas'}.\nAislamiento: ${patient.isolation || 'Ninguno'}.`,
            a: `Vía Aérea/Resp: ${patient.vitals?.sat || '--'}% SatO2.\nHemodinámica: TA ${patient.vitals?.ta || '--'}, FC ${patient.vitals?.fc || '--'}.\nNeurológico: GCS ${patient.vitals?.gcs || '--'}.\nAccesos: ${activeLines}.\nBalance Hídrico: ${patient.fluidBalance24h || 0}ml.\nPAE Activos: ${paeStatus} diagnósticos.`,
            r: `Pendientes: ${pendingMeds} medicaciones próximas.\nObjetivo Turno: ${patient.shiftGoal || 'Continuar cuidados'}.\nPlan: Continuar vigilancia y tratamiento pautado.`
        });
    };

    const getFormattedText = () => {
        return `**IDENTIFICACIÓN (I):**\n${isbar.i}\n\n**SITUACIÓN (S):**\n${isbar.s}\n\n**ANTECEDENTES (B):**\n${isbar.b}\n\n**EVALUACIÓN (A):**\n${isbar.a}\n\n**RECOMENDACIÓN (R):**\n${isbar.r}`;
    };

    const handleCopy = () => {
        if (!validateFields()) return;
        navigator.clipboard.writeText(getFormattedText());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSend = () => {
        if (!validateFields()) return;
        onSendToChat(getFormattedText());
    };

    const validateFields = () => {
        if (!isbar.i.trim() || !isbar.s.trim() || !isbar.b.trim() || !isbar.a.trim() || !isbar.r.trim()) {
            setError('Todos los campos de la estructura ISBAR son obligatorios para el traspaso.');
            return false;
        }
        setError('');
        return true;
    };

    return (
        <div className="h-full flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-4">
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl shrink-0">
                <h3 className="text-xs font-black text-indigo-800 uppercase mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2"/> Traspaso Estructurado (ISBAR)
                </h3>
                <p className="text-xs text-indigo-700 leading-relaxed">
                    La estructura ISBAR es obligatoria para garantizar la seguridad en el cambio de turno. Revisa y completa cada sección.
                </p>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs font-bold flex items-center shrink-0">
                    <AlertCircle className="w-4 h-4 mr-2"/> {error}
                </div>
            )}

            <div className="flex-1 space-y-3 min-h-0">
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1">Identificación (I)</label>
                    <textarea value={isbar.i} onChange={e => setIsbar({...isbar, i: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-16" placeholder="Identificación del paciente y tuya..." />
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1">Situación (S)</label>
                    <textarea value={isbar.s} onChange={e => setIsbar({...isbar, s: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20" placeholder="Motivo de ingreso, diagnóstico actual..." />
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1">Antecedentes (B)</label>
                    <textarea value={isbar.b} onChange={e => setIsbar({...isbar, b: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20" placeholder="Alergias, historia clínica relevante..." />
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1">Evaluación (A)</label>
                    <textarea value={isbar.a} onChange={e => setIsbar({...isbar, a: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32" placeholder="Constantes, examen físico, PAE..." />
                </div>
                <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-500 uppercase mb-1">Recomendación (R)</label>
                    <textarea value={isbar.r} onChange={e => setIsbar({...isbar, r: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-mono text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24" placeholder="Pendientes, plan de cuidados, objetivos..." />
                </div>
            </div>

            <div className="flex gap-3 shrink-0 mt-2">
                <button onClick={handleCopy} className="flex-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center">
                    {copied ? <Check className="w-4 h-4 mr-2 text-emerald-500"/> : <Copy className="w-4 h-4 mr-2"/>}
                    {copied ? 'COPIADO' : 'COPIAR TEXTO'}
                </button>
                <button onClick={handleSend} className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95">
                    <Send className="w-4 h-4 mr-2"/> ENVIAR TRASPASO
                </button>
            </div>
        </div>
    );
};
