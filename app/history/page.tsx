'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, type Meeting, type ActionItem } from '@/lib/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Calendar, CheckSquare, ChevronRight, ArrowLeft, Loader2, ClipboardList, PenLine, FileText } from 'lucide-react';
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 text-accent animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
                <header className="mb-8">
                    <div className="logo inline-flex items-center gap-2 text-[13px] font-semibold tracking-[.06em] uppercase text-accent mb-[10px]">
                        <div className="logo-dot" /> Meeting-to-Action
                    </div>
                    <h1 className="text-[26px] font-semibold tracking-[-.3px] mb-[6px]">ประวัติการประชุม</h1>
                </header>
                <div className="card p-8 max-w-sm w-full">
                    <History className="w-12 h-12 text-text-muted mx-auto mb-6" />
                    <p className="text-sm text-text-secondary mb-6">เข้าสู่ระบบเพื่อเข้าถึงประวัติและ Action Items ของคุณ</p>
                    <Link href="/login" className="btn-run w-full inline-block text-center">เข้าสู่ระบบ</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <AnimatePresence mode="wait">
                {selectedMeeting ? (
                    <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <header className="flex items-center justify-between">
                            <button
                                onClick={() => setSelectedMeeting(null)}
                                className="flex items-center gap-2 text-text-secondary hover:text-accent transition-all text-sm font-semibold"
                            >
                                <ArrowLeft className="w-4 h-4" /> ย้อนกลับ
                            </button>
                            <div className="text-[11px] text-text-muted font-mono">
                                ID: {selectedMeeting.id.slice(0, 8)}
                            </div>
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-7">
                                <div className="card">
                                    <div className="p-[12px_16px] border-b border-border text-[12px] font-semibold uppercase text-text-secondary flex items-center gap-[6px]">
                                        <div className="w-[6px] height-[6px] rounded-full bg-accent-green" /> Action Items
                                    </div>
                                    <div className="p-4">
                                        <ActionItemsPanel
                                            items={selectedMeeting.action_items}
                                            summary={selectedMeeting.summary}
                                            title={selectedMeeting.title}
                                            onCopy={() => { }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-5 space-y-6">
                                <div className="card">
                                    <div className="p-[12px_16px] border-b border-border text-[12px] font-semibold uppercase text-text-secondary flex items-center gap-[6px]">
                                        <PenLine className="w-4 h-4 text-accent" /> Transcript ต้นฉบับ
                                    </div>
                                    <div className="p-4 max-h-[400px] overflow-y-auto font-thai text-[13px] leading-[1.8] text-text-secondary whitespace-pre-wrap">
                                        {selectedMeeting.transcript}
                                    </div>
                                </div>

                                <div className="card p-[12px_16px] flex items-center justify-between">
                                    <div className="text-[12px] text-text-muted font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> ประชุมเมื่อ
                                    </div>
                                    <span className="text-[13px] text-text-primary font-bold">
                                        {new Date(selectedMeeting.created_at).toLocaleDateString('th-TH', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-8"
                    >
                        <header className="text-center">
                            <div className="logo inline-flex items-center gap-2 text-[13px] font-semibold tracking-[.06em] uppercase text-accent mb-[10px]">
                                <div className="logo-dot" /> Meeting-to-Action
                            </div>
                            <h1 className="text-[26px] font-semibold tracking-[-.3px] mb-[6px]">ประวัติการประชุม</h1>
                            <p className="text-sm text-text-secondary">สรุป Meeting ทั้งหมดที่คุณได้ทำไว้</p>
                        </header>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div className="card p-4 flex flex-col items-center justify-center text-center">
                                <span className="text-[24px] font-bold text-accent">{meetings.length}</span>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest">การประชุม</span>
                            </div>
                            <div className="card p-4 flex flex-col items-center justify-center text-center sm:col-span-2">
                                <span className="text-[24px] font-bold text-accent-green">
                                    {meetings.reduce((sum, m) => sum + m.action_items.length, 0)}
                                </span>
                                <span className="text-[10px] text-text-muted uppercase tracking-widest">ACTION ITEMS ที่ได้รับ</span>
                            </div>
                        </div>

                        {meetings.length === 0 ? (
                            <div className="card py-20 text-center">
                                <ClipboardList className="w-16 h-16 text-text-muted mx-auto mb-6 opacity-30" />
                                <h3 className="text-[16px] font-bold text-text-primary mb-2">ยังไม่มีประวัติการประชุม</h3>
                                <p className="text-sm text-text-muted mb-8 max-w-[280px] mx-auto text-center font-thai">
                                    สรุปการประชุมครั้งแรกของคุณเพื่อเริ่มเก็บประวัติ
                                </p>
                                <Link href="/" className="btn-run inline-flex items-center gap-2">
                                    เริ่มสรุปการประชุม <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {meetings.map((meeting, i) => (
                                    <button
                                        key={meeting.id}
                                        onClick={() => setSelectedMeeting(meeting)}
                                        className="card p-5 text-left group hover:border-accent transition-all flex flex-col justify-between h-full"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="inline-flex items-center gap-2 text-[10px] font-bold text-text-muted uppercase tracking-widest bg-bg-tertiary py-1 px-3 rounded-full border border-border">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(meeting.created_at).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })}
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all" />
                                            </div>
                                            <h3 className="text-[16px] font-bold mb-2 line-clamp-1 group-hover:text-accent transition-colors font-thai">
                                                {meeting.title}
                                            </h3>
                                            <p className="text-text-secondary text-[13px] leading-relaxed line-clamp-2 mb-4 font-thai">
                                                {meeting.summary}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 border-t border-border pt-4">
                                            <div className="flex items-center gap-1.5">
                                                <CheckSquare className="w-3.5 h-3.5 text-accent-green" />
                                                <span className="text-[12px] font-bold text-text-secondary uppercase">
                                                    {meeting.action_items.length} Action Items
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
