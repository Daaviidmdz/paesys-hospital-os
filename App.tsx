import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Pathologies } from './components/Pathologies';
import { Calculators } from './components/Calculators';
import { Assistant } from './components/Assistant';
import { Glossary } from './components/Glossary';
import { GlobalSearch } from './components/GlobalSearch';
import { Pharmacology } from './components/Pharmacology';
import { NursingProcedures } from './components/NursingProcedures';
import { ClinicalFollowUp } from './components/ClinicalFollowUp';
import { Login } from './components/Login';
import { Settings } from './components/Settings';
import { TeamChat } from './components/TeamChat';
import { ViewState, ViewParams, User } from './types';
import { AuthService } from './services/firebaseMock';
import { auth, db } from './services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [viewParams, setViewParams] = useState<ViewParams>({});
  const [viewHistory, setViewHistory] = useState<ViewState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load Session and Theme
  useEffect(() => {
      // 1. Session check - Actual connection to Firebase Auth
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          if (fbUser) {
              try {
                  const docSnap = await getDoc(doc(db, 'staff', fbUser.uid));
                  if (docSnap.exists()) {
                      const u = docSnap.data() as User;
                      setCurrentUser(u);
                      setIsLoggedIn(true);
                  } else {
                      // fallback for newly signed in via not socialLogin method, though shouldn't happen 
                      const newStaff: User = {
                          id: fbUser.uid, 
                          email: fbUser.email || '', 
                          name: fbUser.displayName || 'Usuario', 
                          role: 'NURSE', 
                          provider: 'GOOGLE',
                          avatar: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || 'U')}&background=0D9488&color=fff`,
                          unit: 'General', 
                          collegiateNumber: 'PENDIENTE',
                          lastLogin: new Date().toISOString()
                      };
                      await setDoc(doc(db, 'staff', fbUser.uid), newStaff);
                      setCurrentUser(newStaff);
                      setIsLoggedIn(true);
                  }
              } catch (e) {
                  console.error("Auth error", e);
                  setIsLoggedIn(false);
              }
          } else {
              setCurrentUser(null);
              setIsLoggedIn(false);
          }
          setIsLoading(false);
      });
      
      // 2. Theme Preference
      const savedTheme = localStorage.getItem('paesys_theme') as 'light' | 'dark';
      if (savedTheme) {
          setTheme(savedTheme);
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
          setTheme('dark');
      }

      return () => unsubscribe();
  }, []);

  // Apply Theme Class
  useEffect(() => {
      if (theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('paesys_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (user: User) => {
      // Login form will use AuthService.socialLogin, then onAuthStateChanged will pick it up.
      // But we can trigger immediate state update if needed.
      setIsLoggedIn(true);
      setCurrentUser(user);
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleLogout = async () => {
      await AuthService.logout();
      window.location.reload();
  };

  const handleUpdateUser = async (updatedUser: User) => {
      setCurrentUser(updatedUser);
      await AuthService.updateProfile(updatedUser);
  };

  const handleNavigate = (view: ViewState, params?: ViewParams) => {
      if (view !== currentView) {
          setViewHistory(prev => [...prev, currentView]);
      }
      if (params) setViewParams(params);
      else setViewParams({}); 
      setCurrentView(view);
  };

  const handleBack = () => {
      if (viewHistory.length > 0) {
          const prevView = viewHistory[viewHistory.length - 1];
          setViewHistory(prev => prev.slice(0, -1));
          setCurrentView(prevView);
          setViewParams({});
      } else {
          setCurrentView(ViewState.DASHBOARD);
      }
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
              e.preventDefault();
              handleNavigate(ViewState.SEARCH);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard onNavigate={handleNavigate} />;
      case ViewState.PATHOLOGIES:
        return <Pathologies initialQuery={viewParams.query} initialCategory={viewParams.category} onNavigate={handleNavigate} />;
      case ViewState.PHARMACOLOGY:
        return <Pharmacology initialQuery={viewParams.query} />;
      case ViewState.CALCULATORS:
        return <Calculators initialTool={viewParams.tool} patientId={viewParams.patientId} />;
      case ViewState.ASSISTANT:
        return <Assistant onNavigate={handleNavigate} />;
      case ViewState.GLOSSARY:
        return <Glossary initialTerm={viewParams.query} />; // Actualizado para recibir el término inicial
      case ViewState.PROCEDURES:
        return <NursingProcedures />;
      case ViewState.FOLLOWUP:
        return <ClinicalFollowUp initialPatientId={viewParams.patientId} onNavigate={handleNavigate} />;
      case ViewState.SEARCH:
        return <GlobalSearch onNavigate={handleNavigate} />;
      case ViewState.CHAT:
        return <TeamChat currentUser={currentUser!} onClose={() => handleNavigate(ViewState.DASHBOARD)} initialQuery={viewParams.query} onAction={handleNavigate} />;
      case ViewState.SETTINGS:
        return <Settings 
            currentUser={currentUser} 
            onUpdateUser={handleUpdateUser} 
            theme={theme}
            toggleTheme={toggleTheme}
            onLogout={handleLogout}
        />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  if (isLoading) {
      return <div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // La lógica de !isLoggedIn se mantiene por integridad estructural pero el estado inicial ahora es siempre true
  if (!isLoggedIn) {
      return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      onChangeView={(v, params) => handleNavigate(v, params)}
      onBack={handleBack}
      currentUser={currentUser}
    >
      {renderView()}
    </Layout>
  );
};

export default App;