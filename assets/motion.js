(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const seen = new WeakSet();
  const observed = new Set();
  const running = new Set();
  const current = new WeakMap();
  const nativeTransitions = new Set();
  const pressTimers = new Map();
  let queued = false;
  const revealSelector = [
    '.home-section .section-heading', '.edu-card', '.skill-card',
    '.home-page .projects-grid > .project-card', '.blog-page .post-card',
    'body[data-page="article"] .section > h2', 'body[data-page="article"] .section > h3',
    'body[data-page="project"] .section > h2',
    'body[data-page="project"] .project-grid > .project-card',
    'body[data-page="project"] .showcase-card'
  ].join(',');

  function animate(element, frames, options) {
    if (preference.matches || !element?.isConnected || typeof element.animate !== 'function') return null;
    current.get(element)?.cancel();
    let animation;
    try { animation = element.animate(frames, { easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'none', ...options }); }
    catch { return null; }
    current.set(element, animation);
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => {
      running.delete(animation);
      if (current.get(element) === animation) current.delete(element);
    });
    return animation;
  }

  function enter(element, kind = 'panel', delay = 0) {
    if (!element || !element.getClientRects().length) return null;
    const reveal = kind === 'reveal';
    return animate(element, [
      { opacity: reveal ? .90 : .94, translate: reveal ? '0 8px' : '0 4px' },
      { opacity: 1, translate: '0 0' }
    ], { duration: reveal ? 300 : 190, delay: Math.min(70, Math.max(0, delay)) });
  }

  const observer = typeof window.IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      observer.unobserve(element);
      observed.delete(element);
      seen.add(element);
      enter(element, 'reveal', Number(element.dataset.motionOrder || 0) * 24);
    });
  }, { threshold: 0, rootMargin: '0px 0px -24px 0px' }) : null;

  function refresh() {
    queued = false;
    for (const element of observed) {
      if (!element.isConnected) { observer?.unobserve(element); observed.delete(element); }
    }
    if (preference.matches || !observer) return;
    document.querySelectorAll(revealSelector).forEach((element, index) => {
      if (seen.has(element) || observed.has(element) || !element.getClientRects().length) return;
      // Already visible or restored content stays still; nothing is hidden while waiting.
      if (element.getBoundingClientRect().top < window.innerHeight + 24) { seen.add(element); return; }
      element.dataset.motionOrder = String(index % 3);
      observed.add(element);
      observer.observe(element);
    });
  }

  function queueRefresh() {
    if (!queued) { queued = true; requestAnimationFrame(refresh); }
  }

  function cancelMotion(skipNative = true) {
    running.forEach(animation => animation.cancel());
    if (skipNative) nativeTransitions.forEach(transition => transition.skipTransition());
    pressTimers.forEach((timer, element) => { clearTimeout(timer); element.classList.remove('ui-click-feedback'); });
    pressTimers.clear();
  }

  function updatePreference() {
    document.documentElement.dataset.motion = preference.matches ? 'reduced' : 'full';
    if (preference.matches) {
      cancelMotion();
      observer?.disconnect();
      observed.clear();
    } else queueRefresh();
  }

  function press(element) {
    if (!element || preference.matches) return;
    clearTimeout(pressTimers.get(element));
    element.classList.add('ui-click-feedback');
    pressTimers.set(element, setTimeout(() => {
      element.classList.remove('ui-click-feedback');
      pressTimers.delete(element);
    }, 220));
  }

  const controlSelector = 'button:not(:disabled), .home-btn, .ui-btn, .btn-link, .contact-btn, .project-link, .post-card';
  document.addEventListener('pointerdown', event => {
    if (event.button !== 0 || !(event.target instanceof Element)) return;
    press(event.target.closest(controlSelector));
  }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.repeat || event.isComposing || !(event.target instanceof Element)) return;
    if (event.key === 'Enter' || (event.key === ' ' && event.target.closest('button'))) press(event.target.closest(controlSelector));
  });
  document.addEventListener('focusin', event => {
    if (!(event.target instanceof Element)) return;
    const card = event.target.closest(revealSelector);
    if (card) { seen.add(card); observed.delete(card); observer?.unobserve(card); current.get(card)?.cancel(); }
  });

  function anchorCue() {
    let target;
    try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch { return; }
    const heading = target?.matches('h2,h3') ? target : target?.querySelector(':scope > h2, :scope > h3');
    if (heading) animate(heading, [{ backgroundColor: '#edf3ee' }, { backgroundColor: 'transparent' }], { duration: 850 });
  }
  window.addEventListener('hashchange', anchorCue);
  document.addEventListener('site:content-updated', queueRefresh);
  document.addEventListener('site:motion-refresh', queueRefresh);
  window.addEventListener('resize', queueRefresh, { passive: true });
  window.addEventListener('pagehide', () => { cancelMotion(false); nativeTransitions.clear(); });
  window.addEventListener('pageshow', event => { if (event.persisted) { cancelMotion(false); queueRefresh(); } });
  window.addEventListener('beforeprint', cancelMotion);
  for (const type of ['pageswap', 'pagereveal']) {
    window.addEventListener(type, event => {
      const transition = event.viewTransition;
      if (!transition) return;
      nativeTransitions.add(transition);
      transition.ready.catch(() => {});
      transition.finished.catch(() => {}).finally(() => nativeTransitions.delete(transition));
      if (preference.matches) transition.skipTransition();
    });
  }
  if (typeof preference.addEventListener === 'function') preference.addEventListener('change', updatePreference);
  else preference.addListener(updatePreference);
  window.SiteMotion = Object.freeze({ enter, refresh: queueRefresh, get reduced() { return preference.matches; } });
  updatePreference();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', queueRefresh, { once: true });
  else queueRefresh();
})();
