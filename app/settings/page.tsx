'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SettingsPage() {
    const { user, session, loading: authLoading } = useAuth();
    const [apiKey, setApiKey] = useState('');
    const [currentKeyPreview, setCurrentKeyPreview] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
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
                showToast('บันทึก API Key สำเร็จ!', 'success');
                setCurrentKeyPreview(`${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`);
                setApiKey('');
            } else {
                showToast('ไม่สามารถบันทึกได้ ลองใหม่อีกครั้ง', 'error');
            }
        } catch {
            showToast('เกิดข้อผิดพลาด', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-8 h-8 rounded-full border-2 border-[var(--color-accent-start)] border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center animate-fade-in">
                    <p className="text-[var(--color-text-secondary)] mb-4">กรุณาเข้าสู่ระบบ</p>
                    <Link href="/login" className="btn-primary">เข้าสู่ระบบ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold gradient-text mb-8">ตั้งค่า</h1>

            {/* Profile */}
            <div className="glass-card p-6 mb-6 animate-fade-in">
                <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">บัญชี</h2>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))' }}>
                        {user.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{user.email}</p>
                        <p className="text-xs text-[var(--color-text-muted)]">สมัครเมื่อ {new Date(user.created_at).toLocaleDateString('th-TH')}</p>
                    </div>
                </div>
            </div>

            {/* API Key */}
            <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
                <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">Gemini API Key</h2>

                {currentKeyPreview && (
                    <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--color-border)] mb-4" style={{ background: 'rgba(52, 211, 153, 0.05)' }}>
                        <span className="text-[var(--color-success)]">✓</span>
                        <div>
                            <p className="text-sm text-[var(--color-text-primary)]">API Key ปัจจุบัน</p>
                            <p className="text-xs text-[var(--color-text-muted)] font-mono">{currentKeyPreview}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1.5">
                            {currentKeyPreview ? 'เปลี่ยน API Key' : 'ใส่ API Key'}
                        </label>
                        <input
                            type="password"
                            className="input-field"
                            placeholder="AIza..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>

                    <div className="p-3 rounded-lg border border-[var(--color-border)]" style={{ background: 'rgba(129, 140, 248, 0.05)' }}>
                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                            💡 ขอ API Key ฟรีได้ที่{' '}
                            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                                className="text-[var(--color-accent-start)] hover:underline">
                                aistudio.google.com
                            </a>
                            {' '}— ใช้ได้ฟรี 1,500 ครั้ง/วัน
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving || !apiKey.trim()}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                กำลังบันทึก...
                            </>
                        ) : (
                            'บันทึก API Key'
                        )}
                    </button>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
}
