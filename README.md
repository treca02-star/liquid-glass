# Liquid glass

Скилл для Claude Code: собирает функциональные сайты и веб-приложения в стиле liquid glass. Экран делится на скруглённые модули, разделы живут на отдельных страницах, плавающее стеклянное меню сжимается при прокрутке.

Работает поверх скилла [Hallmark](https://github.com/Nutlope/hallmark): Hallmark проверяет результат своими правилами и линтером.

## Что внутри

- `skills/liquid-glass/SKILL.md` — порядок работы и главные правила.
- `skills/liquid-glass/assets/kit/` — набор: стили, поведение и три страницы-примера.
- `skills/liquid-glass/assets/design.md` — дизайн-система в формате Hallmark для корня проекта.
- `skills/liquid-glass/references/` — раскладка, список деталей, проверка через Hallmark.

## Установка

Нужен Node 18 или новее.

```bash
npx skills add nutlope/hallmark -g
```

```bash
npx skills add treca02-star/liquid-glass -g
```

Первая команда ставит Hallmark, вторая сам скилл.

## Как пользоваться

В новом чате Claude Code опишите, какой сайт нужен, или вызовите скилл по имени: `/liquid-glass`. Claude задаст несколько вопросов, предложит карту страниц и модулей и после вашего «ок» соберёт сайт.

## Посмотреть демо

Откройте папку `skills/liquid-glass/assets/kit` через любой локальный сервер и зайдите на `index.html`:

```bash
npx serve skills/liquid-glass/assets/kit
```

## Благодарности

Файл `base.css` и шкала в `tokens.css` получены из заготовки Hallmark (лицензия MIT, Together AI).
