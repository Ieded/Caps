function sendAiMessage() {
  const input = document.getElementById('aiInput');
  const chatWindow = document.getElementById('aiChatWindow');
  const text = input.value.trim();

  if (!text) return;

  // 1. 사용자 메시지 추가
  chatWindow.innerHTML += `
    <div class="c-msg" style="flex-direction: row-reverse;">
      <div class="c-bubble" style="background: var(--surface2); color: var(--text); padding: 12px 16px; border-radius: 15px 4px 15px 15px;">
        ${text}
      </div>
    </div>
  `;
  
  input.value = '';
  chatWindow.scrollTop = chatWindow.scrollHeight;

  // 2. AI 답변 시뮬레이션 (나중에 서버 연동)
  setTimeout(() => {
    chatWindow.innerHTML += `
      <div class="c-msg">
        <div class="c-avatar" style="background: var(--accent); width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">🤖</div>
        <div class="c-bubble" style="background: var(--surface); padding: 15px; border-radius: 4px 15px 15px 15px; max-width: 80%;">
          '${text}'에 대해 분석 중입니다. 잠시만 기다려주세요...
        </div>
      </div>
    `;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }, 1000);
}

// 엔터키 지원
document.getElementById('aiInput')?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendAiMessage();
});