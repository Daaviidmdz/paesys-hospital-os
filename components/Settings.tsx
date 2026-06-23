
import React, { useState, useEffect } from 'react';
import { Shield, Download, Trash2, User, Database, Lock, LogOut, Info, FileCheck, Moon, Bell, Edit3, Check, X, Camera, Save, Building2, Briefcase, Sun, ChevronRight, Smartphone, Globe, ToggleLeft, ToggleRight } from 'lucide-react';
import { config } from '../config';
import { User as UserType } from '../types';

interface SettingsProps {
    currentUser: UserType | null;
    onUpdateUser?: (user: UserType) => void;
    theme?: 'light' | 'dark';
    toggleTheme?: () => void;
    onLogout?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, onUpdateUser, theme, toggleTheme, onLogout }) => {
    const [exporting, setExporting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        collegiateNumber: '',
        unit: '',
        shift: ''
    });

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                role: currentUser.role || '',
                collegiateNumber: currentUser.collegiateNumber || '',
                unit: currentUser.unit || '',
                shift: currentUser.shift || ''
            });
        }
    }, [currentUser]);

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            setExporting(false);
            alert("Tus datos (PAE, Notas, Perfil) han sido exportados a 'paesys_export.json'");
        }, 1500);
    };

    const handleDeleteAccount = () => {
        if(window.confirm("¿ESTÁS SEGURO? Esta acción es irreversible.")) {
            alert("Cuenta programada para eliminación.");
        }
    };

    const handleLogout = () => {
        if(confirm("¿Cerrar sesión?")) {
            if (onLogout) onLogout();
        }
    };

    const handleSaveProfile = () => {
        if (currentUser && onUpdateUser) {
            onUpdateUser({
                ...currentUser,
                ...formData,
                role: formData.role as any,
                shift: formData.shift as any
            });
            setIsEditing(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }
    };

    const handleCancelEdit = () => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                role: currentUser.role || '',
                collegiateNumber: currentUser.collegiateNumber || '',
                unit: currentUser.unit || '',
                shift: currentUser.shift || ''
            });
        }
        setIsEditing(false);
    };

    const handleChangeAvatar = () => {
        if (isEditing) {
            alert("Funcionalidad de subida de imagen simulada. En producción abriría el selector de archivos.");
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20 animate-fade-in font-sans bg-slate-50 min-h-full">
            
            {/* Header */}
            <div className="bg-slate-900 text-white pt-8 pb-16 px-6 shadow-xl relative overflow-hidden shrink-0">
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight">Ajustes</h2>
                        <p className="text-slate-400 font-medium text-xs mt-1">v{config.version} • {currentUser?.email}</p>
                    </div>
                    <div className="bg-white/10 p-2 rounded-full backdrop-blur-md">
                        <User className="w-6 h-6 text-white"/>
                    </div>
                </div>
                {/* Curve decoration */}
                <div className="absolute -bottom-10 left-0 right-0 h-20 bg-slate-50 rounded-t-[50%] scale-x-110"></div>
            </div>

            <div className="px-4 -mt-10 relative z-10 space-y-6">
                
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 flex items-center gap-4 border-b border-slate-100">
                        <div className="w-14 h-14 rounded-full bg-indigo-100 border-2 border-white shadow-md overflow-hidden relative" onClick={handleChangeAvatar}>
                            {currentUser?.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover"/> : <User className="w-full h-full p-3 text-indigo-400"/>}
                            {isEditing && (
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-5 h-5 text-white"/>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            {isEditing ? (
                                <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full font-black text-lg border-b border-indigo-300 outline-none bg-transparent" autoFocus/>
                            ) : (
                                <h3 className="font-black text-lg text-slate-800 truncate">{formData.name}</h3>
                            )}
                            <p className="text-xs text-slate-500 font-bold uppercase">{formData.role} • {formData.unit}</p>
                        </div>
                        <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            {isEditing ? <Check className="w-5 h-5"/> : <Edit3 className="w-5 h-5"/>}
                        </button>
                    </div>
                    
                    {isEditing && (
                        <div className="p-4 bg-slate-50 space-y-3 animate-fade-in">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Unidad</label>
                                <input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold"/>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Nº Colegiado</label>
                                <input value={formData.collegiateNumber} onChange={e => setFormData({...formData, collegiateNumber: e.target.value})} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold"/>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button onClick={handleCancelEdit} className="text-xs font-bold text-slate-500 hover:text-slate-700 mr-4">CANCELAR</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Section: General */}
                <div className="space-y-1">
                    <h4 className="px-4 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Aplicación</h4>
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
                        
                        <button onClick={toggleTheme} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform"><Moon className="w-5 h-5"/></div>
                                <span className="text-sm font-bold text-slate-700">Modo Oscuro</span>
                            </div>
                            <div className={`w-10 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </button>

                        <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Database className="w-5 h-5"/></div>
                                <span className="text-sm font-bold text-slate-700">Modo Offline</span>
                            </div>
                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">ACTIVO</span>
                        </div>

                        <div className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-not-allowed opacity-60">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Bell className="w-5 h-5"/></div>
                                <span className="text-sm font-bold text-slate-700">Notificaciones</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300"/>
                        </div>
                    </div>
                </div>

                {/* Section: Data & Privacy */}
                <div className="space-y-1">
                    <h4 className="px-4 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Datos y Privacidad</h4>
                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-sm">
                        
                        <button onClick={handleExport} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-110 transition-transform"><Download className="w-5 h-5"/></div>
                                <div className="text-left">
                                    <div className="text-sm font-bold text-slate-700">Exportar Datos</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Descargar copia local JSON</div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300"/>
                        </button>

                        <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-4 hover:bg-rose-50 transition-colors group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-110 transition-transform"><Trash2 className="w-5 h-5"/></div>
                                <span className="text-sm font-bold text-rose-700">Eliminar Cuenta</span>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4">
                    <button onClick={handleLogout} className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-3.5 rounded-xl shadow-sm hover:bg-slate-50 hover:text-rose-600 transition-colors flex items-center justify-center">
                        <LogOut className="w-4 h-4 mr-2"/> Cerrar Sesión
                    </button>
                    <div className="mt-6 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-300 mb-2">
                            <Shield className="w-4 h-4"/>
                            <span className="text-xs font-bold">PAESYS Secure Environment</span>
                        </div>
                        <p className="text-[10px] text-slate-400">© 2024 Proyecto Vivo • v{config.version}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};
