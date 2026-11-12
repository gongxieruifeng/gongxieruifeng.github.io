(() => {
    'use strict';
    const assetRoot = new URL('.', document.currentScript.src);
    const siteRoot = new URL('../', assetRoot);
    const scopes = ['all', 'resume', 'project', 'post', 'recent'];
    const dialogStates = new WeakMap();
    let activeDialog = null;
    let navigationPromise = null;
    let navigationFailed = false;
    let catalogue = [];
    let searchDialog, searchButton, searchInput, resultList, resultStatus, scopeList, searchHint, clearRecentButton;
    let selectedScope = 'all';
    let composing = false;
    const isEnglish = () => document.documentElement.lang === 'en';
    const words = () => isEnglish()
        ? { search: 'Quick find', title: 'Find a page or experience', placeholder: 'Project, technology or article title', all: 'All', resume: 'Resume', project: 'Projects', post: 'Notes', recent: 'Recent reading', close: 'Close', loading: 'Preparing the directory…', empty: 'No matches. Try a shorter keyword.', noRecent: 'Read a section to save a place here.', clear: 'Clear reading history', hint: 'Type to find content · ↑ ↓ to browse · Enter to open · Esc to close', unavailable: 'The full directory is unavailable. The main pages are still listed.', result: 'results' }
        : { search: '快捷查找', title: '查找页面与经历', placeholder: '输入项目、技术或文章标题', all: '全部', resume: '简历', project: '项目', post: '技术笔记', recent: '最近阅读', close: '关闭', loading: '正在准备目录…', empty: '没有匹配结果，试试更简短的关键词。', noRecent: '阅读章节后，可在这里找到上次的位置。', clear: '清除阅读记录', hint: '输入关键词查找 · ↑ ↓ 选择 · Enter 打开 · Esc 关闭', unavailable: '暂时无法加载完整目录，仍可使用主要页面入口。', result: '个结果' };
    const icon = name => window.SiteUI?.icon(name) || '';
    function focusable(dialog) {
        return Array.from(dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex]'))
            .filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
    }
    function cleanupDialog(dialog) {
        const state = dialogStates.get(dialog);
        if (!state) return;
        dialogStates.delete(dialog);
        state.backdrop?.remove();
        if (activeDialog === dialog) activeDialog = null;
        for (const [element, value] of state.inert) {
            if (value) element.setAttribute('inert', '');
            else element.removeAttribute('inert');
        }
        if (!activeDialog) {
            document.body.style.overflow = state.overflow;
            delete document.body.dataset.utilityOpen;
        }
        dialog.classList.remove('utility-fallback');
        if (!activeDialog && state.opener?.isConnected && state.opener.getClientRects().length) state.opener.focus({ preventScroll: true });
        dialog.dispatchEvent(new Event('utility:closed'));
    }
    function closeDialog(dialog) {
        if (!dialog) return;
        cleanupDialog(dialog);
        if (typeof dialog.close === 'function' && dialog.open) dialog.close();
        else dialog.removeAttribute('open');
    }
    function openDialog(dialog, opener = document.activeElement) {
        if (activeDialog === dialog && dialog.open) return;
        // An image viewer keeps its own focus and scroll management.
        if (document.querySelector('dialog[open]:not(.utility-dialog)')) return;
        if (activeDialog) {
            if (activeDialog.contains(opener)) opener = dialogStates.get(activeDialog)?.opener || opener;
            closeDialog(activeDialog);
        }
        const state = { opener, overflow: document.body.style.overflow, inert: [] };
        dialogStates.set(dialog, state);
        activeDialog = dialog;
        document.body.dataset.utilityOpen = 'true';
        document.body.style.overflow = 'hidden';
        try {
            if (typeof dialog.showModal !== 'function') throw new Error('Dialog fallback');
            dialog.showModal();
        } catch (_) {
            dialog.setAttribute('open', '');
            dialog.classList.add('utility-fallback');
            const backdrop = document.createElement('div');
            backdrop.className = 'utility-backdrop';
            backdrop.setAttribute('aria-hidden', 'true');
            backdrop.addEventListener('click', event => { event.preventDefault(); closeDialog(dialog); });
            state.backdrop = backdrop;
            document.body.append(backdrop);
            for (const element of document.body.children) {
                if (element === dialog || element === backdrop || element.matches('script,link')) continue;
                state.inert.push([element, element.hasAttribute('inert')]);
                element.setAttribute('inert', '');
            }
        }
        const target = dialog.querySelector('[autofocus],input:checked') || focusable(dialog)[0] || dialog;
        target.focus({ preventScroll: true });
    }
    function createDialog({ id, className = '', label = '' }) {
        const dialog = document.createElement('dialog');
        dialog.id = id;
        dialog.className = `utility-dialog ${className}`.trim();
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-label', label);
        dialog.tabIndex = -1;
        let ime = false;
        dialog.addEventListener('compositionstart', () => { ime = true; });
        dialog.addEventListener('compositionend', () => { ime = false; });
        dialog.addEventListener('cancel', event => { event.preventDefault(); if (!ime) closeDialog(dialog); });
        dialog.addEventListener('close', () => {
            // A queued native close event can arrive after this dialog reopens.
            if (dialog.open) return;
            ime = false; cleanupDialog(dialog);
        });
        dialog.addEventListener('utility:closed', () => { ime = false; });
        dialog.addEventListener('click', event => {
            if (event.target.closest('[data-utility-close]')) { closeDialog(dialog); return; }
            if (event.target !== dialog) return;
            const rect = dialog.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(dialog);
        });
        dialog.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !ime && !event.isComposing && event.keyCode !== 229) {
                event.preventDefault(); event.stopPropagation(); closeDialog(dialog);
            } else if (event.key === 'Tab') {
                const elements = focusable(dialog);
                if (!elements.length) { event.preventDefault(); dialog.focus(); return; }
                const first = elements[0], last = elements[elements.length - 1];
                if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
            }
        });
        document.body.append(dialog);
        return dialog;
    }
    document.addEventListener('focusin', event => {
        if (activeDialog?.classList.contains('utility-fallback') && !activeDialog.contains(event.target)) (focusable(activeDialog)[0] || activeDialog).focus();
    });
    function safeHref(value) {
        if (typeof value !== 'string') return null;
        try {
            const url = new URL(value, siteRoot);
            const relative = url.pathname.slice(siteRoot.pathname.length);
            if (url.origin !== window.location.origin || !url.pathname.startsWith(siteRoot.pathname) || url.search || !/^(?:index\.html|blog\.html|(?:posts|projects)\/[a-z0-9][a-z0-9-]*\.html)?$/.test(relative)) return null;
            return url.href;
        } catch (_) { return null; }
    }
    function fallbackCatalogue() {
        return [
            ['index.html#home', '个人主页', 'Profile', 'resume'], ['index.html#about', '教育背景', 'Education', 'resume'],
            ['index.html#skills', '专业技能', 'Technical skills', 'resume'], ['index.html#resume', '在线简历', 'Resume', 'resume'],
            ['index.html#contact', '联系作者', 'Contact', 'resume'], ['index.html#projects', '精选项目', 'Selected projects', 'project'],
            ['projects/compilelight.html', 'CompileLight', 'CompileLight', 'project'], ['projects/geome.html', 'GeoME', 'GeoME', 'project'],
            ['projects/geogr2.html', 'GeoGR²', 'GeoGR²', 'project'], ['projects/fgformer.html', 'FGFormer', 'FGFormer', 'project'],
            ['blog.html', '技术笔记目录', 'Technical notes', 'post']
        ].map(([href, title, title_en, type]) => ({ href: safeHref(href), title, title_en, type, description: '', description_en: '', keywords: [] }));
    }
    function loadNavigation() {
        if (!navigationPromise) navigationPromise = fetch(new URL('navigation.json', assetRoot))
            .then(response => { if (!response.ok) throw new Error('Unavailable'); return response.json(); })
            .then(data => {
                if (data.version !== 1 || !Array.isArray(data.items)) throw new Error('Invalid directory');
                const records = data.items.filter(item => ['resume', 'project', 'post'].includes(item.type) && typeof item.title === 'string' && safeHref(item.href));
                if (!records.length) throw new Error('Empty directory');
                catalogue = records.map(item => ({ ...item, href: safeHref(item.href), keywords: Array.isArray(item.keywords) ? item.keywords.filter(word => typeof word === 'string') : [] }));
                return catalogue;
            }).catch(() => { navigationFailed = true; catalogue = fallbackCatalogue(); return catalogue; });
        return navigationPromise;
    }
    function normalize(value) { return String(value || '').normalize('NFKC').toLocaleLowerCase().trim(); }
    function navigationHref(value) {
        const target = new URL(value), current = new URL(window.location.href);
        const pageKey = url => url.pathname === siteRoot.pathname || url.pathname === new URL('index.html', siteRoot).pathname ? 'home' : url.pathname;
        if (target.hash && pageKey(target) === pageKey(current)) { current.hash = target.hash; return current.href; }
        return target.href;
    }
    function recentItems() {
        return (window.SiteReadingSupport?.getRecent() || []).filter(record => safeHref(record.href)).map(record => ({
            href: safeHref(record.href), title: record.title, title_en: record.title, type: 'recent',
            description: record.label, description_en: record.label, keywords: [record.title, record.label]
        }));
    }
    function renderSearch() {
        if (!searchDialog) return;
        const text = words(), query = normalize(searchInput.value).slice(0, 200);
        const terms = query.split(/\s+/).filter(Boolean);
        const source = selectedScope === 'recent' ? recentItems() : catalogue.filter(item => selectedScope === 'all' || item.type === selectedScope);
        const matches = source.filter(item => {
            const haystack = normalize([item.title, item.title_en, item.description, item.description_en, ...(item.keywords || [])].join(' '));
            return terms.every(term => haystack.includes(term));
        });
        const fragment = document.createDocumentFragment();
        for (const item of matches) {
            const row = document.createElement('li'), link = document.createElement('a');
            link.className = 'utility-search-result'; link.href = navigationHref(item.href);
            const title = document.createElement('span'); title.className = 'utility-result-title'; title.textContent = isEnglish() ? item.title_en || item.title : item.title;
            const description = document.createElement('span'); description.className = 'utility-result-description'; description.textContent = isEnglish() ? item.description_en || item.description : item.description;
            const type = document.createElement('span'); type.className = 'utility-result-type'; type.textContent = text[item.type];
            link.append(title, description, type); row.append(link); fragment.append(row);
        }
        resultList.replaceChildren(fragment);
        resultStatus.textContent = matches.length ? (isEnglish() ? `${matches.length} ${text.result}` : `${matches.length} ${text.result}`)
            : selectedScope === 'recent' && !source.length ? text.noRecent : text.empty;
        if (!catalogue.length && selectedScope !== 'recent') resultStatus.textContent = text.loading;
        clearRecentButton.hidden = selectedScope !== 'recent' || !source.length;
        clearRecentButton.closest('.utility-dialog-footer').hidden = clearRecentButton.hidden;
        for (const button of scopeList.children) { button.textContent = text[button.dataset.searchScope]; button.setAttribute('aria-pressed', String(selectedScope === button.dataset.searchScope)); }
        searchHint.textContent = navigationFailed && selectedScope !== 'recent' ? text.unavailable : text.hint;
    }
    function refreshLabels() {
        if (!searchDialog) return;
        const text = words();
        searchButton.querySelector('.utility-search-label').textContent = text.search;
        searchButton.setAttribute('aria-label', `${text.search} (${navigator.platform.includes('Mac') ? '⌘ K' : 'Ctrl K'})`);
        searchDialog.setAttribute('aria-label', text.title);
        searchDialog.querySelector('h2').textContent = text.title;
        searchDialog.querySelector('[data-utility-close]').setAttribute('aria-label', text.close);
        searchDialog.querySelector('label').textContent = text.search;
        searchInput.placeholder = text.placeholder;
        clearRecentButton.textContent = text.clear;
        scopeList.setAttribute('aria-label', isEnglish() ? 'Search scope' : '查找范围');
        renderSearch();
    }
    function openSearch() {
        if (!searchDialog || document.querySelector('dialog[open]:not(.utility-dialog)')) return;
        searchButton.setAttribute('aria-expanded', 'true');
        openDialog(searchDialog, document.activeElement);
        refreshLabels();
        loadNavigation().then(() => { if (searchDialog.open) renderSearch(); });
    }
    function ready() {
        if (searchDialog) return;
        const host = document.querySelector('.nav-actions') || document.querySelector('.blog-nav-links') || document.querySelector('.navbar .nav-inner');
        if (!host) return;
        host.closest('.nav-inner')?.classList.add('has-utility-search');
        searchButton = document.createElement('button'); searchButton.type = 'button'; searchButton.className = 'utility-button utility-nav-search site-search-trigger';
        searchButton.setAttribute('aria-haspopup', 'dialog'); searchButton.setAttribute('aria-controls', 'site-search-dialog'); searchButton.setAttribute('aria-expanded', 'false');
        searchButton.innerHTML = icon('search') + '<span class="utility-search-label"></span><kbd class="utility-shortcut"></kbd>';
        searchButton.querySelector('kbd').textContent = navigator.platform.includes('Mac') ? '⌘ K' : 'Ctrl K';
        host.append(searchButton);
        searchDialog = createDialog({ id: 'site-search-dialog', className: 'utility-search-dialog', label: words().title });
        searchDialog.innerHTML = '<div class="utility-dialog-head"><h2 id="utility-search-title"></h2><button class="utility-icon-button" type="button" data-utility-close>' + icon('close') + '</button></div>'
            + '<div class="utility-dialog-body"><form class="utility-search-form" role="search"><label for="site-search-input"></label><input id="site-search-input" type="search" maxlength="200" autocomplete="off" autofocus aria-describedby="utility-search-hint"><p class="utility-search-hint" id="utility-search-hint"></p></form><div class="utility-search-filters" role="group" aria-label="Search scope"></div><p class="utility-search-status" role="status" aria-live="polite" aria-atomic="true"></p><ul class="utility-search-results"></ul></div><div class="utility-dialog-footer"><button type="button" class="utility-button" id="utility-clear-recent" hidden></button></div>';
        searchInput = searchDialog.querySelector('input'); resultList = searchDialog.querySelector('.utility-search-results'); resultStatus = searchDialog.querySelector('.utility-search-status');
        scopeList = searchDialog.querySelector('.utility-search-filters'); searchHint = searchDialog.querySelector('.utility-search-hint'); clearRecentButton = searchDialog.querySelector('#utility-clear-recent');
        for (const scope of scopes) { const button = document.createElement('button'); button.type = 'button'; button.className = 'utility-button'; button.dataset.searchScope = scope; scopeList.append(button); }
        searchButton.addEventListener('click', openSearch);
        searchDialog.addEventListener('utility:closed', () => { composing = false; searchButton.setAttribute('aria-expanded', 'false'); });
        scopeList.addEventListener('click', event => { const button = event.target.closest('[data-search-scope]'); if (button) { selectedScope = button.dataset.searchScope; renderSearch(); } });
        searchInput.addEventListener('compositionstart', () => { composing = true; });
        searchInput.addEventListener('compositionend', () => { composing = false; renderSearch(); });
        searchInput.addEventListener('input', event => { if (!composing && !event.isComposing) renderSearch(); });
        searchDialog.querySelector('form').addEventListener('submit', event => {
            event.preventDefault(); if (composing) return;
            resultList.querySelector('a')?.click();
        });
        searchDialog.querySelector('form').addEventListener('keydown', event => {
            if (event.key === 'Enter' && (composing || event.isComposing || event.keyCode === 229)) event.preventDefault();
        });
        searchDialog.addEventListener('keydown', event => {
            if (event.isComposing || event.keyCode === 229 || !['ArrowDown', 'ArrowUp'].includes(event.key) || event.metaKey || event.ctrlKey || event.altKey) return;
            const links = Array.from(resultList.querySelectorAll('a'));
            if (!links.length || !(event.target === searchInput || event.target.closest('.utility-search-result'))) return;
            event.preventDefault();
            const current = links.indexOf(document.activeElement);
            const next = current < 0 ? (event.key === 'ArrowDown' ? 0 : links.length - 1) : (current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
            links[next].focus();
        });
        resultList.addEventListener('click', event => {
            const link = event.target.closest('a');
            if (link && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) closeDialog(searchDialog);
        });
        clearRecentButton.addEventListener('click', () => { window.SiteReadingSupport?.clearRecent(); renderSearch(); searchInput.focus({ preventScroll: true }); });
        document.addEventListener('site:content-updated', refreshLabels);
        document.addEventListener('site:reading-position-updated', () => { if (searchDialog.open && selectedScope === 'recent') renderSearch(); });
        document.addEventListener('keydown', event => {
            if (event.isComposing || event.keyCode === 229 || event.repeat || event.altKey || event.shiftKey || !(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
            if (document.querySelector('dialog[open]:not(.utility-dialog)')) return;
            event.preventDefault();
            if (activeDialog === searchDialog) closeDialog(searchDialog);
            else openSearch();
        });
        window.addEventListener('pagehide', () => { if (activeDialog) closeDialog(activeDialog); });
        refreshLabels();
    }
    window.SiteTools = Object.freeze({ createDialog, openDialog, closeDialog, openSearch, loadNavigation });
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready, { once: true });
    else ready();
})();
