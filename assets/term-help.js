(() => {
  'use strict';
  const siteRoot = new URL('../', document.currentScript.src);
  // Definitions describe public concepts, rather than new claims about project results.
  const entries = [
    { key: 'rag', terms: ['RAG'], name: 'RAG · Retrieval-Augmented Generation',
      zh: '检索增强生成：先检索相关材料，再让语言模型结合材料生成回答。',
      en: 'Retrieval-augmented generation retrieves relevant material before a language model produces an answer grounded in that material.',
      useZh: '同时关注召回、排序、材料质量与回答依据；只接入向量库并不能保证回答准确。',
      useEn: 'Review retrieval, ranking, source quality and answer evidence as separate parts of the system.', href: 'posts/rag-engineering-deep-dive.html#debug' },
    { key: 'rrf', terms: ['RRF'], name: 'RRF · Reciprocal Rank Fusion',
      zh: '倒数排名融合：利用候选在各个检索列表中的名次，将多路结果合并为一个排序。',
      en: 'Reciprocal rank fusion combines retrieval lists using each candidate’s ranks rather than directly comparing their raw scores.',
      useZh: '适合融合关键词与向量等不同检索结果，通常还需要去重和后续排序。',
      useEn: 'Useful for combining keyword and vector retrieval, followed by deduplication or reranking where needed.', href: 'posts/backend-engineering-overview.html#storage' },
    { key: 'rope', terms: ['RoPE'], name: 'RoPE · Rotary Position Embedding',
      zh: '旋转位置编码：按位置旋转注意力中的 Q、K 向量，让注意力计算表达相对位置关系。',
      en: 'Rotary position embeddings apply position-dependent rotations to attention queries and keys, allowing their interaction to express relative positions.',
      useZh: '常用于序列注意力；视频模型还需要明确时间位置与空间位置如何组织。',
      useEn: 'Common in sequence attention; video models additionally need an explicit organization of temporal and spatial positions.', href: 'posts/deep-learning-architectures.html#transformer' },
    { key: 'phase-rope', terms: ['phase-RoPE'], name: 'phase-RoPE · 时间相位旋转编码', nameEn: 'phase-RoPE · Temporal phase rotation',
      zh: 'FGFormer 使用的时间相位旋转编码，主版本学习自由频率，并旋转 Q、K 来表达时间关系。',
      en: 'FGFormer’s temporal phase rotation uses learned free frequencies in its main version and rotates queries and keys to encode temporal relations.',
      useZh: '与帧差分嵌入配合：差分描述帧间变化，相位旋转描述时间关系；V 不旋转。',
      useEn: 'Frame differences describe changes while phase rotations describe temporal relations; value vectors are not rotated.', href: 'projects/fgformer.html#innovation' },
    { key: 'ttft', terms: ['TTFT'], name: 'TTFT · Time To First Token',
      zh: '首 Token 延迟：从请求发出到收到第一个输出 Token 的时间。',
      en: 'Time to first token measures the interval from sending a request to receiving the first output token.',
      useZh: '客户端口径可能包含网络、排队、预填充等开销，对照测试要统一起止时钟。',
      useEn: 'Client-side measurements can include network, queueing and prefill; comparisons need matching start and end boundaries.', href: 'posts/llm-inference-metrics.html#ttft' },
    { key: 'tpot', terms: ['TPOT'], name: 'TPOT · Time Per Output Token',
      zh: '首 Token 之后的平均输出耗时；由后续输出的总间隔除以间隔数量得到。',
      en: 'Time per output token is the average interval after the first output token, calculated from the subsequent output duration and interval count.',
      useZh: '描述单请求平均生成速度，与整个服务的聚合 Token 吞吐分别报告。',
      useEn: 'Describes a request’s average generation speed; report it separately from aggregate service token throughput.', href: 'posts/llm-inference-metrics.html#tpot' },
    { key: 'itl', terms: ['ITL'], name: 'ITL · Inter-Token Latency',
      zh: '相邻输出 Token 的到达间隔，是一组延迟数据，可用于观察流式输出停顿。',
      en: 'Inter-token latency is the interval between consecutive output tokens; its distribution helps identify pauses in streamed output.',
      useZh: '同时观察均值与分位数；流式数据块间隔需要与真正逐 Token 间隔区分。',
      useEn: 'Inspect means and percentiles, and distinguish stream-chunk timing from actual per-token timing.', href: 'posts/llm-inference-metrics.html#itl' },
    { key: 'qps', terms: ['QPS'], name: 'QPS · Queries Per Second',
      zh: '每秒请求数。报告时需说明统计的是到达、完成还是成功的请求。',
      en: 'Queries per second measures request volume; specify whether requests are arriving, completing or succeeding.',
      useZh: '输入输出长度会影响成本，容量评估应结合延迟目标和请求工作负载。',
      useEn: 'Input and output lengths affect cost, so capacity measurements need latency targets and a defined workload.', href: 'posts/llm-inference-metrics.html#throughput' },
    { key: 'tps', terms: ['TPS'], name: 'TPS · Tokens Per Second',
      zh: '每秒处理的 Token 数；大模型推理中应分别说明输入、输出以及单请求或聚合口径。',
      en: 'Tokens per second measures token throughput; specify input or output tokens and per-request or aggregate scope.',
      useZh: '单请求输出速度与服务总吞吐含义不同，不能仅凭一个 TPS 判断用户体验。',
      useEn: 'A request’s output speed and total service throughput answer different questions.', href: 'posts/llm-inference-metrics.html#throughput' },
    { key: 'slo', terms: ['SLO'], name: 'SLO · Service-Level Objective',
      zh: '服务级目标：以可接受的延迟、可用性或成功率等指标约束服务表现。',
      en: 'A service-level objective defines acceptable service performance through measures such as latency, availability or success rate.',
      useZh: '在满足目标的条件下衡量可用容量，而非仅寻找最大吞吐。',
      useEn: 'Measure usable capacity while meeting the objective, rather than considering peak throughput alone.', href: 'posts/llm-inference-metrics.html#load-testing' },
    { key: 'kv-cache', terms: ['KV Cache'], name: 'KV Cache · 注意力键值缓存', nameEn: 'KV Cache · Attention key/value cache',
      zh: '自回归生成时缓存已处理 Token 的注意力 K、V，减少后续生成对历史键值的重复计算。',
      en: 'Autoregressive generation caches attention keys and values for previously processed tokens to reduce repeated computation of their history.',
      useZh: '缓存随上下文和并发占用显存；容量与管理策略会影响推理效率。',
      useEn: 'Cache memory grows with context and concurrency, making its capacity and management relevant to inference efficiency.', href: 'posts/llm-inference-metrics.html#tpot' },
    { key: 'moe', terms: ['MoE'], name: 'MoE · Mixture of Experts',
      zh: '混合专家模型：由路由机制为输入选择一部分专家网络执行计算。',
      en: 'A mixture-of-experts model routes inputs to a subset of expert networks for computation.',
      useZh: '区分总参数与激活参数；路由、负载均衡和通信同样影响成本。',
      useEn: 'Distinguish total and activated parameters, and account for routing, load balancing and communication.', href: 'posts/deep-learning-architectures.html#moe' },
    { key: 'sft', terms: ['SFT'], name: 'SFT · Supervised Fine-Tuning',
      zh: '监督微调：用输入与目标回答组成的数据，训练模型生成期望的输出。',
      en: 'Supervised fine-tuning trains a model on inputs paired with desired responses.',
      useZh: '属于训练阶段；LoRA 等参数更新方法可以用于这个阶段。',
      useEn: 'It is a training stage; parameter-update approaches such as LoRA can be used within it.', href: 'posts/llm-finetuning-practice.html#pipeline' },
    { key: 'lora', terms: ['LoRA'], name: 'LoRA · Low-Rank Adaptation',
      zh: '低秩适配：通常冻结骨干权重，通过训练低秩增量矩阵完成参数更新。',
      en: 'Low-rank adaptation typically freezes backbone weights and trains low-rank update matrices.',
      useZh: '减少可训练参数，适用于监督微调或偏好优化等训练阶段。',
      useEn: 'Reduces trainable parameters and can be applied in stages such as supervised fine-tuning or preference optimization.', href: 'posts/llm-finetuning-practice.html#pipeline' },
    { key: 'qlora', terms: ['QLoRA'], name: 'QLoRA · Quantized LoRA',
      zh: '量化 LoRA：以量化形式保存骨干模型，同时训练 LoRA 增量以降低微调显存需求。',
      en: 'Quantized LoRA stores the backbone in quantized form while training LoRA updates to reduce fine-tuning memory requirements.',
      useZh: '需要结合量化配置、数值类型和任务效果评估，不能只按参数量推算显存。',
      useEn: 'Consider quantization settings, numerical types and task quality rather than estimating memory solely from parameter count.', href: 'posts/llm-finetuning-practice.html#pipeline' },
    { key: 'rlhf', terms: ['RLHF'], name: 'RLHF · Reinforcement Learning from Human Feedback',
      zh: '人类反馈强化学习：利用人类偏好信号优化模型行为，常见流程包含奖励建模与策略优化。',
      en: 'Reinforcement learning from human feedback uses human preferences to improve model behavior, commonly through reward modeling and policy optimization.',
      useZh: '需说明偏好数据、奖励信号和策略训练方式，评估时关注质量与稳定性。',
      useEn: 'Specify preference data, reward signals and policy training, and evaluate both quality and stability.', href: 'posts/reinforcement-learning-basics.html' },
    { key: 'dpo', terms: ['DPO'], name: 'DPO · Direct Preference Optimization',
      zh: '直接偏好优化：利用优选与劣选回答对，直接优化策略相对参考模型的偏好关系。',
      en: 'Direct preference optimization uses preferred and rejected response pairs to directly optimize preference relations relative to a reference model.',
      useZh: '适用于已有成对偏好数据的对齐训练，数据质量与参考策略需要明确。',
      useEn: 'Useful for alignment with paired preference data, whose quality and reference policy need to be defined.', href: 'posts/finetuning-alignment.html' },
    { key: 'grpo', terms: ['GRPO'], name: 'GRPO · Group Relative Policy Optimization',
      zh: '组相对策略优化：对同一输入采样多个输出，利用组内奖励的相对差异构造优势信号。',
      en: 'Group relative policy optimization samples multiple outputs for the same input and builds advantage signals from their relative group rewards.',
      useZh: '常用于有可评估奖励的策略训练；奖励定义和组内采样影响优化效果。',
      useEn: 'Commonly used when rewards can be evaluated; reward definitions and group sampling affect optimization.', href: 'posts/finetuning-alignment.html' },
    { key: 'mcp', terms: ['MCP'], name: 'MCP · Model Context Protocol',
      zh: '模型上下文协议：规范应用与工具、资源等能力之间的连接与交互。',
      en: 'The model context protocol standardizes how applications connect and interact with capabilities such as tools and resources.',
      useZh: '统一连接方式后，权限、数据边界与调用决策仍需要由应用明确管理。',
      useEn: 'Applications still need explicit management of permissions, data boundaries and invocation decisions.', href: 'posts/agent-frameworks-ecosystem.html#protocol' },
    { key: 'langgraph', terms: ['LangGraph'], name: 'LangGraph · 状态图工作流', nameEn: 'LangGraph · Stateful graph workflows',
      zh: '通过状态、节点和边组织工作流的运行框架，可用于编排智能体的多步执行。',
      en: 'A workflow runtime that organizes state, nodes and edges to orchestrate multi-step agent execution.',
      useZh: '节点处理任务，边决定流转；检查点可支持状态恢复和人机协作。',
      useEn: 'Nodes process tasks and edges route execution; checkpoints can support recovery and human-in-the-loop work.', href: 'posts/langgraph-deep-agent.html#mental-model' },
    { key: 'lcel', terms: ['LCEL'], name: 'LCEL · LangChain Expression Language',
      zh: 'LangChain 表达式语言：通过 Runnable 的统一接口组合串行或并行处理链。',
      en: 'The LangChain expression language composes sequential or parallel processing through a shared Runnable interface.',
      useZh: '用于组织提示、模型、解析器等环节，关注每一步的输入输出协议。',
      useEn: 'Connects prompts, models and parsers; inspect the input and output contracts of each step.', href: 'posts/langchain-core-mechanics.html#lcel' },
    { key: 'mse', terms: ['MSE'], name: 'MSE · Mean Squared Error',
      zh: '均方误差：预测值与真实值的平方差取平均，用于衡量预测偏差。',
      en: 'Mean squared error averages squared differences between predictions and ground truth to measure prediction error.',
      useZh: '比较结果时保持数据缩放、预测长度和统计范围一致，不跨不同协议直接排序。',
      useEn: 'Comparisons require matching data scaling, prediction horizons and aggregation scope.', href: 'projects/fgformer.html#results' },
    { key: 'hnsw', terms: ['HNSW'], name: 'HNSW · Hierarchical Navigable Small World',
      zh: '分层可导航小世界图：通过多层图导航进行近似最近邻搜索。',
      en: 'Hierarchical navigable small-world graphs use navigation across multiple graph layers for approximate nearest-neighbor search.',
      useZh: '搜索参数影响召回、延迟与内存开销，需要以实际数据和工作负载评测。',
      useEn: 'Search settings trade recall, latency and memory; evaluate them on the actual dataset and workload.', href: 'posts/rag-retrieval-advanced.html#ann' },
    { key: 'ivf-pq', terms: ['IVF-PQ'], name: 'IVF-PQ · Inverted File + Product Quantization',
      zh: '先用倒排分区缩小候选范围，再用乘积量化压缩向量的近似检索方案。',
      en: 'An approximate retrieval approach that narrows candidates through inverted partitions and compresses vectors with product quantization.',
      useZh: '适合关注存储成本的大规模检索；分区、量化和探测范围会影响召回。',
      useEn: 'Useful when storage cost matters at scale; partitions, quantization and probing affect recall.', href: 'posts/rag-retrieval-advanced.html#ann' },
    { key: 'peft', terms: ['PEFT'], name: 'PEFT · Parameter-Efficient Fine-Tuning',
      zh: '参数高效微调：通过少量可训练参数适配已有模型的一类方法。',
      en: 'Parameter-efficient fine-tuning is a family of methods that adapt an existing model using a limited set of trainable parameters.',
      useZh: '它描述参数更新方式，和 SFT、偏好优化等训练阶段分别讨论。',
      useEn: 'It describes how parameters are updated, separately from stages such as supervised fine-tuning or preference optimization.', href: 'posts/finetuning-alignment.html' },
    { key: 'prefill', terms: ['Prefill'], name: 'Prefill · 输入预填充', nameEn: 'Prefill · Input processing',
      zh: '推理中处理输入序列、建立上下文相关状态的阶段，随后进入逐步生成。',
      en: 'The inference stage that processes the input sequence and builds context-dependent state before incremental generation.',
      useZh: '长输入增加该阶段的工作量；首 Token 延迟还可能包含排队和网络等时间。',
      useEn: 'Longer inputs increase its workload; time to first token can also include queueing and network costs.', href: 'posts/llm-inference-metrics.html#request-lifecycle' },
    { key: 'decode', terms: ['Decode'], name: 'Decode · 自回归解码', nameEn: 'Decode · Autoregressive generation',
      zh: '基于已有上下文逐步生成后续 Token 的阶段，通常利用注意力键值缓存。',
      en: 'The stage that incrementally generates subsequent tokens from the existing context, typically using cached attention keys and values.',
      useZh: '输出长度、并发和缓存占用会影响生成时延与总吞吐。',
      useEn: 'Output length, concurrency and cache occupancy affect generation latency and total throughput.', href: 'posts/llm-inference-metrics.html#tpot' },
    { key: 'transformer', terms: ['Transformer'], name: 'Transformer · 注意力架构', nameEn: 'Transformer · Attention architecture',
      zh: '以注意力机制为核心的神经网络架构，用于建模序列元素之间的关系。',
      en: 'A neural-network architecture centered on attention for modeling relations among sequence elements.',
      useZh: '注意力、前馈网络和位置表达各有作用，可用于语言、图像或视频等任务。',
      useEn: 'Attention, feed-forward layers and position representations serve different roles across language, image and video tasks.', href: 'posts/deep-learning-architectures.html#transformer' },
    { key: 'llm', terms: ['LLM'], name: 'LLM · Large Language Model',
      zh: '大语言模型：基于大量文本数据训练，通常以 Token 为单位理解与生成文本的模型。',
      en: 'A large language model is trained on substantial text data and typically processes and generates text in tokens.',
      useZh: '智能体系统还需要工具、状态管理与执行约束来完成多步任务。',
      useEn: 'Agent systems additionally need tools, state management and execution constraints for multi-step tasks.', href: 'posts/llm-fundamentals-frontier.html#llm-to-agent' },
    { key: 'token', terms: ['Token'], name: 'Token · 模型分词单位', nameEn: 'Token · Model tokenization unit',
      zh: '模型分词后处理的基本单位，可能是一个词、词片段、字符或其他符号。',
      en: 'A basic unit produced by model tokenization, which may represent a word, word fragment, character or other symbol.',
      useZh: '不同模型分词口径可能不同；Token 数、字数与流式数据块数不能直接互换。',
      useEn: 'Tokenization varies across models; token counts, character counts and streamed chunk counts are different measures.', href: 'posts/llm-inference-metrics.html#request-lifecycle' }
  ];
  const byKey = new Map(entries.map(entry => [entry.key, entry]));
  const aliases = entries.flatMap(entry => entry.terms.map(term => ({ term, key: entry.key }))).sort((a, b) => b.term.length - a.term.length);
  const byAlias = new Map(aliases.map(alias => [alias.term.toLowerCase(), alias.key]));
  const expression = new RegExp(aliases.map(({ term }) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
  const prose = '.section p,.section li,.section .highlight-box,.section .quote-box,.home-page .hero-bio,.home-page .skill-card p,.home-page .skill-kw,.home-page .resume-document .summary,.home-page .experience li';
  const excluded = 'a,button,input,textarea,select,code,pre,kbd,samp,math,svg,canvas,figure,table,h1,h2,h3,h4,h5,h6,nav,header,footer,script,style,noscript,dialog,[hidden],[inert],[aria-hidden="true"],[contenteditable],[data-term-skip],.formula-box,.formula,.var-def,.arch-diagram,.arch-node,.arch-flow,.project-figure,.ui-reading-actions,.ui-toc,.utility-dialog,.term-help-popover';
  const maximumPerPage = 30;
  let panel = null;
  let opener = null;
  let animation = null;
  let scheduled = 0;
  let initialized = false;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const english = () => document.documentElement.lang === 'en';
  const labels = () => english()
    ? { title: 'Term explained', close: 'Close explanation', use: 'In practice', more: 'Read more', explain: 'Explain' }
    : { title: '术语释义', close: '关闭释义', use: '理解与应用', more: '深入阅读', explain: '查看术语释义' };
  const icon = name => window.SiteUI?.icon(name) || '';
  const hasModal = () => !!document.querySelector('dialog[open]');
  function nativeOpen() {
    try { return !!panel?.matches(':popover-open'); } catch (_) { return false; }
  }
  function cleanup(restoreFocus = false) {
    const previous = opener;
    if (previous) { previous.setAttribute('aria-expanded', 'false'); previous.removeAttribute('aria-describedby'); }
    opener = null;
    animation?.cancel(); animation = null;
    if (panel) { panel.hidden = true; delete panel.dataset.open; panel.classList.remove('term-help-fallback'); }
    if (restoreFocus && previous?.isConnected && previous.getClientRects().length) previous.focus({ preventScroll: true });
  }
  function close(restoreFocus = true) {
    if (nativeOpen()) { try { panel.hidePopover(); } catch (_) { /* Explicit state cleanup remains available. */ } }
    cleanup(restoreFocus);
  }
  function position() {
    scheduled = 0;
    if (!opener || !panel || panel.hidden) return;
    if (!opener.isConnected || opener.closest('[hidden],[inert]') || !opener.getClientRects().length || hasModal()) { close(false); return; }
    const rect = opener.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
    const width = viewport?.width || window.innerWidth, height = viewport?.height || window.innerHeight;
    if (rect.bottom < top || rect.top > top + height) { close(false); return; }
    panel.style.maxHeight = `${Math.max(120, Math.min(460, height - 24))}px`;
    panel.style.width = `${Math.min(376, Math.max(0, width - 24))}px`;
    const size = panel.getBoundingClientRect();
    const x = Math.max(left + 12, Math.min(rect.left, left + width - size.width - 12));
    const below = rect.bottom + 10;
    const y = below + size.height <= top + height - 12 ? below
      : rect.top - size.height - 10 >= top + 12 ? rect.top - size.height - 10
      : Math.max(top + 12, Math.min(below, top + height - size.height - 12));
    panel.style.left = `${x}px`; panel.style.top = `${y}px`;
  }
  function schedulePosition() {
    if (opener && !scheduled) scheduled = requestAnimationFrame(position);
  }
  function buildPanel() {
    if (panel) return;
    panel = document.createElement('div'); panel.id = 'term-help-panel'; panel.className = 'term-help-popover';
    // Manual mode keeps a second click on the original term from reopening after native light-dismiss.
    panel.hidden = true; panel.setAttribute('popover', 'manual'); panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'term-help-title');
    panel.setAttribute('aria-describedby', 'term-help-definition'); panel.setAttribute('data-term-skip', '');
    panel.innerHTML = '<div class="term-help-head"><div class="term-help-heading"><span class="term-help-kicker"></span><h2 id="term-help-title"></h2></div><button type="button" class="term-help-close"></button></div><p id="term-help-definition"></p><div class="term-help-use"><span class="term-help-use-label"></span><p class="term-help-application"></p></div><a class="term-help-more"></a>';
    panel.querySelector('.term-help-close').innerHTML = icon('close') || '×';
    panel.querySelector('.term-help-close').addEventListener('click', () => close(true));
    panel.querySelector('.term-help-more').addEventListener('click', event => {
      if (event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) close(false);
    });
    panel.addEventListener('toggle', () => { if (!nativeOpen() && opener && !panel.classList.contains('term-help-fallback')) cleanup(false); });
    document.body.append(panel);
  }
  function open(button) {
    if (hasModal()) return;
    if (opener === button) { close(true); return; }
    const entry = byKey.get(button.dataset.termKey);
    if (!entry) return;
    close(false); buildPanel();
    const text = labels();
    panel.querySelector('.term-help-kicker').textContent = text.title;
    panel.querySelector('#term-help-title').textContent = english() ? entry.nameEn || entry.name : entry.name;
    panel.querySelector('#term-help-definition').textContent = english() ? entry.en : entry.zh;
    panel.querySelector('.term-help-use-label').textContent = text.use;
    panel.querySelector('.term-help-application').textContent = english() ? entry.useEn : entry.useZh;
    const closeButton = panel.querySelector('.term-help-close'); closeButton.setAttribute('aria-label', text.close); closeButton.title = text.close;
    const more = panel.querySelector('.term-help-more'); more.href = new URL(entry.href, siteRoot).href;
    more.innerHTML = ''; const moreText = document.createElement('span'); moreText.textContent = text.more; more.append(moreText);
    if (icon('arrow-right')) more.insertAdjacentHTML('beforeend', icon('arrow-right'));
    opener = button; panel.hidden = false; panel.dataset.open = 'true';
    button.setAttribute('aria-expanded', 'true'); button.setAttribute('aria-describedby', 'term-help-definition');
    try {
      if (typeof panel.showPopover !== 'function') throw new Error('Popover fallback');
      panel.showPopover();
    } catch (_) { panel.classList.add('term-help-fallback'); }
    position();
    if (!panel.hidden) {
      closeButton.focus({ preventScroll: true });
      if (!reducedMotion?.matches && typeof panel.animate === 'function') animation = panel.animate([{ opacity: .9, translate: '0 4px' }, { opacity: 1, translate: '0 0' }], { duration: 150, easing: 'ease-out' });
    }
  }
  function termButton(text, key) {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'term-help-trigger';
    button.textContent = text; button.dataset.termKey = key;
    button.setAttribute('aria-label', `${labels().explain}：${text}`); button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-controls', 'term-help-panel'); button.setAttribute('aria-expanded', 'false');
    return button;
  }
  function refresh(root = document) {
    if (!root?.querySelectorAll) return;
    const present = new Set(Array.from(document.querySelectorAll('.term-help-trigger[data-term-key]'), node => node.dataset.termKey));
    if (present.size >= maximumPerPage) return;
    const scope = root === document ? prose : 'p,li,.highlight-box,.quote-box,.summary,.skill-kw';
    const blocks = Array.from(root.querySelectorAll(scope));
    if (root.matches?.(scope)) blocks.unshift(root);
    const visited = new Set();
    let enhanced = false;
    for (const block of blocks) {
      if (present.size >= maximumPerPage) break;
      if (block.closest(excluded)) continue;
      let inBlock = block.querySelectorAll('.term-help-trigger').length;
      const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue?.trim() || node.parentElement?.closest(excluded) || visited.has(node)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      const nodes = [];
      while (walker.nextNode()) { nodes.push(walker.currentNode); visited.add(walker.currentNode); }
      for (const node of nodes) {
        if (inBlock >= 2 || present.size >= maximumPerPage) break;
        const value = node.nodeValue; expression.lastIndex = 0; let match, offset = 0, changed = false;
        const fragment = document.createDocumentFragment();
        while ((match = expression.exec(value)) && inBlock < 2 && present.size < maximumPerPage) {
          const key = byAlias.get(match[0].toLowerCase());
          if (!key || present.has(key)) continue;
          // Keep English substrings inside longer words, identifiers and hyphen compounds intact.
          const before = value[match.index - 1] || '', after = value[match.index + match[0].length] || '';
          if (/[A-Za-z0-9_-]/.test(before) || /[A-Za-z0-9_-]/.test(after)) continue;
          fragment.append(document.createTextNode(value.slice(offset, match.index)), termButton(match[0], key));
          offset = match.index + match[0].length; inBlock++; present.add(key); changed = true;
        }
        if (changed) { fragment.append(document.createTextNode(value.slice(offset))); node.replaceWith(fragment); enhanced = true; }
      }
    }
    if (enhanced) document.dispatchEvent(new CustomEvent('site:explorer-layout-updated'));
  }
  function ready() {
    if (initialized) return; initialized = true; buildPanel(); refresh();
    document.addEventListener('click', event => {
      const button = event.target.closest?.('.term-help-trigger');
      if (button && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { open(button); return; }
      if (opener && !panel.contains(event.target)) close(false);
    });
    document.addEventListener('keydown', event => {
      if (!opener || event.isComposing || event.keyCode === 229) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
      else if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') close(false);
    });
    document.addEventListener('focusin', event => { if (opener && event.target !== opener && !panel.contains(event.target)) close(false); });
    document.addEventListener('site:content-updated', () => {
      close(false);
      document.querySelectorAll('.term-help-trigger').forEach(button => button.setAttribute('aria-label', `${labels().explain}：${button.textContent}`));
      refresh();
    });
    document.addEventListener('site:track-updated', () => { close(false); refresh(); });
    document.addEventListener('site:explorer-content-updated', event => { close(false); refresh(event.detail?.root || document); });
    window.addEventListener('resize', schedulePosition, { passive: true });
    window.addEventListener('scroll', schedulePosition, { passive: true, capture: true });
    window.visualViewport?.addEventListener('resize', schedulePosition, { passive: true });
    window.visualViewport?.addEventListener('scroll', schedulePosition, { passive: true });
    window.addEventListener('pagehide', () => { close(false); if (scheduled) cancelAnimationFrame(scheduled); scheduled = 0; });
    window.addEventListener('beforeprint', () => close(false));
    reducedMotion?.addEventListener?.('change', () => { if (reducedMotion.matches) { animation?.cancel(); animation = null; } });
    // Utility dialogs manage their own focus; a term explanation must yield immediately.
    if (typeof MutationObserver === 'function') new MutationObserver(() => { if (document.body.dataset.utilityOpen === 'true') close(false); }).observe(document.body, { attributes: true, attributeFilter: ['data-utility-open'] });
  }
  window.SiteTermHelp = Object.freeze({ refresh, close, count: entries.length });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true }); else ready();
})();
