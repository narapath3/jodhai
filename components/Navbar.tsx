'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, History, Settings as SettingsIcon, LayoutDashboard, User, ChevronDown } from 'lucide-react';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#05050a]/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 5, scale: 1.1 }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-indigo-500/20"
                            style={{ background: 'linear-gradient(135deg, var(--color-accent-start), var(--color-accent-end))' }}>
                            จ
                        </motion.div>
                        <span className="text-xl font-bold gradient-text tracking-tight">จดให้</span>
                    </Link>

                    {/* Nav links */}
                    <div className="hidden md:flex items-center gap-1">
                        {user ? (
                            <>
                                <Link href="/" className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" /> แดชบอร์ด
                                </Link>
                                <Link href="/history" className="px-4 py-2 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2">
                                    <History className="w-4 h-4" /> ประวัติการประชุม
                                </Link>
                            </>
                        ) : null}
                    </div>

                    {/* User Section */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-indigo-500/20 group-hover:ring-indigo-500/40 transition-all overflow-hidden bg-indigo-500/20">
                                        <User className="w-4 h-4 text-indigo-400" />
                                    </div>
                                    <span className="hidden lg:block text-sm font-medium text-zinc-300 max-w-[120px] truncate">
                                        {user.email?.split('@')[0]}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
                                </motion.button>

                                <AnimatePresence>
                                    {showMenu && (
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowMenu(false)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                className="absolute right-0 mt-3 w-64 rounded-2xl border border-white/10 bg-[#0c0c14] shadow-2xl z-50 overflow-hidden shadow-black/80"
                                            >
                                                <div className="px-5 py-4 border-b border-white/5 bg-white/5 mb-1">
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Signed in as</p>
                                                    <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                                                </div>
                                                <div className="p-2 space-y-1">
                                                    <Link href="/settings"
                                                        onClick={() => setShowMenu(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all">
                                                        <SettingsIcon className="w-4 h-4" /> ตั้งค่า API Key
                                                    </Link>
                                                    <Link href="/history"
                                                        onClick={() => setShowMenu(false)}
                                                        className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-zinc-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all md:hidden">
                                                        <History className="w-4 h-4" /> ประวัติการประชุม
                                                    </Link>
                                                    <hr className="border-white/5 my-1 mx-2" />
                                                    <button
                                                        onClick={() => { signOut(); setShowMenu(false); }}
                                                        className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-all">
                                                        <LogOut className="w-4 h-4" /> ออกจากระบบ
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className="btn-primary !py-2.5 !px-6 text-sm">
                                เข้าสู่ระบบ
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
