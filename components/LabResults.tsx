
import React, { useState } from 'react';
import { LabReport, LabParameter } from '../types';
import { FlaskConical, AlertTriangle, Calendar, ChevronDown, ChevronUp, Activity } from 'lucide-react';

interface LabResultsProps {
    reports: LabReport[];
}

// Sub-component for Range Visualization
const RangeVisualizer = ({ value, min, max, unit }: { value: number, min: number, max: number, unit: string }) => {
    // Calculate percentage position relative to range, with padding for out-of-bound values
    const range = max - min;
    const padding = range * 0.2; // 20% padding visual
    const displayMin = min - padding;
    const displayMax = max + padding;
    const totalRange = displayMax - displayMin;
    
    let percent = ((value - displayMin) / totalRange) * 100;
    percent = Math.min(Math.max(percent, 0), 100); // Clamp 0-100

    const isLow = value < min;
    const isHigh = value > max;
    const isCritical = isLow || isHigh;

    // Range Marker Position
    const startRangePct = ((min - displayMin) / totalRange) * 100;
    const widthRangePct = ((max - min) / totalRange) * 100;

    return (
        <div className="mt-2 w-full">
            {/* Bar Container */}
            <div className="relative h-2 bg-slate-100 rounded-full w-full overflow-hidden">
                {/* Normal Range Zone */}
                <div 
                    className="absolute h-full bg-slate-300/50 rounded-sm" 
                    style={{ left: `${startRangePct}%`, width: `${widthRangePct}%` }}
                />
                {/* Value Marker */}
                <div 
                    className={`absolute top-0 h-full w-2 rounded-full border-2 border-white shadow-sm transition-all duration-500 ${isCritical ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ left: `calc(${percent}% - 4px)` }}
                />
            </div>
            
            {/* Labels */}
            <div className="flex justify-between text-[8px] text-slate-400 font-mono mt-1">
                <span>{min}</span>
                <span className={isCritical ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{value} {unit}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};

export const LabResults: React.FC<LabResultsProps> = ({ reports = [] }) => {
    const [expandedReportId, setExpandedReportId] = useState<string | null>(reports.length > 0 ? reports[0].id : null);

    const sortedReports = [...reports].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="h-full flex flex-col gap-4">
            {sortedReports.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-4 bg-slate-50/50">
                    <FlaskConical className="w-16 h-16 mb-4 opacity-20"/>
                    <h3 className="font-bold text-slate-500">Sin analíticas</h3>
                    <p className="text-xs font-bold uppercase opacity-60">No hay informes registrados</p>
                </div>
            )}

            <div className="space-y-4 overflow-y-auto custom-scrollbar pb-20 p-1">
                {sortedReports.map(report => {
                    const criticalCount = report.values.filter(v => v.value < v.min || v.value > v.max).length;
                    
                    return (
                        <div key={report.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300">
                            
                            <button 
                                onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                                className={`w-full flex items-center justify-between p-4 transition-colors ${expandedReportId === report.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl shadow-sm ${report.category === 'HEMATOLOGY' ? 'bg-rose-100 text-rose-600' : report.category === 'GASOMETRY' ? 'bg-cyan-100 text-cyan-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <FlaskConical className="w-5 h-5"/>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-black text-slate-800 uppercase tracking-tight">{report.category}</div>
                                        <div className="text-[10px] text-slate-500 font-bold flex items-center mt-0.5">
                                            <Calendar className="w-3 h-3 mr-1"/>
                                            {new Date(report.timestamp).toLocaleString([], {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {criticalCount > 0 && (
                                        <div className="flex items-center px-2 py-1 bg-rose-50 border border-rose-100 rounded-lg">
                                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 mr-1.5 animate-pulse"/>
                                            <span className="text-[10px] font-black text-rose-600">{criticalCount} Alterados</span>
                                        </div>
                                    )}
                                    {expandedReportId === report.id ? <ChevronUp className="w-4 h-4 text-slate-400"/> : <ChevronDown className="w-4 h-4 text-slate-400"/>}
                                </div>
                            </button>

                            {expandedReportId === report.id && (
                                <div className="border-t border-slate-100 p-4 bg-slate-50/30">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {report.values.map((param, i) => {
                                            const isAbnormal = param.value < param.min || param.value > param.max;
                                            return (
                                                <div key={i} className={`p-3 rounded-xl border flex flex-col justify-between ${isAbnormal ? 'bg-white border-rose-200 shadow-sm ring-1 ring-rose-100' : 'bg-white border-slate-100'}`}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[11px] font-bold text-slate-700 uppercase truncate pr-2">{param.name}</span>
                                                        {isAbnormal && <Activity className="w-3 h-3 text-rose-500 shrink-0"/>}
                                                    </div>
                                                    
                                                    {/* Visual Bar Component */}
                                                    <RangeVisualizer 
                                                        value={param.value} 
                                                        min={param.min} 
                                                        max={param.max} 
                                                        unit={param.unit} 
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
