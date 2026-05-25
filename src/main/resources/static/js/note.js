const myNotes = [
  { id: 1, category: 'algorithm', title: '세그먼트 트리 구간 합 에러', date: '2025.03.10', summary: '인덱스 계산 시 n-1 처리를 잘못함.' },
  { id: 2, category: 'os', title: '데드락 발생 조건 4가지', date: '2025.03.08', summary: '상호배제, 점유대기, 비선점, 환형대기 암기 필요' }
];

function renderNotes(filter = 'all') {
  const list = document.getElementById('noteList');
  if (!list) return;
  
  const filtered = filter === 'all' ? myNotes : myNotes.filter(n => n.category === filter);
  document.getElementById('noteCount').textContent = filtered.length;

  list.innerHTML = filtered.map(n => `
    <div class="panel-box" style="padding: 24px; cursor: pointer; transition: transform 0.2s;" onclick="showToast('상세 노트 열기')">
      <div style="font-size: 12px; color: var(--accent); margin-bottom: 8px; font-weight: bold; text-transform: uppercase;">${n.category}</div>
      <h3 style="margin-bottom: 12px;">${n.title}</h3>
      <p style="font-size: 14px; color: var(--text2); line-height: 1.5; margin-bottom: 16px;">${n.summary}</p>
      <div style="font-size: 12px; color: var(--text3);">${n.date}</div>
    </div>
  `).join('');
}

function filterNotes(val, el) {
  document.querySelectorAll('.btab').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  renderNotes(val);
}

window.addEventListener('DOMContentLoaded', () => renderNotes());