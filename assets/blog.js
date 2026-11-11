'use strict';

(() => {
    // Keep the catalogue in editorial order; dates and article facts are preserved.
    const posts = [
        {
            "title": "搜索与推荐评估：CTR、GSB 与上线决策",
            "excerpt": "从点击行为与人工偏好到上线决策：统一CTR分母、三档/五档GSB、净胜率与盲评流程，结合随机化实验、置信区间和质量护栏解释收益。",
            "date": "2026-11-11",
            "category": "engineering",
            "categoryLabel": "🔧 工程实践",
            "tags": [
                "CTR",
                "GSB",
                "A/B测试",
                "评估口径"
            ],
            "url": "posts/search-quality-evaluation.html"
        },
        {
            "title": "RAG 来源质量：权威性、问题匹配与证据治理",
            "excerpt": "区分来源可信度与问题适用性，从站点、频道到页面核验证据，沿索引、召回和排序定位最优信源缺失，兼顾可信供给与回答覆盖。",
            "date": "2026-11-11",
            "category": "engineering",
            "categoryLabel": "🔧 工程实践",
            "tags": [
                "RAG",
                "来源质量",
                "权威性",
                "证据治理"
            ],
            "url": "posts/rag-source-authority.html"
        },
        {
            "title": "LLM 推理性能与并发指标：TTFT、TPOT、QPS 与 TPS",
            "excerpt": "把请求延迟、Token吞吐、频率配额与并发容量放在同一统计口径下：TTFT/TPOT/ITL、Input/Output TPS、Little’s Law与基于SLO的压测方法。",
            "date": "2026-11-11",
            "category": "llm",
            "categoryLabel": "🧠 大语言模型",
            "tags": [
                "LLM推理",
                "QPS",
                "TPS",
                "并发",
                "性能评估"
            ],
            "url": "posts/llm-inference-metrics.html"
        },
        {
            "title": "生产级 Agent 系统怎么评估？CompileLight 实战复盘",
            "excerpt": "以 CompileLight 项目为例，拆解 Agent 评估体系的核心方法论：成功率分级定义、回放评估保真度、路由决策质量、越权审计机制、评估集分层构造方法论。",
            "date": "2026-09-24",
            "category": "agent",
            "categoryLabel": "🤖 AI Agent",
            "tags": [
                "Agent评估",
                "CompileLight",
                "LLM-as-Judge",
                "评估方法论"
            ],
            "url": "posts/compilelight-agent-evaluation.html"
        },
        {
            "title": "RAG 系统工程深化：海量文档预处理、模型选型与评估体系",
            "excerpt": "从工程实践角度拆解 RAG 落地的三大难点：百万级文档的近似去重与分层清洗流水线、Embedding/Rerank 模型选型、基于 RAGAS 的检索-生成双层评估框架。",
            "date": "2026-09-24",
            "category": "engineering",
            "categoryLabel": "🔧 工程实践",
            "tags": [
                "RAG",
                "MinHash",
                "向量检索",
                "RAGAS",
                "评估"
            ],
            "url": "posts/rag-engineering-deep-dive.html"
        },
        {
            "title": "大模型微调与对齐全流程：从 SFT 到 DPO / GRPO",
            "excerpt": "梳理 Base Model 到对齐模型的完整流水线：预训练与 SFT 的 Loss 本质差异、PEFT 与训练阶段的正交关系、DPO 的 LoRA 工程实践、GRPO 相比 PPO 的显存优化路径。",
            "date": "2026-09-24",
            "category": "llm",
            "categoryLabel": "🧠 大语言模型",
            "tags": [
                "SFT",
                "DPO",
                "GRPO",
                "LoRA",
                "对齐"
            ],
            "url": "posts/finetuning-alignment.html"
        },
        {
            "title": "大模型基础、Prompt 工程与前沿技术全景",
            "excerpt": "从大模型训练范式与 Agent 能力缺口讲起，走到 Prompt 工程方法论与金融 NLP 实战案例，再到 Agent 工程化中的上下文管理、评测体系设计与幻觉治理——一份跨越认知层到工程层的技术全景。",
            "date": "2026-09-23",
            "category": "llm",
            "categoryLabel": "🧠 大语言模型",
            "tags": [
                "大模型基础",
                "Prompt工程",
                "Agent前沿",
                "LLM-as-Judge",
                "上下文管理"
            ],
            "url": "posts/llm-fundamentals-frontier.html"
        },
        {
            "title": "后端工程全景：技术栈选型、中间件面试与容器化实践",
            "excerpt": "把后端技术选型的判断逻辑、中间件面试高频考点和容器化/API框架实践整合成一条知识链路：从数据存储、缓存、向量检索怎么选，到消息队列可靠性、分布式事务落地，再到 Docker 与 FastAPI 的具体实践。",
            "date": "2026-09-13",
            "category": "engineering",
            "categoryLabel": "🔧 工程实践",
            "tags": [
                "后端架构",
                "中间件",
                "分布式系统",
                "向量检索",
                "容器化"
            ],
            "url": "posts/backend-engineering-overview.html"
        },
        {
            "title": "RAG 检索进阶：ANN 算法、LlamaIndex 与 Agentic RAG 实践",
            "excerpt": "拆解 RAG 检索链路更底层的环节——HNSW 与 IVF-PQ 两种近似最近邻算法的工程权衡、LlamaIndex 框架的设计定位，以及 Self-RAG/CRAG 等检索优化与 ReAct 范式下的 Agentic RAG 实践。",
            "date": "2026-09-05",
            "category": "engineering",
            "categoryLabel": "🔧 工程实践",
            "tags": [
                "ANN检索",
                "HNSW",
                "LlamaIndex",
                "Agentic RAG",
                "ReAct"
            ],
            "url": "posts/rag-retrieval-advanced.html"
        },
        {
            "title": "强化学习基础：从价值函数到 PPO",
            "excerpt": "从状态、动作、奖励等基本概念出发，梳理价值函数、贝尔曼方程与策略梯度的关系，再深入 PPO 的角色分工、KL 约束与裁剪目标函数，最后简述 GRPO、DPO 等对齐算法与 PPO 的核心差异。",
            "date": "2026-08-02",
            "category": "dl",
            "categoryLabel": "⚡ 深度学习",
            "tags": [
                "强化学习",
                "PPO",
                "策略梯度",
                "Actor-Critic",
                "RLHF"
            ],
            "url": "posts/reinforcement-learning-basics.html"
        },
        {
            "title": "Agent 框架生态全景：从核心概念到多智能体编排与低代码平台",
            "excerpt": "从「Agent = LLM + Memory + Tools + Planning + Action」出发，梳理 ReAct 等单智能体执行范式、AutoGen 与 CrewAI 两种多智能体编排范式的差异，再深入 MCP 协议与 Function Calling 的关系，最后落到 Dify 等低代码平台。",
            "date": "2026-08-01",
            "category": "agent",
            "categoryLabel": "🤖 AI Agent",
            "tags": [
                "AI Agent",
                "MCP",
                "多智能体",
                "AutoGen",
                "Dify"
            ],
            "url": "posts/agent-frameworks-ecosystem.html"
        },
        {
            "title": "LangGraph 与 Deep Agent：LangChain 1.0 的新范式",
            "excerpt": "从 StateGraph 的 State/Node/Edge 心智模型，到 Checkpoint 与人机协作机制，再到 Deep Agent 把规划、文件系统、子 Agent 委托打包成开箱即用的中间件——梳理 LangChain 1.0 生态从底层运行时到高层封装的完整脉络。",
            "date": "2026-08-01",
            "category": "agent",
            "categoryLabel": "🤖 AI Agent",
            "tags": [
                "LangGraph",
                "Deep Agent",
                "LangChain 1.0",
                "Agent工程"
            ],
            "url": "posts/langgraph-deep-agent.html"
        },
        {
            "title": "大模型微调实战：LoRA 训练、LLaMA-Factory 与模型压缩",
            "excerpt": "从数据格式怎么组织、训练参数怎么调、Loss 曲线怎么读，到用 LLaMA-Factory 跑通一次完整的 LoRA 训练并导出部署，再到模型蒸馏技术，整理落地时真正会碰到的工程细节，并厘清 Embedding 模型与词嵌入模型的区别。",
            "date": "2026-04-08",
            "category": "llm",
            "categoryLabel": "🧠 大语言模型",
            "tags": [
                "LoRA",
                "LLaMA-Factory",
                "模型蒸馏",
                "Embedding",
                "微调实战"
            ],
            "url": "posts/llm-finetuning-practice.html"
        },
        {
            "title": "LangChain 核心机制拆解：从 LCEL 到 Memory 与可观测性",
            "excerpt": "LangChain 的模块列表很长，但真正决定能不能用好它的，是几个反复出现的核心抽象：Runnable 协议、LCEL 的组合方式、Memory 的分级设计、Retrieval 的六环节流水线。按机制而非 API 目录重新梳理了一遍。",
            "date": "2026-04-07",
            "category": "engineering",
            "categoryLabel": "🔧 工程实践",
            "tags": [
                "LangChain",
                "LCEL",
                "Memory",
                "Agent",
                "LangSmith"
            ],
            "url": "posts/langchain-core-mechanics.html"
        },
        {
            "title": "深度学习模型架构精讲：从经典网络到 MoE 与多模态",
            "excerpt": "深度学习模型的演进，很大程度上是「给网络内置多少先验假设」与「计算怎么分配」的取舍——卷积假设空间局部性，循环假设时间依赖性，Transformer 则用注意力把这些假设换成了可学习机制。从前向/反向传播讲到 MoE 稀疏路由与 ViT 图像 Token 化。",
            "date": "2026-03-31",
            "category": "dl",
            "categoryLabel": "⚡ 深度学习",
            "tags": [
                "Transformer",
                "MoE",
                "多模态",
                "注意力机制",
                "神经网络架构"
            ],
            "url": "posts/deep-learning-architectures.html"
        }
    ];

    const categories = [
        { id: 'all', label: '全部', icon: 'book-open' },
        { id: 'agent', label: 'AI Agent', icon: 'layers' },
        { id: 'llm', label: '大语言模型', icon: 'cpu' },
        { id: 'engineering', label: '工程实践', icon: 'code' },
        { id: 'dl', label: '深度学习', icon: 'layers' }
    ];
    const categoryMap = new Map(categories.map(category => [category.id, category]));
    const elements = {
        search: document.getElementById('postSearch'),
        clear: document.getElementById('clearSearch'),
        categories: document.getElementById('categories'),
        posts: document.getElementById('postsList'),
        fallback: document.getElementById('blogFallback'),
        empty: document.getElementById('emptyState'),
        reset: document.getElementById('resetFilters'),
        heading: document.getElementById('resultsHeading'),
        count: document.getElementById('resultCount'),
        summary: document.getElementById('resultsSummary')
    };
    const state = { category: 'all', query: '' };
    let announcementTimer;

    function icon(name) {
        const container = document.createElement('span');
        container.className = 'blog-icon';
        container.setAttribute('aria-hidden', 'true');
        const supplied = window.SiteUI && typeof window.SiteUI.icon === 'function' ? window.SiteUI.icon(name) : null;
        if (typeof supplied === 'string') {
            container.innerHTML = supplied;
        } else if (supplied instanceof Node) {
            container.appendChild(supplied.cloneNode(true));
        } else {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'ui-icon');
            svg.setAttribute('aria-hidden', 'true');
            svg.setAttribute('focusable', 'false');
            const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            use.setAttribute('href', 'assets/icons.svg#' + name);
            svg.appendChild(use);
            container.appendChild(svg);
        }
        return container;
    }

    function normalize(value) {
        return String(value || '').normalize('NFKC').toLocaleLowerCase();
    }

    function normalizeQuery(value) {
        return String(value || '').trim().slice(0, 200);
    }

    function matchesQuery(post, query) {
        const terms = normalize(query).split(/\s+/).filter(Boolean);
        const text = normalize([post.title, post.excerpt].concat(post.tags).join(' '));
        return terms.every(term => text.includes(term));
    }

    function matchingPosts() {
        return posts.filter(post => (state.category === 'all' || post.category === state.category) && matchesQuery(post, state.query));
    }

    function readLocation() {
        const query = new URLSearchParams(window.location.search);
        const category = query.get('category') || 'all';
        state.category = categoryMap.has(category) ? category : 'all';
        state.query = normalizeQuery(query.get('q'));
    }

    function writeLocation(mode) {
        const url = new URL(window.location.href);
        if (state.category === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', state.category);
        if (state.query) url.searchParams.set('q', state.query);
        else url.searchParams.delete('q');
        if (url.href === window.location.href) return;
        window.history[mode === 'push' ? 'pushState' : 'replaceState'](null, '', url.pathname + url.search + url.hash);
    }

    function updateCategoryButtons() {
        const searchedPosts = posts.filter(post => matchesQuery(post, state.query));
        elements.categories.querySelectorAll('button').forEach(button => {
            const category = button.dataset.category;
            const count = category === 'all' ? searchedPosts.length : searchedPosts.filter(post => post.category === category).length;
            const active = state.category === category;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
            button.setAttribute('aria-label', categoryMap.get(category).label + '，' + count + ' 篇笔记');
            button.querySelector('.category-count').textContent = String(count);
        });
    }

    function createCard(post) {
        const card = document.createElement('a');
        card.className = 'post-card';
        card.href = post.url;
        card.dataset.category = post.category;
        const meta = document.createElement('div');
        meta.className = 'post-meta';
        const category = document.createElement('span');
        category.className = 'post-category';
        const categoryDefinition = categoryMap.get(post.category) || { label: post.categoryLabel, icon: 'book-open' };
        category.append(icon(categoryDefinition.icon), document.createTextNode(categoryDefinition.label));
        const date = document.createElement('time');
        date.className = 'post-date';
        date.dateTime = post.date;
        date.textContent = post.date.replace(/-/g, '.');
        meta.append(category, date);

        const title = document.createElement('h3');
        title.className = 'post-title';
        title.textContent = post.title;
        const excerpt = document.createElement('p');
        excerpt.className = 'post-excerpt';
        excerpt.textContent = post.excerpt;

        const tags = document.createElement('div');
        tags.className = 'post-tags';
        tags.setAttribute('aria-label', '主题：' + post.tags.join('、'));
        post.tags.slice(0, 3).forEach(tag => {
            const label = document.createElement('span');
            label.className = 'post-tag';
            label.textContent = tag;
            tags.appendChild(label);
        });
        if (post.tags.length > 3) {
            const remaining = document.createElement('span');
            remaining.className = 'post-tag-count';
            remaining.textContent = '+' + (post.tags.length - 3);
            remaining.title = post.tags.slice(3).join('、');
            remaining.setAttribute('aria-label', '其他主题：' + post.tags.slice(3).join('、'));
            tags.appendChild(remaining);
        }

        const footer = document.createElement('span');
        footer.className = 'post-card-footer';
        const action = document.createElement('span');
        action.textContent = '阅读全文';
        footer.append(action, icon('arrow-right'));
        card.append(meta, title, excerpt, tags, footer);
        return card;
    }

    function render(historyMode, syncSearch = true, motion = false) {
        const results = matchingPosts();
        if (syncSearch) elements.search.value = state.query;
        elements.clear.hidden = !elements.search.value;
        updateCategoryButtons();
        elements.posts.replaceChildren();
        const fragment = document.createDocumentFragment();
        results.forEach(post => fragment.appendChild(createCard(post)));
        elements.posts.appendChild(fragment);
        elements.fallback.hidden = true;
        elements.empty.hidden = results.length > 0;
        elements.posts.hidden = results.length === 0;
        elements.heading.textContent = state.category === 'all' ? '全部笔记' : categoryMap.get(state.category).label + '笔记';
        elements.count.textContent = String(results.length);
        const summary = state.query
            ? '关于“' + state.query + '”的 ' + results.length + ' 篇结果 · 全站 ' + posts.length + ' 篇'
            : '显示 ' + results.length + ' 篇 · 全站 ' + posts.length + ' 篇';
        clearTimeout(announcementTimer);
        announcementTimer = setTimeout(() => { elements.summary.textContent = summary; }, 120);
        if (historyMode) writeLocation(historyMode);
        document.dispatchEvent(new CustomEvent('site:motion-refresh'));
        if (motion) window.SiteMotion?.enter(document.querySelector('.library-results'));
    }

    function update(category, query, historyMode, syncSearch = true, motion = false) {
        state.category = categoryMap.has(category) ? category : 'all';
        state.query = normalizeQuery(query);
        render(historyMode, syncSearch, motion);
    }

    categories.forEach(category => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-tag';
        button.dataset.category = category.id;
        button.append(icon(category.icon), document.createTextNode(category.label));
        const count = document.createElement('span');
        count.className = 'category-count';
        count.setAttribute('aria-hidden', 'true');
        button.appendChild(count);
        button.addEventListener('click', () => update(category.id, state.query, 'push', true, true));
        elements.categories.appendChild(button);
    });

    document.querySelectorAll('[data-blog-icon]').forEach(element => {
        element.replaceChildren(icon(element.dataset.blogIcon));
    });
    document.getElementById('postCount').textContent = String(posts.length);
    document.getElementById('categoryCount').textContent = String(new Set(posts.map(post => post.category)).size);
    document.getElementById('libraryControls').hidden = false;
    elements.search.addEventListener('input', event => {
        if (!event.isComposing) update(state.category, elements.search.value, 'replace', false);
    });
    elements.search.addEventListener('compositionend', () => update(state.category, elements.search.value, 'replace', false));
    elements.search.addEventListener('keydown', event => {
        if (!event.isComposing && event.keyCode !== 229 && event.key === 'Escape' && elements.search.value) {
            event.preventDefault();
            update(state.category, '', 'replace', true, true);
        }
    });
    elements.clear.addEventListener('click', () => {
        update(state.category, '', 'replace', true, true);
        elements.search.focus();
    });
    elements.reset.addEventListener('click', () => {
        update('all', '', 'push', true, true);
        elements.search.focus();
    });
    window.addEventListener('popstate', () => { readLocation(); render(); });

    window.BlogLibrary = Object.freeze({
        getState: () => ({ category: state.category, query: state.query, total: posts.length, resultCount: matchingPosts().length }),
        getPosts: () => posts.map(post => ({ ...post, tags: post.tags.slice() })),
        filter: (category, query = state.query) => update(category, query, 'push', true, true),
        reset: () => update('all', '', 'push', true, true)
    });
    readLocation();
    render();
})();
