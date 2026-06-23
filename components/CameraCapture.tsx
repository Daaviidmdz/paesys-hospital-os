
import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCcw, Check, ScanLine } from 'lucide-react';

interface CameraCaptureProps {
    onCapture: (imageData: string) => void;
    onClose: () => void;
    mode: 'SCAN' | 'PHOTO'; // SCAN for barcodes (simulated), PHOTO for wounds
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, mode }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(mode === 'SCAN');

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    // Simulated barcode scanning effect
    useEffect(() => {
        if (mode === 'SCAN' && isScanning) {
            const timer = setTimeout(() => {
                // Simulate successful scan
                const mockBarcodeData = "PAT-304-A"; // Mock data
                onCapture(mockBarcodeData); 
                // In a real app with zxing, we would process the video frame here
            }, 3000); // 3s delay to simulate finding code
            return () => clearTimeout(timer);
        }
    }, [mode, isScanning, onCapture]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error("Error accessing camera", err);
            alert("No se pudo acceder a la cámara. Verifica permisos.");
            onClose();
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const takePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setCapturedImage(dataUrl);
                stopCamera();
            }
        }
    };

    const confirmPhoto = () => {
        if (capturedImage) {
            onCapture(capturedImage);
            onClose();
        }
    };

    const retake = () => {
        setCapturedImage(null);
        startCamera();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            {/* Header */}
            <div className="p-4 flex justify-between items-center text-white bg-black/50 absolute top-0 w-full z-10">
                <span className="font-bold text-sm uppercase">
                    {mode === 'SCAN' ? 'Escanear Pulsera ID' : 'Documentar Herida'}
                </span>
                <button onClick={onClose}><X className="w-6 h-6"/></button>
            </div>

            {/* Viewfinder */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {!capturedImage ? (
                    <>
                        <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
                        <canvas ref={canvasRef} className="hidden" />
                        
                        {/* Overlay for Scanner */}
                        {mode === 'SCAN' && (
                            <div className="relative z-10 w-64 h-40 border-2 border-emerald-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] flex items-center justify-center">
                                <div className="w-full h-0.5 bg-red-500 animate-pulse absolute"></div>
                                <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded mt-44">Apunta al código de barras</span>
                            </div>
                        )}
                    </>
                ) : (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                )}
            </div>

            {/* Controls */}
            <div className="p-8 bg-black flex justify-center items-center gap-8 relative z-10">
                {!capturedImage ? (
                    mode === 'PHOTO' && (
                        <button onClick={takePhoto} className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
                            <div className="w-14 h-14 bg-white rounded-full active:scale-90 transition-transform"></div>
                        </button>
                    )
                ) : (
                    <>
                        <button onClick={retake} className="text-white flex flex-col items-center">
                            <RefreshCcw className="w-6 h-6 mb-1"/> <span className="text-xs">Repetir</span>
                        </button>
                        <button onClick={confirmPhoto} className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Check className="w-8 h-8"/>
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
