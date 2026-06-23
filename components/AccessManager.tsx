
import React, { useState } from 'react';
import { InvasiveDevice } from '../types';
import { Syringe, AlertTriangle, Trash2, Plus, Calendar, Activity, CheckCircle2, X, Clock, AlertCircle } from 'lucide-react';

interface AccessManagerProps {
    devices: InvasiveDevice[];
    onUpdate: (devices: InvasiveDevice[]) => void;
}

export const AccessManager: React.FC<AccessManagerProps> = ({ devices = [], onUpdate }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDevice, setNewDevice] = useState<Partial<InvasiveDevice>>({
        type: 'VVP', location: '', gauge: ''
    });

    const handleAdd = () => {
        if (!newDevice.type || !newDevice.location) return;
        
        const device: InvasiveDevice = {
            id: `dev-${Date.now()}`,
            type: newDevice.type as any,
            location: newDevice.location!,
            gauge: newDevice.gauge,
            insertionDate: new Date().toISOString(),
            status: 'ACTIVE',
            lastCare: new Date().toISOString()
        };
        
        onUpdate([device, ...devices]);
        setShowAddModal(false);
        setNewDevice({ type: 'VVP', location: '', gauge: '' });
    };

    const handleRemove = (id: string) => {
        if(confirm("¿Retirar dispositivo? Se marcará como inactivo.")) {
            const updated = devices.map(d => d.id === id ? { ...d, status: 'REMOVED' as const } : d);
            onUpdate(updated);
        }
    };

    const handleCare = (id: string) => {
        const updated = devices.map(d => d.id === id ? { ...d, lastCare: new Date().toISOString() } : d);
        onUpdate(updated);
        alert("Cura/Mantenimiento registrado.");
    };

    const getDeviceIcon = (type: string) => {
        if (type === 'SNG' || type === 'SV') return <Activity className="w-5 h-5"/>;
        if (type === 'CVC' || type === 'PICC') return <Activity className="w-5 h-5 text-indigo-600"/>;
        return <Syringe className="w-5 h-5"/>;
    };

    const getHoursActive = (dateStr: string) => {
        const diff = new Date().getTime() - new Date(dateStr).getTime();
        return Math.floor(diff / (1000 * 60 * 60));
    };

    const activeDevices = devices.filter(d => d.status === 'ACTIVE');

    return (
        <div className="h-full flex flex-col gap-6">
            
            <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Syringe className="w-4 h-4 mr-2"/> Accesos Activos ({activeDevices.length})
                </h3>
                <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center active:scale-95">
                    <Plus className="w-3.5 h-3.5 mr-1.5"/> Añadir
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pb-20 p-1">
                {activeDevices.length === 0 && (
                    <div className="col-span-full text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <Syringe className="w-12 h-12 mx-auto mb-2 opacity-20"/>
                        <p className="text-xs font-bold uppercase opacity-60">Sin dispositivos registrados</p>
                    </div>
                )}

                {activeDevices.map(device => {
                    const hours = getHoursActive(device.insertionDate);
                    const days = Math.floor(hours / 24);
                    
                    // Protocol Logic (72h for VVP)
                    const limitHours = device.type === 'VVP' ? 72 : 0; // 0 means indefinite/long term
                    const isExpired = limitHours > 0 && hours >= limitHours;
                    const progress = limitHours > 0 ? Math.min((hours / limitHours) * 100, 100) : 0;
                    
                    return (
                        <div key={device.id} className={`bg-white p-5 rounded-2xl border shadow-sm relative group overflow-hidden transition-all ${isExpired ? 'border-rose-300 ring-2 ring-rose-100' : 'border-slate-200 hover:border-indigo-300'}`}>
                            
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl shadow-sm ${isExpired ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                                        {getDeviceIcon(device.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <div className="font-black text-sm text-slate-800">{device.type}</div>
                                            {device.gauge && <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">{device.gauge}</span>}
                                        </div>
                                        <div className="text-xs text-slate-500 font-bold mt-0.5 truncate max-w-[150px]">{device.location}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-xl font-black leading-none ${isExpired ? 'text-rose-500' : 'text-slate-700'}`}>{days}<span className="text-xs font-bold text-slate-400 ml-0.5">d</span></div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">{hours} horas</div>
                                </div>
                            </div>

                            {/* Lifecycle Bar (Only for temporary lines) */}
                            {limitHours > 0 && (
                                <div className="mb-4">
                                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-1">
                                        <span>Vida Útil Protocolo</span>
                                        <span className={isExpired ? 'text-rose-500' : 'text-slate-500'}>{isExpired ? 'CADUCADO' : `${limitHours - hours}h restantes`}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${isExpired ? 'bg-rose-500' : progress > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                            style={{width: `${progress}%`}}
                                        ></div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2 relative z-10">
                                <button onClick={() => handleCare(device.id)} className="flex-1 bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 text-slate-600 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center group/btn">
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-slate-400 group-hover/btn:text-emerald-500"/> REGISTRAR CURA
                                </button>
                                <button onClick={() => handleRemove(device.id)} className="flex-1 bg-slate-50 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-slate-600 py-2 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center group/btn">
                                    <Trash2 className="w-3.5 h-3.5 mr-1.5 text-slate-400 group-hover/btn:text-rose-500"/> RETIRAR
                                </button>
                            </div>

                            {/* Background Watermark */}
                            {isExpired && (
                                <div className="absolute -bottom-4 -right-4">
                                    <AlertCircle className="w-24 h-24 text-rose-500/10"/>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ADD MODAL */}
            {showAddModal && (
                <div className="absolute inset-0 bg-white/95 z-20 flex flex-col p-6 animate-fade-in rounded-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-slate-800 uppercase flex items-center"><Plus className="w-5 h-5 mr-2 text-indigo-600"/> Nuevo Dispositivo</h3>
                        <button onClick={() => setShowAddModal(false)}><X className="w-6 h-6 text-slate-400 hover:text-rose-500 transition-colors"/></button>
                    </div>
                    <div className="space-y-5 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Tipo de Acceso</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['VVP', 'CVC', 'PICC', 'SNG', 'SV', 'DRAIN'].map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setNewDevice({...newDevice, type: t as any})}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${newDevice.type === t ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Localización Anatómica</label>
                            <input value={newDevice.location} onChange={e => setNewDevice({...newDevice, location: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ej: Antebrazo Izdo, Subclavia Dcha..."/>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">Calibre / French (Opcional)</label>
                            <input value={newDevice.gauge} onChange={e => setNewDevice({...newDevice, gauge: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="Ej: 20G, 14Fr"/>
                        </div>
                    </div>
                    <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95">Registrar Inserción</button>
                </div>
            )}
        </div>
    );
};
