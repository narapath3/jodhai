import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { transcript } = await request.json();
        if (!transcript || transcript.trim().length === 0) {
            return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
        }

        // Get user's API key from profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('gemini_api_key')
            .eq('id', user.id)
            .single();

        if (!profile?.gemini_api_key) {
            return NextResponse.json({ error: 'กรุณาตั้งค่า Gemini API Key ก่อนใช้งาน' }, { status: 400 });
        }

        // Call Gemini API
        const genAI = new GoogleGenerativeAI(profile.gemini_api_key);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const prompt = `คุณคือ AI ผู้เชี่ยวชาญในการสรุปการประชุมภาษาไทย

จาก transcript การประชุมด้านล่าง ให้สรุปเป็น JSON ดังนี้:

{
  "title": "ชื่อหัวข้อการประชุม (สั้นกระชับ)",
  "summary": "สรุปสาระสำคัญของการประชุม 2-3 ประโยค",
  "action_items": [
    {
      "task": "สิ่งที่ต้องทำ (ชัดเจน เจาะจง)",
      "assignee": "ชื่อผู้รับผิดชอบ (ถ้าระบุใน transcript ไม่งั้นใส่ null)",
      "deadline": "กำหนดส่ง (ถ้าระบุใน transcript ไม่งั้นใส่ null)",
      "priority": "high | medium | low"
    }
  ]
}

กฎสำคัญ:
1. ตอบเป็น JSON อย่างเดียว ห้ามใส่ text อื่น ห้ามใส่ markdown code block
2. ใช้ภาษาไทยทั้งหมด (ยกเว้นคำศัพท์เทคนิค)
3. แยก action item ให้ชัดเจน 1 item = 1 งาน
4. ถ้ามีการกำหนด deadline ให้ระบุวันที่ชัดเจน
5. priority ให้ประเมินจากบริบทการประชุม
6. ถ้า transcript เป็นภาษาไทยปนอังกฤษ ให้เข้าใจทั้งสองภาษา

---
Transcript:
${transcript}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Parse JSON response - try to clean it if needed
        let parsed;
        try {
            // Remove markdown code blocks if present
            const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            parsed = JSON.parse(cleaned);
        } catch {
            return NextResponse.json({
                error: 'AI ไม่สามารถประมวลผล transcript ได้ กรุณาลองใหม่อีกครั้ง'
            }, { status: 500 });
        }

        // Save meeting to Supabase
        const { data: meeting, error: meetingError } = await supabase
            .from('meetings')
            .insert({
                user_id: user.id,
                title: parsed.title || 'การประชุมไม่มีชื่อ',
                transcript: transcript,
                summary: parsed.summary || '',
            })
            .select()
            .single();

        if (meetingError) {
            console.error('Meeting save error:', meetingError);
            // Still return results even if save fails
            return NextResponse.json(parsed);
        }

        // Save action items
        if (parsed.action_items && parsed.action_items.length > 0) {
            const actionItems = parsed.action_items.map((item: Record<string, unknown>) => ({
                meeting_id: meeting.id,
                task: item.task,
                assignee: item.assignee || null,
                deadline: item.deadline || null,
                priority: item.priority || 'medium',
                completed: false,
            }));

            await supabase.from('action_items').insert(actionItems);
        }

        return NextResponse.json({
            ...parsed,
            meeting_id: meeting.id,
        });

    } catch (error) {
        console.error('Process error:', error);
        return NextResponse.json(
            { error: 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง' },
            { status: 500 }
        );
    }
}
