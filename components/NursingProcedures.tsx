import React, { useState, useEffect } from 'react';
import { BookOpen, Search, CheckSquare, Play, AlertTriangle, Syringe, GraduationCap, ChevronLeft, ChevronRight, Activity, Droplets, BedDouble, Stethoscope, Video, List, ShieldAlert, CheckCircle2, Wind, Scissors, Thermometer, Filter, LifeBuoy, Zap, Heart, Star, Timer, ShoppingCart, ArrowLeft, Clock, Brain, Bone, Baby, ScanLine, Skull, CircleSlash, Cross, Biohazard, X, Save, Trash2, Microscope, Ear, UserCheck, Layers, Grid, ArrowRight, Package, ClipboardCheck, AlertOctagon, RefreshCcw, ChevronDown, ChevronUp, Box, Boxes, HeartPulse, Siren, FlaskConical, Anchor, ShieldCheck } from 'lucide-react';

interface Procedure {
    id: string;
    title: string;
    category: string;
    difficulty: 'Basic' | 'Intermediate' | 'Advanced';
    time: string;
    description: string;
    materials: string[];
    steps: string[];
    redFlags: string[];
    tips?: string[]; 
    keywords?: string[]; 
    illustration?: React.ReactNode;
}

// --- BASE DE DATOS MASIVA (>110 TÉCNICAS) ---
const PROCEDURES_DB: Procedure[] = [
    // --- 1. ACCESOS VASCULARES Y SANGRE (1-15) ---
    { id: 'vvp', title: 'Canalización Vía Periférica', category: 'Accesos', difficulty: 'Basic', time: '10 min', description: 'Inserción de catéter venoso corto para administración de terapia intravenosa.', materials: ['Catéter (22G-18G)', 'Compresor', 'Guantes', 'Clorhexidina 2%', 'Apósito transparente', 'Jeringa SF 10ml'], steps: ['Colocar compresor 10-15cm sobre zona.', 'Seleccionar vena y desinfectar.', 'Puncionar 15-30º.', 'Avanzar cánula al ver reflujo.', 'Retirar aguja y fijar.'], redFlags: ['Evitar zonas de flebitis.', 'No reencapuchar aguja.'], keywords: ['abocath', 'via'] },
    { id: 'hemocultivos', title: 'Extracción de Hemocultivos', category: 'Accesos', difficulty: 'Intermediate', time: '15 min', description: 'Toma de muestra sanguínea estéril para detección de bacteriemia.', materials: ['Frascos Aerobio/Anaerobio', 'Guantes estériles', 'Clorhexidina', 'Jeringas 20ml'], steps: ['Higiene estricta.', 'Desinfectar tapones frascos.', 'Extracción estéril.', 'Inocular frascos sin aire.'], redFlags: ['Riesgo de contaminación (falsos positivos).'], keywords: ['sepsis', 'cultivo'] },
    { id: 'intraosea', title: 'Acceso Intraóseo (EZ-IO)', category: 'Accesos', difficulty: 'Advanced', time: '3 min', description: 'Acceso vascular de emergencia en hueso cuando la vía periférica falla.', materials: ['Taladro EZ-IO', 'Aguja IO', 'Conector distal', 'SF para lavado'], steps: ['Identificar punto (Tibia proximal/Húmero).', 'Limpiar zona.', 'Insertar aguja hasta notar pérdida resistencia.', 'Retirar guía e instilar SF.'], redFlags: ['Contraindicado en fracturas óseas del miembro.'], keywords: ['emergencia', 'hueso'] },
    { id: 'portacath_puncion', title: 'Punción de Reservorio', category: 'Accesos', difficulty: 'Advanced', time: '15 min', description: 'Acceso a dispositivo implantado para quimioterapia.', materials: ['Aguja Huber (Gripper)', 'Campo estéril', 'Guantes estériles', 'SF', 'Heparina'], steps: ['Palpar el reservorio.', 'Limpiar en espiral.', 'Puncionar 90º hasta tope metálico.', 'Comprobar reflujo.'], redFlags: ['Usar solo agujas Huber (no dañan silicona).'], keywords: ['quimio', 'oncologia'] },
    { id: 'picc_mantenimiento', title: 'Cura de PICC', category: 'Accesos', difficulty: 'Intermediate', time: '20 min', description: 'Cuidado estéril de catéter central de inserción periférica.', materials: ['Kit de curas estéril', 'Clorhexidina 2%', 'Apósito con clorhexidina', 'StatLock'], steps: ['Higiene manos.', 'Retirar apósito viejo.', 'Limpiar 30s con fricción.', 'Colocar nuevo apósito y fijación.'], redFlags: ['Vigilar migración del catéter.'], keywords: ['central', 'brazo'] },
    { id: 'linea_arterial_extraccion', title: 'Extracción por Línea Arterial', category: 'Accesos', difficulty: 'Advanced', time: '10 min', description: 'Toma de muestras sin punción repetida en pacientes críticos.', materials: ['Jeringas 5ml y 10ml', 'Gasas', 'SF purgado'], steps: ['Cerrar llave al transductor.', 'Aspirar 5ml de descarte.', 'Extraer muestra real.', 'Lavar sistema con flush.'], redFlags: ['Evitar entrada de aire (riesgo embolia).'], keywords: ['uci', 'gasa'] },
    { id: 'venopuncion_vacutainer', title: 'Analítica Venosa (Vacutainer)', category: 'Accesos', difficulty: 'Basic', time: '5 min', description: 'Obtención de sangre por sistema de vacío.', materials: ['Palomilla o aguja Vacutainer', 'Portatubos', 'Tubos analítica', 'Compresor'], steps: ['Seleccionar vena.', 'Insertar aguja.', 'Llenar tubos por orden (azul, rojo, lila).', 'Invertir tubos suavemente.'], redFlags: ['No dejar compresor >1 min.'], keywords: ['sangre', 'analisis'] },
    { id: 'gasometria_radial', title: 'Gasometría Arterial', category: 'Accesos', difficulty: 'Advanced', time: '10 min', description: 'Punción arteria radial para análisis de gases.', materials: ['Jeringa heparinizada', 'Aguja 25G', 'Clorhexidina', 'Hielo'], steps: ['Test de Allen.', 'Palpar pulso.', 'Puncionar 45º contra flujo.', 'Compresión 5 min.'], redFlags: ['Test de Allen negativo: No puncionar.'], keywords: ['radial', 'allen'] },
    { id: 'central_extraccion', title: 'Extracción por CVC', category: 'Accesos', difficulty: 'Intermediate', time: '10 min', description: 'Toma de muestras por vía central.', materials: ['Jeringas', 'SF', 'Bioconectores nuevos'], steps: ['Higiene manos.', 'Parar perfusiones si es posible.', 'Descarte 10ml.', 'Extraer muestra.', 'Flush pulsátil.'], redFlags: ['Riesgo de infección asociada a catéter.'], keywords: ['cvc', 'sangre'] },
    { id: 'intraosea_manual', title: 'Vía Intraósea Manual', category: 'Accesos', difficulty: 'Advanced', time: '5 min', description: 'Inserción de aguja IO sin taladro.', materials: ['Aguja de Cook', 'SF', 'Anestésico local'], steps: ['Localización.', 'Presión rotatoria manual.', 'Aspirar médula.', 'Fijar.'], redFlags: ['Solo urgencia extrema.'], keywords: ['pediatria', 'io'] },
    { id: 'pic_puncion', title: 'Punción Capilar (Glucemia)', category: 'Accesos', difficulty: 'Basic', time: '2 min', description: 'Medición de glucosa en sangre periférica.', materials: ['Lanceta', 'Glucómetro', 'Tira reactiva'], steps: ['Limpiar dedo.', 'Puncionar lateral de la yema.', 'Cargar tira.', 'Presionar.'], redFlags: ['No usar alcohol (altera resultado).'], keywords: ['azucar', 'diabetes'] },
    { id: 'picc_retirada', title: 'Retirada de PICC', category: 'Accesos', difficulty: 'Intermediate', time: '10 min', description: 'Extracción segura de catéter PICC.', materials: ['Pinzas', 'Gasas', 'Apósito compresivo'], steps: ['Decúbito supino.', 'Tracción suave constante.', 'Presión 5 min.', 'Verificar integridad punta.'], redFlags: ['Riesgo embolia gaseosa.'], keywords: ['retirada'] },
    { id: 'reservorio_sellado', title: 'Sellado de Reservorio', category: 'Accesos', difficulty: 'Intermediate', time: '5 min', description: 'Mantenimiento de Port-a-cath con heparina.', materials: ['Heparina sódica', 'Jeringas', 'SF'], steps: ['Lavar con 20ml SF.', 'Inyectar volumen muerto de heparina.', 'Cerrar en presión positiva.'], redFlags: ['Verificar alergia a heparina.'], keywords: ['heparinizacion'] },
    { id: 'midline_cura', title: 'Cura de Línea Media (Midline)', category: 'Accesos', difficulty: 'Intermediate', time: '15 min', description: 'Cuidado de catéter venoso de larga duración.', materials: ['Set curas', 'Clorhexidina', 'Apósito'], steps: ['Similar a PICC.', 'Mantener asepsia.'], redFlags: ['No confundir con CVC.'], keywords: ['media'] },
    { id: 'fistula_puncion', title: 'Punción de Fístula (AV)', category: 'Accesos', difficulty: 'Advanced', time: '15 min', description: 'Acceso para hemodiálisis.', materials: ['Agujas fístula', 'Campo estéril', 'Guantes'], steps: ['Palpar thrill/soplo.', 'Técnica de ojal o escalera.', 'Puncionar.', 'Fijar.'], redFlags: ['No tomar TA en ese brazo.'], keywords: ['dialisis', 'riñon'] },

    // --- 2. RESPIRATORIO / VÍA AÉREA (16-35) ---
    { id: 'aspiracion_oro', title: 'Aspiración Orotraqueal', category: 'Respiratorio', difficulty: 'Intermediate', time: '5 min', description: 'Limpieza de secreciones en vía aérea artificial.', materials: ['Sondas aspiración', 'Guantes estériles', 'Aspirador'], steps: ['Hiperoxigenar.', 'Introducir sin aspirar.', 'Retirar rotando 10s.', 'Limpiar sistema.'], redFlags: ['Riesgo bradicardia vagal.'], keywords: ['moco', 'tubo'] },
    { id: 'iot_assist', title: 'Asistencia en Intubación', category: 'Respiratorio', difficulty: 'Advanced', time: '10 min', description: 'Apoyo en el aislamiento de vía aérea.', materials: ['Laringoscopio', 'Tubos ET', 'Fiador', 'Jeringa 10ml'], steps: ['Preoxigenar.', 'Preparar medicación.', 'Maniobra Sellick si procede.', 'Inflar neumotaponamiento.'], redFlags: ['Vigilar SatO2 crítica.'], keywords: ['tubo', 'coma'] },
    { id: 'vni_cpap', title: 'Setup de VNI (CPAP/BiPAP)', category: 'Respiratorio', difficulty: 'Intermediate', time: '15 min', description: 'Ventilación no invasiva.', materials: ['Ventilador', 'Máscara', 'Arnés', 'Humidificador'], steps: ['Explicar técnica.', 'Ajustar máscara.', 'Iniciar presiones bajas.', 'Sincronizar.'], redFlags: ['Riesgo UPP nasal.'], keywords: ['mascara', 'epoc'] },
    { id: 'drenaje_toracico_setup', title: 'Manejo Pleur-Evac', category: 'Respiratorio', difficulty: 'Advanced', time: '15 min', description: 'Cuidado de drenaje pleural.', materials: ['Sistema drenaje', 'Agua estéril'], steps: ['Nivelar columna agua.', 'Vigilar burbujeo.', 'Registrar débito.', 'Mantener por debajo del tórax.'], redFlags: ['No pinzar salvo orden médica.'], keywords: ['neumotorax', 'pleura'] },
    { id: 'toracocentesis_assist', title: 'Asistencia Toracocentesis', category: 'Respiratorio', difficulty: 'Advanced', time: '30 min', description: 'Evacuación de líquido pleural.', materials: ['Set punción', 'Anestésico', 'Tubos vacío'], steps: ['Posición sentado.', 'Campo estéril.', 'Asistir punción.', 'Etiquetar muestras.'], redFlags: ['Vigilar tos súbita (neumotórax).'], keywords: ['liquido', 'pulmon'] },
    { id: 'o2_gafas', title: 'Oxigenoterapia (Gafas Nasales)', category: 'Respiratorio', difficulty: 'Basic', time: '2 min', description: 'Aporte O2 bajo flujo.', materials: ['Gafas nasales', 'Caudalímetro'], steps: ['Colocar en narinas.', 'Ajustar tras orejas.', 'Regular flujo (1-4 lpm).'], redFlags: ['Sequedad mucosa.'], keywords: ['aire', 'oxigeno'] },
    { id: 'venturi_mask', title: 'Mascarilla Venturi', category: 'Respiratorio', difficulty: 'Basic', time: '2 min', description: 'Aporte O2 con FiO2 exacta.', materials: ['Mascarilla', 'Adaptadores FiO2'], steps: ['Seleccionar FiO2.', 'Ajustar a cara.', 'Verificar flujo mínimo en caudalímetro.'], redFlags: ['No cubrir orificios aire.'], keywords: ['oxigeno'] },
    { id: 'nebulizacion', title: 'Administración de Nebulización', category: 'Respiratorio', difficulty: 'Basic', time: '10 min', description: 'Aerosolterapia.', materials: ['Nebulizador', 'Suero', 'Medicación'], steps: ['Cargar jeringa.', 'Conectar a O2/Aire.', 'Pedir respiraciones profundas.'], redFlags: ['Taquicardia por broncodilatadores.'], keywords: ['aerosol', 'asma'] },
    { id: 'cámara_espaciadora', title: 'Uso de Cámara Espaciadora', category: 'Respiratorio', difficulty: 'Basic', time: '5 min', description: 'Optimización de inhaladores (MDI).', materials: ['Cámara', 'Inhalador'], steps: ['Agitar inhalador.', 'Acoplar a cámara.', 'Pulsar y respirar 5-10 veces.'], redFlags: ['Enjuagar boca tras corticoides.'], keywords: ['ventolin', 'puf'] },
    { id: 'reclutamiento_alveolar', title: 'Maniobra de Reclutamiento', category: 'Respiratorio', difficulty: 'Advanced', time: '5 min', description: 'Apertura de alveolos colapsados en VMI.', materials: ['Ventilador mecánico'], steps: ['Aumentar PEEP transitoriamente.', 'Monitorizar hemodinámica.', 'Volver a basal.'], redFlags: ['Riesgo hipotensión súbita.'], keywords: ['peep', 'uci'] },
    { id: 'tqt_cuidado', title: 'Cuidado de Traqueostomía', category: 'Respiratorio', difficulty: 'Intermediate', time: '15 min', description: 'Limpieza y cambio de cánula interna.', materials: ['Gasas', 'SF', 'Cintas sujeción', 'Babero'], steps: ['Higiene estoma.', 'Limpiar cánula interna.', 'Cambiar cintas (entre 2 personas).', 'Poner babero limpio.'], redFlags: ['Decanulación accidental.'], keywords: ['tqt', 'cuello'] },
    { id: 'aspiracion_cerrada', title: 'Aspiración Circuito Cerrado', category: 'Respiratorio', difficulty: 'Intermediate', time: '3 min', description: 'Aspiración sin desconectar ventilador.', materials: ['Sistema aspiración cerrado'], steps: ['Introducir sonda.', 'Aspirar retirando.', 'Lavar sonda con SF.'], redFlags: ['No instilar SF sistemáticamente.'], keywords: ['vmi', 'tubo'] },
    { id: 'allen_test', title: 'Realización Test de Allen', category: 'Respiratorio', difficulty: 'Basic', time: '2 min', description: 'Verificación circulación colateral palmar.', materials: ['Manos del operador'], steps: ['Comprimir arteria radial y cubital.', 'Pedir cerrar/abrir puño hasta palidez.', 'Liberar cubital.', 'Verter llenado <10s.'], redFlags: ['Si >15s: Test Negativo.'], keywords: ['radial'] },
    { id: 'incentivador_resp', title: 'Uso de Incentivador (Triflo)', category: 'Respiratorio', difficulty: 'Basic', time: '5 min', description: 'Fisioterapia resp postquirúrgica.', materials: ['Incentivador volumétrico'], steps: ['Espiración profunda.', 'Inspiración lenta y sostenida.', 'Mantener bolas/marcador.', 'Repetir 10 veces/hora.'], redFlags: ['Riesgo mareo por hiperventilación.'], keywords: ['bolas', 'soplar'] },
    { id: 'prono_consciente', title: 'Pronación Consciente', category: 'Respiratorio', difficulty: 'Basic', time: 'Variable', description: 'Mejora SatO2 en pacientes despiertos.', materials: ['Almohadas'], steps: ['Colocar paciente boca abajo.', 'Almohadillar tórax y pelvis.', 'Monitorizar mejoría SatO2.'], redFlags: ['No realizar en distensión abdominal severa.'], keywords: ['covid', 'boca abajo'] },
    { id: 'cricotirotomia_assist', title: 'Asistencia en Cricotirotomía', category: 'Respiratorio', difficulty: 'Advanced', time: '5 min', description: 'Vía aérea quirúrgica de emergencia.', materials: ['Kit cricotirotomía', 'Bisturí', 'Tubo 6.0'], steps: ['Posición hiperextensión.', 'Identificar membrana cricotiroidea.', 'Asistir en incisión.', 'Conectar Ambú.'], redFlags: ['Último recurso (Vía aérea fallida).'], keywords: ['urgencia', 'corte'] },
    { id: 'fisioterapia_resp_manual', title: 'Percusión/Clapping', category: 'Respiratorio', difficulty: 'Basic', time: '10 min', description: 'Movilización de secreciones.', materials: ['Manos cóncavas'], steps: ['Palmoteo rítmico en tórax.', 'Evitar columna y riñones.', 'Pedir tos dirigida.'], redFlags: ['Contraindicado en fracturas costales.'], keywords: ['palpoteo', 'moco'] },
    { id: 'fibrobroncoscopia_assist', title: 'Asistencia Fibrobroncoscopia', category: 'Respiratorio', difficulty: 'Advanced', time: '30 min', description: 'Visualización árbol bronquial.', materials: ['Fibrobroncoscopio', 'Lubricante', 'Sueros lavado'], steps: ['Sedación.', 'Introducción por tubo/nariz.', 'Instilar suero para BAL.', 'Recoger muestras.'], redFlags: ['Vigilar SatO2 y sangrado.'], keywords: ['bal', 'pulmon'] },
    { id: 'oxigeno_alto_flujo', title: 'Gafas de Alto Flujo (OAF)', category: 'Respiratorio', difficulty: 'Intermediate', time: '15 min', description: 'Soporte resp con flujo hasta 60Lpm.', materials: ['Consola OAF', 'Cánula especial', 'Agua estéril'], steps: ['Programar Tª (37º).', 'Ajustar Flujo y FiO2.', 'Colocar cánula.', 'Vigilar condensación.'], redFlags: ['Vigilar fugas y confort.'], keywords: ['optiflow'] },

    // --- 3. MONITORIZACIÓN / CARDIOLOGÍA (36-55) ---
    { id: 'ecg_12', title: 'ECG 12 Derivaciones', category: 'Cardiología', difficulty: 'Basic', time: '5 min', description: 'Registro eléctrico cardiaco.', materials: ['Electrocardiógrafo', 'Electrodos'], steps: ['Limpiar piel.', 'V1-V6 precordiales.', 'Miembros R-A-V-N.', 'Registro sin movimiento.'], redFlags: ['Inversión cables miembros.'], keywords: ['electro', 'ritmo'] },
    { id: 'marcapasos_ext', title: 'Manejo Marcapasos Externo', category: 'Cardiología', difficulty: 'Advanced', time: '5 min', description: 'Estimulación transcutánea.', materials: ['Parches multifunción', 'Monitor desfibrilador'], steps: ['Colocar parches.', 'Modo PACE.', 'Ajustar frecuencia y mA.', 'Confirmar captura eléctrica y mecánica.'], redFlags: ['Requiere sedación (doloroso).'], keywords: ['bradicardia'] },
    { id: 'pvc_medicion', title: 'Medición de PVC', category: 'Cardiología', difficulty: 'Intermediate', time: '5 min', description: 'Presión venosa central.', materials: ['Transductor', 'SF presurizado'], steps: ['Eje fleboestático.', 'Cero al aire.', 'Lectura en monitor al final espiración.'], redFlags: ['Burbujas en el sistema.'], keywords: ['presion', 'central'] },
    { id: 'rcp_basico', title: 'RCP Básico', category: 'Cardiología', difficulty: 'Basic', time: 'Var', description: 'Soporte vital básico.', materials: ['Manos', 'DESA'], steps: ['Comprobar consciencia.', 'Pedir ayuda.', '30 compresiones / 2 ventilaciones.', 'Usar DESA.'], redFlags: ['No interrumpir compresiones.'], keywords: ['parada', 'muerte'] },
    { id: 'swan_ganz_assist', title: 'Asistencia Swan-Ganz', category: 'Cardiología', difficulty: 'Advanced', time: '45 min', description: 'Cateterismo arteria pulmonar.', materials: ['Catéter Swan-Ganz', 'Transductores', 'Monitor GC'], steps: ['Asistir inserción.', 'Vigilar curvas (AD, VD, AP, Capilar).', 'Inflar balón mínimamente.', 'Fijar.'], redFlags: ['Riesgo rotura AP o arritmias.'], keywords: ['uci', 'hemodinamica'] },
    { id: 'cardioversion_assist', title: 'Asistencia Cardioversión', category: 'Cardiología', difficulty: 'Advanced', time: '20 min', description: 'Choque eléctrico sincronizado.', materials: ['Desfibrilador', 'Sedación', 'Ambú'], steps: ['Sincronizar monitor (tecla SYNC).', 'Sedación paciente.', 'Carga julios.', 'Descarga en R.'], redFlags: ['Asegurar sincronización para evitar FV.'], keywords: ['fa', 'ritmo'] },
    { id: 'desfibrilacion_manual', title: 'Desfibrilación Manual', category: 'Cardiología', difficulty: 'Advanced', time: '1 min', description: 'Choque en ritmos de parada (FV/TVSP).', materials: ['Palas o parches'], steps: ['Identificar ritmo.', 'Cargar (200J bifásico).', '¡FUERA TODOS!', 'Descarga inmediata.'], redFlags: ['No tocar al paciente.'], keywords: ['parada', 'choque'] },
    { id: 'holter_setup', title: 'Colocación de Holter', category: 'Cardiología', difficulty: 'Basic', time: '10 min', description: 'Monitorización ECG 24h.', materials: ['Grabadora Holter', 'Electrodos alta calidad'], steps: ['Rasurar y limpiar.', 'Colocar electrodos.', 'Iniciar grabación.', 'Instruir paciente.'], redFlags: ['Evitar mojar dispositivo.'], keywords: ['ritmo', 'casa'] },
    { id: 'ta_invasiva_zero', title: 'Cero de TA Invasiva', category: 'Cardiología', difficulty: 'Intermediate', time: '2 min', description: 'Calibración transductor arterial.', materials: ['Llave 3 pasos'], steps: ['Llave cerrada a paciente.', 'Tapón abierto a aire.', 'Pulsar ZERO en monitor.', 'Cerrar y lavar.'], redFlags: ['Error de lectura si mal nivelado.'], keywords: ['arteria', 'tension'] },
    { id: 'gasto_cardiaco_termo', title: 'Medición Gasto Cardiaco', category: 'Cardiología', difficulty: 'Advanced', time: '5 min', description: 'Termodilución en Swan-Ganz.', materials: ['SF frío/ambiente'], steps: ['Inyectar 10ml rápido.', 'Ver curva en monitor.', 'Repetir 3 veces.', 'Media de resultados.'], redFlags: ['Inyección lenta falsea resultado.'], keywords: ['gc', 'flujo'] },
    { id: 'test_ortostatismo', title: 'Test de Ortostatismo', category: 'Cardiología', difficulty: 'Basic', time: '10 min', description: 'Detección de hipotensión ortostática.', materials: ['Esfigmomanómetro'], steps: ['TA en decúbito (5 min).', 'TA al ponerse de pie (1 min).', 'TA a los 3 min.', 'Comparar caídas.'], redFlags: ['Riesgo de síncope durante el test.'], keywords: ['mareo', 'tension'] },
    { id: 'pericardiocentesis_assist', title: 'Asistencia Pericardiocentesis', category: 'Cardiología', difficulty: 'Advanced', time: '30 min', description: 'Drenaje de taponamiento cardiaco.', materials: ['Kit punción', 'Ecocardiógrafo', 'Drenaje'], steps: ['Posición 45º.', 'Campo estéril.', 'Asistir punción subxifoidea.', 'Vigilar ECG (ST elevado).'], redFlags: ['Riesgo laceración miocardio.'], keywords: ['derrame', 'corazon'] },
    { id: 'valoracion_edemas', title: 'Valoración de Edemas (Fóvea)', category: 'Cardiología', difficulty: 'Basic', time: '2 min', description: 'Escala de Godet.', materials: ['Dedo del operador'], steps: ['Presión sostenida sobre hueso.', 'Observar profundidad depresión.', 'Medir tiempo recuperación.', 'Clasificar 1+ a 4+.'], redFlags: ['Diferenciar de linfedema.'], keywords: ['liquido', 'piernas'] },
    { id: 'test_esfuerzo_asist', title: 'Asistencia Prueba Esfuerzo', category: 'Cardiología', difficulty: 'Intermediate', time: '30 min', description: 'Ergometría.', materials: ['Tapiz rodante', 'ECG continuo'], steps: ['Preparar piel.', 'Monitorización continua.', 'Seguir protocolo (Bruce).', 'Vigilar síntomas.'], redFlags: ['Parar si dolor anginoso o ST elevado.'], keywords: ['corazon', 'correr'] },
    { id: 'balon_contrapulsacion', title: 'Manejo BIAC', category: 'Cardiología', difficulty: 'Advanced', time: 'Var', description: 'Balón intraaórtico de contrapulsación.', materials: ['Consola BIAC', 'Helio'], steps: ['Vigilar sincronía con R.', 'Controlar isquemia miembro distal.', 'Vigilar diuresis y sangrado.'], redFlags: ['Desincronía o migración balón.'], keywords: ['uci', 'shock'] },

    // --- 4. DIGESTIVO / ELIMINACIÓN (56-75) ---
    { id: 'sng_levin', title: 'Sondaje Nasogástrico (Levin)', category: 'Digestivo', difficulty: 'Intermediate', time: '10 min', description: 'Inserción sonda para nutrición.', materials: ['Sonda', 'Lubricante', 'Jeringa 50ml'], steps: ['Medir N-O-X.', 'Insertar pidiendo tragar.', 'Comprobar pH/Aire.', 'Fijar.'], redFlags: ['Introducción en vía aérea (tos/cianosis).'], keywords: ['nutricion', 'sonda'], illustration: (
        <div className="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 flex flex-col items-center justify-center my-4 border border-slate-200 dark:border-slate-700">
            <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-md">
                {/* Cabeza y cuello */}
                <path d="M100,20 C130,20 140,50 140,80 C140,110 120,130 110,150 L110,180 L90,180 L90,150 C80,130 60,110 60,80 C60,50 70,20 100,20 Z" fill="#fcd34d" opacity="0.4"/>
                {/* Nariz */}
                <path d="M100,70 L115,90 L100,95" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {/* Oreja */}
                <path d="M140,80 C150,80 150,100 140,100" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round"/>
                {/* Apéndice xifoides (estómago) */}
                <circle cx="100" cy="190" r="15" fill="#ef4444" opacity="0.3"/>
                {/* Sonda (Línea azul) */}
                <path d="M110,92 C110,92 100,90 95,100 C90,110 95,130 100,150 C105,170 100,190 100,190" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="4 2" className="animate-pulse"/>
                {/* Puntos de medición (N-O-X) */}
                <circle cx="110" cy="92" r="4" fill="#ef4444"/> {/* Nariz */}
                <circle cx="145" cy="90" r="4" fill="#ef4444"/> {/* Oreja */}
                <circle cx="100" cy="190" r="4" fill="#ef4444"/> {/* Xifoides */}
                {/* Líneas de medición */}
                <path d="M110,92 L145,90 L100,190" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2"/>
                <text x="100" y="15" fontSize="10" fill="#64748b" textAnchor="middle" fontWeight="bold">Medición N-O-X</text>
            </svg>
            <p className="text-[10px] text-slate-500 mt-2 text-center font-bold">Nariz ➔ Lóbulo Oreja ➔ Apéndice Xifoides</p>
        </div>
    ) },
    { id: 'enema_limpieza', title: 'Enema de Limpieza', category: 'Digestivo', difficulty: 'Basic', time: '15 min', description: 'Evacuación intestinal.', materials: ['Kit enema', 'Sonda rectal', 'Lubricante'], steps: ['Posición Sims (lat izq).', 'Introducir sonda 10cm.', 'Pasar líquido lentamente.', 'Retener 5-10 min.'], redFlags: ['Dolor intenso o sangrado.'], keywords: ['estreñimiento'] },
    { id: 'ostomia_cuidado', title: 'Cuidado de Estoma (Bolsa)', category: 'Digestivo', difficulty: 'Basic', time: '10 min', description: 'Limpieza y cambio de bolsa.', materials: ['Bolsa ostomía', 'Medidor', 'Jabón neutro'], steps: ['Retirar bolsa vieja.', 'Limpiar estoma y piel.', 'Medir estoma.', 'Recortar placa y pegar.'], redFlags: ['Piel periestomal irritada.'], keywords: ['bolsa', 'caca'] },
    { id: 'paracentesis_evacuadora', title: 'Asistencia Paracentesis', category: 'Digestivo', difficulty: 'Advanced', time: '40 min', description: 'Drenaje de ascitis.', materials: ['Kit punción', 'Vacio', 'Albúmina'], steps: ['Decúbito supino.', 'Asistir punción.', 'Control TA cada 15 min.', 'Reponer albúmina.'], redFlags: ['Shock por descompresión.'], keywords: ['cirrosis', 'barriga'] },
    { id: 'lavado_gastrico_tox', title: 'Lavado Gástrico Tox.', category: 'Digestivo', difficulty: 'Advanced', time: '20 min', description: 'Evacuación de tóxicos ingeridos.', materials: ['Sonda Faucher', 'SF (litros)', 'Aspirador'], steps: ['Decúbito lat izq.', 'Introducir sonda gruesa.', 'Instilar/Aspirar hasta limpio.', 'Carbón activado final.'], redFlags: ['Riesgo broncoaspiración (proteger vía aérea).'], keywords: ['intoxicacion', 'sobredosis'] },
    { id: 'sng_descompresiva', title: 'SNG Descompresiva (Salem)', category: 'Digestivo', difficulty: 'Intermediate', time: '10 min', description: 'Drenaje de contenido gástrico (Íleo).', materials: ['Sonda Salem (doble luz)', 'Bolsa drenaje'], steps: ['Inserción normal.', 'Conectar a gravedad/succión.', 'Mantener luz azul al aire.'], redFlags: ['No obstruir luz de venteo.'], keywords: ['ileo', 'obstruccion'] },
    { id: 'sondaje_rectal_gas', title: 'Sonda Rectal (Gases)', category: 'Digestivo', difficulty: 'Basic', time: '15 min', description: 'Alivio de meteorismo.', materials: ['Sonda rectal', 'Lubricante'], steps: ['Inserción 15cm.', 'Mantener 20 min.', 'Bolsa para recogida.'], redFlags: ['No forzar si resistencia.'], keywords: ['gases', 'pedos'] },
    { id: 'lavado_estoma', title: 'Irrigación de Colostomía', category: 'Digestivo', difficulty: 'Intermediate', time: '45 min', description: 'Entrenamiento de evacuación.', materials: ['Kit irrigación', 'Agua templada'], steps: ['Introducir cono.', 'Pasar agua 500-1000ml.', 'Esperar evacuación completa.'], redFlags: ['Vómitos o dolor tipo cólico.'], keywords: ['limpieza'] },
    { id: 'phmetria_setup', title: 'Setup de PHmetría', category: 'Digestivo', difficulty: 'Intermediate', time: '20 min', description: 'Estudio de reflujo.', materials: ['Sonda fina', 'Grabadora'], steps: ['Inserción nasal.', 'Posicionar en EEI.', 'Fijar.', 'Explicar diario de síntomas.'], redFlags: ['Mal posicionamiento sonda.'], keywords: ['reflujo', 'estomago'] },
    { id: 'nutricion_peg', title: 'Nutrición por PEG', category: 'Digestivo', difficulty: 'Basic', time: '10 min', description: 'Alimentación por gastrostomía.', materials: ['Jeringa', 'Agua', 'Nutrición'], steps: ['Comprobar estoma.', 'Lavar con agua.', 'Pasar dieta.', 'Lavar final.'], redFlags: ['Obstrucción de la sonda.'], keywords: ['peg', 'tripa'] },
    { id: 'tacto_rectal_enf', title: 'Tacto Rectal (Valoración)', category: 'Digestivo', difficulty: 'Intermediate', time: '5 min', description: 'Búsqueda de fecalomas.', materials: ['Guantes', 'Lubricante'], steps: ['Posición decúbito lat.', 'Introducción dedo índice.', 'Exploración ampolla rectal.'], redFlags: ['Hemorroides trombosadas dolorosas.'], keywords: ['fecaloma'] },
    { id: 'extraccion_fecaloma', title: 'Extracción Manual Fecaloma', category: 'Digestivo', difficulty: 'Intermediate', time: '20 min', description: 'Fragmentación manual de heces impactadas.', materials: ['Guantes dobles', 'Lubricante abundante'], steps: ['Fragmentar suavemente.', 'Extraer porciones.', 'Enema posterior.'], redFlags: ['Riesgo estimulación vagal (bradicardia).'], keywords: ['caca', 'tapón'] },
    { id: 'medicion_perimetro_abd', title: 'Perímetro Abdominal', category: 'Digestivo', difficulty: 'Basic', time: '2 min', description: 'Control de distensión/ascitis.', materials: ['Cinta métrica'], steps: ['Paciente supino.', 'Pasar cinta por ombligo.', 'Medir en espiración.'], redFlags: ['Medir siempre en mismo punto.'], keywords: ['barriga', 'medir'] },
    { id: 'sondaje_nasoyeyunal', title: 'Sondaje Nasoyeyunal Assist', category: 'Digestivo', difficulty: 'Advanced', time: '30 min', description: 'Paso de sonda post-píloro.', materials: ['Sonda lastrada', 'Procinéticos'], steps: ['Colocar SNG.', 'Posicionar decúbito lat dcho.', 'Avanzar bajo Rx o endoscopia.'], redFlags: ['No forzar.'], keywords: ['yeyuno'] },
    { id: 'manejo_sengstaken', title: 'Manejo Sonda Sengstaken', category: 'Digestivo', difficulty: 'Advanced', time: '20 min', description: 'Control de varices esofágicas sangrantes.', materials: ['Sonda Blakemore', 'Manómetro', 'Pesas/Tracción'], steps: ['Inserción.', 'Inflar balón gástrico (comprobar posición).', 'Inflar esofágico si persiste sangrado.'], redFlags: ['Riesgo rotura esofágica o asfixia.'], keywords: ['sangre', 'varices'] },

    // --- 5. URINARIO (76-90) ---
    { id: 'sv_hombre', title: 'Sondaje Vesical Hombre', category: 'Urinario', difficulty: 'Intermediate', time: '15 min', description: 'Inserción sonda Foley en varón.', materials: ['Sonda Foley', 'Lubricante urológico', 'Kit estéril'], steps: ['Higiene manos/genital.', 'Campo estéril.', 'Pene a 90º.', 'Introducir hasta bifurcación.', 'Inflar balón.'], redFlags: ['Falsa vía si se fuerza.'], keywords: ['pis', 'foley'] },
    { id: 'sv_mujer', title: 'Sondaje Vesical Mujer', category: 'Urinario', difficulty: 'Intermediate', time: '15 min', description: 'Inserción sonda Foley en mujer.', materials: ['Sonda Foley', 'Kit estéril'], steps: ['Identificar meato entre labios menores.', 'Limpiar arriba-abajo.', 'Insertar 5-7cm.', 'Ver orina e inflar.'], redFlags: ['No introducir en vagina.'], keywords: ['pis', 'foley'] },
    { id: 'lavado_vesical_cont', title: 'Lavado Vesical Continuo', category: 'Urinario', difficulty: 'Intermediate', time: '10 min', description: 'Irrigación para evitar coágulos.', materials: ['Sonda 3 vías', 'Suero lavado 3L', 'Sistema irrigación'], steps: ['Conectar suero a 3ª vía.', 'Ajustar ritmo según color orina.', 'Control estricto balance.'], redFlags: ['Obstrucción (riesgo rotura vesical).'], keywords: ['sangre', 'prostata'] },
    { id: 'sondaje_intermitente', title: 'Sondaje Intermitente', category: 'Urinario', difficulty: 'Basic', time: '5 min', description: 'Vaciado puntual (vejiga neurógena).', materials: ['Sonda Nelaton'], steps: ['Introducir sonda.', 'Vaciar vejiga.', 'Retirar inmediatamente.'], redFlags: ['Infección por técnica no aséptica.'], keywords: ['vaciar'] },
    { id: 'lavado_vesical_manual', title: 'Lavado Vesical Manual', category: 'Urinario', difficulty: 'Intermediate', time: '10 min', description: 'Desobstrucción de sonda por coágulos.', materials: ['Jeringa 50ml cono ancho', 'SF estéril'], steps: ['Desconectar bolsa.', 'Inyectar SF con fuerza.', 'Aspirar coágulos.', 'Repetir hasta flujo libre.'], redFlags: ['No forzar entrada si hay mucha resistencia.'], keywords: ['coagulo', 'tapado'] },
    { id: 'puncion_suprapubica', title: 'Punción Suprapúbica Assist', category: 'Urinario', difficulty: 'Advanced', time: '20 min', description: 'Acceso vesical por pared abdominal.', materials: ['Kit Cistofix'], steps: ['Preparar zona vello pubiano.', 'Asistir punción trocar.', 'Fijar catéter.'], redFlags: ['Riesgo perforación intestinal.'], keywords: ['cistofix'] },
    { id: 'recoleccion_orina_24h', title: 'Recogida Orina 24h', category: 'Urinario', difficulty: 'Basic', time: '24h', description: 'Cuantificación analítica completa.', materials: ['Bote grande (2L)', 'Conservante si precisa'], steps: ['Desechar primera orina mañana.', 'Recoger TODA hasta misma hora día siguiente.', 'Mantener refrigerado.'], redFlags: ['Pérdida de una micción anula test.'], keywords: ['depuracion'] },
    { id: 'urocultivo_midstream', title: 'Recogida Urocultivo', category: 'Urinario', difficulty: 'Basic', time: '5 min', description: 'Muestra orina estéril.', materials: ['Bote estéril'], steps: ['Limpieza genital previa.', 'Desechar primer chorro.', 'Recoger chorro medio.', 'Cerrar sin tocar interior.'], redFlags: ['Contaminación con flora dérmica.'], keywords: ['infeccion', 'itu'] },

    // --- 6. NEUROLOGÍA (91-105) ---
    { id: 'pic_monitor', title: 'Monitorización PIC', category: 'Neurología', difficulty: 'Advanced', time: 'Var', description: 'Control presión intracraneal.', materials: ['Transductor electrónico', 'Monitor PIC'], steps: ['Nivelar a conducto auditivo.', 'Realizar cero.', 'Registrar valor y curva.'], redFlags: ['PIC > 20 mmHg (Emergencia).'], keywords: ['cerebro', 'tce'] },
    { id: 'pl_assist', title: 'Asistencia Punción Lumbar', category: 'Neurología', difficulty: 'Advanced', time: '30 min', description: 'Obtención de LCR.', materials: ['Kit PL', 'Manómetro LCR', 'Tubos muestra'], steps: ['Posición fetal o sentado.', 'Inmovilizar paciente.', 'Etiquetar muestras por orden.'], redFlags: ['Signos herniación cerebral.'], keywords: ['lcr', 'meningitis'] },
    { id: 'glasgow_eval', title: 'Evaluación Escala Glasgow', category: 'Neurología', difficulty: 'Basic', time: '2 min', description: 'Valoración nivel consciencia.', materials: ['Linterna pupilas'], steps: ['Valorar Ojos (1-4).', 'Valorar Verbal (1-5).', 'Valorar Motor (1-6).'], redFlags: ['GCS < 9: Vía aérea en riesgo.'], keywords: ['coma', 'gcs'] },
    { id: 'pupilas_eval', title: 'Valoración Pupilar', category: 'Neurología', difficulty: 'Basic', time: '1 min', description: 'Tamaño y reactividad.', materials: ['Linterna'], steps: ['Observar simetría (Isocoria).', 'Reacción a luz (Miosis).', 'Registrar PIRRL.'], redFlags: ['Anisocoria súbita (Signo alarma).'], keywords: ['ojos'] },
    { id: 'test_muerte_encef', title: 'Test Muerte Encefálica Assist', category: 'Neurología', difficulty: 'Advanced', time: '60 min', description: 'Protocolo diagnóstico legal.', materials: ['Gasómetro', 'Monitor apnea'], steps: ['Prueba apnea.', 'Reflejos tronco.', 'EEG / Doppler transcraneal.'], redFlags: ['Confirmación por 2 médicos.'], keywords: ['muerte', 'transplante'] },

    // --- 7. CURAS / PIEL (106-120) ---
    { id: 'upp_estadio3', title: 'Cura UPP Estadio III/IV', category: 'Cuidados', difficulty: 'Advanced', time: '30 min', description: 'Tratamiento úlceras profundas.', materials: ['Suero', 'Desbridantes', 'Plata/Alginato'], steps: ['Limpiar arrastre.', 'Eliminar esfacelos.', 'Rellenar cavidades.', 'Cubrir.'], redFlags: ['Signos de osteomielitis.'], keywords: ['escara', 'herida'] },
    { id: 'cura_quemado_grave', title: 'Cura Quemado Grave', category: 'Cuidados', difficulty: 'Advanced', time: '45 min', description: 'Manejo lesiones térmicas extensas.', materials: ['Agua estéril', 'Gasas vaselinadas', 'Sulfadiazina'], steps: ['Limpieza estéril.', 'No romper flictenas.', 'Vendaje oclusivo suave.'], redFlags: ['Shock hipovolémico.'], keywords: ['fuego', 'piel'] },
    { id: 'vac_setup', title: 'Setup de Terapia VAC', category: 'Cuidados', difficulty: 'Advanced', time: '30 min', description: 'Cierre por presión negativa.', materials: ['Equipo VAC', 'Esponja', 'Film adhesivo'], steps: ['Adaptar esponja a herida.', 'Sellar con film.', 'Realizar orificio y conectar.', 'Iniciar succión.'], redFlags: ['Pérdida de vacío.'], keywords: ['vacio', 'herida'] },
    { id: 'retirada_grapas', title: 'Retirada de Grapas', category: 'Cuidados', difficulty: 'Basic', time: '10 min', description: 'Extracción sutura mecánica.', materials: ['Quitagrapas estéril'], steps: ['Desinfectar.', 'Insertar quitagrapas.', 'Presionar y extraer.', 'Poner Steri-strips.'], redFlags: ['Dehiscencia de herida.'], keywords: ['puntos', 'grapas'] },
    { id: 'desbridamiento_cortante', title: 'Desbridamiento Cortante', category: 'Cuidados', difficulty: 'Advanced', time: '15 min', description: 'Eliminación tejido necrótico con bisturí.', materials: ['Bisturí/Tijera iris', 'Gasas', 'Hemostáticos'], steps: ['Identificar tejido muerto.', 'Cortar plano a plano.', 'Controlar sangrado.'], redFlags: ['No cortar tejido viable.'], keywords: ['necrotico', 'limpiar'] },
];

const CATEGORIES = [
    { id: 'ALL', label: 'Todas' },
    { id: 'Accesos', label: 'Vías y Sangre' },
    { id: 'Respiratorio', label: 'Vía Aérea' },
    { id: 'Cardiología', label: 'Cardio' },
    { id: 'Digestivo', label: 'Digestivo' },
    { id: 'Urinario', label: 'Urinario' },
    { id: 'Cuidados', label: 'Curas y Piel' },
    { id: 'Neurología', label: 'Neuro' },
];

export const NursingProcedures: React.FC = () => {
    const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [checkedSteps, setCheckedSteps] = useState<string[]>([]);
    const [checkedMaterials, setCheckedMaterials] = useState<string[]>([]);
    const [activeDetailTab, setActiveDetailTab] = useState<'STEPS' | 'MATERIALS'>('STEPS');
    const [isMaterialsExpandedInSteps, setIsMaterialsExpandedInSteps] = useState(false);
    
    // Timer
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [timerSeconds, setTimerSeconds] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isTimerRunning) interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleStep = (step: string) => {
        setCheckedSteps(prev => prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]);
    };

    const toggleMaterial = (mat: string) => {
        setCheckedMaterials(prev => prev.includes(mat) ? prev.filter(m => m !== mat) : [...prev, mat]);
    };

    const filteredList = PROCEDURES_DB.filter(p => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = p.title.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || p.keywords?.some(k => k.includes(query));
        const matchesCategory = activeCategory === 'ALL' ? true : p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const getDifficultyColor = (diff: string) => {
        if (diff === 'Basic') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (diff === 'Intermediate') return 'text-blue-600 bg-blue-50 border-blue-200';
        return 'text-purple-600 bg-purple-50 border-purple-200';
    };

    return (
        <div className="flex h-full bg-slate-100 overflow-hidden font-sans relative">
            
            {/* --- LIST SIDEBAR --- */}
            <div className={`w-full md:w-96 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 z-20 shadow-xl transition-all duration-300 ${selectedProcedure ? 'hidden md:flex' : 'flex'}`}>
                
                {/* Header */}
                <div className="p-5 bg-slate-900 text-white shrink-0 z-10 sticky top-0">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-black text-xs uppercase tracking-widest text-emerald-400 flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2"/> Manual de Técnicas
                        </h2>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-bold">{PROCEDURES_DB.length} PROCS</span>
                    </div>
                    
                    <div className="relative group">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors"/>
                        <input 
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar entre +110 técnicas..." 
                            className="w-full pl-9 p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder-slate-500 font-medium"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="bg-white border-b border-slate-200 p-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                    {CATEGORIES.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => setActiveCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-all border ${activeCategory === cat.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2 bg-slate-50 space-y-2 pb-48 custom-scrollbar">
                    {filteredList.map(proc => (
                        <button 
                            key={proc.id} 
                            onClick={() => { setSelectedProcedure(proc); setCheckedSteps([]); setCheckedMaterials([]); setActiveDetailTab('STEPS'); setIsMaterialsExpandedInSteps(false); }} 
                            className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-2 group active:scale-[0.98] ${selectedProcedure?.id === proc.id ? 'bg-white border-indigo-500 ring-1 ring-indigo-500 shadow-md z-10' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'}`}
                        >
                            <div className="flex justify-between items-start">
                                <h3 className={`text-sm font-black leading-tight ${selectedProcedure?.id === proc.id ? 'text-indigo-700' : 'text-slate-800'}`}>{proc.title}</h3>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400"/>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${getDifficultyColor(proc.difficulty)}`}>{proc.difficulty}</span>
                                <span className="text-[9px] font-bold text-slate-400 flex items-center bg-slate-50 px-1.5 py-0.5 rounded"><Clock className="w-3 h-3 mr-1"/> {proc.time}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* --- DETAIL CONTENT --- */}
            <div className={`flex-1 flex flex-col bg-slate-50 relative overflow-hidden ${!selectedProcedure ? 'hidden md:flex' : 'flex fixed inset-0 md:relative z-30'}`}>
                {selectedProcedure ? (
                    <div className="flex flex-col h-full animate-slide-in-right bg-white lg:bg-slate-50 relative">
                        
                        {/* Detail Header */}
                        <div className="bg-white border-b border-slate-200 shadow-sm shrink-0 sticky top-0 z-10">
                            <div className="p-4 flex items-start gap-4">
                                <button onClick={() => setSelectedProcedure(null)} className="md:hidden flex items-center gap-1 p-2 -ml-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shadow-sm">
                                    <ChevronLeft className="w-5 h-5"/>
                                    <span className="text-[10px] font-black uppercase pr-1">Volver</span>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 tracking-wide">{selectedProcedure.category}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${getDifficultyColor(selectedProcedure.difficulty)}`}>{selectedProcedure.difficulty}</span>
                                    </div>
                                    <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight tracking-tighter uppercase">{selectedProcedure.title}</h1>
                                </div>
                            </div>

                            {/* View Switcher (Tabs) */}
                            <div className="px-4 pb-4">
                                <div className="bg-slate-100 p-1 rounded-2xl flex max-w-md border border-slate-200">
                                    <button 
                                        onClick={() => setActiveDetailTab('STEPS')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeDetailTab === 'STEPS' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <List className="w-4 h-4"/> Protocolo
                                    </button>
                                    <button 
                                        onClick={() => setActiveDetailTab('MATERIALS')}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeDetailTab === 'MATERIALS' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <Package className="w-4 h-4"/> Materiales
                                        {checkedMaterials.length > 0 && (
                                            <span className="bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-1">{checkedMaterials.length}</span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Global Progress Bar */}
                            <div className="h-1.5 w-full bg-slate-100 relative">
                                <div 
                                    className={`h-full transition-all duration-500 ${activeDetailTab === 'STEPS' ? 'bg-indigo-500' : 'bg-emerald-500'}`} 
                                    style={{width: activeDetailTab === 'STEPS' 
                                        ? `${(checkedSteps.length / selectedProcedure.steps.length) * 100}%` 
                                        : `${(checkedMaterials.length / selectedProcedure.materials.length) * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Content Scroll */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pb-32">
                            
                            {/* 1. MATERIALS FOCUSED VIEW */}
                            {activeDetailTab === 'MATERIALS' && (
                                <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
                                    <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-[2.5rem] border border-emerald-100 flex items-start gap-6 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-10"><Boxes className="w-32 h-32 text-emerald-900"/></div>
                                        <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-xl relative z-10"><ShoppingCart className="w-8 h-8"/></div>
                                        <div className="relative z-10">
                                            <h3 className="font-black text-emerald-900 text-2xl uppercase tracking-tight">Modo Preparación</h3>
                                            <p className="text-sm text-emerald-700 font-bold mt-1">Completa el checklist antes de entrar en zona estéril.</p>
                                            <div className="mt-4 flex items-center gap-2">
                                                <div className="h-2 w-32 bg-emerald-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-600" style={{width: `${(checkedMaterials.length / selectedProcedure.materials.length) * 100}%`}}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-emerald-600 uppercase">{checkedMaterials.length} de {selectedProcedure.materials.length} listos</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedProcedure.materials.map((mat, i) => {
                                            const isChecked = checkedMaterials.includes(mat);
                                            return (
                                                <button 
                                                    key={i} 
                                                    onClick={() => toggleMaterial(mat)}
                                                    className={`flex flex-col p-6 rounded-3xl border-2 text-left transition-all active:scale-[0.98] group relative overflow-hidden ${isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100 hover:border-emerald-300 shadow-sm'}`}
                                                >
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className={`p-3 rounded-2xl ${isChecked ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600'}`}>
                                                            {isChecked ? <ClipboardCheck className="w-5 h-5"/> : <Box className="w-5 h-5"/>}
                                                        </div>
                                                        {isChecked && <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-fade-in">Registrado</div>}
                                                    </div>
                                                    <span className={`text-base font-black leading-tight transition-colors ${isChecked ? 'text-emerald-900' : 'text-slate-800'}`}>{mat}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Biohazard className="w-24 h-24"/></div>
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-4 flex items-center"><ShieldAlert className="w-5 h-5 mr-2"/> Bioseguridad y Entorno</h4>
                                        <p className="text-sm font-bold text-slate-300 leading-relaxed mb-6">Verifica el sellado de envases estériles y la fecha de caducidad. No olvides realizar la higiene de manos (OMS 5 momentos) antes de contactar con el material.</p>
                                        <button 
                                            onClick={() => setActiveDetailTab('STEPS')}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Play className="w-5 h-5 fill-current"/> INICIAR INTERVENCIÓN
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* 2. STEPS VIEW WITH COLLAPSIBLE MATERIALS */}
                            {activeDetailTab === 'STEPS' && (
                                <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                                    
                                    {/* Collapsible Materials Section */}
                                    <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-sm overflow-hidden group/card transition-all">
                                        <button 
                                            onClick={() => setIsMaterialsExpandedInSteps(!isMaterialsExpandedInSteps)}
                                            className={`w-full flex items-center justify-between p-6 transition-colors ${isMaterialsExpandedInSteps ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 hover:bg-slate-50'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2.5 rounded-xl ${isMaterialsExpandedInSteps ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    <Package className="w-5 h-5"/>
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-black text-sm uppercase tracking-widest">Materiales Necesarios</h3>
                                                    <p className={`text-[10px] font-bold ${isMaterialsExpandedInSteps ? 'text-slate-400' : 'text-slate-500'}`}>
                                                        {checkedMaterials.length} de {selectedProcedure.materials.length} listos
                                                    </p>
                                                </div>
                                            </div>
                                            {isMaterialsExpandedInSteps ? <ChevronUp className="w-6 h-6"/> : <ChevronDown className="w-6 h-6"/>}
                                        </button>
                                        
                                        {isMaterialsExpandedInSteps && (
                                            <div className="p-6 bg-slate-50/50 animate-fade-in-down">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                    {selectedProcedure.materials.map((mat, i) => {
                                                        const isChecked = checkedMaterials.includes(mat);
                                                        return (
                                                            <button 
                                                                key={i} 
                                                                onClick={() => toggleMaterial(mat)}
                                                                className={`flex items-center p-3 rounded-2xl border transition-all active:scale-[0.98] ${isChecked ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-300'}`}
                                                            >
                                                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center mr-3 shrink-0 ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}>
                                                                    {isChecked && <CheckSquare className="w-3.5 h-3.5"/>}
                                                                </div>
                                                                <span className={`text-xs font-bold ${isChecked ? 'line-through opacity-60' : ''}`}>{mat}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                                <button 
                                                    onClick={() => setActiveDetailTab('MATERIALS')}
                                                    className="mt-6 w-full py-3 text-[10px] font-black text-indigo-600 border-2 border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors uppercase tracking-widest"
                                                >
                                                    Abrir Checklist Pantalla Completa
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Red Flags Alert */}
                                    {selectedProcedure.redFlags.length > 0 && (
                                        <div className="bg-rose-50 border-l-[12px] border-rose-500 p-5 rounded-r-[2rem] shadow-lg shadow-rose-900/5 animate-fade-in relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-5"><AlertOctagon className="w-16 h-16 text-rose-900"/></div>
                                            <h3 className="text-xs font-black text-rose-700 uppercase mb-3 flex items-center tracking-widest"><ShieldAlert className="w-4 h-4 mr-2 animate-pulse"/> Puntos Críticos de Seguridad</h3>
                                            <ul className="space-y-2">
                                                {selectedProcedure.redFlags.map((flag, i) => (
                                                    <li key={i} className="text-xs font-bold text-rose-800 flex items-start gap-3">
                                                        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-500"/> {flag}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fundamento Clínico</h4>
                                        <p className="text-sm text-slate-700 font-bold leading-relaxed">{selectedProcedure.description}</p>
                                    </div>

                                    {/* Illustration */}
                                    {selectedProcedure.illustration && (
                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Diagrama Visual</h4>
                                            {selectedProcedure.illustration}
                                        </div>
                                    )}

                                    {/* Step List */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-2">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Ejecución Paso a Paso</h4>
                                            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{checkedSteps.length} / {selectedProcedure.steps.length}</span>
                                        </div>
                                        {selectedProcedure.steps.map((step, i) => {
                                            const isChecked = checkedSteps.includes(step);
                                            return (
                                                <div 
                                                    key={i} 
                                                    onClick={() => toggleStep(step)}
                                                    className={`flex gap-5 p-6 rounded-[2rem] border-2 transition-all cursor-pointer group active:scale-[0.99] touch-manipulation ${isChecked ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md'}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border-2 transition-all ${isChecked ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'border-slate-200 text-slate-400 bg-slate-50 group-hover:border-indigo-400 group-hover:text-indigo-500'}`}>
                                                        {isChecked ? <ClipboardCheck className="w-6 h-6"/> : <span className="text-base font-black">{i+1}</span>}
                                                    </div>
                                                    <p className={`text-base font-bold leading-relaxed pt-1.5 ${isChecked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                                        {step}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Completion State */}
                                    {checkedSteps.length === selectedProcedure.steps.length && (
                                        <div className="bg-emerald-600 p-8 rounded-[3rem] text-center text-white shadow-2xl shadow-emerald-900/20 animate-fade-in-up">
                                            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                                                <CheckCircle2 className="w-10 h-10 text-white"/>
                                            </div>
                                            <h3 className="text-2xl font-black uppercase tracking-tight">¡Intervención Finalizada!</h3>
                                            <p className="text-emerald-100 text-sm font-bold mt-2 opacity-90">Registra inmediatamente la técnica en la nota de evolución para asegurar la continuidad de cuidados.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Floating Timer Widget */}
                        <div className="absolute bottom-6 right-6 z-20">
                            <div className="bg-slate-900 text-white rounded-full shadow-2xl flex items-center pl-1 pr-5 py-1 border border-slate-700 backdrop-blur-md bg-opacity-95">
                                <button 
                                    onClick={() => { setIsTimerRunning(!isTimerRunning); if(!isTimerRunning && timerSeconds===0) setTimerSeconds(0); }} 
                                    className={`p-3 rounded-full mr-3 transition-all ${isTimerRunning ? 'bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-900/50' : 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-900/50'}`}
                                >
                                    {isTimerRunning ? <span className="font-black text-[10px] tracking-tighter">PAUSE</span> : <Play className="w-4 h-4 fill-current ml-0.5"/>}
                                </button>
                                <div className="font-mono font-black text-xl min-w-[60px] text-center tracking-widest">{formatTime(timerSeconds)}</div>
                                <button onClick={() => {setIsTimerRunning(false); setTimerSeconds(0);}} className="ml-3 text-slate-500 hover:text-white p-1 transition-colors">
                                    <RefreshCcw className="w-4 h-4"/>
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-white">
                        <div className="relative mb-6">
                            <div className="w-40 h-40 bg-slate-50 rounded-full flex items-center justify-center shadow-inner border border-slate-100">
                                <BookOpen className="w-16 h-16 text-slate-200"/>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-4 rounded-3xl shadow-2xl animate-bounce">
                                <Stethoscope className="w-6 h-6"/>
                            </div>
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-[0.2em] text-slate-400">Guía de Procedimientos</h3>
                        <p className="text-xs font-bold text-slate-300 mt-2 uppercase tracking-widest">Selecciona una técnica del panel lateral</p>
                    </div>
                )}
            </div>
        </div>
    );
};
