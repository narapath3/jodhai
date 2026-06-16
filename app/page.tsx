'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ActionItemsPanel from '@/components/ActionItemsPanel';
import SettingsModal from '@/components/SettingsModal';
import AudioRecorder from '@/components/AudioRecorder';
import type { ActionItem } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, ClipboardList, PenLine, Key, Loader2, AlertCircle, ArrowRight, LayoutDashboard, FileText, CheckCircle2 } from 'lucide-react';

type ProcessResult = {
  summary: string;
  meeting_topic?: string;
  action_items: ActionItem[];
  blockers?: string[];
  decisions?: string[];
  meeting_id?: string;
};

const EXAMPLES = [
  "โอเคทีม วันนี้เรา align กันก่อนนะครับ sprint นี้เป้าหลักคือต้องส่ง landing page ให้เสร็จก่อน 20 มิถุนา ห้ามเลยนะ ให้ธนัชส่ง Figma design ให้น้องนัทภายในพรุ่งนี้เย็น และสำหรับ API integration ให้ปอรอให้ฝั่ง backend พี่โจก่อน deadline ของพี่โจคือศุกร์นี้ ถ้าไม่ได้ก็ต้องแจ้งทีมทันที อ้อแล้วก็อย่าลืมว่าเราต้องทำ QA รอบนึงก่อน deploy นะครับ ให้น้องมายด์เป็นคนดูแล และสรุปผล QA ส่งมาให้ผมภายใน 18 มิถุนา",
  "โอเคทุกคน วันนี้เราคุยเรื่อง campaign เดือนหน้าก่อนเลยนะ ธีมหลักคือ back to school เนาวรัตน์คุณช่วยทำ brief ส่งให้ agency ภายในวันพุธนี้ได้ไหม แล้วก็ budget ที่ขอไปตอนนี้ยังอยู่ที่ฝ่ายการเงิน ให้คุณภูมิ follow up วันพรุ่งนี้เช้าเลยนะครับ สำหรับ content plan บน IG กับ TikTok ให้ทีม creative ส่ง draft มาให้ดูภายในวันศุกร์ และอย่าลืมว่า KPI ของ campaign นี้คือ reach 500k ภายใน 2 สัปดาห์",
  "สวัสดีครับคุณวรรณา วันนี้เราเอา proposal มาให้ดูนะครับ หลังจากคุณวรรณา review แล้ว ขอให้ส่ง feedback กลับมาภายในวันจันทร์หน้านะครับ เรื่อง timeline นั้นถ้าเริ่ม July 1 เราน่าจะ deliver ได้ภายใน 8 สัปดาห์ milestone แรกคือ discovery phase เสร็จภายใน 2 สัปดาห์ แล้วก็มี kickoff meeting ที่ต้องนัดกันก่อน ขอให้คุณวรรณาช่วย confirm วันกับ stakeholder ฝั่งคุณด้วยนะครับ ราคาตามที่คุยกันไว้ 350,000 บาท ขอ PO ภายในสิ้นเดือนนี้เลยได้ไหมครับ"
];

export default function HomePage() {
  const { user, session, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'input' | 'actions' | 'summary'>('input');
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [model, setModel] = useState('gemini-1.5-flash');

  useEffect(() => {
    if (session?.access_token) {
      fetch('/api/settings', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((res) => res.json())
        .then((data) => setHasApiKey(data.has_api_key))
        .catch(() => { });
    }
  }, [session]);

  const handleTranscriptUpdate = (newText: string) => {
    setTranscript((prev) => {
      const separator = prev && !prev.endsWith(' ') ? ' ' : '';
      return prev + separator + newText;
    });
  };

  const handleProcess = async () => {
    if (!transcript.trim() || !session?.access_token) return;

    setProcessing(true);
    setError('');

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          transcript: transcript.trim(),
          model: model
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        return;
      }

      setResult(data);
      setActiveTab('actions'); // Switch to results automatically
    } catch {
      setError('ไม่สามารถเชื่อมต่อ server ได้ กรุณาลองใหม่');
    } finally {
      setProcessing(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center space-y-8 py-12">
        <header className="mb-12">
          <div className="logo inline-flex items-center gap-2 text-[13px] font-semibold tracking-[.06em] uppercase text-accent mb-[10px]">
            <div className="logo-dot" /> Meeting-to-Action
          </div>
          <h1 className="text-[26px] font-semibold tracking-[-.3px] mb-[6px]">
            สรุป Transcript ด้วย <span className="text-accent">AI Genius</span>
          </h1>
          <p className="text-sm text-text-secondary">วาง transcript ภาษาไทย → ได้ action items พร้อมใช้ทันที</p>
        </header>

        <div className="flex flex-col items-center gap-6">
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/login"
            className="btn-run !px-8 !py-4 text-lg"
          >
            เริ่มใช้งานฟรี <ArrowRight className="w-5 h-5 ml-2" />
          </motion.a>
          <p className="text-text-muted text-sm">ประมวลผลด้วย Google Gemini — ปลอดภัยและรวดเร็ว</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="logo inline-flex items-center gap-2 text-[13px] font-semibold tracking-[.06em] uppercase text-accent mb-[10px]">
          <div className="logo-dot" /> Meeting-to-Action
        </div>
        <h1 className="text-[26px] font-semibold tracking-[-.3px] mb-[6px]">
          สรุป Transcript ด้วย <span className="text-accent">Gemini AI</span>
        </h1>
        <p className="text-sm text-text-secondary">วาง transcript ภาษาไทย → ได้ action items พร้อมใช้ทันที</p>
      </header>

      {/* Simplified API Key Row */}
      <div className="flex items-center gap-[10px] bg-bg-secondary border border-border rounded-[10px] padding-[12px_14px] p-3">
        <span className="text-[12px] text-text-secondary whitespace-nowrap flex-shrink-0">🔑 Gemini API Key</span>
        <div className="flex-1 text-[13px] font-mono text-text-muted truncate px-2">
          {hasApiKey ? '••••••••••••••••••••••••••••••' : 'ยังไม่ได้ตั้งค่าคีย์'}
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className={`text-[10px] py-[3px] px-[8px] rounded-[6px] border ${hasApiKey ? 'bg-[rgba(61,220,132,.12)] text-accent-green border-[rgba(61,220,132,.3)]' : 'bg-bg-tertiary text-text-muted border-border'}`}
        >
          {hasApiKey ? '✓ ตั้งค่าแล้ว' : 'ตั้งค่าทันที'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('input')}
          className={`flex-1 py-3 px-4 rounded-[10px] border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${activeTab === 'input' ? 'bg-bg-tertiary border-accent text-accent' : 'bg-bg-secondary border-border text-text-secondary hover:border-text-muted'}`}
        >
          <PenLine className="w-4 h-4" /> Input
        </button>
        <button
          onClick={() => setActiveTab('actions')}
          className={`flex-1 py-3 px-4 rounded-[10px] border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${activeTab === 'actions' ? 'bg-bg-tertiary border-accent text-accent' : 'bg-bg-secondary border-border text-text-secondary hover:border-text-muted'}`}
        >
          <CheckCircle2 className="w-4 h-4" /> Action items
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-3 px-4 rounded-[10px] border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${activeTab === 'summary' ? 'bg-bg-tertiary border-accent text-accent' : 'bg-bg-secondary border-border text-text-secondary hover:border-text-muted'}`}
        >
          <FileText className="w-4 h-4" /> Summary
        </button>
      </div>

      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card"
            >
              <div className="p-[12px_16px] border-b border-border flex items-center justify-between">
                <div className="text-[12px] font-semibold tracking-[.06em] uppercase text-text-secondary flex items-center gap-[6px]">
                  <div className="w-[6px] height-[6px] rounded-full bg-accent" /> Transcript ประชุม
                </div>
                <span className="text-[11px] text-text-muted">{transcript.length.toLocaleString()} ตัวอักษร</span>
              </div>

              <textarea
                className="w-full bg-transparent border-none outline-none resize-none text-[14px] leading-[1.7] p-[14px_16px] min-h-[300px] font-thai"
                placeholder="วาง transcript ที่นี่... หรือใช้ปุ่มอัดเสียงด้านล่าง"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />

              <div className="px-4 pb-3 flex gap-2 flex-wrap border-b border-border">
                <span className="text-[11px] text-text-muted leading-[28px]">ตัวอย่าง:</span>
                {['Sprint', 'Marketing', 'Client'].map((label, i) => (
                  <button key={i} onClick={() => setTranscript(EXAMPLES[i])} className="text-[11px] py-[4px] px-[10px] rounded-[6px] border border-border bg-bg-tertiary text-text-secondary hover:border-accent hover:text-accent transition-all">
                    📋 {label}
                  </button>
                ))}
              </div>

              <div className="p-[12px_16px] flex items-center justify-between gap-[10px] flex-wrap">
                <div className="flex items-center gap-[8px] text-[12px] text-text-secondary">
                  Model:
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-bg-tertiary border border-border text-text-primary text-[12px] p-[5px_8px] rounded-[6px] outline-none cursor-pointer"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <AudioRecorder
                    onTranscriptUpdate={handleTranscriptUpdate}
                    isProcessing={processing}
                  />
                  <button
                    onClick={handleProcess}
                    disabled={processing || !transcript.trim() || !hasApiKey}
                    className="btn-run disabled:opacity-40"
                  >
                    {processing ? (
                      <><Loader2 className="w-[14px] height-[14px] animate-spin-custom" /> กำลังสรุป...</>
                    ) : (
                      <>✦ สรุป Action Items</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'actions' && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card"
            >
              <div className="p-[12px_16px] border-b border-border flex items-center justify-between">
                <div className="text-[12px] font-semibold tracking-[.06em] uppercase text-text-secondary flex items-center gap-[6px]">
                  <div className="w-[6px] height-[6px] rounded-full bg-accent-green" /> ผลลัพธ์ Action Items
                </div>
              </div>
              <div className="p-4">
                {result ? (
                  <ActionItemsPanel
                    items={result.action_items}
                    summary={result.summary}
                    onCopy={() => showToast('📋 คัดลอกสำเร็จ!')}
                  />
                ) : (
                  <div className="text-center py-20 text-text-muted">
                    <div className="text-[28px] mb-2">🎯</div>
                    วาง transcript แล้วกด "สรุป Action Items" เพื่อเริ่มต้น
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="card"
            >
              <div className="p-[12px_16px] border-b border-border flex items-center justify-between">
                <div className="text-[12px] font-semibold tracking-[.06em] uppercase text-text-secondary flex items-center gap-[6px]">
                  <div className="w-[6px] height-[6px] rounded-full bg-purple-500" /> สรุปภาพรวม
                </div>
              </div>
              <div className="p-6">
                {result ? (
                  <div className="space-y-6">
                    <div className="text-[14px] leading-[1.7] text-text-secondary p-[12px_14px] bg-bg-tertiary rounded-[8px] border-l-[3px] border-accent font-thai">
                      {result.summary}
                    </div>

                    {result.blockers && result.blockers.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[11px] text-text-muted mb-2 uppercase tracking-wide">⚠ Blockers</div>
                        {result.blockers.map((b, i) => (
                          <div key={i} className="text-[13px] text-orange-400 py-2 border-b border-border font-thai">• {b}</div>
                        ))}
                      </div>
                    )}

                    {result.decisions && result.decisions.length > 0 && (
                      <div className="mt-4">
                        <div className="text-[11px] text-text-muted mb-2 uppercase tracking-wide">✅ Decisions</div>
                        {result.decisions.map((d, i) => (
                          <div key={i} className="text-[13px] text-text-secondary py-2 border-b border-border font-thai">• {d}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-20 text-text-muted">
                    <div className="text-[28px] mb-2">📝</div>
                    ยังไม่มีข้อมูลสรุป
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <div className="p-[12px_14px] bg-[rgba(244,103,66,.1)] border border-[rgba(244,103,66,.3)] rounded-[8px] text-[13px] text-[#F48A6A]">
          ⚠ {error}
        </div>
      )}

      {/* Developer Section */}
      <div className="mt-12 space-y-4">
        <div className="text-[11px] font-bold tracking-[.07em] uppercase text-text-muted">⬇ Prompt & Code สำหรับ Developer</div>

        <div className="card">
          <div className="p-[12px_16px] border-b border-border flex items-center justify-between">
            <div className="text-[12px] font-semibold tracking-[.06em] uppercase text-text-secondary flex items-center gap-[6px]">
              <div className="w-[6px] height-[6px] rounded-full bg-warning" /> System Prompt (Thai-optimised)
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('คุณคือ AI ผู้ช่วยสรุปการประชุมภาษาไทย...');
                showToast('Prompt copied!');
              }}
              className="text-[11px] py-[3px] px-[10px] rounded-[5px] border border-border bg-bg-tertiary text-text-secondary hover:text-accent transition-all"
            >
              Copy
            </button>
          </div>
          <pre className="bg-[#0A0D14] p-4 overflow-x-auto text-[12px] leading-[1.7] text-[#C9D1E8] font-mono">
            {"{\n  \"summary\": \"สรุปสั้นๆ...\",\n  \"meeting_topic\": \"หัวข้อ...\",\n  \"action_items\": [\n    { \"task\": \"...\", \"assignee\": \"...\", \"deadline\": \"...\", \"priority\": \"high\" }\n  ]\n}"}
          </pre>
        </div>
      </div>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false);
          if (session?.access_token) {
            fetch('/api/settings', {
              headers: { Authorization: `Bearer ${session.access_token}` },
            })
              .then((res) => res.json())
              .then((data) => setHasApiKey(data.has_api_key))
              .catch(() => { });
          }
        }}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 bg-accent text-white px-4 py-2 rounded-lg text-sm z-50 shadow-lg animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
}
