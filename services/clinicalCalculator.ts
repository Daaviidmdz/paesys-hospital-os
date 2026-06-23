
import { Patient } from '../types';

/**
 * CLINICAL CALCULATOR SERVICE
 * 
 * Centralizes logic for medical scores (NEWS2, GCS, Braden, etc.)
 * and generates proactive recommendations based on values.
 */

export const ClinicalCalculator = {

    // --- SCORING ALGORITHMS ---

    calculateNEWS2: (vitals: { rr: number, sat: number, o2: boolean, sbp: number, hr: number, temp: number, gcs: string }): number => {
        let score = 0;
        const { rr, sat, o2, sbp, hr, temp, gcs } = vitals;

        // RR
        if (rr <= 8 || rr >= 25) score += 3;
        else if (rr >= 21) score += 2;
        else if (rr >= 9 && rr <= 11) score += 1;

        // Sat
        if (sat <= 91) score += 3;
        else if (sat >= 92 && sat <= 93) score += 2;
        else if (sat >= 94 && sat <= 95) score += 1;

        // O2
        if (o2) score += 2;

        // SBP
        if (sbp <= 90 || sbp >= 220) score += 3;
        else if (sbp >= 91 && sbp <= 100) score += 2;
        else if (sbp >= 101 && sbp <= 110) score += 1;

        // HR
        if (hr <= 40 || hr >= 131) score += 3;
        else if (hr >= 111 && hr <= 130) score += 2;
        else if (hr >= 41 && hr <= 50) score += 1;

        // GCS (simplified: if not Alert, +3)
        if (gcs !== '15' && gcs !== 'Alert') score += 3;

        // Temp
        if (temp <= 35.0) score += 3;
        else if (temp >= 39.1) score += 2;
        else if ((temp >= 35.1 && temp <= 36.0) || (temp >= 38.1 && temp <= 39.0)) score += 1;

        return score;
    },

    calculateGCS: (eye: number, verbal: number, motor: number): number => {
        return eye + verbal + motor;
    },

    // --- PROACTIVE RECOMMENDATIONS ---

    getRecommendations: (data: { 
        news2: number, 
        pain: number, 
        fr: number, 
        sat: number,
        gcs: number 
    }): string[] => {
        const recs: string[] = [];

        // 1. DETERIORO (NEWS2)
        if (data.news2 >= 7) {
            recs.push("🚨 ALERTA ROJA: Activar Equipo de Emergencia Médica (MET). Monitorización continua.");
        } else if (data.news2 >= 5) {
            recs.push("⚠️ ALERTA NARANJA: Avisar a médico responsable urgente. Valorar sepsis.");
        }

        // 2. DOLOR (EVA) - "Si sube de 0 a 2..." (Assuming current is > 3 for action)
        if (data.pain >= 4) {
            recs.push("💊 DOLOR NO CONTROLADO: Administrar analgesia de rescate y reevaluar en 30 min.");
        } else if (data.pain > 0) {
            recs.push("ℹ️ Confort: Valorar medidas no farmacológicas.");
        }

        // 3. RESPIRATORIO
        if (data.fr > 24) {
            recs.push("🫁 TAQUIPNEA: Realizar gasometría arterial. Valorar fatiga muscular.");
        }
        if (data.sat < 92) {
            recs.push("🌬️ HIPOXIA: Iniciar oxigenoterapia según protocolo. Objetivo >94%.");
        }

        // 4. NEURO
        if (data.gcs < 9) {
            recs.push("🧠 COMA: Valorar protección de vía aérea (IOT).");
        }

        return recs;
    }
};
