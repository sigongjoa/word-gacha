-- ============================================
-- Word-Gacha Supabase Database Schema
-- ============================================
-- Supabase SQL Editor에서 실행하세요
-- https://app.supabase.com/project/_/sql

-- ============================================
-- 1. Students 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_name ON students(name);

-- ============================================
-- 2. Words 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS words (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  english      TEXT NOT NULL,
  korean       TEXT NOT NULL,
  blank_type   TEXT NOT NULL DEFAULT 'korean' CHECK (blank_type IN ('english', 'korean', 'both')),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  box          INTEGER NOT NULL DEFAULT 1 CHECK (box BETWEEN 1 AND 5),
  review_count INTEGER NOT NULL DEFAULT 0,
  wrong_count  INTEGER NOT NULL DEFAULT 0,
  added_by     TEXT NOT NULL DEFAULT 'student' CHECK (added_by IN ('student', 'teacher')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_words_student_id  ON words(student_id);
CREATE INDEX IF NOT EXISTS idx_words_status       ON words(status);
CREATE INDEX IF NOT EXISTS idx_words_box          ON words(box);
CREATE INDEX IF NOT EXISTS idx_words_created_at   ON words(created_at DESC);

-- ============================================
-- 3. Grammar Q&A 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS grammar_qa (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question         TEXT NOT NULL,
  answer           TEXT NOT NULL,
  include_in_print BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grammar_include ON grammar_qa(include_in_print);

-- ============================================
-- 4. RLS (Row Level Security) — 공개 접근
-- ============================================
ALTER TABLE students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE words     ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_qa ENABLE ROW LEVEL SECURITY;

-- 서버(service role)에서만 접근 → 프론트에서 직접 접근 차단
-- anon 키는 아무것도 못 함
CREATE POLICY "deny_anon_students"   ON students   FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_words"      ON words      FOR ALL TO anon USING (false) WITH CHECK (false);
CREATE POLICY "deny_anon_grammar_qa" ON grammar_qa FOR ALL TO anon USING (false) WITH CHECK (false);

-- service_role은 RLS 우회 → 별도 정책 불필요
