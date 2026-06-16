'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, Loader2, ArrowLeft, Mail, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
    const { signIn, signUp } = useAuth();
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        if (isSignUp) {
            const { error } = await signUp(email, password);
            if (error) {
                setError(error.message);
            } else {
                setSuccess('สมัครสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยัน');
            }
        } else {
            const { error } = await signIn(email, password);
            if (error) {
                setError(error.message);
            } else {
                router.push('/');
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 relative">
            <Link href="/" className="absolute top-8 left-8 p-2 rounded-full hover:bg-bg-secondary text-text-muted transition-colors hidden sm:flex items-center gap-2 text-[12px] font-semibold uppercase tracking-widest">
                <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[400px]"
            >
                {/* Logo Section */}
                <div className="text-center mb-8">
                    <div className="logo inline-flex items-center gap-2 text-[14px] font-heavy tracking-[.06em] uppercase text-accent mb-[12px]">
                        <div className="logo-dot" /> Meeting-to-Action
                    </div>
                    <h1 className="text-[26px] font-semibold tracking-[-.3px] mb-[6px] text-text-primary">
                        {isSignUp ? 'สร้างบัญชีผู้ใช้' : 'ยินดีต้อนรับกลับ'}
                    </h1>
                    <p className="text-sm text-text-secondary">
                        {isSignUp ? 'เริ่มสรุปการประชุมให้เป็น Action Items ทันที' : 'เข้าสู่ระบบเพื่อจัดการประชุมของคุณต่อ'}
                    </p>
                </div>

                {/* Form Card */}
                <div className="card p-6 shadow-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[12px] font-semibold text-text-secondary ml-1">อีเมล</label>
                            <input
                                type="email"
                                className="w-full bg-bg-tertiary border border-border rounded-[8px] p-[10px_12px] text-[14px] text-text-primary outline-none focus:border-accent transition-all"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-[12px] font-semibold text-text-secondary">รหัสผ่าน</label>
                                {!isSignUp && (
                                    <button type="button" className="text-[11px] text-accent hover:underline font-semibold">
                                        ลืมรหัสผ่าน?
                                    </button>
                                )}
                            </div>
                            <input
                                type="password"
                                className="w-full bg-bg-tertiary border border-border rounded-[8px] p-[10px_12px] text-[14px] text-text-primary outline-none focus:border-accent transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        <AnimatePresence>
                            {(error || success) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`p-3 rounded-[8px] text-[12px] font-medium border ${error
                                            ? 'bg-danger/10 border-danger/20 text-danger'
                                            : 'bg-accent-green/10 border-accent-green/20 text-accent-green'
                                        }`}
                                >
                                    {error || success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-run w-full flex items-center justify-center gap-2 h-11 text-[14px] font-bold"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin-custom" />
                            ) : (
                                <>
                                    {isSignUp ? 'สร้างบัญชีฟรี' : 'เข้าสู่ระบบ'}
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
                                className="text-[12px] font-semibold text-text-muted hover:text-text-primary transition-all"
                            >
                                {isSignUp ? 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบ' : 'ยังไม่มีบัญชี? สมัครสมาชิก'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
