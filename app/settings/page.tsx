'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, User, Info, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
    const { user, session, loading: authLoading } = useAuth();
    const [apiKey, setApiKey] = useState('');
    const [currentKeyPreview, setCurrentKeyPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (session?.access_token) {
            fetch('/api/settings', {
                headers: { Authorization: `Bearer ${session.access_token}` },
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.api_key_preview) {
                        setCurrentKeyPreview(data.api_key_preview);
                    }
                })
                .catch(() => { });
        }
    }, [session]);

    const showStatus = (message: string, type: 'success' | 'error') => {
        setStatus({ message, type });
        setTimeout(() => setStatus(null), 3000);
    };

    const handleSave = async () => {
        if (!apiKey.trim() || !session?.access_token) return;
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ gemini_api_key: apiKey.trim() }),
            });

            if (res.ok) {
                showStatus('บันทึก API Key สำเร็จ!', 'success');
                setCurrentKeyPreview(`${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`);
                setApiKey('');
            } else {
                showStatus('ไม่สามารถบันทึกได้ ลองใหม่อีกครั้ง', 'error');
            }
        } catch {
            showStatus('เกิดข้อผิดพลาด', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <p className="text-text-secondary mb-6">กรุณาเข้าสู่ระบบเพื่อจัดการตั้งค่า</p>
                <Link href="/login" className="btn-run px-8 inline-block">เข้าสู่ระบบ</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[600px] mx-auto space-y-8 py-4">
            <header className="flex items-center justify-between">
                <div>
                    <div className="logo inline-flex items-center gap-2 text-[13px] font-semibold tracking-[.06em] uppercase text-accent mb-[8px]">
                        <div className="logo-dot" /> Settings
                    </div>
                    <h1 className="text-[26px] font-semibold tracking-[-.3px] text-text-primary">ตั้งค่าการใช้งาน</h1>
                </div>
                <Link href="/" className="text-[12px] font-semibold text-text-muted hover:text-accent flex items-center gap-1 transition-all">
                    <ArrowLeft className="w-4 h-4" /> แดชบอร์ด
                </Link>
            </header>

            {/* Profile Section */}
            <div className="card overflow-hidden">
                <div className="p-[12px_16px] border-b border-border text-[11px] font-heavy uppercase tracking-widest text-text-muted">
                    Account Profile
                </div>
                <div className="p-6 flex items-center gap-5">
                    <div className="w-14 h-14 rounded-[12px] bg-accent/20 flex items-center justify-center text-[20px] font-bold text-accent">
                        {user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="text-[16px] font-bold text-text-primary">{user.email}</p>
                        <p className="text-[12px] text-text-muted mt-0.5">สมาชิกตั้งแต่ {new Date(user.created_at).toLocaleDateString('th-TH')}</p>
                    </div>
                </div>
            </div>

            {/* API Key Section */}
            <div className="card overflow-hidden">
                <div className="p-[12px_16px] border-b border-border text-[11px] font-heavy uppercase tracking-widest text-text-muted flex items-center justify-between">
                    Gemini API Configuration
                    {currentKeyPreview && (
                        <span className="text-[10px] text-accent-green bg-accent-green/10 px-2 py-0.5 rounded-full border border-accent-green/20">Active</span>
                    )}
                </div>

                <div className="p-6 space-y-6">
                    {currentKeyPreview && (
                        <div className="p-4 bg-bg-tertiary rounded-[8px] border border-border flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-accent-green" />
                            </div>
                            <div>
                                <p className="text-[12px] font-bold text-text-primary uppercase tracking-wider">Current API Key</p>
                                <p className="text-[13px] text-text-muted font-mono mt-0.5">{currentKeyPreview}</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[12px] font-semibold text-text-secondary ml-1">
                                {currentKeyPreview ? 'เปลี่ยน API Key' : 'เพิ่ม API Key'}
                            </label>
                            <input
                                type="password"
                                className="w-full bg-bg-tertiary border border-border rounded-[8px] p-[10px_12px] text-[14px] text-text-primary font-mono outline-none focus:border-accent transition-all"
                                placeholder={currentKeyPreview ? '••••••••••••••••' : 'AIzaSyA...'}
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                            />
                        </div>

                        <div className="p-4 bg-bg-tertiary rounded-[8px] border border-border flex gap-3">
                            <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                            <p className="text-[12px] text-text-secondary leading-[1.6] font-thai">
                                ขอ API Key ฟรีได้ที่ <a href="https://aistudio.google.com/apikey" target="_blank" className="text-accent underline font-semibold">Google AI Studio</a> <br />
                                คีย์นี้ใช้สำหรับประมวลผลสรุปการประชุมผ่าน Gemini AI Model
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || !apiKey.trim()}
                            className="btn-run w-full h-11 flex items-center justify-center gap-2 font-bold text-[14px]"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin-custom" />
                            ) : (
                                'บันทึกการเปลี่ยนแปลง'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className={`fixed bottom-8 left-1/2 -translate-x-1/2 p-[10px_20px] rounded-full text-[13px] font-bold shadow-2xl z-[100] border ${status.type === 'success'
                            ? 'bg-accent-green text-bg-primary border-accent-green'
                            : 'bg-danger text-white border-danger'
                            }`}
                    >
                        {status.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
