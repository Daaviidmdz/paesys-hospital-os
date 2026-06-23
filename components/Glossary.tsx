import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Tag, X, BookA, ChevronRight, ChevronLeft, Hash, GraduationCap } from 'lucide-react';
import { Term } from '../types';

// GLOSARIO MASIVO EXPANDIDO (A-Z COMPLETO)
export const MOCK_TERMS: Term[] = [
  // A
  { id: '1', term: 'AAS', definition: 'Ácido Acetilsalicílico', category: 'Farmacología', usage: 'Antiagregante. IAM, Ictus.' },
  { id: '2', term: 'ACV', definition: 'Accidente Cerebrovascular', category: 'Neurología', usage: 'Ictus isquémico o hemorrágico.' },
  { id: '3', term: 'ADVP', definition: 'Adicto a Drogas Vía Parenteral', category: 'Social', usage: 'Riesgo biológico elevado (VIH, VHC).' },
  { id: '4', term: 'AINE', definition: 'Antiinflamatorio No Esteroideo', category: 'Farmacología', usage: 'Ibuprofeno, Enantyum. Gastrolesivos.' },
  { id: '5', term: 'ARA-II', definition: 'Antagonista de Receptores Angiotensina II', category: 'Farmacología', usage: 'Valsartán, Losartán. Antihipertensivo.' },
  { id: 'a1', term: 'AAA', definition: 'Aneurisma Aorta Abdominal', category: 'Vascular', usage: 'Riesgo rotura. Masa pulsátil abdominal.' },
  { id: 'a2', term: 'ABVD', definition: 'Actividades Básicas Vida Diaria', category: 'Valoración', usage: 'Índice de Barthel.' },
  // B
  { id: '6', term: 'BAV', definition: 'Bloqueo Aurículoventricular', category: 'Cardiología', usage: 'Bradicardia. Puede requerir marcapasos.' },
  { id: '7', term: 'BIPAP', definition: 'Bilevel Positive Airway Pressure', category: 'Respiratorio', usage: 'VNI con dos niveles de presión. EPOC, EAP.' },
  { id: '8', term: 'BK', definition: 'Bacilo de Koch', category: 'Infecciosa', usage: 'Tuberculosis. Aislamiento aéreo.' },
  { id: 'b1', term: 'BZD', definition: 'Benzodiacepinas', category: 'Farmacología', usage: 'Diazepam, Lorazepam. Sedante, ansiolítico.' },
  { id: 'b2', term: 'BM Test', definition: 'Test de Glucemia Capilar', category: 'Técnicas', usage: 'Control diabetes (Boehringer Mannheim).' },
  // C
  { id: '9', term: 'CPAP', definition: 'Continuous Positive Airway Pressure', category: 'Respiratorio', usage: 'Presión positiva continua. Apnea del sueño, EAP.' },
  { id: '10', term: 'CVC', definition: 'Catéter Venoso Central', category: 'Técnicas', usage: 'Vía central (Yugular, Subclavia). Medir PVC, Nutrición Parenteral.' },
  { id: '11', term: 'CIV', definition: 'Comunicación Interventricular', category: 'Cardiología', usage: 'Cardiopatía congénita.' },
  { id: 'c1', term: 'Ca', definition: 'Carcinoma / Cáncer', category: 'Oncología', usage: 'Neoplasia maligna.' },
  { id: 'c2', term: 'CAT', definition: 'Catéter', category: 'Material', usage: 'Dispositivo acceso vascular.' },
  { id: 'c3', term: 'CID', definition: 'Coagulación Intravascular Diseminada', category: 'UCI', usage: 'Hemorragia + Trombosis grave.' },
  // D
  { id: '12', term: 'DM', definition: 'Diabetes Mellitus', category: 'Endocrino', usage: 'Tipo 1 (Insulinodependiente) / Tipo 2.' },
  { id: '13', term: 'DVE', definition: 'Drenaje Ventricular Externo', category: 'Neurología', usage: 'Control de PIC en hidrocefalia aguda.' },
  { id: 'd1', term: 'DAO', definition: 'Dificultad Aérea Obstructiva', category: 'Respiratorio', usage: 'Obstrucción vía aérea.' },
  { id: 'd2', term: 'DL', definition: 'Decúbito Lateral', category: 'Posición', usage: 'Cambios posturales (DLD/DLI).' },
  { id: 'd3', term: 'DS', definition: 'Decúbito Supino', category: 'Posición', usage: 'Boca arriba.' },
  { id: 'd4', term: 'DP', definition: 'Decúbito Prono', category: 'Posición', usage: 'Boca abajo (SDRA, COVID).' },
  // E
  { id: '14', term: 'EAP', definition: 'Edema Agudo de Pulmón', category: 'Respiratorio', usage: 'Insuficiencia cardiaca izq aguda. "Encharcamiento".' },
  { id: '15', term: 'ECG', definition: 'Electrocardiograma', category: 'Pruebas', usage: 'Registro actividad eléctrica cardiaca.' },
  { id: '16', term: 'EEG', definition: 'Electroencefalograma', category: 'Pruebas', usage: 'Registro actividad cerebral (Epilepsia, Coma).' },
  { id: '17', term: 'EPOC', definition: 'Enfermedad Pulmonar Obstructiva Crónica', category: 'Respiratorio', usage: 'Bronquitis crónica + Enfisema.' },
  { id: 'e1', term: 'ECA', definition: 'Enfermedad Cerebrovascular Aguda', category: 'Neurología', usage: 'Ictus.' },
  { id: 'e2', term: 'ETE', definition: 'Ecocardiograma Transesofágico', category: 'Pruebas', usage: 'Ver corazón desde esófago.' },
  // F
  { id: '18', term: 'FA', definition: 'Fibrilación Auricular', category: 'Cardiología', usage: 'Arritmia. Riesgo ictus. Anticoagulación.' },
  { id: '19', term: 'FV', definition: 'Fibrilación Ventricular', category: 'Cardiología', usage: 'Ritmo de parada. Desfibrilación inmediata.' },
  { id: '20', term: 'FR', definition: 'Frecuencia Respiratoria', category: 'Constantes', usage: 'Normal 12-20 rpm.' },
  { id: '21', term: 'FC', definition: 'Frecuencia Cardiaca', category: 'Constantes', usage: 'Normal 60-100 lpm.' },
  { id: 'f1', term: 'FiO2', definition: 'Fracción Inspirada de Oxígeno', category: 'Respiratorio', usage: 'Aire ambiente = 21% (0.21).' },
  { id: 'f2', term: 'FUR', definition: 'Fecha Última Regla', category: 'Ginecología', usage: 'Calcular edad gestacional.' },
  // G
  { id: '22', term: 'GCS', definition: 'Glasgow Coma Scale', category: 'Neurología', usage: 'Valoración consciencia. Ojos, Verbal, Motor.' },
  { id: '23', term: 'GASA', definition: 'Gasometría Arterial', category: 'Pruebas', usage: 'pH, pO2, pCO2. Test de Allen previo.' },
  { id: 'g1', term: 'GEA', definition: 'Gastroenteritis Aguda', category: 'Digestivo', usage: 'Diarrea, vómitos.' },
  { id: 'g2', term: 'GNS', definition: 'Gafas Nasales', category: 'Material', usage: 'Oxigenoterapia bajo flujo.' },
  // H
  { id: '24', term: 'HDA', definition: 'Hemorragia Digestiva Alta', category: 'Digestivo', usage: 'Melena, Hematemesis. Varices, úlcera.' },
  { id: '25', term: 'HDB', definition: 'Hemorragia Digestiva Baja', category: 'Digestivo', usage: 'Rectorragia, Hematoquecia.' },
  { id: '26', term: 'HTA', definition: 'Hipertensión Arterial', category: 'Cardiología', usage: '>140/90 mmHg.' },
  { id: 'h1', term: 'Hb', definition: 'Hemoglobina', category: 'Laboratorio', usage: 'Transporte O2. Anemia.' },
  { id: 'h2', term: 'Hto', definition: 'Hematocrito', category: 'Laboratorio', usage: '% volumen sangre ocupado por hematíes.' },
  // I
  { id: '27', term: 'IAM', definition: 'Infarto Agudo Miocardio', category: 'Cardiología', usage: 'SCACEST (Con elevación ST) / SCASEST.' },
  { id: '28', term: 'ICC', definition: 'Insuficiencia Cardiaca Congestiva', category: 'Cardiología', usage: 'Fallo de bomba. Edemas, disnea.' },
  { id: '29', term: 'IECA', definition: 'Inhibidor Enzima Convertidora Angiotensina', category: 'Farmacología', usage: 'Enalapril, Ramipril. HTA, ICC.' },
  { id: '30', term: 'IOT', definition: 'Intubación Orotraqueal', category: 'Vía Aérea', usage: 'Aislamiento vía aérea. Conexión a ventilador.' },
  { id: '31', term: 'IRC', definition: 'Insuficiencia Renal Crónica', category: 'Renal', usage: 'Fallo renal. Puede requerir Diálisis.' },
  { id: '32', term: 'ITU', definition: 'Infección Tracto Urinario', category: 'Infecciosa', usage: 'Cistitis, Pielonefritis.' },
  { id: 'i1', term: 'IM', definition: 'Intramuscular', category: 'Vía Admin', usage: 'Glúteo, Deltoides, Vasto.' },
  { id: 'i2', term: 'IV', definition: 'Intravenosa', category: 'Vía Admin', usage: 'Directo a vena.' },
  // L
  { id: 'l1', term: 'LCR', definition: 'Líquido Cefalorraquídeo', category: 'Neurología', usage: 'Punción lumbar.' },
  { id: 'l2', term: 'LCP', definition: 'Limitación del Cuidado (Esfuerzo) Terapéutico', category: 'Bioética', usage: 'Cuidados paliativos.' },
  // M
  { id: '33', term: 'MEC', definition: 'Miniexamen Cognoscitivo', category: 'Neurología', usage: 'Test de cribado demencia.' },
  { id: 'm1', term: 'MIA', definition: 'Mascarilla Inteligente de Aire', category: 'Material', usage: 'No existe, es trampa para estudiantes.' },
  { id: 'm2', term: 'MDR', definition: 'Multidrogoresistente', category: 'Infecciosa', usage: 'Bacterias resistentes.' },
  // N
  { id: '34', term: 'NAS', definition: 'Nivel de Ansiedad / Sedación', category: 'UCI', usage: 'Escalas RASS / Ramsay.' },
  { id: '35', term: 'NE', definition: 'Nutrición Enteral', category: 'Nutrición', usage: 'Por sonda (SNG, PEG).' },
  { id: '36', term: 'NE', definition: 'Nutrición Parenteral', category: 'Nutrición', usage: 'Por vía venosa (NPT = Central, NPP = Periférica).' },
  { id: 'n1', term: 'NA', definition: 'Noradrenalina', category: 'Farmacología', usage: 'Vasopresor. Subir TA en shock.' },
  // O
  { id: '37', term: 'OMA', definition: 'Otitis Media Aguda', category: 'ORL', usage: 'Infección oído medio. Común en pediatría.' },
  { id: 'o1', term: 'O2', definition: 'Oxígeno', category: 'Gas', usage: 'Tratamiento hipoxia.' },
  // P
  { id: '38', term: 'PAE', definition: 'Proceso Atención Enfermería', category: 'Teoría', usage: 'Valoración, Diagnóstico, Planificación, Ejecución, Evaluación.' },
  { id: '39', term: 'PCR', definition: 'Parada Cardiorrespiratoria', category: 'Urgencias', usage: 'Iniciar RCP.' },
  { id: '40', term: 'PICC', definition: 'Peripherally Inserted Central Catheter', category: 'Técnicas', usage: 'Catéter central de inserción periférica.' },
  { id: '41', term: 'PVC', definition: 'Presión Venosa Central', category: 'UCI', usage: 'Precarga ventrículo derecho.' },
  { id: 'p1', term: 'PIC', definition: 'Presión Intracraneal', category: 'Neurología', usage: 'Monitorización en TCE.' },
  { id: 'p2', term: 'PEEP', definition: 'Positive End Expiratory Pressure', category: 'Respiratorio', usage: 'Presión al final espiración. Reclutar alveolos.' },
  // Q
  { id: '42', term: 'QT', definition: 'Intervalo QT', category: 'Cardiología', usage: 'Medida en ECG. QT largo = riesgo Torsade de Pointes.' },
  // R
  { id: '43', term: 'RCP', definition: 'Reanimación Cardiopulmonar', category: 'Urgencias', usage: 'Masaje cardiaco + Ventilación.' },
  { id: '44', term: 'RMN', definition: 'Resonancia Magnética Nuclear', category: 'Imagen', usage: 'No irradia. Contraindicado metales.' },
  { id: 'r1', term: 'Rx', definition: 'Radiografía', category: 'Imagen', usage: 'Rayos X.' },
  { id: 'r2', term: 'RASS', definition: 'Richmond Agitation Sedation Scale', category: 'UCI', usage: 'Escala sedación.' },
  // S
  { id: '45', term: 'SCASEST', definition: 'Síndrome Coronario Agudo Sin Elevación ST', category: 'Cardiología', usage: 'Angina inestable / IAM subendocárdico.' },
  { id: '46', term: 'SCACEST', definition: 'Síndrome Coronario Agudo Con Elevación ST', category: 'Cardiología', usage: 'Infarto transmural. Código Infarto.' },
  { id: '47', term: 'SNG', definition: 'Sonda Nasogástrica', category: 'Técnicas', usage: 'Levin (Alimentación), Salem (Descompresión).' },
  { id: '48', term: 'SV', definition: 'Sonda Vesical', category: 'Técnicas', usage: 'Foley. Control diuresis.' },
  { id: '49', term: 'SIRS', definition: 'Síndrome Respuesta Inflamatoria Sistémica', category: 'Patología', usage: 'Paso previo a Sepsis.' },
  { id: 's1', term: 'SatO2', definition: 'Saturación de Oxígeno', category: 'Constantes', usage: 'Pulsioximetría. Normal >95%.' },
  { id: 's2', term: 'SC', definition: 'Subcutánea', category: 'Vía Admin', usage: 'Insulina, Heparina.' },
  // T
  { id: '50', term: 'TAC', definition: 'Tomografía Axial Computarizada', category: 'Imagen', usage: 'Scanner. Irradiación alta.' },
  { id: '51', term: 'TAS', definition: 'Tensión Arterial Sistólica', category: 'Constantes', usage: 'La "alta".' },
  { id: '52', term: 'TAD', definition: 'Tensión Arterial Diastólica', category: 'Constantes', usage: 'La "baja".' },
  { id: '53', term: 'TCE', definition: 'Traumatismo Craneoencefálico', category: 'Trauma', usage: 'Vigilar GCS y pupilas.' },
  { id: '54', term: 'TEP', definition: 'Tromboembolismo Pulmonar', category: 'Respiratorio', usage: 'Trombo en arteria pulmonar.' },
  { id: '55', term: 'TQT', definition: 'Traqueostomía', category: 'Vía Aérea', usage: 'Orificio en tráquea.' },
  { id: '56', term: 'TVP', definition: 'Trombosis Venosa Profunda', category: 'Vascular', usage: 'Coágulo en venas profundas (piernas).' },
  { id: 't1', term: 'TS', definition: 'Taquicardia Sinusal', category: 'Cardiología', usage: 'FC alta ritmo normal.' },
  { id: 't2', term: 'TV', definition: 'Taquicardia Ventricular', category: 'Cardiología', usage: 'Arritmia grave. Puede requerir cardioversión.' },
  // U
  { id: '57', term: 'UCI', definition: 'Unidad Cuidados Intensivos', category: 'Gestión', usage: 'Pacientes críticos.' },
  { id: '58', term: 'UPP', definition: 'Úlcera Por Presión', category: 'Cuidados', usage: 'Escaras. Prevención: Cambios posturales.' },
  { id: 'u1', term: 'UVI', definition: 'Unidad Vigilancia Intensiva', category: 'Gestión', usage: 'Sinónimo de UCI.' },
  // V
  { id: '59', term: 'VNI', definition: 'Ventilación Mecánica No Invasiva', category: 'Respiratorio', usage: 'Soporte ventilatorio sin intubación.' },
  { id: '60', term: 'VRS', definition: 'Virus Respiratorio Sincitial', category: 'Pediatría', usage: 'Causa bronquiolitis.' },
  { id: 'v1', term: 'VM', definition: 'Ventilación Mecánica', category: 'Respiratorio', usage: 'Respirador.' },
  { id: 'v2', term: 'VVP', definition: 'Vía Venosa Periférica', category: 'Técnicas', usage: 'Abocath. Sueroterapia.' },
  // Z
  { id: 'z1', term: 'ZSN', definition: 'Zona Sin Novedad', category: 'Registro', usage: 'Coloquial. Todo estable.' }
];

interface GlossaryProps {
    initialTerm?: string; // NUEVO PROP para sincronización
}

export const Glossary: React.FC<GlossaryProps> = ({ initialTerm }) => {
  const [filter, setFilter] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  // Efecto para manejar el término inicial desde la búsqueda global
  useEffect(() => {
      if (initialTerm) {
          const term = MOCK_TERMS.find(t => t.term.toLowerCase() === initialTerm.toLowerCase());
          if (term) {
              setSelectedTerm(term);
              setFilter('');
              // Scroll opcional al término
              setTimeout(() => {
                  document.getElementById(`group-${term.term.charAt(0).toUpperCase()}`)?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
          }
      }
  }, [initialTerm]);

  // Group terms by initial letter
  const groupedTerms = useMemo(() => {
      const q = filter.toLowerCase();
      const filtered = MOCK_TERMS.filter(t => 
          t.term.toLowerCase().includes(q) || 
          t.definition.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      ).sort((a, b) => a.term.localeCompare(b.term));

      const groups: Record<string, Term[]> = {};
      filtered.forEach(term => {
          const letter = term.term.charAt(0).toUpperCase();
          if (!groups[letter]) groups[letter] = [];
          groups[letter].push(term);
      });
      return groups;
  }, [filter]);

  const sortedGroups = Object.keys(groupedTerms).sort();

  return (
    <div className="flex h-full bg-slate-100 overflow-hidden relative">
       
       {/* --- LEFT: INDEX LIST --- */}
       <div className={`flex-1 flex flex-col h-full bg-slate-50 transition-all ${selectedTerm ? 'hidden md:flex md:w-1/2 lg:w-1/3 border-r border-slate-200' : 'w-full'}`}>
           
           {/* Header */}
           <div className="bg-slate-900 text-white p-4 shrink-0 shadow-md z-20">
              <div className="flex justify-between items-center mb-3">
                  <h2 className="font-black text-sm uppercase tracking-widest text-emerald-400 flex items-center">
                     <BookA className="w-5 h-5 mr-2" /> DICCIONARIO CLÍNICO
                  </h2>
                  <span className="text-[10px] font-bold bg-slate-800 px-2 py-1 rounded-full text-slate-300">{MOCK_TERMS.length} Términos</span>
              </div>
              <div className="relative group mb-3">
                <Search className="absolute left-3 top-2.5 text-slate-500 group-focus-within:text-emerald-500 w-4 h-4 transition-colors" />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="Buscar siglas (Ej: 'ACV')..." 
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold text-white placeholder-slate-500 transition-all"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                {filter && (
                    <button 
                        onClick={() => { setFilter(''); inputRef.current?.focus(); }}
                        className="absolute right-2 top-2.5 text-slate-500 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
             </div>
             
             {/* ALPHABET NAV (Horizontal for Mobile) */}
             <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 mt-2">
                {alphabet.map(l => {
                    const exists = sortedGroups.includes(l);
                    return (
                        <button 
                            key={l}
                            onClick={() => exists && document.getElementById(`group-${l}`)?.scrollIntoView({ behavior: 'smooth' })}
                            className={`w-[44px] h-[44px] shrink-0 rounded-lg text-sm font-black flex items-center justify-center transition-all ${exists ? 'bg-slate-800 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-sm' : 'bg-slate-800/50 text-slate-600 cursor-default'}`}
                        >
                            {l}
                        </button>
                    );
                })}
             </div>
           </div>

           {/* Content */}
           <div className="flex flex-1 overflow-hidden relative">
               
               {/* List */}
               <div className="flex-1 overflow-y-auto custom-scrollbar p-2 pb-48 scroll-smooth" id="glossary-list">
                   {sortedGroups.length > 0 ? sortedGroups.map(letter => (
                       <div key={letter} id={`group-${letter}`} className="mb-4">
                           <div className="sticky top-0 bg-slate-100/95 backdrop-blur z-10 py-1.5 px-2 flex items-center border-b border-slate-200 mb-2">
                               <span className="text-xs font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded mr-2">{letter}</span>
                               <div className="h-px bg-slate-200 flex-1"></div>
                           </div>
                           <div className="space-y-2">
                               {groupedTerms[letter].map(term => (
                                   <button 
                                       key={term.id} 
                                       onClick={() => setSelectedTerm(term)}
                                       className={`w-full text-left bg-white p-3 rounded-xl border shadow-sm flex justify-between items-center group transition-all active:scale-[0.99] ${selectedTerm?.id === term.id ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50' : 'border-slate-200 hover:border-emerald-300'}`}
                                   >
                                       <div>
                                           <div className={`text-base font-black tracking-tight ${selectedTerm?.id === term.id ? 'text-emerald-800' : 'text-slate-800 group-hover:text-emerald-700'}`}>{term.term}</div>
                                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{term.category}</div>
                                       </div>
                                       <ChevronRight className={`w-4 h-4 ${selectedTerm?.id === term.id ? 'text-emerald-600' : 'text-slate-300 group-hover:text-emerald-400'}`}/>
                                   </button>
                               ))}
                           </div>
                       </div>
                   )) : (
                       <div className="text-center py-20 text-slate-400 opacity-50">
                           <Tag className="w-12 h-12 mx-auto mb-2"/>
                           <p className="text-xs font-bold uppercase">Sin resultados</p>
                       </div>
                   )}
               </div>
           </div>
       </div>

       {/* --- RIGHT: DETAIL VIEW --- */}
       <div className={`flex-1 bg-white border-l border-slate-200 flex flex-col h-full overflow-hidden ${!selectedTerm ? 'hidden md:flex' : 'flex fixed inset-0 md:relative z-30'}`}>
           {selectedTerm ? (
               <div className="flex flex-col h-full animate-slide-in-right">
                   {/* Header */}
                   <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 flex items-center gap-3 relative">
                       <button onClick={() => setSelectedTerm(null)} className="md:hidden flex items-center gap-1 p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors shadow-sm">
                           <ChevronLeft className="w-5 h-5 text-slate-600"/>
                           <span className="text-[10px] font-black uppercase text-slate-600 pr-1">Volver</span>
                       </button>
                       <div className="flex-1">
                           <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded w-fit mb-1 border border-emerald-100">{selectedTerm.category}</div>
                           <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">{selectedTerm.term}</h1>
                       </div>
                   </div>

                   {/* Content */}
                   <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 flex flex-col justify-start">
                       <div className="max-w-2xl mx-auto w-full space-y-8">
                           
                           <div>
                               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Hash className="w-4 h-4 mr-2"/> Significado</h3>
                               <p className="text-xl md:text-2xl font-bold text-slate-800 leading-snug border-l-4 border-slate-900 pl-4 py-1">
                                   {selectedTerm.definition}
                               </p>
                           </div>

                           <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 shadow-sm relative overflow-hidden">
                               <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-200 rounded-full opacity-50 blur-xl"></div>
                               <h3 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-3 flex items-center relative z-10"><GraduationCap className="w-4 h-4 mr-2"/> Contexto Clínico</h3>
                               <p className="text-sm md:text-base font-medium text-indigo-900 leading-relaxed relative z-10">
                                   {selectedTerm.usage}
                               </p>
                           </div>

                       </div>
                   </div>
                   
                   {/* Footer */}
                   <div className="p-4 border-t border-slate-100 text-center text-slate-400 text-xs font-bold bg-slate-50">
                       PAESYS Knowledge Base
                   </div>
               </div>
           ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 select-none bg-slate-50/50">
                   <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                       <BookA className="w-14 h-14 text-slate-200"/>
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-widest text-slate-400">Diccionario</h3>
                   <p className="text-sm font-medium text-slate-400 mt-2 text-center max-w-xs">Selecciona un término para ver su definición completa y contexto de uso.</p>
               </div>
           )}
       </div>
    </div>
  );
};