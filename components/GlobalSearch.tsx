
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronRight, Calculator, BookOpen, GraduationCap, ArrowRight, Activity, Command, Pill, Syringe, Heart, Zap, History, X, Sparkles, Filter, LayoutGrid, Mic, Stethoscope, AlertTriangle, ArrowUpRight, Keyboard, Globe, Loader2, ExternalLink, Brain, Lightbulb, Bot, MessageCircle } from 'lucide-react';
import Fuse from 'fuse.js';
import { RAW_CATALOG } from './Pathologies';
import { TOOLS_LIST } from './Calculators';
import { MOCK_TERMS } from './Glossary';
import { STATIC_DRUGS } from './Pharmacology';
import { ViewState, ViewParams } from '../types';
import { searchMedicalKnowledge } from '../services/geminiService';
import { VoiceInput } from './VoiceInput';

interface GlobalSearchProps {
    onNavigate: (view: ViewState, params?: ViewParams) => void;
}

type SearchCategory = 'ALL' | 'DRUG' | 'PATHOLOGY' | 'CALCULATOR' | 'TERM' | 'AI';

// Semantic aliases map for manual keywords
const SEMANTIC_ALIASES: Record<string, string[]> = {
    'azucar': ['Diabetes', 'Insulina', 'Glucemia', 'Cetoacidosis'],
    'sugar': ['Diabetes', 'Insulina'],
    'tension': ['Hipertensión', 'Hipotensión', 'TAS', 'TAD', 'Labetalol'],
    'presion': ['Hipertensión', 'Hipotensión', 'TAS', 'TAD'],
    'corazon': ['Infarto', 'Insuficiencia Cardíaca', 'Arritmia', 'ECG', 'Digoxina'],
    'pulmon': ['EPOC', 'Neumonía', 'Disnea', 'Asma', 'Ventolin'],
    'aire': ['SatO2', 'Oxígeno', 'Disnea'],
    'dolor': ['Analgesia', 'EVA', 'Morfina', 'Paracetamol', 'Nolotil'],
    'fiebre': ['Antitérmico', 'Sepsis', 'Paracetamol'],
    'piedra': ['Cólico Nefrítico', 'Litiasis'],
    'ictus': ['ACV', 'Código Ictus', 'Neurología', 'Fibrinólisis'],
    'parada': ['PCR', 'Adrenalina', 'Amiodarona', 'RCP'],
    'goteo': ['Bomba', 'Perfusión', 'Cálculo', 'Sueroterapia'],
    'vomito': ['Primperan', 'Ondansetron', 'Gastroenteritis'],
    'caca': ['Estreñimiento', 'Diarrea', 'Enema'],
    'pis': ['Diuresis', 'Sonda Vesical', 'ITU', 'Furosemida']
};

const HighlightedText = ({ text, query }: { text: string, query: string }) => {
    if (!query.trim()) return <>{text}</>;
    // Simple highlight, won't catch fuzzy matches perfectly but works for prefixes
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === query.toLowerCase() ? <span key={i} className="text-indigo-600 font-black bg-indigo-50 rounded px-0.5 shadow-sm decoration-indigo-200 underline decoration-2 underline-offset-2">{part}</span> : part
            )}
        </span>
    );
};

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ onNavigate }) => {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<SearchCategory>('ALL');
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0); 
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsContainerRef = useRef<HTMLDivElement>(null);

    const [aiResult, setAiResult] = useState<{ text: string, sources: any[] } | null>(null);
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        const history = localStorage.getItem('paesys_search_history');
        if (history) setRecentSearches(JSON.parse(history));
        if (inputRef.current) inputRef.current.focus();

        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    useEffect(() => {
        // Instant updates for local search results
        setDebouncedQuery(query);
    }, [query]);

    useEffect(() => {
        const aiTimer = setTimeout(() => {
            if (!query.trim() || query.length < 4) {
                setAiResult(null);
                return;
            }
            fetchAI(query);
        }, 300);

        return () => clearTimeout(aiTimer);
    }, [query]);

    const fetchAI = async (q: string) => {
        setIsAiSearching(true);
        try {
            const res = await searchMedicalKnowledge(q);
            setAiResult(res);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiSearching(false);
        }
    };

    const saveToHistory = (term: string) => {
        if (!term.trim()) return;
        const newHistory = [term, ...recentSearches.filter(h => h !== term)].slice(0, 5);
        setRecentSearches(newHistory);
        localStorage.setItem('paesys_search_history', JSON.stringify(newHistory));
    };

    const handleSelect = (view: ViewState, params?: ViewParams) => {
        saveToHistory(query || params?.query || params?.tool || '');
        onNavigate(view, params);
    };

    const clearHistory = () => {
        setRecentSearches([]);
        localStorage.removeItem('paesys_search_history');
    };

    const allSearchableData = useMemo(() => {
        const list: any[] = [];

        TOOLS_LIST.forEach(t => {
            list.push({ ...t, type: 'CALCULATOR', view: ViewState.CALCULATORS, params: { tool: t.id }, sub: t.category });
        });

        STATIC_DRUGS.forEach(d => {
            list.push({ ...d, label: d.name, sub: d.brandNames + ' ' + d.group, type: 'DRUG', view: ViewState.PHARMACOLOGY, params: { query: d.name } });
        });

        RAW_CATALOG.forEach(cat => {
            cat.items.forEach(item => {
                list.push({ 
                    name: item, label: item, sub: cat.category, category: cat.category,
                    type: 'PATHOLOGY', icon: cat.icon, color: cat.color, bg: cat.bg,
                    view: ViewState.PATHOLOGIES, params: { query: item }
                });
            });
        });

        MOCK_TERMS.forEach(t => {
            list.push({ ...t, label: t.term, sub: t.definition, type: 'TERM', view: ViewState.GLOSSARY, params: { query: t.term } });
        });

        return list;
    }, []);

    const fuse = useMemo(() => {
        return new Fuse(allSearchableData, {
            keys: [
                { name: 'label', weight: 0.7 },
                { name: 'sub', weight: 0.3 },
                { name: 'category', weight: 0.2 },
                { name: 'brandNames', weight: 0.4 }
            ],
            threshold: 0.35,
            includeScore: true,
            ignoreLocation: true 
        });
    }, [allSearchableData]);

    const results = useMemo(() => {
        if (!debouncedQuery.trim()) return [];
        
        let list: any[] = [];
        const fuseResults = fuse.search(debouncedQuery);
        
        list = fuseResults.map(res => ({
            ...res.item,
            score: (1 - (res.score || 0)) * 100 
        }));

        const q = debouncedQuery.toLowerCase();
        for (const [key, values] of Object.entries(SEMANTIC_ALIASES)) {
            if (q.includes(key)) {
                allSearchableData.forEach(item => {
                    if (values.some(v => item.label?.toLowerCase().includes(v.toLowerCase()) || item.sub?.toLowerCase().includes(v.toLowerCase()))) {
                        if (!list.find(l => l.label === item.label)) {
                            list.push({
                                ...item,
                                score: 60,
                                matchReason: `Relacionado con: ${key}`
                            });
                        }
                    }
                });
            }
        }

        list.push({
            id: 'florence-ai-query',
            label: `Preguntar a Florence: "${debouncedQuery}"`,
            sub: 'Consultar al Asistente Inteligente',
            type: 'AI',
            view: ViewState.CHAT, 
            params: { query: debouncedQuery }, 
            score: 25,
            matchReason: 'Soporte IA'
        });

        if (activeFilter !== 'ALL') {
            list = list.filter(item => item.type === activeFilter);
        }

        return list.sort((a, b) => b.score - a.score).slice(0, 15);

    }, [debouncedQuery, activeFilter, fuse, allSearchableData]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!results.length) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
                const el = document.getElementById(`result-${selectedIndex + 1}`);
                el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
                const el = document.getElementById(`result-${selectedIndex - 1}`);
                el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const selected = results[selectedIndex];
                if (selected) handleSelect(selected.view, selected.params);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [results, selectedIndex]);

    const QUICK_ACCESS_CHIPS = [
        { label: "Adrenalina", type: 'DRUG', icon: Syringe, view: ViewState.PHARMACOLOGY, params: { query: 'Adrenalina' } },
        { label: "RCP", type: 'TERM', icon: Heart, view: ViewState.GLOSSARY, params: { query: 'RCP' } },
        { label: "Glasgow", type: 'TOOL', icon: Activity, view: ViewState.CALCULATORS, params: { tool: 'glasgow' } },
        { label: "Preguntar a Florence", type: 'AI', icon: Bot, view: ViewState.CHAT, params: {} },
        { label: "Sondaje", type: 'TERM', icon: Zap, view: ViewState.GLOSSARY, params: { query: 'SV' } },
        { label: "Insulina", type: 'DRUG', icon: Pill, view: ViewState.PHARMACOLOGY, params: { query: 'Insulina' } },
    ];

    const FILTERS = [
        { id: 'ALL', label: 'Todo', icon: LayoutGrid },
        { id: 'DRUG', label: 'Fármacos', icon: Pill },
        { id: 'PATHOLOGY', label: 'Patologías', icon: BookOpen },
        { id: 'CALCULATOR', label: 'Herramientas', icon: Calculator },
        { id: 'TERM', label: 'Glosario', icon: GraduationCap },
        { id: 'AI', label: 'Inteligencia', icon: Bot },
    ];

    const getIconForType = (type: string, item: any) => {
        if (type === 'AI') return <Bot className="w-5 h-5 text-violet-500 animate-pulse" />;
        if (type === 'CALCULATOR') return <item.icon className={`w-5 h-5 ${item.color}`} />;
        if (type === 'DRUG') return <Pill className="w-5 h-5 text-rose-500" />;
        if (type === 'PATHOLOGY') return <item.icon className="w-5 h-5 text-blue-500" />;
        if (type === 'TERM') return <GraduationCap className="w-5 h-5 text-emerald-500" />;
        return <Search className="w-5 h-5 text-slate-400" />;
    };

    const getActionLabel = (type: string) => {
        if (type === 'AI') return 'CONSULTAR';
        if (type === 'CALCULATOR') return 'CALCULAR';
        if (type === 'DRUG') return 'VER DOSIS';
        if (type === 'PATHOLOGY') return 'VER GUÍA';
        return 'ABRIR';
    };

    return (
        <div className="flex flex-col h-full max-w-5xl mx-auto font-sans bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
            
            {/* SEARCH HEADER */}
            <div className="bg-slate-900 dark:bg-black pt-8 pb-6 px-4 md:px-8 rounded-b-3xl shadow-2xl relative overflow-hidden shrink-0 z-20">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-center text-2xl md:text-3xl font-black text-white tracking-tight mb-2 uppercase">Command Center</h2>
                    <p className="text-center text-slate-400 text-xs md:text-sm font-black uppercase tracking-widest mb-6">Busca dosis, protocolos, herramientas o consulta a Florence.</p>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors" />
                        </div>
                        <input
                            ref={inputRef}
                            type="text"
                            className="block w-full pl-12 pr-24 py-5 bg-slate-800/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 focus:border-indigo-500 text-xl font-black shadow-xl transition-all"
                            placeholder="¿Qué necesitas encontrar hoy?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoComplete="off"
                        />
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
                            <VoiceInput onTranscript={(t) => setQuery(t)} isCompact={true} />
                            {query ? (
                                <button onClick={() => setQuery('')} className="text-slate-500 hover:text-white transition-colors">
                                    <X className="w-5 h-5 bg-slate-700 rounded-full p-1 box-content" />
                                </button>
                            ) : (
                                <div className="hidden md:flex items-center gap-1 text-slate-500 bg-slate-800/50 px-2 py-1 rounded text-[10px] font-mono border border-slate-700/50">
                                    <Command className="w-3 h-3"/> <span>K</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {query && (
                        <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-1 custom-scrollbar">
                            {FILTERS.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => { setActiveFilter(f.id as SearchCategory); inputRef.current?.focus(); }}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center transition-all border whitespace-nowrap ${activeFilter === f.id ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/10' : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-800'}`}
                                >
                                    <f.icon className={`w-3 h-3 mr-1.5 ${activeFilter === f.id ? 'text-emerald-600' : ''}`}/> 
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto pb-24 px-4 md:px-8 custom-scrollbar pt-6" ref={resultsContainerRef}>
                
                {/* FLORENCE QUICK ANSWER */}
                {query && query.length >= 3 && (
                    <div className="max-w-3xl mx-auto mb-6">
                        <div className="flex gap-4 animate-fade-in-up">
                            <div className="hidden md:block shrink-0">
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 p-0.5 shadow-md border border-slate-100 dark:border-slate-700">
                                    <img src="https://ui-avatars.com/api/?name=Florence+AI&background=7c3aed&color=fff" className="w-full h-full rounded-full" alt="AI"/>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5 ml-1">
                                    <span className="text-xs font-black text-slate-700 dark:text-white uppercase">Florence AI</span>
                                    <span className="text-[10px] font-bold text-violet-500 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full border border-violet-100 dark:border-violet-800 uppercase">Respuesta Rápida</span>
                                </div>
                                
                                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700 shadow-sm p-5 relative overflow-hidden">
                                    
                                    {isAiSearching ? (
                                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 py-2">
                                            <div className="flex gap-1">
                                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"></span>
                                            </div>
                                            <span className="text-sm font-black uppercase tracking-widest">Consultando bases de datos...</span>
                                        </div>
                                    ) : aiResult ? (
                                        <div className="animate-fade-in">
                                            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold markdown-body" dangerouslySetInnerHTML={{__html: aiResult.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 dark:text-white font-black">$1</strong>')}}></div>
                                            {aiResult.sources && aiResult.sources.length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                                                    {aiResult.sources.slice(0,2).map((src, idx) => (
                                                        <a key={idx} href={src.uri} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-600 text-[10px] text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors truncate max-w-[200px] font-black uppercase">
                                                            <ExternalLink className="w-3 h-3 shrink-0"/> {src.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-2 text-slate-400 dark:text-slate-500 text-xs italic font-bold uppercase">Esperando consulta completa...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* EMPTY STATE */}
                {!query && (
                    <div className="animate-fade-in space-y-8 max-w-3xl mx-auto">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center"><Command className="w-4 h-4 mr-2"/> Accesos Rápidos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {QUICK_ACCESS_CHIPS.map((chip, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => handleSelect(chip.view, chip.params)}
                                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md px-4 py-3 rounded-xl text-xs font-black text-slate-600 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-400 flex items-center transition-all active:scale-95 group text-left uppercase tracking-tight"
                                    >
                                        <div className={`p-1.5 rounded-lg mr-3 transition-colors ${chip.type === 'AI' ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-500' : 'bg-slate-50 dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 text-slate-400 group-hover:text-indigo-500'}`}>
                                            <chip.icon className="w-4 h-4"/>
                                        </div>
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {recentSearches.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center"><History className="w-4 h-4 mr-2"/> Recientes</h3>
                                    <button onClick={clearHistory} className="text-[10px] font-black text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-2 py-1 rounded transition-colors uppercase">BORRAR</button>
                                </div>
                                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden divide-y divide-slate-100 dark:divide-slate-700">
                                    {recentSearches.map((term, i) => (
                                        <button key={i} onClick={() => setQuery(term)} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left group">
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-300 font-black uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                                                <History className="w-3.5 h-3.5 mr-3 text-slate-300 dark:text-slate-500 group-hover:text-indigo-400"/> {term}
                                            </div>
                                            <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500 opacity-0 group-hover:opacity-100 transition-all"/>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* RESULTS LIST */}
                {query && (
                    <div className="max-w-3xl mx-auto space-y-2 pb-10">
                        {results.length > 0 ? (
                            results.map((item, index) => (
                                <div 
                                    key={index}
                                    id={`result-${index}`}
                                    onClick={() => handleSelect(item.view, item.params)}
                                    className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all group relative overflow-hidden ${
                                        index === selectedIndex 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-500 ring-1 ring-indigo-500 shadow-md transform scale-[1.01]' 
                                            : item.type === 'AI' 
                                                ? 'bg-violet-50/50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800 hover:border-violet-400'
                                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-sm'
                                    }`}
                                >
                                    <div className={`p-2.5 rounded-lg mr-4 shrink-0 transition-colors ${
                                        item.type === 'AI' 
                                            ? 'bg-violet-100 dark:bg-violet-900/50'
                                            : index === selectedIndex 
                                                ? 'bg-white dark:bg-slate-800 shadow-sm' 
                                                : 'bg-slate-50 dark:bg-slate-700 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30'
                                    }`}>
                                        {getIconForType(item.type, item)}
                                    </div>

                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <div className={`text-sm font-black uppercase tracking-tight truncate ${item.type === 'AI' ? 'text-violet-700 dark:text-violet-300' : index === selectedIndex ? 'text-indigo-900 dark:text-indigo-300' : 'text-slate-800 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400'}`}>
                                                <HighlightedText text={item.label} query={query} />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-1.5 rounded border ${item.type === 'AI' ? 'text-violet-600 border-violet-200 bg-violet-50' : 'text-slate-400 border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700'}`}>
                                                {item.type}
                                            </span>
                                            {item.matchReason && (
                                                <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 rounded flex items-center uppercase">
                                                    <Lightbulb className="w-2 h-2 mr-1"/> {item.matchReason}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate font-black uppercase tracking-tighter">
                                            <HighlightedText text={item.sub || item.category || ''} query={query} />
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-3 ${index === selectedIndex || item.type === 'AI' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                        <span className={`text-[10px] font-black px-2 py-1 rounded border shadow-sm uppercase hidden md:block ${item.type === 'AI' ? 'bg-violet-600 text-white border-violet-600' : 'text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-800'}`}>
                                            {getActionLabel(item.type)}
                                        </span>
                                        <ChevronRight className={`w-5 h-5 ${item.type === 'AI' ? 'text-violet-500' : index === selectedIndex ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                    </div>
                                    
                                    {index === selectedIndex && (
                                        <div className="absolute right-2 bottom-1 text-[9px] text-indigo-300 dark:text-indigo-600 font-mono hidden md:block uppercase font-black tracking-widest">↵ Enter</div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 animate-fade-in">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-7 h-7 text-slate-300 dark:text-slate-600"/>
                                </div>
                                <h3 className="text-base font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-tight">Sin coincidencias locales</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mb-6 font-black uppercase tracking-widest">No encontramos "{query}" en la base de datos local.</p>
                                
                                <button 
                                    onClick={() => onNavigate(ViewState.CHAT)}
                                    className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white pl-4 pr-5 py-3 rounded-xl text-xs font-black shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center mx-auto uppercase tracking-widest"
                                >
                                    <Sparkles className="w-4 h-4 mr-2 text-yellow-300 animate-pulse"/> PREGUNTAR A FLORENCE AI
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};