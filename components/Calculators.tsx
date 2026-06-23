import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, Syringe, Droplets, Scale, Brain, Flame, BedDouble, Baby, Timer, HeartCrack, ChevronLeft, FlaskConical, AlertTriangle, Monitor, Activity, Stethoscope, Star, Search, LayoutGrid, ChevronRight, ArrowRight, Gauge, Ruler, Eye, Thermometer, Bot, Sparkles, Send, Loader2, ArrowLeftRight, CheckCircle2, Play, Pause, RefreshCcw, Info, BookOpen, User, Divide, X, MessageCircle, Moon, Frown, Skull, Biohazard, Heart, Wind, Grid, Copy, RotateCcw, Wand2, ShieldAlert, Zap, Utensils } from 'lucide-react';
import { solveClinicalMath } from '../services/geminiService';
import { ViewState } from '../types';
import { ListItem } from './shared/ListItem';

// Organized List
export const TOOLS_LIST = [
    // --- AI / DOSAGE PRO ---
    { id: 'math_ai', label: 'Cálculo IA PRO', icon: Wand2, color: 'text-violet-600', bg: 'bg-violet-50', category: 'GENERAL' },
    { id: 'dosage', label: 'Dosificación (Regla 3)', icon: Syringe, color: 'text-indigo-600', bg: 'bg-indigo-50', category: 'GENERAL' },
    { id: 'insulin_calc', label: 'Corrección de Insulina', icon: Droplets, color: 'text-orange-600', bg: 'bg-orange-50', category: 'GENERAL' },

    // --- CRITICOS / EMERGENCIA ---
    { id: 'news2', label: 'NEWS2 (Deterioro)', icon: Monitor, color: 'text-red-600', bg: 'bg-red-50', category: 'CRITICAL' },
    { id: 'glasgow', label: 'Escala Glasgow (GCS)', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50', category: 'NEURO' },
    { id: 'rass', label: 'Escala RASS (Sedación)', icon: Moon, color: 'text-purple-600', bg: 'bg-purple-50', category: 'NEURO' },
    { id: 'parkland', label: 'Parkland (Quemados)', icon: Flame, color: 'text-red-600', bg: 'bg-red-50', category: 'CRITICAL' },

    // --- RESPIRATORIO / CARDIO ---
    { id: 'map', label: 'Tensión Arterial Media', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', category: 'CARDIO' },
    { id: 'wells', label: 'Criterios Wells (TEP)', icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50', category: 'RESP' },
    { id: 'hasbled', label: 'HAS-BLED (Sangrado)', icon: Droplets, color: 'text-rose-600', bg: 'bg-rose-50', category: 'CARDIO' },

    // --- CUIDADOS / ENFERMERIA ---
    { id: 'braden', label: 'Escala Braden (UPP)', icon: BedDouble, color: 'text-orange-600', bg: 'bg-orange-50', category: 'NURSING' },
    { id: 'norton', label: 'Escala Norton (UPP)', icon: BedDouble, color: 'text-orange-600', bg: 'bg-orange-50', category: 'NURSING' },
    { id: 'barthel', label: 'Índice Barthel (ABVD)', icon: User, color: 'text-orange-600', bg: 'bg-orange-50', category: 'NURSING' },
    { id: 'morse', label: 'Escala Morse (Caídas)', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', category: 'NURSING' },
    { id: 'vip', label: 'Escala VIP (Flebitis)', icon: Syringe, color: 'text-red-600', bg: 'bg-red-50', category: 'NURSING' },

    // --- PEDIATRÍA ---
    { id: 'apgar', label: 'Test de APGAR', icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50', category: 'PED' },
    { id: 'silverman', label: 'Test Silverman', icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50', category: 'PED' },
    { id: 'braden_q', label: 'Braden Q (UPP Ped)', icon: Baby, color: 'text-pink-600', bg: 'bg-pink-50', category: 'PED' },

    // --- GENERAL / METABOLICO ---
    { id: 'eva', label: 'Escala EVA (Dolor)', icon: Activity, color: 'text-rose-600', bg: 'bg-rose-50', category: 'GENERAL' },
    { id: 'bmi', label: 'IMC / Superficie Corporal', icon: Scale, color: 'text-emerald-600', bg: 'bg-emerald-50', category: 'GENERAL' },
    { id: 'gfr', label: 'Filtrado Glomerular', icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-50', category: 'GENERAL' },
    { id: 'insensible', label: 'Pérdidas Insensibles', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-50', category: 'GENERAL' },
    { id: 'holliday', label: 'Líquidos (Holliday-Segar)', icon: Utensils, color: 'text-blue-600', bg: 'bg-blue-50', category: 'GENERAL' },
    { id: 'downton', label: 'Escala Downton (Caídas)', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50', category: 'NURSING' },
    { id: 'ramsay', label: 'Escala Ramsay (Sedación)', icon: Moon, color: 'text-purple-600', bg: 'bg-purple-50', category: 'NEURO' },
    { id: 'cpot', label: 'Escala CPOT (Dolor Crítico)', icon: HeartCrack, color: 'text-red-600', bg: 'bg-red-50', category: 'CRITICAL' },
    { id: 'camicu', label: 'CAM-ICU (Delirium)', icon: Brain, color: 'text-orange-600', bg: 'bg-orange-50', category: 'CRITICAL' },
];

const CATEGORIES = [
    { id: 'ALL', label: 'Todo' },
    { id: 'FAV', label: 'Favoritos' },
    { id: 'CRITICAL', label: 'UCI/Urg' },
    { id: 'NURSING', label: 'Cuidados' },
    { id: 'NEURO', label: 'Neuro' },
    { id: 'CARDIO', label: 'Cardio' },
    { id: 'RESP', label: 'Resp' },
    { id: 'PED', label: 'Pediatría' },
    { id: 'GENERAL', label: 'General' },
];

const NEWS2_DATA = {
    rr: { label: 'Frec. Respiratoria', opts: [
        { l: '≤8', v: 3 }, { l: '9-11', v: 1 }, { l: '12-20', v: 0 }, { l: '21-24', v: 2 }, { l: '≥25', v: 3 }
    ]},
    sat: { label: 'SatO2', opts: [
        { l: '≤91', v: 3 }, { l: '92-93', v: 2 }, { l: '94-95', v: 1 }, { l: '≥96', v: 0 }
    ]},
    o2: { label: 'Oxígeno Suplementario', opts: [
        { l: 'No', v: 0 }, { l: 'Sí', v: 2 }
    ]},
    sbp: { label: 'Tensión Art. Sistólica', opts: [
        { l: '≤90', v: 3 }, { l: '91-100', v: 2 }, { l: '101-110', v: 1 }, { l: '111-219', v: 0 }, { l: '≥220', v: 3 }
    ]},
    hr: { label: 'Frecuencia Cardiaca', opts: [
        { l: '≤40', v: 3 }, { l: '41-50', v: 1 }, { l: '51-90', v: 0 }, { l: '91-110', v: 1 }, { l: '111-130', v: 2 }, { l: '≥131', v: 3 }
    ]},
    gcs: { label: 'Consciencia', opts: [
        { l: 'Alerta', v: 0 }, { l: 'Confuso/Voz/Dolor', v: 3 }
    ]},
    temp: { label: 'Temperatura', opts: [
        { l: '≤35.0', v: 3 }, { l: '35.1-36.0', v: 1 }, { l: '36.1-38.0', v: 0 }, { l: '38.1-39.0', v: 1 }, { l: '≥39.1', v: 2 }
    ]}
};

const HASBLED_ITEMS = [
    { id: 'h', label: 'Hipertensión no controlada (TAS > 160)', p: 1 },
    { id: 'a_r', label: 'Función Renal Alterada', p: 1 },
    { id: 'a_l', label: 'Función Hepática Alterada', p: 1 },
    { id: 's', label: 'Ictus previo', p: 1 },
    { id: 'b', label: 'Historia de Sangrado / Predisposición', p: 1 },
    { id: 'l', label: 'INR Lábil (si toma AVK)', p: 1 },
    { id: 'e', label: 'Edad > 65 años', p: 1 },
    { id: 'd_d', label: 'Fármacos (Antiagregantes/AINEs)', p: 1 },
    { id: 'd_a', label: 'Alcohol (>8 tragos/sem)', p: 1 },
];

const BARTHEL_DATA = [
    { id: 'feeding', label: 'Comer', opts: [{l:'Independiente', v:10}, {l:'Ayuda', v:5}, {l:'Dependiente', v:0}] },
    { id: 'bathing', label: 'Lavarse', opts: [{l:'Independiente', v:5}, {l:'Dependiente', v:0}] },
    { id: 'grooming', label: 'Arreglarse', opts: [{l:'Independiente', v:5}, {l:'Dependiente', v:0}] },
    { id: 'dressing', label: 'Vestirse', opts: [{l:'Independiente', v:10}, {l:'Ayuda', v:5}, {l:'Dependiente', v:0}] },
    { id: 'bowels', label: 'Deposición', opts: [{l:'Continente', v:10}, {l:'Ocasional', v:5}, {l:'Incontinente', v:0}] },
    { id: 'bladder', label: 'Micción', opts: [{l:'Continente', v:10}, {l:'Ocasional', v:5}, {l:'Incontinente', v:0}] },
    { id: 'toilet', label: 'Retrete', opts: [{l:'Independiente', v:10}, {l:'Ayuda', v:5}, {l:'Dependiente', v:0}] },
    { id: 'transfer', label: 'Traslado', opts: [{l:'Independiente', v:15}, {l:'Mínima ayuda', v:10}, {l:'Gran ayuda', v:5}, {l:'Dependiente', v:0}] },
    { id: 'mobility', label: 'Deambulación', opts: [{l:'Independiente', v:15}, {l:'Ayuda', v:10}, {l:'Silla ruedas', v:5}, {l:'Inmóvil', v:0}] },
    { id: 'stairs', label: 'Escaleras', opts: [{l:'Independiente', v:10}, {l:'Ayuda', v:5}, {l:'Incapaz', v:0}] },
];

const WELLS_DATA = [
    { id: 'dvt', label: 'Signos clínicos de TVP', points: 3 },
    { id: 'pe_likely', label: 'TEP más probable que otros dx', points: 3 },
    { id: 'hr', label: 'Frecuencia cardiaca > 100 lpm', points: 1.5 },
    { id: 'immobilization', label: 'Inmovilización >3d o cirugía <4 sem', points: 1.5 },
    { id: 'history', label: 'Antecedente TVP/TEP', points: 1.5 },
    { id: 'hemoptysis', label: 'Hemoptisis', points: 1 },
    { id: 'cancer', label: 'Cáncer activo o paliativo <6m', points: 1 },
];

const RASS_DATA = [
    { v: 4, l: 'Combativo', d: 'Violento, peligroso' },
    { v: 3, l: 'Muy agitado', d: 'Tira de tubos/catéteres' },
    { v: 2, l: 'Agitado', d: 'Movimientos frecuentes, lucha con respirador' },
    { v: 1, l: 'Inquieto', d: 'Ansioso, pero no agresivo' },
    { v: 0, l: 'Alerta y tranquilo', d: 'Estado óptimo' },
    { v: -1, l: 'Somnoliento', d: 'Despierta a la voz (>10s)' },
    { v: -2, l: 'Sedación ligera', d: 'Despierta a la voz (<10s)' },
    { v: -3, l: 'Sedación moderada', d: 'Movimiento/apertura ocular a la voz (no contacto)' },
    { v: -4, l: 'Sedación profunda', d: 'Sin respuesta a voz, sí a estimulo físico' },
    { v: -5, l: 'Inespetable', d: 'Sin respuesta a estimulo físico' },
];

const GCS_SCALES = {
    eye: [
        { val: 4, label: 'Espontánea', desc: 'Ojos abiertos normal' },
        { val: 3, label: 'A la orden', desc: 'Al hablarle' },
        { val: 2, label: 'Al dolor', desc: 'Estímulo doloroso' },
        { val: 1, label: 'Ninguna', desc: 'No abre ojos' }
    ],
    verbal: [
        { val: 5, label: 'Orientado', desc: 'Conversa normal' },
        { val: 4, label: 'Confuso', desc: 'Desorientado' },
        { val: 3, label: 'Inapropiado', desc: 'Palabras sueltas' },
        { val: 2, label: 'Sonidos', desc: 'Gemidos, quejidos' },
        { val: 1, label: 'Ninguna', desc: 'Sin respuesta' }
    ],
    motor: [
        { val: 6, label: 'Obedece', desc: 'Cumple órdenes' },
        { val: 5, label: 'Localiza', desc: 'Localiza dolor' },
        { val: 4, label: 'Retirada', desc: 'Flexión normal' },
        { val: 3, label: 'Flexión Anormal', desc: 'Decorticación' },
        { val: 2, label: 'Extensión', desc: 'Descerebración' },
        { val: 1, label: 'Ninguna', desc: 'Flaccidez' }
    ]
};

const BRADEN_SCALE = [
    { id: 'sensory', title: 'Percepción Sensorial', opts: [
        { v: 1, l: 'Completamente limitada' }, { v: 2, l: 'Muy limitada' }, { v: 3, l: 'Ligeramente limitada' }, { v: 4, l: 'Sin limitaciones' }
    ]},
    { id: 'moisture', title: 'Exposición Humedad', opts: [
        { v: 1, l: 'Constantemente húmeda' }, { v: 2, l: 'A menudo húmeda' }, { v: 3, l: 'Ocasionalmente húmeda' }, { v: 4, l: 'Raramente húmeda' }
    ]},
    { id: 'activity', title: 'Actividad', opts: [
        { v: 1, l: 'Encamado' }, { v: 2, l: 'En silla' }, { v: 3, l: 'Deambula ocasionalmente' }, { v: 4, l: 'Deambula frecuentemente' }
    ]},
    { id: 'mobility', title: 'Movilidad', opts: [
        { v: 1, l: 'Completamente inmóvil' }, { v: 2, l: 'Muy limitada' }, { v: 3, l: 'Ligeramente limitada' }, { v: 4, l: 'Sin limitaciones' }
    ]},
    { id: 'nutrition', title: 'Nutrición', opts: [
        { v: 1, l: 'Muy pobre' }, { v: 2, l: 'Probablemente inadecuada' }, { v: 3, l: 'Adecuada' }, { v: 4, l: 'Excelente' }
    ]},
    { id: 'friction', title: 'Fricción y Cizallamiento', opts: [
        { v: 1, l: 'Problema' }, { v: 2, l: 'Problema potencial' }, { v: 3, l: 'No existe problema aparente' }
    ]}
];

const NORTON_SCALE = [
    { id: 'physical', title: 'Estado Físico', opts: [{l:'Bueno', v:4}, {l:'Regular', v:3}, {l:'Malo', v:2}, {l:'Muy Malo', v:1}] },
    { id: 'mental', title: 'Estado Mental', opts: [{l:'Alerta', v:4}, {l:'Apático', v:3}, {l:'Confuso', v:2}, {l:'Estuporoso', v:1}] },
    { id: 'activity', title: 'Actividad', opts: [{l:'Ambulante', v:4}, {l:'Camina c/ayuda', v:3}, {l:'Silla', v:2}, {l:'Encamado', v:1}] },
    { id: 'mobility', title: 'Movilidad', opts: [{l:'Total', v:4}, {l:'Dism. Ligera', v:3}, {l:'Muy Limitada', v:2}, {l:'Inmóvil', v:1}] },
    { id: 'incontinence', title: 'Incontinencia', opts: [{l:'Ninguna', v:4}, {l:'Ocasional', v:3}, {l:'Urinaria/Fecal', v:2}, {l:'Doble', v:1}] },
];

const APGAR_SCALE = [
    { id: 'appearance', title: 'Apariencia (Color)', opts: [{v:0, l:'Cianosis/Palidez'}, {v:1, l:'Acrocianosis'}, {v:2, l:'Rosado'}] },
    { id: 'pulse', title: 'Pulso (FC)', opts: [{v:0, l:'Ausente'}, {v:1, l:'<100 lpm'}, {v:2, l:'>100 lpm'}] },
    { id: 'grimace', title: 'Gesto (Reflejos)', opts: [{v:0, l:'Sin respuesta'}, {v:1, l:'Mueca'}, {v:2, l:'Llanto/Tos/Estornudo'}] },
    { id: 'activity', title: 'Actividad (Tono)', opts: [{v:0, l:'Flacidez'}, {v:1, l:'Alguna flexión'}, {v:2, l:'Movimiento activo'}] },
    { id: 'respiration', title: 'Respiración', opts: [{v:0, l:'Ausente'}, {v:1, l:'Lenta/Irregular'}, {v:2, l:'Llanto fuerte'}] },
];

const MORSE_SCALE = [
    { id: 'history', title: 'Historial de caídas', opts: [{l:'No', v:0}, {l:'Sí', v:25}] },
    { id: 'secondary', title: 'Diagnóstico secundario', opts: [{l:'No', v:0}, {l:'Sí', v:15}] },
    { id: 'aid', title: 'Ayuda para deambular', opts: [{l:'Ninguna/Reposo', v:0}, {l:'Muletas/Bastón', v:15}, {l:'Muebles', v:30}] },
    { id: 'iv', title: 'Vía venosa (IV / Heparina)', opts: [{l:'No', v:0}, {l:'Sí', v:20}] },
    { id: 'gait', title: 'Marcha', opts: [{l:'Normal/Reposo', v:0}, {l:'Débil', v:10}, {l:'Alterada', v:20}] },
    { id: 'mental', title: 'Estado mental', opts: [{l:'Consciente de límites', v:0}, {l:'Olvida sus límites', v:15}] },
];

const VIP_SCALE = [
    { v: 0, l: 'Sin signos de flebitis', d: 'Sitio IV sano. Observar.' },
    { v: 1, l: 'Posible primer signo', d: 'Ligero dolor o enrojecimiento. Observar.' },
    { v: 2, l: 'Estadio temprano', d: 'Dolor y enrojecimiento/hinchazón. Retirar vía.' },
    { v: 3, l: 'Estadio medio', d: 'Dolor, enrojecimiento, induración. Retirar y tratar.' },
    { v: 4, l: 'Estadio avanzado', d: 'Dolor, enrojecimiento, induración, cordón venoso. Retirar y tratar.' },
    { v: 5, l: 'Tromboflebitis', d: 'Todo lo anterior + cordón > 2.5cm o pus. Iniciar protocolo.' },
];

const SILVERMAN_SCALE = [
    { id: 'chest', title: 'Movimientos toraco-abdominales', opts: [{v:0, l:'Rítmicos/Regulares'}, {v:1, l:'Tórax inmóvil'}, {v:2, l:'Bamboleo'}] },
    { id: 'intercostal', title: 'Tiraje intercostal', opts: [{v:0, l:'Ausente'}, {v:1, l:'Leve'}, {v:2, l:'Marcado'}] },
    { id: 'xiphoid', title: 'Retracción xifoidea', opts: [{v:0, l:'Ausente'}, {v:1, l:'Leve'}, {v:2, l:'Marcada'}] },
    { id: 'nares', title: 'Aleteo nasal', opts: [{v:0, l:'Ausente'}, {v:1, l:'Leve'}, {v:2, l:'Marcado'}] },
    { id: 'grunt', title: 'Quejido espiratorio', opts: [{v:0, l:'Ausente'}, {v:1, l:'Audible c/fonendo'}, {v:2, l:'Audible a distancia'}] },
];

const DOWNTON_SCALE = [
    { id: 'falls', title: 'Caídas previas', opts: [{l:'No', v:0}, {l:'Sí', v:1}] },
    { id: 'meds', title: 'Medicamentos (Tranquilizantes, diuréticos, hipotensores...)', opts: [{l:'Ninguno', v:0}, {l:'Uno o más', v:1}] },
    { id: 'sensory', title: 'Déficit sensorial (Visual, auditivo, extremidades)', opts: [{l:'Ninguno', v:0}, {l:'Uno o más', v:1}] },
    { id: 'mental', title: 'Estado mental', opts: [{l:'Orientado', v:0}, {l:'Confuso', v:1}] },
    { id: 'gait', title: 'Deambulación', opts: [{l:'Normal', v:0}, {l:'Segura con ayuda / Insegura / Imposible', v:1}] },
];

const RAMSAY_DATA = [
    { v: 1, l: 'Ansioso, agitado', d: 'No descansa' },
    { v: 2, l: 'Cooperador, orientado', d: 'Tranquilo' },
    { v: 3, l: 'Responde a órdenes', d: 'Dormido, pero responde' },
    { v: 4, l: 'Respuesta rápida a estímulo', d: 'Luz o sonido fuerte' },
    { v: 5, l: 'Respuesta perezosa a estímulo', d: 'Luz o sonido fuerte' },
    { v: 6, l: 'Sin respuesta', d: 'No responde a estímulos' },
];

const CPOT_DATA = [
    { id: 'expression', title: 'Expresión facial', opts: [{v:0, l:'Relajada'}, {v:1, l:'Tensa (ceño fruncido)'}, {v:2, l:'Mueca (párpados cerrados)'}] },
    { id: 'movement', title: 'Movimientos corporales', opts: [{v:0, l:'Ausencia (posición normal)'}, {v:1, l:'Protección (lento, cauteloso)'}, {v:2, l:'Agitación (tira de tubos, intenta sentarse)'}] },
    { id: 'vent', title: 'Adaptación al ventilador (o vocalización)', opts: [{v:0, l:'Tolerancia (sin alarmas)'}, {v:1, l:'Tos pero tolera'}, {v:2, l:'Lucha con ventilador (alarmas frecuentes)'}] },
    { id: 'tension', title: 'Tensión muscular', opts: [{v:0, l:'Relajado'}, {v:1, l:'Tenso, rígido'}, {v:2, l:'Muy tenso, rígido'}] },
];

const CAMICU_DATA = [
    { id: 'acute', title: '1. Inicio agudo o curso fluctuante', opts: [{l:'No', v:0}, {l:'Sí', v:1}] },
    { id: 'inattention', title: '2. Falta de atención (SAVEAHAART)', opts: [{l:'0-2 errores', v:0}, {l:' >2 errores', v:1}] },
    { id: 'altered', title: '3. Nivel de conciencia alterado (RASS ≠ 0)', opts: [{l:'No', v:0}, {l:'Sí', v:1}] },
    { id: 'disorganized', title: '4. Pensamiento desorganizado', opts: [{l:'0-1 errores', v:0}, {l:' >1 errores', v:1}] },
];

const BRADEN_Q_SCALE = [
    { id: 'mobility', title: 'Movilidad', opts: [{v:1, l:'Completamente inmóvil'}, {v:2, l:'Muy limitada'}, {v:3, l:'Ligeramente limitada'}, {v:4, l:'Sin limitaciones'}] },
    { id: 'activity', title: 'Actividad', opts: [{v:1, l:'Encamado'}, {v:2, l:'En silla'}, {v:3, l:'Deambula ocasionalmente'}, {v:4, l:'Deambula frecuentemente'}] },
    { id: 'sensory', title: 'Percepción Sensorial', opts: [{v:1, l:'Completamente limitada'}, {v:2, l:'Muy limitada'}, {v:3, l:'Ligeramente limitada'}, {v:4, l:'Sin limitaciones'}] },
    { id: 'moisture', title: 'Humedad', opts: [{v:1, l:'Constantemente húmeda'}, {v:2, l:'A menudo húmeda'}, {v:3, l:'Ocasionalmente húmeda'}, {v:4, l:'Raramente húmeda'}] },
    { id: 'friction', title: 'Fricción y Cizallamiento', opts: [{v:1, l:'Problema significativo'}, {v:2, l:'Problema moderado'}, {v:3, l:'Problema potencial'}, {v:4, l:'No existe problema'}] },
    { id: 'nutrition', title: 'Nutrición', opts: [{v:1, l:'Muy pobre'}, {v:2, l:'Inadecuada'}, {v:3, l:'Adecuada'}, {v:4, l:'Excelente'}] },
    { id: 'perfusion', title: 'Perfusión Tisular y Oxigenación', opts: [{v:1, l:'Extremadamente pobre'}, {v:2, l:'Comprometida'}, {v:3, l:'Adecuada'}, {v:4, l:'Excelente'}] },
];

interface CalculatorsProps {
    initialTool?: string;
    patientId?: string;
    onNavigate?: (view: ViewState, params?: any) => void;
}

export const Calculators: React.FC<CalculatorsProps> = ({ initialTool, patientId, onNavigate }) => {
    const [selectedTool, setSelectedTool] = useState<string | null>(initialTool || null);
    const [filterCategory, setFilterCategory] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState<string[]>([]);
    const [patient, setPatient] = useState<any>(null);
    const [allPatients, setAllPatients] = useState<any[]>([]);

    useEffect(() => {
        import('../services/firebaseMock').then(({ PatientService }) => {
            PatientService.getAll().then(data => {
                setAllPatients(data);
                if (patientId) {
                    const p = data.find((x: any) => x.id === patientId);
                    if (p) setPatient(p);
                }
            });
        });
    }, [patientId]);

    // --- TOOL STATES ---
    const [gcsScore, setGcsScore] = useState({ eye: 4, verbal: 5, motor: 6 });
    const [news2Inputs, setNews2Inputs] = useState<Record<string, number>>({ rr:0, sat:0, o2:0, sbp:0, hr:0, gcs:0, temp:0 });
    const [barthelInputs, setBarthelInputs] = useState<Record<string, number>>({ feeding:10, bathing:5, grooming:5, dressing:10, bowels:10, bladder:10, toilet:10, transfer:15, mobility:15, stairs:10 });
    const [wellsInputs, setWellsInputs] = useState<string[]>([]);
    const [hasbledInputs, setHasbledInputs] = useState<string[]>([]);
    const [rassScore, setRassScore] = useState(0);
    const [doseInputs, setDoseInputs] = useState({ desired: '', onHand: '', vehicle: '' });
    const [bmiInputs, setBmiInputs] = useState({ weight: '', height: '' });
    const [mapInputs, setMapInputs] = useState({ sys: '', dia: '' });
    const [gfrInputs, setGfrInputs] = useState({ creat: '', age: '', sex: 'male', race: 'non-black' });
    const [bradenInputs, setBradenInputs] = useState<Record<string, number>>({ sensory:4, moisture:4, activity:4, mobility:4, nutrition:4, friction:3 });
    const [nortonInputs, setNortonInputs] = useState<Record<string, number>>({ physical:4, mental:4, activity:4, mobility:4, incontinence:4 });
    const [apgarInputs, setApgarInputs] = useState<Record<string, number>>({ appearance:2, pulse:2, grimace:2, activity:2, respiration:2 });
    const [insensibleInputs, setInsensibleInputs] = useState({ weight: '', hours: '24', fever: '0' });
    const [morseInputs, setMorseInputs] = useState<Record<string, number>>({ history:0, secondary:0, aid:0, iv:0, gait:0, mental:0 });
    const [evaScore, setEvaScore] = useState(0);
    const [vipScore, setVipScore] = useState(0);
    const [silvermanInputs, setSilvermanInputs] = useState<Record<string, number>>({ chest:0, intercostal:0, xiphoid:0, nares:0, grunt:0 });
    const [downtonInputs, setDowntonInputs] = useState<Record<string, number>>({ falls:0, meds:0, sensory:0, mental:0, gait:0 });
    const [ramsayScore, setRamsayScore] = useState(2);
    const [cpotInputs, setCpotInputs] = useState<Record<string, number>>({ expression:0, movement:0, vent:0, tension:0 });
    const [camicuInputs, setCamicuInputs] = useState<Record<string, number>>({ acute:0, inattention:0, altered:0, disorganized:0 });
    const [bradenQInputs, setBradenQInputs] = useState<Record<string, number>>({ mobility:4, activity:4, sensory:4, moisture:4, friction:4, nutrition:4, perfusion:4 });
    const [parklandInputs, setParklandInputs] = useState({ weight: '', bsa: '' });
    const [deficitH2OInputs, setDeficitH2OInputs] = useState({ weight: '', sex: 'male', sodium: '' });
    const [insulinInputs, setInsulinInputs] = useState({ current: '', target: '150', isf: '50' });
    const [hollidayInputs, setHollidayInputs] = useState({ weight: '' });

    // Math AI
    const [mathProblem, setMathProblem] = useState('');
    const [mathResult, setMathResult] = useState('');
    const [isMathSolving, setIsMathSolving] = useState(false);

    // --- LOGIC HELPERS ---
    const handleSolveMath = async () => {
        if (!mathProblem.trim()) return;
        setIsMathSolving(true);
        setMathResult('');
        try {
            const result = await solveClinicalMath(mathProblem);
            setMathResult(result);
        } catch (error) {
            setMathResult("Error de conexión. Inténtalo de nuevo.");
        } finally {
            setIsMathSolving(false);
        }
    };

    const handleAIAssistantForDosage = () => {
        const text = `Necesito administrar una dosis de ${doseInputs.desired} mg. El envase tiene ${doseInputs.onHand} mg en ${doseInputs.vehicle} ml. ¿Cuánto volumen debo cargar?`;
        setMathProblem(text);
        setSelectedTool('math_ai');
    };

    useEffect(() => {
        const saved = localStorage.getItem('paesys_calc_favs');
        if (saved) setFavorites(JSON.parse(saved));
    }, []);

    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
        setFavorites(newFavs);
        localStorage.setItem('paesys_calc_favs', JSON.stringify(newFavs));
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        const btn = document.getElementById('copy-btn');
        if(btn) {
            const original = btn.innerHTML;
            btn.innerHTML = '¡Copiado!';
            setTimeout(() => btn.innerHTML = original, 1500);
        }
    };

    const handleReset = () => {
        if (selectedTool === 'news2') setNews2Inputs({ rr:0, sat:0, o2:0, sbp:0, hr:0, gcs:0, temp:0 });
        else if (selectedTool === 'barthel') setBarthelInputs({ feeding:10, bathing:5, grooming:5, dressing:10, bowels:10, bladder:10, toilet:10, transfer:15, mobility:15, stairs:10 });
        else if (selectedTool === 'wells') setWellsInputs([]);
        else if (selectedTool === 'hasbled') setHasbledInputs([]);
        else if (selectedTool === 'rass') setRassScore(0);
        else if (selectedTool === 'glasgow') setGcsScore({ eye: 4, verbal: 5, motor: 6 });
        else if (selectedTool === 'braden') setBradenInputs({ sensory:4, moisture:4, activity:4, mobility:4, nutrition:4, friction:3 });
        else if (selectedTool === 'norton') setNortonInputs({ physical:4, mental:4, activity:4, mobility:4, incontinence:4 });
        else if (selectedTool === 'apgar') setApgarInputs({ appearance:2, pulse:2, grimace:2, activity:2, respiration:2 });
        else if (selectedTool === 'morse') setMorseInputs({ history:0, secondary:0, aid:0, iv:0, gait:0, mental:0 });
        else if (selectedTool === 'eva') setEvaScore(0);
        else if (selectedTool === 'vip') setVipScore(0);
        else if (selectedTool === 'silverman') setSilvermanInputs({ chest:0, intercostal:0, xiphoid:0, nares:0, grunt:0 });
        else if (selectedTool === 'downton') setDowntonInputs({ falls:0, meds:0, sensory:0, mental:0, gait:0 });
        else if (selectedTool === 'ramsay') setRamsayScore(2);
        else if (selectedTool === 'cpot') setCpotInputs({ expression:0, movement:0, vent:0, tension:0 });
        else if (selectedTool === 'camicu') setCamicuInputs({ acute:0, inattention:0, altered:0, disorganized:0 });
        else if (selectedTool === 'braden_q') setBradenQInputs({ mobility:4, activity:4, sensory:4, moisture:4, friction:4, nutrition:4, perfusion:4 });
        else if (selectedTool === 'math_ai') { setMathProblem(''); setMathResult(''); }
        else if (selectedTool === 'insulin_calc') setInsulinInputs({ current: '', target: '150', isf: '50' });
    };

    const filteredTools = useMemo(() => {
        return TOOLS_LIST.filter(t => {
            const matchesSearch = t.label.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCat = filterCategory === 'ALL' ? true : filterCategory === 'FAV' ? favorites.includes(t.id) : t.category === filterCategory;
            return matchesSearch && matchesCat;
        });
    }, [searchQuery, filterCategory, favorites]);

    const calcDosage = () => {
        const d = parseFloat(doseInputs.desired); 
        const h = parseFloat(doseInputs.onHand); 
        const v = parseFloat(doseInputs.vehicle);
        if (isNaN(d) || isNaN(h) || isNaN(v) || h === 0) return null;
        return ((d / h) * v).toFixed(2);
    }

    const calcBMI = () => {
        const w = parseFloat(bmiInputs.weight);
        const h = parseFloat(bmiInputs.height) / 100;
        if (isNaN(w) || isNaN(h) || h === 0) return { bmi: null, cat: '', bsa: null };
        const bmi = w / (h * h);
        const bsa = 0.007184 * Math.pow(w, 0.425) * Math.pow(h * 100, 0.725);
        let cat = 'Normal';
        if (bmi < 18.5) cat = 'Bajo Peso';
        else if (bmi >= 25 && bmi < 30) cat = 'Sobrepeso';
        else if (bmi >= 30) cat = 'Obesidad';
        return { bmi: bmi.toFixed(1), cat, bsa: bsa.toFixed(2) };
    }

    const calcMAP = () => {
        const s = parseFloat(mapInputs.sys);
        const d = parseFloat(mapInputs.dia);
        if (isNaN(s) || isNaN(d)) return null;
        return ((s + 2 * d) / 3).toFixed(0);
    }

    const calcInsulinCorrection = () => {
        const current = parseFloat(insulinInputs.current);
        const target = parseFloat(insulinInputs.target);
        const isf = parseFloat(insulinInputs.isf);
        if (isNaN(current) || isNaN(target) || isNaN(isf) || isf <= 0) return null;
        if (current <= target) return 0;
        return ((current - target) / isf).toFixed(1);
    }

    const calcHolliday = () => {
        const w = parseFloat(hollidayInputs.weight);
        if (isNaN(w) || w <= 0) return null;
        let daily = 0;
        if (w <= 10) daily = w * 100;
        else if (w <= 20) daily = 1000 + (w - 10) * 50;
        else daily = 1500 + (w - 20) * 20;
        const hourly = (daily / 24).toFixed(1);
        return { daily: daily.toFixed(0), hourly };
    }

    const doseResult = calcDosage();
    const bmiResult = calcBMI();
    const mapResult = calcMAP();
    const insulinResult = calcInsulinCorrection();
    const hollidayResult = calcHolliday();

    const totalGCS = gcsScore.eye + gcsScore.verbal + gcsScore.motor;
    const totalBraden = (Object.values(bradenInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalNorton = (Object.values(nortonInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalApgar = (Object.values(apgarInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalNEWS2 = (Object.values(news2Inputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalMorse = (Object.values(morseInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalSilverman = (Object.values(silvermanInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalDownton = (Object.values(downtonInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalCpot = (Object.values(cpotInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalCamicu = (Object.values(camicuInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalBradenQ = (Object.values(bradenQInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalBarthel = (Object.values(barthelInputs) as number[]).reduce((a: number, b: number) => a + b, 0);
    const totalWells = wellsInputs.reduce((acc: number, id) => {
        const item = WELLS_DATA.find(w => w.id === id);
        return acc + (item ? item.points : 0);
    }, 0);
    const totalHasbled = hasbledInputs.reduce((acc: number, id) => {
        const item = HASBLED_ITEMS.find(i => i.id === id);
        return acc + (item ? item.p : 0);
    }, 0);

    return (
        <div className="flex-1 flex bg-slate-100 relative overflow-hidden font-sans">
            
            <div className={`w-full md:w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-10 shadow-xl transition-all duration-300 ${selectedTool ? 'hidden md:flex' : 'flex'}`}>
                
                <div className="p-4 bg-slate-900 text-white shrink-0">
                    <h2 className="font-black text-xs uppercase tracking-widest text-emerald-400 mb-4 flex items-center">
                        <LayoutGrid className="w-4 h-4 mr-2"/> Clinical Tools
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500"/>
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar calculadora..." 
                            className="w-full pl-9 p-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-500"
                        />
                    </div>
                </div>

                <div className="flex gap-2 p-2 overflow-x-auto border-b border-slate-200 shrink-0 custom-scrollbar bg-slate-50">
                    <button onClick={() => setFilterCategory('ALL')} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase border transition-all whitespace-nowrap ${filterCategory === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}>TODAS</button>
                    {CATEGORIES.slice(1).map(c => (
                        <button key={c.id} onClick={() => setFilterCategory(c.id)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase border transition-all whitespace-nowrap flex items-center ${filterCategory === c.id ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                            {c.id === 'FAV' && <Star className="w-3 h-3 mr-1"/>}
                            {c.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-3">
                        {filteredTools.map(tool => (
                            <ListItem
                                key={tool.id}
                                icon={tool.icon}
                                title={tool.label}
                                subtitle={tool.category}
                                bg={tool.bg}
                                color={tool.color}
                                isActive={selectedTool === tool.id}
                                onClick={() => setSelectedTool(tool.id)}
                                rightIcon={
                                    <div onClick={(e) => toggleFavorite(tool.id, e)} className="p-1 rounded-full hover:bg-slate-100 text-slate-300 hover:text-yellow-400 transition-colors">
                                        <Star className={`w-4 h-4 ${favorites.includes(tool.id) ? 'fill-yellow-400 text-yellow-400' : ''}`}/>
                                    </div>
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className={`flex-1 bg-white lg:bg-slate-50 flex flex-col relative overflow-hidden ${!selectedTool ? 'hidden md:flex' : 'flex fixed inset-0 md:relative z-20'}`}>
                {selectedTool ? (
                    <div className="flex flex-col h-full animate-slide-in-right bg-slate-50">
                        <div className="bg-white border-b border-slate-200 p-4 shadow-sm shrink-0 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <button onClick={() => setSelectedTool(null)} className="md:hidden p-2 bg-slate-100 rounded-full hover:bg-slate-200 active:scale-95 transition-transform"><ChevronLeft className="w-5 h-5"/></button>
                                {(() => {
                                    const t = TOOLS_LIST.find(x => x.id === selectedTool);
                                    return t ? (
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`p-2 rounded-lg ${t.bg} ${t.color} shrink-0`}><t.icon className="w-5 h-5"/></div>
                                            <h1 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight truncate">{t.label}</h1>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleReset} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" title="Reiniciar"><RefreshCcw className="w-4 h-4"/></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                            <div className="max-w-xl mx-auto space-y-6 pb-20">
                                
                                {/* Patient Context Selector */}
                                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Contexto de Paciente</div>
                                            <select 
                                                value={patient?.id || ''} 
                                                onChange={(e) => {
                                                    const p = allPatients.find(x => x.id === e.target.value);
                                                    setPatient(p || null);
                                                }}
                                                className="bg-transparent font-bold text-indigo-900 outline-none cursor-pointer text-sm w-full sm:w-auto"
                                            >
                                                <option value="">-- Seleccionar Paciente --</option>
                                                {allPatients.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name} ({p.bed})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    {patient && (
                                        <button 
                                            onClick={() => {
                                                // Extract vitals logic based on selected tool
                                                if (!patient.vitals) return;
                                                const v = patient.vitals;
                                                
                                                if (selectedTool === 'news2') {
                                                    const newInputs = { ...news2Inputs };
                                                    if (v.fr) {
                                                        const fr = parseInt(v.fr);
                                                        if (fr <= 8) newInputs.rr = 3;
                                                        else if (fr >= 9 && fr <= 11) newInputs.rr = 1;
                                                        else if (fr >= 12 && fr <= 20) newInputs.rr = 0;
                                                        else if (fr >= 21 && fr <= 24) newInputs.rr = 2;
                                                        else if (fr >= 25) newInputs.rr = 3;
                                                    }
                                                    if (v.sat) {
                                                        const sat = parseInt(v.sat);
                                                        if (sat <= 91) newInputs.sat = 3;
                                                        else if (sat >= 92 && sat <= 93) newInputs.sat = 2;
                                                        else if (sat >= 94 && sat <= 95) newInputs.sat = 1;
                                                        else if (sat >= 96) newInputs.sat = 0;
                                                    }
                                                    if (v.ta) {
                                                        const sys = parseInt(v.ta.split('/')[0]);
                                                        if (sys <= 90) newInputs.sbp = 3;
                                                        else if (sys >= 91 && sys <= 100) newInputs.sbp = 2;
                                                        else if (sys >= 101 && sys <= 110) newInputs.sbp = 1;
                                                        else if (sys >= 111 && sys <= 219) newInputs.sbp = 0;
                                                        else if (sys >= 220) newInputs.sbp = 3;
                                                    }
                                                    if (v.fc) {
                                                        const fc = parseInt(v.fc);
                                                        if (fc <= 40) newInputs.hr = 3;
                                                        else if (fc >= 41 && fc <= 50) newInputs.hr = 1;
                                                        else if (fc >= 51 && fc <= 90) newInputs.hr = 0;
                                                        else if (fc >= 91 && fc <= 110) newInputs.hr = 1;
                                                        else if (fc >= 111 && fc <= 130) newInputs.hr = 2;
                                                        else if (fc >= 131) newInputs.hr = 3;
                                                    }
                                                    if (v.temp) {
                                                        const temp = parseFloat(v.temp);
                                                        if (temp <= 35.0) newInputs.temp = 3;
                                                        else if (temp >= 35.1 && temp <= 36.0) newInputs.temp = 1;
                                                        else if (temp >= 36.1 && temp <= 38.0) newInputs.temp = 0;
                                                        else if (temp >= 38.1 && temp <= 39.0) newInputs.temp = 1;
                                                        else if (temp >= 39.1) newInputs.temp = 2;
                                                    }
                                                    setNews2Inputs(newInputs);
                                                } else if (selectedTool === 'map') {
                                                    if (v.ta) {
                                                        const [sys, dia] = v.ta.split('/');
                                                        setMapInputs({ sys: sys || '', dia: dia || '' });
                                                    }
                                                } else if (selectedTool === 'bmi') {
                                                    setBmiInputs({ weight: patient.weight || '', height: patient.height || '' });
                                                } else if (selectedTool === 'holliday') {
                                                    setHollidayInputs({ weight: patient.weight || '' });
                                                } else if (selectedTool === 'insulin_calc') {
                                                    if (patient.checklist?.glucose) {
                                                        setInsulinInputs(prev => ({ ...prev, current: patient.checklist.glucose }));
                                                    }
                                                }
                                                
                                                // Feedback visual
                                                const btn = document.getElementById('extract-btn');
                                                if (btn) {
                                                    const original = btn.innerHTML;
                                                    btn.innerHTML = '<span class="flex items-center gap-1"><CheckCircle2 class="w-3 h-3"/> Extraído</span>';
                                                    setTimeout(() => btn.innerHTML = original, 1500);
                                                }
                                            }}
                                            id="extract-btn"
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wide hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                                        >
                                            <Activity className="w-3.5 h-3.5" /> Extraer Datos
                                        </button>
                                    )}
                                </div>

                                {selectedTool === 'math_ai' && (
                                    <div className="animate-fade-in space-y-6">
                                        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md"><Sparkles className="w-5 h-5 text-yellow-300"/></div>
                                                <div><h3 className="font-black text-lg uppercase tracking-tight">Cálculo IA PRO</h3><p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Motor de dosificación asistida</p></div>
                                            </div>
                                            <div className="relative">
                                                <textarea 
                                                    value={mathProblem}
                                                    onChange={e => setMathProblem(e.target.value)}
                                                    className="w-full bg-white/10 border-2 border-white/20 rounded-2xl p-5 text-white placeholder-indigo-200 outline-none focus:bg-white/20 focus:border-white/40 transition-all min-h-[160px] resize-none font-bold text-sm"
                                                    placeholder='Ej: "Paciente de 85kg con noradrenalina a 0.2 mcg/kg/min. Dilución 16mg en 250ml. ¿Ritmo en ml/h?"'
                                                />
                                                <button 
                                                    onClick={handleSolveMath} 
                                                    disabled={isMathSolving || !mathProblem.trim()}
                                                    className="absolute bottom-4 right-4 bg-white text-indigo-700 px-6 py-3 rounded-xl font-black uppercase text-xs shadow-2xl hover:scale-105 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-2"
                                                >
                                                    {isMathSolving ? <Loader2 className="w-4 h-4 animate-spin"/> : <><Send className="w-4 h-4"/> CALCULAR</>}
                                                </button>
                                            </div>
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {['Microgramos a ml/h', 'Dosis por peso', 'Diluciones'].map(t => (
                                                    <button key={t} onClick={() => setMathProblem(`Cómo calcular ${t.toLowerCase()} para...`)} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-white/10 transition-colors">{t}</button>
                                                ))}
                                            </div>
                                        </div>
                                        {mathResult && (
                                            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 animate-fade-in-up relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 to-indigo-600"></div>
                                                <div className="prose prose-sm text-slate-700 max-w-none">
                                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-4 flex items-center"><CheckCircle2 className="w-4 h-4 mr-2"/> Resolución Detallada</div>
                                                    <div className="text-sm font-medium leading-relaxed space-y-4" dangerouslySetInnerHTML={{__html: mathResult.replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>').replace(/\n/g, '<br/>')}} />
                                                </div>
                                                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                                                    <div className="flex items-center text-rose-600 gap-2"><ShieldAlert className="w-4 h-4 animate-pulse"/><span className="text-[10px] font-black uppercase">Doble chequeo obligatorio</span></div>
                                                    <button onClick={() => handleCopy(mathResult)} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-all flex items-center gap-2"><Copy className="w-3.5 h-3.5"/> COPIAR RESULTADO</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedTool === 'insulin_calc' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                                            <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center"><Activity className="w-4 h-4 mr-2 text-orange-500"/> Glucemia Capilar</h3>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Glucemia Actual</label>
                                                    <div className="relative">
                                                        <input type="number" value={insulinInputs.current} onChange={e=>setInsulinInputs({...insulinInputs, current: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 shadow-inner font-black text-xl outline-none focus:bg-white focus:border-orange-500 transition-all" placeholder="mg/dL"/>
                                                        <span className="absolute right-4 top-5 text-xs font-black text-slate-400">mg/dL</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Glucemia Objetivo</label>
                                                        <input type="number" value={insulinInputs.target} onChange={e=>setInsulinInputs({...insulinInputs, target: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-orange-500" placeholder="150"/>
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Factor Sensibilidad (ISF)</label>
                                                        <input type="number" value={insulinInputs.isf} onChange={e=>setInsulinInputs({...insulinInputs, isf: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none focus:border-orange-500" placeholder="50"/>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`p-10 rounded-[3rem] text-center border-4 transition-all relative overflow-hidden ${insulinResult ? 'bg-orange-500 text-white border-orange-400 shadow-2xl' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                            {insulinResult && <div className="absolute top-0 right-0 p-8 opacity-10"><Syringe className="w-32 h-32"/></div>}
                                            <div className="relative z-10">
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Insulina de Corrección</div>
                                                <div className="text-7xl font-black tracking-tighter leading-none">{insulinResult || '--'} <span className="text-2xl font-medium opacity-50">UI</span></div>
                                                {insulinResult && parseFloat(insulinResult) > 10 && (
                                                    <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase"><ShieldAlert className="w-3 h-3"/> Dosis Alta: Chequear</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedTool === 'dosage' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                                            <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center"><Divide className="w-4 h-4 mr-2"/> Parámetros de Entrada</h3>
                                            <div className="space-y-5">
                                                <div>
                                                    <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block">Dosis Prescrita (D)</label>
                                                    <div className="relative"><input type="number" value={doseInputs.desired} onChange={e=>setDoseInputs({...doseInputs, desired: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 shadow-inner font-black text-xl outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="0"/><span className="absolute right-4 top-5 text-xs font-black text-slate-400">mg</span></div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div><label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Concentración (H)</label><div className="relative"><input type="number" value={doseInputs.onHand} onChange={e=>setDoseInputs({...doseInputs, onHand: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 shadow-inner font-black text-xl outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="0"/><span className="absolute right-4 top-5 text-[9px] font-black text-slate-400">mg</span></div></div>
                                                    <div><label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">En volumen (V)</label><div className="relative"><input type="number" value={doseInputs.vehicle} onChange={e=>setDoseInputs({...doseInputs, vehicle: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 shadow-inner font-black text-xl outline-none focus:bg-white focus:border-indigo-500 transition-all" placeholder="0"/><span className="absolute right-4 top-5 text-[9px] font-black text-slate-400">ml</span></div></div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <button 
                                            onClick={handleAIAssistantForDosage}
                                            className="w-full bg-violet-50 border-2 border-violet-200 p-4 rounded-2xl flex items-center justify-between group hover:border-violet-400 transition-all"
                                        >
                                            <div className="flex items-center gap-3 text-left">
                                                <div className="bg-violet-600 p-2 rounded-xl text-white shadow-lg"><Sparkles className="w-5 h-5"/></div>
                                                <div><div className="text-xs font-black text-violet-700 uppercase">¿Cálculo Complejo?</div><div className="text-[10px] font-bold text-violet-500">mcg/kg/min, perfusiones, ritmos...</div></div>
                                            </div>
                                            <div className="bg-white text-violet-600 px-3 py-1.5 rounded-lg text-[10px] font-black border border-violet-100 group-hover:bg-violet-600 group-hover:text-white transition-all">RESOLVER CON IA</div>
                                        </button>

                                        <div className={`p-10 rounded-[3rem] text-center border-4 transition-all relative overflow-hidden ${doseResult ? 'bg-indigo-600 text-white border-indigo-500 shadow-2xl' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                                            {doseResult && <div className="absolute top-0 right-0 p-8 opacity-10"><Syringe className="w-32 h-32"/></div>}
                                            <div className="relative z-10">
                                                <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-80">Administrar / Cargar</div>
                                                <div className="text-7xl font-black tracking-tighter leading-none">{doseResult || '--'} <span className="text-2xl font-medium opacity-50">ml</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedTool === 'holliday' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                                            <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-500"/> Holliday-Segar</h3>
                                            <div>
                                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block">Peso del Paciente</label>
                                                <div className="relative">
                                                    <input type="number" value={hollidayInputs.weight} onChange={e=>setHollidayInputs({...hollidayInputs, weight: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 shadow-inner font-black text-xl outline-none focus:bg-white focus:border-blue-500 transition-all" placeholder="kg"/>
                                                    <span className="absolute right-4 top-5 text-xs font-black text-slate-400">kg</span>
                                                </div>
                                            </div>
                                        </div>
                                        {hollidayResult && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-blue-600 text-white p-6 rounded-3xl shadow-xl text-center">
                                                    <div className="text-[10px] font-black uppercase opacity-70 mb-1">Mantenimiento 24h</div>
                                                    <div className="text-3xl font-black">{hollidayResult.daily} <span className="text-sm">ml</span></div>
                                                </div>
                                                <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl text-center">
                                                    <div className="text-[10px] font-black uppercase opacity-70 mb-1">Ritmo de Infusión</div>
                                                    <div className="text-3xl font-black">{hollidayResult.hourly} <span className="text-sm">ml/h</span></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {selectedTool === 'news2' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalNEWS2 >= 7 ? 'bg-red-50 border-red-200 text-red-700' : totalNEWS2 >= 5 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Riesgo Clínico</div><div className="text-2xl font-black">{totalNEWS2 >= 7 ? 'ALTO (UCI)' : totalNEWS2 >= 5 ? 'MEDIO' : 'BAJO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalNEWS2}</div><button id="copy-btn" onClick={() => handleCopy(`NEWS2: ${totalNEWS2}`)} className="text-[10px] uppercase font-bold flex items-center justify-end mt-1 opacity-70 hover:opacity-100 transition-opacity"><Copy className="w-3 h-3 mr-1"/> Copiar</button></div>
                                        </div>
                                        {Object.entries(NEWS2_DATA).map(([key, data]) => (
                                            <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{data.label}</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                    {data.opts.map((opt) => (
                                                        <button key={opt.l} onClick={() => setNews2Inputs({...news2Inputs, [key]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${news2Inputs[key] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'glasgow' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm flex justify-between items-center sticky top-0 z-20 backdrop-blur-md bg-white/90 ${totalGCS <= 8 ? 'bg-rose-50 border-rose-200 text-rose-700' : totalGCS <= 12 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Consciencia</div><div className="text-2xl font-black">{totalGCS <= 8 ? 'COMA (IOT)' : totalGCS <= 12 ? 'MODERADO' : 'LEVE/NORMAL'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalGCS} <span className="text-lg opacity-60">/ 15</span></div><button id="copy-btn" onClick={() => handleCopy(`GCS: ${totalGCS}`)} className="text-[10px] uppercase font-bold flex items-center justify-end mt-1 opacity-70 hover:opacity-100 transition-opacity"><Copy className="w-3 h-3 mr-1"/> Copiar</button></div>
                                        </div>
                                        {Object.entries(GCS_SCALES).map(([key, opts]) => (
                                            <div key={key} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{key === 'eye' ? 'Apertura Ocular' : key === 'verbal' ? 'Respuesta Verbal' : 'Respuesta Motora'}</h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {opts.map((opt) => (
                                                        <button key={opt.val} onClick={() => setGcsScore({...gcsScore, [key]: opt.val})} className={`text-left px-3 py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${(gcsScore as any)[key] === opt.val ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                                            <span>{opt.label}</span>
                                                            <span className="opacity-60 font-normal ml-2 text-[10px] truncate hidden sm:inline">{opt.desc}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'map' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">TAS</label><input type="number" value={mapInputs.sys} onChange={e=>setMapInputs({...mapInputs, sys:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">TAD</label><input type="number" value={mapInputs.dia} onChange={e=>setMapInputs({...mapInputs, dia:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-2xl text-center shadow-lg bg-slate-800 text-white">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Resultado</div>
                                            <div className="text-5xl font-black">{mapResult || '--'} <span className="text-2xl">mmHg</span></div>
                                        </div>
                                    </div>
                                )}

                                {selectedTool === 'bmi' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Peso (kg)</label><input type="number" value={bmiInputs.weight} onChange={e=>setBmiInputs({...bmiInputs, weight:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Altura (cm)</label><input type="number" value={bmiInputs.height} onChange={e=>setBmiInputs({...bmiInputs, height:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-2xl text-center shadow-lg bg-slate-800 text-white">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">IMC</div>
                                            <div className="text-5xl font-black">{bmiResult.bmi || '--'}</div>
                                            <div className="text-sm mt-2">{bmiResult.cat}</div>
                                            <div className="text-[10px] mt-4 opacity-70">Superficie Corporal: {bmiResult.bsa || '--'} m²</div>
                                        </div>
                                    </div>
                                )}

                                {selectedTool === 'wells' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalWells >= 6 ? 'bg-red-50 border-red-200 text-red-700' : totalWells >= 2 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Probabilidad TEP</div><div className="text-2xl font-black">{totalWells >= 6 ? 'ALTA' : totalWells >= 2 ? 'MODERADA' : 'BAJA'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalWells}</div></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            {WELLS_DATA.map(item => (
                                                <label key={item.id} className="flex items-center p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                                                    <input type="checkbox" checked={wellsInputs.includes(item.id)} onChange={(e) => {
                                                        if (e.target.checked) setWellsInputs([...wellsInputs, item.id]);
                                                        else setWellsInputs(wellsInputs.filter(id => id !== item.id));
                                                    }} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/>
                                                    <span className="ml-3 text-sm font-medium text-slate-700 flex-1">{item.label}</span>
                                                    <span className="text-xs font-bold text-slate-400">+{item.points}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {selectedTool === 'hasbled' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalHasbled >= 3 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Riesgo de Sangrado</div><div className="text-2xl font-black">{totalHasbled >= 3 ? 'ALTO' : 'BAJO/MODERADO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalHasbled}</div></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            {HASBLED_ITEMS.map(item => (
                                                <label key={item.id} className="flex items-center p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                                                    <input type="checkbox" checked={hasbledInputs.includes(item.id)} onChange={(e) => {
                                                        if (e.target.checked) setHasbledInputs([...hasbledInputs, item.id]);
                                                        else setHasbledInputs(hasbledInputs.filter(id => id !== item.id));
                                                    }} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/>
                                                    <span className="ml-3 text-sm font-medium text-slate-700 flex-1">{item.label}</span>
                                                    <span className="text-xs font-bold text-slate-400">+{item.p}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {selectedTool === 'rass' && (
                                    <>
                                        <div className="p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-indigo-50 border-indigo-200 text-indigo-700 flex justify-between items-center">
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Puntuación RASS</div><div className="text-2xl font-black">{RASS_DATA.find(r => r.v === rassScore)?.l}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{rassScore > 0 ? `+${rassScore}` : rassScore}</div></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            {RASS_DATA.map(item => (
                                                <button key={item.v} onClick={() => setRassScore(item.v)} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between border ${rassScore === item.v ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                                    <span>{item.v > 0 ? `+${item.v}` : item.v} - {item.l}</span>
                                                    <span className="opacity-60 font-normal ml-2 text-[10px] truncate hidden sm:inline">{item.d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {selectedTool === 'braden' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalBraden <= 12 ? 'bg-red-50 border-red-200 text-red-700' : totalBraden <= 14 ? 'bg-orange-50 border-orange-200 text-orange-700' : totalBraden <= 16 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Riesgo UPP</div><div className="text-2xl font-black">{totalBraden <= 12 ? 'ALTO RIESGO' : totalBraden <= 14 ? 'RIESGO MODERADO' : totalBraden <= 16 ? 'BAJO RIESGO' : 'SIN RIESGO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalBraden}</div></div>
                                        </div>
                                        {BRADEN_SCALE.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setBradenInputs({...bradenInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${bradenInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'norton' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalNorton <= 12 ? 'bg-red-50 border-red-200 text-red-700' : totalNorton <= 14 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Riesgo UPP</div><div className="text-2xl font-black">{totalNorton <= 12 ? 'ALTO RIESGO' : totalNorton <= 14 ? 'RIESGO EVIDENTE' : 'RIESGO MÍNIMO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalNorton}</div></div>
                                        </div>
                                        {NORTON_SCALE.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setNortonInputs({...nortonInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${nortonInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'barthel' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalBarthel < 20 ? 'bg-red-50 border-red-200 text-red-700' : totalBarthel < 60 ? 'bg-orange-50 border-orange-200 text-orange-700' : totalBarthel < 100 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Dependencia</div><div className="text-2xl font-black">{totalBarthel < 20 ? 'TOTAL' : totalBarthel < 40 ? 'GRAVE' : totalBarthel < 60 ? 'MODERADA' : totalBarthel < 100 ? 'LEVE' : 'INDEPENDIENTE'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalBarthel}</div></div>
                                        </div>
                                        {BARTHEL_DATA.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.label}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setBarthelInputs({...barthelInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${barthelInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'parkland' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Peso (kg)</label><input type="number" value={parklandInputs.weight} onChange={e=>setParklandInputs({...parklandInputs, weight:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Superficie Quemada (%)</label><input type="number" value={parklandInputs.bsa} onChange={e=>setParklandInputs({...parklandInputs, bsa:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-2xl text-center shadow-lg bg-slate-800 text-white">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Líquidos 24h (Ringer Lactato)</div>
                                            <div className="text-5xl font-black">{parklandInputs.weight && parklandInputs.bsa ? (parseFloat(parklandInputs.weight) * parseFloat(parklandInputs.bsa) * 4).toFixed(0) : '--'} <span className="text-2xl">ml</span></div>
                                            <div className="text-sm mt-4 opacity-80">Mitad en primeras 8h: {parklandInputs.weight && parklandInputs.bsa ? (parseFloat(parklandInputs.weight) * parseFloat(parklandInputs.bsa) * 2).toFixed(0) : '--'} ml</div>
                                            <div className="text-sm mt-1 opacity-80">Resto en 16h: {parklandInputs.weight && parklandInputs.bsa ? (parseFloat(parklandInputs.weight) * parseFloat(parklandInputs.bsa) * 2).toFixed(0) : '--'} ml</div>
                                        </div>
                                    </div>
                                )}

                                {selectedTool === 'gfr' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Creatinina (mg/dL)</label><input type="number" value={gfrInputs.creat} onChange={e=>setGfrInputs({...gfrInputs, creat:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Edad</label><input type="number" value={gfrInputs.age} onChange={e=>setGfrInputs({...gfrInputs, age:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sexo</label>
                                                    <select value={gfrInputs.sex} onChange={e=>setGfrInputs({...gfrInputs, sex:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none">
                                                        <option value="male">Hombre</option>
                                                        <option value="female">Mujer</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Raza</label>
                                                    <select value={gfrInputs.race} onChange={e=>setGfrInputs({...gfrInputs, race:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none">
                                                        <option value="non-black">No Negra</option>
                                                        <option value="black">Negra</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-2xl text-center shadow-lg bg-slate-800 text-white">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">TFG (CKD-EPI)</div>
                                            <div className="text-5xl font-black">
                                                {(() => {
                                                    const scr = parseFloat(gfrInputs.creat);
                                                    const age = parseFloat(gfrInputs.age);
                                                    if (isNaN(scr) || isNaN(age) || scr <= 0 || age <= 0) return '--';
                                                    const kappa = gfrInputs.sex === 'female' ? 0.7 : 0.9;
                                                    const alpha = gfrInputs.sex === 'female' ? -0.329 : -0.411;
                                                    const min = Math.min(scr / kappa, 1);
                                                    const max = Math.max(scr / kappa, 1);
                                                    let egfr = 141 * Math.pow(min, alpha) * Math.pow(max, -1.209) * Math.pow(0.993, age);
                                                    if (gfrInputs.sex === 'female') egfr *= 1.018;
                                                    if (gfrInputs.race === 'black') egfr *= 1.159;
                                                    return egfr.toFixed(1);
                                                })()}
                                                <span className="text-xl"> ml/min/1.73m²</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedTool === 'insensible' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Peso (kg)</label><input type="number" value={insensibleInputs.weight} onChange={e=>setInsensibleInputs({...insensibleInputs, weight:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Horas</label><input type="number" value={insensibleInputs.hours} onChange={e=>setInsensibleInputs({...insensibleInputs, hours:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                                <div><label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Horas con Fiebre (&gt;38°C)</label><input type="number" value={insensibleInputs.fever} onChange={e=>setInsensibleInputs({...insensibleInputs, fever:e.target.value})} className="w-full bg-slate-50 p-3 shadow-inner rounded-xl font-bold outline-none"/></div>
                                            </div>
                                        </div>
                                        <div className="p-8 rounded-2xl text-center shadow-lg bg-slate-800 text-white">
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">Pérdidas Insensibles</div>
                                            <div className="text-5xl font-black">
                                                {(() => {
                                                    const w = parseFloat(insensibleInputs.weight);
                                                    const h = parseFloat(insensibleInputs.hours);
                                                    const f = parseFloat(insensibleInputs.fever) || 0;
                                                    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return '--';
                                                    const base = 0.5 * w * h;
                                                    const feverExtra = 0.2 * w * f; // Extra 0.2 ml/kg/h por cada hora de fiebre
                                                    return (base + feverExtra).toFixed(0);
                                                })()}
                                                <span className="text-2xl"> ml</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedTool === 'morse' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalMorse >= 45 ? 'bg-red-50 border-red-200 text-red-700' : totalMorse >= 25 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Riesgo de Caídas</div><div className="text-2xl font-black">{totalMorse >= 45 ? 'ALTO RIESGO' : totalMorse >= 25 ? 'RIESGO MEDIO' : 'RIESGO BAJO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalMorse}</div></div>
                                        </div>
                                        {MORSE_SCALE.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setMorseInputs({...morseInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${morseInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'eva' && (
                                    <div className="space-y-6">
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${evaScore >= 7 ? 'bg-red-50 border-red-200 text-red-700' : evaScore >= 4 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Intensidad del Dolor</div><div className="text-2xl font-black">{evaScore >= 7 ? 'SEVERO' : evaScore >= 4 ? 'MODERADO' : 'LEVE'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{evaScore} <span className="text-lg opacity-60">/ 10</span></div></div>
                                        </div>
                                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
                                            <div className="w-full max-w-md">
                                                <input 
                                                    type="range" min="0" max="10" step="1" 
                                                    value={evaScore} onChange={(e) => setEvaScore(parseInt(e.target.value))}
                                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                                />
                                                <div className="flex justify-between mt-4 text-xs font-bold text-slate-400">
                                                    <span>0 (Sin dolor)</span>
                                                    <span>5</span>
                                                    <span>10 (Máximo)</span>
                                                </div>
                                            </div>
                                            <div className="mt-8">
                                                {evaScore === 0 ? <div className="text-emerald-500"><CheckCircle2 className="w-24 h-24"/></div> : 
                                                 evaScore <= 3 ? <div className="text-emerald-500"><Activity className="w-24 h-24"/></div> :
                                                 evaScore <= 6 ? <div className="text-amber-500"><Frown className="w-24 h-24"/></div> :
                                                 <div className="text-red-500"><Skull className="w-24 h-24"/></div>}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedTool === 'vip' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md flex justify-between items-center ${vipScore >= 2 ? 'bg-red-50 border-red-200 text-red-700' : vipScore === 1 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Puntuación VIP</div><div className="text-2xl font-black">{vipScore >= 2 ? 'RETIRAR VÍA' : vipScore === 1 ? 'OBSERVAR' : 'SANO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{vipScore}</div></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            {VIP_SCALE.map(item => (
                                                <button key={item.v} onClick={() => setVipScore(item.v)} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between border ${vipScore === item.v ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                                    <span>{item.v} - {item.l}</span>
                                                    <span className="opacity-60 font-normal ml-2 text-[10px] truncate hidden sm:inline">{item.d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {selectedTool === 'apgar' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalApgar <= 3 ? 'bg-red-50 border-red-200 text-red-700' : totalApgar <= 6 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Estado Neonatal</div><div className="text-2xl font-black">{totalApgar <= 3 ? 'DEPRESIÓN SEVERA' : totalApgar <= 6 ? 'DEPRESIÓN MODERADA' : 'VIGOROSO (NORMAL)'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalApgar} <span className="text-lg opacity-60">/ 10</span></div></div>
                                        </div>
                                        {APGAR_SCALE.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setApgarInputs({...apgarInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${apgarInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'downton' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalDownton >= 3 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Riesgo de Caídas</div><div className="text-2xl font-black">{totalDownton >= 3 ? 'RIESGO ALTO' : 'RIESGO BAJO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalDownton}</div></div>
                                        </div>
                                        {DOWNTON_SCALE.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setDowntonInputs({...downtonInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${downtonInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'ramsay' && (
                                    <>
                                        <div className="p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-indigo-50 border-indigo-200 text-indigo-700 flex justify-between items-center">
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Nivel de Sedación</div><div className="text-2xl font-black">{RAMSAY_DATA.find(r => r.v === ramsayScore)?.l}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{ramsayScore}</div></div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
                                            {RAMSAY_DATA.map(item => (
                                                <button key={item.v} onClick={() => setRamsayScore(item.v)} className={`w-full text-left p-3 rounded-lg text-sm font-bold transition-all flex items-center justify-between border ${ramsayScore === item.v ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                                                    <span>{item.v} - {item.l}</span>
                                                    <span className="opacity-60 font-normal ml-2 text-[10px] truncate hidden sm:inline">{item.d}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {selectedTool === 'cpot' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalCpot >= 3 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Dolor en Críticos</div><div className="text-2xl font-black">{totalCpot >= 3 ? 'DOLOR SIGNIFICATIVO' : 'DOLOR MÍNIMO/AUSENTE'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalCpot} <span className="text-lg opacity-60">/ 8</span></div></div>
                                        </div>
                                        {CPOT_DATA.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setCpotInputs({...cpotInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${cpotInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'camicu' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalCamicu >= 3 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Delirium (CAM-ICU)</div><div className="text-2xl font-black">{totalCamicu >= 3 ? 'DELIRIUM POSITIVO' : 'DELIRIUM NEGATIVO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalCamicu}</div></div>
                                        </div>
                                        {CAMICU_DATA.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setCamicuInputs({...camicuInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${camicuInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'braden_q' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalBradenQ <= 16 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Riesgo UPP Pediátrico</div><div className="text-2xl font-black">{totalBradenQ <= 16 ? 'RIESGO ALTO' : 'RIESGO BAJO'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalBradenQ} <span className="text-lg opacity-60">/ 28</span></div></div>
                                        </div>
                                        {BRADEN_Q_SCALE.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setBradenQInputs({...bradenQInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${bradenQInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedTool === 'silverman' && (
                                    <>
                                        <div className={`p-6 rounded-2xl border shadow-sm sticky top-0 z-20 backdrop-blur-md bg-white/95 flex justify-between items-center ${totalSilverman >= 7 ? 'bg-red-50 border-red-200 text-red-700' : totalSilverman >= 4 ? 'bg-amber-50 border-amber-200 text-amber-700' : totalSilverman >= 1 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                                            <div><div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Dificultad Respiratoria</div><div className="text-2xl font-black">{totalSilverman >= 7 ? 'SEVERA' : totalSilverman >= 4 ? 'MODERADA' : totalSilverman >= 1 ? 'LEVE' : 'SIN DIFICULTAD'}</div></div>
                                            <div className="text-right"><div className="text-4xl font-black">{totalSilverman} <span className="text-lg opacity-60">/ 10</span></div></div>
                                        </div>
                                        {SILVERMAN_SCALE.map((item) => (
                                            <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-700 uppercase mb-3">{item.title}</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                    {item.opts.map((opt) => (
                                                        <button key={opt.v} onClick={() => setSilvermanInputs({...silvermanInputs, [item.id]: opt.v})} className={`text-center px-2 py-3 rounded-lg text-xs font-bold transition-all border ${silvermanInputs[item.id] === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'}`}>
                                                            {opt.l} <br/><span className="text-[9px] opacity-70">({opt.v} pts)</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 select-none bg-white">
                        <div className="relative mb-6">
                            <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center shadow-inner border border-slate-100">
                                <Calculator className="w-16 h-16 text-slate-200"/>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl animate-bounce">
                                <Wand2 className="w-6 h-6"/>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-slate-400">Panel de Utilidades</h3>
                        <p className="text-sm font-medium text-slate-400 mt-2 text-center max-w-xs">Selecciona una herramienta o usa la IA para cálculos avanzados.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
