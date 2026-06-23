import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, ChatMessage, ViewState, ViewParams, Patient, ChatChannel } from '../types';
import { ChatService, AuthService } from '../services/firebaseMock';
import { FlorenceResponse } from '../services/geminiService';
import { 
    Send, Mic, CheckCheck, Sparkles, BrainCircuit, Bot, ExternalLink, Globe, 
    ShieldCheck, Activity, FileText, Pill, Stethoscope, Loader2, BookOpen, 
    ArrowRight, Calculator, Trash2, Zap, HeartPulse, Search, Plus, MessageSquare,
    AlertTriangle, Lightbulb, X, Calendar, ChevronDown, ChevronUp, AlertOctagon,
    Users, Hash, Bell, Info, MoreVertical, Paperclip, Smile, User as UserIcon,
    Clock, Check, Copy, ChevronRight, ArrowDown, Heart, Thermometer, Droplets
} from 'lucide-react';

interface TeamChatProps {
    currentUser: User;
    selectedPatient?: Patient;
    onAction?: (view: ViewState, params?: ViewParams) => void;
    compact?: boolean;
    onClose?: () => void;
    initialQuery?: string;
}

export const TeamChat: React.FC<TeamChatProps> = ({ currentUser, selectedPatient, onAction, compact, onClose, initialQuery }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [activeChannel, setActiveChannel] = useState<string>('florence_direct');
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showChannels, setShowChannels] = useState(() => window.innerWidth >= 1024);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const [channelSearchQuery, setChannelSearchQuery] = useState('');
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [newChannelType, setNewChannelType] = useState<ChatChannel['type']>('GENERAL');
    const [attachments, setAttachments] = useState<any[]>([]);
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [hasNewMessages, setHasNewMessages] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
        }
    }, [inputText]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollBottom(!isAtBottom);
        if (isAtBottom) setHasNewMessages(false);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setHasNewMessages(false);
    };

    const loadInitialData = async () => {
        const chs = await ChatService.getChannels();
        setChannels(chs);
        
        if (selectedPatient) {
            const patientChannel: ChatChannel = {
                id: `patient-${selectedPatient.id}`,
                name: `Paciente: ${selectedPatient.name.split(' ')[0]}`,
                description: `Coordinación para ${selectedPatient.name}`,
                icon: 'User',
                type: 'PATIENT',
                patientId: selectedPatient.id
            };
            setChannels(prev => {
                if (prev.find(c => c.id === patientChannel.id)) return prev;
                return [...prev, patientChannel];
            });
            setActiveChannel(patientChannel.id);
        }

        const msgs = await ChatService.getMessages(activeChannel);
        setMessages(msgs);

        const members = await ChatService.getTeamMembers();
        setTeamMembers(members);
    };

    useEffect(() => {
        loadInitialData();
    }, [selectedPatient]);

    useEffect(() => {
        setIsTyping(false);
    }, [activeChannel]);

    useEffect(() => {
        const fetchMessages = async () => {
            const msgs = await ChatService.getMessages(activeChannel);
            setMessages(prev => {
                if (JSON.stringify(prev) === JSON.stringify(msgs)) return prev;
                if (msgs.length > prev.length && showScrollBottom) {
                    setHasNewMessages(true);
                }
                return msgs;
            });
        };

        window.addEventListener('messagesUpdated', fetchMessages);
        
        // Initial fetch
        fetchMessages();
        
        // Fallback polling just in case, but much slower
        const interval = setInterval(fetchMessages, 5000);
        
        return () => {
            window.removeEventListener('messagesUpdated', fetchMessages);
            clearInterval(interval);
        };
    }, [activeChannel]); 

    const prevMessagesLength = useRef(messages.length);
    useEffect(() => {
        if (isTyping && messages.length > prevMessagesLength.current) {
            const newMessages = messages.slice(prevMessagesLength.current);
            if (newMessages.some(m => m.userId === 'florence')) {
                setIsTyping(false);
            }
        }
        prevMessagesLength.current = messages.length;
    }, [messages, isTyping]);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isTyping) {
            timeout = setTimeout(() => setIsTyping(false), 30000);
        }
        return () => clearTimeout(timeout);
    }, [isTyping]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping, isRecording]);

    const handleSendMessage = async (textToSend: string, customAttachments?: any[]) => {
        if (!textToSend.trim() && (!customAttachments || customAttachments.length === 0)) return;
        setInputText('');
        setAttachments([]);
        setShowEmojiPicker(false);
        
        const currentChannel = channels.find(c => c.id === activeChannel);
        const patientContext = currentChannel?.type === 'PATIENT' ? selectedPatient : undefined;

        const isMentioned = textToSend.toLowerCase().includes('@florence') || textToSend.toLowerCase().includes('florence');
        const shouldReply = isMentioned || (activeChannel !== 'staff' && patientContext);

        if (shouldReply) {
            setIsTyping(true);
        }
        
        try {
            await ChatService.sendMessage(currentUser, textToSend, activeChannel, patientContext, customAttachments || attachments, replyingTo?.id);
            setReplyingTo(null);
            const msgs = await ChatService.getMessages(activeChannel);
            setMessages(msgs);
        } catch (error) {
            console.error("Error sending message:", error);
            setIsTyping(false);
        }
    };

    const initialQuerySentRef = useRef(false);

    useEffect(() => {
        if (initialQuery && initialQuery.trim() !== '' && !initialQuerySentRef.current) {
            initialQuerySentRef.current = true;
            // Ensure we are in the florence_direct channel or patient channel
            const targetChannel = selectedPatient ? `patient-${selectedPatient.id}` : 'florence_direct';
            setActiveChannel(targetChannel);
            
            // Small delay to ensure channel is set and messages are loaded
            setTimeout(() => {
                handleSendMessage(initialQuery);
            }, 500);
        }
    }, [initialQuery]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Mocking file upload
            const reader = new FileReader();
            reader.onload = (event) => {
                const newAttachment = {
                    type: file.type.startsWith('image/') ? 'IMAGE' : 'FILE',
                    url: event.target?.result as string,
                    name: file.name,
                    size: `${(file.size / 1024).toFixed(1)} KB`
                };
                setAttachments(prev => [...prev, newAttachment]);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            // Stop recording
            if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
            setIsRecording(false);
            // Mocking voice message
            const voiceAttachment = {
                type: 'VOICE',
                url: '#',
                name: `Nota de voz ${new Date().toLocaleTimeString()}`,
                size: `${recordingTime}s`
            };
            handleSendMessage('Nota de voz enviada', [voiceAttachment]);
            setRecordingTime(0);
        } else {
            // Start recording
            setIsRecording(true);
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) return;
        const newChannel: ChatChannel = {
            id: `ch_${Date.now()}`,
            name: newChannelName,
            description: `Canal de ${newChannelName}`,
            icon: 'Hash',
            type: newChannelType,
            members: [currentUser.id]
        };
        await ChatService.createChannel(newChannel);
        setChannels(prev => [...prev, newChannel]);
        setActiveChannel(newChannel.id);
        setShowCreateChannel(false);
        setNewChannelName('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(inputText);
        }
    };

    const filteredMessages = messages.filter(m => 
        m.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.userName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const parseFlorenceResponse = (text: string): FlorenceResponse | null => {
        try {
            let cleanText = text.trim();
            if (cleanText.startsWith('```json')) {
                cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
            } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
            }
            cleanText = cleanText.trim();
            if (cleanText.startsWith('{')) return JSON.parse(cleanText);
            return null;
        } catch { return null; }
    };

    const filteredChannels = channels.filter(ch => 
        ch.name.toLowerCase().includes(channelSearchQuery.toLowerCase()) ||
        ch.description.toLowerCase().includes(channelSearchQuery.toLowerCase())
    );

    const currentChannel = channels.find(c => c.id === activeChannel) || channels[0];

    // Channel Theme Logic
    const getChannelTheme = () => {
        if (!currentChannel) return 'bg-white dark:bg-slate-900';
        if (currentChannel.id === 'florence_direct') return 'bg-indigo-50/30 dark:bg-indigo-950/10';
        switch (currentChannel.type) {
            case 'EMERGENCY': return 'bg-rose-50/50 dark:bg-rose-950/20';
            case 'PATIENT': return 'bg-indigo-50/50 dark:bg-indigo-950/20';
            case 'STAFF': return 'bg-emerald-50/50 dark:bg-emerald-950/20';
            default: return 'bg-white dark:bg-slate-900';
        }
    };

    const getInputBorderColor = () => {
        if (!currentChannel) return 'border-slate-200 dark:border-slate-700';
        if (currentChannel.id === 'florence_direct') return 'border-indigo-200 dark:border-indigo-800 focus-within:ring-indigo-500/20';
        switch (currentChannel.type) {
            case 'EMERGENCY': return 'border-rose-200 dark:border-rose-800 focus-within:ring-rose-500/20';
            case 'PATIENT': return 'border-indigo-200 dark:border-indigo-800 focus-within:ring-indigo-500/20';
            case 'STAFF': return 'border-emerald-200 dark:border-emerald-800 focus-within:ring-emerald-500/20';
            default: return 'border-slate-200 dark:border-slate-700 focus-within:ring-indigo-500/20';
        }
    };

    const getQuickActions = () => {
        if (currentChannel?.id === 'florence_direct') {
            return [
                { label: 'Analizar Interacciones', icon: Pill, color: 'text-rose-600', bg: 'bg-rose-50', text: '¿Existen interacciones medicamentosas importantes que deba considerar para mi paciente?' },
                { label: 'Sugerir PAE', icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50', text: 'Sugiéreme un Plan de Atención de Enfermería (NANDA, NOC, NIC) para un paciente con ' + (selectedPatient ? selectedPatient.diagnosis : 'dificultad respiratoria') },
                { label: 'Duda Clínica', icon: BrainCircuit, color: 'text-amber-600', bg: 'bg-amber-50', text: 'Tengo una duda clínica sobre el manejo de ' + (selectedPatient ? selectedPatient.diagnosis : 'un paciente crítico') },
                { label: 'Resumen', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Hazme un resumen del estado actual del paciente ' + (selectedPatient ? selectedPatient.name : '') },
            ];
        }
        return [
            { label: 'Urgencia', icon: AlertOctagon, color: 'text-rose-600', bg: 'bg-rose-50', text: '¡ATENCIÓN! Se requiere asistencia inmediata en ' + (selectedPatient ? 'habitación ' + selectedPatient.bed : 'unidad') },
            { label: 'Ayuda', icon: HeartPulse, color: 'text-amber-600', bg: 'bg-amber-50', text: '¿Alguien puede ayudarme con una tarea en ' + (selectedPatient ? 'habitación ' + selectedPatient.bed : 'el control') + '?' },
            { label: 'Relevo', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50', text: 'Iniciando informe de relevo de turno. ' + (selectedPatient ? 'Paciente: ' + selectedPatient.name : '') },
            { label: 'Médico', icon: Stethoscope, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Solicitando valoración médica para ' + (selectedPatient ? selectedPatient.name : 'paciente') },
            { label: 'Farmacia', icon: Pill, color: 'text-violet-600', bg: 'bg-violet-50', text: 'Falta medicación de ' + (selectedPatient ? selectedPatient.name : 'paciente') },
        ];
    };

    const quickActions = getQuickActions();

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans relative">
            {/* Sidebar - Channels */}
            {!compact && showChannels && !isFocusMode && (
                <>
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setShowChannels(false)} />
                    <div className="absolute lg:relative z-50 h-full w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col animate-fade-in-right">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Canales</h2>
                            <button onClick={() => setShowCreateChannel(true)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><Plus className="w-4 h-4"/></button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"/>
                            <input 
                                type="text" 
                                placeholder="Filtrar canales..." 
                                value={channelSearchQuery}
                                onChange={(e) => setChannelSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {filteredChannels.map(ch => (
                            <button 
                                key={ch.id} 
                                onClick={() => {
                                    setActiveChannel(ch.id);
                                    if (window.innerWidth < 1024) setShowChannels(false);
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${activeChannel === ch.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'} ${ch.id === 'florence_direct' && activeChannel !== ch.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-300' : ''}`}
                            >
                                <div className={`p-1.5 rounded-lg ${activeChannel === ch.id ? 'bg-indigo-600 text-white' : ch.id === 'florence_direct' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                    {ch.id === 'florence_direct' ? <Sparkles className="w-3.5 h-3.5"/> : ch.type === 'EMERGENCY' ? <AlertOctagon className="w-3.5 h-3.5"/> : ch.type === 'PATIENT' ? <UserIcon className="w-3.5 h-3.5"/> : ch.type === 'STAFF' ? <ShieldCheck className="w-3.5 h-3.5"/> : <Hash className="w-3.5 h-3.5"/>}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="text-xs font-bold truncate">{ch.name}</div>
                                    <div className="text-[9px] opacity-60 truncate">{ch.description}</div>
                                </div>
                                {ch.unreadCount && ch.unreadCount > 0 && (
                                    <div className="bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                                        {ch.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))}
                        {filteredChannels.length === 0 && (
                            <div className="p-4 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Sin resultados</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="bg-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-4 h-4 text-amber-300 fill-amber-300"/>
                                <span className="text-[10px] font-black uppercase tracking-widest">Pro Tip</span>
                            </div>
                            <p className="text-[10px] font-medium leading-relaxed opacity-90">Menciona a @Florence para obtener un análisis clínico instantáneo.</p>
                        </div>
                    </div>
                </div>
                </>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative min-w-0 bg-white dark:bg-slate-900">
                {/* Header */}
                <div className="h-14 md:h-16 border-b border-slate-200 dark:border-slate-800 px-3 md:px-4 flex items-center justify-between sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        {onClose && (
                            <button onClick={onClose} className="p-1.5 -ml-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all md:hidden">
                                <ChevronRight className="w-5 h-5 rotate-180" />
                            </button>
                        )}
                        {!compact && (
                            <button onClick={() => setShowChannels(!showChannels)} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden">
                                <Hash className="w-5 h-5"/>
                            </button>
                        )}
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5 md:gap-2">
                                {currentChannel?.id === 'florence_direct' && <Bot className="w-4 h-4 text-indigo-500" />}
                                <h3 className="font-black text-slate-800 dark:text-white text-xs md:text-sm uppercase tracking-tight truncate">{currentChannel?.name}</h3>
                                {currentChannel?.type === 'EMERGENCY' && <span className="bg-rose-500 text-white text-[7px] md:text-[8px] font-black px-1 md:px-1.5 py-0.5 rounded-full animate-pulse">LIVE</span>}
                            </div>
                            <div className="text-[9px] md:text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                {currentChannel?.id === 'florence_direct' ? (
                                    <>
                                        <Sparkles className="w-2.5 h-2.5 md:w-3 h-3 text-indigo-400" />
                                        <span className="hidden xs:inline">Asistente Clínico Inteligente</span>
                                        <span className="xs:hidden">Asistente AI</span>
                                    </>
                                ) : (
                                    <>
                                        <Users className="w-2.5 h-2.5 md:w-3 h-3"/> 
                                        <span className="hidden xs:inline">{teamMembers.length} miembros activos</span>
                                        <span className="xs:hidden">{teamMembers.length}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 md:gap-1">
                        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-2 md:px-3 py-1 md:py-1.5 mr-1 md:mr-2">
                            <Search className="w-3.5 h-3.5 md:w-4 h-4 text-slate-400 mr-1.5 md:mr-2"/>
                            <input 
                                type="text" 
                                placeholder="Buscar..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none outline-none text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200 w-20 md:w-32 focus:w-32 md:focus:w-48 transition-all"
                            />
                        </div>
                        <button 
                            onClick={() => setIsFocusMode(!isFocusMode)} 
                            className={`p-1.5 md:p-2 rounded-lg transition-all ${isFocusMode ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            title={isFocusMode ? "Salir de Modo Enfoque" : "Modo Enfoque"}
                        >
                            <Zap className={`w-4 h-4 md:w-5 h-5 ${isFocusMode ? 'fill-amber-500' : ''}`}/>
                        </button>
                        <button onClick={() => setShowMembers(!showMembers)} className={`p-1.5 md:p-2 rounded-lg transition-all ${showMembers && !isFocusMode ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Users className="w-4 h-4 md:w-5 h-5"/></button>
                        <button className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"><MoreVertical className="w-4 h-4 md:w-5 h-5"/></button>
                        {onClose && <button onClick={onClose} className="p-1.5 md:p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg ml-1 md:ml-2"><X className="w-4 h-4 md:w-5 h-5"/></button>}
                    </div>
                </div>

                {/* Patient Context Bar */}
                {selectedPatient && currentChannel?.type === 'PATIENT' && (
                    <div className="bg-indigo-600 dark:bg-indigo-700 px-4 py-2 flex items-center justify-between text-white animate-fade-in-down">
                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <UserIcon className="w-4 h-4" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Paciente</div>
                                    <div className="text-xs font-black truncate max-w-[120px]">{selectedPatient.name}</div>
                                </div>
                            </div>
                            <div className="h-6 w-px bg-white/10" />
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1.5">
                                    <Activity className="w-3.5 h-3.5 text-emerald-300" />
                                    <span className="text-[10px] font-bold">{selectedPatient.status}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Heart className="w-3.5 h-3.5 text-rose-300" />
                                    <span className="text-[10px] font-bold">{selectedPatient.vitals.heartRate} lpm</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Thermometer className="w-3.5 h-3.5 text-amber-300" />
                                    <span className="text-[10px] font-bold">{selectedPatient.vitals.temperature}°C</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => onAction && onAction(ViewState.FOLLOWUP, { patientId: selectedPatient.id })}
                            className="text-[9px] font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                        >
                            Ver HC <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {/* Pinned Messages Banner */}
                {messages.filter(m => m.pinned).length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50 p-2 px-4 flex items-center gap-3 overflow-x-auto no-scrollbar">
                        <div className="flex items-center gap-1 text-amber-600 dark:text-amber-500 flex-shrink-0">
                            <Lightbulb className="w-3.5 h-3.5"/>
                            <span className="text-[10px] font-black uppercase tracking-widest">Fijados</span>
                        </div>
                        <div className="flex gap-2 flex-1">
                            {messages.filter(m => m.pinned).map(pinnedMsg => (
                                <div key={pinnedMsg.id} className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700/50 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2 min-w-[200px] max-w-[300px] shadow-sm group/pin">
                                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{pinnedMsg.userName}:</span>
                                    <span className="text-slate-500 dark:text-slate-400 truncate flex-1">{pinnedMsg.text}</span>
                                    <button onClick={() => ChatService.togglePinMessage(pinnedMsg.id).then(() => loadInitialData())} className="opacity-0 group-hover/pin:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 transition-opacity">
                                        <X className="w-3 h-3"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div 
                    ref={messagesContainerRef}
                    onScroll={handleScroll}
                    className={`flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth transition-colors duration-500 ${getChannelTheme()}`}
                >
                    {filteredMessages.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-4">
                                {currentChannel?.id === 'florence_direct' ? (
                                    <Bot className="w-10 h-10 text-indigo-600"/>
                                ) : (
                                    <MessageSquare className="w-10 h-10 text-indigo-600"/>
                                )}
                            </div>
                            <h4 className="text-lg font-black text-slate-800 dark:text-white mb-2">
                                {searchQuery ? 'No se encontraron mensajes' : currentChannel?.id === 'florence_direct' ? 'Hola, soy Florence AI' : 'Comienzo del historial'}
                            </h4>
                            <p className="text-sm text-slate-500 max-w-xs">
                                {searchQuery ? `No hay resultados para "${searchQuery}"` : currentChannel?.id === 'florence_direct' ? 'Estoy aquí para ayudarte con dudas clínicas, interacciones de medicamentos o planes de cuidado.' : `Este es el inicio de la conversación en el canal ${currentChannel?.name}.`}
                            </p>
                        </div>
                    )}
                    
                    {filteredMessages.map((msg, index) => {
                        const isMe = msg.userId === currentUser.id;
                        const isAI = msg.userId === 'florence';
                        const structuredData = isAI ? parseFlorenceResponse(msg.text) : null;
                        const displayText = structuredData ? structuredData.answer : msg.text;
                        const repliedMsg = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;
                        
                        // Grouping Logic
                        const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
                        const isSameUser = prevMsg && prevMsg.userId === msg.userId;
                        const timeDiff = prevMsg ? (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime()) / 1000 / 60 : 0;
                        const isGrouped = isSameUser && timeDiff < 5;

                        // Date Separator Logic
                        const msgDate = new Date(msg.timestamp);
                        const prevMsgDate = prevMsg ? new Date(prevMsg.timestamp) : null;
                        const showDateSeparator = !prevMsgDate || msgDate.toDateString() !== prevMsgDate.toDateString();
                        
                        let dateText = '';
                        if (showDateSeparator) {
                            const today = new Date();
                            const yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            
                            if (msgDate.toDateString() === today.toDateString()) dateText = 'Hoy';
                            else if (msgDate.toDateString() === yesterday.toDateString()) dateText = 'Ayer';
                            else dateText = msgDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                        }
                        
                        return (
                            <React.Fragment key={msg.id || index}>
                                {showDateSeparator && (
                                    <div className="flex justify-center my-8">
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 self-center" />
                                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mx-4 border border-slate-200 dark:border-slate-700">
                                            {dateText}
                                        </span>
                                        <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 self-center" />
                                    </div>
                                )}
                                <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up group relative ${isGrouped ? 'mt-1' : 'mt-6'}`}>
                                    <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isMe && (
                                        <div className="flex-shrink-0 w-8">
                                            {!isGrouped && (
                                                <img src={msg.userAvatar || `https://ui-avatars.com/api/?name=${msg.userName}&background=random`} className="w-8 h-8 rounded-xl shadow-sm border border-white dark:border-slate-800" alt={msg.userName}/>
                                            )}
                                        </div>
                                    )}
                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} relative`}>
                                        {!isGrouped && (
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{msg.userName}</span>
                                                <span className="text-[9px] font-bold text-slate-400">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        )}
                                        
                                        <div className={`rounded-2xl p-4 shadow-sm text-sm leading-relaxed border transition-all relative ${
                                            isMe ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none border-transparent shadow-indigo-200 dark:shadow-none' : 
                                            isAI ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border-violet-200 dark:border-violet-900/50 shadow-violet-100 dark:shadow-none' :
                                            msg.type === 'ALERT' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200 rounded-tl-none border-rose-200 dark:border-rose-800' :
                                            'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none border-slate-200 dark:border-slate-700'
                                        } ${isGrouped ? (isMe ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''}`}>
                                            {msg.pinned && (
                                                <div className="absolute -top-2 -right-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 p-1 rounded-full shadow-sm border border-amber-200 dark:border-amber-800">
                                                    <Lightbulb className="w-3 h-3"/>
                                                </div>
                                            )}
                                            {/* Message Actions (Hover) */}
                                            <div className={`absolute -top-3 ${isMe ? '-left-48' : '-right-48'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 rounded-lg p-1 z-10`}>
                                                <button onClick={() => setReplyingTo(msg)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500" title="Responder">
                                                    <MessageSquare className="w-3.5 h-3.5"/>
                                                </button>
                                                <button onClick={() => navigator.clipboard.writeText(msg.text)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-slate-500" title="Copiar">
                                                    <Copy className="w-3.5 h-3.5"/>
                                                </button>
                                                <div className="flex items-center border-l border-r border-slate-200 dark:border-slate-700 px-1 mx-1">
                                                    {['👍', '❤️', '😂'].map(emoji => (
                                                        <button 
                                                            key={emoji}
                                                            onClick={() => ChatService.addReaction(msg.id, emoji, currentUser.id).then(() => loadInitialData())} 
                                                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-sm"
                                                            title={emoji}
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                                <button onClick={() => ChatService.togglePinMessage(msg.id).then(() => loadInitialData())} className={`p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md ${msg.pinned ? 'text-amber-500' : 'text-slate-500'}`} title={msg.pinned ? "Desfijar" : "Fijar"}>
                                                    <Lightbulb className="w-3.5 h-3.5"/>
                                                </button>
                                                {isMe && (
                                                    <button onClick={() => ChatService.deleteMessage(msg.id).then(() => loadInitialData())} className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-rose-500" title="Eliminar">
                                                        <Trash2 className="w-3.5 h-3.5"/>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Replied Message Preview */}
                                            {repliedMsg && (
                                                <div className={`mb-4 p-3 rounded-xl text-sm border-l-4 shadow-sm ${isMe ? 'bg-indigo-700/30 border-indigo-300 text-indigo-100' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-400 text-slate-700 dark:text-slate-300'}`}>
                                                    <div className="font-black text-[11px] mb-1 uppercase tracking-wider opacity-60">
                                                        Respondido a {repliedMsg.userName}:
                                                    </div>
                                                    <div className="whitespace-pre-wrap opacity-90 italic">
                                                        "{repliedMsg.text}"
                                                    </div>
                                                </div>
                                            )}

                                            {isAI && structuredData && (
                                                <div className="mb-3 border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center justify-between">
                                                    <span className="font-black text-[10px] text-violet-600 dark:text-violet-400 uppercase flex items-center gap-2">
                                                        <Sparkles className="w-3 h-3"/> ANÁLISIS CLÍNICO
                                                    </span>
                                                    <div className="flex gap-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                                                        <span className="text-[8px] font-black text-slate-400">AI AGENT</span>
                                                    </div>
                                                </div>
                                            )}

                                            {isAI && structuredData?.criticalAlert && (
                                                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-3 animate-pulse">
                                                    <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5"/>
                                                    <div>
                                                        <div className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">ALERTA DE SEGURIDAD</div>
                                                        <div className="text-xs font-bold text-rose-700 dark:text-rose-200 leading-tight">{structuredData.criticalAlert}</div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {displayText && (
                                                <div className={`whitespace-pre-wrap leading-relaxed font-medium prose prose-sm max-w-none ${isMe ? 'prose-invert prose-p:text-white prose-strong:text-white prose-a:text-indigo-200' : 'dark:prose-invert prose-p:text-slate-700 dark:prose-p:text-slate-200 prose-strong:text-slate-900 dark:prose-strong:text-white prose-a:text-indigo-600 dark:prose-a:text-indigo-400'}`}>
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {displayText as string}
                                                    </ReactMarkdown>
                                                </div>
                                            )}

                                            {/* Attachments Display */}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    {msg.attachments.map((att, i) => (
                                                        <div key={i} className="rounded-xl overflow-hidden border border-black/5 dark:border-white/5">
                                                            {att.type === 'IMAGE' ? (
                                                                <img src={att.url} alt={att.name} className="max-w-full h-auto max-h-64 object-cover" referrerPolicy="no-referrer"/>
                                                            ) : att.type === 'VOICE' ? (
                                                                <div className="bg-slate-100 dark:bg-slate-700 p-3 flex items-center gap-3">
                                                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white">
                                                                        <Mic className="w-4 h-4"/>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <div className="h-1 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                                            <div className="h-full bg-indigo-600 w-1/3"/>
                                                                        </div>
                                                                        <div className="flex justify-between mt-1">
                                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">Audio Note</span>
                                                                            <span className="text-[8px] font-bold text-slate-400 uppercase">{att.size}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="bg-slate-100 dark:bg-slate-700 p-3 flex items-center gap-3">
                                                                    <FileText className="w-5 h-5 text-indigo-600"/>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-[10px] font-bold truncate">{att.name}</div>
                                                                        <div className="text-[8px] font-bold text-slate-400 uppercase">{att.size}</div>
                                                                    </div>
                                                                    <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg"><ArrowRight className="w-4 h-4"/></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {isAI && structuredData?.sources && (
                                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-2">
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Fuentes Consultadas</div>
                                                    {structuredData.sources.map((src, i) => (
                                                        <a key={i} href={src.uri} target="_blank" rel="noopener noreferrer" className="flex items-center bg-slate-50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-700 rounded-xl p-2.5 transition-all text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 group/link">
                                                            <Globe className="w-3 h-3 mr-2 text-blue-500"/> 
                                                            <span className="flex-1 truncate">{src.title}</span>
                                                            <ExternalLink className="w-3 h-3 ml-2 opacity-0 group-hover/link:opacity-100 transition-opacity"/>
                                                        </a>
                                                    ))}
                                                </div>
                                            )}

                                            {isAI && structuredData?.suggestedPae && (
                                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
                                                    <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-2">
                                                        <BrainCircuit className="w-3 h-3"/> Plan de Cuidados Sugerido
                                                    </div>
                                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                                        <div className="text-[8px] font-bold text-slate-400 uppercase mb-1">Diagnóstico NANDA</div>
                                                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight">{structuredData.suggestedPae.nanda[0]?.label}</div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-xl border border-emerald-100 dark:border-emerald-800">
                                                            <div className="text-[8px] font-bold text-emerald-600 uppercase mb-1">NOC</div>
                                                            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{structuredData.suggestedPae.noc[0]?.result}</div>
                                                        </div>
                                                        <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-xl border border-amber-100 dark:border-amber-800">
                                                            <div className="text-[8px] font-bold text-amber-600 uppercase mb-1">NIC</div>
                                                            <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate">{structuredData.suggestedPae.nic[0]?.intervention}</div>
                                                        </div>
                                                    </div>
                                                    {selectedPatient && (
                                                        <button 
                                                            onClick={() => onAction && onAction(ViewState.FOLLOWUP, { patientId: selectedPatient.id })}
                                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-2.5 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all uppercase flex items-center justify-center gap-2"
                                                        >
                                                            <Plus className="w-3.5 h-3.5"/> Aplicar al Plan
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {isAI && structuredData?.suggestedActions && structuredData.suggestedActions.length > 0 && (
                                                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                                                    {structuredData.suggestedActions.map((action, i) => (
                                                        <button 
                                                            key={i}
                                                            onClick={() => onAction && onAction(action.view as ViewState, action.params)}
                                                            className="bg-white dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2"
                                                        >
                                                            <ExternalLink className="w-3 h-3"/>
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Reactions Display */}
                                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                            <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                {Object.entries(msg.reactions as Record<string, string[]>).map(([emoji, users]) => (
                                                    <button 
                                                        key={emoji}
                                                        onClick={() => {
                                                            if (users.includes(currentUser.id)) {
                                                                ChatService.removeReaction(msg.id, emoji, currentUser.id).then(() => loadInitialData());
                                                            } else {
                                                                ChatService.addReaction(msg.id, emoji, currentUser.id).then(() => loadInitialData());
                                                            }
                                                        }}
                                                        className={`text-[10px] px-1.5 py-0.5 rounded-full border flex items-center gap-1 ${users.includes(currentUser.id) ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400' : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                                                    >
                                                        <span>{emoji}</span>
                                                        <span className="font-bold">{users.length}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {isMe && (
                                            <div className="flex items-center gap-1 mt-1 px-1">
                                                <CheckCheck className="w-3 h-3 text-indigo-500"/>
                                                <span className="text-[8px] font-bold text-slate-400 uppercase">Leído</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            </React.Fragment>
                        );
                    })}
                    {isTyping && (
                        <div className="flex justify-start pl-2 animate-fade-in-up">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-2 border border-violet-100 dark:border-violet-900/30">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.6s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]"></div>
                                    </div>
                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Florence está analizando</span>
                                </div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Consultando historia clínica y protocolos...</div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef}/>
                </div>

                {/* Scroll to Bottom Button */}
                {showScrollBottom && (
                    <button 
                        onClick={scrollToBottom}
                        className="absolute bottom-32 right-6 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 p-3 rounded-full shadow-2xl border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-95 transition-all z-40 flex items-center gap-2 group"
                    >
                        {hasNewMessages && (
                            <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce">NUEVOS</span>
                        )}
                        <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                )}

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    {/* Replying To Preview */}
                    {replyingTo && (
                        <div className="mb-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-start justify-between">
                            <div className="flex-1 min-w-0 border-l-2 border-indigo-500 pl-2">
                                <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3"/> Respondiendo a {replyingTo.userName}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-slate-300 truncate">
                                    {replyingTo.text}
                                </div>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg ml-2">
                                <X className="w-4 h-4"/>
                            </button>
                        </div>
                    )}

                    {/* Attachments Preview */}
                    {attachments.length > 0 && (
                        <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                            {attachments.map((att, i) => (
                                <div key={i} className="relative group flex-shrink-0">
                                    {att.type === 'IMAGE' ? (
                                        <img src={att.url} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700" alt="Preview"/>
                                    ) : (
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                            <FileText className="w-6 h-6 text-indigo-600"/>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                        className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions Bar */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
                        {quickActions.map((action, i) => (
                            <button 
                                key={i}
                                onClick={() => handleSendMessage(action.text)}
                                className={`${action.bg} ${action.color} px-4 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-all border border-transparent hover:border-current/20 shadow-sm hover:shadow-md active:scale-95`}
                            >
                                <div className={`p-1 rounded-lg bg-white/50 dark:bg-black/20`}>
                                    <action.icon className="w-3.5 h-3.5"/>
                                </div>
                                {action.label}
                            </button>
                        ))}
                    </div>

                    <form 
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputText); }} 
                        className="relative flex items-end gap-3"
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            className="hidden" 
                            accept="image/*,.pdf,.doc,.docx"
                        />
                        
                        <div className={`flex-1 p-1.5 rounded-3xl border transition-all flex items-end shadow-inner ${isRecording ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 ring-2 ring-rose-500/20' : `bg-slate-50 dark:bg-slate-800 ${getInputBorderColor()}`}`}>
                            {isRecording ? (
                                <div className="flex-1 flex items-center px-4 gap-3 h-11">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse"/>
                                    <span className="text-xs font-black text-rose-600 uppercase tracking-widest">Grabando... {recordingTime}s</span>
                                    <div className="flex-1 h-1 bg-rose-100 dark:bg-rose-900/30 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 animate-[shimmer_2s_infinite] w-full"/>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors mb-0.5"
                                    >
                                        <Paperclip className="w-5 h-5"/>
                                    </button>
                                    <textarea 
                                        ref={textareaRef}
                                        rows={1}
                                        value={inputText} 
                                        onChange={(e) => setInputText(e.target.value)} 
                                        onKeyDown={handleKeyDown}
                                        className="flex-1 bg-transparent outline-none text-sm font-bold text-slate-800 dark:text-slate-200 px-2 py-3 min-h-[44px] max-h-[150px] resize-none placeholder:text-slate-400 custom-scrollbar" 
                                        placeholder={currentChannel?.id === 'florence_direct' ? "Pregunta a Florence AI..." : currentChannel?.type === 'EMERGENCY' ? "Describa la emergencia..." : "Escriba un mensaje al equipo..."}
                                    />
                                    <div className="relative mb-0.5">
                                        <button 
                                            type="button" 
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className={`p-2.5 transition-colors ${showEmojiPicker ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                                        >
                                            <Smile className="w-5 h-5"/>
                                        </button>
                                        {showEmojiPicker && (
                                            <div className="absolute bottom-full right-0 mb-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-2 flex gap-1 z-50 animate-fade-in-up">
                                                {['👍', '❤️', '😂', '🙏', '👏', '👀', '✅', '❌', '💊', '💉', '🩺'].map(emoji => (
                                                    <button 
                                                        key={emoji}
                                                        type="button"
                                                        onClick={() => {
                                                            setInputText(prev => prev + emoji);
                                                            setShowEmojiPicker(false);
                                                            textareaRef.current?.focus();
                                                        }}
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-lg transition-transform hover:scale-110"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                            <button 
                                type="button" 
                                onClick={toggleRecording}
                                className={`p-2.5 transition-colors mb-0.5 ${isRecording ? 'text-rose-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600'}`}
                            >
                                <Mic className="w-5 h-5"/>
                            </button>
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={(!inputText.trim() && attachments.length === 0) || isTyping} 
                            className={`p-4 rounded-full transition-all shadow-lg flex items-center justify-center mb-0.5 ${inputText.trim() || attachments.length > 0 ? 'bg-indigo-600 text-white hover:scale-110 active:scale-95' : 'bg-slate-200 text-slate-400'}`}
                        >
                            <Send className="w-5 h-5 ml-0.5"/>
                        </button>
                    </form>
                </div>
            </div>

            {/* Create Channel Modal */}
            {showCreateChannel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Nuevo Canal</h3>
                            <button onClick={() => setShowCreateChannel(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre del Canal</label>
                                <input 
                                    type="text" 
                                    value={newChannelName}
                                    onChange={(e) => setNewChannelName(e.target.value)}
                                    placeholder="ej. Turno de Noche"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Canal</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['GENERAL', 'STAFF', 'EMERGENCY', 'PRIVATE'] as const).map(type => (
                                        <button 
                                            key={type}
                                            onClick={() => setNewChannelType(type)}
                                            className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider border transition-all ${newChannelType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                            <button 
                                onClick={handleCreateChannel}
                                disabled={!newChannelName.trim()}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all uppercase tracking-widest text-xs"
                            >
                                Crear Canal
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Right Sidebar - Team Members */}
            {showMembers && !isFocusMode && (
                <div className="w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col animate-fade-in-left">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="font-black text-slate-800 dark:text-white uppercase tracking-widest text-xs">Equipo en Línea</h2>
                        <button onClick={() => setShowMembers(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"><X className="w-4 h-4"/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {teamMembers.map(member => (
                            <div key={member.id} className="flex items-center gap-3 group cursor-pointer">
                                <div className="relative">
                                    <img src={member.avatar} className="w-10 h-10 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800" alt={member.name}/>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"/>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs font-black text-slate-800 dark:text-white truncate">{member.name}</div>
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{member.role} • {member.unit || 'General'}</div>
                                </div>
                                <button className="p-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-indigo-600"><MessageSquare className="w-4 h-4"/></button>
                            </div>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                        <button className="w-full bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-slate-600 dark:text-slate-300 text-[10px] font-black py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition-all uppercase flex items-center justify-center gap-2">
                            <Plus className="w-3.5 h-3.5"/> Invitar al Equipo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
