import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Pathology, ViewState } from '../types';
import { generatePathology } from '../services/geminiService';
import { PathologyService } from '../services/firebaseMock';
import { ListItem } from './shared/ListItem';
import { 
    Search, Activity, BookOpen, Heart, Wind, Brain, Database, ArrowLeft, 
    Baby, Siren, Bone, Syringe, Bug, Zap, Eye, Droplets, Sparkles, Save, 
    Wand2, Check, GraduationCap, Globe, ExternalLink, ShieldCheck, 
    CheckCircle2, ChevronRight, AlertOctagon, Monitor, Scale, Target, 
    MessageCircle, List, Layers, Cloud, Trash2, Library, Volume2, 
    Printer, Share2, Link, X, Loader2, Stethoscope, Pill, Calculator, 
    Dna, Flower2, Smile, Ear, Scissors, FlaskConical, ArrowRight, Plus, 
    Image as ImageIcon, AlertTriangle, ShieldAlert, Thermometer, User, 
    Ghost, Bot, Tag, Hash, Bookmark, BookMarked, Star, FileText, CheckCircle,
    ClipboardList, Info, HelpCircle, AlertCircle, Map, Microscope, Ghost as GhostIcon,
    Moon, Skull, Biohazard, Flame, Smile as SmileIcon, HeartPulse, Radiation,
    CircleSlash, Sun, EyeOff, ThermometerSnowflake, ChevronLeft
} from 'lucide-react';

export const RAW_CATALOG = [
  { 
    category: 'Cardiología', icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', 
    items: [
        'Aneurisma de Aorta Abdominal', 'Aneurisma de Aorta Torácica', 'Angina de Pecho Estable', 'Angina Inestable', 'Arritmia Sinusal', 
        'Bloqueo Auriculoventricular (BAV) 1º Grado', 'Bloqueo AV 2º Grado Mobitz I', 'Bloqueo AV 2º Grado Mobitz II', 'Bloqueo AV 3º Grado',
        'Bradiarritmias', 'Cardiopatía Isquémica', 'Cardiomiopatía Dilatada', 'Cardiomiopatía Hipertrófica', 'Cardiomiopatía Restrictiva', 
        'Comunicación Interauricular (CIA)', 'Comunicación Interventricular (CIV)', 'Cor Pulmonale', 'Dextrocardia', 'Disección Aórtica', 
        'Ductus Arterioso Persistente', 'Endocarditis Infecciosa', 'Estenosis Aórtica', 'Estenosis Mitral', 'Estenosis Pulmonar', 'Estenosis Tricúspide', 
        'Fibrilación Auricular (FA)', 'Fibrilación Ventricular (FV)', 'Flutter Auricular', 'Hipertensión Arterial (HTA)', 'Hipertensión Pulmonar',
        'IAMCEST (Infarto Agudo)', 'IAMSEST (Infarto Agudo)', 'Insuficiencia Aórtica', 'Insuficiencia Cardíaca Congestiva (ICC)', 
        'Insuficiencia Mitral', 'Miocarditis Aguda', 'Pericarditis Aguda', 'Prolapso Válvula Mitral', 'Shock Cardiogénico', 
        'Síndrome de Brugada', 'Síndrome de Dressler', 'Síndrome de Eisenmenger', 'Síndrome de QT Largo', 'Síndrome de Wolff-Parkinson-White', 
        'Taponamiento Cardíaco', 'Taquicardia Paroxística Supraventricular', 'Taquicardia Sinusal', 'Taquicardia Ventricular', 
        'Tetralogía de Fallot', 'Transposición Grandes Vasos', 'Trombosis Venosa Profunda (TVP)', 'Tromboembolismo Pulmonar (TEP)', 'Valvulopatía Reumática'
    ] 
  },
  { 
    category: 'Respiratorio', icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', 
    items: [
        'Absceso Pulmonar', 'Adenocarcinoma de Pulmón', 'Apnea del Sueño (SAHS)', 'Asbestosis', 'Asma Bronquial', 'Atelectasia', 
        'Bronquiectasias', 'Bronquiolitis Obliterante', 'Bronquitis Aguda', 'Bronquitis Crónica', 'Cáncer de Pulmón (Microcítico)', 'Cáncer de Pulmón (No Microcítico)',
        'Derrame Pleural', 'Distrés Respiratorio Agudo (SDRA)', 'Edema Agudo de Pulmón (EAP)', 'Embolia Grasa', 'Empiema Pleural', 
        'Enfisema Pulmonar', 'EPOC', 'Estatus Asmático', 'Fibrosis Quística', 'Fibrosis Pulmonar Idiopática', 'Hemotórax', 
        'Hipertensión Pulmonar Primaria', 'Insuficiencia Respiratoria Aguda', 'Laringitis Aguda (Crup)', 'Mesotelioma Pleural', 
        'Neumonía Aspirativa', 'Neumonía Bacteriana', 'Neumonía por Legionella', 'Neumonía por Pneumocystis', 'Neumonía Viral', 
        'Neumotórax a Tensión', 'Neumotórax Espontáneo', 'Pleiritis', 'Sarcoidosis', 'Silicosis', 'Síndrome de Pickwick', 'Tuberculosis Pulmonar'
    ] 
  },
  { 
    category: 'Neurología', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', 
    items: [
        'Accidente Isquémico Transitorio (AIT)', 'Aneurisma Cerebral', 'Afasia de Broca', 'Afasia de Wernicke', 'Ataxia de Friedreich',
        'Corea de Huntington', 'Coma', 'Demencia de Cuerpos de Lewy', 'Demencia de Alzheimer', 'Demencia Vascular', 
        'Encefalitis Herpética', 'Encefalopatía de Wernicke', 'Encefalopatía Hepática', 'Enfermedad de Parkinson', 
        'Esclerosis Lateral Amiotrófica (ELA)', 'Esclerosis Múltiple', 'Estatus Epiléptico', 'Hematoma Epidural', 'Hematoma Subdural', 
        'Hemorragia Subaracnoidea', 'Hernia Discal', 'Hidrocefalia Normotensiva', 'Ictus Hemorrágico', 'Ictus Isquémico (ACV)', 
        'Meningitis Bacteriana', 'Meningitis Viral', 'Miastenia Gravis', 'Migraña con Aura', 'Mielitis Transversa', 'Narcolepsia', 
        'Neuropatía Diabética', 'Neuralgia del Trigémino', 'Parálisis de Bell', 'Parálisis Cerebral', 'Síndrome de Guillain-Barré', 
        'Síndrome de Lambert-Eaton', 'Síndrome de Tourette', 'Síndrome de Horner', 'Siringomielia', 'Traumatismo Craneoencefálico (TCE)'
    ] 
  },
  { 
    category: 'Pediatría', icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200',
    items: [
        'Bronquiolitis (VRS)', 'Crup Laríngeo', 'Enfermedad de Kawasaki', 'Enfermedad Mano-Pie-Boca', 'Eritema Infeccioso (5ª Enfermedad)',
        'Espina Bífida', 'Fibrosis Quística Infantil', 'Laringomalacia', 'Meningitis Neonatal', 'Onfalitis', 'Osteogénesis Imperfecta',
        'Reflujo Gastroesofágico Infantil', 'Síndrome de Distrés Respiratorio Neonatal', 'Síndrome de Down', 'Síndrome de Muerte Súbita Lactante',
        'Síndrome Nefrótico Infantil', 'Tetania Neonatal', 'Tos Ferina', 'Vólvulo Neonatal', 'Hidrocefalia Congénita', 'Atresia de Esófago'
    ]
  },
  { 
    category: 'Digestivo', icon: Database, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', 
    items: [
        'Acalasia', 'Apendicitis Aguda', 'Ascitis', 'Celiaquía', 'Cirrosis Biliar Primaria', 'Cirrosis Hepática Alcohólica', 
        'Colangitis Aguda', 'Colecistitis Aguda', 'Colelitiasis', 'Colitis Isquémica', 'Colitis Pseudomembranosa', 'Colitis Ulcerosa', 
        'Diverticulitis Aguda', 'Enfermedad de Crohn', 'Enfermedad de Wilson', 'Enfermedad por Reflujo (ERGE)', 'Esofagitis de Barrett', 
        'Fisura Anal', 'Gastritis Aguda', 'Gastritis Crónica', 'Gastroenteritis Aguda', 'HDA (Hemorragia Digestiva)', 'HDB (Hemorragia Digestiva)', 
        'Hemorroides', 'Hepatitis A', 'Hepatitis B', 'Hepatitis C', 'Hepatitis Autoinmune', 'Hepatitis Tóxica', 'Hernia de Hiato', 
        'Hernia Inguinal', 'Íleo Paralítico', 'Isquemia Mesentérica', 'Malabsorción Intestinal', 'Obstrucción Intestinal', 
        'Pancreatitis Aguda', 'Pancreatitis Crónica', 'Peritonitis Bacteriana', 'Pólipos Colónicos', 'Síndrome de Intestino Irritable', 
        'Úlcera Duodenal', 'Úlcera Gástrica', 'Varices Esofágicas', 'Vólvulo Intestinal'
    ] 
  },
  { 
    category: 'Hematología & Oncología', icon: Droplets, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', 
    items: [
        'Anemia Aplásica', 'Anemia Falciforme', 'Anemia Ferropénica', 'Anemia Megaloblástica', 'Anemia Perniciosa', 
        'Agranulocitosis', 'Hemofilia A', 'Hemofilia B', 'Leucemia Linfoide Aguda (LLA)', 'Leucemia Linfoide Crónica (LLC)', 
        'Leucemia Mieloide Aguda (LMA)', 'Leucemia Mieloide Crónica (LMC)', 'Linfoma de Hodgkin', 'Linfoma No Hodgkin', 
        'Mieloma Múltiple', 'Policitemia Vera', 'Púrpura Trombocitopénica (PTI)', 'Síndrome Mielodisplásico', 'Talasemia',
        'Cáncer de Colon', 'Cáncer de Endometrio', 'Cáncer de Esófago', 'Cáncer Gástrico', 'Cáncer de Hígado', 
        'Cáncer de Mama', 'Cáncer de Ovario', 'Cáncer de Páncreas', 'Cáncer de Próstata', 'Cáncer de Testículo', 'Melanoma', 'Sarcoma de Ewing'
    ] 
  },
  { 
    category: 'Endocrino & Metabólico', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', 
    items: [
        'Acromegalia', 'Addison (Enfermedad de)', 'Bocio Multinodular', 'Bocio Simple', 'Cetoacidosis Diabética (CAD)', 
        'Cushing (Síndrome de)', 'Diabetes Insípida', 'Diabetes Mellitus Tipo 1', 'Diabetes Mellitus Tipo 2', 'Diabetes Gestacional', 
        'Dislipemia', 'Estado Hiperosmolar', 'Feocromocitoma', 'Gota', 'Hipercolesterolemia', 'Hiperparatiroidismo', 'Hipertiroidismo', 
        'Hipoglucemia Grave', 'Hipoparatiroidismo', 'Hipotiroidismo (Hashimoto)', 'Insuficiencia Suprarrenal', 'Mixedema', 
        'Obesidad Mórbida', 'Osteomalacia', 'Osteoporosis', 'Raquitismo', 'SIADH', 'Tiroiditis de Quervain'
    ] 
  },
  { 
    category: 'Nefro & Urología', icon: FlaskConical, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', 
    items: [
        'Adenocarcinoma Renal', 'Cáncer de Vejiga', 'Cólico Nefrítico', 'Cistitis Aguda', 'Cistitis Intersticial', 
        'Glomerulonefritis Aguda', 'Glomerulonefritis Crónica', 'Hiperplasia Benigna de Próstata (HBP)', 'Hidronefrosis', 
        'Incontinencia Urinaria', 'Insuficiencia Renal Aguda (IRA)', 'Insuficiencia Renal Crónica (IRC)', 'Litiasis Renal', 
        'Nefropatía Diabética', 'Nefropatía IgA', 'Pielonefritis Aguda', 'Poliquistosis Renal', 'Prostatitis Aguda', 
        'Síndrome Nefrítico', 'Síndrome Nefrótico', 'Uretritis'
    ] 
  },
  { 
    category: 'Dermatología', icon: Sun, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200',
    items: [
        'Psoriasis', 'Dermatitis Atópica', 'Pénfigo Vulgar', 'Melanoma Maligno', 'Carcinoma Basocelular', 'Impétigo',
        'Celulitis Infecciosa', 'Erisipela', 'Síndrome de Stevens-Johnson', 'Necrólisis Epidérmica Tóxica', 'Urticaria Crónica'
    ]
  },
  { 
    category: 'Oftalmo & ORL', icon: Eye, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200',
    items: [
        'Glaucoma de Ángulo Cerrado', 'Desprendimiento de Retina', 'Cataratas', 'Degeneración Macular',
        'Otitis Media Aguda', 'Enfermedad de Meniere', 'Hipoacusia Súbita', 'Sinusitis Crónica', 'Epistaxis Grave'
    ]
  },
  { 
    category: 'Psiquiatría', icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', 
    items: [
        'Anorexia Nerviosa', 'Bulimia Nerviosa', 'Depresión Mayor', 'Distimia', 'Esquizofrenia Paranoide', 
        'Fobia Social', 'Psicosis Aguda', 'Síndrome de Abstinencia Alcohólica', 'TOC (Trastorno Obsesivo)', 
        'Trastorno de Ansiedad Generalizada', 'Trastorno Bipolar Tipo I', 'Trastorno Bipolar Tipo II', 
        'Trastorno de Pánico', 'Trastorno de Personalidad Borderline', 'Catatonia'
    ] 
  },
  { 
    category: 'Infecciosas', icon: Biohazard, color: 'text-lime-600', bg: 'bg-lime-50', border: 'border-lime-200', 
    items: [
        'Botulismo', 'Brucelosis', 'Candidiasis Sistémica', 'Cólera', 'Dengue', 'Difteria', 'Ébola', 'Fiebre Tifoidea', 
        'Gripe A', 'Hepatitis B Crónica', 'Herpes Zóster', 'Leishmaniasis', 'Listeriosis', 'Malaria', 'Mononucleosis Infecciosa', 
        'Parotiditis', 'Poliomielitis', 'Rabia', 'Rubeola', 'Sarampión', 'Sepsis / Shock Séptico', 'Sífilis', 'Tétanos', 
        'Tos Ferina', 'Varicela', 'VIH / SIDA', 'Zika (Virus)', 'Fiebre del Nilo Occidental', 'Viruela del Mono'
    ] 
  },
  { 
    category: 'Trauma & Reuma', icon: Bone, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', 
    items: [
        'Arritritis Reumatoide', 'Artritis Séptica', 'Artrosis de Cadera', 'Artrosis de Rodilla', 'Espondilitis Anquilosante', 
        'Fibromialgia', 'Fractura de Cadera', 'Fractura de Colles', 'Fractura de Fémur', 'Lupus Eritematoso Sistémico (LES)', 
        'Osteomielitis', 'Osteoporosis Postmenopáusica', 'Paget (Enfermedad de)', 'Rabdomiólisis', 'Síndrome Compartimental', 'Gota Aguda'
    ] 
  }
];

const FLATTENED_CATALOG = RAW_CATALOG.flatMap(cat => 
    cat.items.map(item => ({
        name: item,
        category: cat.category,
        icon: cat.icon,
        color: cat.color,
        bg: cat.bg,
        isCustom: false,
        isSaved: false
    }))
);

interface SectionNavProps {
    id: string;
    label: string;
    icon: any;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<SectionNavProps> = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border-2 ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600'}`}
    >
        <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : ''}`}/>
        <span className="hidden lg:inline">{label}</span>
    </button>
);

export const Pathologies: React.FC<{initialQuery?: string, initialCategory?: string, onNavigate: any}> = ({ initialQuery, initialCategory, onNavigate }) => {
  const [query, setQuery] = useState(initialQuery || '');
  const [selectedPathology, setSelectedPathology] = useState<Pathology | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [lastSelectedItem, setLastSelectedItem] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localPathologies, setLocalPathologies] = useState<Pathology[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'ALL');
  const [checkedNICs, setCheckedNICs] = useState<Record<string, boolean>>({});
  
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPathologyName, setNewPathologyName] = useState('');

  const loadLocalData = async () => {
    const data = await PathologyService.getAll();
    setLocalPathologies(data);
  };

  useEffect(() => { loadLocalData(); }, []);

  const organizedList = useMemo(() => {
    const q = query.toLowerCase().trim();
    let items: any[] = [...FLATTENED_CATALOG];

    localPathologies.forEach(lp => {
        const existingIdx = items.findIndex(it => it.name.toLowerCase() === lp.name.toLowerCase());
        if (existingIdx !== -1) {
            items[existingIdx] = { 
                ...items[existingIdx], 
                isSaved: true,
                category: lp.family || items[existingIdx].category 
            };
        } else {
            items.push({
                name: lp.name,
                category: lp.family || 'Biblioteca Personal',
                icon: Bookmark,
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                isCustom: true,
                isSaved: true
            } as any);
        }
    });

    let filtered = items;
    if (q) {
        filtered = items.filter(i => i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q));
    } else if (selectedCategory !== 'ALL') {
        filtered = items.filter(i => i.category === selectedCategory);
    }

    const grouped: Record<string, any[]> = {};
    filtered.sort((a,b) => a.name.localeCompare(b.name)).forEach(item => {
        const cat = item.category;
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });
    return grouped;
  }, [query, localPathologies, selectedCategory]);

  const handleSelect = async (item: any) => {
    setLastSelectedItem(item);
    const local = localPathologies.find(lp => lp.name.toLowerCase() === item.name.toLowerCase());
    if (local) {
        setSelectedPathology(local);
        setActiveSection('overview');
        setCheckedNICs({});
        setAiError(null);
        return;
    }

    setLoading(true);
    setAiError(null);
    try {
        const res = await generatePathology(item.name);
        setSelectedPathology(res);
        setActiveSection('overview');
        setCheckedNICs({});
    } catch (e: any) {
        console.error(e);
        if (e.message === "AI_TIMEOUT") {
            setAiError("La generación del dossier clínico está tardando más de lo habitual. Florence sigue procesando los datos.");
        } else {
            setAiError("Error de conexión con Florence Engine. Por favor, inténtelo de nuevo.");
        }
    } finally {
        setLoading(false);
    }
  };

  const handleAddNew = async () => {
      if (!newPathologyName.trim()) return;
      setShowAddModal(false);
      setLoading(true);
      setAiError(null);
      try {
          const res = await generatePathology(newPathologyName);
          setSelectedPathology(res);
          setNewPathologyName('');
          setActiveSection('overview');
      } catch (e: any) {
          console.error(e);
          if (e.message === "AI_TIMEOUT") {
              setAiError("La generación del dossier clínico está tardando más de lo habitual. Florence sigue procesando los datos.");
          } else {
              setAiError("Error de conexión con Florence Engine. Por favor, inténtelo de nuevo.");
          }
      } finally {
          setLoading(false);
      }
  };

  const handleSave = async () => {
    if (!selectedPathology) return;
    setIsSaving(true);
    try {
        const toSave = { ...selectedPathology, id: `loc-${Date.now()}` };
        await PathologyService.add(toSave);
        await loadLocalData();
        setSelectedPathology(toSave);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
      if(confirm("¿Eliminar esta ficha de tu biblioteca local?")) {
          await PathologyService.delete(id);
          await loadLocalData();
          setSelectedPathology(null);
      }
  };

  const scrollToSection = (id: string) => {
      const el = document.getElementById(`section-${id}`);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setActiveSection(id);
      }
  };

  const toggleNICActivity = (activity: string) => {
      setCheckedNICs(prev => ({ ...prev, [activity]: !prev[activity] }));
  };

  const isCurrentSaved = selectedPathology?.id?.startsWith('loc-') || localPathologies.some(lp => lp.name.toLowerCase() === selectedPathology?.name.toLowerCase());

  const SECTIONS = [
      { id: 'overview', label: 'Dossier Clínico', icon: Activity },
      { id: 'diagnosis', label: 'Diagnóstico', icon: FlaskConical },
      { id: 'management', label: 'Manejo & Farma', icon: Pill },
      { id: 'pae', label: 'Plan PAE', icon: BookOpen },
      { id: 'education', label: 'Alta & Educación', icon: GraduationCap }
  ];

  return (
    <div className="flex-1 flex bg-slate-100 overflow-hidden font-sans relative">
        
        {/* SIDEBAR: EXPLORADOR */}
        <div className={`w-full md:w-[380px] bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-20 shadow-xl transition-all duration-300 ${selectedPathology || loading ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 bg-slate-900 text-white shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Library className="w-5 h-5 text-emerald-400"/>
                        <h2 className="font-black text-xs uppercase tracking-[0.2em]">Clinical Library v24</h2>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 p-2 rounded-xl text-white shadow-lg transition-all active:scale-95 flex items-center gap-1"
                        title="Añadir nueva patología"
                    >
                        <Plus className="w-4 h-4"/>
                        <span className="text-[9px] font-black uppercase pr-1">Introducir</span>
                    </button>
                </div>
                <div className="relative group">
                    <Search className="absolute left-3 top-3.5 text-slate-500 w-4 h-4 group-focus-within:text-emerald-500 transition-colors"/>
                    <input 
                        type="text" 
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="CIE-10 o Patología..." 
                        className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:border-indigo-500 outline-none transition-all placeholder-slate-500"
                    />
                    {query && <button onClick={() => setQuery('')} className="absolute right-3 top-3.5 text-slate-500 hover:text-white"><X className="w-4 h-4"/></button>}
                </div>
                <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
                    <button onClick={() => setSelectedCategory('ALL')} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase whitespace-nowrap border transition-all ${selectedCategory === 'ALL' ? 'bg-white text-slate-900 border-white shadow-md' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}>Todas</button>
                    {RAW_CATALOG.map(cat => (
                        <button key={cat.category} onClick={() => setSelectedCategory(cat.category)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase whitespace-nowrap border transition-all ${selectedCategory === cat.category ? 'bg-white text-slate-900 border-white shadow-md' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}>{cat.category}</button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pb-48 bg-slate-50">
                {Object.keys(organizedList).sort().map(cat => (
                    <div key={cat} className="mb-4">
                        <div className="sticky top-0 bg-slate-100/95 backdrop-blur z-10 py-1.5 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 mb-2 flex justify-between items-center">
                            <span>{cat}</span>
                            <span className="bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded-full text-[8px]">{organizedList[cat].length}</span>
                        </div>
                        <div className="space-y-1">
                            {organizedList[cat].map((item, idx) => (
                                <ListItem
                                    key={idx}
                                    icon={item.icon || BookOpen}
                                    title={item.name}
                                    subtitle={item.category}
                                    bg={item.bg || 'bg-slate-100'}
                                    color={item.color || 'text-slate-400'}
                                    isActive={selectedPathology?.name === item.name}
                                    onClick={() => handleSelect(item)}
                                    rightIcon={item.isSaved ? <Star className="w-3 h-3 mt-1 fill-current"/> : undefined}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                {Object.keys(organizedList).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <GhostIcon className="w-12 h-12 mb-4 opacity-20"/>
                        <p className="text-xs font-black uppercase tracking-widest">Sin resultados</p>
                        <button onClick={() => setShowAddModal(true)} className="mt-4 text-indigo-600 font-black text-[10px] uppercase underline">¿Generar "{query}" con Florence AI?</button>
                    </div>
                )}
            </div>
        </div>

        {/* PANEL DERECHO: DETALLE */}
        <div className={`flex-1 bg-white flex flex-col h-full overflow-hidden ${!selectedPathology && !loading ? 'hidden md:flex' : 'flex'}`}>
            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 animate-fade-in relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
                    <div className="relative mb-8 text-center">
                        <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <Sparkles className="w-8 h-8 text-indigo-400 absolute top-8 left-1/2 -translate-x-1/2 animate-pulse"/>
                        <h3 className="font-black text-slate-900 text-3xl tracking-tighter uppercase mb-2">Florence Engine v24</h3>
                        <p className="text-sm text-slate-500 font-bold max-w-xs mx-auto uppercase tracking-widest leading-relaxed">Sincronizando con bases de datos NANDA 2024, GPC y farmacopea avanzada...</p>
                        <div className="mt-8 flex justify-center gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                </div>
            ) : aiError ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 animate-fade-in text-center">
                    <div className="bg-amber-100 p-4 rounded-full mb-6">
                        <AlertTriangle className="w-12 h-12 text-amber-600"/>
                    </div>
                    <h3 className="font-black text-slate-800 text-xl tracking-tight uppercase">Aviso de Florence AI</h3>
                    <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm">
                        {aiError}
                    </p>
                    <div className="mt-8 flex gap-3">
                        <button 
                            onClick={() => { setSelectedPathology(null); setAiError(null); }}
                            className="px-8 py-4 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition-all active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={() => handleSelect(lastSelectedItem)}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            ) : selectedPathology ? (
                <div className="flex-1 flex flex-col animate-fade-in bg-white relative overflow-hidden">
                    
                    <div className="bg-white border-b border-slate-200 p-6 shadow-sm sticky top-0 z-30">
                        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex items-start gap-5">
                                <button onClick={() => setSelectedPathology(null)} className="md:hidden flex items-center gap-1 p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors shadow-sm">
                                    <ChevronLeft className="w-5 h-5"/>
                                    <span className="text-[10px] font-black uppercase pr-1">Volver</span>
                                </button>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-900/20">{selectedPathology.family || 'Clínica Especializada'}</span>
                                        {selectedPathology.cie10 && <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-1 rounded-lg border border-slate-700">CIE-10: {selectedPathology.cie10}</span>}
                                        {isCurrentSaved && <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-sm flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> BIBLIOTECA PERSONAL</span>}
                                    </div>
                                    <h1 className="text-2xl md:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tighter drop-shadow-sm">{selectedPathology.name}</h1>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                {!isCurrentSaved ? (
                                    <button 
                                        onClick={handleSave} 
                                        disabled={isSaving}
                                        className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-5 h-5"/>} 
                                        Guardar Dossier
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleDelete(selectedPathology.id!)}
                                        className="flex-1 md:flex-none bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-rose-200 transition-all flex items-center justify-center gap-2 active:scale-95"
                                    >
                                        <Trash2 className="w-5 h-5"/> Borrar Ficha
                                    </button>
                                )}
                                <button className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-white hover:text-indigo-600 transition-all border border-slate-200 shadow-inner">
                                    <Printer className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>

                        <div className="max-w-7xl mx-auto flex gap-2 mt-8 overflow-x-auto no-scrollbar scroll-smooth">
                            {SECTIONS.map(s => (
                                <NavItem key={s.id} {...s} isActive={activeSection === s.id} onClick={() => scrollToSection(s.id)} />
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 pb-40" ref={contentRef}>
                        <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-12">
                            
                            {/* SECTION: OVERVIEW */}
                            <section id="section-overview" className="space-y-8 animate-fade-in-up scroll-mt-32">
                                <div className="grid lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"><BookOpen className="w-64 h-64 text-indigo-900"/></div>
                                        <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em] mb-8 flex items-center"><GraduationCap className="w-5 h-5 mr-3"/> Marco Teórico y Fisiopatología</h3>
                                        <div className="space-y-6 relative z-10">
                                            <p className="text-lg md:text-2xl font-bold text-slate-800 leading-relaxed antialiased border-l-4 border-indigo-600 pl-6 py-2">{selectedPathology.generalInfo?.definition}</p>
                                            {selectedPathology.generalInfo?.pathophysiology && (
                                                <div className="pt-6">
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Análisis del Mecanismo</h4>
                                                    <p className="text-base font-medium text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100">{selectedPathology.generalInfo.pathophysiology}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
                                            <h3 className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] mb-6 flex items-center"><Activity className="w-5 h-5 mr-3"/> Etiología y Riesgos</h3>
                                            <p className="text-base font-bold text-indigo-50 leading-relaxed relative z-10 italic">"{selectedPathology.generalInfo?.etiology}"</p>
                                        </div>
                                        {selectedPathology.generalInfo?.redFlags && (
                                            <div className="bg-rose-50 border-l-[16px] border-rose-500 p-8 rounded-r-[2.5rem] shadow-xl animate-pulse-slow ring-4 ring-rose-100/50">
                                                <h3 className="text-xs font-black text-rose-700 uppercase mb-4 flex items-center tracking-widest"><AlertTriangle className="w-5 h-5 mr-3 animate-bounce"/> ALERTAS ROJAS (UVI/MET)</h3>
                                                <p className="text-xl font-black text-rose-900 leading-tight uppercase tracking-tight">{selectedPathology.generalInfo.redFlags}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-8 md:p-12 rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden group">
                                    <h3 className="text-xs font-black text-cyan-600 uppercase tracking-[0.3em] mb-8 flex items-center"><Eye className="w-5 h-5 mr-3"/> Semiología y Manifestaciones</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {selectedPathology.generalInfo?.signsSymptoms?.map((s, i) => (
                                            <div key={i} className="flex items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 group-hover:bg-cyan-50 group-hover:border-cyan-200 transition-all shadow-sm">
                                                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:scale-150 transition-transform"></div>
                                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight leading-none">{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* SECTION: DIAGNOSIS */}
                            <section id="section-diagnosis" className="space-y-8 scroll-mt-32">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Pruebas y Diferencial</h2>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-lg relative group">
                                        <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-6 flex items-center"><FlaskConical className="w-5 h-5 mr-3"/> Pruebas Complementarias</h3>
                                        <div className="space-y-3">
                                            {selectedPathology.generalInfo?.diagnosticTests?.map((test, i) => (
                                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 transition-colors">
                                                    <div className="font-black text-indigo-200 text-2xl italic">#0{i+1}</div>
                                                    <p className="text-sm font-bold text-slate-700">{test}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><HelpCircle className="w-32 h-32"/></div>
                                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6 flex items-center"><Map className="w-5 h-5 mr-3"/> Diagnóstico Diferencial</h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {selectedPathology.generalInfo?.differentialDiagnosis?.map((d, i) => (
                                                <div key={i} className="px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-slate-300 italic group-hover:border-emerald-500/30 transition-all flex items-center gap-3">
                                                    <CircleSlash className="w-3.5 h-3.5 text-emerald-500"/> Descartar: {d}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION: MANAGEMENT */}
                            <section id="section-management" className="space-y-8 scroll-mt-32">
                                <div className="bg-slate-950 rounded-[4rem] border border-slate-800 overflow-hidden shadow-2xl relative">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                                    <div className="p-10 border-b border-slate-800 flex justify-between items-center relative z-10 bg-slate-900/50 backdrop-blur-md">
                                        <div className="flex items-center gap-6">
                                            <div className="bg-emerald-500 p-5 rounded-3xl text-white shadow-2xl shadow-emerald-900/40 rotate-3"><Pill className="w-10 h-10"/></div>
                                            <div>
                                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Manejo Farmacológico</h3>
                                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Guías de Práctica Clínica GPC 2024</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="divide-y divide-slate-800 relative z-10">
                                        {selectedPathology.pharmacology?.map((p, i) => (
                                            <div key={i} className="p-10 grid md:grid-cols-3 gap-10 hover:bg-white/5 transition-all group">
                                                <div>
                                                    <div className="text-[10px] font-black text-emerald-400 uppercase mb-2 tracking-[0.3em]">{p.group}</div>
                                                    <div className="text-2xl font-black text-white uppercase tracking-tighter group-hover:text-emerald-300 transition-colors">{p.drug}</div>
                                                </div>
                                                <div className="md:col-span-2 bg-slate-800/40 p-8 rounded-[2.5rem] border border-slate-700 shadow-inner">
                                                    <div className="text-[9px] font-black text-slate-500 uppercase mb-3 tracking-widest flex items-center"><Zap className="w-3 h-3 mr-2 text-amber-500"/> Objetivo Terapéutico</div>
                                                    <div className="text-lg font-bold text-slate-300 italic leading-relaxed">"{p.effect}"</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-200 shadow-sm relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12"><AlertTriangle className="w-40 h-40 text-rose-900"/></div>
                                    <h3 className="text-xs font-black text-rose-700 uppercase tracking-widest mb-6 flex items-center"><AlertCircle className="w-5 h-5 mr-3"/> Complicaciones Potenciales</h3>
                                    <div className="grid md:grid-cols-2 gap-4 relative z-10">
                                        {selectedPathology.generalInfo?.complications?.map((c, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-rose-100 shadow-sm hover:translate-x-1 transition-transform">
                                                <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0"/>
                                                <span className="text-sm font-bold text-rose-800">{c}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* SECTION: PAE */}
                            <section id="section-pae" className="space-y-10 scroll-mt-32">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <h2 className="text-xs font-black text-indigo-500 uppercase tracking-[0.4em]">Proceso PAE (NANDA/NIC/NOC)</h2>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>
                                <div className="grid lg:grid-cols-2 gap-8">
                                    {Array.isArray(selectedPathology.pae?.nanda) && selectedPathology.pae?.nanda.map((dx, i) => (
                                        <div key={i} className="bg-white rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden group hover:shadow-indigo-500/10 transition-all flex flex-col">
                                            <div className="bg-indigo-600 text-white p-10 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-3xl rounded-full -mr-20 -mt-20"></div>
                                                <div className="relative z-10">
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-[10px] font-black uppercase text-indigo-100 tracking-widest bg-white/10 px-4 py-1.5 rounded-full border border-white/20">DX NANDA {dx.code}</span>
                                                        <HeartPulse className="w-6 h-6 opacity-40"/>
                                                    </div>
                                                    <h4 className="font-black text-3xl md:text-4xl tracking-tight leading-tight uppercase mt-6">{dx.label}</h4>
                                                    <div className="mt-8 space-y-4">
                                                        <div className="flex gap-4">
                                                            <div className="bg-white/20 p-2 rounded-xl h-fit uppercase text-[9px] font-black">r/c</div>
                                                            <p className="text-sm font-bold text-indigo-100 leading-relaxed italic">{dx.relatedTo}</p>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <div className="bg-indigo-900/30 p-2 rounded-xl h-fit uppercase text-[9px] font-black">m/p</div>
                                                            <p className="text-sm font-bold text-indigo-200 leading-relaxed">{dx.manifestedBy}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-10 space-y-10 bg-slate-50/50 flex-1">
                                                <div>
                                                    <h5 className="text-[11px] font-black text-indigo-600 uppercase mb-5 flex items-center tracking-[0.2em]"><Target className="w-5 h-5 mr-3"/> Resultados NOC</h5>
                                                    <div className="bg-white p-8 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden shadow-sm">
                                                        <p className="text-xl font-black text-indigo-950 leading-tight mb-6">{selectedPathology.pae?.noc[i]?.result}</p>
                                                        <div className="flex flex-wrap gap-2 pt-4 border-t border-indigo-50">
                                                            {Array.isArray(selectedPathology.pae?.noc[i]?.indicators) && selectedPathology.pae?.noc[i]?.indicators.map((ind, idx) => (
                                                                <span key={idx} className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-4 py-2 rounded-2xl border border-indigo-100 shadow-sm">{ind}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h5 className="text-[11px] font-black text-emerald-600 uppercase mb-5 flex items-center tracking-[0.2em]"><CheckCircle2 className="w-5 h-5 mr-3"/> Intervenciones NIC</h5>
                                                    <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg shadow-emerald-900/20 mb-6 flex justify-between items-center group/nic">
                                                        <span className="font-black text-sm uppercase tracking-tight">{selectedPathology.pae?.nic[i]?.intervention}</span>
                                                        <CheckCircle className="w-5 h-5 opacity-50 group-hover/nic:opacity-100 transition-opacity"/>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {Array.isArray(selectedPathology.pae?.nic[i]?.activities) && selectedPathology.pae?.nic[i]?.activities.map((a, idx) => (
                                                            <button 
                                                                key={idx} 
                                                                onClick={() => toggleNICActivity(a)}
                                                                className={`w-full text-left text-sm font-bold flex gap-5 p-5 rounded-3xl border transition-all shadow-sm group/item ${checkedNICs[a] ? 'bg-emerald-50 border-emerald-200 text-emerald-700 line-through opacity-70' : 'bg-white border-slate-100 hover:border-emerald-200 text-slate-700'}`}
                                                            >
                                                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${checkedNICs[a] ? 'bg-emerald-500 text-white' : 'bg-emerald-50 group-hover/item:bg-emerald-500 group-hover/item:text-white'}`}>
                                                                    <Check className="w-4 h-4 stroke-[3]"/>
                                                                </div>
                                                                <span className="leading-relaxed">{a}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SECTION: EDUCATION */}
                            <section id="section-education" className="scroll-mt-32">
                                <div className="bg-indigo-900 p-10 md:p-16 rounded-[4rem] shadow-2xl relative overflow-hidden text-white">
                                    <div className="absolute top-0 right-0 p-12 opacity-10"><Radiation className="w-40 h-40 animate-spin-slow"/></div>
                                    <div className="relative z-10">
                                        <h3 className="text-xs font-black text-indigo-300 uppercase tracking-[0.4em] mb-10 flex items-center justify-center"><ClipboardList className="w-6 h-6 mr-3"/> Educación al Alta & Continuidad de Cuidados</h3>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {selectedPathology.generalInfo?.patientEducation?.map((item, i) => (
                                                <div key={i} className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 flex gap-6 items-start group hover:bg-white hover:text-indigo-900 transition-all duration-500">
                                                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg group-hover:scale-110 transition-transform">{i+1}</div>
                                                    <p className="text-base font-bold leading-relaxed">{item}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-12 pt-8 border-t border-white/10 text-center">
                                            <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center mx-auto gap-3">
                                                <Share2 className="w-4 h-4"/> Exportar Guía del Paciente
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 select-none bg-white relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>
                    <div className="relative mb-10 group">
                        <div className="w-64 h-64 bg-slate-50 rounded-[4rem] flex items-center justify-center shadow-inner border border-slate-100 rotate-6 group-hover:rotate-0 transition-all duration-500">
                            <Library className="w-32 h-32 text-slate-200 -rotate-6 group-hover:rotate-0 transition-all duration-500"/>
                        </div>
                        <div className="absolute -bottom-6 -right-6 bg-indigo-600 text-white p-6 rounded-[2.5rem] shadow-2xl animate-bounce">
                            <Stethoscope className="w-10 h-10"/>
                        </div>
                    </div>
                    <h3 className="text-4xl font-black uppercase tracking-tighter text-slate-400 text-center">Clinical Nexus v24</h3>
                    <p className="text-sm font-bold text-slate-300 mt-4 text-center max-w-sm tracking-[0.2em] uppercase">Explora el catálogo clínico avanzado o utiliza la inteligencia artificial para generar nuevos protocolos de enfermería.</p>
                    <button onClick={() => setShowAddModal(true)} className="mt-8 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-all active:scale-95"><Plus className="w-5 h-5"/> Introducir Nueva Patología</button>
                </div>
            )}
        </div>

        {showAddModal && (
            <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-800">
                    <div className="p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-2xl text-indigo-600 dark:text-indigo-400"><Microscope className="w-6 h-6"/></div>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Introducir Patología</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-bold mb-6 uppercase tracking-wide">Florence Engine v24 generará una ficha técnica de alta fidelidad basada en guías 2024.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-indigo-500 uppercase block mb-1.5 ml-1">Nombre del Cuadro Clínico</label>
                                <input 
                                    value={newPathologyName} 
                                    onChange={e => setNewPathologyName(e.target.value)} 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm font-black outline-none focus:border-indigo-500/30 transition-all shadow-inner text-slate-900 dark:text-white" 
                                    placeholder="Ej: Síndrome de Stevens-Johnson"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleAddNew()}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 flex gap-3">
                        <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all">Cancelar</button>
                        <button 
                            onClick={handleAddNew}
                            disabled={!newPathologyName.trim()}
                            className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            GENERAR CON IA
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};