'use client';

import type { ActionItem } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Copy, Check, User, Calendar, Flag, ListTodo } from 'lucide-react';
import { useState } from 'react';

export default function ActionItemsPanel({
    items,
    summary,
    title,
    onCopy,
}: {
    items: ActionItem[];
    summary: string;
    title: string;
    onCopy: () => void;
}) {
    const [copied, setCopied] = useState(false);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = [...items].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    const formatCopyText = () => {
        let text = `📋 ${title}\n\n`;
        text += `📝 สรุป: ${summary}\n\n`;
        text += `✅ Action Items:\n`;
        sorted.forEach((item, i) => {
            text += `\n${i + 1}. ${item.task}`;
            if (item.assignee) text += `\n   👤 ผู้รับผิดชอบ: ${item.assignee}`;
            if (item.deadline) text += `\n   📅 กำหนด: ${item.deadline}`;
            text += `\n   🔔 ความสำคัญ: ${item.priority === 'high' ? 'สูง' : item.priority === 'medium' ? 'ปานกลาง' : 'ต่ำ'}`;
        });
        text += `\n\n— สรุปโดย จดให้ (Meeting-to-Action)`;
        return text;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formatCopyText());
        setCopied(true);
        onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="glass-card p-6 border-indigo-500/20 bg-indigo-500/5">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold accent-text mb-2">{title}</h2>
                        <p className="text-zinc-400 text-sm leading-relaxed">{summary}</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopy}
                        className="btn-secondary !p-3 flex items-center justify-center shrink-0"
                    >
                        {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                    </motion.button>
                </div>

                <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-zinc-500" />
                        <span className="text-xs font-bold text-zinc-300">{items.length} งาน</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Flag className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-zinc-300">{items.filter(i => i.priority === 'high').length} สำคัญสูง</span>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {sorted.map((item, index) => (
                    <motion.div
                        key={item.id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`glass-card p-5 group relative overflow-hidden ${item.priority === 'high' ? 'border-red-500/10' : ''
                            }`}
                    >
                        {item.priority === 'high' && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                        )}

                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${item.priority === 'high' ? 'text-red-400 border-red-500/30 bg-red-500/5' :
                                            item.priority === 'medium' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' :
                                                'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                                        }`}>
                                        {item.priority}
                                    </span>
                                </div>

                                <h4 className="text-[var(--color-text-primary)] font-semibold leading-relaxed">
                                    {item.task}
                                </h4>

                                {(item.assignee || item.deadline) && (
                                    <div className="flex flex-wrap items-center gap-4 mt-3">
                                        {item.assignee && (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded-md">
                                                <User className="w-3 h-3 text-indigo-400" />
                                                {item.assignee}
                                            </div>
                                        )}
                                        {item.deadline && (
                                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-white/5 px-2 py-1 rounded-md">
                                                <Calendar className="w-3 h-3 text-indigo-400" />
                                                {item.deadline}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
