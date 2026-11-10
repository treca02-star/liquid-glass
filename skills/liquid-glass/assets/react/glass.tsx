/* Liquid glass для React. Вид берётся из tokens.css и glass.css, здесь только поведение.
   Ничего не пишет в localStorage и cookie. Не ставит атрибут style: размеры передаются через
   element.style.setProperty, это разрешено строгой CSP. Преломление стекла (data-lens) сюда
   не перенесено намеренно: ему нужны картинки data: в img-src. */
import { Fragment, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { MouseEvent, ReactNode, RefObject } from 'react';

/* ---------- Иконки: контур 24 на 24, цвет от текста ---------- */
const ICONS = {
  home: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></>,
  layers: <><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5" /></>,
  sliders: <><path d="M4 7h8M18 7h2M4 17h2M12 17h8" /><circle cx="15" cy="7" r="2.5" /><circle cx="9" cy="17" r="2.5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  more: <path d="M6 12h.01M12 12h.01M18 12h.01" strokeWidth="2.6" />,
  timer: <><circle cx="12" cy="13" r="7.5" /><path d="M12 9v4l2.5 2M9.5 3h5" /></>,
  download: <path d="M12 4v11m0 0-4-4m4 4 4-4M5 20h14" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  sheet: <><rect x="4" y="4" width="16" height="16" rx="3.5" /><path d="M4 14h16" /></>,
  bell: <path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15L6 16ZM10 20.5a2 2 0 0 0 4 0" />,
  reset: <path d="M4 12a8 8 0 1 0 2.6-5.9M4 4v4.5h4.5" />
};
export type IconName = keyof typeof ICONS;
export function Icon({ name }: { name: IconName }) {
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{ICONS[name]}</svg>;
}

/* ---------- Корень: включает скрытые состояния из glass.css и даёт уведомления ---------- */
export type ToastAction = { label: string; run: () => void };
type Toast = (text: string, action?: ToastAction) => void;
const ToastContext = createContext<Toast>(() => {});
export const useToast = () => useContext(ToastContext);

export function GlassProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ text: string; action?: ToastAction; on: boolean }>({ text: '', on: false });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    document.documentElement.classList.add('js');   // без этого класса кольцо меню и название в шапке видны всегда
    return () => clearTimeout(timer.current);
  }, []);
  const hide = useCallback(() => setState(s => ({ ...s, on: false })), []);
  const toast = useCallback<Toast>((text, action) => {
    setState({ text, action, on: true });
    clearTimeout(timer.current);
    timer.current = setTimeout(hide, action ? 5000 : 2200);
  }, [hide]);
  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className={`toast glass${state.on ? ' is-on' : ''}`} role="status">
        {state.text}
        {state.action && <button type="button" className="toast__action" onClick={() => { state.action?.run(); hide(); }}>{state.action.label}</button>}
      </div>
    </ToastContext.Provider>
  );
}

/* ---------- Меню разделов: сжимается при прокрутке, раскрывается при остановке ---------- */
export type DockItem = { href: string; label: string; icon: IconName; current?: boolean };
type DockLinkProps = { className: string; 'aria-current'?: 'page' };
type DockProps = {
  items: DockItem[];
  label?: string;
  /** Капсула состояния рядом с меню: элемент с классами "dock-status glass" */
  status?: ReactNode;
  expandOn?: 'stop' | 'up';
  /** Ссылка роутера вместо <a>: (item, props, children) => <Link to={item.href} {...props}>{children}</Link> */
  renderLink?: (item: DockItem, props: DockLinkProps, children: ReactNode) => ReactNode;
};

export function GlassDock({ items, label = 'Разделы', status, expandOn = 'stop', renderLink }: DockProps) {
  const bar = useRef<HTMLDivElement>(null);
  const dock = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(false);
  const currentHref = items.find(item => item.current)?.href;

  // Сколько обрезать слева и справа, чтобы от меню остался кружок вокруг иконки текущего раздела
  const measure = useCallback(() => {
    const b = bar.current, d = dock.current;
    const icon = d?.querySelector('[aria-current="page"] .icon') ?? d?.querySelector('.icon');
    if (!b || !d || !icon) return;
    const dr = d.getBoundingClientRect(), ir = icon.getBoundingClientRect();
    const centre = ir.left + ir.width / 2 - dr.left, half = dr.height / 2;
    b.style.setProperty('--dock-l', `${Math.max(0, centre - half)}px`);
    b.style.setProperty('--dock-r', `${Math.max(0, dr.width - centre - half)}px`);
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure, currentHref, items.length]);

  useEffect(() => {
    const lastY = new WeakMap<Element, number>();
    let stop: ReturnType<typeof setTimeout> | undefined;
    const onScroll = (event: Event) => {
      const el = event.target === document ? document.scrollingElement : event.target;
      if (!(el instanceof Element) || el.closest('dialog, [popover], textarea')) return;
      const y = el.scrollTop, delta = y - (lastY.get(el) ?? y);
      lastY.set(el, y);
      if (delta > 2 && y > 24) { measure(); setCompact(true); }
      else if (delta < -2) setCompact(false);
      clearTimeout(stop);
      if (expandOn === 'stop') stop = setTimeout(() => setCompact(false), 650);
    };
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => { document.removeEventListener('scroll', onScroll, { capture: true }); clearTimeout(stop); };
  }, [expandOn, measure]);

  // В сжатом меню скрытые вкладки недоступны с клавиатуры
  useEffect(() => {
    dock.current?.querySelectorAll<HTMLElement>('.dock__tab').forEach(tab => {
      tab.inert = compact && tab.getAttribute('aria-current') !== 'page';
    });
  }, [compact, currentHref]);

  // Нажатие на сжатое меню раскрывает его, а не ведёт по ссылке
  const expand = (event: MouseEvent) => {
    if (!compact) return;
    event.preventDefault();
    event.stopPropagation();
    setCompact(false);
  };

  return (
    <div ref={bar} className={`dockbar${compact ? ' is-compact' : ''}`}>
      <nav ref={dock} className="dock glass" aria-label={label} onClickCapture={expand}>
        {items.map(item => {
          const props: DockLinkProps = item.current ? { className: 'dock__tab', 'aria-current': 'page' } : { className: 'dock__tab' };
          const children = <><Icon name={item.icon} /><span className="dock__label">{item.label}</span></>;
          return <Fragment key={item.href}>{renderLink ? renderLink(item, props, children) : <a href={item.href} {...props}>{children}</a>}</Fragment>;
        })}
      </nav>
      {status}
      <span className="dock__ring" aria-hidden="true" />
    </div>
  );
}

/* ---------- Шторка ---------- */
type SheetProps = { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode };

export function Sheet({ open, onClose, title, children, footer }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);
  // Нажатие мимо панели, по затемнению
  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    const dialog = ref.current;
    if (!dialog || event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) onClose();
  };
  return (
    <dialog ref={ref} className="sheet" aria-label={title} onClose={onClose} onClick={onBackdrop}>
      <div className="sheet__grab" aria-hidden="true" />
      <div className="sheet__head">
        <h2 className="sheet__title">{title}</h2>
        <button type="button" className="icon-btn" aria-label="Закрыть" onClick={onClose}><Icon name="close" /></button>
      </div>
      <div className="sheet__body">{children}</div>
      {footer && <div className="sheet__foot">{footer}</div>}
    </dialog>
  );
}

/* ---------- Меню, вырастающее из кнопки. Пункты: <button className="menu__item"> ---------- */
type MenuProps = { buttonLabel: string; icon?: IconName; title?: string; children: ReactNode };

export function GlassMenu({ buttonLabel, icon = 'more', title, children }: MenuProps) {
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const b = button.current, m = menu.current;
    if (!b || !m) return;
    m.setAttribute('popover', 'auto');
    b.popoverTargetElement = m;
    const place = (event: Event) => {
      if ((event as Event & { newState?: string }).newState !== 'open') return;
      const r = b.getBoundingClientRect(), root = document.documentElement, vw = root.clientWidth, vh = root.clientHeight;
      const toRight = r.left + r.width / 2 > vw / 2, below = r.top + r.height / 2 < vh / 2;
      m.style.setProperty('left', toRight ? 'auto' : `${r.left}px`);
      m.style.setProperty('right', toRight ? `${vw - r.right}px` : 'auto');
      m.style.setProperty('top', below ? `${r.bottom + 8}px` : 'auto');
      m.style.setProperty('bottom', below ? 'auto' : `${vh - r.top + 8}px`);
      m.style.setProperty('--menu-origin', `${below ? 'top' : 'bottom'} ${toRight ? 'right' : 'left'}`);
    };
    m.addEventListener('beforetoggle', place);
    return () => m.removeEventListener('beforetoggle', place);
  }, []);
  const closeOnItem = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as Element).closest('.menu__item')) menu.current?.hidePopover();
  };
  return (
    <>
      <button ref={button} type="button" className="icon-btn glass" aria-label={buttonLabel}><Icon name={icon} /></button>
      <div ref={menu} className="menu glass" onClick={closeOnItem}>
        {title && <div className="menu__label">{title}</div>}
        {children}
      </div>
    </>
  );
}

/* ---------- Название страницы в шапке: показывается, когда заголовок уехал вверх ---------- */
export function usePageTitleSwap(title: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = title.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(([entry]) => document.body.classList.toggle('is-scrolled', !entry.isIntersecting), { rootMargin: '-56px 0px 0px 0px' });
    observer.observe(el);
    return () => { observer.disconnect(); document.body.classList.remove('is-scrolled'); };
  }, [title]);
}
