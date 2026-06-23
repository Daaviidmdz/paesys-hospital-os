
/**
 * Global Configuration
 * 
 * Centralizes environment variables and application settings.
 * Adapts to both Vite (Client) and potential SSR/Node environments.
 */

// Helper to safely get env vars in Vite or Node
const getEnv = (key: string): string => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
    return (import.meta as any).env[key] || '';
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const isProduction = getEnv('NODE_ENV') === 'production';

export const config = {
  // Application Information
  appName: 'Enfermería PAE - Proyecto Vivo',
  version: '21.0',

  // API Configuration
  // Points to the Backend API (Railway/Render)
  apiUrl: getEnv('VITE_API_URL') || 'http://localhost:3000',

  // Firebase Configuration (Production)
  // Fill these variables in Vercel/Netlify Dashboard
  firebase: {
    apiKey: getEnv('VITE_FIREBASE_API_KEY'),
    authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
    storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    appId: getEnv('VITE_FIREBASE_APP_ID')
  },

  // Feature Flags
  features: {
    useMockData: !isProduction, // Use mock data in dev, real API in prod
    enableAnalytics: isProduction,
  },

  // Note: Gemini API Key is handled in `geminiService.ts` directly via `process.env`
  // as per strict SDK guidelines, so it is not exported here to avoid leakage.
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('paesys_auth_token');
};
