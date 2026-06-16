'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, Square, AlertCircle, Loader2 } from 'lucide-react';

interface AudioRecorderProps {
    onTranscriptUpdate: (text: string) => void;
    isProcessing: boolean;
}

export default function AudioRecorder({ onTranscriptUpdate, isProcessing }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError('เบราว์เซอร์ของคุณไม่รองรับการบันทึกเสียง');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'th-TH';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                onTranscriptUpdate(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error', event.error);
            setError(event.error === 'not-allowed' ? 'ไม่ได้รับอนุญาตให้ใช้ไมค์' : `Error: ${event.error}`);
            setIsRecording(false);
        };

        recognition.onend = () => {
            if (isRecording) recognition.start();
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) recognitionRef.current.stop();
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
                setError('ไม่สามารถเริ่มบันทึกเสียงได้');
            }
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <button
                onClick={toggleRecording}
                disabled={isProcessing || (!!error && !recognitionRef.current)}
                className={`inline-flex items-center gap-2 text-[12px] font-semibold py-[6px] px-[12px] rounded-[7px] border transition-all ${isRecording
                    ? 'bg-red-500/10 text-red-400 border-red-500/30 font-bold animate-pulse'
                    : 'bg-bg-tertiary text-text-secondary border-border hover:border-accent hover:text-accent'
                    }`}
            >
                {isRecording ? (
                    <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        หยุดอัด
                    </>
                ) : (
                    <>
                        <Mic className="w-3.5 h-3.5" />
                        {error ? 'ลองอีกครั้ง' : 'อัดเสียงโดยตรง'}
                    </>
                )}
            </button>
        </div>
    );
}
