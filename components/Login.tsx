
import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight, Stethoscope, ShieldCheck, Activity, Mail, UserPlus, LogIn, Check, AlertCircle, Building2, ScanFace, Fingerprint } from 'lucide-react';
import { logger } from '../services/logger';
import { AuthService } from '../services/firebaseMock';
import { User } from '../types';

interface LoginProps {
    onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState(''); // Only for register
    const [errorMsg, setErrorMsg] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        try {
            let user: User;
            if (isRegistering) {
                if (!name || !email || !password) throw new Error("Todos los campos son obligatorios.");
                if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres.");
                
                user = await AuthService.register(email, password, name);
                logger.audit('REGISTER_SUCCESS', user.id, { email });
            } else {
                user = await AuthService.login(email, password);
                logger.audit('LOGIN_SUCCESS', user.id, { email });
            }
            
            onLogin(user);
        } catch (err: any) {
            setErrorMsg(err.message);
            logger.warn('AuthService', 'Auth failed', { error: err.message });
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'GOOGLE' | 'APPLE') => {
        setIsLoading(true);
        try {
            // Artificial delay to simulate OAuth popup
            const user = await AuthService.socialLogin(provider);
            logger.audit('SOCIAL_LOGIN', user.id, { provider });
            onLogin(user);
        } catch (err: any) {
            setErrorMsg(err.message || "Error conectando con proveedor.");
            setIsLoading(false);
        }
    };

    const handleBiometric = async () => {
        setIsLoading(true);
        // Simulate FaceID success
        setTimeout(async () => {
            try {
                // Mock login for demo purpose - usually retrieves token from secure storage
                const user = await AuthService.login('admin@paesys.com', 'admin'); 
                onLogin(user);
            } catch(e) { setIsLoading(false); }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none"></div>

            <div className="bg-white w-full max-w-5xl min-h-[600px] rounded-3xl shadow-2xl flex overflow-hidden relative z-10 animate-fade-in-up flex-col lg:flex-row">
                
                {/* Left Side: Brand & Visuals */}
                <div className="hidden lg:flex w-1/2 bg-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-tr from-emerald-600 to-teal-500 p-2.5 rounded-xl shadow-lg shadow-emerald-900/50">
                                <Stethoscope className="w-6 h-6 text-white"/>
                            </div>
                            <h1 className="font-black text-2xl tracking-tight text-white leading-none">PAE<span className="text-emerald-500">SYS</span> <span className="text-xs block text-slate-500 font-normal tracking-widest uppercase mt-1">Hospital OS v21.0</span></h1>
                        </div>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                            Portal exclusivo para personal sanitario. Acceso seguro a historia clínica electrónica, vademécum y soporte a la decisión.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex flex-col gap-3 text-sm font-bold text-slate-300">
                            <div className="flex items-center"><ShieldCheck className="w-5 h-5 mr-3 text-emerald-500"/> Área Profesional Segura</div>
                            <div className="flex items-center"><Building2 className="w-5 h-5 mr-3 text-indigo-500"/> Acceso Corporativo</div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-1 w-12 bg-emerald-600 rounded-full"></div>
                            <div className="h-1 w-4 bg-slate-700 rounded-full"></div>
                            <div className="h-1 w-4 bg-slate-700 rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Auth Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white relative">
                    <div className="max-w-sm mx-auto w-full">
                        
                        {/* Header Mobile Only */}
                        <div className="lg:hidden mb-8 flex items-center gap-2">
                            <div className="bg-emerald-600 p-1.5 rounded-lg"><Stethoscope className="w-4 h-4 text-white"/></div>
                            <span className="font-black text-xl text-slate-800">PAESYS PRO</span>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-xl mb-8 shadow-inner">
                            <button onClick={() => {setIsRegistering(false); setErrorMsg('');}} className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center ${!isRegistering ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                <LogIn className="w-3.5 h-3.5 mr-2"/> Acceso Staff
                            </button>
                            <button onClick={() => {setIsRegistering(true); setErrorMsg('');}} className={`flex-1 py-2.5 text-xs font-bold uppercase rounded-lg transition-all flex items-center justify-center ${isRegistering ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700'}`}>
                                <UserPlus className="w-3.5 h-3.5 mr-2"/> Nuevo Alta
                            </button>
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{isRegistering ? 'Alta Profesional' : 'Identificación'}</h2>
                        <p className="text-slate-500 mb-8 font-medium text-sm">
                            {isRegistering ? 'Registro de personal sanitario autorizado.' : 'Introduce tus credenciales corporativas.'}
                        </p>

                        <form onSubmit={handleAuth} className="space-y-4">
                            
                            {isRegistering && (
                                <div className="animate-fade-in-up">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Nombre Completo</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"/>
                                        <input 
                                            type="text" 
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-sm text-slate-700 transition-all placeholder:text-slate-300"
                                            placeholder="Ej: Enf. Pablo García"
                                            required={isRegistering}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Correo Institucional</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"/>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-sm text-slate-700 transition-all placeholder:text-slate-300"
                                        placeholder="usuario@uax.es"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors"/>
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-sm text-slate-700 transition-all placeholder:text-slate-300"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {errorMsg && (
                                <div className="text-xs font-bold text-rose-600 bg-rose-50 p-3 rounded-xl flex items-center animate-pulse border border-rose-100">
                                    <AlertCircle className="w-4 h-4 mr-2"/> {errorMsg}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group mt-4"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {isRegistering ? 'SOLICITAR ALTA' : 'ACCEDER AL SISTEMA'} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"/>
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Mobile Biometric Quick Login */}
                        <div className="md:hidden mt-6 flex justify-center">
                            <button onClick={handleBiometric} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all flex flex-col items-center gap-1">
                                {isLoading ? <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div> : <ScanFace className="w-8 h-8 text-indigo-600"/>}
                                <span className="text-[10px] font-bold uppercase">Face ID</span>
                            </button>
                        </div>

                        <div className="flex items-center gap-4 my-8">
                            <div className="h-px bg-slate-200 flex-1"></div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Acceso Rápido Corporativo</span>
                            <div className="h-px bg-slate-200 flex-1"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => handleSocialLogin('GOOGLE')} type="button" className="flex items-center justify-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-bold text-slate-600 group active:scale-95 bg-white shadow-sm">
                                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google Staff
                            </button>
                            <button onClick={() => handleSocialLogin('APPLE')} type="button" className="flex items-center justify-center py-3 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-xs font-bold text-slate-600 group active:scale-95 bg-white shadow-sm">
                                <svg className="w-4 h-4 mr-2 fill-current text-slate-900" viewBox="0 0 24 24">
                                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.62 4.37-1.32 1.56.24 2.59.85 3.54 2.4-3.17 1.75-2.38 5.5 1.25 7.11-.63 1.54-1.6 3.08-2.99 4.04h.01M13 5.3c.56-1.59 2.52-2.4 3.79-2.3-1.02 2.3-4.48 2.36-3.79 2.3z"/>
                                </svg>
                                Apple ID
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 text-center w-full text-[10px] text-slate-500 font-bold opacity-50 flex flex-col gap-1">
                <span>PAESYS Health Technologies © 2024 • Acceso restringido • Uso profesional exclusivo</span>
                <span>Creado por David Alfonso Isla y Daniel Serrano De Pablo</span>
            </div>
        </div>
    );
};
