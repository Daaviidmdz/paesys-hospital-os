import React, { useState, useEffect, useRef } from 'react';
import { ViewState, ViewParams, ClinicalAlert, User } from '../types';
import { 
  Home, Calculator, Search, Menu, X, BookOpen, Bot, GraduationCap, 
  Activity, ChevronRight, UserCircle, Pill, ClipboardList, ChevronLeft, 
  Bell, Settings, LayoutGrid, BriefcaseMedical, Wifi, MoreHorizontal, 
  LogOut, Stethoscope, ArrowRight, CheckCircle2, AlertTriangle, Info, Clock,
  MessageCircle, Users, ShieldAlert, Droplets, Syringe, Sparkles, Book,
  Menu as MenuIcon, UserCog, FileText, Grid, ChevronDown
} from 'lucide-react';
import { RAW_CATALOG } from './Pathologies';
import { STATIC_DRUGS } from './Pharmacology';
import { TOOLS_LIST } from './Calculators';
import { MOCK_TERMS } from './Glossary';
import { FlorenceFAB } from './shared/FlorenceFAB';
import { SafetyEngine } from '../services/alertEngine';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState, params?: ViewParams) => void;
  onBack: () => void;
  currentUser: User | null; 
}

const MOCK_GLOBAL_PATIENTS: any[] = [
    { 
        id: 'p1', name: 'Antonio G.', diagnosis: 'EPOC', vitals: { sat: '88', fc: '110', ta: '100/60' }, news2: 7, 
        devices: { ivAccessDate: new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString(), ivType: 'VVP' }
    },
    { 
        id: 'p2', name: 'María R.', diagnosis: 'ICC', vitals: { sat: '98', fc: '76', ta: '130/80' }, news2: 1,
        fluidBalance24h: 2000 
    },
];

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, onBack, currentUser }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [isEpiMode, setIsEpiMode] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notifications, setNotifications] = useState<ClinicalAlert[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // VIEWS THAT HANDLE THEIR OWN SCROLLING
  const isFullHeightView = [
      ViewState.CHAT, 
      ViewState.PHARMACOLOGY, 
      ViewState.PATHOLOGIES, 
      ViewState.CALCULATORS, 
      ViewState.PROCEDURES,
      ViewState.FOLLOWUP,
      ViewState.ASSISTANT,
      ViewState.SEARCH,
      ViewState.TEAM_CHAT
  ].includes(currentView);

  // ALERT ENGINE INTEGRATION
  useEffect(() => {
      const checkSafety = () => {
          const alerts = SafetyEngine.evaluateUnit(MOCK_GLOBAL_PATIENTS);
          setNotifications(alerts);
      };
      checkSafety();
      const interval = setInterval(checkSafety, 30000);
      return () => clearInterval(interval);
  }, []);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
      };
  }, []);

  const criticalCount = notifications.filter(n => n.level === 'CRITICAL').length;

  // Navigation Logic
  const handleNavigate = (view: any, params?: ViewParams) => {
      if (view === 'QUICK_VITALS' || view === 'QUICK_NOTES') {
          setIsChatOpen(false);
          setIsMobileMenuOpen(false);
          onChangeView(ViewState.DASHBOARD);
          return;
      }
      setIsChatOpen(false); 
      setIsMobileMenuOpen(false);
      onChangeView(view, params);
  };

  // Search Logic
  useEffect(() => {
      if (!searchQuery.trim()) {
          setSearchResults([]);
          return;
      }
      const q = searchQuery.toLowerCase();
      const results = [];

      // 1. Tools
      const tools = TOOLS_LIST.filter(t => t.label.toLowerCase().includes(q) || t.id.includes(q)).slice(0, 2);
      results.push(...tools.map(t => ({ 
          id: t.id, label: t.label, type: 'TOOL', icon: Calculator, view: ViewState.CALCULATORS, params: { tool: t.id }, sub: 'Utilidad' 
      })));

      // 2. Drugs
      const drugs = STATIC_DRUGS.filter(d => d.name.toLowerCase().includes(q) || (d.brandNames || '').toLowerCase().includes(q)).slice(0, 2);
      results.push(...drugs.map(d => ({ 
          id: d.id, label: d.name, type: 'DRUG', icon: Pill, view: ViewState.PHARMACOLOGY, params: { query: d.name }, sub: d.brandNames 
      })));

      // 3. Glossary Terms
      const terms = MOCK_TERMS.filter(t => t.term.toLowerCase().startsWith(q) || (t.definition || '').toLowerCase().includes(q)).slice(0, 3);
      results.push(...terms.map(t => ({
          id: t.id, label: t.term, type: 'TERM', icon: GraduationCap, view: ViewState.GLOSSARY, params: { query: t.term }, sub: t.definition
      })));

      // 4. Pathologies
      let pathCount = 0;
      for (const cat of RAW_CATALOG) {
          for (const item of cat.items) {
              if (item.toLowerCase().includes(q)) {
                  results.push({ 
                      id: item, label: item, type: 'PATHOLOGY', icon: BookOpen, view: ViewState.PATHOLOGIES, params: { query: item }, sub: cat.category 
                  });
                  pathCount++;
                  if (pathCount >= 2) break;
              }
          }
          if (pathCount >= 2) break;
      }

      setSearchResults(results);
  }, [searchQuery]);

  // Close dropdown on outside click
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
              setShowDropdown(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchResultClick = (res: any) => {
      handleNavigate(res.view, res.params);
      setSearchQuery('');
      setShowDropdown(false);
  };

  const SIDEBAR_ITEMS = [
      { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutGrid },
      { id: 'QUICK_VITALS', label: 'Registrar Constantes', icon: Activity },
      { id: 'QUICK_NOTES', label: 'Evolución/Notas', icon: FileText },
      { id: ViewState.FOLLOWUP, label: 'Pacientes', icon: ClipboardList },
      { id: ViewState.PROCEDURES, label: 'Técnicas', icon: Book },
      { id: ViewState.PHARMACOLOGY, label: 'Fármacos', icon: Pill },
      { id: ViewState.PATHOLOGIES, label: 'Patologías', icon: BookOpen },
      { id: ViewState.CALCULATORS, label: 'Calculadoras', icon: Calculator },
      { id: ViewState.ASSISTANT, label: 'Triaje IA', icon: Bot },
      { id: ViewState.CHAT, label: 'Chat Equipo', icon: MessageCircle },
      { id: ViewState.GLOSSARY, label: 'Glosario', icon: GraduationCap },
      { id: ViewState.SEARCH, label: 'Buscador', icon: Search },
  ];

  const MOBILE_NAV_ITEMS = [
      { id: ViewState.DASHBOARD, label: 'Inicio', icon: Home },
      { id: ViewState.FOLLOWUP, label: 'Pacientes', icon: ClipboardList },
      { id: ViewState.CHAT, label: 'Florence', icon: Bot },
      { id: ViewState.PHARMACOLOGY, label: 'Fármacos', icon: Pill },
  ];

  const MOBILE_DRAWER_ITEMS = [
      { id: 'QUICK_VITALS', label: 'Registrar Constantes', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50' },
      { id: 'QUICK_NOTES', label: 'Evolución/Notas', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { id: ViewState.PATHOLOGIES, label: 'Patologías', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
      { id: ViewState.PROCEDURES, label: 'Manual de Técnicas', icon: Book, color: 'text-rose-600', bg: 'bg-rose-50' },
      { id: ViewState.CALCULATORS, label: 'Calculadoras Clínicas', icon: Calculator, color: 'text-amber-600', bg: 'bg-amber-50' },
      { id: ViewState.ASSISTANT, label: 'Asistente Triaje IA', icon: Activity, color: 'text-white', bg: 'bg-gradient-to-br from-rose-500 via-amber-500 to-blue-500' },
      { id: ViewState.CHAT, label: 'Florence AI', icon: Bot, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { id: ViewState.GLOSSARY, label: 'Glosario Términos', icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50' },
      { id: ViewState.SEARCH, label: 'Buscador Global', icon: Search, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { id: ViewState.SETTINGS, label: 'Configuración', icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  const getAlertIcon = (cat: string) => {
      switch(cat) {
          case 'VITALS': return <Activity className="w-4 h-4"/>;
          case 'DEVICE': return <Syringe className="w-4 h-4"/>;
          case 'BALANCE': return <Droplets className="w-4 h-4"/>;
          default: return <Info className="w-4 h-4"/>;
      }
  };

  const getViewTitle = (view: ViewState) => {
    switch(view) {
      case ViewState.DASHBOARD: return 'Panel de Control';
      case ViewState.FOLLOWUP: return 'Seguimiento de Pacientes';
      case ViewState.PROCEDURES: return 'Manual de Técnicas';
      case ViewState.PHARMACOLOGY: return 'Vademécum Farmacológico';
      case ViewState.PATHOLOGIES: return 'Catálogo de Patologías';
      case ViewState.CALCULATORS: return 'Calculadoras Clínicas';
      case ViewState.ASSISTANT: return 'Asistente de Triaje IA';
      case ViewState.CHAT: return 'Comunicación de Equipo';
      case ViewState.GLOSSARY: return 'Glosario de Términos';
      case ViewState.SEARCH: return 'Buscador Inteligente';
      case ViewState.SETTINGS: return 'Configuración del Sistema';
      case ViewState.TEAM_CHAT: return 'Chat de Unidad';
      default: return 'PAESYS';
    }
  };

  return (
    <div className={`flex h-[100dvh] bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300 ${isEpiMode ? 'epi-mode' : ''}`}>
      
      {/* SIDEBAR (Desktop) */}
      <aside className={`hidden md:flex ${isZenMode ? 'w-0 opacity-0 overflow-hidden' : (isSidebarCollapsed ? 'w-20' : 'w-20 lg:w-64')} bg-slate-900 text-slate-300 flex-col shrink-0 shadow-2xl z-40 transition-all duration-500 border-r border-slate-800 ease-in-out group/sidebar relative`}>
        <div className={`p-4 lg:p-6 flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 border-b border-slate-800/50 h-[74px] overflow-hidden`}>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-lg shadow-emerald-900/20 text-white shrink-0">
                <Stethoscope className="w-5 h-5" />
            </div>
            <div className={`${isSidebarCollapsed ? 'lg:hidden' : 'hidden lg:block'} overflow-hidden whitespace-nowrap transition-all duration-300`}>
                <h1 className="font-black text-xl text-white tracking-tight leading-none">PAE<span className="text-emerald-500">SYS</span></h1>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mt-0.5">Hospital OS</p>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-2 lg:px-3 space-y-2 custom-scrollbar overflow-x-hidden">
            {SIDEBAR_ITEMS.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} px-2 lg:px-4 py-3 rounded-xl text-sm font-bold transition-all group relative ${currentView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50 ring-1 ring-indigo-500' : 'hover:bg-slate-800 hover:text-white'}`}
                    title={isSidebarCollapsed ? item.label : ''}
                >
                    <item.icon className={`w-6 h-6 lg:w-5 lg:h-5 ${isSidebarCollapsed ? '' : 'lg:mr-3'} transition-colors ${currentView === item.id ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                    <span className={`${isSidebarCollapsed ? 'lg:hidden' : 'hidden lg:block'} truncate`}>{item.label}</span>
                    {currentView === item.id && <div className={`${isSidebarCollapsed ? '' : 'lg:hidden'} absolute left-0 w-1 h-8 bg-white rounded-r-full`}></div>}
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
            <button onClick={() => handleNavigate(ViewState.SETTINGS)} className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-center lg:justify-start'} gap-3 w-full p-2 lg:p-3 rounded-xl hover:bg-slate-800 transition-colors group border border-transparent hover:border-slate-700`}>
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs border-2 border-slate-700 shadow-md shrink-0">
                    {currentUser?.name?.charAt(0) || 'U'}
                </div>
                <div className={`text-left flex-1 overflow-hidden ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`}>
                    <div className="text-xs font-bold text-white truncate group-hover:text-indigo-400 transition-colors">{currentUser?.name || 'Usuario'}</div>
                    <div className="text-[10px] text-slate-500 truncate">{currentUser?.role || 'Invitado'}</div>
                </div>
                <Settings className={`w-4 h-4 text-slate-500 group-hover:text-white transition-colors ${isSidebarCollapsed ? 'hidden' : 'hidden lg:block'}`} />
            </button>
        </div>

        {/* Sidebar Toggle Button */}
        <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-20 bg-slate-800 text-slate-400 p-1 rounded-full border border-slate-700 hover:text-white transition-all hidden lg:flex z-50 shadow-xl"
        >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4"/> : <ChevronLeft className="w-4 h-4"/>}
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        
        {/* HEADER */}
        <header className={`${isZenMode || (isFullHeightView && window.innerWidth < 768) ? 'h-0 py-0 opacity-0 -translate-y-full overflow-hidden border-none' : 'h-auto py-2 md:py-4 translate-y-0'} bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-3 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-all duration-500 ease-in-out`}>
            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center md:hidden">
                     <button onClick={() => setIsMobileMenuOpen(true)} className="bg-emerald-600 p-2 rounded-xl text-white mr-2 shadow-md active:scale-95 transition-transform">
                        <MenuIcon className="w-5 h-5" />
                     </button>
                     {currentView !== ViewState.DASHBOARD && (
                        <button onClick={onBack} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 mr-2 shadow-sm active:scale-95 transition-transform">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                     )}
                </div>
                
                <div className="hidden md:flex items-center gap-2">
                    <button 
                        onClick={() => handleNavigate(ViewState.DASHBOARD)} 
                        className={`p-2 rounded-xl transition-all ${currentView === ViewState.DASHBOARD ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                        title="Ir al Inicio"
                    >
                        <Home className="w-5 h-5" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    {currentView !== ViewState.DASHBOARD && (
                        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-black text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 hover:border-indigo-200">
                            <ChevronLeft className="w-4 h-4"/> 
                            <span>Volver</span>
                        </button>
                    )}
                </div>

                <div className="flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-0.5 hidden md:block">Estás en</span>
                    <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-white tracking-tight leading-none truncate max-w-[120px] md:max-w-none">
                        {getViewTitle(currentView)}
                    </h2>
                </div>
            </div>

            {/* OMNIBOX - Hidden on very small screens to save space, or made more compact */}
            <div className="flex-1 max-w-xl mx-2 md:mx-4 relative" ref={searchRef}>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-9 md:pl-10 pr-3 py-1.5 md:py-2 border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl leading-5 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-xs md:sm font-medium transition-all shadow-sm"
                        placeholder="Buscar..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                        onFocus={() => setShowDropdown(true)}
                    />
                </div>

                {showDropdown && searchResults.length > 0 && (
                    <div className="absolute top-full mt-2 w-[85vw] md:w-full -left-4 md:left-0 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-up origin-top">
                        <div className="max-h-80 overflow-y-auto">
                            {searchResults.map((res) => (
                                <button
                                    key={res.id + res.type}
                                    onClick={() => handleSearchResultClick(res)}
                                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center group border-b border-slate-50 dark:border-slate-700 last:border-0"
                                >
                                    <div className={`p-2 rounded-lg mr-3 shrink-0 ${res.type === 'DRUG' ? 'bg-rose-100 text-rose-600' : res.type === 'TOOL' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <res.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-sm text-slate-800 dark:text-white truncate">{res.label}</div>
                                        <div className="text-[10px] text-slate-400 truncate uppercase font-black">{res.type} • {res.sub}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
                {isOffline && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-100 text-amber-700 rounded-xl border border-amber-200 text-[10px] font-black uppercase tracking-wider animate-pulse">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Modo Offline</span>
                    </div>
                )}
                <button 
                    onClick={() => setIsEpiMode(!isEpiMode)}
                    className={`p-2 rounded-xl border transition-all ${isEpiMode ? 'bg-indigo-100 text-indigo-600 border-indigo-200' : 'text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title={isEpiMode ? "Desactivar Modo EPI" : "Modo EPI (Botones más grandes)"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 md:w-5 md:h-5 ${isEpiMode ? 'fill-indigo-500' : ''}`}><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/><path d="M18 11v6"/></svg>
                </button>
                <button 
                    onClick={() => setIsZenMode(!isZenMode)}
                    className={`p-2 rounded-xl border transition-all hidden sm:flex ${isZenMode ? 'bg-amber-100 text-amber-600 border-amber-200' : 'text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    title={isZenMode ? "Salir de Modo Zen" : "Modo Zen (Pantalla Completa)"}
                >
                    <Grid className={`w-4 h-4 md:w-5 md:h-5 ${isZenMode ? 'fill-amber-500' : ''}`} />
                </button>
                <button 
                    onClick={() => setIsNotificationsOpen(true)}
                    className={`relative p-2 transition-colors bg-white dark:bg-slate-800 rounded-xl border hover:bg-slate-50 dark:hover:bg-slate-700 ${criticalCount > 0 ? 'text-rose-500 animate-pulse border-rose-200' : 'text-slate-400 border-slate-100 dark:border-slate-700'}`}
                >
                    <Bell className="w-4 h-4 md:w-5 md:h-5" />
                    {notifications.length > 0 && (
                        <span className={`absolute top-2 right-2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${criticalCount > 0 ? 'bg-rose-600' : 'bg-blue-500'}`}></span>
                    )}
                </button>
                <div className="hidden sm:block">
                    <button onClick={() => handleNavigate(ViewState.SETTINGS)} className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-black text-[10px] md:text-xs border-2 border-white shadow-sm">
                        {currentUser?.name?.charAt(0) || 'U'}
                    </button>
                </div>
            </div>
        </header>

        {/* CONTENT AREA */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-950 relative transition-all duration-500 ${isFullHeightView ? 'overflow-hidden p-0 pb-16 md:pb-0' : 'overflow-y-auto p-3 md:p-4 pb-32 md:pb-6'}`}>
            {children}
        </div>

        {/* BOTTOM NAVIGATION (Mobile Only) */}
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around z-40 safe-area-pb shadow-[0_-8px_30px_rgba(0,0,0,0.08)] transition-all duration-500 ${isZenMode ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
            {MOBILE_NAV_ITEMS.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition-all relative ${currentView === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    {currentView === item.id && (
                        <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl -z-10 animate-pulse"></div>
                    )}
                    <item.icon className={`w-5 h-5 mb-1 ${currentView === item.id ? 'scale-110' : ''}`} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
                </button>
            ))}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="flex flex-col items-center justify-center py-2 px-3 rounded-2xl text-slate-400 hover:text-slate-600"
            >
                <MenuIcon className="w-5 h-5 mb-1" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Más</span>
            </button>
        </nav>

        {/* Floating Florence Button */}
        <FlorenceFAB currentView={currentView} isZenMode={isZenMode} onNavigate={handleNavigate} />

        {/* Exit Zen Mode Button (Floating) */}
        {isZenMode && (
            <button 
                onClick={() => setIsZenMode(false)}
                className="fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl z-50 animate-bounce hover:scale-110 transition-all border-2 border-emerald-500"
                title="Salir de Modo Zen"
            >
                <Grid className="w-6 h-6" />
            </button>
        )}

        {/* MOBILE DRAWER (Menu) */}
        {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-[2.5rem] p-6 pb-12 animate-slide-in-bottom shadow-2xl border-t border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8"></div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Menú Principal</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        {MOBILE_DRAWER_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                className="flex flex-col items-center gap-3 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group"
                            >
                                <div className={`p-4 rounded-2xl shadow-sm group-active:scale-90 transition-transform ${item.bg} ${item.color}`}>
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase text-center leading-tight">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* NOTIFICATIONS DRAWER */}
        {isNotificationsOpen && (
            <div className="fixed inset-0 z-50 animate-fade-in">
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsNotificationsOpen(false)}></div>
                <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl animate-slide-in-right flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Alertas Clínicas</h2>
                        </div>
                        <button onClick={() => setIsNotificationsOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {notifications.length > 0 ? notifications.map((alert) => (
                            <div key={alert.id} className={`p-4 rounded-2xl border-l-4 shadow-sm transition-all hover:shadow-md ${alert.level === 'CRITICAL' ? 'bg-rose-50 dark:bg-rose-900/10 border-rose-500' : 'bg-white dark:bg-slate-800 border-indigo-500'}`}>
                                <div className="flex gap-3">
                                    <div className={`p-2 rounded-lg h-fit ${alert.level === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                        {getAlertIcon(alert.category)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{alert.title}</h4>
                                            <span className="text-[9px] font-black text-slate-400 uppercase">{new Date(alert.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{alert.message}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alert.patientName}</span>
                                            <button onClick={() => { handleNavigate(ViewState.FOLLOWUP, {patientId: alert.patientId}); setIsNotificationsOpen(false); }} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline uppercase tracking-widest">Ver Paciente</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-700">
                                <CheckCircle2 className="w-16 h-16 mb-4 opacity-20" />
                                <p className="font-black uppercase tracking-widest text-xs">Unidad sin alertas activas</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};
