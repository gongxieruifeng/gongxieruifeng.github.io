(() => {
  'use strict';
  const scriptRoot = new URL('../', document.currentScript.src);
  const preferenceKey = 'site-reading-preferences-v1';
  const positionKey = 'site-reading-positions-v1';
  const maximumPositions = 20;
  // Public page titles and section anchors; update this list when chapters change.
  const pages = {
    "index.html": {"title":"在线简历","anchors":{"resume-agent-compilelight":"CompileLight","resume-agent-geome":"GeoME","resume-agent-geogr2":"GeoGR²","resume-agent-smart-qa":"党建问答","resume-agent-wellbeing":"心理预警","resume-tsf-fgformer":"FGFormer","resume-tsf-geogr2":"GeoGR²","resume-tsf-compilelight":"CompileLight","resume-tsf-smart-qa":"党建问答","resume-tsf-wellbeing":"心理预警"}},
    "posts/agent-frameworks-ecosystem.html": {"title":"Agent 框架生态全景：从核心概念到多智能体编排与低代码平台","anchors":{"concept":"Agent 是什么：从公式到类比","frameworks":"开发框架层：从单智能体执行范式到多智能体编排","protocol":"协议层：MCP、Function Calling 与 Agent Skills","lowcode":"低代码 / 无代码平台：Dify 与 Coze"}},
    "posts/backend-engineering-overview.html": {"title":"后端工程全景：技术栈选型、中间件面试与容器化实践","anchors":{"storage":"一、后端技术栈全景：选型判断的底层逻辑","qa-mq":"二、中间件面试核心问答","docker":"三、工程实践工具：容器化与 API 框架","fastapi":"FastAPI：核心特性与框架选型"}},
    "posts/compilelight-agent-evaluation.html": {"title":"生产级 Agent 系统怎么评估？CompileLight 实战复盘","anchors":{"q1":"1成功的定义：四档分级","q2":"2为什么用回放评估，而非直接线上 A/B","q3":"3命中率会不会是\"假命中\"","q4":"4编译门禁的有效性：拦截率与误杀率的平衡","q5":"5路由决策质量：REUSE/HYBRID/NEW 选对了吗","q6":"6如何核验越权与重复副作用","q7":"7资产索引与资产健康度","q8":"8Token 节省是不是拿质量换来的","q9":"9受控探索：区分\"真推理\"与\"碰巧对\"","q10":"10LLM-as-Judge 用在哪、局限在哪","q11":"11评估集怎么构建：分层 + 真实流量混合","q12":"12从零设计评估方案，最先回答三个问题","q13":"13整体延迟与分组口径","q14":"14执行视图冻结怎么验证","q15":"15硬过滤的精度与召回权衡","q16":"16这套评估体系的局限性"}},
    "posts/deep-learning-architectures.html": {"title":"深度学习模型架构精讲：从经典网络到 MoE 与多模态","anchors":{"roadmap":"为什么按机制脉络讲，而不是逐个模型介绍","ml-vs-dl":"从特征工程到端到端学习：机器学习与深度学习的分野","nn-basics":"神经网络怎么学习：前向传播、反向传播与向量化","cnn-rnn":"卷积与循环：两种\"先验假设\"架构及其瓶颈","transformer":"Transformer：用自注意力取代结构先验","moe":"MoE：把\"更大的网络\"换成\"更聪明的路由\"","vit":"多模态：以 ViT 为起点看图像如何进入 Transformer","summary":"小结：三条贯穿全文的主线"}},
    "posts/finetuning-alignment.html": {"title":"大模型微调与对齐全流程：从 SFT 到 DPO / GRPO","anchors":{"reading-section-1":"总体脉络","reading-section-2":"Pre-train 与 SFT 的 Loss 核心差异","reading-section-3":"前置概念：参数更新策略 vs 训练阶段，是正交关系","reading-section-4":"SFT 阶段：让模型\"会说话\"","reading-section-5":"偏好对齐阶段：让模型\"说人话、说好话\"","reading-section-6":"特殊演进与例外","reading-section-7":"一句话终极总结"}},
    "posts/langchain-core-mechanics.html": {"title":"LangChain 核心机制拆解：从 LCEL 到 Memory 与可观测性","anchors":{"model-io":"Model I/O：统一的模型调用接口","prompt":"Prompt 模板体系：从模板到 Runnable","lcel":"Chains 与 LCEL：Runnable 是唯一的入链门槛","parser":"Output Parsers：把自由文本变成结构化数据","memory":"Memory：从全量堆消息到实体与知识图谱","retrieval":"Retrieval：LangChain 怎么组织检索的六个环节","agent":"Tools 与 Agent：让 LLM 具备行动能力","langsmith":"LangSmith：可观测性怎么落地"}},
    "posts/langgraph-deep-agent.html": {"title":"LangGraph 与 Deep Agent：LangChain 1.0 的新范式","anchors":{"mental-model":"从 Chain 到 Graph：State、Node、Edge 的心智模型","memory":"Checkpoint 与 Store：短期记忆与长期记忆","patterns":"用 State/Node/Edge 搭出的常见编排模式","agent-loop":"Agent 循环、中断与人机协作","deep-agent":"Deep Agent：比 ReAct 更高一层的范式","deep-agent-config":"Deep Agent 的可插拔能力","langchain-10":"LangChain 1.0：中间件化的 Agent 基础框架"}},
    "posts/llm-finetuning-practice.html": {"title":"大模型微调实战：LoRA 训练、LLaMA-Factory 与模型压缩","anchors":{"overview":"写在前面","pipeline":"微调实战全流程：数据、参数与踩坑","llamafactory":"LLaMA-Factory 实操：从部署到导出","distill":"模型蒸馏：把大模型的能力装进小模型","embedding":"辨析：大模型的 Embedding 层 ≠ 词嵌入模型"}},
    "posts/llm-fundamentals-frontier.html": {"title":"大模型基础、Prompt 工程与前沿技术全景","anchors":{"foundation":"训练范式与基础模型特征","llm-to-agent":"从LLM到Agent：为什么需要记忆、工具与规划","agent-abilities":"智能体的四大能力：规划、反思、记忆与工具","concepts":"常用概念速查","prompt-basics":"Prompt工程基础与迭代优化","shot-learning":"Zero-shot与Few-shot：从学习范式到工程实践","finance-cases":"三个金融NLP实战案例","frontier-design":"Agent系统设计核心问题","frontier-eval":"Agent评测体系怎么从零搭建","frontier-general":"通用工程问题：幻觉、记忆与多Agent协作"}},
    "posts/llm-inference-metrics.html": {"title":"LLM 推理性能与并发指标：TTFT、TPOT、QPS 与 TPS","anchors":{"request-lifecycle":"先统一请求生命周期和测量时钟","ttft":"TTFT：第一个输出 Token 多久到达","tpot":"TPOT：首 Token 之后的平均生成时间","itl":"ITL：相邻 Token 的实际间隔","throughput":"QPS、TPS与RPM/TPM：请求量、Token量和配额","concurrency":"“并发80”究竟约束了哪一层","load-testing":"按工作负载与SLO确定可用容量","measurement":"测量工具与报告清单"}},
    "posts/rag-engineering-deep-dive.html": {"title":"RAG 系统工程深化：海量文档预处理、模型选型与评估体系","anchors":{"preprocess":"海量文档预处理：先降量，再精洗","selection":"Embedding / Rerank 模型选型","metadata":"元数据与关键词匹配在向量数据库中的存在形式","debug":"RAG 答不准，怎么排查","eval":"RAG 系统怎么评估"}},
    "posts/rag-retrieval-advanced.html": {"title":"RAG 检索进阶：ANN 算法、LlamaIndex 与 Agentic RAG 实践","anchors":{"ann":"ANN 近似最近邻检索：HNSW 与 IVF-PQ 的路线之争","llamaindex":"LlamaIndex 框架设计与 LangChain 生态定位","optimize":"检索优化技巧：Small-to-Big、多路召回与自适应策略","agentic":"ReAct + RAG：让 Agent 自己决定检索时机"}},
    "posts/rag-source-authority.html": {"title":"RAG 来源质量：权威性、问题匹配与证据治理","anchors":{"dimensions":"来源可信与问题适用性：先拆开判断","granularity":"从站点到片段：质量判断的粒度","pipeline":"最优信源缺失：沿检索链路定位","governance":"事实抽取、规则判定与人工复核","supply":"可信供给、信息增益与覆盖取舍","evaluation":"用分层评估验证治理效果"}},
    "posts/reinforcement-learning-basics.html": {"title":"强化学习基础：从价值函数到 PPO","anchors":{"reading-section-1":"强化学习基本框架","reading-section-2":"价值函数、回报与贝尔曼方程","reading-section-3":"策略梯度与 Actor-Critic","reading-section-4":"PPO：角色分工与训练目标","reading-section-5":"PPO 核心机制：KL 约束、裁剪目标函数与优势估计","reading-section-6":"从 PPO 到更轻量的对齐算法"}},
    "posts/search-quality-evaluation.html": {"title":"搜索与推荐评估：CTR、GSB 与上线决策","anchors":{"metrics":"先分清：行为、偏好与绝对质量","ctr":"CTR怎么算：分母和提升幅度","ab-test":"A/B测试：偏差与显著性","gsb":"GSB三档与可选的五档标注","net-win":"净胜率：保留分母与持平样本","protocol":"一轮可复核的人工评估","decision":"把评估结果转成上线决策"}},
    "projects/compilelight.html": {"title":"⚡ CompileLight","anchors":{"overview":"把重复规划变成资产复用","architecture":"一条主流程，分清每层职责","highlights":"让资产可检索，让计划可校验","execution":"已知能力优先，只为缺口推理","results":"业务版成果：更少开销，更高成功率","versions":"业务版与公开轻量版"}},
    "projects/fgformer.html": {"title":"FGFormer","anchors":{"innovation":"同时描述外观与变化","results":"更小的模型，多种子验证","ablation":"分别加入，再看组合","qualitative":"从预测帧看效果","project-status":"项目状态与交流"}},
    "projects/geogr2.html": {"title":"GeoGR²: Geospatial Graph Refine Reasoning Agent","anchors":{"architecture":"两阶段运行架构","operators":"三大核心算子","results":"量化结果"}},
    "projects/geome.html": {"title":"GeoME: Visual Geographic Abductive Reasoning Agent via Multi-Stage Debate and Feature Evasion","anchors":{"architecture":"四阶段闭环架构：Candidate-Debate-Judge-Reflect","innovation":"核心创新机制","results":"量化成果"}}
  };
  const resumeNames = {
    compilelight: ['CompileLight', 'CompileLight'], geome: ['GeoME', 'GeoME'],
    geogr2: ['GeoGR²', 'GeoGR²'], fgformer: ['FGFormer', 'FGFormer'],
    'smart-qa': ['党建问答', 'Smart Q&A'], wellbeing: ['心理预警', 'Wellbeing']
  };
  const generatedPages = new Set(['posts/finetuning-alignment.html', 'posts/reinforcement-learning-basics.html']);
  const homePath = scriptRoot.pathname;
  const currentPath = normalizePath(window.location.pathname);
  const currentPage = currentPath && pages[relativePath(currentPath)];
  let memoryPositions = [];
  let positionsPersist = true;
  let preferencesPersist = true;
  let preferences = readPreferences();
  let dialog = null;
  let settingsButton = null;
  let printButton = null;
  let printOpener = null;
  let targets = [];
  let saveTimer = 0;
  let resumeBanner = null;
  let initialPosition = null;
  let resumeDismissed = false;
  let positionRecordingPaused = false;
  let initialized = false;

  function english() { return document.documentElement.lang === 'en'; }
  function relativePath(path) { return path === homePath ? 'index.html' : path.slice(homePath.length); }
  function normalizePath(value) {
    if (typeof value !== 'string' || !value.startsWith('/') || /[?#\\]/.test(value)) return null;
    let url;
    try { url = new URL(value, window.location.origin); } catch (_) { return null; }
    if (url.origin !== window.location.origin || url.pathname !== value || !value.startsWith(homePath)) return null;
    const relative = value.slice(homePath.length) || 'index.html';
    if (relative === 'index.html') return homePath;
    return Object.prototype.hasOwnProperty.call(pages, relative) ? value : null;
  }
  function cleanPreferences(value) {
    return { text: value?.text === 'large' ? 'large' : 'regular', width: value?.width === 'focused' ? 'focused' : 'regular' };
  }
  function readPreferences(raw) {
    let value = raw;
    try {
      if (raw === undefined) value = window.localStorage.getItem(preferenceKey);
    } catch (_) { preferencesPersist = false; return { text: 'regular', width: 'regular' }; }
    try { return cleanPreferences(value ? JSON.parse(value) : null); }
    catch (_) { return { text: 'regular', width: 'regular' }; }
  }
  function knownLabels(path, anchor) {
    const page = pages[relativePath(path)];
    if (!page || !Object.prototype.hasOwnProperty.call(page.anchors, anchor)) return null;
    if (path === homePath) {
      const match = anchor.match(/^resume-(?:agent|tsf)-(.+)$/);
      const names = match && resumeNames[match[1]];
      return { title: english() ? 'Resume' : '在线简历', label: names ? names[english() ? 1 : 0] : page.anchors[anchor] };
    }
    return { title: page.title, label: page.anchors[anchor] };
  }
  function validatePosition(value) {
    if (!value || typeof value !== 'object') return null;
    const pathname = normalizePath(value.pathname);
    if (!pathname || typeof value.anchor !== 'string') return null;
    const names = knownLabels(pathname, value.anchor);
    if (!names || !Number.isFinite(value.progress) || value.progress < 0 || value.progress > 1 || !Number.isFinite(value.updatedAt) || value.updatedAt <= 0 || value.updatedAt > Date.now() + 60000) return null;
    // Never trust labels or URLs injected into old browser storage.
    return { pathname, anchor: value.anchor, ...names, progress: value.progress, updatedAt: value.updatedAt };
  }
  function cleanPositions(value) {
    if (!Array.isArray(value)) return [];
    const unique = new Map();
    value.map(validatePosition).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt).forEach(record => {
      if (!unique.has(record.pathname)) unique.set(record.pathname, record);
    });
    return Array.from(unique.values()).slice(0, maximumPositions);
  }
  function readPositions() {
    if (!positionsPersist) return cleanPositions(memoryPositions);
    let raw;
    try {
      raw = window.localStorage.getItem(positionKey);
    } catch (_) { positionsPersist = false; }
    if (positionsPersist) {
      try { memoryPositions = cleanPositions(raw ? JSON.parse(raw) : []); }
      catch (_) { memoryPositions = []; }
    }
    return cleanPositions(memoryPositions);
  }
  function notifyPositions() { document.dispatchEvent(new CustomEvent('site:reading-position-updated')); }
  function persistPositions(records) {
    memoryPositions = cleanPositions(records);
    if (positionsPersist) {
      try { window.localStorage.setItem(positionKey, JSON.stringify(memoryPositions)); }
      catch (_) { positionsPersist = false; }
    }
    notifyPositions();
  }
  function getRecent() {
    return readPositions().map(record => ({ ...record, href: record.pathname + '#' + encodeURIComponent(record.anchor) }));
  }
  function clearRecent() {
    positionRecordingPaused = true;
    window.clearTimeout(saveTimer); saveTimer = 0;
    memoryPositions = [];
    try { window.localStorage.removeItem(positionKey); } catch (_) { positionsPersist = false; }
    initialPosition = null;
    resumeDismissed = true;
    resumeBanner?.remove();
    resumeBanner = null;
    notifyPositions();
  }
  window.SiteReadingSupport = Object.freeze({ getRecent, clearRecent });

  function applyPreferences(persist = false, reset = false) {
    preferences = cleanPreferences(preferences);
    document.body.dataset.readingText = preferences.text;
    document.body.dataset.readingWidth = preferences.width;
    if (persist && preferencesPersist) {
      try {
        if (reset) window.localStorage.removeItem(preferenceKey);
        else window.localStorage.setItem(preferenceKey, JSON.stringify(preferences));
      } catch (_) { preferencesPersist = false; }
    }
    dialog?.querySelectorAll('input[data-reading-setting]').forEach(input => {
      input.checked = preferences[input.dataset.readingSetting] === input.value;
    });
    updateLabels();
    document.dispatchEvent(new CustomEvent('site:reading-preferences-updated', { detail: { ...preferences } }));
  }
  function translated() {
    return english() ? {
      settings: 'Reading settings', close: 'Close', text: 'Body text', regular: 'Standard', large: 'Larger',
      width: 'Reading width', focused: 'Focused', reset: 'Reset settings',
      note: preferencesPersist ? 'Preferences are saved in this browser. Reset them at any time.' : 'Settings apply for this visit. This browser did not allow them to be saved.',
      print: 'Print current resume', printHint: 'You can save as PDF in the print dialog',
      resume: 'Continue reading:', dismiss: 'Dismiss reading reminder'
    } : {
      settings: '阅读设置', close: '关闭', text: '正文字号', regular: '标准', large: '较大',
      width: '阅读列宽', focused: '专注', reset: '重置设置',
      note: preferencesPersist ? '偏好保存在当前浏览器，可随时重置。' : '本次设置已生效，浏览器未允许保存。',
      print: '打印当前简历', printHint: '可在打印窗口另存为 PDF',
      resume: '继续上次阅读：', dismiss: '暂不继续阅读'
    };
  }
  function updateLabels() {
    const text = translated();
    if (settingsButton) settingsButton.querySelector('span').textContent = text.settings;
    if (printButton) { printButton.querySelector('span').textContent = text.print; printButton.title = text.printHint; }
    if (dialog) {
      dialog.setAttribute('aria-label', text.settings);
      dialog.querySelectorAll('[data-reading-label]').forEach(node => { node.textContent = text[node.dataset.readingLabel]; });
      dialog.querySelector('[data-utility-close]').setAttribute('aria-label', text.close);
    }
    updateResumeBanner();
  }
  function buildSettings() {
    if (!window.SiteTools?.createDialog || !window.SiteTools?.openDialog) return;
    dialog = window.SiteTools.createDialog({ id: 'reading-settings-dialog', className: 'reading-settings-dialog', label: translated().settings });
    dialog.innerHTML = '<div class="utility-dialog-head"><h2 id="reading-settings-title" data-reading-label="settings"></h2><button type="button" class="utility-button" data-utility-close data-reading-label="close"></button></div>' +
      '<div class="utility-dialog-body"><fieldset class="reading-setting-group"><legend data-reading-label="text"></legend><div class="reading-setting-options">' +
      '<label class="radio"><input type="radio" name="site-reading-text" value="regular" data-reading-setting="text"><span data-reading-label="regular"></span></label>' +
      '<label class="radio"><input type="radio" name="site-reading-text" value="large" data-reading-setting="text"><span data-reading-label="large"></span></label></div></fieldset>' +
      '<fieldset class="reading-setting-group"><legend data-reading-label="width"></legend><div class="reading-setting-options">' +
      '<label class="radio"><input type="radio" name="site-reading-width" value="regular" data-reading-setting="width"><span data-reading-label="regular"></span></label>' +
      '<label class="radio"><input type="radio" name="site-reading-width" value="focused" data-reading-setting="width"><span data-reading-label="focused"></span></label></div></fieldset>' +
      '<p class="reading-settings-note" data-reading-label="note"></p></div><div class="utility-dialog-footer"><button type="button" class="utility-button reading-settings-reset" data-reading-label="reset"></button></div>';
    dialog.setAttribute('aria-labelledby', 'reading-settings-title');
    dialog.addEventListener('change', event => {
      const input = event.target.closest('input[data-reading-setting]');
      if (!input?.checked || !['text', 'width'].includes(input.dataset.readingSetting)) return;
      preferences = cleanPreferences({ ...preferences, [input.dataset.readingSetting]: input.value });
      applyPreferences(true);
    });
    dialog.querySelector('.reading-settings-reset').addEventListener('click', () => {
      preferences = { text: 'regular', width: 'regular' };
      applyPreferences(true, true);
    });
    settingsButton = document.createElement('button');
    settingsButton.type = 'button'; settingsButton.className = 'utility-button reading-settings-button';
    settingsButton.innerHTML = (window.SiteUI?.icon('book-open') || '') + '<span></span>';
    settingsButton.setAttribute('aria-haspopup', 'dialog');
    settingsButton.setAttribute('aria-controls', dialog.id);
    settingsButton.addEventListener('click', () => { updateLabels(); window.SiteTools.openDialog(dialog, settingsButton); });
    const toolbar = document.getElementById('resume-toolbar');
    const hero = document.querySelector('.post-hero, .project-hero');
    if (toolbar) {
      const actions = document.createElement('div'); actions.className = 'reading-support-actions';
      actions.append(settingsButton);
      printButton = document.createElement('button'); printButton.type = 'button'; printButton.className = 'utility-button resume-print-button';
      printButton.innerHTML = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v7H6zM17 11h1"/></svg><span></span>';
      printButton.addEventListener('click', printResume);
      actions.append(printButton); toolbar.append(actions);
    } else if (hero) {
      let actions = hero.querySelector('.ui-reading-actions');
      if (!actions) { actions = document.createElement('div'); actions.className = 'ui-reading-actions'; hero.append(actions); }
      actions.append(settingsButton);
    }
  }
  function finishPrint() {
    if (!document.body.hasAttribute('data-print-resume')) return;
    document.body.removeAttribute('data-print-resume');
    if (printOpener?.isConnected) printOpener.focus({ preventScroll: true });
    printOpener = null;
  }
  function printResume() {
    printOpener = document.activeElement;
    document.body.dataset.printResume = 'true';
    try { window.print(); } catch (_) { finishPrint(); }
  }
  function decodedHash() {
    try { return decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return ''; }
  }
  function collectTargets() {
    if (!currentPage) { targets = []; return; }
    const home = currentPath === homePath;
    if (home) {
      targets = Array.from(document.querySelectorAll('.resume-panel:not([hidden]) .experience[id]'));
    } else {
      const unique = new Set();
      targets = Array.from(document.querySelectorAll('main .section[id], main h2[id], main h3[id], .page .section[id], .page h2[id], .page h3[id]')).map(node => node.closest('.section[id]') || node).filter(node => {
        if (unique.has(node) || !knownLabels(currentPath, node.id)) return false;
        unique.add(node); return true;
      });
    }
    targets = targets.filter(target => knownLabels(currentPath, target.id) && !target.closest('[hidden]'));
  }
  function removeLostCurrentPosition() {
    const records = readPositions();
    const filtered = records.filter(record => record.pathname !== currentPath || document.getElementById(record.anchor));
    if (filtered.length !== records.length) persistPositions(filtered);
    if (initialPosition && !document.getElementById(initialPosition.anchor)) { initialPosition = null; resumeBanner?.remove(); resumeBanner = null; }
  }
  function visiblePosition() {
    if (!targets.length) return null;
    const line = Math.max(120, window.innerHeight * .3);
    const visible = targets.map(target => ({ target, rect: target.getBoundingClientRect() })).filter(item => item.rect.width > 0 && item.rect.bottom > 90 && item.rect.top < window.innerHeight);
    if (!visible.length) return null;
    let current = visible[0];
    for (const item of visible) { if (item.rect.top <= line) current = item; }
    let progress;
    if (currentPath === homePath) {
      const firstTop = targets[0].getBoundingClientRect().top + window.scrollY;
      const lastBottom = targets[targets.length - 1].getBoundingClientRect().bottom + window.scrollY;
      const range = lastBottom - firstTop - window.innerHeight + line;
      progress = range > 0 ? (window.scrollY - firstTop + line) / range : 1;
    } else {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      progress = range > 0 ? window.scrollY / range : 1;
    }
    const names = knownLabels(currentPath, current.target.id);
    return { pathname: currentPath, anchor: current.target.id, ...names, progress: Math.min(1, Math.max(0, progress)), updatedAt: Date.now() };
  }
  function saveCurrentPosition() {
    window.clearTimeout(saveTimer); saveTimer = 0;
    if (positionRecordingPaused) return;
    const record = visiblePosition();
    if (!record) return;
    persistPositions([record, ...readPositions().filter(old => old.pathname !== record.pathname)]);
  }
  function queueSave() {
    if (positionRecordingPaused) return;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(saveCurrentPosition, 400);
  }
  function resumeRecording(event) {
    if (!positionRecordingPaused || document.querySelector('dialog[open]')) return;
    if (event.type === 'keydown') {
      if (event.isComposing || event.keyCode === 229 || event.metaKey || event.ctrlKey || event.altKey || !['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) return;
      if (event.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    } else if (event.type === 'click') {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      const tab = event.target.closest('#tab-agent,#tab-tsf');
      let sectionLink = false;
      if (link) {
        try {
          const url = new URL(link.href);
          sectionLink = url.origin === window.location.origin && normalizePath(url.pathname) === currentPath && !!knownLabels(currentPath, decodeURIComponent(url.hash.slice(1)));
        } catch (_) { /* An unrelated or malformed link does not resume recording. */ }
      }
      if (!tab && !sectionLink) return;
    }
    positionRecordingPaused = false;
    queueSave();
  }
  function updateResumeBanner() {
    if (!resumeBanner || !initialPosition || resumeDismissed) return;
    const target = document.getElementById(initialPosition.anchor);
    if (!target) { resumeBanner.remove(); resumeBanner = null; initialPosition = null; return; }
    const names = knownLabels(currentPath, initialPosition.anchor);
    const text = translated();
    const link = resumeBanner.querySelector('a');
    link.href = '#' + encodeURIComponent(initialPosition.anchor);
    link.textContent = text.resume + (english() ? ' ' : '') + names.label;
    resumeBanner.querySelector('button').textContent = text.dismiss;
  }
  function buildResumeBanner() {
    if (!initialPosition || initialPosition.progress >= .98 || resumeDismissed) return;
    const anchor = decodedHash();
    if (anchor && document.getElementById(anchor)) return;
    const hero = document.querySelector('.post-hero, .project-hero');
    const toolbar = document.getElementById('resume-toolbar');
    if (!hero && !toolbar) return;
    resumeBanner = document.createElement('div'); resumeBanner.className = 'reading-resume-banner';
    const link = document.createElement('a'); link.className = 'reading-resume-link';
    const dismiss = document.createElement('button'); dismiss.type = 'button'; dismiss.className = 'reading-resume-dismiss';
    dismiss.addEventListener('click', () => {
      resumeDismissed = true; resumeBanner.remove(); resumeBanner = null;
      settingsButton?.focus({ preventScroll: true });
    });
    resumeBanner.append(link, dismiss); (toolbar || hero).after(resumeBanner);
    updateResumeBanner();
  }
  function generateNecessaryAnchors() {
    if (!generatedPages.has(relativePath(currentPath))) return;
    const sections = Array.from(document.querySelectorAll('main .section, .page .section')).filter(section => !section.parentElement.closest('.section'));
    const generated = new Set();
    sections.forEach((section, index) => {
      const id = `reading-section-${index + 1}`;
      if (!section.id && knownLabels(currentPath, id) && !document.getElementById(id)) { section.id = id; generated.add(id); }
    });
    // A hash is an explicit navigation request, including on pages whose IDs are enhanced here.
    const requested = decodedHash();
    if (generated.has(requested)) requestAnimationFrame(() => document.getElementById(requested)?.scrollIntoView({ behavior: 'instant', block: 'start' }));
  }
  function refreshContent() {
    collectTargets(); removeLostCurrentPosition(); updateLabels();
  }
  function ready() {
    if (initialized) return;
    initialized = true;
    applyPreferences();
    if (!currentPage) return;
    generateNecessaryAnchors(); collectTargets();
    initialPosition = readPositions().find(record => record.pathname === currentPath) || null;
    removeLostCurrentPosition(); buildSettings(); applyPreferences(); buildResumeBanner();
    window.addEventListener('scroll', queueSave, { passive: true });
    window.addEventListener('resize', queueSave, { passive: true });
    document.addEventListener('wheel', resumeRecording, { passive: true });
    document.addEventListener('touchmove', resumeRecording, { passive: true });
    document.addEventListener('keydown', resumeRecording);
    document.addEventListener('click', resumeRecording);
    window.addEventListener('pagehide', saveCurrentPosition);
    window.addEventListener('pageshow', event => { if (event.persisted) { applyPreferences(); refreshContent(); } });
    document.addEventListener('site:content-updated', () => { refreshContent(); queueSave(); });
    document.addEventListener('site:track-updated', () => { collectTargets(); updateResumeBanner(); queueSave(); });
    window.addEventListener('afterprint', finishPrint);
    const printMedia = window.matchMedia?.('print');
    printMedia?.addEventListener?.('change', event => { if (!event.matches) finishPrint(); });
  }
  window.addEventListener('storage', event => {
    if (event.key === preferenceKey) { preferences = readPreferences(event.newValue); if (document.body) applyPreferences(); }
    if (event.key === positionKey) { if (positionsPersist) readPositions(); notifyPositions(); }
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true }); else ready();
})();
