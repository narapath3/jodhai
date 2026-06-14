'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, Info, CheckCircle2, Loader2, Link as LinkIcon } from 'lucide-react';

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
            // Error handling not changed for brevity
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
                    className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative z-10 w-full max-w-md glass-card p-8 shadow-2xl border-white/10 bg-zinc-950"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                                <Key className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold">ตั้งค่า API Key</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-colors text-zinc-500">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-zinc-400 mb-3 ml-1">
                                Google Gemini API Key
                            </label>
                            <input
                                type="password"
                                className="input-field w-full"
                                placeholder="AIzaSyA..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                        </div>

                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-3">
                            <div className="flex gap-3">
                                <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    คุณสามารถขอ API Key ฟรีได้ที่ <a href="https://aistudio.google.com/apikey" target="_blank" className="text-indigo-400 underline font-semibold">Google AI Studio</a> ซึ่งสามารถใช้งานได้ฟรี 1,500 ครั้งต่อวัน
                                </p>
                            </div>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSave}
                            disabled={saving || !apiKey.trim() || success}
                            className={`btn-primary w-full flex items-center justify-center gap-2 h-14 ${success ? '!bg-emerald-500 !shadow-emerald-500/20' : ''
                                }`}
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : success ? (
                                <><CheckCircle2 className="w-5 h-5" /> บันทึกสำเร็จ</>
                            ) : (
                                'บันทึก API Key'
                            )}
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
