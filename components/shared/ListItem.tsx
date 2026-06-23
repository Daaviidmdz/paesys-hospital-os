import React from 'react';
import { ChevronRight } from 'lucide-react';

interface ListItemProps {
    icon: React.ElementType;
    title: string;
    subtitle: string;
    color?: string;
    bg?: string;
    onClick: () => void;
    isActive?: boolean;
    rightLabel?: string;
    rightIcon?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    color = 'text-slate-400', 
    bg = 'bg-slate-100', 
    onClick, 
    isActive = false,
    rightLabel,
    rightIcon
}) => {
    return (
        <button 
            onClick={onClick}
            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center group relative overflow-hidden ${isActive ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-300'}`}
        >
            <div className={`p-2.5 rounded-lg mr-3 shrink-0 ${bg} ${color} shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5"/>
            </div>
            <div className="flex-1 min-w-0">
                <div className={`text-sm font-bold truncate group-hover:text-indigo-700 ${isActive ? 'text-indigo-700' : 'text-slate-800'}`}>{title}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{subtitle}</div>
            </div>
            
            <div className="flex items-center gap-2">
                {rightLabel && (
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-0.5 rounded tracking-widest border border-slate-100">
                        {rightLabel}
                    </span>
                )}
                {rightIcon && <div className="text-amber-500">{rightIcon}</div>}
                <div className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4"/>
                </div>
            </div>
        </button>
    );
};
