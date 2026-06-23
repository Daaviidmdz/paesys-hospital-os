
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceInputProps {
    onTranscript: (text: string) => void;
    placeholder?: string;
    isCompact?: boolean;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, placeholder = "Dictar nota...", isCompact = false }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Browser compatibility check
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recog = new SpeechRecognition();
            recog.continuous = false; // Stop after one sentence for simplicity in this version
            recog.lang = 'es-ES';
            recog.interimResults = false;

            recog.onstart = () => setIsListening(true);
            recog.onend = () => setIsListening(false);
            recog.onerror = (event: any) => {
                console.error("Speech error", event.error);
                setIsListening(false);
                setError("Error micrófono");
                setTimeout(() => setError(null), 2000);
            };
            recog.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                onTranscript(transcript);
            };

            setRecognition(recog);
        } else {
            setError("Navegador no soporta voz");
        }
    }, [onTranscript]);

    const toggleListening = () => {
        if (!recognition) return;
        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    if (error) {
        return <span className="text-[10px] text-rose-500 font-bold px-2">{error}</span>;
    }

    if (isCompact) {
        return (
            <button 
                onClick={toggleListening} 
                className={`p-2 rounded-full transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                title="Dictar"
            >
                {isListening ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>}
            </button>
        );
    }

    return (
        <button 
            onClick={toggleListening} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                isListening 
                    ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
        >
            {isListening ? <Loader2 className="w-3 h-3 animate-spin"/> : <Mic className="w-3 h-3"/>}
            {isListening ? 'Escuchando...' : placeholder}
        </button>
    );
};
