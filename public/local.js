// Small local integration layer. The original scene, typography and timing live in main.js.
(() => {
  const status = document.createElement('div');
  status.className = 'local-loading';
  status.setAttribute('role', 'status');
  status.textContent = '正在准备简历…';
  document.body.append(status);

  const wrapper = document.querySelector('.wrapper');
  const intro = document.querySelector('.intro');
  const about = document.querySelector('.about');
  const sound = document.querySelector('.sound-btn');
  const aboutButton = document.querySelector('.about-btn');
  const closeButton = document.querySelector('.close-btn');
  const startButton = document.querySelector('.intro__cta');
  const replayButton = document.querySelector('.outro__cta');
  const canvas = document.querySelector('#canvas');
  canvas.tabIndex = -1;
  canvas.setAttribute('aria-label', '简历旅程。使用方向键或 PageDown 前进。');
  about.id = 'about-panel';
  about.setAttribute('role', 'dialog');
  about.setAttribute('aria-label', '关于我与简历要点');
  about.setAttribute('aria-modal', 'true');
  aboutButton.setAttribute('aria-controls', 'about-panel');

  for (const [element, label] of [
    [startButton, '开始查看'], [replayButton, '重新查看'],
    [aboutButton, '关于我'], [closeButton, '关闭'], [sound, '切换声音'],
  ]) {
    element.setAttribute('role', 'button');
    element.setAttribute('aria-label', label);
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    });
  }

  let wasOpen = false;
  let wasStarted = false;
  function sync() {
    const open = about.classList.contains('about--in');
    about.inert = !open;
    about.setAttribute('aria-hidden', String(!open));
    aboutButton.setAttribute('aria-expanded', String(open));
    const soundOn = sound.classList.contains('sound-btn--on');
    sound.setAttribute('aria-pressed', String(soundOn));
    sound.setAttribute('aria-label', soundOn ? '关闭声音' : '开启声音');
    const started = intro.classList.contains('intro--out');
    startButton.tabIndex = started ? -1 : 0;
    if (started && !wasStarted && document.activeElement === startButton) canvas.focus({ preventScroll: true });
    wasStarted = started;
    aboutButton.tabIndex = aboutButton.classList.contains('about-btn--in') && !open ? 0 : -1;
    closeButton.tabIndex = closeButton.classList.contains('close-btn--in') ? 0 : -1;
    sound.tabIndex = sound.classList.contains('sound-btn--in') && !open ? 0 : -1;
    replayButton.tabIndex = document.querySelector('.outro').classList.contains('outro--in') ? 0 : -1;
    if (wrapper.classList.contains('no-fouc--in')) status.remove();
    if (open !== wasOpen) {
      wasOpen = open;
      (open ? closeButton : aboutButton).focus({ preventScroll: true });
    }
  }
  new MutationObserver(sync).observe(wrapper, { attributes: true, subtree: true, attributeFilter: ['class'] });
  sync();

  window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && wasOpen) return closeButton.click();
    // Original input uses virtual wheel/touch scrolling. Bridge keyboard page navigation.
    if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    const delta = { ArrowDown: 250, ArrowUp: -250, PageDown: 1200, PageUp: -1200 }[event.key];
    if (delta && intro.classList.contains('intro--out')) {
      event.preventDefault();
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: delta }));
    }
  });
  window.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !wasOpen) return;
    // Source links are inside shadow roots, so include their custom-element hosts.
    const links = [...about.querySelectorAll('a, source-link')];
    const candidates = [closeButton, ...links];
    const current = document.activeElement;
    const index = candidates.indexOf(current);
    const next = candidates[(index + (event.shiftKey ? -1 : 1) + candidates.length) % candidates.length];
    event.preventDefault();
    (next.shadowRoot?.querySelector('a') || next).focus({ preventScroll: true });
  });
  window.addEventListener('error', event => {
    if (/WebGL|context/i.test(event.message)) {
      status.classList.add('local-error');
      status.textContent = '此页面需要 WebGL。请开启浏览器的图形加速后刷新。';
      document.body.append(status);
    }
  });
  document.querySelector('#canvas').addEventListener('webglcontextlost', () => {
    status.classList.add('local-error');
    status.textContent = '图形连接中断，请刷新后继续查看简历。';
    document.body.append(status);
  });
  setTimeout(() => {
    if (status.isConnected && !status.classList.contains('local-error')) {
      status.textContent = '仍在加载场景…如果持续如此，请检查 WebGL 与图形加速是否开启。';
    }
  }, 30000);
})();
