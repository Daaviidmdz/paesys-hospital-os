
import React, { useState, useEffect } from 'react';
import { FluidEntry } from '../types';
import { Droplets, Plus, ArrowDown, ArrowUp, Trash2, AlertCircle, History } from 'lucide-react';

interface FluidBalanceProps {
    entries: FluidEntry[];
    onUpdate: (newEntries: FluidEntry[]) => void;
}

const IN_TYPES = ['ORAL', 'IV', 'SONDA', 'OTRO'];
const OUT_TYPES = ['ORINA', 'VOMITO', 'DRENAJE', 'HECES', 'OTRO'];

export const FluidBalance: React.FC<FluidBalanceProps> = ({ entries = [], onUpdate }) => {
    const [amount, setAmount] = useState('');
    const [selectedType, setSelectedType] = useState('INPUT');
    const [selectedSubtype, setSelectedSubtype] = useState(IN_TYPES[0]);

    useEffect(() => {
        if (selectedType === 'INPUT') setSelectedSubtype(IN_TYPES[0]);
        else setSelectedSubtype(OUT_TYPES[0]);
    }, [selectedType]);

    const handleAdd = () => {
        if (!amount || parseFloat(amount) <= 0) return;
        
        const newEntry: FluidEntry = {
            id: `fl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: selectedType as 'INPUT' | 'OUTPUT',
            subtype: selectedSubtype as any,
            amount: parseFloat(amount)
        };

        onUpdate([newEntry, ...entries]);
        setAmount('');
    };

    const handleDelete = (id: string) => {
        onUpdate(entries.filter(e => e.id !== id));
    };

    const totalIn = entries.filter(e => e.type === 'INPUT').reduce((acc, curr) => acc + curr.amount, 0);
    const totalOut = entries.filter(e => e.type === 'OUTPUT').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIn - totalOut;

    const getBalanceColor = () => {
        if (balance < -500) return 'text-rose-600';
        if (balance > 1500) return 'text-amber-600';
        return 'text-emerald-600';
    };

    return (
        <div className="flex flex-col h-full gap-6">
            
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                    <div className="text-[10px] font-black text-blue-400 uppercase mb-1 flex justify-center items-center gap-1"><ArrowDown className="w-3 h-3"/> Entradas</div>
                    <div className="text-2xl font-black text-blue-700">{totalIn} <span className="text-xs font-bold text-blue-400">ml</span></div>
                </div>
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                    <div className="text-[10px] font-black text-amber-400 uppercase mb-1 flex justify-center items-center gap-1"><ArrowUp className="w-3 h-3"/> Salidas</div>
                    <div className="text-2xl font-black text-amber-700">{totalOut} <span className="text-xs font-bold text-amber-400">ml</span></div>
                </div>
                <div className={`bg-white border border-slate-200 p-4 rounded-xl text-center shadow-sm ${balance < -500 || balance > 1500 ? 'ring-2 ring-rose-100' : ''}`}>
                    <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Balance 24h</div>
                    <div className={`text-2xl font-black ${getBalanceColor()}`}>{balance > 0 ? '+' : ''}{balance} <span className="text-xs font-bold text-slate-400">ml</span></div>
                </div>
            </div>

            {/* Input Form */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                    <button onClick={() => setSelectedType('INPUT')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectedType === 'INPUT' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>ENTRADA</button>
                    <button onClick={() => setSelectedType('OUTPUT')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${selectedType === 'OUTPUT' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'}`}>SALIDA</button>
                </div>
                
                <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar">
                    {(selectedType === 'INPUT' ? IN_TYPES : OUT_TYPES).map(t => (
                        <button 
                            key={t} 
                            onClick={() => setSelectedSubtype(t)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border whitespace-nowrap transition-colors ${selectedSubtype === t ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex gap-2">
                    <input 
                        type="number" 
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="Cantidad (ml)"
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button onClick={handleAdd} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all">
                        <Plus className="w-5 h-5"/>
                    </button>
                </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 rounded-xl border border-slate-200 p-2">
                {entries.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <Droplets className="w-8 h-8 mb-2 opacity-20"/>
                        <p className="text-xs font-bold uppercase">Sin registros hoy</p>
                    </div>
                )}
                <div className="space-y-2">
                    {entries.map(entry => (
                        <div key={entry.id} className="bg-white p-3 rounded-lg border border-slate-100 flex justify-between items-center group">
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-full ${entry.type === 'INPUT' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {entry.type === 'INPUT' ? <ArrowDown className="w-3 h-3"/> : <ArrowUp className="w-3 h-3"/>}
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-slate-700">{entry.subtype}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-black text-slate-800">{entry.amount} ml</span>
                                <button onClick={() => handleDelete(entry.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insight */}
            {(balance < -500 || balance > 1500 || (totalOut < 500 && entries.length > 0)) && (
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0"/>
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Análisis de Balance</div>
                        <p className="text-xs text-slate-600 font-medium leading-tight">
                            {balance < -1000 ? "Balance muy negativo. Valorar hidratación parenteral si no hay tolerancia oral." : 
                             balance > 1500 ? "Balance muy positivo. Vigilar signos de sobrecarga (edemas, crepitantes)." : 
                             totalOut < 500 ? "Oliguria detectada (<500ml/24h). Revisar función renal y obstrucción sonda." : "Balance desviado. Vigilar."}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
