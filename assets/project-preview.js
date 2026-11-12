(() => {
  'use strict';
  const grid = document.getElementById('projects-grid');
  if (!grid || !document.body.classList.contains('home-page')) return;
  const preferences = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const savedViews = new Map();
  let states = [];
  const models = {
    compilelight: {
      zh: {
        problem: '企业客服任务反复规划，已知能力难以复用，执行过程需要清晰的审计证据。',
        method: '模型分析任务并提出 Blueprint，确定性 Compiler 执行 Schema / Scope / Risk / Budget 门禁；固定 LangGraph Meta-Executor 按 REUSE / HYBRID / NEW 完成执行。',
        result: '业务版 10,284 次回放：成功率 78.2%→89.4%，整体 P95 103.64s→54.2s，Token 节省 74.8%。',
        note: '业务版成果与公开轻量版分开呈现；公开代码用于理解架构。'
      },
      en: {
        problem: 'Enterprise service tasks repeat planning, underuse known capabilities, and need clear evidence for execution audits.',
        method: 'Models analyze tasks and propose Blueprints. A deterministic Compiler applies Schema / Scope / Risk / Budget gates, and a fixed LangGraph Meta-Executor runs REUSE / HYBRID / NEW plans.',
        result: 'Across 10,284 business traffic replays: success 78.2%→89.4%, overall P95 103.64s→54.2s, and 74.8% token savings.',
        note: 'These results belong to the business version. The public lightweight code illustrates the architecture.'
      }
    },
    geome: {
      zh: {
        problem: '视觉地理定位容易被常见外观先验误导，需要同时核验支持与反驳候选地点的证据。',
        method: 'Candidate → Debate → Judge → Reflect 闭环结合 E+ / E− 双向证据、信念熵与特征规避，在歧义场景中逐步修正地理假设。',
        result: 'Gemini-3 / IM2GPS3K：国家准确率 94.19%，平均 Haversine 误差 130.7 km；相对 PIGEON 的国家准确率高 21.8 个百分点。',
        note: '论文在投，源码私有。不同模型、数据集和指标分别统计。'
      },
      en: {
        problem: 'Visual geolocation can be misled by familiar appearance priors. Candidate places need both supporting and opposing evidence.',
        method: 'A Candidate → Debate → Judge → Reflect loop combines E+ / E− evidence, belief entropy, and feature evasion to refine hypotheses in ambiguous scenes.',
        result: 'Gemini-3 / IM2GPS3K: 94.19% country accuracy and 130.7 km mean Haversine error; country accuracy is 21.8 percentage points above PIGEON.',
        note: 'Under review; source code is private. Results retain their model, dataset, and metric scopes.'
      }
    },
    geogr2: {
      zh: {
        problem: 'LLM 独立预测每个地点时容易忽略空间关联，并产生区域分布偏差。',
        method: 'GeoLLM 初始预测后，通过 Topology → Feature → Update 循环联动物理近邻、语义类比、WorldClim 协变量与多轮图推理修正。',
        result: '在 GDP、温度和降水预测任务中，Spearman 相关系数最高提升 67.9%，区域 Bias 最高降低 87.5%。',
        note: 'EMNLP 已录用，源码私有；最高提升幅度不代表各任务的平均收益。'
      },
      en: {
        problem: 'Independent LLM predictions can overlook spatial relationships and introduce regional distribution bias.',
        method: 'After GeoLLM initialization, a Topology → Feature → Update loop combines physical neighbors, semantic analogies, WorldClim covariates, and iterative graph refinement.',
        result: 'For GDP, temperature, and precipitation tasks, Spearman correlation improves by up to 67.9%, and regional Bias falls by up to 87.5%.',
        note: 'Accepted at EMNLP; source code is private. Maximum gains are distinct from task-average gains.'
      }
    },
    fgformer: {
      zh: {
        problem: '视频帧与城市流量预测，需要同时表达运动变化、相对时间结构与内容信息，并控制计算成本。',
        method: '原帧与帧差分独立嵌入后相加；phase-RoPE 旋转 Q / K、保留 V，配合更浅或更窄的 Space → Time → Space 骨干。',
        result: '多种子主实验 MSE：Moving MNIST 11.96±0.46，KTH 43.82±0.24，TaxiBJ 0.2945±0.0121；TaxiBJ 采用 2.53M 参数 / 0.659 GFLOPs。',
        note: '论文在投。三数据集分别采用 2000 / 100 / 200 epochs 与 3 / 3 / 5 种子；± 为样本标准差。'
      },
      en: {
        problem: 'Video and urban-flow prediction needs motion changes, relative-time structure, and frame content while controlling computation.',
        method: 'Add independent frame and frame-difference embeddings. Temporal phase-RoPE rotates Q / K and leaves V unchanged, alongside a shallower or narrower Space → Time → Space backbone.',
        result: 'Multi-seed main MSE: Moving MNIST 11.96±0.46, KTH 43.82±0.24, TaxiBJ 0.2945±0.0121; TaxiBJ uses 2.53M parameters / 0.659 GFLOPs.',
        note: 'Under review. The datasets use 2000 / 100 / 200 epochs and 3 / 3 / 5 seeds respectively; ± is sample standard deviation.'
      }
    }
  };
  const english = () => document.documentElement.lang === 'en';
  const labels = () => english()
    ? { panel: 'Project panel', intro: 'Introduction', switch: 'Switch project view', problem: 'The problem', method: 'The approach', result: 'The result', back: 'Back to project panel', detail: 'View full project', hint: 'Choose a view or click the card background' }
    : { panel: '项目面板', intro: '项目介绍', switch: '切换项目视图', problem: '要解决的问题', method: '核心方案', result: '已有成果', back: '返回项目面板', detail: '查看完整项目', hint: '切换视图，也可点击卡片空白处' };
  function notify(type, root) {
    if (root?.isConnected) document.dispatchEvent(new CustomEvent(type, { detail: { root } }));
  }
  function cancelMotion(state) {
    for (const animation of state.animations) animation.cancel();
    state.animations = [];
  }
  function animateChange(state, oldHeight) {
    if (preferences?.matches || document.hidden || typeof state.stage.animate !== 'function') return;
    const face = state.view === 'intro' ? state.intro : state.card;
    const nextHeight = state.stage.getBoundingClientRect().height;
    const motion = face.animate([
      { opacity: .45, transform: 'perspective(900px) rotateY(-9deg) translateY(5px)' },
      { opacity: 1, transform: 'perspective(900px) rotateY(0deg) translateY(0)' }
    ], { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' });
    state.animations.push(motion);
    if (oldHeight > 0 && nextHeight > 0 && Math.abs(oldHeight - nextHeight) > 1) {
      state.animations.push(state.stage.animate([{ height: oldHeight + 'px' }, { height: nextHeight + 'px' }], { duration: 280, easing: 'cubic-bezier(.2,.7,.2,1)' }));
    }
    Promise.all(state.animations.map(animation => animation.finished)).then(() => {
      state.animations = [];
      notify('site:explorer-layout-updated', state.shell);
    }).catch(() => { /* A newer view, reduced motion, or pagehide owns the resulting layout. */ });
  }
  function updateAccess(state) {
    const intro = state.view === 'intro';
    state.shell.dataset.projectView = state.view;
    state.card.setAttribute('aria-hidden', String(intro));
    state.intro.setAttribute('aria-hidden', String(!intro));
    state.card.toggleAttribute('inert', intro);
    state.intro.toggleAttribute('inert', !intro);
    for (const tab of state.tabs) {
      const selected = tab.dataset.previewView === state.view;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
  }
  function setView(state, view, focus = false, motion = true) {
    if (!['summary', 'intro'].includes(view) || state.shell.hidden) return;
    const oldHeight = state.stage.getBoundingClientRect().height;
    cancelMotion(state);
    const changed = state.view !== view;
    state.view = view;
    savedViews.set(state.key, view);
    updateAccess(state);
    if (focus) state.tabs.find(tab => tab.dataset.previewView === view)?.focus({ preventScroll: true });
    if (changed && motion) animateChange(state, oldHeight);
    if (view === 'intro') notify('site:explorer-content-updated', state.intro);
    notify('site:explorer-layout-updated', state.shell);
  }
  function syncFilter(state) {
    state.shell.hidden = state.card.hidden;
    state.shell.classList.toggle('is-topic-match', state.card.classList.contains('is-topic-match'));
    if (state.shell.hidden) {
      cancelMotion(state);
      if (state.shell.contains(document.activeElement)) document.querySelector('.project-filter-list button[aria-pressed="true"]')?.focus({ preventScroll: true });
    }
  }
  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function build(card, key, sourceLink) {
    const text = labels(), model = models[key][english() ? 'en' : 'zh'];
    const shell = makeElement('div', 'project-preview-shell');
    shell.dataset.projectKey = key;
    const tablist = makeElement('div', 'project-preview-tabs');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', (card.querySelector('.project-name')?.textContent.trim() || key) + ' · ' + text.switch);
    tablist.dataset.termSkip = '';
    const tabs = ['summary', 'intro'].map(view => {
      const button = makeElement('button', 'project-preview-tab', view === 'summary' ? text.panel : text.intro);
      button.type = 'button'; button.dataset.previewView = view;
      button.id = `preview-tab-${key}-${view}`;
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-controls', `preview-face-${key}-${view}`);
      tablist.append(button); return button;
    });
    const stage = makeElement('div', 'project-preview-stage');
    const intro = makeElement('div', 'project-preview-face project-preview-intro');
    intro.dataset.previewFace = 'intro'; intro.id = `preview-face-${key}-intro`;
    intro.setAttribute('role', 'tabpanel'); intro.setAttribute('aria-labelledby', tabs[1].id);
    const badge = card.querySelector('.project-badge');
    if (badge) intro.append(badge.cloneNode(true));
    const head = card.querySelector('.project-head');
    if (head) intro.append(head.cloneNode(true));
    const details = makeElement('div', 'project-preview-story');
    for (const key of ['problem', 'method', 'result']) {
      const section = makeElement('div', 'project-preview-point');
      const title = makeElement('h3', 'project-preview-point-title', text[key]);
      title.dataset.termSkip = '';
      section.append(title, makeElement('p', 'project-preview-point-text', model[key]));
      details.append(section);
    }
    intro.append(details, makeElement('p', 'project-preview-note', model.note));
    const actions = makeElement('div', 'project-preview-actions'); actions.dataset.termSkip = '';
    const back = makeElement('button', 'project-preview-return', text.back); back.type = 'button';
    const detail = makeElement('a', 'project-preview-detail', text.detail); detail.href = sourceLink.href;
    detail.append(makeElement('span', 'project-preview-arrow', '↗')); detail.querySelector('span').setAttribute('aria-hidden', 'true');
    actions.append(back, detail); intro.append(actions);
    const hint = makeElement('p', 'project-preview-hint', text.hint); hint.dataset.termSkip = '';
    card.before(shell); stage.append(card, intro); shell.append(tablist, stage, hint);
    card.classList.add('project-preview-front'); card.dataset.previewFace = 'summary'; card.id = `preview-face-${key}-summary`;
    card.setAttribute('role', 'tabpanel'); card.setAttribute('aria-labelledby', tabs[0].id);
    const state = { key, card, shell, stage, intro, tabs, animations: [], view: savedViews.get(key) || 'summary', observer: null };
    updateAccess(state); syncFilter(state);
    for (const tab of tabs) {
      tab.addEventListener('click', () => setView(state, tab.dataset.previewView, true));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key) || event.metaKey || event.ctrlKey || event.altKey || event.isComposing) return;
        event.preventDefault();
        const view = event.key === 'Home' ? 'summary' : event.key === 'End' ? 'intro' : state.view === 'intro' ? 'summary' : 'intro';
        setView(state, view, true);
      });
    }
    back.addEventListener('click', () => setView(state, 'summary', true));
    shell.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.view === 'intro' && !event.isComposing && event.keyCode !== 229 && !document.querySelector('dialog[open]')) {
        event.preventDefault(); setView(state, 'summary', true);
      }
    });
    stage.addEventListener('click', event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || window.getSelection()?.isCollapsed === false) return;
      if (event.target.closest('a,button,input,select,textarea,[contenteditable="true"],[role="button"],[tabindex],.project-lock,.term-help-trigger')) return;
      if (document.querySelector('.term-help-popover[data-open="true"]')) {
        window.SiteTermHelp?.close(false);
        return;
      }
      setView(state, state.view === 'intro' ? 'summary' : 'intro', true);
    });
    if (typeof window.MutationObserver === 'function') {
      state.observer = new MutationObserver(() => { syncFilter(state); notify('site:explorer-layout-updated', shell); });
      state.observer.observe(card, { attributes: true, attributeFilter: ['hidden', 'class'] });
    }
    return state;
  }
  function refresh() {
    if (grid.querySelector('.project-preview-shell')) {
      for (const state of states) syncFilter(state);
      notify('site:explorer-layout-updated', grid); return;
    }
    for (const state of states) { cancelMotion(state); state.observer?.disconnect(); }
    states = [];
    for (const card of Array.from(grid.querySelectorAll('.project-card'))) {
      const sourceLink = card.querySelector('a[href^="projects/"]');
      const filename = sourceLink?.getAttribute('href')?.split('/').pop() || '';
      const key = filename.replace(/\.html$/, '');
      if (models[key]) states.push(build(card, key, sourceLink));
    }
    notify('site:explorer-content-updated', grid);
    notify('site:explorer-layout-updated', grid);
  }
  document.addEventListener('site:content-updated', refresh);
  window.addEventListener('pageshow', event => { if (event.persisted) refresh(); });
  window.addEventListener('pagehide', () => { for (const state of states) cancelMotion(state); });
  window.addEventListener('beforeprint', () => { for (const state of states) cancelMotion(state); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) for (const state of states) cancelMotion(state); });
  window.addEventListener('resize', () => {
    for (const state of states) cancelMotion(state);
    notify('site:explorer-layout-updated', grid);
  }, { passive: true });
  const motionChanged = () => {
    if (preferences?.matches) for (const state of states) cancelMotion(state);
    notify('site:explorer-layout-updated', grid);
  };
  if (typeof preferences?.addEventListener === 'function') preferences.addEventListener('change', motionChanged);
  else preferences?.addListener?.(motionChanged);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', refresh, { once: true }); else refresh();
})();
