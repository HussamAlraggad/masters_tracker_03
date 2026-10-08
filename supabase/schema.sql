-- Master's Tracker Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  university TEXT DEFAULT 'Hashemite University',
  faculty TEXT DEFAULT 'Prince Al-Hussein Bin Abdullah II Faculty of IT',
  department TEXT DEFAULT 'Software Engineering',
  major TEXT DEFAULT 'SWE Master',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table (scraped from HU)
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL UNIQUE,
  course_name TEXT NOT NULL,
  course_name_ar TEXT,
  credits INTEGER DEFAULT 3,
  semester INTEGER,
  classification TEXT CHECK (classification IN ('CORE', 'ELECTIVE', 'THESIS', 'EXAM')),
  prerequisites TEXT[],
  description TEXT,
  source_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course status table (user's progress)
CREATE TABLE course_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('planned', 'in_progress', 'completed', 'dropped', 'failed', 'exempted')) DEFAULT 'planned',
  grade TEXT,
  semester_taken INTEGER,
  year_taken INTEGER,
  credits_earned INTEGER DEFAULT 0,
  notes TEXT,
  started_at DATE,
  completed_at DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Scraped sources log
CREATE TABLE scraped_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_url TEXT NOT NULL UNIQUE,
  program_id TEXT,
  department_id TEXT,
  selector_config JSONB,
  last_scraped TIMESTAMPTZ,
  scrape_status TEXT CHECK (scrape_status IN ('success', 'failed', 'pending')) DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_course_status_user ON course_status(user_id);
CREATE INDEX idx_course_status_course ON course_status(course_id);
CREATE INDEX idx_courses_semester ON courses(semester);
CREATE INDEX idx_courses_classification ON courses(classification);
CREATE INDEX idx_courses_active ON courses(is_active);
CREATE INDEX idx_scraped_sources_url ON scraped_sources(source_url);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraped_sources ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Course status policies
CREATE POLICY "Users can view own course status" ON course_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own course status" ON course_status
  FOR ALL USING (auth.uid() = user_id);

-- Courses policies (read-only for users, admin can write)
CREATE POLICY "Anyone can view active courses" ON courses
  FOR SELECT USING (is_active = TRUE);

-- Scraped sources policies (admin only for write)
CREATE POLICY "Anyone can view scrape logs" ON scraped_sources
  FOR SELECT USING (TRUE);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_course_status_updated_at
  BEFORE UPDATE ON course_status
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime for course_status
ALTER PUBLICATION supabase_realtime ADD TABLE course_status;
ALTER PUBLICATION supabase_realtime ADD TABLE courses;

-- Seed initial HU SWE Master's courses
INSERT INTO courses (course_code, course_name, credits, semester, classification, is_active) VALUES
  ('121003723', 'Advanced Software Engineering', 3, 1, 'CORE', true),
  ('121003732', 'Software Design and Architecture', 3, 1, 'CORE', true),
  ('121003751', 'Software Engineering Tools and Methods', 3, 1, 'CORE', true),
  ('121003763', 'Requirements Engineering', 3, 1, 'CORE', true),
  ('121003740', 'Software Quality Engineering', 3, 2, 'CORE', true),
  ('121003710', 'Software Testing', 3, 2, 'CORE', true),
  ('121003736', 'Software Project Management', 3, 2, 'CORE', true),
  ('121003724', 'Distributed Software Development', 3, 2, 'CORE', true),
  ('121003752', 'Advanced Software Process', 3, 3, 'CORE', true),
  ('121003714', 'Software Maintenance and Evolution', 3, 3, 'CORE', true),
  ('121003721', 'Mobile Applications Development', 3, 3, 'ELECTIVE', true),
  ('121003795', 'Selected Topics in Software Engineering', 3, 3, 'ELECTIVE', true),
  ('121003798', 'Research Project', 3, 4, 'THESIS', true),
  ('121003790', 'Comprehensive Exam', 0, 4, 'EXAM', true),
  ('1003799', 'Thesis', 9, 4, 'THESIS', true),
  ('31003799', 'Thesis (3 credits)', 3, 4, 'THESIS', true),
  ('61003799', 'Thesis (6 credits)', 6, 4, 'THESIS', true),
  ('91003799', 'Thesis (9 credits)', 9, 4, 'THESIS', true)
ON CONFLICT (course_code) DO UPDATE SET
  course_name = EXCLUDED.course_name,
  credits = EXCLUDED.credits,
  semester = EXCLUDED.semester,
  classification = EXCLUDED.classification,
  is_active = EXCLUDED.is_active;