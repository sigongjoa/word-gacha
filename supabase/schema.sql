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
  answer           TEXT,                          -- 학생 질문은 답변 없이 시작
  include_in_print BOOLEAN NOT NULL DEFAULT true,
  student_id       UUID REFERENCES students(id) ON DELETE SET NULL,
  student_name     TEXT,                          -- 질문한 학생 이름 (표시용)
  status           TEXT NOT NULL DEFAULT 'answered' CHECK (status IN ('pending', 'answered')),
  answered_by      TEXT CHECK (answered_by IN ('teacher', 'ai')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grammar_include ON grammar_qa(include_in_print);
CREATE INDEX IF NOT EXISTS idx_grammar_status  ON grammar_qa(status);

-- ============================================
-- 마이그레이션 (기존 DB에 실행):
-- ALTER TABLE grammar_qa
--   ALTER COLUMN answer DROP NOT NULL,
--   ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE SET NULL,
--   ADD COLUMN IF NOT EXISTS student_name TEXT,
--   ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'answered' CHECK (status IN ('pending', 'answered')),
--   ADD COLUMN IF NOT EXISTS answered_by TEXT CHECK (answered_by IN ('teacher', 'ai'));
-- ============================================

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

-- ============================================
-- 5. Writing Sessions 테이블 (수행평가 연습)
-- ============================================
CREATE TABLE IF NOT EXISTS writing_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  problem_type   TEXT NOT NULL CHECK (problem_type IN ('sentence_completion','word_arrangement','summary_writing','free_writing')),
  problem        JSONB NOT NULL,       -- 문제 전체 구조
  target_words   JSONB NOT NULL,       -- [{id,english,korean}] 목표 단어
  student_answer TEXT,                 -- 제출 답안 (null=미제출)
  grade          JSONB,                -- 채점 결과 (null=미채점)
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_writing_student ON writing_sessions(student_id, created_at DESC);

ALTER TABLE writing_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "deny_anon_writing" ON writing_sessions FOR ALL TO anon USING (false) WITH CHECK (false);
