# Детали набора

Точную разметку бери из страниц-примеров в `assets/kit/`. Здесь сказано, какая деталь есть, как называется её класс, в каком примере она лежит и когда её применять.

## Детали

| Деталь | Классы | Пример | Когда |
|---|---|---|---|
| Каркас страницы | `.edge-fade`, `.bar`, `.app`, `.page-head`, `.dockbar` | `starter.html` | на каждой странице, без изменений структуры |
| Сетка модулей | `.bento`, `.bento--flow`, `.bento--hug`, `cN`, `rN`, `.pin-right` | `index.html`, `settings.html` | основа любой страницы |
| Модуль | `.module`, `__head`, `__title`, `__meta`, `__body`, `__foot` | `index.html` | любой блок содержимого |
| Плитки | `.tiles`, `.tiles--3`, `.tiles--4`, `.tiles--auto`, `.tile` | `index.html`, шторка в `components.html` | 2–8 быстрых действий, по одному на плитку |
| Кнопки | `.btn`, `.btn--quiet`, `.btn--sm`, `.btn--block`, `.icon-btn` | `components.html` | главная одна на страницу |
| Поле | `.field`, `__label`, `__hint`, `.input`, `.select`, `.textarea`, `.field-row`, `.input-group` | `index.html` (конвертер, задачи), `components.html` | любой ввод |
| Таблетки | `.chips`, `.chip`, внутри скрытый `radio` | `index.html` (таймер) | выбор одного из 2–6 |
| Переключатель, галочка, ползунок | `.switch`, `.check`, `.range`, `.range-row` | `components.html`, `settings.html` | вкл/выкл, отметка, число из диапазона |
| Список строк | `.rows`, `.row`, `.row__text`, `.row__meta` | `index.html` (задачи) | короткие записи с действием |
| Таблица | `.table` | `components.html` | данные с колонками |
| Большое число | `.figure-xl` | `index.html` (таймер) | одно главное число модуля |
| Состояния | `.empty`, `.skeleton`, `.state-error` | `components.html` | пусто, загрузка, ошибка |
| Шторка | `dialog.sheet`, `__grab`, `__head`, `__title`, `__body`, `__foot` | `index.html`, `components.html` | короткое дело поверх страницы |
| Меню из кнопки | `.menu.glass[popover]`, `.menu__label`, `.menu__item`, `.menu__sep` | `index.html` | редкие действия |
| Меню разделов | `.dockbar[data-dock]`, `.dock.glass[data-lens]`, `.dock__tab`, `.dock__label` | `starter.html` | на каждой странице |
| Капсула состояния | `.dock-status.glass` внутри `.dockbar` | `index.html` | идущий процесс |
| Стеклянная поверхность | `.glass`, по желанию `data-lens` | шапка, меню | только для плавающих элементов |

## Что умеет `glass.js`

Подключается в `<head>` без `defer`. Всё включается само по разметке:

- `data-dock` на `.dockbar`: меню разделов сжимается при прокрутке вниз и раскрывается, когда прокрутка остановилась. Реагирует и на прокрутку внутри модулей. Нажатие на сжатое меню раскрывает его.
- `.page-title`: когда заголовок уехал под шапку, название страницы появляется в `.bar__title`.
- `data-sheet-open="id"` открывает шторку, `data-sheet-close` закрывает. Нажатие мимо шторки и Esc тоже закрывают.
- `popovertarget="id"` на кнопке и `.menu[popover]`: меню встаёт рядом с кнопкой и вырастает из неё. Нажатие на пункт закрывает меню.
- `data-lens` на стеклянном элементе: преломление по краям. Работает только в Chromium, в остальных браузерах остаётся размытие.
- Иконки: `<svg class="icon"><use href="#i-имя"/></svg>`. Есть `home`, `layers`, `sliders`, `plus`, `close`, `more`, `timer`, `download`, `trash`, `copy`, `sheet`, `bell`, `reset`. Новую иконку добавляй в объект `ICONS` в `glass.js`: контур 24 на 24, без заливки.

Из своего кода доступно:

```js
const { store, toast, saveSettings, settings, fmtTime } = glass;
store.get('ключ', запасное);  store.set('ключ', значение);   // сохранение в браузере
toast('Сохранено');                                           // короткое уведомление
toast('Убрано: 3', { label: 'Вернуть', run: () => вернуть() }); // с отменой
```

Капсула состояния сейчас показывает таймер из ключа `glass:timer`. Для другого процесса напиши свою логику: показывай и прячь `.dock-status` через `hidden` и меняй текст внутри.

## В React

`glass.js` в React не подключается. Те же возможности дают компоненты из `assets/react/glass.tsx`: `GlassProvider`, `GlassDock`, `Sheet`, `GlassMenu`, `Icon`, `useToast`, `usePageTitleSwap`. Как их ставить, сказано в `react.md`.

## Чего нет в наборе

Графики, карты, загрузка файлов, вход по паролю. Если они нужны, собирай их по тем же правилам: модуль как контейнер, цвета и шрифты только через токены, движение только `transform` и `opacity`.
