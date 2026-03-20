-- grammar_qa에 grade 컬럼 추가 (1=고1, 2=고2, 3=고3, NULL=전 학년 공통)
ALTER TABLE grammar_qa
  ADD COLUMN IF NOT EXISTS grade SMALLINT CHECK (grade IN (1, 2, 3));

CREATE INDEX IF NOT EXISTS idx_grammar_grade ON grammar_qa(grade);
