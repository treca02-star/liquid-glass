# Design: <project name>

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: app screen
- Theme: custom (vibe: "liquid glass floating over quiet grey modules")
- Axes: light/sans/ink · posture: dense

## Tokens
`tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(99% 0.002 250);  --color-paper-2: oklch(96% 0.004 250);  --color-paper-3: oklch(92.5% 0.005 250);
  --color-ink: oklch(19% 0.008 250);  --color-ink-2: oklch(33% 0.008 250);  --color-muted: oklch(48% 0.01 250);  --color-rule: oklch(89% 0.005 250);
  --color-accent: var(--accent-black);  --color-accent-ink: oklch(99% 0.002 250);  --color-focus: oklch(56% 0.19 255);
  --font-display: "Onest", ui-sans-serif, system-ui, sans-serif;  --font-body: "Onest", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 20px;  --radius-pill: 999px;  --radius-control: 12px;  --radius-sheet: 28px;  --rule-hair: 1px;  --shadow-card: none;
  --glass-blur: 14px;  --glass-sat: 1.7;  --glass-alpha: 58%;  --module-gap: 12px;  --module-pad: 16px;
}
```
The spacing scale, the type scale, the easings and the durations are Hallmark's app scaffold and live in `tokens.css`.

## Surfaces
- Page: paper. Modules: paper-2, radius-card, no border, no shadow. One containment layer: nothing card-like inside a module.
- Glass is only for what floats above the page: the dock, the top bar items, menus, toasts. Never for modules.
- Colour is restrained: the accent marks the primary action and the current selection. Green and red only for meaning.

## Layout
- Every section of the site is its own page; the floating dock moves between pages. Two to five tabs.
- A working page fits the screen (`app--fit`): the page does not scroll, long content scrolls inside a module.
- The screen is a 12 by 6 grid of modules (`bento`). Modules fill the screen; no module is mostly empty.
- Fields are never full width: 22rem at most, side by side in `field-row`.

## Controls
- Primary: accent fill · pill · 40px. One per page; a sheet counts as its own page.
- Secondary: outline in rule colour · same radius and height. Small: 32px with a 44px hit area.
- Choice: chips for two to six options, a select for more, a switch for on and off.

## Motion
- Character: calm. Only `transform`, `opacity` and `clip-path` move; nothing animates size or position.
- The dock shrinks to a circle while the page scrolls and opens again when scrolling stops.
- Sheets rise from the bottom, menus grow out of their button. Under reduced motion everything ends at once.

## Exports
`tokens.css` in this project.
