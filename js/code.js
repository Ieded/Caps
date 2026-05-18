// 1. PDF 업로드
document.getElementById('pdfUpload')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (file && file.type === 'application/pdf') {
    const fileURL = URL.createObjectURL(file);
    document.getElementById('pdfViewer').src = fileURL;
    document.getElementById('pdfPlaceholder').style.display = 'none';
    document.getElementById('pdfViewer').style.display = 'block';
    showToast('PDF 로드 완료', '📄');
  }
});

// 2. 언어별 뼈대 세팅
const defaultTemplates = {
  "71": "# 파이썬 코드를 작성하세요\ndef solution():\n    pass",
  "63": "// JS 코드를 작성하세요\nfunction solution() {\n}",
  "62": "import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n    }\n}"
};
document.getElementById('langSelect')?.addEventListener('change', function(e) {
  document.getElementById('codeEditor').value = defaultTemplates[e.target.value];
});

// 3. Judge0 API 실행
async function runCodeWithJudge0() {
  const code = document.getElementById('codeEditor').value;
  const langId = document.getElementById('langSelect').value;
  const out = document.getElementById('editorOutput');
  
  if (!code.trim()) { showToast('코드를 입력하세요.', '⚠️'); return; }
  out.innerHTML = '<div class="output-line info">실행 중...</div>';

  try {
    const response = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
        'x-rapidapi-key': JUDGE0_API_KEY // apikey.js 에 선언된 변수
      },
      body: JSON.stringify({ language_id: parseInt(langId), source_code: code })
    });
    
    const result = await response.json();
    if (result.compile_output) out.innerHTML = `<div class="output-line err">${result.compile_output}</div>`;
    else if (result.stderr) out.innerHTML = `<div class="output-line err">${result.stderr}</div>`;
    else out.innerHTML = `<div class="output-line">${result.stdout}</div>`;

  } catch (error) {
    out.innerHTML = `<div class="output-line err">서버 통신 오류</div>`;
  }
}
// ==========================================
// 🔍 시각화 디버거 실시간 동기화 로직
// ==========================================

// 1. 상태(State) 관리 변수
let currentStep = 0;
let debugFrames = []; 
let currentUserCode = "";

// 🌟 언어별 시각화 데이터 세팅 (백엔드 연동 전 가짜 데이터)
const mockDataByLanguage = {
  "71": { // Python
    code: "def sum(n):\n    total = 0\n    for i in range(1, n + 1):\n        total += i\n    return total\n\nsum(3)",
    frames: [
      { step: 0, line: 1, vars: { n: 3 } },
      { step: 1, line: 2, vars: { n: 3, total: 0 } },
      { step: 2, line: 3, vars: { n: 3, total: 0, i: 1 } },
      { step: 3, line: 4, vars: { n: 3, total: 1, i: 1 } },
      { step: 4, line: 3, vars: { n: 3, total: 1, i: 2 } },
      { step: 5, line: 4, vars: { n: 3, total: 3, i: 2 } },
      { step: 6, line: 3, vars: { n: 3, total: 3, i: 3 } },
      { step: 7, line: 4, vars: { n: 3, total: 6, i: 3 } },
      { step: 8, line: 5, vars: { n: 3, total: 6 } }
    ]
  },
  "63": { // JavaScript
    code: "function sum(n) {\n  let total = 0;\n  for (let i = 1; i <= n; i++) {\n    total += i;\n  }\n  return total;\n}",
    frames: [
      { step: 0, line: 1, vars: { n: 3 } },
      { step: 1, line: 2, vars: { n: 3, total: 0 } },
      { step: 2, line: 3, vars: { n: 3, total: 0, i: 1 } },
      { step: 3, line: 4, vars: { n: 3, total: 1, i: 1 } },
      { step: 4, line: 3, vars: { n: 3, total: 1, i: 2 } },
      { step: 5, line: 4, vars: { n: 3, total: 3, i: 2 } },
      { step: 6, line: 5, vars: { n: 3, total: 6 } }
    ]
  },
  "62": { // Java (Spring Boot 등 백엔드 프로젝트와 문법이 가장 비슷한 예시)
    code: "class Main {\n  public static void main(String[] args) {\n    int n = 3;\n    int total = 0;\n    for(int i = 1; i <= n; i++) {\n      total += i;\n    }\n  }\n}",
    frames: [
      { step: 0, line: 2, vars: { args: "[]" } },
      { step: 1, line: 3, vars: { args: "[]", n: 3 } },
      { step: 2, line: 4, vars: { args: "[]", n: 3, total: 0 } },
      { step: 3, line: 5, vars: { args: "[]", n: 3, total: 0, i: 1 } },
      { step: 4, line: 6, vars: { args: "[]", n: 3, total: 1, i: 1 } },
      { step: 5, line: 5, vars: { args: "[]", n: 3, total: 1, i: 2 } },
      { step: 6, line: 6, vars: { args: "[]", n: 3, total: 3, i: 2 } }
    ]
  }
};

// 2. DOM 요소 가져오기
const codeEditor = document.getElementById('codeEditor');
const languageSelect = document.getElementById('languageSelect');
const trackerCodeDisplay = document.getElementById('trackerCodeDisplay');
const trackerMemoryDisplay = document.getElementById('trackerMemoryDisplay');
const stepCounter = document.getElementById('stepCounter');
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const btnReset = document.getElementById('btnReset');

// 🌟 3. 언어 변경 시 실행될 함수 (실시간 동기화의 핵심)
function syncLanguageData(langId) {
  const langData = mockDataByLanguage[langId];
  if (langData) {
    // 1) 에디터 내용 변경
    codeEditor.value = langData.code;
    currentUserCode = langData.code;
    
    // 2) 시각화 디버거 프레임 교체
    debugFrames = langData.frames;
    
    // 3) 스텝 초기화 및 화면 다시 그리기
    currentStep = 0;
    updateTrackerUI();
  }
}

// 4. 이벤트 리스너 등록
// 사용자가 드롭다운에서 언어를 바꿨을 때
languageSelect?.addEventListener('change', (e) => {
  syncLanguageData(e.target.value);
});

// 사용자가 에디터에 타자를 칠 때 (코드 텍스트만 동기화)
codeEditor?.addEventListener('input', (e) => {
  currentUserCode = e.target.value;
  updateTrackerUI(); // 프레임은 그대로 두고 텍스트만 갱신
});

// 5. 화면 렌더링 함수 (변경사항 없음)
function updateTrackerUI() {
  const totalSteps = debugFrames.length;
  const currentFrame = totalSteps > 0 ? debugFrames[currentStep] : null;

  btnPrev.disabled = currentStep === 0 || totalSteps === 0;
  btnNext.disabled = currentStep >= totalSteps - 1 || totalSteps === 0;

  stepCounter.textContent = totalSteps > 0 ? `Step ${currentStep + 1} / ${totalSteps}` : `Step 0 / 0`;

  // 코드 그리기
  const lines = currentUserCode.split('\n');
  let codeHTML = '';
  lines.forEach((lineText, index) => {
    const lineNumber = index + 1;
    const isHighlighted = currentFrame && currentFrame.line === lineNumber;
    
    const bgColor = isHighlighted ? 'rgba(246, 173, 85, 0.2)' : 'transparent';
    const borderColor = isHighlighted ? '#f6ad55' : 'transparent';
    const textColor = isHighlighted ? '#fff' : 'var(--text)';

    // 👇 핵심 수정: 백틱(`) 안의 HTML 코드를 줄바꿈 없이 한 줄로 완전히 붙여줍니다!
    codeHTML += `<div style="display: flex; background-color: ${bgColor}; border-left: 3px solid ${borderColor}; padding-left: 8px; min-width: max-content;"><span style="color: var(--text2); width: 24px; text-align: right; margin-right: 10px; user-select: none;">${lineNumber}</span><span style="color: ${textColor};">${lineText}</span></div>`;
  });
  
  trackerCodeDisplay.innerHTML = codeHTML || "코드를 입력하세요.";

  // 메모리 그리기
  if (currentFrame && Object.keys(currentFrame.vars).length > 0) {
    let memoryHTML = '';
    for (const [varName, varValue] of Object.entries(currentFrame.vars)) {
      memoryHTML += `
        <div style="display: flex; justify-content: space-between; background: var(--bg3); padding: 8px; border-radius: 6px; border-left: 3px solid var(--accent);">
          <span style="font-family: var(--font-mono); color: #7ee8a2; font-size: 13px;">${varName}</span>
          <span style="font-family: var(--font-mono); font-weight: bold; font-size: 13px;">${varValue}</span>
        </div>
      `;
    }
    trackerMemoryDisplay.innerHTML = memoryHTML;
  } else {
    trackerMemoryDisplay.innerHTML = `<span style="color: var(--text2); font-size: 13px;">데이터 없음</span>`;
  }
}

// 6. 버튼 클릭 이벤트
btnPrev?.addEventListener('click', () => { if (currentStep > 0) { currentStep--; updateTrackerUI(); } });
btnNext?.addEventListener('click', () => { if (currentStep < debugFrames.length - 1) { currentStep++; updateTrackerUI(); } });
btnReset?.addEventListener('click', () => { currentStep = 0; updateTrackerUI(); });

// 7. 페이지 최초 로드 시 Python(71)을 기본값으로 세팅
document.addEventListener('DOMContentLoaded', () => {
  languageSelect.value = "71"; // Python 선택
  syncLanguageData("71");      // Python 데이터로 싹 동기화
});