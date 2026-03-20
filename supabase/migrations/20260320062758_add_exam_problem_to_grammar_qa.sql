-- grammar_qa에 exam_problem JSONB 컬럼 추가 (미리 생성된 4지선다 문제 캐시)
-- 형태: {"sentence":"...","answer":"...","options":["a","b","c","d"],"grammar_point":"..."}
ALTER TABLE grammar_qa
  ADD COLUMN IF NOT EXISTS exam_problem JSONB;
