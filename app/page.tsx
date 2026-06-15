'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ActionItemsPanel from '@/components/ActionItemsPanel';
import SettingsModal from '@/components/SettingsModal';
import AudioRecorder from '@/components/AudioRecorder';
import type { ActionItem } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, ClipboardList, PenLine, Key, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

type ProcessResult = {
  title: string;
  summary: string;
  action_items: ActionItem[];
  meeting_id?: string;
};

export default function HomePage() {
  const { user, session, loading } = useAuth();
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<ProcessResult | null>(null);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isAutoProcess, setIsAutoProcess] = useState(false);
  const [lastProcessedLength, setLastProcessedLength] = useState(0);

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

  // Auto-summarize logic
  useEffect(() => {
    if (!isAutoProcess || processing || !transcript.trim() || !hasApiKey) return;

    const currentLength = transcript.length;
    // Trigger if transcript has grown significantly (e.g., ~200 characters)
    if (currentLength - lastProcessedLength > 200) {
      handleProcess();
      setLastProcessedLength(currentLength);
    }
  }, [transcript, isAutoProcess, processing, hasApiKey, lastProcessedLength]);

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
    setResult(null);

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ transcript: transcript.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        return;
      }

      setResult(data);
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">กำลังเตรียมความพร้อม...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-8"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-indigo-300 font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            AI ประมวลผลจาก Google Gemini — ฟรี 100%
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight">
            ประชุมเสร็จ <br />
            <span className="accent-text drop-shadow-[0_0_30px_rgba(99,102,241,0.3)]">จดให้ ทันที</span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            เปลี่ยนเสียงและข้อความจากการประชุมภาษาไทย <br />
            ให้กลายเป็น <span className="text-white font-semibold">Action Items</span> ที่ชัดเจน พร้อมทีมและเดดไลน์
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/login"
              className="btn-primary flex items-center gap-2 text-lg shadow-indigo-500/20 shadow-xl"
            >
              เริ่มใช้งานฟรี <ArrowRight className="w-5 h-5" />
            </motion.a>
            <motion.a
              whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
              href="#features"
              className="btn-secondary"
            >
              ดูฟีเจอร์เพิ่มเติม
            </motion.a>
          </div>

          <motion.div
            id="features"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24"
          >
            {[
              { icon: Zap, title: 'สายฟ้าแลบ', desc: 'ประมวลผลสรุปในเวลาไม่กี่วินาที ไม่ต้องรอนาน', color: 'text-yellow-400' },
              { icon: PenLine, title: 'เข้าใจภาษาไทย', desc: 'เก่งวิเคราะห์ภาษาไทยเป็นคำพูดและสลับอังกฤษ', color: 'text-emerald-400' },
              { icon: ClipboardList, title: 'Action-First', desc: 'เน้นสิ่งที่ต้องทำต่อ ไม่ใช่แค่สรุปยาวๆ ที่ไม่มีใครอ่าน', color: 'text-indigo-400' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass-card p-8 text-left group"
                >
                  <div className={`p-3 rounded-xl bg-white/5 w-fit mb-6 group-hover:scale-110 transition-transform ${f.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Auth'd App UI
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <AnimatePresence>
        {!hasApiKey && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-yellow-500/20 bg-yellow-500/5">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-500" />
                <div className="text-sm">
                  <p className="font-bold text-yellow-500">กรุณาตั้งค่า API Key</p>
                  <p className="text-zinc-400">แอปต้องการ Gemini API Key เพื่อประมวลผล (ใช้ฟรี 100%)</p>
                </div>
              </div>
              <button onClick={() => setShowSettings(true)} className="btn-primary !py-2 !px-6 text-sm flex items-center gap-2">
                <Key className="w-4 h-4" /> ตั้งค่าทันที
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="glass-card p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="w-24 h-24 text-indigo-500" />
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <PenLine className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold">เริ่มสรุปประชุม</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 font-medium">สรุปอัตโนมัติ</span>
                <button
                  onClick={() => setIsAutoProcess(!isAutoProcess)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${isAutoProcess ? 'bg-indigo-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${isAutoProcess ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <textarea
              className="input-field w-full min-h-[350px] font-medium leading-relaxed text-lg"
              placeholder="วาง transcript หรือข้อความจากการประชุมลงที่นี่..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Zap className="w-4 h-4" />
                <span>พร้อมประมวลผลภาษาไทย/อังกฤษ</span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <AudioRecorder
                  onTranscriptUpdate={handleTranscriptUpdate}
                  isProcessing={processing}
                />
                {transcript && (
                  <button onClick={() => setTranscript('')} className="btn-secondary !py-3 flex-1 sm:flex-none">ล้างข้อมูล</button>
                )}
                <button
                  onClick={handleProcess}
                  disabled={processing || !transcript.trim() || !hasApiKey}
                  className="btn-primary !py-3 flex-1 sm:flex-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  {processing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> กำลังประมวลผล...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> สร้าง Action Items</>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Right: Preview / Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5"
        >
          <AnimatePresence mode="wait">
            {!result && !processing ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center glass-card p-12 text-center text-zinc-500"
              >
                <div className="w-20 h-20 rounded-full bg-indigo-500/5 flex items-center justify-center mb-6">
                  <ClipboardList className="w-10 h-10 opacity-20" />
                </div>
                <p className="font-medium">ยังไม่มีผลลัพธ์</p>
                <p className="text-sm mt-2 opacity-60">ใส่ข้อมูลการประชุมทางซ้ายเพื่อเริ่มงาน</p>
              </motion.div>
            ) : processing ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card p-8 space-y-6"
              >
                <div className="space-y-3">
                  <div className="h-8 bg-white/5 rounded-lg animate-pulse w-2/3" />
                  <div className="h-4 bg-white/5 rounded-lg animate-pulse w-full" />
                </div>
                <div className="space-y-4 pt-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-2">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-white/5 rounded animate-pulse w-1/2" />
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <ActionItemsPanel
                  items={result!.action_items}
                  summary={result!.summary}
                  title={result!.title}
                  onCopy={() => showToast('📋 คัดลอกสำเร็จ!')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="toast toast-success"
        >
          {toast}
        </motion.div>
      )}
    </div>
  );
}
