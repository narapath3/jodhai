'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Info, CheckCircle2, Loader2 } from 'lucide-react';

export default function SettingsModal({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { session } = useAuth();
    const [apiKey, setApiKey] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSave = async () => {
        if (!apiKey.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session?.access_token}`,
                },
                body: JSON.stringify({ gemini_api_key: apiKey.trim() }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setApiKey('');
                }, 1500);
            }
        } catch {
            // handle error
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    className="relative z-10 w-full max-w-[400px] card p-6 shadow-2xl border-border bg-bg-secondary"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Key className="w-5 h-5 text-accent" />
                            <h2 className="text-[16px] font-bold text-text-primary">ตั้งค่า API Key</h2>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-bg-tertiary transition-colors text-text-muted">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[12px] font-semibold text-text-secondary ml-1">
                                Google Gemini API Key
                            </label>
                            <input
                                type="password"
                                className="w-full bg-bg-tertiary border border-border rounded-[8px] p-[10px_12px] text-[14px] text-text-primary outline-none focus:border-accent transition-all"
                                placeholder="AIzaSyA..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                        </div>

                        <div className="p-3 bg-bg-tertiary rounded-[8px] border border-border flex gap-3">
                            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <p className="text-[11px] text-text-secondary leading-[1.6]">
                                รับ API Key ฟรีได้ที่ <a href="https://aistudio.google.com/apikey" target="_blank" className="text-accent underline font-semibold">Google AI Studio</a> <br />
                                (ฟรี 1,500 ครั้ง/วัน สรุปประชุมได้สบายๆ)
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !apiKey.trim() || success}
                            className={`w-full h-11 rounded-[8px] font-bold text-[14px] transition-all flex items-center justify-center gap-2 ${success ? 'bg-accent-green text-bg-primary' : 'btn-run'} disabled:opacity-40`}
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin-custom" />
                            ) : success ? (
                                <><CheckCircle2 className="w-4 h-4" /> บันทึกสำเร็จ</>
                            ) : (
                                'บันทึกการตั้งค่า'
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
