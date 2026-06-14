-- จดให้ (Meeting-to-Action) — Supabase Database Setup
-- วิธีใช้: ไปที่ Supabase Dashboard > SQL Editor > New query > วาง SQL นี้ > Run

-- 1. ตาราง profiles — เก็บ API key ของ user
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  gemini_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ตาราง meetings — ประวัติการประชุม
CREATE TABLE IF NOT EXISTS meetings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'การประชุมไม่มีชื่อ',
  transcript TEXT NOT NULL,
  summary TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ตาราง action_items — action items จากการประชุม
CREATE TABLE IF NOT EXISTS action_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  task TEXT NOT NULL,
  assignee TEXT,
  deadline TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT FALSE
);

-- 4. Row Level Security (RLS) — ให้ user เห็นเฉพาะข้อมูลของตัวเอง
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Profiles: user ดู/แก้ได้เฉพาะของตัวเอง
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Meetings: user ดู/สร้าง/ลบได้เฉพาะของตัวเอง
CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meetings" ON meetings
  FOR DELETE USING (auth.uid() = user_id);

-- Action Items: user ดู/สร้าง/แก้/ลบได้ผ่าน meeting ของตัวเอง
CREATE POLICY "Users can view own action items" ON action_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM meetings WHERE meetings.id = action_items.meeting_id AND meetings.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own action items" ON action_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM meetings WHERE meetings.id = action_items.meeting_id AND meetings.user_id = auth.uid())
  );

CREATE POLICY "Users can update own action items" ON action_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM meetings WHERE meetings.id = action_items.meeting_id AND meetings.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own action items" ON action_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM meetings WHERE meetings.id = action_items.meeting_id AND meetings.user_id = auth.uid())
  );

-- 5. Auto-create profile เมื่อ user สมัครใหม่
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: เมื่อมี user ใหม่ใน auth.users → สร้าง profile อัตโนมัติ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 6. Indexes สำหรับ performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at ON meetings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON action_items(meeting_id);
