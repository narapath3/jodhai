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
        <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 relative">
            <Link href="/" className="absolute top-8 left-8 p-2 rounded-full hover:bg-white/5 text-zinc-500 transition-colors hidden sm:flex items-center gap-2 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
            </Link>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                {/* Logo Card */}
                <div className="text-center mb-10">
                    <motion.div
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold text-white mx-auto mb-6 shadow-2xl shadow-indigo-500/20"
                        style={{ background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))' }}>
                        จ
                    </motion.div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                        {isSignUp ? 'สร้างบัญชีผู้ใช้' : 'ยินดีต้อนรับกลับ'}
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-tight">
                        {isSignUp ? 'เริ่มเปลี่ยนการประชุมให้เป็น Action Items ทันที' : 'เข้าสู่ระบบเพื่อจัดการประชุมของคุณต่อ'}
                    </p>
                </div>

                {/* Login Form */}
                <div className="glass-card p-8 shadow-2xl relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="block text-sm font-bold text-zinc-400 ml-1">อีเมล</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="email"
                                    className="input-field w-full !pl-12"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="block text-sm font-bold text-zinc-400">รหัสผ่าน</label>
                                {!isSignUp && (
                                    <button type="button" className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                                        ลืมรหัสผ่าน?
                                    </button>
                                )}
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="password"
                                    className="input-field w-full !pl-12"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium"
                                >
                                    {error}
                                </motion.div>
                            )}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium"
                                >
                                    {success}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 h-14 text-base"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isSignUp ? 'สร้างบัญชีฟรี' : 'เข้าสู่ระบบ'}
                                    <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>

                        <div className="text-center pt-4">
                            <button
                                type="button"
                                onClick={() => { setIsSignUp(!isSignUp); setError(''); setSuccess(''); }}
                                className="text-sm font-bold text-zinc-500 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto"
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
