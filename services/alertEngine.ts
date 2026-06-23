import { Patient, ClinicalAlert, AlertLevel } from '../types';

/**
 * SAFETY ENGINE v1.0
 * 
 * Centralized logic for patient safety.
 * Analyzes patient state and generates real-time alerts.
 */

export const SafetyEngine = {
    
    // Main Evaluate Function
    evaluatePatient: (patient: Patient): ClinicalAlert[] => {
        const alerts: ClinicalAlert[] = [];

        // 1. VITAL SIGNS ANALYSIS
        if (patient.vitals) {
            const fc = parseInt(patient.vitals.fc);
            const sat = parseInt(patient.vitals.sat);
            const sbp = parseInt(patient.vitals.ta?.split('/')[0] || '120');

            // Critical Hypoxia
            if (sat < 90) {
                alerts.push(createAlert(patient, 'CRITICAL', 'VITALS', 'Hipoxia Crítica', `SatO2 ${sat}%. Riesgo insuficiencia respiratoria.`));
            } else if (sat < 94) {
                alerts.push(createAlert(patient, 'WARNING', 'VITALS', 'Desaturación', `SatO2 ${sat}%. Vigilar.`));
            }

            // Shock / Hemodynamics
            if (sbp < 90) {
                alerts.push(createAlert(patient, 'CRITICAL', 'VITALS', 'Hipotensión Severa', `TAS ${sbp} mmHg. Posible Shock.`));
            }
            if (fc > 130) {
                alerts.push(createAlert(patient, 'WARNING', 'VITALS', 'Taquicardia', `FC ${fc} lpm. Valorar dolor/fiebre.`));
            }
        }

        // 2. NEWS2 SCORE
        if (patient.news2 && patient.news2 >= 7) {
            const alteredConstant = getAlteredConstant(patient);
            alerts.push(createAlert(patient, 'CRITICAL', 'VITALS', alteredConstant || 'Deterioro Crítico', `NEWS2 Score: ${patient.news2}. Activar Equipo Emergencia.`));
        } else if (patient.news2 && patient.news2 >= 5) {
            const alteredConstant = getAlteredConstant(patient);
            alerts.push(createAlert(patient, 'WARNING', 'VITALS', alteredConstant || 'Riesgo Elevado', `NEWS2 Score: ${patient.news2}. Aumentar frecuencia monitorización.`));
        }

        // 3. DEVICES & INFECTION CONTROL (72h Rules)
        if (patient.activeDevices && Array.isArray(patient.activeDevices)) {
            const now = new Date();
            
            patient.activeDevices.forEach(device => {
                if (device.status === 'ACTIVE') {
                    // Peripheral Line > 72h
                    if (device.type === 'VVP' && device.insertionDate) {
                        const inserted = new Date(device.insertionDate);
                        const hoursDiff = (now.getTime() - inserted.getTime()) / (1000 * 60 * 60);
                        if (hoursDiff > 72) {
                            alerts.push(createAlert(patient, 'WARNING', 'DEVICE', 'Vía Caducada', `VVP insertada hace ${Math.floor(hoursDiff)}h. Protocolo de cambio.`));
                        }
                    }

                    // Bladder Catheter Check
                    if (device.type === 'SV') {
                        alerts.push(createAlert(patient, 'INFO', 'DEVICE', 'Revisar Sonda', 'Verificar permeabilidad y bolsa colectora.'));
                    }
                }
            });
        }

        // 4. MEDICATION SAFETY
        if (patient.nextMedicationTime) {
            if (patient.nextMedicationTime.includes('min')) {
                 alerts.push(createAlert(patient, 'INFO', 'MEDS', 'Medicación Pendiente', `Dosis programada en ${patient.nextMedicationTime}.`));
            }
        }

        // 5. FLUID BALANCE
        if (patient.fluidBalance24h !== undefined) {
            if (patient.fluidBalance24h < -1000) {
                alerts.push(createAlert(patient, 'WARNING', 'BALANCE', 'Deshidratación', 'Balance hídrico muy negativo (-1000ml).'));
            } else if (patient.fluidBalance24h > 1500 && (patient.diagnosis || '').includes('ICC')) {
                alerts.push(createAlert(patient, 'CRITICAL', 'BALANCE', 'Sobrecarga Volumen', 'Balance +1500ml en paciente cardiaco.'));
            }
        }

        return alerts;
    },

    // Global Evaluation (Unit Status)
    evaluateUnit: (patients: Patient[]): ClinicalAlert[] => {
        let allAlerts: ClinicalAlert[] = [];
        if(!Array.isArray(patients)) return [];
        patients.forEach(p => {
            allAlerts = [...allAlerts, ...SafetyEngine.evaluatePatient(p)];
        });
        const priority: Record<AlertLevel, number> = { 'CRITICAL': 3, 'WARNING': 2, 'INFO': 1 };
        return allAlerts.sort((a, b) => priority[b.level] - priority[a.level]);
    }
};

// Helper to identify the most altered constant
const getAlteredConstant = (patient: Patient): string | null => {
    if (!patient.vitals) return null;
    const sat = parseInt(patient.vitals.sat);
    const fc = parseInt(patient.vitals.fc);
    const ta = patient.vitals.ta || '';
    const sbp = parseInt(ta.split('/')[0] || '120');
    const dbp = parseInt(ta.split('/')[1] || '80');

    if (sat < 90) return `SatO2 ${sat}%`;
    if (sbp < 90) return `TA ${sbp}/${dbp}`;
    if (fc > 130) return `FC ${fc} lpm`;
    if (fc < 40) return `FC ${fc} lpm`;
    return null;
};

// Helper
const createAlert = (
    patient: Patient, 
    level: AlertLevel, 
    category: any, 
    title: string, 
    message: string
): ClinicalAlert => {
    return {
        id: `alert-${patient.id}-${Date.now()}-${Math.random()}`,
        patientId: patient.id,
        patientName: patient.name,
        level,
        category,
        title,
        message,
        timestamp: new Date().toISOString(),
        acknowledged: false
    };
};