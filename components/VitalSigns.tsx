import React from 'react';
import { Activity } from 'lucide-react';
import { Evolution } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VitalSignsProps {
    history: Evolution[];
}

export const VitalSigns: React.FC<VitalSignsProps> = ({ history }) => {
    // Filter history to entries with vitals
    const dataPoints = history
        .filter(h => h.vitals && h.vitals.fc)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(h => ({
            time: new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
            fc: parseInt(h.vitals?.fc || '0'),
            tas: parseInt(h.vitals?.ta?.split('/')[0] || '0'),
            tad: parseInt(h.vitals?.ta?.split('/')[1] || '0'),
            sat: parseInt(h.vitals?.sat || '0')
        }))
        .slice(-15); // Last 15 points

    if (dataPoints.length === 0) {
        return (
            <div className="bg-white rounded-xl p-6 border border-slate-200 text-center text-slate-400 flex flex-col items-center justify-center min-h-[200px]">
                <div className="bg-slate-50 p-3 rounded-full mb-3">
                    <Activity className="w-8 h-8 opacity-20"/>
                </div>
                <p className="text-xs font-bold uppercase tracking-wide">Sin datos suficientes</p>
                <p className="text-[10px] opacity-60 mt-1">Registre una nueva evolución</p>
            </div>
        );
    }

    const last = dataPoints[dataPoints.length - 1];

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden animate-fade-in">
            <div className="flex justify-between items-end mb-6 relative z-10">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-indigo-600"/> Evolución Constantes Vitales (24h)
                </h3>
                <div className="text-[10px] font-bold bg-indigo-50 px-2 py-1 rounded-lg text-indigo-600 border border-indigo-100">
                    {dataPoints.length} Registros
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 shadow-sm">
                    <div className="text-[10px] font-bold text-rose-500 uppercase">Frec. Cardíaca</div>
                    <div className="text-2xl font-black text-slate-900">{last.fc} <span className="text-xs text-rose-500 font-bold opacity-70">lpm</span></div>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 shadow-sm">
                    <div className="text-[10px] font-bold text-blue-500 uppercase">Tensión Arterial</div>
                    <div className="text-2xl font-black text-slate-900">{last.tas}/{last.tad} <span className="text-xs text-blue-500 font-bold opacity-70">mmHg</span></div>
                </div>
                <div className="bg-violet-50 p-3 rounded-2xl border border-violet-100 shadow-sm">
                    <div className="text-[10px] font-bold text-violet-500 uppercase">SatO2</div>
                    <div className="text-2xl font-black text-slate-900">{last.sat} <span className="text-xs text-violet-500 font-bold opacity-70">%</span></div>
                </div>
            </div>

            <div className="h-64 w-full bg-slate-50/50 rounded-2xl p-2 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} domain={['dataMin - 10', 'dataMax + 10']} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                            itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Line type="monotone" dataKey="tas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Tensión Sistólica (TAS)" />
                        <Line type="monotone" dataKey="tad" stroke="#93c5fd" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Tensión Diastólica (TAD)" />
                        <Line type="monotone" dataKey="fc" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Frecuencia Cardíaca (FC)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            
            <div className="h-48 w-full bg-slate-50/50 rounded-2xl p-2 border border-slate-100 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} domain={[80, 100]} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                        />
                        <Line type="monotone" dataKey="sat" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} name="Saturación O2 (SatO2)" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
