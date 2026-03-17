require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const session  = require('express-session');
const archiver = require('archiver');
const { execFile } = require('child_process');
const { promisify } = require('util');

const execFileAsync = promisify(execFile);

// ── 스토리지 모드 결정 ─────────────────────────────────────────────
// Supabase URL이 실제 값이면 Supabase, 아니면 로컬 JSON 사용
const USE_SUPABASE = process.env.SUPABASE_URL &&
  process.env.SUPABASE_URL.includes('supabase.co') &&
  !process.env.SUPABASE_URL.includes('placeholder');

let supabase = null;
if (USE_SUPABASE) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  console.log('🗄️  Supabase 모드');
} else {
  console.log('📁 로컬 JSON 모드 (Supabase 키 없음)');
}

// ── 교재 데이터 경로 ───────────────────────────────────────────────
const TEXTBOOKS_DIR = path.join(__dirname, 'textbook_pdf', 'textbooks');
const SCHOOLS_FILE  = path.join(TEXTBOOKS_DIR, 'schools.json');

// ── 로컬 JSON DB ───────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data.json');

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {}
  return { students: [], words: [], grammar_qa: [] };
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }
function now()   { return new Date().toISOString(); }

// ── DB 추상화 레이어 ───────────────────────────────────────────────
// Supabase와 JSON 모드 모두 같은 인터페이스로 동작
const DB = {
  // students
  async getStudents() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    }
    return loadData().students.sort((a, b) => a.created_at > b.created_at ? 1 : -1);
  },
  async getStudent(id) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('students').select('*').eq('id', id).single();
      if (error) throw new Error('학생을 찾을 수 없습니다');
      return data;
    }
    const s = loadData().students.find(s => s.id === id);
    if (!s) throw new Error('학생을 찾을 수 없습니다');
    return s;
  },
  async addStudent(name, school, grade) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('students')
        .insert({ name, school: school || null, grade: grade || null }).select().single();
      if (error) throw new Error('이미 존재하는 이름이거나 오류가 발생했습니다');
      return data;
    }
    const d = loadData();
    if (d.students.find(s => s.name === name)) throw new Error('이미 존재하는 이름입니다');
    const s = { id: newId(), name, school: school || null, grade: grade || null, created_at: now() };
    d.students.push(s); saveData(d); return s;
  },
  async updateStudent(id, updates) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('students').update(updates).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const d = loadData();
    const s = d.students.find(s => s.id === id);
    if (!s) throw new Error('학생을 찾을 수 없습니다');
    if (updates.name && d.students.find(s2 => s2.id !== id && s2.name === updates.name)) throw new Error('이미 존재하는 이름입니다');
    Object.assign(s, updates); saveData(d); return s;
  },
  async deleteStudent(id) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    const d = loadData();
    d.students = d.students.filter(s => s.id !== id);
    d.words    = d.words.filter(w => w.student_id !== id);
    saveData(d);
  },

  // words
  async getWordsByStudent(studentId) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('words').select('*').eq('student_id', studentId).order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    }
    return loadData().words.filter(w => w.student_id === studentId).sort((a, b) => b.created_at > a.created_at ? 1 : -1);
  },
  async getAllWords(status) {
    if (USE_SUPABASE) {
      let q = supabase.from('words').select('*, students(name)').order('created_at', { ascending: false });
      if (status) q = q.eq('status', status);
      const { data, error } = await q;
      if (error) throw new Error(error.message);
      return data;
    }
    const d = loadData();
    let words = d.words.map(w => ({ ...w, students: { name: (d.students.find(s => s.id === w.student_id) || {}).name || '?' } }));
    if (status) words = words.filter(w => w.status === status);
    return words.sort((a, b) => b.created_at > a.created_at ? 1 : -1);
  },
  async addWord(studentId, fields) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('words').insert({ student_id: studentId, ...fields }).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const d = loadData();
    const w = { id: newId(), student_id: studentId, review_count: 0, wrong_count: 0, box: 1, created_at: now(), ...fields };
    d.words.push(w); saveData(d); return w;
  },
  async updateWord(id, updates) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('words').update(updates).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const d = loadData();
    const w = d.words.find(w => w.id === id);
    if (!w) throw new Error('단어를 찾을 수 없습니다');
    Object.assign(w, updates); saveData(d); return w;
  },
  async reviewWord(id, correct) {
    if (USE_SUPABASE) {
      const { data: w, error: e } = await supabase.from('words').select('box,review_count,wrong_count').eq('id', id).single();
      if (e) throw new Error('단어를 찾을 수 없습니다');
      const upd = { box: correct ? Math.min(w.box + 1, 5) : 1, review_count: w.review_count + 1, wrong_count: correct ? w.wrong_count : w.wrong_count + 1 };
      const { data, error } = await supabase.from('words').update(upd).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const d = loadData();
    const w = d.words.find(w => w.id === id);
    if (!w) throw new Error('단어를 찾을 수 없습니다');
    w.box          = correct ? Math.min(w.box + 1, 5) : 1;
    w.review_count = (w.review_count || 0) + 1;
    w.wrong_count  = correct ? (w.wrong_count || 0) : (w.wrong_count || 0) + 1;
    saveData(d); return w;
  },
  async deleteWord(id) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('words').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    const d = loadData();
    d.words = d.words.filter(w => w.id !== id);
    saveData(d);
  },

  // grammar_qa
  async getGrammar() {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('grammar_qa').select('*').order('created_at', { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    }
    return loadData().grammar_qa.sort((a, b) => a.created_at > b.created_at ? 1 : -1);
  },
  async addGrammar(fields) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('grammar_qa').insert(fields).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const d = loadData();
    const g = { id: newId(), created_at: now(), include_in_print: false, status: 'pending', answered_by: null, ...fields };
    d.grammar_qa.push(g); saveData(d); return g;
  },
  async updateGrammar(id, updates) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('grammar_qa').update(updates).eq('id', id).select().single();
      if (error) throw new Error(error.message);
      return data;
    }
    const d = loadData();
    const g = d.grammar_qa.find(g => g.id === id);
    if (!g) throw new Error('항목을 찾을 수 없습니다');
    Object.assign(g, updates); saveData(d); return g;
  },
  async deleteGrammar(id) {
    if (USE_SUPABASE) {
      const { error } = await supabase.from('grammar_qa').delete().eq('id', id);
      if (error) throw new Error(error.message);
      return;
    }
    const d = loadData();
    d.grammar_qa = d.grammar_qa.filter(g => g.id !== id);
    saveData(d);
  },
  async aiAnswerGrammar(id) {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) throw new Error('GEMINI_API_KEY가 설정되지 않았습니다');

    let question;
    if (USE_SUPABASE) {
      const { data, error } = await supabase.from('grammar_qa').select('question').eq('id', id).single();
      if (error || !data) throw new Error('항목을 찾을 수 없습니다');
      question = data.question;
    } else {
      const g = loadData().grammar_qa.find(g => g.id === id);
      if (!g) throw new Error('항목을 찾을 수 없습니다');
      question = g.question;
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `다음 영어 문법 질문에 한국어로 간결하고 명확하게 답변해주세요.\n\n질문: ${question}\n\n답변:` }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        }),
      }
    );
    const aiData = await res.json();
    const answer = aiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '답변 생성 실패';

    return this.updateGrammar(id, { answer, status: 'answered', answered_by: 'ai' });
  },
};

// ── Express 설정 ───────────────────────────────────────────────────
const app = express();
const ALLOWED_ORIGINS = [
  'http://localhost:3002',
  'http://localhost:3000',
  'https://sigongjoa.github.io',
];
app.use(cors({
  origin: (origin, callback) => {
    // 브라우저 직접 요청(origin 없음) 또는 허용된 도메인만 허가
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error('CORS: 허용되지 않은 출처입니다'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: process.env.SESSION_SECRET || 'word-gacha-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8,
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// ── 프린트 디렉터리 ────────────────────────────────────────────────
const PRINT_DIR = path.join(__dirname, 'print');
const PRINT_TMP = path.join(PRINT_DIR, 'tmp');
if (!fs.existsSync(PRINT_TMP)) fs.mkdirSync(PRINT_TMP, { recursive: true });

// ── 관리자 인증 미들웨어 ───────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.status(401).json({ error: '관리자 로그인이 필요합니다' });
}

// ── 에러 래퍼 ─────────────────────────────────────────────────────
function handle(fn) {
  return async (req, res) => {
    try { await fn(req, res); }
    catch (e) { res.status(500).json({ error: e.message }); }
  };
}

// ============================================================
// 인증 API
// ============================================================
app.post('/api/auth/login', (req, res) => {
  const { password } = req.body;
  if (!password) return res.status(400).json({ error: '비밀번호를 입력하세요' });
  if (password !== (process.env.ADMIN_PASSWORD || 'admin1234')) {
    return res.status(401).json({ error: '비밀번호가 틀렸습니다' });
  }
  req.session.isAdmin = true;
  res.json({ success: true });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/check', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

// ============================================================
// 학생 API
// ============================================================
app.get('/api/students', handle(async (req, res) => {
  res.json(await DB.getStudents());
}));

app.get('/api/students/:id', handle(async (req, res) => {
  res.json(await DB.getStudent(req.params.id));
}));

app.post('/api/students', requireAdmin, handle(async (req, res) => {
  const { name, school, grade } = req.body;
  if (!name || !name.trim()) return res.status(400).json({ error: '이름을 입력하세요' });
  res.json(await DB.addStudent(name.trim(), school || null, grade ? Number(grade) : null));
}));

app.patch('/api/students/:id', requireAdmin, handle(async (req, res) => {
  const allowed = ['name', 'school', 'grade'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  if (updates.name !== undefined && !updates.name.trim()) return res.status(400).json({ error: '이름을 입력하세요' });
  if (updates.name) updates.name = updates.name.trim();
  if (updates.grade) updates.grade = Number(updates.grade);
  res.json(await DB.updateStudent(req.params.id, updates));
}));

app.delete('/api/students/:id', requireAdmin, handle(async (req, res) => {
  await DB.deleteStudent(req.params.id);
  res.json({ success: true });
}));

// ============================================================
// 단어 API
// ============================================================
app.get('/api/students/:id/words', handle(async (req, res) => {
  res.json(await DB.getWordsByStudent(req.params.id));
}));

app.get('/api/words', requireAdmin, handle(async (req, res) => {
  res.json(await DB.getAllWords(req.query.status || ''));
}));

app.post('/api/students/:id/words', handle(async (req, res) => {
  const { english, korean, blank_type } = req.body;
  if (!english || !english.trim()) return res.status(400).json({ error: '영어 단어를 입력하세요' });
  if (!korean  || !korean.trim())  return res.status(400).json({ error: '한국어 뜻을 입력하세요' });
  const VALID_BLANK_TYPES = ['korean', 'english'];
  const safeBlankType = VALID_BLANK_TYPES.includes(blank_type) ? blank_type : 'korean';
  const isAdmin = req.session && req.session.isAdmin;
  res.json(await DB.addWord(req.params.id, {
    english:    english.trim(),
    korean:     korean.trim(),
    blank_type: safeBlankType,
    status:     isAdmin ? 'approved' : 'pending',
    added_by:   isAdmin ? 'teacher' : 'student',
  }));
}));

app.patch('/api/words/:id', requireAdmin, handle(async (req, res) => {
  const allowed = ['english', 'korean', 'blank_type', 'status', 'box'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  res.json(await DB.updateWord(req.params.id, updates));
}));

app.post('/api/words/:id/review', requireAdmin, handle(async (req, res) => {
  res.json(await DB.reviewWord(req.params.id, !!req.body.correct));
}));

app.delete('/api/words/:id', requireAdmin, handle(async (req, res) => {
  await DB.deleteWord(req.params.id);
  res.json({ success: true });
}));

// ============================================================
// 문법 Q&A API
// ============================================================
app.get('/api/grammar', handle(async (req, res) => {
  res.json(await DB.getGrammar());
}));

app.post('/api/grammar', handle(async (req, res) => {
  const isAdmin = req.session && req.session.isAdmin;
  const { question, answer, include_in_print, student_id, student_name } = req.body;

  if (!question || !question.trim()) return res.status(400).json({ error: '질문을 입력하세요' });

  if (isAdmin) {
    // 선생님: 질문 + 답변 동시 등록
    if (!answer || !answer.trim()) return res.status(400).json({ error: '답변을 입력하세요' });
    res.json(await DB.addGrammar({
      question: question.trim(),
      answer:   answer.trim(),
      include_in_print: include_in_print !== false,
      status:      'answered',
      answered_by: 'teacher',
      student_id:  null,
      student_name: null,
    }));
  } else {
    // 학생: 질문만 등록
    if (!student_id) return res.status(400).json({ error: 'student_id가 필요합니다' });
    res.json(await DB.addGrammar({
      question:    question.trim(),
      answer:      null,
      include_in_print: false,
      status:      'pending',
      answered_by: null,
      student_id,
      student_name: student_name || null,
    }));
  }
}));

app.post('/api/grammar/:id/ai-answer', requireAdmin, handle(async (req, res) => {
  res.json(await DB.aiAnswerGrammar(req.params.id));
}));

app.patch('/api/grammar/:id', requireAdmin, handle(async (req, res) => {
  const allowed = ['question', 'answer', 'include_in_print', 'status', 'answered_by'];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  res.json(await DB.updateGrammar(req.params.id, updates));
}));

app.delete('/api/grammar/:id', handle(async (req, res) => {
  const isAdmin = req.session && req.session.isAdmin;
  const { student_id } = req.query;

  if (!isAdmin && !student_id) return res.status(401).json({ error: '권한이 없습니다' });

  if (!isAdmin && student_id) {
    // 학생 본인 질문만 삭제 가능
    const list = await DB.getGrammar();
    const g = list.find(g => g.id === req.params.id);
    if (!g) return res.status(404).json({ error: '항목을 찾을 수 없습니다' });
    if (g.student_id !== student_id) return res.status(403).json({ error: '삭제 권한이 없습니다' });
  }

  await DB.deleteGrammar(req.params.id);
  res.json({ success: true });
}));

// ============================================================
// 프린트 API
// ============================================================
function escapeTypst(str) {
  if (!str) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ');
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getDate()).padStart(2, '0')}.`;
}

function selectWordsForPrint(words, maxCount = 20) {
  const active = words.filter(w => w.box < 5);
  const weighted = [];
  active.forEach(w => {
    const weight = [0, 5, 3, 2, 1][w.box] || 1;
    for (let i = 0; i < weight; i++) weighted.push(w);
  });
  for (let i = weighted.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [weighted[i], weighted[j]] = [weighted[j], weighted[i]];
  }
  const seen = new Set(), result = [];
  for (const w of weighted) {
    if (!seen.has(w.id) && result.length < maxCount) { seen.add(w.id); result.push(w); }
  }
  return result;
}

async function buildPDF(templateFile, replacer) {
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  const typFile = path.join(PRINT_TMP, `${id}.typ`);
  const pdfFile = path.join(PRINT_TMP, `${id}.pdf`);
  try {
    const template = fs.readFileSync(templateFile, 'utf8');
    fs.writeFileSync(typFile, replacer(template), 'utf8');
    await execFileAsync('typst', ['compile', '--root', __dirname, typFile, pdfFile]);
    return fs.readFileSync(pdfFile);
  } finally {
    fs.unlink(typFile, () => {});
    fs.unlink(pdfFile, () => {});
  }
}

function injectWordSheet(template, studentName, words, grammarList) {
  const wordLines = words.map(w => {
    const showEn = w.blank_type === 'english' || w.blank_type === 'both';
    const showKo = w.blank_type === 'korean'  || w.blank_type === 'both';
    return `  ("${escapeTypst(w.english)}", "${escapeTypst(w.korean)}", "${showEn ? 'blank' : 'show'}", "${showKo ? 'blank' : 'show'}"),`;
  }).join('\n');

  const grammarLines = grammarList.map(g =>
    `  ("${escapeTypst(g.question)}", "${escapeTypst(g.answer)}"),`
  ).join('\n');

  return template
    .replace(/student\s*=\s*"[^"]*"/, `student = "${escapeTypst(studentName)}"`)
    .replace(/rdate\s*=\s*"[^"]*"/,   `rdate   = "${todayString()}"`)
    .replace(/\/\/ ─── AUTO_WORDS_START[\s\S]*?\/\/ ─── AUTO_WORDS_END/,
      `// ─── AUTO_WORDS_START\n${wordLines}\n// ─── AUTO_WORDS_END`)
    .replace(/\/\/ ─── AUTO_GRAMMAR_START[\s\S]*?\/\/ ─── AUTO_GRAMMAR_END/,
      `// ─── AUTO_GRAMMAR_START\n${grammarLines}\n// ─── AUTO_GRAMMAR_END`);
}

app.post('/api/print/word-sheet', requireAdmin, handle(async (req, res) => {
  const { studentId, grammarIds } = req.body;
  const student = await DB.getStudent(studentId);
  const allWords = await DB.getWordsByStudent(studentId);
  const approved = allWords.filter(w => w.status === 'approved');
  if (!approved.length) return res.status(400).json({ error: '승인된 단어가 없습니다' });

  const words = selectWordsForPrint(approved, 20);
  const allGrammar = await DB.getGrammar();
  const baseList = Array.isArray(grammarIds) && grammarIds.length > 0
    ? allGrammar.filter(g => grammarIds.includes(g.id) && g.status === 'answered')
    : allGrammar.filter(g => g.include_in_print);
  // 선생님 Q&A + 해당 학생 본인 질문만
  const grammarList = baseList.filter(g => !g.student_id || g.student_id === studentId);

  const buf = await buildPDF(
    path.join(PRINT_DIR, 'word-sheet.typ'),
    t => injectWordSheet(t, student.name, words, grammarList)
  );
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition',
    `attachment; filename*=UTF-8''${date}_${encodeURIComponent(student.name)}-words.pdf`);
  res.send(buf);
}));

app.post('/api/print/bulk', requireAdmin, handle(async (req, res) => {
  const { studentIds, grammarIds } = req.body;
  if (!studentIds || !studentIds.length) return res.status(400).json({ error: '학생을 선택하세요' });

  const allGrammar = await DB.getGrammar();
  const baseGrammar = Array.isArray(grammarIds) && grammarIds.length > 0
    ? allGrammar.filter(g => grammarIds.includes(g.id) && g.status === 'answered')
    : allGrammar.filter(g => g.include_in_print);

  const date = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent('단어프린트')}-${date}.zip`);

  const zip = archiver('zip', { zlib: { level: 6 } });
  zip.pipe(res);

  for (const sid of studentIds) {
    try {
      const student  = await DB.getStudent(sid);
      const allWords = await DB.getWordsByStudent(sid);
      const approved = allWords.filter(w => w.status === 'approved');
      if (!approved.length) continue;
      const words = selectWordsForPrint(approved, 20);
      // 학생별: 선생님 Q&A + 본인 질문만
      const grammarList = baseGrammar.filter(g => !g.student_id || g.student_id === sid);
      const buf = await buildPDF(
        path.join(PRINT_DIR, 'word-sheet.typ'),
        t => injectWordSheet(t, student.name, words, grammarList)
      );
      zip.append(buf, { name: `${student.name}-words.pdf` });
    } catch (e) { console.error(`PDF 실패:`, e.message); }
  }
  zip.finalize();
}));

// ============================================================
// 교재 API
// ============================================================

// 학교 목록 + 교재 매핑
app.get('/api/schools', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SCHOOLS_FILE, 'utf8'));
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: '학교 데이터를 불러올 수 없습니다' });
  }
});

// 특정 교재 단어 목록
app.get('/api/textbook/:textbookId/words', handle(async (req, res) => {
  const { textbookId } = req.params;
  const unit = req.query.unit ? Number(req.query.unit) : null;
  const file = path.join(TEXTBOOKS_DIR, `${textbookId}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: '교재 데이터가 없습니다' });
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let words = data.textbook_words || [];
  if (unit) words = words.filter(w => w.unit === unit);
  res.json({ textbook_info: data.textbook_info, lesson_info: data.lesson_info, words, stats: data.stats });
}));

// 특정 교재 문법 목록
app.get('/api/textbook/:textbookId/grammar', handle(async (req, res) => {
  const { textbookId } = req.params;
  const unit = req.query.unit ? Number(req.query.unit) : null;
  const file = path.join(TEXTBOOKS_DIR, `${textbookId}.json`);
  if (!fs.existsSync(file)) return res.status(404).json({ error: '교재 데이터가 없습니다' });
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let grammar = data.textbook_grammar || [];
  if (unit) grammar = grammar.filter(g => g.unit === unit);
  res.json({ textbook_info: data.textbook_info, lesson_info: data.lesson_info, grammar, stats: data.stats });
}));

// 학생의 현재 교재 조회 (학교+학년+학기 기반)
app.get('/api/students/:id/textbook', handle(async (req, res) => {
  const student = await DB.getStudent(req.params.id);
  if (!student.school || !student.grade) return res.json({ textbook_id: null, message: '학교/학년이 설정되지 않았습니다' });

  const schools = JSON.parse(fs.readFileSync(SCHOOLS_FILE, 'utf8'));
  const schoolData = schools.schools[student.school];
  if (!schoolData) return res.json({ textbook_id: null, message: '등록되지 않은 학교입니다' });

  const gradeData = schoolData.textbooks[String(student.grade)];
  if (!gradeData) return res.json({ textbook_id: null, message: '해당 학년 교재가 없습니다' });

  // 현재 월 기준 학기 자동 판단 (3~8월 = 1학기, 9~2월 = 2학기)
  const month = new Date().getMonth() + 1;
  const semester = (month >= 3 && month <= 8) ? 'semester1' : 'semester2';
  const textbookId = gradeData[semester];

  if (!textbookId) return res.json({ textbook_id: null, message: '해당 학기 교재가 없습니다' });

  const file = path.join(TEXTBOOKS_DIR, `${textbookId}.json`);
  if (!fs.existsSync(file)) return res.json({ textbook_id: textbookId, message: '교재 데이터 준비 중입니다' });

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  res.json({
    textbook_id: textbookId,
    textbook_info: data.textbook_info,
    lesson_info: data.lesson_info,
    stats: data.stats,
    school: schoolData.name,
    grade: student.grade,
    semester,
  });
}));

// ============================================================
const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`📖 단어 가챠 서버: http://localhost:${PORT}`);
});
