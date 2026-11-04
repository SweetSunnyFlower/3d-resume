// Small local integration layer. The original scene, typography and timing live in main.js.
(() => {
  const status = document.createElement('div');
  status.className = 'local-loading';
  status.setAttribute('role', 'status');
  status.textContent = 'Preparing your journey…';
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
  canvas.setAttribute('aria-label', 'Flight journey. Use arrow keys or Page Down to travel.');
  about.id = 'about-panel';
  about.setAttribute('role', 'dialog');
  about.setAttribute('aria-label', 'About Atmos and references');
  about.setAttribute('aria-modal', 'true');
  aboutButton.setAttribute('aria-controls', 'about-panel');

  for (const [element, label] of [
    [startButton, 'Explore'], [replayButton, 'Explore again'],
    [aboutButton, 'About'], [closeButton, 'Close About'], [sound, 'Mute sound'],
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
    sound.setAttribute('aria-label', soundOn ? 'Mute sound' : 'Enable sound');
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
      status.textContent = 'This journey needs WebGL. Enable graphics acceleration in your browser, then reload.';
      document.body.append(status);
    }
  });
  document.querySelector('#canvas').addEventListener('webglcontextlost', () => {
    status.classList.add('local-error');
    status.textContent = 'The graphics connection was interrupted. Reload to continue the journey.';
    document.body.append(status);
  });
  setTimeout(() => {
    if (status.isConnected && !status.classList.contains('local-error')) {
      status.textContent = 'Still loading the sky… If this persists, check that WebGL and graphics acceleration are enabled.';
    }
  }, 30000);
})();
