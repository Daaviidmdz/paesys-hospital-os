import React, { useState, useEffect, useMemo } from 'react';
import { Drug } from '../types';
import { generateDrugDetails } from '../services/geminiService';
import { DrugService } from '../services/firebaseMock';
import { IncompatibilitiesCalculator } from './IncompatibilitiesCalculator';
import { 
    Search, Pill, Syringe, AlertTriangle, Clock, Droplets, Activity, 
    ShieldAlert, ArrowLeft, Calculator, X, Star, Eye, CheckCircle, 
    AlertOctagon, BookOpen, FlaskConical, ThermometerSnowflake, Zap, 
    Ban, Sun, Baby, FileText, Info, Filter, ChevronRight, Stethoscope, 
    Hash, Anchor, Beaker, Skull, Brain, HeartPulse, Tablet, Wind, 
    List, Layers, Timer, Biohazard, Plus, Wand2, Save, Loader2, 
    SlidersHorizontal, Check, UserPlus, Cloud, Package, Trash2, 
    Sparkles, CheckCircle2, ShieldCheck, Microscope, Monitor, FileCheck, ChevronLeft
} from 'lucide-react';

const RAW_DRUG_CATALOG = [
    { category: "Antiinfecciosos: Penicilinas y Cefalosporinas", items: [
        "Amoxicilina", "Amoxicilina-Clavulánico", "Ampicilina", "Ampicilina-Sulbactam", "Cloxacilina", "Penicilina G Sódica", "Penicilina G Benzatina", "Penicilina V", "Piperacilina-Tazobactam", "Ticarcilina-Clavulánico",
        "Cefazolina", "Cefadroxilo", "Cefalexina", "Cefalotina", "Cefuroxima", "Cefaclor", "Cefprozilo", "Cefonicid", "Cefoxitina", "Cefotaxima", "Ceftriaxona", "Ceftazidima", "Cefixima", "Ceftibuteno", "Cefditoreno", "Cefepima", "Ceftarolina", "Ceftolozano-Tazobactam", "Ceftazidima-Avibactam"
    ]},
    { category: "Antiinfecciosos: Otros Antibióticos", items: [
        "Ertapenem", "Imipenem-Cilastatina", "Meropenem", "Doripenem", "Aztreonam", "Amikacina", "Gentamicina", "Tobramicina", "Estreptomicina", "Neomicina",
        "Eritromicina", "Claritromicina", "Azitromicina", "Telitromicina", "Clindamicina", "Lincomicina", "Vancomicina", "Teicoplanina", "Dalbavancina", "Oritavancina",
        "Daptomicina", "Linezolid", "Tedizolid", "Tigeciclina", "Ciprofloxacino", "Levofloxacino", "Moxifloxacino", "Norfloxacino", "Ofloxacino", "Doxiciclina",
        "Minociclina", "Tetraciclina", "Cotrimoxazol", "Sulfadiacina", "Fosfomicina", "Metronidazol", "Tinidazol", "Nitrofurantoína", "Rifampicina",
        "Isoniazida", "Pirazinamida", "Etambutol", "Bedaquilina", "Colistina", "Polimixina B", "Fidaxomicina", "Rifaximina", "Mupirocina", "Ácido Fusídico",
        "Bactitracina", "Gramicidina", "Cicloserina", "Capreomicona", "Ethionamida", "Clofazimina"
    ]},
    { category: "Antiinfecciosos: Antivíricos y Fúngicos", items: [
        "Aciclovir", "Valaciclovir", "Ganciclovir", "Valganciclovir", "Foscarnet", "Cidofovir", "Oseltamivir", "Zanamivir", "Remdesivir", "Tenofovir", "Entecavir", "Sofosbuvir", "Ribavirina", "Abacavir", "Lamivudina", "Zidovudina", "Efavirenz", "Ritonavir", "Darunavir", "Dolutegravir",
        "Nevirapina", "Etravirina", "Rilpivirina", "Lopinavir", "Atazanavir", "Raltegravir", "Maraviroc", "Enfuvirtida", "Bictegravir", "Elvitegravir",
        "Fluconazol", "Itraconazol", "Voriconazol", "Posaponazol", "Isavuconazol", "Caspofungina", "Micafungina", "Anidulafungina", "Anfotericina B Liposomal", "Anfotericina B Desoxicolato", "Nistatina", "Terbinafina", "Flucitosina", "Griseofulvina", "Clotrimazol", "Miconazol", "Ketoconazol"
    ]},
    { category: "Analgesia, Sedación y Relajantes", items: [
        "Paracetamol", "Metamizol", "Ibuprofeno", "Dexketoprofeno", "Diclofenaco", "Naproxeno", "Ketorolaco", "Indometacina", "Celecoxib", "Etoricoxib", "Aceclofenaco", "Meloxicam", "Piroxicam", "Aspirina (Analgesia)",
        "Nabumetona", "Sulindaco", "Lornoxicam", "Parecoxib", "Flurbiprofeno", "Morfina", "Fentanilo", "Remifentanilo", "Sufentanilo", "Alfentanilo", "Oxicodona", "Hidromorfona", "Tapentadol", "Tramadol", "Codeína", "Buprenorfina", "Metadona", "Petidina", "Naloxona", "Naltrexona",
        "Propofol", "Etomidato", "Ketamina", "Midazolam", "Diazepam", "Lorazepam", "Lormetazepam", "Alprazolam", "Clonazepam", "Clorazepato", "Dexmedetomidina", "Tiopental Sódico",
        "Atracurio", "Cisatracurio", "Rocuronio", "Vecuronio", "Succinilcolina", "Sugammadex", "Neostigmina", "Flumazenilo", "Sevoflurano", "Desflurano", "Isoflurano", "Óxido Nitroso", "Piridostigmina", "Edrofonio"
    ]},
    { category: "Cardiovascular: Antihipertensivos y Diuréticos", items: [
        "Enalapril", "Ramipril", "Lisinopril", "Captopril", "Perindopril", "Fosinopril", "Trandolapril", "Benazepril", "Quinapril", "Losartán", "Valsartán", "Candesartán", "Irbesartán", "Olmesartán", "Telmisartán", "Eprosartán", "Azilsartán", "Sacubitrilo-Valsartán",
        "Amlodipino", "Nifedipino", "Nicardipino", "Nimodipino", "Lercanidipino", "Felodipino", "Diltiazem", "Verapamilo", "Barnidipino", "Lacidipino", "Isradipino",
        "Atenolol", "Metoprolol", "Bisoprolol", "Carvedilol", "Nebivolol", "Labetalol", "Propranolol", "Esmolol", "Sotalol", "Acebutolol", "Pindolol",
        "Hidroclorotiazida", "Clortalidona", "Indapamida", "Furosemida", "Torasemida", "Bumetanida", "Espironolactona", "Eplerenona", "Amilorida", "Triamtereno", "Acetazolamida", "Xipamida",
        "Doxazosina", "Terazosina", "Prazosina", "Metildopa", "Clonidina", "Hidralazina", "Nitroprusiato", "Nitroglicerina", "Isosorbida Dinitrato", "Isosorbida Mononitrato", "Aliskiren", "Bosentán", "Ambrisentán", "Macitentan", "Riociguat", "Sildenafilo (HTP)", "Tadalafilo (HTP)"
    ]},
    { category: "Cardiovascular: Inotrópicos y Antiarrítmicos", items: [
        "Adrenalina", "Noradrenalina", "Dopamina", "Dobutamina", "Isoprenalina", "Milrinona", "Levosimendán", "Digoxina", "Ivabradina", "Milrinona",
        "Amiodarona", "Lidocaína", "Flecainida", "Propafenona", "Procainamida", "Mexiletina", "Adenosina", "Atropina", "Efedrina", "Fenilefrina", "Alprostadil", "Verapamilo IV", "Digoxina IV",
        "Atorvastatina", "Simvastatina", "Rosuvastatina", "Pravastatina", "Lovastatina", "Fluvastatina", "Pitavastatina", "Ezetimiba", "Fenofibrato", "Gemfibrozilo", "Evolocumab", "Alirocumab", "Bezafibrato"
    ]},
    { category: "Hematología", items: [
        "Heparina Sódica", "Heparina Cálcica", "Enoxaparina", "Dalteparina", "Tinzaparina", "Bemiparina", "Nadroparina", "Fondaparinux",
        "Acenocumarol", "Warfarina", "Dabigatrán", "Rivaroxabán", "Apixabán", "Edoxabán", "Idarucizumab", "Andexanet Alfa", "Protamina",
        "Ácido Acetilsalicílico (AAS)", "Clopidogrel", "Prasugrel", "Ticagrelor", "Tirofiban", "Abciximab", "Eptifibatida", "Triflusal", "Cilostazol", "Dipyridamol",
        "Ácido Tranexámico", "Fitomenadiona (Vit K)", "Alteplasa (rtPA)", "Tenecteplasa", "Uroquinasa", "Desmopresina (Hematología)",
        "Epoetina Alfa", "Epoetina Beta", "Darbepoetina", "Filgrastim", "Pegfilgrastim", "Lipegfilgrastim", "Hierro Sacarosa", "Hierro Carboximaltosa", "Hierro Dextrano", "B12 (Cianocobalamina)", "Ácido Fólico", "Factor VIIa", "Factor VIII", "Factor IX", "Factor Von Willebrand", "Complejo Protrombínico"
    ]},
    { category: "Digestivo", items: [
        "Omeprazol", "Pantoprazol", "Esomeprazol", "Lansoprazol", "Rabeprazol", "Famotidina", "Ranitidina", "Nizatidina", "Almagato", "Magaldrato", "Sucralfato", "Misoprostol",
        "Metoclopramida", "Domperidona", "Ondansetrón", "Granisetrón", "Palonosetrón", "Aprepitant", "Rolapitant", "Netupitant", "Dexmetilfenidato",
        "Loperamida", "Racecadotrilo", "Lactulosa", "Lactitol", "Polietilenglicol", "Enema Casen", "Bisacodilo", "Senósidos", "Plantago Ovata", "Glicerina (Supositorios)", "Linaclotida", "Prucaloprida", "Lubiprostona",
        "Sulfasalazina", "Mesalazina", "Azatioprina (Digestivo)", "Infliximab", "Adalimumab", "Vedolizumab", "Ustekinumab", "Golimumab", "Tofacitinib",
        "Somatostatina", "Octreotida", "Terlipresina", "Ácido Ursodesoxicólico", "Pancreatina", "Colestiramina", "Colesevelam"
    ]},
    { category: "Endocrino y Metabólico", items: [
        "Insulina Rápida", "Insulina Aspart", "Insulina Lispro", "Insulina Glulisina", "Insulina NPH", "Insulina Glargina", "Insulina Detemir", "Insulina Degludec", "Insulina Mixta",
        "Metformina", "Gliclazida", "Glimepirida", "Repaglinida", "Pioglitazona", "Sitagliptina", "Vildagliptina", "Linagliptina", "Saxagliptina", "Alogliptina", "Exenatida", "Liraglutida", "Dulaglutida", "Semaglutida", "Lixisenatida", "Empagliflozina", "Dapagliflozina", "Canagliflozina", "Ertugliflozina",
        "Glucagón", "Levotiroxina", "Liotironina", "Tiamazol", "Propiltiouracilo", "Hidrocortisona", "Prednisona", "Prednisolona", "Metilprednisolona", "Dexametasona", "Betametasona", "Deflazacort", "Fludrocortisona", "Triamcinolona",
        "Oxitocina", "Desmopresina", "Teriparatida", "Denosumab", "Ácido Alendrónico", "Ácido Zoledrónico", "Risendronato", "Ibandronato", "Raloxifeno", "Tamoxifeno", "Anastrozol", "Letrozol", "Exemestano"
    ]},
    { category: "Respiratorio", items: [
        "Salbutamol", "Terbutalina", "Salmeterol", "Formoterol", "Indacaterol", "Vilanterol", "Olodaterol",
        "Bromuro de Ipratropio", "Bromuro de Tiotropio", "Bromuro de Aclidinio", "Bromuro de Glicopirronio", "Bromuro de Umeclidinio",
        "Budesonida", "Fluticasona", "Beclometasona", "Mometasona", "Ciclesonida", "Flunisolida",
        "Montelukast", "Zafirlukast", "Teofilina", "Aminofilina", "Acetilcisteína", "Ambroxol", "Bromhexina", "Carbocisteína", "Erdosteína",
        "Codeína (Antitusígeno)", "Dextrometorfano", "Levodropropizina", "Cloperastina", "Noscapina", "Alfa-1-Antitripsina", "Pirfenidona", "Nintedanib"
    ]},
    { category: "Neurología y Psiquiatría", items: [
        "Fenitoína", "Carbamazepina", "Valproato Sódico", "Fenobarbital", "Levetiracetam", "Lacosamida", "Lamotrigina", "Topiramato", "Gabapentina", "Pregabalina", "Zonisamida", "Ethosuximida", "Brivaracetam", "Perampanel", "Oxcarbazepina", "Tiagabina", "Rufinamida", "Vigabatrina", "Felbamato",
        "Levodopa-Carbidopa", "Ropinirol", "Pramipexol", "Rasagilina", "Selegilina", "Entacapona", "Amantadina", "Apomorfina", "Rotigotina", "Safinamida", "Tolcapona",
        "Donepezilo", "Rivastigmina", "Galantamina", "Memantina",
        "Haloperidol", "Risperidona", "Olanzapina", "Quetiapina", "Clozapina", "Aripiprazol", "Paliperidona", "Ziprasidona", "Lurasidona", "Clorpromazina", "Levomepromazina", "Zuclopentixol", "Sulpirida", "Amisulprida", "Pimozida", "Vortioxetina", "Cariprazina", "Brexpiprazol",
        "Fluoxetina", "Sertralina", "Paroxetina", "Escitalopram", "Citalopram", "Fluvoxamina", "Venlafaxina", "Duloxetina", "Desvenlafaxina", "Amitriptilina", "Clomipramina", "Mirtazapina", "Trazodona", "Bupropión", "Litio", "Imipramina", "Nortriptilina", "Reboxetina", "Agomelatina", "Milnacipran",
        "Zolpidem", "Zopiclona", "Buspirona", "Hidroxicina", "Clometiazol", "Melatonina", "Eszopiclona"
    ]},
    { category: "Fluidos, Electrolitos y Nutrición", items: [
        "Suero Fisiológico 0.9%", "Suero Glucofisiológico", "Suero Glucosado 5%", "Suero Glucosado 10%", "Suero Glucosado 20%", "Suero Glucosado 33%", "Suero Glucosado 50%",
        "Ringer Lactato", "Plasmalyte", "Bicarbonato Sódico 1M", "Bicarbonato Sódico 1/6M", "Cloruro Potásico 2M", "Gluconato Cálcico", "Cloruro Cálcico", "Sulfato de Magnesio", "Fosfato Monopotásico", "Fosfato Monosódico", "Glicofosfato Sódico",
        "Manitol 10%", "Manitol 20%", "Albúmina 5%", "Albúmina 20%", "Hemoce", "Voluven", "Gelafundina", "Dextrano", "Poligelina",
        "Nutrición Parenteral Total", "Nutrición Parenteral Periférica", "Vitaminas IV (Soluvit/Vitalipid)", "Oligoelementos IV (Addaven)", "Lípidos IV (Smoflipid/Intralipid)", "Aminoácidos IV"
    ]},
    { category: "Oncología e Inmunología", items: [
        "Ciclofosfamida", "Metotrexato", "Fluorouracilo (5-FU)", "Capecitabina", "Citarabina", "Gemcitabina", "Doxorrubicina", "Epirrubicina", "Paclitaxel", "Docetaxel", "Vincristina", "Vinblastina", "Etopósido", "Irinotecán", "Cisplatino", "Carboplatino", "Oxaliplatino",
        "Imatinib", "Erlotinib", "Gefitinib", "Sunitinib", "Sorafenib", "Pazopanib", "Dasatinib", "Nilotinib", "Lapatinib", "Ruxolitinib",
        "Rituximab", "Trastuzumab", "Bevacizumab", "Cetuximab", "Panitumumab", "Pembrolizumab", "Nivolumab", "Ipilimumab", "Atezolizumab", "Durvalumab", "Avelumab",
        "Ciclosporina", "Tacrolimus", "Sirolimus", "Everolimus", "Micofenolato Mofetilo", "Azatioprina", "Leflunomida", "Teriflunomida", "Fingolimod", "Natalizumab", "Ocrelizumab", "Belatacept"
    ]},
    { category: "Urología, Ginecología y Antídotos", items: [
        "Tamsulosina", "Silodosina", "Terazosina (Urología)", "Finasterida", "Dutasterida", "Oxibutinina", "Solifenacina", "Tolterodina", "Mirabegrón", "Fesoterodina", "Trospio",
        "Atropina (Antídoto)", "Pralidoxima", "Azul de Metileno", "Carbón Activado", "Flumazenilo", "Naloxona", "Sugammadex", "Digibind", "Fisostigmina", "Piridoxina (Vit B6)", "Tiamina (Vit B1)", "Ácido Folínico", "Glucagón (Antídoto)", "Idarucizumab", "Andexanet Alfa", "Dantroleno", "N-Acetilcisteína (Antídoto)", "Deferoxamina", "Penicilamina", "Dimercaprol", "Edetato Cálcico Disódico"
    ]},
    { category: "Dermatología y Oftalmología", items: [
        "Betametasona (Tópica)", "Clobetasol", "Hidrocortisona (Crema)", "Mometasona (Crema)", "Mupirocina (Pomada)", "Sulfadiazina Argéntica", "Ketoconazol (Tópico)", "Permetrina", "Ivermectina (Tópica)", "Ácido Retinoico", "Peróxido de Benzoilo",
        "Timolol (Colirio)", "Latanoprost", "Brimonidina", "Dorzolamida", "Tobramicina (Oftálmica)", "Toflacina", "Dexametasona (Oftálmica)", "Ciclosporina (Oftálmica)", "Hialuronato Sódico (Lágrima)", "Pilocarpina", "Travoprost", "Bimatoprost", "Apraclonidina"
    ]},
    { category: "Miscelánea y Suplementos", items: [
        "Calcio Carbonato", "Calcio Citrato", "Magnesio Óxido", "Potasio Citrato", "Hierro Sulfato", "Vitamina D (Colecalciferol)", "Vitamina C", "Vitamina B12", "Vitamina B1", "Vitamina B6", "Multivitamínicos",
        "Warfarina (Miscelánea)", "Alopurinol", "Febuxostat", "Colchicina", "Sevelamero", "Acetato de Calcio", "Carbonato de Lantano", "Patiromer", "Ciclosilicato de Zirconio Sódico"
    ]}
];

export const STATIC_DRUGS: Drug[] = [
    {
        id: 'd1', name: 'Adrenalina', brandNames: 'Adrenalina Braun, Epinefrina', group: 'Cardiovascular / Vasopresor',
        presentation: 'Ampollas 1mg/1ml (1:1000)', indications: ['PCR', 'Anafilaxia', 'Shock Séptico'], dilution: 'Bolo IV directo (en PCR) o perfusión (0.05-0.5 mcg/kg/min).', administrationRoute: 'IV, IM, SC',
        administrationTime: 'Bolo rápido o continua.', compatibility: 'SF, SG5%. No mezclar con bicarbonato.', sideEffects: ['Taquicardia', 'Arritmias', 'Hipertensión'], monitoring: 'ECG continuo, PA invasiva, FC.',
        safetyAlert: 'FÁRMACO DE ALTO RIESGO. Doble chequeo obligatorio.', pregnancy: 'C', pharmacokinetics: { onset: 'Inmediato (IV)', peak: '1-2 min', duration: '2-10 min' }
    },
    {
        id: 'd2', name: 'Potasio Cloruro', brandNames: 'Kalium', group: 'Electrolito / Concentrado',
        presentation: 'Ampollas 10mEq/10ml (2M)', indications: ['Hipopotasemia'], dilution: 'SIEMPRE DILUIDO. Máx 40-60 mEq/L.', administrationRoute: 'IV (Vía central preferente si >10mEq/h)',
        administrationTime: 'Nunca en bolo. Máx 10-20 mEq/h.', compatibility: 'SF, SG5%.', sideEffects: ['Flebilitis', 'Arritmias graves', 'PCR por sobredosis'], monitoring: 'ECG, Ionograma, Función renal.',
        safetyAlert: 'ALTO RIESGO: MORTAL EN BOLO DIRECTO.', pregnancy: 'A', pharmacokinetics: { onset: 'Inmediato', peak: 'Fin de infusión', duration: 'Variable' }
    },
    {
        id: 'd3', name: 'Insulina Rápida', brandNames: 'Actrapid, Humulina Regular', group: 'Endocrino / Insulina',
        presentation: 'Vial 100 UI/ml', indications: ['Diabetes Mellitus', 'Hiperpotasemia', 'Cetoacidosis'], dilution: 'Bolo SC o Perfusión IV (1:1 en SF).', administrationRoute: 'SC, IV, IM',
        administrationTime: 'Según glucemia.', compatibility: 'SF.', sideEffects: ['Hipoglucemia', 'Lipodistrofia'], monitoring: 'Glucemia capilar horaria en bomba.',
        safetyAlert: 'FÁRMACO DE ALTO RIESGO. Doble chequeo.', pregnancy: 'B', pharmacokinetics: { onset: '30 min (SC) / Inm (IV)', peak: '2-3 h (SC)', duration: '6-8 h (SC)' }
    },
    {
        id: 'd4', name: 'Paracetamol', brandNames: 'Efferalgan, Perfalgan', group: 'Analgesia / Antipirético',
        presentation: 'Viales 1g/100ml, Sobres 650mg/1g', indications: ['Dolor leve-moderado', 'Fiebre'], dilution: 'Directo (IV) o reconstituido.', administrationRoute: 'IV, PO, Rectal',
        administrationTime: 'IV: 15 min.', compatibility: 'SF, SG5%.', sideEffects: ['Hepatotoxicidad (sobredosis)', 'Erupción'], monitoring: 'Función hepática en ttos largos.',
        safetyAlert: 'ESTÁNDAR. Ojo con dosis máxima 4g/día.', pregnancy: 'B', pharmacokinetics: { onset: '5-10 min (IV) / 30 min (PO)', peak: '1 h', duration: '4-6 h' }
    },
    {
        id: 'd5', name: 'Morfina', brandNames: 'Cloruro Mórfico', group: 'Analgesia / Opioide',
        presentation: 'Ampollas 10mg/1ml, 20mg/1ml', indications: ['Dolor intenso', 'Edema agudo de pulmón'], dilution: 'Diluir en 9ml de SF (1mg/ml) para bolo lento.', administrationRoute: 'IV, SC, IM, Epidural',
        administrationTime: 'Bolo lento (2-3 min) o perfusión.', compatibility: 'SF, SG5%.', sideEffects: ['Depresión respiratoria', 'Nauseas', 'Estreñimiento', 'Hipotensión'], monitoring: 'FR, SatO2, Nivel de conciencia (RASS), Dolor (EVA).',
        safetyAlert: 'ALTO RIESGO. Estupefaciente. Antídoto: Naloxona.', pregnancy: 'C', pharmacokinetics: { onset: '5-10 min (IV)', peak: '20 min', duration: '3-4 h' }
    },
    {
        id: 'd6', name: 'Furosemida', brandNames: 'Seguril', group: 'Cardiovascular / Diurético de asa',
        presentation: 'Ampollas 20mg/2ml', indications: ['Edema', 'Insuficiencia Cardiaca', 'HTA', 'Oliguria'], dilution: 'Directo o diluido en SF.', administrationRoute: 'IV, IM, PO',
        administrationTime: 'Bolo lento (máx 4mg/min) o perfusión.', compatibility: 'SF. No mezclar con soluciones ácidas.', sideEffects: ['Hipopotasemia', 'Hipotensión', 'Ototoxicidad (dosis altas)'], monitoring: 'Diuresis, TA, Ionograma (K+), Función renal.',
        safetyAlert: 'ESTÁNDAR. Proteger de la luz.', pregnancy: 'C', pharmacokinetics: { onset: '5 min (IV)', peak: '30 min', duration: '2 h' }
    },
    {
        id: 'd7', name: 'Midazolam', brandNames: 'Dormicum', group: 'Sedación / Benzodiacepina',
        presentation: 'Ampollas 5mg/5ml, 15mg/3ml', indications: ['Sedación', 'Ansiedad', 'Inducción anestésica', 'Status epiléptico'], dilution: 'Directo o diluido en SF/SG5%.', administrationRoute: 'IV, IM, SC, Rectal',
        administrationTime: 'Bolo lento or perfusión continua.', compatibility: 'SF, SG5%.', sideEffects: ['Depresión respiratoria', 'Hipotensión', 'Sedación excesiva'], monitoring: 'FR, SatO2, TA, Nivel de sedación (RASS).',
        safetyAlert: 'ALTO RIESGO. Antídoto: Flumazenilo.', pregnancy: 'D', pharmacokinetics: { onset: '1-5 min (IV)', peak: '5-15 min', duration: '2-6 h' }
    },
    {
        id: 'd8', name: 'Omeprazol', brandNames: 'Mopral, Losec', group: 'Digestivo / IBP',
        presentation: 'Viales 40mg (polvo para reconstituir)', indications: ['Profilaxis úlcera de estrés', 'HDA', 'ERGE'], dilution: 'Reconstituir con 10ml de disolvente propio.', administrationRoute: 'IV, PO',
        administrationTime: 'Bolo lento (5 min) o perfusión (20-30 min).', compatibility: 'SF, SG5%.', sideEffects: ['Cefalea', 'Diarrea', 'Hipomagnesemia (uso crónico)'], monitoring: 'Signos digestivos.',
        safetyAlert: 'ESTÁNDAR. Usar inmediatamente tras reconstituir.', pregnancy: 'C', pharmacokinetics: { onset: '30-60 min', peak: '2 h', duration: '24 h' }
    },
    {
        id: 'd9', name: 'Metoclopramida', brandNames: 'Primperan', group: 'Digestivo / Antiemético',
        presentation: 'Ampollas 10mg/2ml', indications: ['Náuseas', 'Vómitos', 'Gastroparesia'], dilution: 'Directo o diluido en 50ml SF.', administrationRoute: 'IV, IM, PO',
        administrationTime: 'Bolo lento (3-5 min) para evitar acatisia.', compatibility: 'SF, SG5%.', sideEffects: ['Acatisia', 'Somnolencia', 'Distonía'], monitoring: 'Signos extrapiramidales.',
        safetyAlert: 'ESTÁNDAR. Cuidado en ancianos.', pregnancy: 'B', pharmacokinetics: { onset: '1-3 min (IV)', peak: '1 h', duration: '1-2 h' }
    },
    {
        id: 'd10', name: 'Enoxaparina', brandNames: 'Clexane', group: 'Hematología / HBPM',
        presentation: 'Jeringas precargadas 20, 40, 60, 80, 100 mg', indications: ['Profilaxis ETEV', 'Tratamiento TVP/TEP', 'SCA'], dilution: 'Directo (precargada).', administrationRoute: 'SC (Abdominal preferente)',
        administrationTime: 'Inyección rápida.', compatibility: 'N/A.', sideEffects: ['Hemorragia', 'Trombocitopenia (HIT)', 'Hematoma en sitio inyección'], monitoring: 'Recuento plaquetario, signos de sangrado.',
        safetyAlert: 'ALTO RIESGO. No purgar aire de la jeringa.', pregnancy: 'B', pharmacokinetics: { onset: '3-5 h', peak: '3-5 h', duration: '12-24 h' }
    },
    {
        id: 'd11', name: 'Digoxina', brandNames: 'Lanacordin', group: 'Cardiovascular / Inotrópico',
        presentation: 'Ampollas 0.25mg/1ml', indications: ['Fibrilación Auricular', 'Insuficiencia Cardiaca'], dilution: 'Diluir en 4ml de SF (mínimo).', administrationRoute: 'IV, PO',
        administrationTime: 'Bolo muy lento (>5 min).', compatibility: 'SF, SG5%.', sideEffects: ['Bradicardia', 'Náuseas', 'Visión xantopsia (toxicidad)'], monitoring: 'FC (no dar si <60), ECG, Niveles plasmáticos, K+.',
        safetyAlert: 'ALTO RIESGO. Margen terapéutico estrecho.', pregnancy: 'C', pharmacokinetics: { onset: '5-30 min (IV)', peak: '1-4 h', duration: '3-4 días' }
    },
    {
        id: 'd12', name: 'Amiodarona', brandNames: 'Trangorex', group: 'Cardiovascular / Antiarrítmico',
        presentation: 'Ampollas 150mg/3ml', indications: ['FV/TV sin pulso', 'Fibrilación Auricular'], dilution: 'EXCLUSIVAMENTE EN SG5%.', administrationRoute: 'IV (Vía central preferente)',
        administrationTime: 'Bolo (en PCR) o perfusión lenta.', compatibility: 'SG5%. Incompatible con SF.', sideEffects: ['Hipotensión', 'Bradicardia', 'Flebitis (si periférica)'], monitoring: 'ECG, TA, Función tiroidea/pulmonar en ttos largos.',
        safetyAlert: 'ALTO RIESGO. Usar filtros si es posible.', pregnancy: 'D', pharmacokinetics: { onset: 'Inmediato (IV)', peak: 'Horas', duration: 'Semanas' }
    }
];

export const Pharmacology: React.FC<{initialQuery?: string}> = ({ initialQuery }) => {
    const [query, setQuery] = useState(initialQuery || '');
    const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
    const [loadingAI, setLoadingAI] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [lastSelectedItem, setLastSelectedItem] = useState<any>(null);
    const [isGeneratingInModal, setIsGeneratingInModal] = useState(false);
    const [activeSection, setActiveSection] = useState<'ADMIN' | 'PREP' | 'SAFETY' | 'PHARMA'>('ADMIN');
    const [activeTab, setActiveTab] = useState<'CATALOGO' | 'INCOMPATIBILIDADES'>('CATALOGO');
    const [customDrugs, setCustomDrugs] = useState<Drug[]>([]);
    const [showNewDrugModal, setShowNewDrugModal] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    
    const [newDrugForm, setNewDrugForm] = useState<Partial<Drug>>({
        name: '', group: 'General', brandNames: '', presentation: '', dilution: '', administrationRoute: 'IV', monitoring: '', safetyAlert: 'ESTÁNDAR', 
        indications: [], sideEffects: [], contraindications: [], storage: 'ROOM', pregnancy: 'C'
    });

    const loadCustomDrugs = async () => {
        const drugs = await DrugService.getAll();
        setCustomDrugs(drugs);
    };

    useEffect(() => { loadCustomDrugs(); }, []);

    useEffect(() => {
        if (initialQuery) {
            setQuery(initialQuery);
            handleSelectDrug({ name: initialQuery });
        }
    }, [initialQuery]);

    const baseDrugList = useMemo(() => {
        let allItems: any[] = [];
        
        RAW_DRUG_CATALOG.forEach(cat => {
            cat.items.forEach(item => {
                allItems.push({ name: item, group: cat.category, isStatic: false, type: 'CATALOG' });
            });
        });

        STATIC_DRUGS.forEach(d => {
            const existingIdx = allItems.findIndex(i => i.name.toLowerCase() === d.name.toLowerCase());
            if (existingIdx !== -1) {
                allItems[existingIdx] = { ...allItems[existingIdx], isStatic: true, drug: d, type: 'STATIC' };
            } else {
                allItems.push({ name: d.name, group: d.group, isStatic: true, drug: d, type: 'STATIC' });
            }
        });

        return allItems;
    }, []);

    const organizedList = useMemo(() => {
        const q = (query || '').toLowerCase().trim();
        
        const allItems = [...baseDrugList];
        customDrugs.forEach(d => {
            allItems.push({ name: d.name, group: d.group, isStatic: true, drug: d, type: 'CUSTOM' });
        });

        let filtered = allItems.filter(item => {
            const matchesSearch = !q || item.name.toLowerCase().includes(q) || (item.drug?.brandNames || '').toLowerCase().includes(q);
            return matchesSearch;
        }).sort((a,b) => a.name.localeCompare(b.name));

        const groups: Record<string, any[]> = {};
        filtered.forEach(item => {
            const letter = item.name.charAt(0).toUpperCase();
            if(!groups[letter]) groups[letter] = [];
            groups[letter].push(item);
        });
        return groups;
    }, [query, customDrugs, baseDrugList]);

    const flattenedList = useMemo(() => {
        const items: any[] = [];
        Object.keys(organizedList).sort().forEach(key => {
            organizedList[key].forEach(item => items.push(item));
        });
        return items;
    }, [organizedList]);

    useEffect(() => {
        if (query.length >= 3) {
            const timer = setTimeout(() => {
                const topResults = flattenedList.slice(0, 3);
                topResults.forEach(item => {
                    if (!item.drug) {
                        generateDrugDetails(item.name).catch(() => {});
                    }
                });
            }, 1500); // Debounce pre-fetching
            return () => clearTimeout(timer);
        }
    }, [query, flattenedList]);

    const handleSelectDrug = async (item: any) => {
        setLastSelectedItem(item);
        if (item.drug) { 
            setSelectedDrug(item.drug); 
            setActiveSection('ADMIN');
            setAiError(null);
            prefetchSurrounding(item.name);
            return; 
        }
        setLoadingAI(true);
        setAiError(null);
        setActiveSection('ADMIN');
        try {
            const newDrug = await generateDrugDetails(item.name);
            setSelectedDrug(newDrug);
            prefetchSurrounding(item.name);
        } catch (e: any) { 
            console.error(e);
            if (e.message === "AI_TIMEOUT") {
                setAiError("La generación de la ficha técnica está tardando más de lo habitual. Florence sigue procesando los datos.");
            } else {
                setAiError("Error de conexión con el motor de Florence AI. Por favor, inténtelo de nuevo.");
            }
        }
        finally { setLoadingAI(false); }
    };

    const prefetchSurrounding = async (currentName: string) => {
        const idx = flattenedList.findIndex(i => i.name === currentName);
        if (idx === -1) return;

        // Prefetch next
        if (idx < flattenedList.length - 1) {
            const next = flattenedList[idx + 1];
            if (!next.drug) {
                generateDrugDetails(next.name).catch(() => {}); // Fire and forget to cache
            }
        }
        // Prefetch prev
        if (idx > 0) {
            const prev = flattenedList[idx - 1];
            if (!prev.drug) {
                generateDrugDetails(prev.name).catch(() => {}); // Fire and forget to cache
            }
        }
    };

    const handleGenerateDrugWithAI = async () => {
        if (!newDrugForm.name) return;
        setIsGeneratingInModal(true);
        try {
            const result = await generateDrugDetails(newDrugForm.name);
            setNewDrugForm({
                ...result,
                name: newDrugForm.name // Maintain input name if changed
            });
        } catch (e) {
            console.error("AI Generation failed", e);
        } finally {
            setIsGeneratingInModal(false);
        }
    };

    const handleSaveNewDrug = async () => {
        if(!newDrugForm.name) return;
        const drug: Drug = {
            ...newDrugForm as Drug,
            id: `drug-${Date.now()}`,
            indications: Array.isArray(newDrugForm.indications) ? newDrugForm.indications : (newDrugForm.indications as string)?.split(',') || [],
            sideEffects: Array.isArray(newDrugForm.sideEffects) ? newDrugForm.sideEffects : (newDrugForm.sideEffects as string)?.split(',') || [],
        };
        await DrugService.add(drug);
        await loadCustomDrugs();
        setShowNewDrugModal(false);
        setNewDrugForm({ name: '', group: 'General', brandNames: '', presentation: '', dilution: '', administrationRoute: 'IV', monitoring: '', safetyAlert: 'ESTÁNDAR', indications: [], sideEffects: [] });
    };

    const handleDeleteDrug = async (id: string) => {
        if(confirm("¿Eliminar fármaco del vademécum personal?")) {
            await DrugService.delete(id);
            await loadCustomDrugs();
            setSelectedDrug(null);
        }
    };

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 500);
    };

    const getStorageIcon = (storage?: string) => {
        switch (storage) {
            case 'FRIDGE': return <ThermometerSnowflake className="w-4 h-4 text-blue-500" />;
            case 'PROTECT_LIGHT': return <Sun className="w-4 h-4 text-amber-500" />;
            default: return <Package className="w-4 h-4 text-slate-400" />;
        }
    };

    const getPregnancyColor = (cat?: string) => {
        switch (cat) {
            case 'A': return 'bg-emerald-500';
            case 'B': return 'bg-emerald-400';
            case 'C': return 'bg-amber-400';
            case 'D': return 'bg-orange-500';
            case 'X': return 'bg-rose-600';
            default: return 'bg-slate-300';
        }
    };

    return (
        <div className="flex-1 flex flex-col lg:flex-row bg-slate-100 overflow-hidden font-sans">
            <div className={`lg:w-96 bg-white border-r border-slate-200 flex-1 flex flex-col shrink-0 z-20 shadow-xl transition-all duration-300 overflow-hidden ${selectedDrug || loadingAI || activeTab === 'INCOMPATIBILIDADES' ? 'hidden lg:flex' : 'flex w-full'}`}>
                <div className="p-5 bg-slate-900 text-white sticky top-0 shadow-lg z-30">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                                <Pill className="w-4 h-4"/>
                            </div>
                            <h2 className="font-black text-xs uppercase tracking-widest text-white">
                                Vademécum PRO
                            </h2>
                        </div>
                        <button onClick={() => setShowNewDrugModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-1">
                            <Plus className="w-4 h-4"/><span className="text-[10px] font-black uppercase pr-1">Nuevo</span>
                        </button>
                    </div>

                    <div className="flex p-1 bg-slate-800 rounded-xl mb-4">
                        <button 
                            onClick={() => setActiveTab('CATALOGO')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'CATALOGO' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Catálogo
                        </button>
                        <button 
                            onClick={() => setActiveTab('INCOMPATIBILIDADES')}
                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'INCOMPATIBILIDADES' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Incompatibilidad en Y
                        </button>
                    </div>

                    {activeTab === 'CATALOGO' && (
                        <div className="relative group">
                            <Search className="absolute left-3 top-3 text-slate-500 w-4 h-4 group-focus-within:text-emerald-500 transition-colors"/>
                            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar principio activo..." className="w-full pl-10 p-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium placeholder:text-slate-500"/>
                            {query && (
                                <button onClick={() => setQuery('')} className="absolute right-3 top-3 text-slate-500 hover:text-white">
                                    <X className="w-4 h-4"/>
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50 pb-32">
                    {activeTab === 'CATALOGO' ? (
                        Object.keys(organizedList).length === 0 ? (
                            <div className="p-10 text-center">
                                <Search className="w-12 h-12 text-slate-200 mx-auto mb-3"/>
                                <p className="text-slate-400 font-bold text-sm">No se encontraron fármacos</p>
                            </div>
                        ) : (
                            Object.keys(organizedList).sort().map(key => (
                                <div key={key}>
                                    <div className="sticky top-0 bg-slate-100/95 backdrop-blur z-10 py-1.5 px-5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 mb-1 flex justify-between items-center">
                                        <span>{key}</span><span className="opacity-50">{organizedList[key].length}</span>
                                    </div>
                                    {organizedList[key].map((item, idx) => (
                                        <button key={idx} onClick={() => handleSelectDrug(item)} className={`w-full text-left p-4 hover:bg-white transition-all border-b border-slate-100 flex items-center justify-between group ${selectedDrug?.name === item.name ? 'bg-indigo-50 border-l-4 border-l-indigo-600 shadow-sm' : 'bg-transparent'}`}>
                                            <div className="min-w-0">
                                                <div className={`font-black text-sm truncate ${selectedDrug?.name === item.name ? 'text-indigo-600' : 'text-slate-800 group-hover:text-indigo-500'}`}>{item.name}</div>
                                                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight mt-0.5 truncate">{item.group}</div>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-all ${selectedDrug?.name === item.name ? 'text-indigo-600 translate-x-0' : 'text-slate-200 -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`}/>
                                        </button>
                                    ))}
                                </div>
                            ))
                        )
                    ) : (
                        <div className="p-6 text-center">
                            <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
                            <p className="text-slate-500 font-bold text-sm">Seleccione fármacos en el panel principal para comprobar su compatibilidad en Y.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={`flex-1 flex flex-col bg-slate-50 relative overflow-hidden transition-all duration-300 ${!selectedDrug && !loadingAI && activeTab !== 'INCOMPATIBILIDADES' ? 'hidden lg:flex' : 'flex'}`}>
                {activeTab === 'INCOMPATIBILIDADES' ? (
                    <IncompatibilitiesCalculator onBack={() => setActiveTab('CATALOGO')} />
                ) : loadingAI ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 animate-fade-in">
                        <div className="relative mb-6">
                            <div className="w-20 h-20 border-4 border-indigo-100 rounded-full" />
                            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <Sparkles className="w-8 h-8 text-emerald-500 absolute top-6 left-6 animate-pulse"/>
                        </div>
                        <h3 className="font-black text-slate-800 text-2xl tracking-tight">Florence está analizando...</h3>
                        <p className="text-sm text-slate-400 font-medium mt-2 text-center max-w-xs">
                            Generando ficha técnica completa, interacciones y protocolos de administración.
                        </p>
                        <div className="mt-8 flex gap-2">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                ) : aiError ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 animate-fade-in text-center">
                        <div className="bg-amber-100 p-4 rounded-full mb-6">
                            <AlertTriangle className="w-12 h-12 text-amber-600"/>
                        </div>
                        <h3 className="font-black text-slate-800 text-xl tracking-tight">Aviso del Sistema</h3>
                        <p className="text-sm text-slate-500 font-medium mt-2 max-w-sm">
                            {aiError}
                        </p>
                        <div className="mt-8 flex gap-3">
                            <button 
                                onClick={() => setSelectedDrug(null)}
                                className="px-6 py-3 bg-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-300 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => handleSelectDrug(lastSelectedItem)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                ) : selectedDrug ? (
                    <div className="flex-1 flex flex-col animate-fade-in bg-white lg:bg-slate-50 overflow-hidden">
                        <div className="bg-white border-b border-slate-200 p-4 md:p-6 sticky top-0 z-10 shadow-sm">
                            <div className="flex gap-4 items-start mb-4">
                                <button onClick={() => setSelectedDrug(null)} className="md:hidden flex items-center gap-1 p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors shadow-sm">
                                    <ChevronLeft className="w-5 h-5"/>
                                    <span className="text-[10px] font-black uppercase pr-1">Volver</span>
                                </button>
                                <button onClick={() => setSelectedDrug(null)} className="hidden md:block p-2.5 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-colors active:scale-95"><ArrowLeft className="w-5 h-5"/></button>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded border border-indigo-100 bg-indigo-50 text-indigo-700 uppercase tracking-widest">{selectedDrug.group}</span>
                                        {(selectedDrug.safetyAlert?.includes('ALTO RIESGO') || selectedDrug.safetyAlert?.includes('CRÍTICO')) && <span className="text-[9px] font-black px-2 py-0.5 rounded bg-rose-500 text-white animate-pulse">ALTO RIESGO</span>}
                                    </div>
                                    <h1 className="text-xl md:text-3xl font-black text-slate-900 leading-tight uppercase tracking-tighter truncate">{selectedDrug.name}</h1>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5 truncate">{selectedDrug.brandNames || 'Nombre comercial no registrado'}</p>
                                </div>
                                <div className="flex flex-col md:flex-row gap-2">
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <button 
                                            disabled={flattenedList.findIndex(i => i.name === selectedDrug.name) <= 0}
                                            onClick={() => {
                                                const idx = flattenedList.findIndex(i => i.name === selectedDrug.name);
                                                if (idx > 0) handleSelectDrug(flattenedList[idx - 1]);
                                            }}
                                            className="p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all active:scale-90"
                                            title="Anterior"
                                        >
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </button>
                                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                                        <button 
                                            disabled={flattenedList.findIndex(i => i.name === selectedDrug.name) >= flattenedList.length - 1}
                                            onClick={() => {
                                                const idx = flattenedList.findIndex(i => i.name === selectedDrug.name);
                                                if (idx < flattenedList.length - 1) handleSelectDrug(flattenedList[idx + 1]);
                                            }}
                                            className="p-2 text-slate-500 hover:text-indigo-600 disabled:opacity-30 transition-all active:scale-90"
                                            title="Siguiente"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handlePrint} className="p-2.5 bg-white dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-indigo-600 transition-colors shadow-sm" title="Imprimir Ficha"><FileText className="w-5 h-5"/></button>
                                        <button className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700 hover:text-yellow-500 transition-colors shadow-sm"><Star className="w-5 h-5"/></button>
                                        {selectedDrug.id?.startsWith('drug-') && <button onClick={() => handleDeleteDrug(selectedDrug.id!)} className="p-2.5 bg-rose-50 text-rose-400 rounded-xl border border-rose-100 hover:text-rose-600 transition-colors shadow-sm"><Trash2 className="w-5 h-5"/></button>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200 max-w-2xl mx-auto lg:mx-0">
                                <button onClick={() => setActiveSection('ADMIN')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'ADMIN' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <Syringe className="w-3.5 h-3.5"/><span className="hidden sm:inline">Administración</span><span className="sm:hidden">Admin</span>
                                </button>
                                <button onClick={() => setActiveSection('PREP')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'PREP' ? 'bg-white text-emerald-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <FlaskConical className="w-3.5 h-3.5"/><span className="hidden sm:inline">Preparación</span><span className="sm:hidden">Prep</span>
                                </button>
                                <button onClick={() => setActiveSection('SAFETY')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'SAFETY' ? 'bg-white text-rose-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <ShieldAlert className="w-3.5 h-3.5"/><span className="hidden sm:inline">Seguridad</span><span className="sm:hidden">Seg</span>
                                </button>
                                <button onClick={() => setActiveSection('PHARMA')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSection === 'PHARMA' ? 'bg-white text-amber-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-800'}`}>
                                    <Zap className="w-3.5 h-3.5"/><span className="hidden sm:inline">Farmacología</span><span className="sm:hidden">Pharma</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-slate-50/50 pb-32">
                            <div className="max-w-4xl mx-auto space-y-6">
                                {activeSection === 'ADMIN' && (
                                    <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
                                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                                            <div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Activity className="w-6 h-6"/></div>
                                            <div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vía Preferente</h4><p className="font-black text-slate-800 text-lg">{selectedDrug.administrationRoute}</p></div>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-4">
                                            <div className="bg-amber-50 p-3 rounded-2xl text-amber-600"><Clock className="w-6 h-6"/></div>
                                            <div><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Velocidad / Tiempo</h4><p className="font-black text-slate-800 text-lg">{selectedDrug.administrationTime}</p></div>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-full relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Monitor className="w-24 h-24 text-indigo-900"/></div>
                                            <h4 className="text-xs font-black text-indigo-700 uppercase tracking-[0.2em] mb-3 flex items-center"><Microscope className="w-4 h-4 mr-2"/> Monitorización Enfermera</h4>
                                            <p className="text-sm font-bold text-slate-700 leading-relaxed relative z-10">{selectedDrug.monitoring}</p>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-full">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Indicaciones Principales</h4>
                                            <div className="flex flex-wrap gap-2">{selectedDrug.indications?.map((ind, i) => <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-700 text-[10px] font-black rounded-xl border border-slate-200 uppercase tracking-tight">{ind}</span>)}</div>
                                        </div>
                                    </div>
                                )}
                                {activeSection === 'PREP' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
                                            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-800 rounded-full opacity-50 blur-3xl"></div>
                                            <div className="relative z-10"><h4 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] mb-3 flex items-center"><Droplets className="w-4 h-4 mr-2"/> Protocolo de Dilución</h4><p className="text-lg md:text-xl font-bold leading-snug">{selectedDrug.dilution}</p></div>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Presentación Hospitalaria</h4><p className="text-base font-black text-slate-800">{selectedDrug.presentation}</p></div>
                                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Sueros Compatibles</h4><div className="flex flex-wrap gap-3">{selectedDrug.compatibility?.split(',').map((comp, i) => <div key={i} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-2xl border border-slate-100"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-xs font-bold text-slate-600 uppercase">{comp.trim()}</span></div>)}</div></div>
                                    </div>
                                )}
                                {activeSection === 'SAFETY' && (
                                    <div className="space-y-4 animate-fade-in">
                                        <div className="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-200 border-l-[16px] border-l-rose-500 shadow-lg relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10"><AlertTriangle className="w-32 h-32 text-rose-600"/></div>
                                            <div className="relative z-10"><h4 className="text-xs font-black text-rose-700 uppercase tracking-[0.3em] mb-2 flex items-center"><ShieldAlert className="w-5 h-5 mr-2 animate-pulse"/> Alerta de Seguridad</h4><p className="text-lg font-black text-rose-900 uppercase tracking-tight">{selectedDrug.safetyAlert}</p></div>
                                        </div>
                                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Efectos Adversos (RAM)</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{selectedDrug.sideEffects?.map((eff, i) => <div key={i} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-300"></div><span className="text-[10px] font-bold text-slate-600 uppercase truncate">{eff}</span></div>)}</div>
                                        </div>
                                    </div>
                                )}
                                {activeSection === 'PHARMA' && (
                                    <div className="grid md:grid-cols-3 gap-4 animate-fade-in">
                                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                            <div className="bg-amber-50 p-3 rounded-full text-amber-600 mb-3"><Timer className="w-6 h-6"/></div>
                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Inicio (Onset)</h4>
                                            <p className="font-black text-slate-800">{selectedDrug.pharmacokinetics?.onset || 'N/D'}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                            <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 mb-3"><Activity className="w-6 h-6"/></div>
                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pico (Peak)</h4>
                                            <p className="font-black text-slate-800">{selectedDrug.pharmacokinetics?.peak || 'N/D'}</p>
                                        </div>
                                        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                                            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600 mb-3"><Clock className="w-6 h-6"/></div>
                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Duración</h4>
                                            <p className="font-black text-slate-800">{selectedDrug.pharmacokinetics?.duration || 'N/D'}</p>
                                        </div>
                                        
                                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-full">
                                            <h4 className="text-xs font-black text-rose-500 uppercase tracking-[0.2em] mb-4 flex items-center"><Ban className="w-4 h-4 mr-2"/> Contraindicaciones</h4>
                                            <ul className="space-y-2">
                                                {selectedDrug.contraindications?.map((c, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-600 bg-rose-50/30 p-3 rounded-xl border border-rose-100/50">
                                                        <X className="w-4 h-4 text-rose-400 shrink-0"/> {c}
                                                    </li>
                                                ))}
                                                {(!selectedDrug.contraindications || selectedDrug.contraindications.length === 0) && <li className="text-sm text-slate-400 italic">No se han registrado contraindicaciones específicas.</li>}
                                            </ul>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 col-span-full">
                                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Embarazo</h4>
                                                    <p className="text-2xl font-black text-slate-800">Categoría {selectedDrug.pregnancy || 'N/D'}</p>
                                                </div>
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg ${getPregnancyColor(selectedDrug.pregnancy)}`}>
                                                    {selectedDrug.pregnancy || '?'}
                                                </div>
                                            </div>
                                            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Almacenamiento</h4>
                                                    <p className="text-sm font-black text-slate-800 uppercase">
                                                        {selectedDrug.storage === 'FRIDGE' ? 'Refrigerado (2-8°C)' : 
                                                         selectedDrug.storage === 'PROTECT_LIGHT' ? 'Proteger de la luz' : 'Temperatura Ambiente'}
                                                    </p>
                                                </div>
                                                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                                                    {getStorageIcon(selectedDrug.storage)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-8 select-none bg-slate-50/50">
                        <div className="relative mb-6">
                            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-xl border border-slate-100"><Pill className="w-14 h-14 text-slate-200"/></div>
                            <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-3 rounded-2xl shadow-lg animate-bounce"><Search className="w-5 h-5"/></div>
                        </div>
                        <h3 className="font-black text-2xl uppercase tracking-tighter text-slate-400">Vademécum Profesional</h3>
                        <p className="text-sm font-medium text-slate-400 mt-2 max-w-xs text-center">Búsqueda avanzada habilitada en +600 fármacos de uso hospitalario v22.</p>
                    </div>
                )}
            </div>

            {showNewDrugModal && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up">
                        <div className="bg-slate-900 p-6 flex justify-between items-center shrink-0 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-xl shadow-emerald-900/20"><Plus className="w-6 h-6"/></div>
                                <div><h3 className="text-xl font-black text-white tracking-tight">Registro de Fármaco PRO</h3><p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Soporte IA para ficha técnica</p></div>
                            </div>
                            <button onClick={() => setShowNewDrugModal(false)} className="text-slate-400 hover:text-white bg-slate-800 p-2.5 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex-1 w-full">
                                    <label className="text-[10px] font-black text-indigo-500 uppercase block mb-2 tracking-widest">Principio Activo</label>
                                    <input value={newDrugForm.name} onChange={e => setNewDrugForm({...newDrugForm, name: e.target.value})} className="w-full bg-white border-2 border-slate-100 rounded-2xl p-4 text-base font-bold outline-none focus:border-indigo-500/30 transition-all shadow-sm" placeholder="Ej: Meropenem"/>
                                </div>
                                <button 
                                    onClick={handleGenerateDrugWithAI} 
                                    disabled={!newDrugForm.name || isGeneratingInModal}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                                >
                                    {isGeneratingInModal ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>}
                                    MAGIA IA (COMPLETAR FICHA)
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 opacity-90">
                                <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Familia</label><input value={newDrugForm.group} onChange={e => setNewDrugForm({...newDrugForm, group: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" placeholder="Antibiótico"/></div>
                                <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Comercial</label><input value={newDrugForm.brandNames} onChange={e => setNewDrugForm({...newDrugForm, brandNames: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" placeholder="Marca"/></div>
                                <div className="col-span-full"><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Dilución y Administración</label><textarea value={newDrugForm.dilution} onChange={e => setNewDrugForm({...newDrugForm, dilution: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium h-24 outline-none resize-none" placeholder="Protocolo..."/></div>
                                <div>
                                    <label className="text-[10px] font-black text-rose-500 uppercase block mb-2">Riesgo</label>
                                    <select value={newDrugForm.safetyAlert} onChange={e => setNewDrugForm({...newDrugForm, safetyAlert: e.target.value})} className="w-full bg-rose-50 border border-rose-100 rounded-xl p-3 text-sm font-bold text-rose-700 outline-none">
                                        <option value="ESTÁNDAR">Riesgo Estándar</option>
                                        <option value="ALTO RIESGO">⚠️ ALTO RIESGO</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-amber-500 uppercase block mb-2">Embarazo</label>
                                    <select value={newDrugForm.pregnancy} onChange={e => setNewDrugForm({...newDrugForm, pregnancy: e.target.value as any})} className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm font-bold text-amber-700 outline-none">
                                        <option value="A">Categoría A</option>
                                        <option value="B">Categoría B</option>
                                        <option value="C">Categoría C</option>
                                        <option value="D">Categoría D</option>
                                        <option value="X">Categoría X</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Almacenamiento</label>
                                    <select value={newDrugForm.storage} onChange={e => setNewDrugForm({...newDrugForm, storage: e.target.value as any})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none">
                                        <option value="ROOM">Ambiente</option>
                                        <option value="FRIDGE">Nevera (2-8°C)</option>
                                        <option value="PROTECT_LIGHT">Proteger Luz</option>
                                    </select>
                                </div>
                                <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Monitorización</label><input value={newDrugForm.monitoring} onChange={e => setNewDrugForm({...newDrugForm, monitoring: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" placeholder="Signos..."/></div>
                                <div className="col-span-full grid grid-cols-3 gap-4">
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Inicio (Onset)</label><input value={newDrugForm.pharmacokinetics?.onset || ''} onChange={e => setNewDrugForm({...newDrugForm, pharmacokinetics: {...newDrugForm.pharmacokinetics, onset: e.target.value, peak: newDrugForm.pharmacokinetics?.peak || '', duration: newDrugForm.pharmacokinetics?.duration || ''}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" placeholder="Ej: 5 min"/></div>
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Pico (Peak)</label><input value={newDrugForm.pharmacokinetics?.peak || ''} onChange={e => setNewDrugForm({...newDrugForm, pharmacokinetics: {...newDrugForm.pharmacokinetics, peak: e.target.value, onset: newDrugForm.pharmacokinetics?.onset || '', duration: newDrugForm.pharmacokinetics?.duration || ''}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" placeholder="Ej: 30 min"/></div>
                                    <div><label className="text-[10px] font-black text-slate-400 uppercase block mb-2">Duración</label><input value={newDrugForm.pharmacokinetics?.duration || ''} onChange={e => setNewDrugForm({...newDrugForm, pharmacokinetics: {...newDrugForm.pharmacokinetics, duration: e.target.value, onset: newDrugForm.pharmacokinetics?.onset || '', peak: newDrugForm.pharmacokinetics?.peak || ''}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold outline-none" placeholder="Ej: 4-6 h"/></div>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
                            <button onClick={handleSaveNewDrug} className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"><Save className="w-5 h-5 text-emerald-400"/> GUARDAR EN SISTEMA</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};