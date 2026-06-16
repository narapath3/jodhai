'use client';

import type { ActionItem } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Copy, Check, User, Calendar, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export default function ActionItemsPanel({
    items,
    summary,
    title,
    onCopy,
}: {
    items: ActionItem[];
    summary: string;
    title?: string;
    onCopy: () => void;
}) {
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
    const [copied, setCopied] = useState(false);

    const toggleCheck = (index: number) => {
        setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const formatCopyText = () => {
        let text = `📋 ${title || 'สรุปประชุม'}\n\n`;
        text += `📝 สรุป: ${summary}\n\n`;
        text += `✅ Action Items:\n`;
        items.forEach((item, i) => {
            text += `\n${i + 1}. ${item.task}`;
            if (item.assignee) text += `\n   👤 ผู้รับผิดชอบ: ${item.assignee}`;
            if (item.deadline) text += `\n   📅 กำหนด: ${item.deadline}`;
            text += `\n   🔵 ความสำคัญ: ${item.priority}`;
        });
        return text;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(formatCopyText());
        setCopied(true);
        onCopy();
        setTimeout(() => setCopied(false), 2000);
    };

    const prioChip = (p: string) => {
        const map: Record<string, { cls: string, label: string }> = {
            high: { cls: 'chip-prio-high', label: '🔴 High' },
            medium: { cls: 'chip-prio-med', label: '🟡 Medium' },
            low: { cls: 'chip-prio-low', label: '🟢 Low' }
        };
        const { cls, label } = map[p.toLowerCase()] || map.low;
        return <span className={`chip ${cls}`}>{label}</span>;
    };

    const doneCount = Object.values(checkedItems).filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Stats Bar */}
            <div className="flex gap-4 p-[10px_14px] bg-bg-tertiary rounded-[8px] flex-wrap">
                <div className="text-[12px] text-text-secondary flex items-center gap-[5px]">
                    📋 Action items: <strong className="text-text-primary">{items.length}</strong>
                </div>
                <div className="text-[12px] text-text-secondary flex items-center gap-[5px]">
                    ✅ เสร็จแล้ว: <strong className="text-text-primary">{doneCount}</strong>
                </div>
                {title && (
                    <div className="text-[12px] text-text-secondary flex items-center gap-[5px]">
                        🎯 หัวข้อ: <strong className="text-text-primary">{title}</strong>
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex flex-col gap-2">
                {items.map((item, i) => {
                    const isDone = checkedItems[i];
                    return (
                        <div
                            key={i}
                            className={`flex items-start gap-3 p-[12px_14px] bg-bg-tertiary border border-border rounded-[8px] transition-all ${isDone ? 'opacity-50' : 'hover:border-[#3A4560]'}`}
                        >
                            <div
                                onClick={() => toggleCheck(i)}
                                className={`check-circle ${isDone ? 'checked' : ''}`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className={`text-[14px] leading-[1.5] text-text-primary mb-1.5 font-thai ${isDone ? 'line-through text-text-muted' : ''}`}>
                                    {item.task}
                                </div>
                                <div className="flex gap-[5px] flex-wrap">
                                    {item.assignee && (
                                        <span className="chip chip-owner">👤 {item.assignee}</span>
                                    )}
                                    {item.deadline && (
                                        <span className="chip chip-due">📅 {item.deadline}</span>
                                    )}
                                    {prioChip(item.priority)}
                                    {item.notes && (
                                        <span className="chip bg-bg-primary text-text-muted border border-border">
                                            <MessageSquare className="w-2.5 h-2.5" /> {item.notes}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Export Row */}
            <div className="flex gap-2 mt-4 flex-wrap">
                <button
                    onClick={handleCopy}
                    className="text-[12px] py-[6px] px-[14px] rounded-[7px] border border-border bg-bg-tertiary text-text-secondary hover:border-accent hover:text-accent transition-all flex items-center gap-[5px]"
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy ทั้งหมด
                </button>
            </div>
        </div>
    );
}
