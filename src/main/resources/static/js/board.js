// ── 게시판 임시 데이터 (상세 내용, 댓글 추가) ──
let posts = [
  { 
    id: 1, category: 'exam', title: '2025년 운영체제 중간고사 복기본 공유', author: '컴공20_김선배', date: '2시간 전', views: 128, likes: 42, hasFile: true,
    content: '올해 운영체제 중간고사 복기본입니다. 이번에 페이징과 세그먼테이션 계산 문제가 까다롭게 나왔네요. 다들 기말고사 화이팅합시다!<br><br>첨부파일 확인해주세요!',
    fileName: 'os_midterm_2025.txt',
    comments: [
      { author: '열공러', isSecret: false, date: '1시간 전', text: '감사합니다! 큰 도움 되었습니다.' },
      { author: '익명', isSecret: true, date: '30분 전', text: '비밀댓글입니다.' }
    ]
  },
  { 
    id: 2, category: 'qna', title: '자료구조 세그먼트 트리 구현 질문있습니다.', author: '코딩꿈나무', date: '5시간 전', views: 89, likes: 5, hasFile: false,
    content: '세그먼트 트리 구간 합 구하는 부분에서 자꾸 인덱스 에러가 납니다. 어느 부분이 문제인지 힌트 주실 수 있을까요?',
    fileName: null,
    comments: []
  }
];

// ── BOARD LOGIC ──
function renderBoard(filter = 'all') {
  const list = document.getElementById('postList');
  if(!list) return;

  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);
  const categoryNames = { exam: '족보공유', qna: '질문답변', career: '진로취업' };

  list.innerHTML = filtered.map(p => `
    <div class="post-item" onclick="viewPostDetail(${p.id})">
      <div class="post-stats">
        <div class="stat-box">
          <div class="stat-val">${p.likes}</div>
          <div class="stat-label">추천</div>
        </div>
      </div>
      <div class="post-main">
        <div class="post-title">
          <span class="post-badge">${categoryNames[p.category] || '진로취업'}</span>
          ${p.title}
        </div>
        <div class="post-info">
          <span class="post-author">👤 ${p.author}</span>
          <span>📅 ${p.date}</span>
          <span>👁️ ${p.views}</span>
        </div>
      </div>
      ${p.hasFile ? `<div class="file-badge">💾 족보 포함</div>` : ''}
    </div>
  `).join('');
}

// 상세 페이지 열람
function viewPostDetail(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  document.getElementById('board-list-view').style.display = 'none';
  document.getElementById('board-detail-view').style.display = 'block';

  // 내용 렌더링
  document.getElementById('detail-content').innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px;">
      <div>
        <span class="post-badge" style="background:rgba(99,179,237,0.1); color:var(--accent); margin-bottom:12px; display:inline-block;">
          ${post.category === 'exam' ? '📂 시험/과제 족보' : post.category === 'qna' ? '❓ 질문/답변' : '🚀 진로/취업'}
        </span>
        <h2 style="font-size:28px; font-weight:800; color:var(--text);">${post.title}</h2>
      </div>
      <div style="text-align:right;">
        <div style="font-size:14px; font-weight:700; color:var(--accent2);">${post.author}</div>
        <div style="font-size:12px; color:var(--text3);">${post.date}</div>
      </div>
    </div>
    <p style="font-size:16px; line-height:1.8; color:var(--text2); margin-bottom:32px;">${post.content}</p>
    ${post.hasFile ? `
      <div style="background:var(--bg3); border:1px solid var(--border); border-radius:12px; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="font-size:24px;">📄</span>
          <div>
            <div style="font-size:14px; font-weight:600;">${post.fileName}</div>
            <div style="font-size:11px; color:var(--text3);">text/plain · 1.2KB</div>
          </div>
        </div>
        <button class="btn-primary" style="padding:8px 16px; font-size:13px;" onclick="downloadMockFile('${post.fileName}')">다운로드</button>
      </div>
    ` : ''}
  `;

  // 댓글 렌더링
  document.getElementById('comment-count').textContent = post.comments.length;
  document.getElementById('comment-list').innerHTML = post.comments.length ? post.comments.map(c => `
    <div style="background:var(--surface); padding:16px; border-radius:12px; border-left:3px solid ${c.isSecret ? 'var(--accent4)' : 'var(--accent)'}; margin-bottom: 12px;">
      <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
        <span style="font-size:13px; font-weight:700; color:var(--text2);">${c.author} ${c.isSecret ? '🔒' : ''}</span>
        <span style="font-size:11px; color:var(--text3);">${c.date}</span>
      </div>
      <p style="font-size:14px; color:${c.isSecret ? 'var(--text3)' : 'var(--text)'}; font-style:${c.isSecret ? 'italic' : 'normal'};">
        ${c.isSecret ? '비밀 댓글입니다. 작성자와 게시글 주인만 볼 수 있습니다.' : c.text}
      </p>
    </div>
  `).join('') : '<div style="color:var(--text3); font-size:14px; text-align:center; padding:20px;">첫 댓글을 남겨보세요!</div>';
}

// 목록으로 돌아가기
function hideDetail() {
  document.getElementById('board-list-view').style.display = 'block';
  document.getElementById('board-detail-view').style.display = 'none';
}

function downloadMockFile(name) {
  const blob = new Blob(["CodeMind 족보 시스템 샘플 파일입니다."], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  showToast(name + ' 다운로드 시작!', '💾');
}

function filterBoard(val, el) {
  document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderBoard(val);
}

function openBoardModal() { showToast('글쓰기 모달 준비 중', '✍️'); }

// 파일 로드 시 렌더링 실행
window.addEventListener('DOMContentLoaded', () => renderBoard());