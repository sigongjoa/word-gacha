/**
 * 학교알리미 교과용도서 현황 자동 크롤러
 * - schoolinfo.go.kr에서 학교별 사용 교재 목록을 Playwright로 추출
 * - 결과를 textbook_pdf/schoolbooks_{학교명}.json 으로 저장
 *
 * 사용법:
 *   node scripts/crawl_schoolinfo.js                   ← 기본 (시지고 + 덕원고)
 *   node scripts/crawl_schoolinfo.js --school 시지고    ← 특정 학교만
 *   node scripts/crawl_schoolinfo.js --year 2026       ← 연도 지정
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// ── 대상 학교 목록 ─────────────────────────────────────────────────
const SCHOOLS = [
  { name: '시지고등학교', code: 'D100000658', crse: '4', knd: '04' },
  { name: '덕원고등학교', code: 'D100000243', crse: '4', knd: '04' },
  // 중학교 추가 시:
  // { name: '시지중학교',   code: 'D200000XXX', crse: '3', knd: '03' },
];

const OUTPUT_DIR = path.join(__dirname, '..', 'textbook_pdf');
const BASE_URL   = 'https://www.schoolinfo.go.kr';

// CLI 파라미터 파싱
const args      = process.argv.slice(2);
const schoolArg = args[args.indexOf('--school') + 1];
const yearArg   = args[args.indexOf('--year')   + 1] || new Date().getFullYear();
const targets   = schoolArg
  ? SCHOOLS.filter(s => s.name.includes(schoolArg))
  : SCHOOLS;

// ── 메인 ──────────────────────────────────────────────────────────
(async () => {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = {};

  for (const school of targets) {
    console.log(`\n📚 ${school.name} 크롤링 시작...`);
    try {
      const data = await crawlSchool(browser, school, yearArg);
      results[school.name] = data;

      const outFile = path.join(OUTPUT_DIR, `schoolbooks_${school.name}.json`);
      fs.writeFileSync(outFile, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ 저장 완료: ${outFile}`);
      console.log(`   총 ${data.books.length}개 교과서 추출`);
    } catch (e) {
      console.error(`❌ ${school.name} 실패:`, e.message);
      results[school.name] = { error: e.message };
    }
  }

  await browser.close();

  // 전체 결과 합본 저장
  const summaryFile = path.join(OUTPUT_DIR, 'schoolbooks_all.json');
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\n📦 합본 저장: ${summaryFile}`);
  printSummary(results);
})();

// ── 학교 1개 크롤링 ────────────────────────────────────────────────
async function crawlSchool(browser, school, year) {
  const page = await browser.newPage();

  // 불필요한 리소스 차단으로 속도 향상
  await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2,ttf,ico}', r => r.abort());

  const schoolUrl = `${BASE_URL}/ng/go/pnnggo_a01_l2.do?schulCode=${school.code}`;
  console.log(`  → ${schoolUrl}`);

  // ① 학교 정보 메인 페이지 접근
  const res = await page.goto(schoolUrl, {
    waitUntil: 'networkidle',
    timeout: 30000,
  }).catch(e => null);

  // 서버 점검 중 여부 확인
  const bodyText = await page.textContent('body').catch(() => '');
  if (bodyText.includes('서비스 일시 중단') || bodyText.includes('error')) {
    throw new Error('학교알리미 서버 점검 중. 나중에 다시 시도하세요.');
  }

  // ② 교과용도서 현황 탭으로 이동
  // 학교알리미는 SPA — 탭 클릭 또는 직접 URL 이동
  const tbUrl = `${BASE_URL}/ei/pp/Pneipp_b38_s0p.do`
    + `?schulCode=${school.code}`
    + `&schulCrseScCode=${school.crse}`
    + `&schulKndScCode=${school.knd}`;

  console.log(`  → 교과용도서 현황 탭 접근`);
  await page.goto(tbUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => null);

  // 탭 직접 클릭 방식도 시도
  const tabTexts = ['교과용도서', '교과서', '사용도서'];
  for (const txt of tabTexts) {
    const tab = page.locator(`text="${txt}"`).first();
    if (await tab.isVisible().catch(() => false)) {
      await tab.click();
      await page.waitForTimeout(2000);
      break;
    }
  }

  // ③ 데이터 테이블 대기 (최대 10초)
  await page.waitForSelector('table, .tbl_wrap, .list_wrap, .board_wrap', {
    timeout: 10000,
  }).catch(() => console.log('  ⚠️  테이블 셀렉터 대기 시간 초과, 계속 진행'));

  await page.waitForTimeout(1500);

  // ④ 페이지 스크린샷 저장 (디버그용)
  const shotFile = path.join(OUTPUT_DIR, `debug_${school.name}.png`);
  await page.screenshot({ path: shotFile, fullPage: true });
  console.log(`  📸 스크린샷: ${shotFile}`);

  // ⑤ 교과서 데이터 추출
  const books = await extractBooks(page, school, year);

  await page.close();
  return {
    school: school.name,
    schulCode: school.code,
    crawledAt: new Date().toISOString(),
    year: Number(year),
    books,
  };
}

// ── 교과서 데이터 추출 (다양한 HTML 구조 대응) ─────────────────────
async function extractBooks(page, school, year) {
  const books = [];

  // 전략 A: <table> 태그에서 추출
  const tableBooks = await page.evaluate((yr) => {
    const results = [];
    const tables = document.querySelectorAll('table');

    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      // 헤더 분석
      const headers = [];
      const headerRow = table.querySelector('thead tr, tr:first-child');
      if (headerRow) {
        headerRow.querySelectorAll('th, td').forEach(cell => {
          headers.push(cell.textContent.trim());
        });
      }

      rows.forEach((row, rowIdx) => {
        if (rowIdx === 0) return; // 헤더 스킵
        const cells = row.querySelectorAll('td');
        if (cells.length < 2) return;

        const cellTexts = Array.from(cells).map(c => c.textContent.trim());

        // 교과서 행인지 판단 (학년/과목/출판사 패턴)
        const hasGrade  = cellTexts.some(t => /[1-3]학년|1학기|2학기|공통/.test(t));
        const hasPublisher = cellTexts.some(t =>
          /미래엔|천재|비상|동아|지학사|금성|YBM|능률|교학사|씨마스/.test(t)
        );

        if (hasGrade || hasPublisher || cellTexts.length >= 3) {
          const book = {};

          // 헤더 기반 매핑
          cellTexts.forEach((text, i) => {
            const header = headers[i] || `col${i}`;
            if (/학년/.test(header) || /학년/.test(text)) book.grade = text;
            else if (/학기/.test(header)) book.semester = text;
            else if (/과목|교과/.test(header)) book.subject = text;
            else if (/도서명|교과서|제목/.test(header)) book.title = text;
            else if (/출판사|발행/.test(header)) book.publisher = text;
            else if (/저자|작가/.test(header)) book.author = text;
            else if (!book.subject && i === 1) book.subject = text;
            else if (!book.title && i === 2) book.title = text;
            else if (!book.publisher && i === 3) book.publisher = text;
            else if (!book.author && i === 4) book.author = text;
          });

          if (book.subject || book.title) {
            book.raw = cellTexts;
            results.push(book);
          }
        }
      });
    });
    return results;
  }, year);

  books.push(...tableBooks);

  // 전략 B: 텍스트 기반 파싱 (테이블이 없거나 빈 경우)
  if (books.length === 0) {
    console.log('  ⚠️  테이블 추출 실패 → 텍스트 파싱 시도');
    const textBooks = await page.evaluate(() => {
      const results = [];
      const publisherRegex = /미래엔|천재교육|비상교육|동아출판|지학사|금성출판|YBM|능률|교학사|씨마스|창비|해냄|좋은책신사고/;
      const body = document.body.innerText;
      const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      for (let i = 0; i < lines.length; i++) {
        if (publisherRegex.test(lines[i])) {
          results.push({
            subject: lines[i - 2] || '',
            title:   lines[i - 1] || '',
            publisher: lines[i],
            author: lines[i + 1] || '',
            raw: lines.slice(Math.max(0, i-3), i+3),
          });
        }
      }
      return results;
    });
    books.push(...textBooks);
  }

  // 전략 C: 페이지 전체 텍스트 저장 (완전 실패 시 원문 보존)
  if (books.length === 0) {
    console.log('  ⚠️  자동 추출 실패 → 전체 텍스트 저장');
    const fullText = await page.evaluate(() => document.body.innerText);
    const rawFile = path.join(
      __dirname, '..', 'textbook_pdf',
      `raw_text_${school.name}.txt`
    );
    fs.writeFileSync(rawFile, fullText, 'utf8');
    console.log(`  📄 원문 저장: ${rawFile}`);
  }

  return books;
}

// ── 결과 요약 출력 ─────────────────────────────────────────────────
function printSummary(results) {
  console.log('\n' + '='.repeat(50));
  console.log('📊 크롤링 결과 요약');
  console.log('='.repeat(50));

  for (const [name, data] of Object.entries(results)) {
    if (data.error) {
      console.log(`❌ ${name}: ${data.error}`);
    } else {
      console.log(`\n✅ ${name} (${data.year}학년도)`);
      console.log(`   교과서 수: ${data.books.length}개`);

      // 영어 교재만 필터해서 출력
      const engBooks = data.books.filter(b =>
        /영어|English/.test(b.subject || b.title || (b.raw || []).join(' '))
      );
      if (engBooks.length > 0) {
        console.log(`   📖 영어 교재:`);
        engBooks.forEach(b => {
          console.log(`      - ${b.subject || ''} | ${b.title || ''} | ${b.publisher || ''} | ${b.author || ''}`);
        });
      }

      // 전체 목록 간략 출력
      console.log(`   📚 전체 교과서 (상위 10개):`);
      data.books.slice(0, 10).forEach(b => {
        const parts = [b.grade, b.subject, b.title, b.publisher].filter(Boolean);
        console.log(`      - ${parts.join(' | ')}`);
      });
      if (data.books.length > 10) {
        console.log(`      ... 외 ${data.books.length - 10}개`);
      }
    }
  }
  console.log('\n' + '='.repeat(50));
}
