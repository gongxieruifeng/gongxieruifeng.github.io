(() => {
    'use strict';
    const body = document.body;
    const focusCard = document.querySelector('.focus-card');
    const projectGrid = document.getElementById('projects-grid');
    const toolbar = document.getElementById('resume-toolbar');
    if (!body.classList.contains('home-page') || !focusCard || !projectGrid || !toolbar) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const motionKey = 'profile-visual-motion';
    const topics = ['all', 'agent', 'spatial', 'temporal'];
    const projectTopics = {
        'compilelight.html': ['agent'], 'geome.html': ['spatial'],
        'geogr2.html': ['spatial', 'temporal'], 'fgformer.html': ['temporal']
    };
    const tracks = {
        agent: ['compilelight', 'geome', 'geogr2', 'smart-qa', 'wellbeing'],
        tsf: ['fgformer', 'geogr2', 'compilelight', 'smart-qa', 'wellbeing']
    };
    let enabled = true;
    try { enabled = localStorage.getItem(motionKey) !== 'off'; } catch (_) { /* Optional preference. */ }
    let selectedTopic = readTopic();
    let cards = [];
    let entries = [];
    let activeTrack = '';
    let readingFrame = 0;
    let pointerFrame = 0;
    let pointerTarget = null;
    let pointerPosition = null;
    let scrollToCurrentLink = false;
    let previousReadingId = '';

    const motionButton = document.createElement('button');
    motionButton.type = 'button';
    motionButton.className = 'profile-motion-toggle';
    motionButton.innerHTML = '<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5v14M17 5v14" /></svg><span class="profile-motion-label"></span>';
    focusCard.querySelector('.focus-top').append(motionButton);

    const filterBar = document.createElement('div');
    filterBar.className = 'project-filterbar';
    const filterList = document.createElement('div');
    filterList.className = 'project-filter-list';
    filterList.setAttribute('role', 'group');
    const filterStatus = document.createElement('p');
    filterStatus.className = 'project-filter-status';
    filterStatus.setAttribute('role', 'status');
    filterStatus.setAttribute('aria-atomic', 'true');
    for (const topic of topics) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'project-filter';
        button.dataset.projectTopic = topic;
        button.setAttribute('aria-controls', 'projects-grid');
        button.innerHTML = '<span class="profile-filter-label"></span><span class="profile-filter-count" aria-hidden="true"></span>';
        filterList.append(button);
    }
    filterBar.append(filterList, filterStatus);
    projectGrid.before(filterBar);

    const resumeNav = document.createElement('nav');
    resumeNav.className = 'profile-resume-nav';
    const resumeNavLabel = document.createElement('span');
    resumeNavLabel.className = 'profile-resume-label';
    const resumeLinks = document.createElement('div');
    resumeLinks.className = 'profile-resume-links';
    resumeNav.append(resumeNavLabel, resumeLinks);
    toolbar.after(resumeNav);
    const indicator = document.createElement('span');
    indicator.className = 'profile-tab-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    toolbar.querySelector('.tabs-container').append(indicator);
    toolbar.querySelector('.tabs-container').classList.add('has-profile-indicator');

    const progress = document.createElement('div');
    progress.className = 'profile-reading-progress';
    progress.setAttribute('aria-hidden', 'true');
    const progressFill = document.createElement('span');
    progress.append(progressFill);
    document.getElementById('navbar').append(progress);

    function english() { return document.documentElement.lang === 'en'; }
    function labels() {
        return english()
            ? { all: 'All projects', agent: 'Agent systems', spatial: 'Spatial reasoning', temporal: 'Forecasting', qa: 'Smart Q&A', wellbeing: 'Wellbeing' }
            : { all: '全部项目', agent: 'Agent 系统', spatial: '空间推理', temporal: '时空预测', qa: '党建问答', wellbeing: '心理预警' };
    }
    function readTopic() {
        const value = new URL(window.location.href).searchParams.get('projects');
        return topics.includes(value) ? value : 'all';
    }
    function writeTopic(mode) {
        const url = new URL(window.location.href);
        if (selectedTopic === 'all') url.searchParams.delete('projects');
        else url.searchParams.set('projects', selectedTopic);
        if (url.href === window.location.href) return;
        try { history[mode === 'push' ? 'pushState' : 'replaceState'](history.state, '', url); }
        catch (_) { /* Filtering also works when history is unavailable. */ }
    }
    function collectCards() {
        cards = Array.from(projectGrid.querySelectorAll('.project-card'));
        for (const card of cards) {
            const href = card.querySelector('a[href^="projects/"]')?.getAttribute('href') || '';
            card.dataset.projectTopic = (projectTopics[href.split('/').pop()] || []).join(' ');
        }
    }
    function applyTopic() {
        const text = labels();
        let count = 0;
        for (const card of cards) {
            const matches = selectedTopic === 'all' || card.dataset.projectTopic.split(' ').includes(selectedTopic);
            card.hidden = !matches;
            card.classList.toggle('is-topic-match', matches && selectedTopic !== 'all');
            if (matches) count++;
        }
        for (const button of filterList.children) {
            const topic = button.dataset.projectTopic;
            const total = topic === 'all' ? cards.length : cards.filter(card => card.dataset.projectTopic.split(' ').includes(topic)).length;
            button.setAttribute('aria-pressed', String(topic === selectedTopic));
            button.querySelector('.profile-filter-label').textContent = text[topic];
            button.querySelector('.profile-filter-count').textContent = String(total);
        }
        filterList.setAttribute('aria-label', english() ? 'Filter projects by research area' : '按研究方向筛选项目');
        filterStatus.textContent = english() ? `${count} ${count === 1 ? 'project' : 'projects'}` : `${count} 个项目`;
        focusCard.dataset.selectedTopic = selectedTopic;
        for (const link of focusCard.querySelectorAll('[data-focus-topic]')) {
            link.classList.toggle('is-selected', link.dataset.focusTopic === selectedTopic);
            const name = link.querySelector('h3')?.textContent || text[link.dataset.focusTopic];
            link.setAttribute('aria-label', english() ? `Explore ${name} projects` : `查看${name}项目`);
        }
        body.dataset.projectTopic = selectedTopic;
    }
    function setTopic(topic, historyMode) {
        if (!topics.includes(topic)) return;
        const changed = topic !== selectedTopic;
        selectedTopic = topic;
        applyTopic();
        if (historyMode && changed) writeTopic(historyMode);
        if (changed && body.dataset.profileMotion === 'on') window.SiteMotion?.enter(projectGrid);
        window.SiteMotion?.refresh();
        queueReading();
    }
    filterList.addEventListener('click', event => {
        const button = event.target.closest('button[data-project-topic]');
        if (button) setTopic(button.dataset.projectTopic, 'push');
    });
    focusCard.addEventListener('click', event => {
        const link = event.target.closest('a[data-focus-topic]');
        if (link && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) setTopic(link.dataset.focusTopic, 'replace');
    });
    window.addEventListener('popstate', () => setTopic(readTopic()));

    function refreshResume() {
        for (const [track, keys] of Object.entries(tracks)) {
            document.querySelectorAll(`#panel-${track} .experience`).forEach((entry, index) => {
                entry.id = `resume-${track}-${keys[index] || `entry-${index + 1}`}`;
                entry.tabIndex = -1;
            });
        }
        const panel = document.querySelector('.resume-panel:not([hidden])');
        if (!panel) return;
        const track = panel.id === 'panel-tsf' ? 'tsf' : 'agent';
        const changed = activeTrack !== track;
        activeTrack = track;
        for (const entry of entries) entry.classList.remove('is-reading');
        entries = Array.from(panel.querySelectorAll('.experience'));
        const text = labels();
        const names = { compilelight: 'CompileLight', geome: 'GeoME', geogr2: 'GeoGR²', fgformer: 'FGFormer', 'smart-qa': text.qa, wellbeing: text.wellbeing };
        const focusedId = document.activeElement?.closest('.profile-resume-link')?.hash;
        const fragment = document.createDocumentFragment();
        entries.forEach((entry, index) => {
            const key = tracks[track][index] || `entry-${index + 1}`;
            entry.id = `resume-${track}-${key}`;
            entry.tabIndex = -1;
            const link = document.createElement('a');
            link.className = 'profile-resume-link';
            link.href = `#${entry.id}`;
            link.textContent = names[key] || String(index + 1);
            fragment.append(link);
        });
        resumeLinks.replaceChildren(fragment);
        resumeNav.setAttribute('aria-label', english() ? 'Jump to an experience' : '快速定位经历');
        resumeNavLabel.textContent = english() ? 'Jump to' : '快速定位';
        if (focusedId) Array.from(resumeLinks.children).find(link => link.hash === focusedId)?.focus({ preventScroll: true });
        scrollToCurrentLink = changed;
        queueReading();
    }
    function restoreHashTrack(initial = false) {
        const match = window.location.hash.match(/^#resume-(agent|tsf)-/);
        if (!match) return;
        const tab = document.getElementById(`tab-${match[1]}`);
        if (!tab) return;
        const changed = tab.getAttribute('aria-selected') !== 'true';
        if (changed) tab.click();
        if (!initial && !changed) return;
        // Generated or previously hidden targets can miss the browser's first hash scroll.
        requestAnimationFrame(() => {
            document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: 'instant', block: 'start' });
            queueReading();
        });
    }
    function updateReading() {
        readingFrame = 0;
        if (document.hidden) return;
        const range = document.documentElement.scrollHeight - window.innerHeight;
        progressFill.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
        const selectedTab = toolbar.querySelector('[role="tab"][aria-selected="true"]');
        if (selectedTab) {
            indicator.style.setProperty('--tab-x', `${selectedTab.offsetLeft}px`);
            indicator.style.setProperty('--tab-width', `${selectedTab.offsetWidth}px`);
        }
        const resume = document.getElementById('resume').getBoundingClientRect();
        const inResume = resume.top < window.innerHeight && resume.bottom > 150;
        let current = null;
        if (inResume) {
            const line = Math.max(160, window.innerHeight * .28);
            for (const entry of entries) {
                if (!current || entry.getBoundingClientRect().top <= line) current = entry;
            }
        }
        const readingChanged = (current?.id || '') !== previousReadingId;
        for (const entry of entries) entry.classList.toggle('is-reading', entry === current);
        for (const link of resumeLinks.children) {
            const active = current && link.hash === `#${current.id}`;
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
            if (active && (scrollToCurrentLink || readingChanged)) {
                const left = link.offsetLeft - resumeLinks.offsetLeft;
                if (left < resumeLinks.scrollLeft || left + link.offsetWidth > resumeLinks.scrollLeft + resumeLinks.clientWidth) {
                    resumeLinks.scrollLeft = Math.max(0, left - 12);
                }
            }
        }
        previousReadingId = current?.id || '';
        scrollToCurrentLink = false;
        if (!heroObserver) {
            const bounds = focusCard.getBoundingClientRect();
            focusCard.dataset.inView = String(bounds.bottom > 0 && bounds.top < window.innerHeight);
        }
    }
    function queueReading() {
        if (!document.hidden && !readingFrame) readingFrame = requestAnimationFrame(updateReading);
    }
    const heroObserver = typeof window.IntersectionObserver === 'function' ? new IntersectionObserver(records => {
        for (const record of records) focusCard.dataset.inView = String(record.isIntersecting);
        if (focusCard.dataset.inView === 'false') resetPointer();
    }, { threshold: 0 }) : null;
    if (heroObserver) heroObserver.observe(focusCard);

    function clearPointerStyles(target) {
        if (!target) return;
        target.style.removeProperty('--pointer-x');
        target.style.removeProperty('--pointer-y');
        if (target === focusCard) {
            const visual = focusCard.querySelector('.profile-visual');
            visual.style.removeProperty('--visual-x');
            visual.style.removeProperty('--visual-y');
        }
    }
    function resetPointer() {
        if (pointerFrame) cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        clearPointerStyles(pointerTarget);
        pointerTarget = pointerPosition = null;
    }
    function updatePointer() {
        pointerFrame = 0;
        if (!pointerTarget?.isConnected || !pointerPosition || body.dataset.profileMotion !== 'on' || document.hidden) return;
        const rect = pointerTarget.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = Math.min(1, Math.max(0, (pointerPosition.x - rect.left) / rect.width));
        const y = Math.min(1, Math.max(0, (pointerPosition.y - rect.top) / rect.height));
        pointerTarget.style.setProperty('--pointer-x', `${x * 100}%`);
        pointerTarget.style.setProperty('--pointer-y', `${y * 100}%`);
        if (pointerTarget === focusCard) {
            const visual = focusCard.querySelector('.profile-visual');
            visual.style.setProperty('--visual-x', `${(x - .5) * 8}px`);
            visual.style.setProperty('--visual-y', `${(y - .5) * 6}px`);
        }
    }
    document.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse' || !finePointer.matches || body.dataset.profileMotion !== 'on' || document.hidden) return;
        const target = event.target.closest('.focus-card, .projects-grid > .project-card');
        if (!target) { resetPointer(); return; }
        if (target !== pointerTarget) { clearPointerStyles(pointerTarget); pointerTarget = target; }
        pointerPosition = { x: event.clientX, y: event.clientY };
        if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
    }, { passive: true });
    document.addEventListener('pointerout', event => {
        if (pointerTarget && !pointerTarget.contains(event.relatedTarget)) resetPointer();
    }, { passive: true });
    document.addEventListener('focusin', resetPointer);
    window.addEventListener('blur', resetPointer);

    function updateMotion() {
        const mode = reduced.matches ? 'reduced' : enabled ? 'on' : 'off';
        body.dataset.profileMotion = mode;
        body.dataset.profileVisible = String(!document.hidden);
        motionButton.disabled = reduced.matches;
        motionButton.setAttribute('aria-pressed', String(mode === 'on'));
        motionButton.querySelector('.profile-motion-label').textContent = reduced.matches
            ? (english() ? 'Static mode' : '静态模式')
            : enabled ? (english() ? 'Pause visuals' : '暂停动画') : (english() ? 'Enable visuals' : '开启动画');
        motionButton.title = reduced.matches
            ? (english() ? 'Following your system preference for reduced motion.' : '遵循系统的减少动画设置。')
            : (english() ? 'Toggle the background and pointer animations. Navigation stays available.' : '切换背景与鼠标视觉动画，保留导航反馈。');
        motionButton.querySelector('svg').innerHTML = enabled && !reduced.matches
            ? '<path d="M7 5v14M17 5v14" />' : '<path d="m8 5 11 7-11 7Z" />';
        if (mode !== 'on' || document.hidden) resetPointer();
    }
    motionButton.addEventListener('click', () => {
        if (reduced.matches) return;
        enabled = !enabled;
        try { localStorage.setItem(motionKey, enabled ? 'on' : 'off'); } catch (_) { /* Optional preference. */ }
        updateMotion();
    });
    if (typeof reduced.addEventListener === 'function') reduced.addEventListener('change', updateMotion);
    else reduced.addListener(updateMotion);
    if (typeof finePointer.addEventListener === 'function') finePointer.addEventListener('change', resetPointer);
    else finePointer.addListener(resetPointer);
    window.addEventListener('scroll', queueReading, { passive: true });
    window.addEventListener('resize', queueReading, { passive: true });
    document.addEventListener('site:reading-preferences-updated', queueReading);
    document.addEventListener('site:explorer-layout-updated', queueReading);
    window.addEventListener('hashchange', () => restoreHashTrack());
    document.addEventListener('site:track-updated', refreshResume);
    document.addEventListener('site:content-updated', () => {
        resetPointer(); collectCards(); applyTopic(); refreshResume(); updateMotion();
    });
    document.addEventListener('visibilitychange', () => {
        updateMotion();
        if (document.hidden && readingFrame) { cancelAnimationFrame(readingFrame); readingFrame = 0; }
        else queueReading();
    });
    window.addEventListener('pagehide', () => {
        body.dataset.profileVisible = 'false';
        resetPointer();
        if (readingFrame) cancelAnimationFrame(readingFrame);
        readingFrame = 0;
    });
    window.addEventListener('pageshow', () => { updateMotion(); queueReading(); });
    window.addEventListener('storage', event => {
        if (event.key === motionKey) { enabled = event.newValue !== 'off'; updateMotion(); }
    });
    document.fonts?.ready.then(queueReading);
    collectCards(); applyTopic(); refreshResume(); updateMotion();
    restoreHashTrack(true);
})();
