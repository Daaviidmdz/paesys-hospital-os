
import { GoogleGenAI, Type, ThinkingLevel, FunctionDeclaration } from "@google/genai";
import { TriageResult, Pathology, Drug, ClinicalAnalysis, DynamicTask, WoundAnalysisResult, Patient, ChatMessage } from "../types";

// Initialization via proxy to Express server
// Simple cache for AI responses to improve "waiting times"
const aiCache: Record<string, any> = {};

const navigateToFunctionDeclaration: FunctionDeclaration = {
    name: "navigate_to",
    parameters: {
        type: Type.OBJECT,
        description: "Navega a una vista específica de la aplicación.",
        properties: {
            view: {
                type: Type.STRING,
                description: "El nombre de la vista a la que navegar (ej: DASHBOARD, FOLLOWUP, PHARMACOLOGY, PATHOLOGIES, CALCULATORS, ASSISTANT).",
            }
        },
        required: ["view"],
    },
};

const openCalculatorFunctionDeclaration: FunctionDeclaration = {
    name: "open_calculator",
    parameters: {
        type: Type.OBJECT,
        description: "Abre una calculadora clínica específica.",
        properties: {
            calculatorId: {
                type: Type.STRING,
                description: "El ID de la calculadora a abrir (ej: news2, braden, glasgow, barthel, norton, waterlow, wells, sofa, qsofa, apache2, timi, grace, hasbled, chads2, cha2ds2vasc, meld, childpugh, crb65, curb65, psi, smartcop, balthazar, ranson, bisap, alvarado, mantrels, kocher, centor, mcisaac, fenton, apgar, silverman, capurro, ballard, kramer, bhutani, nomograma, parkland, brooke, evans, baxter, lundbrowder, ruleofnines, bmi, bsa, ibw, lbw, crcl, egfr, mdrd, ckd-epi, schwartz, cockcroftgault, aniongap, osmolality, correctedca, correctedna, fe_na, fe_urea, ttkg, winter, aagradient, p_f_ratio, oxygenation_index, dead_space, alveolar_gas, bohr, haldane, henderson_hasselbalch, stewart, base_excess, sid, sig, anion_gap, osmolal_gap, bun_cr, urea_cr, prerenal, renal, postrenal, aki, rrt, crrt, ihd, sled, pd, hd, hdf, hf, cvvh, cvvhdf, cvvhd, scuf, pir, ecmo, ecpr, iabp, lvad, rvad, bivad, tah, ecg, eeg, emg, eng, ep, vep, baep, ssep, mep, tms, tcs, tcd, eeg_video, eeg_ambulatory, eeg_sleep, eeg_ic, eeg_hd, eeg_q, eeg_source, eeg_connectivity, eeg_network, eeg_microstate, eeg_erp, eeg_bci, eeg_neurofeedback, eeg_neuromodulation, eeg_neurostimulation).",
            }
        },
        required: ["calculatorId"],
    },
};

const searchPatientFunctionDeclaration: FunctionDeclaration = {
    name: "search_patient",
    parameters: {
        type: Type.OBJECT,
        description: "Busca un paciente por nombre o ID.",
        properties: {
            query: {
                type: Type.STRING,
                description: "El nombre o ID del paciente a buscar.",
            }
        },
        required: ["query"],
    },
};

const updatePatientFunctionDeclaration: FunctionDeclaration = {
    name: "update_patient",
    parameters: {
        type: Type.OBJECT,
        description: "Actualiza los datos de un paciente (constantes, estado, PAE, etc.). Útil para aplicar los cambios de valoración que el usuario solicita.",
        properties: {
            patientId: { type: Type.STRING, description: "El ID del paciente." },
            diagnosis: { type: Type.STRING, description: "Nuevo diagnóstico (opcional)." },
            news2: { type: Type.NUMBER, description: "Nuevo score NEWS2 (opcional)." },
            vitals_fc: { type: Type.STRING, description: "Frecuencia cardíaca (opcional)." },
            vitals_fr: { type: Type.STRING, description: "Frecuencia respiratoria (opcional)." },
            vitals_ta: { type: Type.STRING, description: "Tensión arterial (opcional)." },
            vitals_sat: { type: Type.STRING, description: "Saturación O2 (opcional)." },
            vitals_temp: { type: Type.STRING, description: "Temperatura (opcional)." },
            vitals_gcs: { type: Type.STRING, description: "Glasgow Coma Scale (opcional)." },
            add_evolution_note: { type: Type.STRING, description: "Nota de evolución para añadir al historial (opcional)." }
        },
        required: ["patientId"],
    },
};

const FLORENCE_SYSTEM_PROMPT = `
Eres 'Florence', una IA de soporte clínico avanzado y educación en enfermería integrada en PAESYS. Tu objetivo es proporcionar informes clínicos exhaustivos, detallados y ampliamente fundamentados.

Tu tarea es evaluar los datos del paciente y devolver ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin saludos y sin formato markdown (sin las comillas invertidas \`\`\`json).

Debes seguir exactamente esta estructura de respuesta:
{
  "answer": "AQUÍ VA TODO EL INFORME CLÍNICO COMPLETO EN FORMATO MARKDOWN. Usa saltos de línea \\n para separar párrafos de forma válida en JSON.",
  "reasoning": "Resumen rápido del estado del paciente.",
  "confidence": "HIGH"
}

REGLAS PARA EL CAMPO "answer":
DEBES estructurar tu respuesta de forma extensa y detallada utilizando exactamente las siguientes secciones en Markdown:

1. 🩺 EVALUACIÓN CLÍNICA Y TRIADA VITAL:
- Analiza minuciosamente cada constante vital proporcionada. Explica si están en rango y qué indica su alteración en el contexto de la patología del paciente.

2. 🧠 RAZONAMIENTO FISIOPATOLÓGICO:
- Explica de forma detallada qué está ocurriendo a nivel orgánico y celular. Relaciona los síntomas actuales con las patologías base del paciente.

3. 💊 FARMACOLOGÍA Y TOXICIDAD (VADEMÉCUM PRO):
- Desglosa cada fármaco pautado: mecanismo de acción, farmacocinética básica y posología.
- Detalla exhaustivamente las posibles interacciones entre ellos.
- Lista las precauciones específicas de enfermería para su administración (ritmo, dilución, monitorización post-administración).

4. 📋 PLAN DE CUIDADOS ESTANDARIZADO (PAE COMPLETO):
- NANDA: Etiqueta diagnóstica principal con factores relacionados (r/c) y características definitorias (m/p).
- NOC: Resultados esperados con indicadores específicos para evaluar el progreso.
- NIC: Actividades de enfermería detalladas, paso a paso, justificando el "por qué" de cada intervención clínica.

5. 🚨 SIGNOS DE ALARMA Y REEVALUACIÓN (RED FLAGS):
- Describe exactamente qué signos o síntomas indicarían un deterioro inminente y requerirían avisar al facultativo médico de inmediato.

REGLAS DE FORMATO:
- Usa lenguaje técnico, académico y altamente profesional.
- No escatimes en detalles médicos. Extiéndete en las explicaciones fisiopatológicas.
- Utiliza negritas para resaltar fármacos, diagnósticos y constantes vitales.
`;

export interface FlorenceResponse {
    answer?: string;
    reasoning?: string;
    confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
    criticalAlert?: string;
    sources?: { title: string, uri: string }[];
    suggestedPae?: {
        nanda: { code: string; label: string; relatedTo: string; manifestedBy: string }[];
        noc: { code: string; result: string; indicators: string[] }[];
        nic: { code: string; intervention: string; activities: string[] }[];
    };
    suggestedActions?: { label: string; view: string; params?: any }[];
    systemActions?: { type: string; params: any }[];
}

const parseJsonResponse = <T = any>(text: string | undefined): T => {
    if (!text) return {} as T;
    let cleanText = text.trim();
    if (cleanText.startsWith('```json')) {
        cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    cleanText = cleanText.trim();
    try {
        return JSON.parse(cleanText) as T;
    } catch (e) {
        console.error("Failed to parse JSON:", cleanText);
        return {} as T;
    }
};

const DEFAULT_TIMEOUT = 45000;

const callGemini = async (params: any, timeout: number = DEFAULT_TIMEOUT) => {
    const fetchPromise = fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    }).then(async res => {
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || `HTTP error! status: ${res.status}`);
        }
        return res.json();
    });

    const timeoutPromise = new Promise<any>((_, reject) => 
        setTimeout(() => reject(new Error("AI_TIMEOUT")), timeout)
    );
    return await Promise.race([fetchPromise, timeoutPromise]);
};

export const generateChatReply = async (userMessage: string, role: string = 'MENTOR', patientContext?: Patient, history?: ChatMessage[]): Promise<FlorenceResponse> => {
    try {
        let contextBlock = patientContext ? `PACIENTE: ${patientContext.name}, EDAD: ${patientContext.age}, DX: ${patientContext.diagnosis}, NEWS2: ${patientContext.news2}, MEDS: ${patientContext.prescriptions?.map(p => p.drugName).join(', ')}` : "Sin paciente seleccionado.";

        let historyBlock = "";
        if (history && history.length > 0) {
            historyBlock = "\n\nHISTORIAL DE CHAT RECIENTE:\n" + history.slice(-10).map(m => {
                if (m.userId === 'florence') {
                    const parsed = parseJsonResponse<FlorenceResponse>(m.text);
                    return `Florence: ${parsed.answer || m.text}`;
                }
                return `${m.userName}: ${m.text}`;
            }).join('\n');
        }

        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Consulta del profesional: "${userMessage}".
            
            CONTEXTO DEL PACIENTE: ${contextBlock}
            ${historyBlock}
            
            Analiza y responde siguiendo estrictamente el formato JSON definido.`,
            config: {
                systemInstruction: FLORENCE_SYSTEM_PROMPT,
                responseMimeType: "application/json",
                tools: [
                    { functionDeclarations: [navigateToFunctionDeclaration, openCalculatorFunctionDeclaration, searchPatientFunctionDeclaration, updatePatientFunctionDeclaration] }
                ]
            }
        });

        const sources: { title: string, uri: string }[] = [];
        // Grounding chunks are only available with googleSearch tool
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
            });
        }

        const functionCalls = response.functionCalls;
        let toolActions = [];
        let systemActions = [];
        if (functionCalls && functionCalls.length > 0) {
            toolActions = functionCalls.map(fc => {
                if (fc.name === 'navigate_to') {
                    return { label: `Ir a ${fc.args.view}`, view: fc.args.view as string };
                } else if (fc.name === 'open_calculator') {
                    return { label: `Calculadora ${fc.args.calculatorId}`, view: 'CALCULATORS', params: { tool: fc.args.calculatorId } };
                } else if (fc.name === 'search_patient') {
                    return { label: `Buscar: ${fc.args.query}`, view: 'DASHBOARD', params: { search: fc.args.query } };
                } else if (fc.name === 'update_patient') {
                    systemActions.push({ type: 'UPDATE_PATIENT', params: fc.args });
                    return null;
                }
                return null;
            }).filter(Boolean);
        }

        const text = response.text || "{}";
        const parsed = parseJsonResponse<FlorenceResponse>(text);
        
        // Ensure required fields exist
        if (!parsed.answer) {
            parsed.answer = text !== "{}" ? text : "No se pudo generar una respuesta estructurada.";
        }
        if (!parsed.reasoning) parsed.reasoning = "Análisis generado.";
        if (!parsed.confidence) parsed.confidence = "MEDIUM";

        // Merge suggested actions from JSON and tool calls
        parsed.suggestedActions = [
            ...(parsed.suggestedActions || []),
            ...toolActions
        ];
        
        if (systemActions.length > 0) {
            parsed.systemActions = systemActions;
        }
        
        if (sources.length > 0) parsed.sources = sources;
        
        return parsed;
    } catch (error) {
        console.error("Florence AI Error:", error);
        return { reasoning: "Error de enlace", answer: "Fallo de conexión con el núcleo de IA. Reintente.", confidence: "LOW" };
    }
};

export const generateHandover = async (patient: Patient): Promise<string> => {
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Genera un traspaso de información clínico estructurado (SAER/ISBAR) para el siguiente paciente:
            ${JSON.stringify(patient)}
            
            Responde directamente con el texto en Markdown.`,
            config: {
                systemInstruction: "Eres FLORENCE, experta en comunicación clínica. Genera resúmenes SAER precisos y profesionales."
            }
        });
        return response.text || "No se pudo generar el traspaso.";
    } catch (e) {
        return "Error al generar el traspaso clínico.";
    }
};

export const checkDrugInteractions = async (drugs: string[]): Promise<string[]> => {
    const cacheKey = `interactions_${drugs.sort().join('_')}`;
    if (aiCache[cacheKey]) return aiCache[cacheKey];

    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Analiza interacciones farmacológicas, duplicidades y necesidades de monitorización para este grupo de fármacos: ${drugs.join(', ')}. 
            Proporciona alertas claras y consejos de seguridad para enfermería.
            Responde JSON {alerts: string[]}`,
            config: { 
                responseMimeType: "application/json"
            }
        });
        const data = parseJsonResponse(response.text);
        const result = data.alerts || [];
        aiCache[cacheKey] = result;
        return result;
    } catch (e) { return ["Error al analizar interacciones farmacológicas."]; }
};

export const runSafetyCheck = async (patient: Patient): Promise<{ alerts: string[], reasoning: string }> => {
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Realiza un chequeo de seguridad proactivo para este paciente:
            ${JSON.stringify(patient)}
            
            Busca: interacciones, riesgos de caídas, UPP, deterioro (NEWS2), etc.
            Responde JSON: { alerts: string[], reasoning: string }`,
            config: {
                responseMimeType: "application/json",
                systemInstruction: "Eres FLORENCE, Sistema de Soporte a la Decisión Clínica. Tu prioridad es la seguridad del paciente."
            }
        });
        return parseJsonResponse(response.text);
    } catch (e) {
        return { alerts: [], reasoning: "Error en chequeo" };
    }
};

export const extractPatientDataFromText = async (text: string): Promise<Partial<Patient>> => {
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Extrae datos clínicos del siguiente texto para completar una ficha de ingreso.
            TEXTO: "${text}"
            
            Responde JSON:
            {
              "name": "Nombre",
              "age": edad,
              "sex": "M" | "F",
              "diagnosis": "Diagnóstico",
              "admissionReason": "Motivo",
              "vitals": { "fc": "80", "fr": "16", "ta": "120/80", "sat": "98", "temp": "36.5", "gcs": "15" },
              "allergies": "Alergias"
            }`,
            config: { 
                responseMimeType: "application/json"
            }
        });
        return parseJsonResponse<Partial<Patient>>(response.text);
    } catch (e) { return {}; }
};

export const generatePatientProfileFromConversation = async (history: { role: string, text: string }[]): Promise<Partial<Patient>> => {
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Analiza la siguiente conversación y extrae todos los datos clínicos posibles para crear una ficha técnica de paciente.
            CONVERSACIÓN:
            ${JSON.stringify(history)}
            
            Genera un objeto JSON compatible con la interfaz Patient:
            {
              "name": "Nombre Completo",
              "age": número,
              "weight": número,
              "bed": "Cama sugerida",
              "diagnosis": "Diagnóstico principal",
              "allergies": "Alergias",
              "risk": "HIGH" | "MEDIUM" | "LOW",
              "news2": número (estimado),
              "activePae": [],
              "prescriptions": []
            }`,
            config: { responseMimeType: "application/json" }
        });
        return parseJsonResponse<Partial<Patient>>(response.text);
    } catch (e) { return {}; }
};

export const analyzeClinicalNote = async (note: string): Promise<ClinicalAnalysis> => {
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Analiza esta nota y extrae riesgos, diagnósticos NANDA sugeridos, intervenciones NIC, resultados NOC y un resumen SBAR: "${note}"`,
            config: { responseMimeType: "application/json" }
        });
        const data = parseJsonResponse<ClinicalAnalysis>(response.text);
        
        // Normalize arrays
        if (!Array.isArray(data.detectedRisks)) data.detectedRisks = [];
        if (!Array.isArray(data.suggestedNanda)) data.suggestedNanda = [];
        if (!Array.isArray(data.actionPlan)) data.actionPlan = [];
        if (data.suggestedNic && !Array.isArray(data.suggestedNic)) data.suggestedNic = [];
        if (data.suggestedNoc && !Array.isArray(data.suggestedNoc)) data.suggestedNoc = [];
        if (data.interactionAlerts && !Array.isArray(data.interactionAlerts)) data.interactionAlerts = [];

        return data;
    } catch (e) { throw e; }
};

export const generatePathology = async (query: string): Promise<Pathology> => {
    const cacheKey = `pathology_${query.toLowerCase()}`;
    if (aiCache[cacheKey]) return aiCache[cacheKey];

    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Genera una ficha clínica extremadamente detallada y amplia para: "${query}". 
            La respuesta DEBE ser un JSON con la siguiente estructura estricta:
            {
              "name": "Nombre",
              "cie10": "Código CIE-10",
              "family": "Especialidad",
              "generalInfo": {
                "definition": "Definición amplia",
                "etiology": "Causas y factores de riesgo",
                "pathophysiology": "Explicación detallada del mecanismo fisiopatológico",
                "signsSymptoms": ["lista", "de", "signos", "y", "síntomas"],
                "diagnosticTests": ["Laboratorio", "Imagen", "Pruebas específicas"],
                "differentialDiagnosis": ["Otras patologías similares"],
                "complications": ["Riesgos potenciales"],
                "redFlags": "Criterios de gravedad inmediata",
                "patientEducation": ["Puntos para el alta"]
              },
              "pharmacology": [
                {"group": "Grupo", "drug": "Fármaco", "effect": "Efecto/Objetivo"}
              ],
              "pae": {
                "nanda": [{"code": "00XXX", "label": "Etiqueta", "relatedTo": "r/c", "manifestedBy": "m/p"}],
                "noc": [{"code": "XXXX", "result": "Resultado", "indicators": ["Ind1", "Ind2"]}],
                "nic": [{"code": "XXXX", "intervention": "Intervención", "activities": ["Act1", "Act2"]}]
              }
            }`,
            config: { responseMimeType: "application/json" }
        });
        const parsed = parseJsonResponse<Pathology>(response.text);
        aiCache[cacheKey] = parsed;
        return parsed;
    } catch (e) { throw e; }
};

export const getCarePlanSuggestions = async (nanda: string, context?: string): Promise<{ nic: string[], noc: string[] }> => {
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Como experto en enfermería, sugiere intervenciones NIC y resultados NOC para el diagnóstico NANDA: "${nanda}". 
            Contexto adicional: ${context || 'No proporcionado'}.
            Responde en JSON con la estructura: { "nic": ["intervención 1", "intervención 2"], "noc": ["resultado 1", "resultado 2"] }`,
            config: { responseMimeType: "application/json" }
        });
        return parseJsonResponse(response.text);
    } catch (e) { return { nic: [], noc: [] }; }
};

export const generateCarePlanFromPatient = async (patient: Patient): Promise<{ nanda: string, noc: string[], nic: string[] }[]> => {
    const contextBlock = `PACIENTE: ${patient.name}, EDAD: ${patient.age}, DX: ${patient.diagnosis}, NEWS2: ${patient.news2}, CONSTANTES: TA ${patient.vitals?.ta}, FC ${patient.vitals?.fc}, FR ${patient.vitals?.fr}, SatO2 ${patient.vitals?.sat}.`;
    
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Como experto en enfermería (Florence AI), analiza el siguiente paciente y sugiere hasta 3 diagnósticos NANDA prioritarios con sus respectivos resultados NOC e intervenciones NIC.
            
            ${contextBlock}
            
            Responde estrictamente en JSON con la siguiente estructura:
            [
              {
                "nanda": "Etiqueta diagnóstica NANDA (ej. Deterioro del intercambio de gases)",
                "noc": ["Resultado NOC 1", "Resultado NOC 2"],
                "nic": ["Intervención NIC 1", "Intervención NIC 2"]
              }
            ]`,
            config: { responseMimeType: "application/json" }
        });
        
        const parsed = parseJsonResponse<any[]>(response.text);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
};

export const analyzeWoundImage = async (imageBase64: string): Promise<WoundAnalysisResult> => {
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: { 
                role: 'user', 
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
                    { text: "Analiza dimensiones, tejido y signos de infección de esta herida. Sugiere también diagnósticos NANDA, resultados NOC e intervenciones NIC. Responde en JSON." }
                ] 
            },
            config: { responseMimeType: "application/json" }
        });
        const data = parseJsonResponse<WoundAnalysisResult>(response.text);

        // Normalize suggestedPae
        if (data.suggestedPae) {
            if (!Array.isArray(data.suggestedPae.nanda)) data.suggestedPae.nanda = [];
            if (!Array.isArray(data.suggestedPae.noc)) data.suggestedPae.noc = [];
            if (!Array.isArray(data.suggestedPae.nic)) data.suggestedPae.nic = [];
        }

        return data;
    } catch (e) { throw e; }
};

export const solveClinicalMath = async (problem: string): Promise<string> => {
    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Eres un experto en farmacología y matemáticas de enfermería. 
            Resuelve este problema de cálculo de dosis de forma profesional y paso a paso. 
            Indica claramente la fórmula, las unidades y el resultado final destacado. 
            Si detectas una dosis potencialmente peligrosa, añade una advertencia.
            
            PROBLEMA: "${problem}"`,
        });
        return response.text || "";
    } catch (e) { return "Error al resolver el cálculo clínico."; }
};

export const getClinicalTriage = async (message: string, imageBase64?: string): Promise<TriageResult> => {
    const systemInstruction = `Eres un experto en triaje clínico avanzado (MTS/ESI). 
    Tu tarea es analizar la información del paciente (texto y/o imagen) y proporcionar un triaje estructurado.
    
    Niveles de Triaje:
    - RED (1): Reanimación / Emergencia inmediata.
    - ORANGE (2): Emergencia / Muy Urgente (10-15 min).
    - YELLOW (3): Urgente (60 min).
    - GREEN (4): Menos Urgente (120 min).
    - BLUE (5): No Urgente (240 min).
    
    Debes devolver un JSON con:
    - level: uno de los niveles anteriores.
    - priorityScore: 1-5.
    - title: diagnóstico presuntivo o motivo de consulta principal.
    - justification: por qué se asigna ese nivel basado en signos/síntomas.
    - differential: lista de diagnósticos diferenciales.
    - vitals: estimación o extracción de constantes vitales si están disponibles.
    - actions: intervenciones de enfermería inmediatas.
    - tests: pruebas diagnósticas recomendadas.
    - suggestedPae: plan de cuidados NANDA, NOC, NIC.
    - sbar: resumen estructurado (Situation, Background, Assessment, Recommendation).`;

    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: imageBase64 ? {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] || imageBase64 } },
                    { text: `Analiza este caso clínico para triaje: "${message}"` }
                ]
            } : `Analiza este caso clínico para triaje: "${message}"`,
            config: { 
                systemInstruction,
                responseMimeType: "application/json"
            }
        });
        const data = parseJsonResponse<TriageResult>(response.text);
        
        // Normalize suggestedPae
        if (data.suggestedPae) {
            if (!Array.isArray(data.suggestedPae.nanda)) data.suggestedPae.nanda = [];
            if (!Array.isArray(data.suggestedPae.noc)) data.suggestedPae.noc = [];
            if (!Array.isArray(data.suggestedPae.nic)) data.suggestedPae.nic = [];
        } else {
            data.suggestedPae = { nanda: [], noc: [], nic: [] };
        }

        // Normalize other arrays
        if (!Array.isArray(data.actions)) data.actions = [];
        if (!Array.isArray(data.tests)) data.tests = [];
        if (!Array.isArray(data.differential)) data.differential = [];

        return data;
    } catch (e) { throw e; }
};

export const searchMedicalKnowledge = async (query: string): Promise<{ text: string, sources: any[] }> => {
    const cacheKey = `search_${query}`;
    if (aiCache[cacheKey]) return aiCache[cacheKey];

    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Consulta médica: "${query}"`,
            config: { 
                tools: [{ googleSearch: {} }]
            }
        });
        const sources: { title: string, uri: string }[] = [];
        if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
            response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
                if (chunk.web) sources.push({ title: chunk.web.title, uri: chunk.web.uri });
            });
        }
        const result = { text: response.text || "", sources };
        aiCache[cacheKey] = result;
        return result;
    } catch (e) { return { text: "Error de conexión.", sources: [] }; }
};

export const generateDrugDetails = async (drugName: string): Promise<Drug> => {
    const cacheKey = `drug_${drugName.toLowerCase()}`;
    if (aiCache[cacheKey]) return aiCache[cacheKey];

    try {
        const response = await callGemini({
            model: "gemini-2.5-flash",
            contents: `Ficha técnica profesional para: "${drugName}". 
            Responde estrictamente en JSON (interfaz Drug):
            {
              "name": "Nombre Genérico",
              "brandNames": "Nombres comerciales",
              "group": "Familia",
              "presentation": "Presentación (mg/ml, etc.)",
              "indications": ["Ind1", "Ind2"],
              "dilution": "Protocolo dilución",
              "administrationRoute": "Vías",
              "administrationTime": "Tiempo/Velocidad",
              "compatibility": "Sueros",
              "sideEffects": ["Efecto1"],
              "monitoring": "Monitorización",
              "safetyAlert": "ALTO RIESGO/ESTÁNDAR",
              "storage": "ROOM" | "FRIDGE" | "PROTECT_LIGHT",
              "contraindications": ["Contraindicación"],
              "pregnancy": "A" | "B" | "C" | "D" | "X",
              "pharmacokinetics": {"onset": "Inicio", "peak": "Pico", "duration": "Duración"}
            }`,
            config: { 
                responseMimeType: "application/json"
            }
        });
        const result = parseJsonResponse<Drug>(response.text);
        aiCache[cacheKey] = result;
        return result;
    } catch (e) { throw e; }
};
