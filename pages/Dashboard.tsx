
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Patient } from '../types';
import { AdmissionModal } from '../components/AdmissionModal';
import { SafetyEngine } from '../services/alertEngine';
import { PatientService } from '../services/firebaseMock';
import { PatientCard } from '../components/shared/PatientCard';
import { 
    Plus, Activity, Clock, AlertCircle, Users, 
    Sparkles, Filter, Zap, Pill, Timer,
    BookOpen, Calculator, CheckCircle2, Stethoscope, FileText,
    TrendingUp, ShieldAlert, Bot, Calendar
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewState, params?: any) => void;
}

const QuickStat = ({ label, value, icon: Icon, active, onClick, sub, gradient }: any) => (
    <button 
        onClick={onClick}
        className={`flex-none w-[44vw] sm:w-auto flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 rounded-2xl border transition-all ${active ? `bg-white dark:bg-slate-800 border-indigo-500 ring-2 ring-indigo-500 shadow-lg` : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 shadow-sm'}`}
    >
        <div className="flex gap-3 md:gap-4 items-center w-full">
            <div className={`p-2.5 md:p-3 rounded-xl shadow-md shrink-0 ${gradient || 'bg-indigo-600'}`}>
                <Icon className="w-4 h-4 md:w-5 md:h-5 text-white"/>
            </div>
            <div className="text-left">
                <div className="text-xl md:text-2xl font-black text-slate-800 dark:text-white leading-none tracking-tight">{value}</div>
                <div className="text-[9px] md:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-1">{label}</div>
            </div>
        </div>
    </button>
);

const UnitTimeline = ({ patients, onNavigate }: { patients: Patient[], onNavigate: any }) => {
    const timelineItems = useMemo(() => {
        const items: any[] = [];
        patients.forEach(p => {
            p.prescriptions?.forEach(rx => {
                if (rx.status === 'ACTIVE' && rx.nextAdmin) {
                    items.push({ time: new Date(rx.nextAdmin), label: rx.drugName, patient: p.name, bed: p.bed, patientId: p.id, dose: rx.dose });
                }
            });
        });
        return items.sort((a, b) => a.time.getTime() - b.time.getTime()).slice(0, 5);
    }, [patients]);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                    <Timer className="w-3 h-3 mr-2 text-indigo-500"/> Próximas Medicaciones
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {timelineItems.length > 0 ? timelineItems.map((item, i) => {
                    const isLate = item.time < new Date();
                    return (
                        <div key={i} className="flex gap-4 relative cursor-pointer group" onClick={() => onNavigate(ViewState.FOLLOWUP, {patientId: item.patientId})}>
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${isLate ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]'}`}></div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                    <span className="text-[10px] font-black text-indigo-600">{item.time.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                    <span className="text-[9px] font-bold text-slate-400">{item.bed}</span>
                                </div>
                                <h4 className="text-xs font-black text-slate-800 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{item.label} ({item.dose})</h4>
                                <p className="text-[10px] text-slate-500 truncate">{item.patient}</p>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="text-center py-10 opacity-20">
                        <CheckCircle2 className="w-10 h-10 mx-auto"/>
                        <p className="text-[10px] font-black uppercase mt-2">Unidad Despejada</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<Record<string, any>>({});
  const [isAdmitting, setIsAdmitting] = useState(false);
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL'>('ALL');

  const loadData = async () => {
    const data = await PatientService.getAll();
    setPatients(data);
    const alertsMap: any = {};
    data.forEach(p => {
        const pAlerts = SafetyEngine.evaluatePatient(p);
        if (pAlerts.length > 0) alertsMap[p.id] = pAlerts[0];
    });
    setActiveAlerts(alertsMap);
  };

  useEffect(() => { loadData(); }, []);

  const workloadIndex = useMemo(() => {
      const totalNews = patients.reduce((acc, p) => acc + (p.news2 || 0), 0);
      return Math.min(Math.round((totalNews / (patients.length * 8 || 1)) * 100), 100);
  }, [patients]);

  const filteredPatients = patients.filter(p => filter === 'ALL' ? true : p.risk === 'HIGH');

  return (
    <div className="pb-48 max-w-[1800px] mx-auto px-2 md:px-8 pt-2 md:pt-4 space-y-6 md:space-y-8 animate-fade-in relative">
      
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl z-20 py-3 -mx-2 md:-mx-8 px-4 md:px-8 shadow-sm mb-4">
          <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500"/> 
              <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  {new Date().toLocaleDateString([], {weekday:'long', day:'numeric', month:'long'})}
              </h2>
          </div>
          
          <div className="flex w-full sm:w-auto gap-3 items-center">
             <div className="relative flex-1 sm:w-64">
                 <input type="search" placeholder="Filtrar paciente por nombre..." value={filter === 'ALL' && !activeAlerts ? '' : ''} onChange={(e) => {}} className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm" />
             </div>
             <button onClick={() => setIsAdmitting(true)} className="flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-xs font-bold shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all">
                 <Plus className="w-4 h-4"/> <span className="hidden sm:inline">ADMITIR</span>
             </button>
          </div>
      </header>

      <div className="flex overflow-x-auto md:grid md:grid-cols-4 gap-3 md:gap-4 pb-2 md:pb-0 custom-scrollbar mt-4">
          <QuickStat label="Pacientes Activos" value={patients.length} icon={Users} active={filter === 'ALL'} onClick={() => setFilter('ALL')} gradient="bg-gradient-to-br from-indigo-500 to-blue-600" />
          <QuickStat label="Prioridad Alta" value={patients.filter(p => p.risk === 'HIGH').length} icon={Activity} active={filter === 'CRITICAL'} onClick={() => setFilter('CRITICAL')} gradient="bg-gradient-to-br from-rose-500 to-pink-600" />
          <div className="flex-none w-[80vw] md:w-auto bg-white dark:bg-slate-800 p-4 md:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between">
              <div>
                  <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 md:mb-2">Carga de Trabajo</div>
                  <div className="text-xl md:text-2xl font-black text-slate-800 dark:text-white">{workloadIndex}%</div>
              </div>
              <div className="flex-1 max-w-[120px] md:max-w-[200px] ml-4 md:ml-6">
                  <div className="h-2 md:h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${workloadIndex > 70 ? 'bg-rose-500' : 'bg-indigo-500'}`} style={{width: `${workloadIndex}%`}}></div>
                  </div>
              </div>
          </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button 
              onClick={() => setIsAdmitting(true)}
              className="flex-none flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-black transition-all shadow-lg active:scale-95"
          >
              <Plus className="w-4 h-4 text-emerald-400" />
              Nuevo Ingreso
          </button>
          <button 
              onClick={() => {/* Logic for quick vitals */}}
              className="flex-none flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
              <Activity className="w-4 h-4 text-rose-500" />
              Registrar Constantes
          </button>
          <button 
              onClick={() => {/* Logic for quick notes */}}
              className="flex-none flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
              <FileText className="w-4 h-4 text-indigo-500" />
              Evolución/Notas
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                  {filteredPatients.map(patient => (
                      <PatientCard key={patient.id} patient={patient} activeAlerts={activeAlerts} onNavigate={onNavigate} />
                  ))}
              </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
              <div className="h-auto md:h-[400px]">
                  <UnitTimeline patients={patients} onNavigate={onNavigate} />
              </div>
              <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-amber-500"/> Recursos Rápidos
                  </h3>
                  <div className="grid grid-cols-3 gap-2 md:gap-3">
                      <button onClick={() => onNavigate(ViewState.PATHOLOGIES)} className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col items-center gap-2 border border-transparent hover:border-indigo-300 transition-all active:scale-95">
                          <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-600"/>
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Biblioteca</span>
                      </button>
                      <button onClick={() => onNavigate(ViewState.CALCULATORS)} className="p-3 md:p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex flex-col items-center gap-2 border border-transparent hover:border-emerald-300 transition-all active:scale-95">
                          <Calculator className="w-5 h-5 md:w-6 md:h-6 text-emerald-600"/>
                          <span className="text-[9px] md:text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Escalas</span>
                      </button>
                      <button onClick={() => onNavigate(ViewState.CHAT)} className="p-3 md:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex flex-col items-center gap-2 border border-transparent hover:border-indigo-400 transition-all active:scale-95">
                          <Bot className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400"/>
                          <span className="text-[9px] md:text-[10px] font-bold text-indigo-700 dark:text-indigo-300 uppercase">Florence</span>
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {isAdmitting && <AdmissionModal onClose={() => setIsAdmitting(false)} onSave={async (p) => { await PatientService.admitPatient(p); loadData(); setIsAdmitting(false); }} />}
    </div>
  );
};
