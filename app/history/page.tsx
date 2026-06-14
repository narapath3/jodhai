'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Meeting, type ActionItem } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Calendar, CheckSquare, Search, ChevronRight, ArrowLeft, Loader2, ClipboardList, PenLine } from 'lucide-react';
import ActionItemsPanel from '@/components/ActionItemsPanel';

type MeetingWithItems = Meeting & { action_items: ActionItem[] };

export default function HistoryPage() {
    const { user, session, loading: authLoading } = useAuth();
    const [meetings, setMeetings] = useState<MeetingWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMeeting, setSelectedMeeting] = useState<MeetingWithItems | null>(null);

    useEffect(() => {
        if (!user || !session) return;

        const fetchMeetings = async () => {
            const { data: meetingsData } = await supabase
                .from('meetings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (meetingsData) {
                const withItems: MeetingWithItems[] = [];
                for (const meeting of meetingsData) {
                    const { data: items } = await supabase
                        .from('action_items')
                        .select('*')
                        .eq('meeting_id', meeting.id);
                    withItems.push({ ...meeting, action_items: items || [] });
                }
                setMeetings(withItems);
            }
            setLoading(false);
        };

        fetchMeetings();
    }, [user, session]);

    if (authLoading || loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex flex-col items-center justify-center min-h-[40vh]">
                    <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
                    <p className="text-zinc-500 animate-pulse">กำลังโหลดประวัติประชุม...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <div className="glass-card p-12 text-center max-w-sm">
                    <History className="w-16 h-16 text-zinc-700 mx-auto mb-6" />
                    <h2 className="text-xl font-bold mb-4">เข้าสู่ระบบเพื่อดูประวัติ</h2>
                    <Link href="/login" className="btn-primary w-full inline-block">เข้าสู่ระบบ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <AnimatePresence mode="wait">
                {selectedMeeting ? (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Header & Sidebar */}
                        <div className="lg:col-span-12 mb-4">
                            <button
                                onClick={() => setSelectedMeeting(null)}
                                className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-4"
                            >
                                <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 transition-all">
                                    <ArrowLeft className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest pt-0.5">ย้อนกลับ</span>
                            </button>
                        </div>

                        <div className="lg:col-span-7">
                            <ActionItemsPanel
                                items={selectedMeeting.action_items}
                                summary={selectedMeeting.summary}
                                title={selectedMeeting.title}
                                onCopy={() => { }}
                            />
                        </div>

                        <div className="lg:col-span-5 space-y-6">
                            <div className="glass-card p-6 border-white/5">
                                <div className="flex items-center gap-2 text-zinc-400 mb-6 font-bold text-xs uppercase tracking-widest">
                                    <PenLine className="w-4 h-4 text-indigo-400" /> Transcript ต้นฉบับ
                                </div>
                                <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    <pre className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed font-medium">
                                        {selectedMeeting.transcript}
                                    </pre>
                                </div>
                            </div>

                            <div className="glass-card p-6 pt-4 border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-zinc-500 font-bold uppercase tracking-widest">
                                    <Calendar className="w-4 h-4" /> ประชุมเมื่อ
                                </div>
                                <span className="text-sm text-zinc-300 font-bold">
                                    {new Date(selectedMeeting.created_at).toLocaleDateString('th-TH', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                                    <History className="w-7 h-7" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-extrabold tracking-tight">ประวัติการประชุม</h1>
                                    <p className="text-zinc-500 font-medium">รายการสรุปประชุมทั้งหมดของคุณ</p>
                                </div>
                            </div>
                            <div className="glass-card px-4 py-2 flex items-center gap-6 border-white/5">
                                <div className="text-center">
                                    <p className="text-xl font-bold accent-text">{meetings.length}</p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Meeting</p>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-center">
                                    <p className="text-xl font-bold accent-text">
                                        {meetings.reduce((sum, m) => sum + m.action_items.length, 0)}
                                    </p>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Actions</p>
                                </div>
                            </div>
                        </div>

                        {meetings.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-32 glass-card bg-white/[0.02]"
                            >
                                <ClipboardList className="w-20 h-20 text-zinc-800 mx-auto mb-6" />
                                <h3 className="text-xl font-bold mb-2">ยังไม่มีประวัติการประชุม</h3>
                                <p className="text-zinc-500 mb-8 max-w-xs mx-auto text-sm leading-relaxed">
                                    เมื่อคุณสรุปประชุม ระบบจะเก็บรายการไว้ที่นี่เพื่อให้คุณย้อนกลับมาดูได้ทุกเมื่อ
                                </p>
                                <Link href="/" className="btn-primary inline-flex items-center gap-2">
                                    ไปสรุปการประชุมครั้งแรก <ChevronRight className="w-4 h-4" />
                                </Link>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {meetings.map((meeting, i) => (
                                    <motion.button
                                        key={meeting.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.01, y: -2 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => setSelectedMeeting(meeting)}
                                        className="glass-card p-6 text-left group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="inline-flex items-center gap-2 text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest bg-white/5 py-1 px-3 rounded-full border border-white/5">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(meeting.created_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-indigo-500 group-hover:border-indigo-500 transition-all duration-300">
                                                    <ChevronRight className="w-4 h-4 group-hover:text-white" />
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-bold mb-3 line-clamp-1 group-hover:accent-text transition-colors duration-300">
                                                {meeting.title}
                                            </h3>
                                            <p className="text-zinc-400 text-sm leading-relaxed line-clamp-2 mb-6">
                                                {meeting.summary}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 border-t border-white/5 pt-4">
                                            <div className="flex items-center gap-1.5">
                                                <CheckSquare className="w-4 h-4 text-emerald-500" />
                                                <span className="text-xs font-bold text-zinc-300">
                                                    {meeting.action_items.length} Action Items
                                                </span>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
