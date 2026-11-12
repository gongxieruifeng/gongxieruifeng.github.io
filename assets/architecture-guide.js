(() => {
  'use strict';
  // These are explanatory data contracts from the public project pages, not execution logs.
  const models = {
    'compilelight.html': {
      name: 'CompileLight', section: 'architecture',
      caption: '从用户请求到经批准的计划，再到执行证据。',
      source: 'projects/compilelight.html#architecture',
      steps: [
        { title: '任务分析', input: '用户请求与当前任务上下文', process: ['识别任务意图与需要完成的步骤。', '明确输入、预期输出和约束，为后续召回与对齐准备任务描述。'], output: '任务描述、步骤需求与输入输出约束', handoff: '将任务描述交给资产检索。', note: '分析阶段可能调用模型；资产复用不等于整个请求零 Token。' },
        { title: '资产检索', input: '任务描述与版本化资产的 Route Header', process: ['稀疏与稠密检索分别召回候选资产。', '通过 RRF 融合排名，优先找到已经验证的工具、状态机片段与工作流能力。'], output: '候选资产 Header 与对应资产版本', handoff: '将候选资产交给契约对齐，检验它们能否完成当前任务。', note: '业务版采用 PostgreSQL FTS / pgvector；这里展示两版共有的职责关系。' },
        { title: '契约与提案', input: '候选资产的 Contract、任务约束与覆盖情况', process: ['核对资产输入输出能否对齐任务需求，识别仍未覆盖的缺口。', '模型提出 Blueprint，说明步骤依赖、复用能力与需要解析的部分。'], output: 'Blueprint 提案与输入输出绑定需求', handoff: '提案进入确定性 Compiler，不能直接进入执行器。', note: '模型负责提议，程序负责批准；Contract 对齐和 RRF 排名承担不同职责。' },
        { title: '确定性编译', input: 'Blueprint 提案与可用资产快照', process: ['检查 Schema、Scope、Risk、Budget，以及依赖、资产绑定和 Validator 等约束。', '将通过校验的计划绑定为版本化 DAG；失败提案受限修复或安全停止。'], output: '已批准的计划、固定资产版本与执行约束', handoff: '批准后的计划交给固定 Meta-Executor 消费。', note: '执行开始时固定 Snapshot，运行中不热切换资产版本。' },
        { title: '受控执行', input: '已批准计划、步骤数据与冻结上下文', process: ['REUSE 复用已覆盖能力；HYBRID 为未覆盖部分做有界解析；NEW 在工具和预算约束下完成新的规划或探索。', '校验后的类型化产物供 LangGraph 固定 Meta-Executor 消费；不合格产物不直接执行。'], output: '步骤结果、校验产物与执行消耗信息', handoff: '将执行结果与证据交给输出与运行账本。', note: '三种模式表达资产覆盖程度；未知任务仍受编译、验证与预算约束。' },
        { title: '输出与沉淀', input: '执行结果与 Runtime Ledger 记录', process: ['输出结果，并保留本次执行与消耗证据。', '经验经过审阅和验证后，才进入后续资产版本；本次运行保持冻结快照。'], output: '用户结果、运行证据与待审核经验', handoff: '经审核的经验进入未来资产版本，供后续请求检索。', note: '经验沉淀用于后续运行，不会直接热改当前运行计划。' }
      ]
    },
    'fgformer.html': {
      name: 'FGFormer', section: 'innovation',
      caption: '把历史帧转为变化表示，经时空注意力输出预测帧。',
      source: 'projects/fgformer.html#innovation',
      steps: [
        { title: '历史帧输入', input: '按时间排列的历史视频帧 x₀ … xₜ', process: ['保留帧内外观与时间顺序。', '使用已经观察到的历史帧，为后续帧差分和嵌入准备输入。'], output: '历史帧序列与对应帧号', handoff: '把历史帧交给差分与双分支嵌入。', note: '这里只展示预测阶段的数据流，不将未来真值作为预测输入。' },
        { title: '帧与差分嵌入', input: '历史帧 xₜ 与相邻历史帧 xₜ₋₁', process: ['构造一阶差分 Δxₜ = xₜ − xₜ₋₁，首帧差分 Δx₀ = 0。', '原帧和差分分别经过独立线性映射，与绝对位置编码相加。'], output: 'z = EₓP(x) + EΔP(Δx) + e', handoff: '把包含外观与变化信息的表示送入首次空间处理。', note: '差分显式提供变化线索；模型不在这里估计物理运动速度。' },
        { title: '空间关系', input: '带帧差分信息的输入表示 z', process: ['STS 骨干先处理每帧内部的空间结构。', '让局部外观与变化信息形成可供跨帧注意力使用的特征表示。'], output: '按时间组织的空间特征表示', handoff: '将空间特征送入时间注意力，构造 Q、K、V。', note: '更浅或更窄的骨干配置是整体计算量下降的主要来源。' },
        { title: '时间相位注意力', input: '时间注意力中的 Q、K、V 与帧号', process: ['phase-RoPE 按帧号旋转 Q/K 的通道对，V 保持不变。', '主版本使用自由可学习频率，让注意力旋转项描述相对时间偏移。'], output: '结合内容与相对时间的注意力结果', handoff: '把跨帧聚合结果交给后续空间处理和 STS 层。', note: '旋转的是特征通道，不是图像；完整注意力仍结合输入的绝对位置编码。' },
        { title: 'STS 交替建模', input: '跨帧注意力聚合后的特征', process: ['按空间 → 时间 → 空间的 STS 结构交替处理帧内与跨帧关系。', '差分输入先验与时间相位先验沿骨干协同更新时空表示。'], output: '融合外观、变化与跨帧关系的特征', handoff: '将融合特征用于形成后续帧预测。', note: '组件开销小于 0.1% 的表述限定于 Moving MNIST / KTH；这里不演示运行速度。' },
        { title: '预测帧输出', input: '完成时空建模后的特征表示', process: ['输出未来帧预测，在离线实验中与真值计算误差。', 'Moving MNIST 为 10→10 帧，TaxiBJ 为 4→4；KTH 每次预测 10 帧，完整 20 帧需要两次前向。'], output: '后续帧预测；离线评估另行计算 MSE 等指标', handoff: '预测帧可用于定性查看，评估协议与结果见原页面实验表。', note: '动画表示张量职责，不显示真实样本或重新运行模型。' }
      ]
    },
    'geome.html': {
      name: 'GeoME', section: 'architecture',
      caption: '追踪地理假设、双向证据、信念更新与反思反馈。',
      source: 'projects/geome.html#architecture',
      steps: [
        { title: '图像与线索', input: '待定位图像中的可见视觉信息', process: ['从建筑、路牌、植被等可见信息出发提出地理定位问题。', '进入 Prompt 编排的推理流程，不修改模型权重。'], output: '图像上下文与待验证的地理假设空间', handoff: '图像上下文交给 Candidate，生成候选并评估信心。', note: '流程自包含，不依赖外部地图 API；图中仅展示概念产物。' },
        { title: 'Candidate 候选', input: '图像上下文与地理定位任务', process: ['生成多样化候选，减少单一先验导致的锚定偏差。', '高信心可直接输出；中低信心生成 Top-5 候选，进入辩论分支。'], output: '候选集合与初始信心判断', handoff: '歧义分支将候选集合交给 Debate；高信心分支可跳至结果。', note: '下方演示歧义场景的完整路径，并不表示每张图像都要辩论。' },
        { title: 'Debate 双向证据', input: '候选集合与图像可见线索', process: ['对每个候选寻找 E+ 支持证据和 E− 反驳证据，扮演“魔鬼代言人”。', '识别反复误导推理的高频特征，推动挖掘更有区分度的线索。'], output: '每个候选的 E+ / E− 证据与误导特征', handoff: '把候选和证据交给 Judge 更新信念。', note: '证据同时包含支持与反驳，不能只用常见视觉先验确认结论。' },
        { title: 'Judge 信念更新', input: '候选、双向证据与当前信念分布', process: ['做贝叶斯式信念更新，观察候选信心与信念熵的演化。', '达到信心阈值或共识可输出；仍不确定时进入批判反思。'], output: '更新后的信念、信心判断与不确定性', handoff: '信心不足时交给 Reflect；信心足够时交给最终结果。', note: '信念熵用于不确定性与元推理判断，不是一次新训练的损失函数。' },
        { title: 'Reflect 重构候选', input: '仍不确定的信念分布与未充分探索的线索', process: ['剔除最弱候选，围绕未充分探索的视觉线索重新采样假设。', '通过 Feature Evasion 抑制误导特征，引导后续证据挖掘。'], output: '重构后的候选集合与特征抑制信息', handoff: '带着新候选返回 Debate，再更新证据与信念。', note: '“下一步”用于继续查看结果说明；算法回路从 Reflect 返回 Debate。' },
        { title: '结果与证据链', input: '满足信心或共识条件的地理判断', process: ['输出地理定位结果，保留支持与反驳证据链。', '简单场景可以从 Candidate 直接到达这里；歧义场景可能经历多轮辩论与反思。'], output: '定位结论与 E+ / E− 推理证据', handoff: '与数据集真值的准确率和距离误差评估，见原页面结果。', note: '本导览没有伪造候选国家、坐标、信心数值或真实推理日志。' }
      ]
    },
    'geogr2.html': {
      name: 'GeoGR²', section: 'architecture',
      caption: '从初始空间预测到参考关系、真实特征与迭代修正。',
      source: 'projects/geogr2.html#architecture',
      steps: [
        { title: '目标与任务', input: '目标地理坐标、指标名称与任务上下文', process: ['明确需要预测的地理空间属性。', '进入两阶段流程：先形成初始预测，再进行图推理修正。'], output: '目标点与空间属性预测任务', handoff: '将目标点与任务交给 GeoLLM 形成初始预测。', note: '已展示验证任务为 GDP、温度与降水；这里不新增实验任务。' },
        { title: 'GeoLLM 初始预测', input: '目标点与待预测空间属性', process: ['由 LLM 形成初始空间属性预测。', '将初始值整理为 stage0 数据，作为后续图推理修正的起点。'], output: '目标点的 stage0 初始预测', handoff: '初始预测交给 GeoGRR，构建参考关系并选择背景特征。', note: '后续迭代使用上一轮修正后的预测值，不会每轮重新回到 stage0。' },
        { title: 'Topology 参考关系', input: '目标点、当前阶段预测与候选参考点', process: ['选取全局 10 个经纬度欧氏最近邻作为物理近邻。', '在 5°×5° 区域内，由 LLM 选择 5 个语义相似点，动态建立参考关系。'], output: '当前目标点的物理与语义参考集合', handoff: '参考关系与特征选择结果共同送入更新算子。', note: 'Topology 与 Feature 是协作输入；下方顺序便于解释，不限定模块调度先后。' },
        { title: 'Feature 背景变量', input: '任务、目标与参考点的可用背景信息', process: ['根据任务筛选需要使用的协变量。', '从 WorldClim BIO1–BIO19 等真实背景变量中选择相关特征，为参考和目标补充依据。'], output: '所选变量与目标 / 参考点的特征', handoff: '将真实特征和参考点当前值交给 Update。', note: '选择哪些变量由任务决定，不表示每次都必须使用全部 19 个变量。' },
        { title: 'Update 图推理修正', input: '目标初始 / 当前值、参考关系与所选特征', process: ['综合目标点与参考点的特征、数值偏差和区域背景，进行空间消息传递。', '输出修正值，更新缓存与新的阶段数据。'], output: '修正预测值与新的 stage 数据', handoff: '把新阶段数据交给指标记录与迭代判断。', note: '下一轮重新选点时消费这一轮修正后的预测值。' },
        { title: '记录与停止判断', input: '本轮阶段数据与可用于评估的真值', process: ['按页面所述实验流程计算并记录 Spearman / Bias。', 'Spearman 严格下降或达到 max_rounds 时停止；持平或上升可继续迭代。'], output: '阶段指标、继续 / 停止判断', handoff: '继续时返回参考关系与特征选择；停止时输出最佳阶段。', note: '这里是带评估真值的实验流程，不将 Spearman 判断说成无需真值的在线能力；RefinementEvaluator 仍是页面所述预留接口。' },
        { title: '最佳阶段输出', input: '各阶段修正数据与指标追踪结果', process: ['停止迭代后输出最佳阶段 CSV，并保留指标追踪。', '参考关系随阶段重建，整个过程不微调 LLM 权重。'], output: '最佳阶段空间预测与阶段指标记录', handoff: '结果与适用范围可继续对照原页面实验说明。', note: '导览仅解释已公开的两阶段与三算子循环，没有运行模型或新增评测数值。' }
      ]
    }
  };
  let component = null;
  let model = null;
  let initialized = false;
  let inView = true;
  let current = 0;
  let playing = false;
  let animating = false;
  let playbackTimer = 0;
  let sequence = 0;
  let animations = [];
  let detail, stepsHost, announcement, transferStatus, packet, wires, controls, graphic;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const motionOff = () => !!reduced?.matches;
  const svgNS = 'http://www.w3.org/2000/svg';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function svgElement(tag, attributes) {
    const node = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    return node;
  }
  function emitLayout() { document.dispatchEvent(new CustomEvent('site:explorer-layout-updated')); }
  function visible() {
    if (!component?.open || document.hidden || !inView) return false;
    if (document.querySelector('dialog[open], .term-help-popover[data-open="true"]')) return false;
    const rect = component.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < window.innerHeight;
  }
  function ensureFlowVisible() {
    if (!component?.open || !graphic?.isConnected || document.querySelector('dialog[open], .term-help-popover[data-open="true"]')) return;
    const flow = graphic.querySelector('.architecture-guide-flow');
    if (!flow) return;
    const rect = flow.getBoundingClientRect();
    if (!rect.height) return;
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop || 0, height = viewport?.height || window.innerHeight;
    const navbar = document.querySelector('.navbar, .blog-navbar')?.getBoundingClientRect();
    const safeTop = Math.max(top + 16, navbar && navbar.top <= top + 16 && navbar.bottom > top ? navbar.bottom + 16 : top + 16);
    if (rect.top >= safeTop && rect.bottom <= top + height - 16) return;
    flow.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'nearest' });
  }
  function cancelFlow() {
    sequence += 1;
    for (const animation of animations) animation.cancel();
    animations = [];
    animating = false;
    if (packet) packet.style.display = 'none';
    detail?.querySelectorAll('.is-flowing').forEach(node => node.classList.remove('is-flowing'));
    wires?.forEach(wire => wire.classList.remove('is-flowing'));
  }
  function pause() {
    playing = false;
    window.clearTimeout(playbackTimer); playbackTimer = 0;
    cancelFlow();
    updateControls();
  }
  function updateControls() {
    if (!controls) return;
    controls.prev.disabled = current === 0;
    controls.next.disabled = current === model.steps.length - 1;
    controls.play.disabled = motionOff();
    controls.replay.disabled = motionOff();
    controls.play.setAttribute('aria-pressed', String(playing));
    controls.play.textContent = motionOff() ? '逐步查看' : playing ? '暂停播放' : current === model.steps.length - 1 ? '从头播放' : '播放导览';
    controls.play.title = motionOff() ? '系统已启用减少动画，请使用上一／下一步。' : '按顺序播放，每步停留 6 秒，可随时暂停。';
    controls.replay.title = motionOff() ? '系统已启用减少动画。' : '只重播当前步骤的数据流转。';
  }
  function makeFlowGraphic() {
    const svg = svgElement('svg', { class: 'architecture-guide-flow', viewBox: '0 0 720 96', 'aria-hidden': 'true', focusable: 'false' });
    const paths = [
      svgElement('path', { class: 'architecture-guide-wire', d: 'M120 48 H350', fill: 'none' }),
      svgElement('path', { class: 'architecture-guide-wire', d: 'M370 48 H600', fill: 'none' })
    ];
    svg.append(...paths);
    for (const x of [120, 360, 600]) {
      svg.append(svgElement('circle', { class: 'architecture-guide-port', cx: String(x), cy: '48', r: '19' }));
      svg.append(svgElement('circle', { class: 'architecture-guide-port-core', cx: String(x), cy: '48', r: '6' }));
    }
    svg.append(svgElement('path', { class: 'architecture-guide-flow-arrow', d: 'M326 41 L337 48 L326 55 M566 41 L577 48 L566 55', fill: 'none' }));
    const token = svgElement('circle', { class: 'architecture-guide-packet', cx: '0', cy: '0', r: '9' });
    token.style.display = 'none'; svg.append(token);
    wires = paths; packet = token;
    return svg;
  }
  async function replay() {
    cancelFlow();
    transferStatus.textContent = '输入 → 本步处理 → 输出';
    if (motionOff() || !visible() || typeof packet.animate !== 'function') return;
    const token = sequence;
    animating = true;
    packet.style.display = '';
    for (let index = 0; index < wires.length; index += 1) {
      if (token !== sequence || !visible()) break;
      transferStatus.textContent = index === 0 ? '输入产物进入本步' : '本步产物交给后续环节';
      detail.querySelectorAll('.is-flowing').forEach(node => node.classList.remove('is-flowing'));
      detail.querySelector(index === 0 ? '.architecture-guide-input' : '.architecture-guide-operation')?.classList.add('is-flowing');
      wires.forEach((wire, position) => wire.classList.toggle('is-flowing', position === index));
      const path = wires[index], length = path.getTotalLength();
      const frames = Array.from({ length: 17 }, (_, frame) => {
        const point = path.getPointAtLength(length * frame / 16);
        return { transform: `translate(${point.x}px, ${point.y}px)`, opacity: 1 };
      });
      const animation = packet.animate(frames, { duration: 780, easing: 'ease-in-out', fill: 'forwards' });
      animations.push(animation);
      try { await animation.finished; } catch (_) { /* Closing or changing steps cancels this finite transfer. */ }
    }
    if (token === sequence) {
      cancelFlow();
      detail.querySelector('.architecture-guide-output')?.classList.add('is-flowing');
      transferStatus.textContent = '已交接：' + model.steps[current].handoff;
    }
  }
  function dataCard(kind, label, data) {
    const card = element('article', 'architecture-guide-data architecture-guide-' + kind);
    card.append(element('span', 'architecture-guide-data-label', label));
    if (Array.isArray(data)) {
      const list = element('ul', 'architecture-guide-value');
      for (const value of data) list.append(element('li', '', value));
      card.append(list);
    } else card.append(element('p', 'architecture-guide-value', data));
    return card;
  }
  function render() {
    const step = model.steps[current];
    stepsHost.querySelectorAll('[data-flow-step]').forEach((button, index) => {
      button.tabIndex = index === current ? 0 : -1;
      if (index === current) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
      button.dataset.completed = String(index < current);
    });
    const heading = element('div', 'architecture-guide-current');
    heading.append(element('span', 'architecture-guide-count', `${current + 1} / ${model.steps.length}`), element('h3', '', step.title));
    const context = element('p', 'architecture-guide-context');
    context.textContent = `上一步：${current ? model.steps[current - 1].title : '流程起点'}　·　下一步：${current < model.steps.length - 1 ? model.steps[current + 1].title : '导览结束'}`;
    const data = element('div', 'architecture-guide-stage');
    data.append(dataCard('input', '输入数据', step.input), dataCard('operation', '本步处理', step.process), dataCard('output', '输出产物', step.output));
    const handoff = element('p', 'architecture-guide-handoff', step.handoff);
    const note = element('p', 'architecture-guide-note', step.note);
    detail.replaceChildren(heading, context, data, handoff, note);
    updateControls();
    announcement.textContent = `第 ${current + 1} 步，共 ${model.steps.length} 步：${step.title}`;
    document.dispatchEvent(new CustomEvent('site:explorer-content-updated', { detail: { root: detail } }));
    emitLayout();
  }
  function revealStepButton() {
    const button = stepsHost.querySelector('[aria-current="step"]');
    if (!button) return;
    const hostRect = stepsHost.getBoundingClientRect(), rect = button.getBoundingClientRect();
    if (rect.left < hostRect.left) stepsHost.scrollLeft -= hostRect.left - rect.left;
    else if (rect.right > hostRect.right) stepsHost.scrollLeft += rect.right - hostRect.right;
  }
  function goTo(index, automatic = false) {
    if (!automatic) pause(); else cancelFlow();
    current = Math.max(0, Math.min(model.steps.length - 1, index));
    render(); revealStepButton();
    if (!automatic) ensureFlowVisible();
    replay();
    if (playing) scheduleNext();
  }
  function scheduleNext() {
    window.clearTimeout(playbackTimer);
    playbackTimer = window.setTimeout(() => {
      playbackTimer = 0;
      if (!playing || !visible() || motionOff()) { pause(); return; }
      if (current === model.steps.length - 1) { pause(); transferStatus.textContent = '导览已结束，可重新播放或查看任一步骤。'; return; }
      goTo(current + 1, true);
    }, 6000);
  }
  function togglePlayback() {
    if (playing) { pause(); transferStatus.textContent = '播放已暂停，可继续逐步查看。'; return; }
    if (motionOff() || !visible()) return;
    ensureFlowVisible();
    if (current === model.steps.length - 1) current = 0;
    playing = true; goTo(current, true);
  }
  function ready() {
    if (initialized) return;
    initialized = true;
    model = models[window.location.pathname.split('/').pop()];
    if (!model || document.getElementById('architecture-guide')) return;
    const section = document.getElementById(model.section);
    if (!section) return;
    component = element('details', 'architecture-guide'); component.id = 'architecture-guide';
    component.dataset.architectureProject = model.name;
    const summary = element('summary', 'architecture-guide-toggle'); summary.dataset.termSkip = '';
    const summaryCopy = element('span', 'architecture-guide-summary-copy');
    summaryCopy.append(element('strong', '', '按步骤看数据流转'), element('span', '', model.caption));
    summary.append(element('span', 'architecture-guide-summary-icon', '↳'), summaryCopy, element('span', 'architecture-guide-summary-action', '展开导览'));
    const panel = element('div', 'architecture-guide-panel');
    const hint = element('p', 'architecture-guide-hint', '点击步骤或使用上一／下一步，查看每次交接的输入与输出。动画为概念数据流，不是实时运行日志。');
    stepsHost = element('div', 'architecture-guide-steps'); stepsHost.setAttribute('role', 'group'); stepsHost.setAttribute('aria-label', model.name + ' 架构步骤'); stepsHost.dataset.termSkip = '';
    model.steps.forEach((step, index) => {
      const button = element('button', 'architecture-guide-step'); button.type = 'button'; button.dataset.flowStep = String(index);
      button.setAttribute('aria-label', `第 ${index + 1} 步，共 ${model.steps.length} 步：${step.title}`);
      const number = element('span', 'architecture-guide-step-number', String(index + 1).padStart(2, '0')); number.setAttribute('aria-hidden', 'true');
      button.append(number, element('span', '', step.title));
      button.addEventListener('click', () => goTo(index)); stepsHost.append(button);
    });
    stepsHost.addEventListener('keydown', event => {
      if (event.isComposing || event.keyCode === 229 || event.metaKey || event.ctrlKey || event.altKey) return;
      let index;
      if (event.key === 'ArrowLeft') index = current - 1;
      else if (event.key === 'ArrowRight') index = current + 1;
      else if (event.key === 'Home') index = 0;
      else if (event.key === 'End') index = model.steps.length - 1;
      else return;
      event.preventDefault(); event.stopPropagation(); goTo(index);
      stepsHost.querySelector('[aria-current="step"]')?.focus({ preventScroll: true });
    });
    graphic = element('div', 'architecture-guide-graphic'); graphic.dataset.termSkip = '';
    graphic.append(makeFlowGraphic());
    transferStatus = element('p', 'architecture-guide-transfer-status', '输入 → 本步处理 → 输出'); graphic.append(transferStatus);
    detail = element('div', 'architecture-guide-detail');
    const toolbar = element('div', 'architecture-guide-controls'); toolbar.dataset.termSkip = '';
    controls = {};
    for (const [action, label] of [['prev', '← 上一步'], ['next', '下一步 →'], ['replay', '重播本步'], ['play', '播放导览']]) {
      const button = element('button', 'architecture-guide-button', label); button.type = 'button'; button.dataset.flowAction = action;
      controls[action] = button; toolbar.append(button);
    }
    controls.prev.addEventListener('click', () => goTo(current - 1));
    controls.next.addEventListener('click', () => goTo(current + 1));
    controls.replay.addEventListener('click', () => { pause(); ensureFlowVisible(); replay(); });
    controls.play.addEventListener('click', togglePlayback);
    announcement = element('p', 'architecture-guide-announcement'); announcement.setAttribute('role', 'status'); announcement.setAttribute('aria-live', 'polite'); announcement.setAttribute('aria-atomic', 'true');
    panel.append(hint, stepsHost, toolbar, graphic, detail, announcement); component.append(summary, panel);
    const original = section.querySelector('.project-figure, .arch-diagram');
    if (original) original.after(component); else section.append(component);
    component.addEventListener('toggle', () => {
      summary.querySelector('.architecture-guide-summary-action').textContent = component.open ? '收起导览' : '展开导览';
      if (component.open) { render(); ensureFlowVisible(); replay(); } else pause();
      emitLayout();
    });
    render();
    const motionChanged = () => { pause(); updateControls(); transferStatus.textContent = motionOff() ? '减少动画已开启，可逐步查看输入与输出。' : '输入 → 本步处理 → 输出'; };
    if (reduced?.addEventListener) reduced.addEventListener('change', motionChanged); else reduced?.addListener?.(motionChanged);
    document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
    document.addEventListener('focusin', event => {
      if (component.open && !component.contains(event.target)) pause();
    });
    window.addEventListener('pagehide', pause);
    window.addEventListener('pageshow', event => { if (event.persisted) { inView = true; pause(); emitLayout(); } });
    if (typeof window.IntersectionObserver === 'function') {
      const observer = new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        if (!inView) pause();
      });
      observer.observe(component);
    } else {
      const checkVisibility = () => { if (!visible()) pause(); };
      window.addEventListener('scroll', checkVisibility, { passive: true });
      window.addEventListener('resize', checkVisibility, { passive: true });
    }
  }
  window.ArchitectureGuide = Object.freeze({
    models,
    getState: () => ({ project: model?.name || null, current, total: model?.steps.length || 0, open: !!component?.open, playing, animating })
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true }); else ready();
})();
