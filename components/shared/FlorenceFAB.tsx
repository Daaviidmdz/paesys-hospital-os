import React from 'react';
import { Bot } from 'lucide-react';
import { ViewState } from '../../types';

interface FlorenceFABProps {
    currentView: ViewState;
    isZenMode: boolean;
    onNavigate: (view: ViewState) => void;
}

export const FlorenceFAB: React.FC<FlorenceFABProps> = ({ currentView, isZenMode, onNavigate }) => {
    if (currentView === ViewState.CHAT) return null;

    return (
        <button 
            onClick={() => onNavigate(ViewState.CHAT)}
            className={`fixed ${isZenMode ? 'bottom-6 right-24' : 'bottom-20 md:bottom-6 right-6'} bg-indigo-600 text-white p-4 rounded-full shadow-2xl z-40 hover:scale-110 transition-all border-2 border-indigo-400 flex items-center justify-center group`}
            title="Hablar con Florence AI"
        >
            <Bot className="w-6 h-6" />
            <span className="absolute right-full mr-4 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold hidden md:block">
                Preguntar a Florence
            </span>
        </button>
    );
};
