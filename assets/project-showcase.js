(() => {
  'use strict';
  if (!window.HTMLDialogElement || typeof HTMLDialogElement.prototype.showModal !== 'function') return;
  const links = Array.from(document.querySelectorAll('a.figure-open[data-figure-title]'));
  if (!links.length) return;
  const dialog = document.createElement('dialog');
  dialog.id = 'projectImageDialog';
  dialog.className = 'project-image-dialog';
  dialog.setAttribute('aria-labelledby', 'projectImageTitle');
  dialog.innerHTML = '<div class="project-image-header"><h2 class="project-image-title" id="projectImageTitle"></h2><button class="project-image-close" type="button" aria-label="关闭图件" autofocus>×</button></div><div class="project-image-tools" aria-label="图件缩放"><button type="button" data-zoom="out" aria-label="缩小图件">− 缩小</button><button type="button" data-zoom="in" aria-label="放大图件">+ 放大</button><button type="button" data-zoom="fit">适应窗口</button><a class="project-image-original" target="_blank" rel="noopener noreferrer">原图 ↗</a><span class="project-image-zoom" role="status" aria-live="polite">100%</span></div><div class="project-image-viewport" tabindex="0" role="region" aria-label="图件区域，可横向和纵向滚动"><div class="project-image-canvas"><img alt=""></div></div><p class="project-image-hint">放大后可滚动查看细节。+ / − 缩放，0 适应窗口，Esc 关闭。</p>';
  document.body.append(dialog);
  const image = dialog.querySelector('img');
  const viewport = dialog.querySelector('.project-image-viewport');
  const canvas = dialog.querySelector('.project-image-canvas');
  const title = dialog.querySelector('h2');
  const status = dialog.querySelector('.project-image-zoom');
  const zoomIn = dialog.querySelector('[data-zoom="in"]');
  const zoomOut = dialog.querySelector('[data-zoom="out"]');
  let opener, scale = 1, fitWidth = 0, maxScale = 4;
  function paint(next) {
    if (!image.naturalWidth || !fitWidth) return;
    const focusedControl = document.activeElement;
    const oldWidth = canvas.offsetWidth || fitWidth;
    const oldHeight = canvas.offsetHeight || fitWidth;
    const x = (viewport.scrollLeft + viewport.clientWidth / 2) / oldWidth;
    const y = (viewport.scrollTop + viewport.clientHeight / 2) / oldHeight;
    scale = Math.min(maxScale, Math.max(1, next));
    const width = Math.round(fitWidth * scale);
    const height = Math.round(width * image.naturalHeight / image.naturalWidth);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    image.style.width = width + 'px';
    image.style.height = height + 'px';
    status.textContent = Math.round(scale * 100) + '%';
    zoomOut.disabled = scale === 1;
    zoomIn.disabled = scale === maxScale;
    viewport.scrollLeft = scale === 1 ? 0 : x * width - viewport.clientWidth / 2;
    viewport.scrollTop = scale === 1 ? 0 : y * height - viewport.clientHeight / 2;
    if ((focusedControl === zoomOut && zoomOut.disabled) || (focusedControl === zoomIn && zoomIn.disabled)) {
      viewport.focus({ preventScroll: true });
    }
  }
  function fit() {
    if (!dialog.open || !image.naturalWidth) return;
    const padding = getComputedStyle(viewport);
    const width = viewport.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
    const height = viewport.clientHeight - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
    fitWidth = Math.min(image.naturalWidth, width, height * image.naturalWidth / image.naturalHeight);
    maxScale = Math.max(4, Math.ceil(image.naturalWidth / fitWidth));
    paint(1);
  }
  image.addEventListener('load', fit);
  image.addEventListener('error', () => { status.textContent = '请打开原图'; });
  dialog.querySelector('.project-image-close').addEventListener('click', () => dialog.close());
  zoomIn.addEventListener('click', () => paint(scale + .25));
  zoomOut.addEventListener('click', () => paint(scale - .25));
  dialog.querySelector('[data-zoom="fit"]').addEventListener('click', fit);
  dialog.addEventListener('close', () => { if (opener?.isConnected) opener.focus({ preventScroll: true }); });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (event.key === '+' || event.key === '=') { event.preventDefault(); paint(scale + .25); }
    if (event.key === '-') { event.preventDefault(); paint(scale - .25); }
    if (event.key === '0') { event.preventDefault(); fit(); }
  });
  window.addEventListener('resize', () => { if (dialog.open) fit(); });
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    opener = link;
    scale = 1;
    fitWidth = 0;
    title.textContent = link.dataset.figureTitle;
    image.alt = link.querySelector('img')?.alt || title.textContent;
    dialog.querySelector('.project-image-original').href = link.href;
    try { dialog.showModal(); } catch { return; }
    event.preventDefault();
    image.src = link.href;
    if (image.complete) fit();
  }));
})();
