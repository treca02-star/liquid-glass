/* Стеклянный набор: поведение. Подключается в <head> без defer, чтобы настройки применились до отрисовки. */
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* приватный режим */ } }
  };

  /* ---------- 1. Настройки вида ----------
     Источник правды — tokens.css. Здесь применяются только значения, которые человек сам сохранил
     на странице настроек (если она есть в проекте). */
  const DEFAULTS = { blur: 14, alpha: 58, radius: 20, gap: 12, accent: 'black', dock: 'bottom', expand: 'stop' };
  const saved = store.get('glass:settings', {});
  const settings = { ...DEFAULTS, dock: root.dataset.dockPos || DEFAULTS.dock, ...saved };
  const APPLY = {
    blur: v => root.style.setProperty('--glass-blur', v + 'px'),
    alpha: v => root.style.setProperty('--glass-alpha', v + '%'),
    radius: v => root.style.setProperty('--radius-card', v + 'px'),
    gap: v => root.style.setProperty('--module-gap', v + 'px'),
    accent: v => root.style.setProperty('--color-accent', `var(--accent-${v})`),
    dock: v => { root.dataset.dockPos = v; }
  };
  const applySettings = values => Object.entries(values).forEach(([key, value]) => APPLY[key]?.(value));
  function saveSettings(patch) { Object.assign(settings, patch); Object.assign(saved, patch); store.set('glass:settings', saved); applySettings(patch); }
  applySettings(saved);

  /* ---------- 2. Иконки: один набор на все страницы ---------- */
  const ICONS = {
    home: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    layers: '<path d="M12 3 3 8l9 5 9-5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
    sliders: '<path d="M4 7h8M18 7h2M4 17h2M12 17h8"/><circle cx="15" cy="7" r="2.5"/><circle cx="9" cy="17" r="2.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    more: '<path d="M6 12h.01M12 12h.01M18 12h.01" stroke-width="2.6"/>',
    timer: '<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M9.5 3h5"/>',
    download: '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    sheet: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M4 14h16"/>',
    bell: '<path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20.5a2 2 0 0 0 4 0"/>',
    reset: '<path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4.5h4.5"/>'
  };
  function injectIcons() {
    const symbols = Object.entries(ICONS).map(([name, body]) => `<symbol id="i-${name}" viewBox="0 0 24 24">${body}</symbol>`).join('');
    document.body.insertAdjacentHTML('afterbegin', `<svg aria-hidden="true" style="position:absolute;width:0;height:0">${symbols}</svg>`);
  }

  /* ---------- 3. Меню разделов: сжимается при прокрутке ---------- */
  function initDock() {
    const bar = document.querySelector('[data-dock]');
    if (!bar) return;
    const dock = bar.querySelector('.dock');
    const tabs = [...dock.querySelectorAll('.dock__tab')];
    const current = dock.querySelector('[aria-current="page"]') ?? tabs[0];
    const lastY = new WeakMap();
    let compact = false, stopTimer;
    bar.insertAdjacentHTML('beforeend', '<span class="dock__ring" aria-hidden="true"></span>');
    // Сколько обрезать слева и справа, чтобы от меню остался кружок вокруг иконки текущего раздела
    const measure = () => {
      const d = dock.getBoundingClientRect(), i = current.querySelector('.icon').getBoundingClientRect();
      const centre = i.left + i.width / 2 - d.left, half = d.height / 2;
      bar.style.setProperty('--dock-l', Math.max(0, centre - half) + 'px');
      bar.style.setProperty('--dock-r', Math.max(0, d.width - centre - half) + 'px');
    };
    measure();
    addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    const set = value => {
      if (value === compact) return;
      if (value) measure();
      compact = value;
      bar.classList.toggle('is-compact', value);
      tabs.forEach(tab => { if (tab !== current) tab.inert = value; });
    };
    document.addEventListener('scroll', event => {
      const el = event.target === document ? document.scrollingElement : event.target;
      if (!(el instanceof Element) || el.closest('dialog, [popover], textarea')) return;
      const y = el.scrollTop, delta = y - (lastY.get(el) ?? y);
      lastY.set(el, y);
      if (delta > 2 && y > 24) set(true);        // листаем вниз — сжать
      else if (delta < -2) set(false);           // листаем вверх — раскрыть
      clearTimeout(stopTimer);
      if (settings.expand === 'stop') stopTimer = setTimeout(() => set(false), 650);  // остановились — раскрыть
    }, { capture: true, passive: true });
    bar.addEventListener('click', event => { if (compact && event.target.closest('.dock')) { event.preventDefault(); set(false); } });
  }

  /* ---------- 4. Название страницы появляется в шапке, когда заголовок уехал ---------- */
  function initTitle() {
    const title = document.querySelector('.page-title');
    if (!title || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(([entry]) => document.body.classList.toggle('is-scrolled', !entry.isIntersecting), { rootMargin: '-56px 0px 0px 0px' }).observe(title);
  }

  /* ---------- 5. Шторки ---------- */
  function initSheets() {
    document.addEventListener('click', event => {
      const opener = event.target.closest('[data-sheet-open]');
      if (opener) { document.getElementById(opener.dataset.sheetOpen)?.showModal(); return; }
      const closer = event.target.closest('[data-sheet-close]');
      if (closer) { closer.closest('dialog')?.close(); return; }
      const dialog = event.target;
      if (dialog instanceof HTMLDialogElement && dialog.classList.contains('sheet')) {
        const r = dialog.getBoundingClientRect();   // клик мимо панели — по затемнению
        if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
      }
    });
  }

  /* ---------- 6. Меню, вырастающее из кнопки ---------- */
  function initMenus() {
    document.querySelectorAll('.menu[popover]').forEach(menu => {
      menu.addEventListener('beforetoggle', event => {
        if (event.newState !== 'open') return;
        const button = document.querySelector(`[popovertarget="${menu.id}"]`);
        if (!button) return;
        const r = button.getBoundingClientRect(), vw = root.clientWidth, vh = root.clientHeight;
        const toRight = r.left + r.width / 2 > vw / 2, below = r.top + r.height / 2 < vh / 2;
        Object.assign(menu.style, {
          left: toRight ? 'auto' : r.left + 'px', right: toRight ? vw - r.right + 'px' : 'auto',
          top: below ? r.bottom + 8 + 'px' : 'auto', bottom: below ? 'auto' : vh - r.top + 8 + 'px'
        });
        menu.style.setProperty('--menu-origin', `${below ? 'top' : 'bottom'} ${toRight ? 'right' : 'left'}`);
      });
      menu.addEventListener('click', event => { if (event.target.closest('.menu__item')) menu.hidePopover(); });
    });
  }

  /* ---------- 7. Уведомление ---------- */
  let toastEl, toastTimer;
  function toast(text, action) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast glass';
      toastEl.setAttribute('role', 'status');
      document.body.append(toastEl);
    }
    toastEl.textContent = text;
    if (action) {
      const button = Object.assign(document.createElement('button'), { type: 'button', className: 'toast__action', textContent: action.label });
      button.addEventListener('click', () => { action.run(); toastEl.classList.remove('is-on'); });
      toastEl.append(button);
    }
    requestAnimationFrame(() => toastEl.classList.add('is-on'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), action ? 5000 : 2200);
  }

  /* ---------- 8. Преломление по краям стекла (только Chromium; в остальных остаётся размытие) ---------- */
  function initLens() {
    const chromium = !!window.chrome || !!navigator.userAgentData?.brands?.some(b => b.brand === 'Chromium');
    if (!chromium || matchMedia('(prefers-reduced-transparency: reduce)').matches) return;
    const targets = document.querySelectorAll('[data-lens]');
    if (!targets.length) return;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0';
    document.body.append(svg);
    targets.forEach((el, index) => {
      const id = `lens-${index}`;
      svg.insertAdjacentHTML('beforeend', `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage result="map" x="0" y="0" preserveAspectRatio="none"/><feDisplacementMap in="SourceGraphic" in2="map" scale="${Number(el.dataset.lens) || 26}" xChannelSelector="R" yChannelSelector="G"/></filter>`);
      const image = svg.querySelector(`#${id} feImage`);
      let frame;
      const update = () => {
        const w = Math.round(el.offsetWidth), h = Math.round(el.offsetHeight);
        if (!w || !h) return;
        const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
        const rim = Math.min(14, h / 4);
        // Карта смещения: красный канал сдвигает по X, зелёный по Y; у краёв картинка тянется изнутри, в центре без искажений
        const map = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="x" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#f00"/><stop offset="1" stop-color="#000"/></linearGradient><linearGradient id="y" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#0f0"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="${w}" height="${h}" fill="#808000"/><rect width="${w}" height="${h}" rx="${radius}" fill="url(#x)"/><rect width="${w}" height="${h}" rx="${radius}" fill="url(#y)" style="mix-blend-mode:screen"/><rect x="${rim}" y="${rim}" width="${w - 2 * rim}" height="${h - 2 * rim}" rx="${Math.max(radius - rim, 0)}" fill="#808000" style="filter:blur(${rim * 0.55}px)"/></svg>`;
        image.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(map));
        image.setAttribute('width', w);
        image.setAttribute('height', h);
      };
      new ResizeObserver(() => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); }).observe(el);
      update();
      el.style.backdropFilter = `url(#${id}) blur(var(--glass-blur)) saturate(var(--glass-sat))`;
    });
  }

  /* ---------- 9. Капсула состояния рядом с меню (здесь — идущий таймер) ---------- */
  const fmtTime = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  function initStatus() {
    const el = document.querySelector('.dock-status');
    if (!el) return;
    const out = el.querySelector('[data-time]');
    const tick = () => {
      const timer = store.get('glass:timer', null);
      const left = timer?.end ? Math.max(0, Math.round((timer.end - Date.now()) / 1000)) : 0;
      el.hidden = !(left > 0);
      if (left > 0) out.textContent = fmtTime(left);
    };
    tick();
    setInterval(tick, 500);
  }

  window.glass = { store, settings, DEFAULTS, saveSettings, toast, fmtTime };
  document.addEventListener('DOMContentLoaded', () => { injectIcons(); initDock(); initTitle(); initSheets(); initMenus(); initStatus(); initLens(); });
})();
