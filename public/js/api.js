const API = {
  _token() { return localStorage.getItem('adminToken') },

  async _fetch(path, options = {}) {
    const token = this._token()
    const res = await fetch(CONFIG.FUNCTIONS_URL + path, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }))
      throw new Error(err.error || '요청 실패')
    }
    return res.json()
  },

  // 인증
  async login(password) {
    const data = await this._fetch('/auth/login', { method: 'POST', body: JSON.stringify({ password }) })
    if (data.token) localStorage.setItem('adminToken', data.token)
    return data
  },
  async logout() {
    localStorage.removeItem('adminToken')
    return { success: true }
  },
  async checkAuth() {
    return { isAdmin: !!this._token() }
  },

  // 학생
  async getStudents()           { return this._fetch('/students') },
  async getStudent(id)          { return this._fetch(`/students/${id}`) },
  async addStudent(name)        { return this._fetch('/students', { method: 'POST', body: JSON.stringify({ name }) }) },
  async updateStudent(id, name) { return this._fetch(`/students/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }) },
  async deleteStudent(id)       { return this._fetch(`/students/${id}`, { method: 'DELETE' }) },

  // 단어 (학생)
  async getMyWords(studentId)         { return this._fetch(`/words?student_id=${studentId}`) },
  async addWord(studentId, wordData)  { return this._fetch('/words', { method: 'POST', body: JSON.stringify({ student_id: studentId, ...wordData }) }) },

  // 단어 (관리자)
  async getAllWords(status)      { return this._fetch(`/words${status ? `?status=${status}` : ''}`) },
  async updateWord(id, updates)  { return this._fetch(`/words/${id}`, { method: 'PATCH', body: JSON.stringify(updates) }) },
  async reviewWord(id, correct)  { return this._fetch(`/words/${id}/review`, { method: 'POST', body: JSON.stringify({ correct }) }) },
  async deleteWord(id)           { return this._fetch(`/words/${id}`, { method: 'DELETE' }) },

  // 시험지 AI 생성 (grammarIds: 선택된 문법 Q&A ID 배열, 빈 배열이면 문법 제외)
  async generatePrint(studentIds, grammarIds = []) {
    return this._fetch('/generate-print', { method: 'POST', body: JSON.stringify({ studentIds, grammarIds }) })
  },

  // 문법 Q&A (공통)
  async getGrammar()            { return this._fetch('/grammar') },

  // 문법 Q&A (관리자 — 질문+답변 동시 등록)
  async addGrammar(data)        { return this._fetch('/grammar', { method: 'POST', body: JSON.stringify(data) }) },
  async updateGrammar(id, data) { return this._fetch(`/grammar/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) },
  async deleteGrammar(id)       { return this._fetch(`/grammar/${id}`, { method: 'DELETE' }) },
  async aiAnswerGrammar(id)     { return this._fetch(`/grammar/${id}/ai-answer`, { method: 'POST' }) },

  // 문법 Q&A (학생 — 질문만 등록)
  async addGrammarQuestion(studentId, studentName, question) {
    return this._fetch('/grammar', {
      method: 'POST',
      body: JSON.stringify({ student_id: studentId, student_name: studentName, question }),
    })
  },

  // 문법 Q&A (학생 — 본인 질문 삭제)
  async deleteGrammarQuestion(id, studentId) {
    return this._fetch(`/grammar/${id}?student_id=${encodeURIComponent(studentId)}`, { method: 'DELETE' })
  },
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

window.API = API
window.downloadBlob = downloadBlob
