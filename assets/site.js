(() => {
  'use strict';
  const assetRoot = new URL('.', document.currentScript.src).href;
  const names = new Set(['arrow-right','arrow-up-right','arrow-left','arrow-up','menu','close','search','mail','github','location','briefcase','code','layers','sparkles','cpu','book-open','graduation-cap','check','copy','chevron-down','filter','lock','clock']);
  function icon(name) {
    const key = names.has(name) ? name : 'arrow-right';
    return '<svg class="ui-icon" aria-hidden="true" focusable="false"><use href="' + assetRoot + 'icons.svg#' + key + '"></use></svg>';
  }
  const chinese = () => document.documentElement.lang !== 'en';
  function prefixIcon(element, name, marker) {
    if (!element || element.dataset[marker]) return;
    element.insertAdjacentHTML('afterbegin', icon(name));
    element.dataset[marker] = 'true';
  }
  function refresh() {
    const top = document.querySelector('.ui-back-top');
    if (top) { const label = chinese() ? '返回顶部' : 'Back to top'; top.setAttribute('aria-label', label); top.title = label; }
    const skip = document.querySelector('.ui-skip-link');
    if (skip) skip.textContent = chinese() ? '跳转到正文' : 'Skip to content';
    if (!['article', 'project'].includes(document.body.dataset.page)) return;
    const rules = [
      ['.nav-back', 'arrow-left'], ['.btn-lock', 'lock'],
      ['.project-badge', 'briefcase'], ['.post-category-badge', 'book-open'],
      ['.post-meta-date', 'clock']
    ];
    rules.forEach(([selector, name]) => document.querySelectorAll(selector).forEach(el => {
      if (el.querySelector('svg')) return;
      for (const node of el.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/^[\s←🤖📚🧠⚡🔧🎓🔒📅⏱️🌍🗺️]+/u, '');
      }
      prefixIcon(el, name, 'uiIcon');
    }));
  }
  window.SiteUI = Object.freeze({ icon, refresh });

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const input = document.createElement('textarea');
    input.value = text;
    input.setAttribute('readonly', '');
    input.style.cssText = 'position:fixed;left:-9999px;top:0';
    const previous = document.activeElement;
    document.body.append(input);
    input.select();
    const copied = document.execCommand('copy');
    input.remove();
    previous?.focus();
    if (!copied) throw new Error('Copy unavailable');
  }
  const feedbackStates = new WeakMap();
  function feedback(button, message, original, success = true) {
    let state = feedbackStates.get(button);
    if (!state) { state = { original, timer: null }; feedbackStates.set(button, state); }
    clearTimeout(state.timer);
    button.textContent = message;
    button.classList.toggle('ui-feedback-success', success);
    state.timer = window.setTimeout(() => {
      button.innerHTML = state.original;
      button.classList.remove('ui-feedback-success');
      state.timer = null;
    }, 1800);
  }
  function readingTools() {
    if (!['article','project'].includes(document.body.dataset.page)) return;
    const page = document.querySelector('.page');
    const hero = document.querySelector('.post-hero, .project-hero');
    if (!page || !hero) return;
    const title = hero.querySelector('h1')?.textContent.trim() || '';
    const root = new URL('../', assetRoot);
    const crumbs = document.createElement('nav');
    crumbs.className = 'ui-breadcrumbs';
    crumbs.setAttribute('aria-label', '当前位置');
    const home = document.createElement('a'); home.href = root.href; home.textContent = '首页';
    const category = document.createElement('a');
    category.href = new URL(document.body.dataset.page === 'article' ? 'blog.html' : 'index.html#projects', root).href;
    category.textContent = document.body.dataset.page === 'article' ? '技术笔记' : '项目案例';
    const current = document.createElement('span'); current.textContent = title; current.title = title; current.setAttribute('aria-current', 'page');
    crumbs.append(home, document.createTextNode('/'), category, document.createTextNode('/'), current);
    page.insertBefore(crumbs, page.firstChild);

    const actions = document.createElement('div'); actions.className = 'ui-reading-actions';
    const toc = document.querySelector('.toc');
    if (toc) {
      if (!toc.id) toc.id = 'article-contents';
      const link = document.createElement('a'); link.className = 'ui-btn'; link.href = '#' + toc.id; link.innerHTML = icon('layers') + '<span>查看目录</span>'; actions.append(link);
    }
    const share = document.createElement('button'); share.type = 'button'; share.className = 'ui-btn';
    share.innerHTML = icon('copy') + '<span>复制链接</span>'; share.setAttribute('aria-label','复制当前页面链接'); share.setAttribute('aria-live','polite');
    share.addEventListener('click', async () => {
      const original = share.innerHTML;
      try { await copyText(window.location.href); feedback(share, '链接已复制', original); }
      catch { feedback(share, '请从地址栏复制', original, false); }
    });
    actions.append(share); hero.append(actions);

    document.querySelectorAll('pre').forEach(pre => {
      const code = pre.querySelector('code'); const source = code ? code.textContent : pre.textContent;
      const button = document.createElement('button'); button.type = 'button'; button.className = 'ui-code-copy';
      button.innerHTML = icon('copy') + '<span>复制代码</span>'; button.setAttribute('aria-label','复制代码块'); button.setAttribute('aria-live','polite');
      button.addEventListener('click', async () => {
        const original = button.innerHTML;
        try { await copyText(source); feedback(button,'已复制',original); }
        catch { feedback(button,'请手动选择复制',original,false); }
      });
      pre.insertBefore(button,pre.firstChild);
    });
    document.querySelectorAll('table').forEach(table => {
      if (table.parentElement.matches('.table-scroll,.ui-table-scroll')) return;
      const wrap = document.createElement('div'); wrap.className = 'ui-table-scroll'; wrap.tabIndex = 0; wrap.setAttribute('role','region'); wrap.setAttribute('aria-label','可横向滚动的数据表格');
      table.parentNode.insertBefore(wrap,table); wrap.append(table);
    });
    const progress = document.createElement('div'); progress.className='reading-progress'; progress.setAttribute('aria-hidden','true'); progress.innerHTML='<span></span>'; document.body.append(progress);
    const bar = progress.firstElementChild;
    let scheduled=false;
    const update=() => { scheduled=false; const max=document.documentElement.scrollHeight-window.innerHeight; bar.style.transform='scaleX('+(max>0?Math.min(1,Math.max(0,window.scrollY/max)):1)+')'; };
    const schedule=() => { if (!scheduled) { scheduled=true; requestAnimationFrame(update); } };
    window.addEventListener('scroll',schedule,{passive:true}); window.addEventListener('resize',schedule); document.addEventListener('site:reading-preferences-updated',schedule); update();
    if (toc && typeof window.IntersectionObserver === 'function') {
      const links=[...toc.querySelectorAll('a[href^="#"]')];
      const targets=links.map(link => { try { return document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return null; } }).filter(Boolean);
      const observer=new IntersectionObserver(entries => {
        entries.forEach(entry => { if (!entry.isIntersecting) return; links.forEach(link => { const active=link.hash==='#'+entry.target.id; link.classList.toggle('is-active',active); if (active) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); }); });
      },{rootMargin:'-15% 0px -65% 0px'});
      targets.forEach(target => observer.observe(target));
    }
  }
  function ready() {
    refresh();
    const main=document.querySelector('main') || document.querySelector('.page');
    if (main && !document.querySelector('.skip-link,.ui-skip-link')) {
      if (!main.id) main.id='main-content';
      main.tabIndex=-1;
      if (main.tagName !== 'MAIN') main.setAttribute('role','main');
      const skip=document.createElement('a'); skip.className='ui-skip-link'; skip.href='#'+main.id; skip.textContent='跳转到正文'; document.body.prepend(skip);
    }
    readingTools();
    const top=document.createElement('button'); top.type='button'; top.className='ui-back-top'; top.setAttribute('aria-label','返回顶部'); top.title='返回顶部'; top.innerHTML=icon('arrow-up'); top.hidden=true;
    top.addEventListener('click',() => window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
    window.addEventListener('scroll',() => {top.hidden=window.scrollY<620;},{passive:true}); document.body.append(top);
    refresh();
  }
  window.addEventListener('site:content-updated',refresh);
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',ready,{once:true}); else ready();
})();
