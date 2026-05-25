// 토스트 알림 기능
function showToast(msg, icon='✅') {
  const t = document.getElementById('toast');
  if(!t) return;
  document.getElementById('toastMsg').textContent = msg;
  document.getElementById('toastIcon').textContent = icon;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// 로그인 모달 제어
function openLogin() {
  document.getElementById('loginModal').classList.add('open');
}
function doLogin() {
  document.getElementById('loginModal').classList.remove('open');
  showToast('로그인되었습니다! 🎉');
}
window.addEventListener('click', e => {
  const modal = document.getElementById('loginModal');
  if(modal && e.target === modal) modal.classList.remove('open');
});