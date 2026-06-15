'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, MicOff, AlertCircle } from 'lucide-react';

interface AudioRecorderProps {
    onTranscriptUpdate: (text: string) => void;
    isProcessing: boolean;
}

export default function AudioRecorder({ onTranscriptUpdate, isProcessing }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        // Check if SpeechRecognition is supported
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('เบราว์เซอร์ของคุณไม่รองรับการบันทึกเสียง (แนะนำให้ใช้ Chrome หรือ Edge)');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'th-TH';

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            if (finalTranscript) {
                onTranscriptUpdate(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            if (event.error === 'not-allowed') {
                setError('ไม่ได้รับอนุญาตให้เข้าถึงไมโครโฟน');
            } else {
                setError(`เกิดข้อผิดพลาด: ${event.error}`);
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            if (isRecording) {
                // restart if it ended unexpectedly but we still want it on
                recognition.start();
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isRecording, onTranscriptUpdate]);

    const toggleRecording = () => {
        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            setError(null);
            try {
                recognitionRef.current?.start();
                setIsRecording(true);
            } catch (err) {
                console.error('Start error', err);
                setError('ไม่สามารถเริ่มบันทึกเสียงได้');
            }
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <button
                onClick={toggleRecording}
                disabled={isProcessing || (!!error && !recognitionRef.current)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${isRecording
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                        : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20'
                    }`}
            >
                {isRecording ? (
                    <>
                        <Square className="w-5 h-5 fill-current" />
                        หยุดบันทึกเสียง
                    </>
                ) : (
                    <>
                        <Mic className="w-5 h-5" />
                        เริ่มบันทึกเสียง
                    </>
                )}
            </button>

            {error && !isRecording && (
                <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
