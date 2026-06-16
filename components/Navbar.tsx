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
        <nav className="sticky top-0 z-50 border-b border-border bg-bg-primary/80 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="logo-dot" />
                        <span className="text-[14px] font-bold tracking-tight text-text-primary uppercase letter-spacing-[.05em]">
                            จดให้ <span className="text-text-muted font-normal text-[11px] ml-1 hidden sm:inline">| Meeting-to-Action</span>
                        </span>
                    </Link>

                    {/* Right Section */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="flex items-center gap-2 px-2 py-1 rounded-[8px] hover:bg-bg-secondary transition-all group"
                                >
                                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center overflow-hidden">
                                        <User className="w-3.5 h-3.5 text-accent" />
                                    </div>
                                    <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showMenu && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                                className="absolute right-0 mt-2 w-52 rounded-[10px] border border-border bg-bg-secondary shadow-xl z-50 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-border bg-bg-tertiary">
                                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-0.5">Signed in as</p>
                                                    <p className="text-[12px] font-semibold text-text-primary truncate">{user.email}</p>
                                                </div>
                                                <div className="p-1.5 space-y-0.5">
                                                    <Link href="/" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px] text-text-secondary hover:bg-bg-tertiary hover:text-accent transition-all">
                                                        <LayoutDashboard className="w-3.5 h-3.5" /> แดชบอร์ด
                                                    </Link>
                                                    <Link href="/history" onClick={() => setShowMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-[6px] text-[13px] text-text-secondary hover:bg-bg-tertiary hover:text-accent transition-all">
                                                        <History className="w-3.5 h-3.5" /> ประวัติการประชุม
                                                    </Link>
                                                    <hr className="border-border my-1 mx-1.5" />
                                                    <button
                                                        onClick={() => { signOut(); setShowMenu(false); }}
                                                        className="flex items-center gap-2 w-full px-3 py-2 rounded-[6px] text-[13px] text-danger hover:bg-danger/10 transition-all font-medium"
                                                    >
                                                        <LogOut className="w-3.5 h-3.5" /> ออกจากระบบ
                                                    </button>
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link href="/login" className="text-[13px] font-semibold text-accent hover:underline px-2">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
