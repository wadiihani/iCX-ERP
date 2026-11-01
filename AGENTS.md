<!-- xenon:start -->
# Xenon: rules for AI agents building UI

You are building UI with **Xenon** (`@xenon-kit/web`), a minimalistic, hairline-crisp React UI kit. In Xenon the design rules matter as much as the components. A page that uses Xenon components but breaks these rules is wrong.

Do not apply habits from shadcn, MUI, HeroUI or Tailwind UI. Xenon deliberately differs from them.

## Sources of truth (read in this order)

1. This file.
2. `node_modules/@xenon-kit/web/docs/DESIGN.md`: philosophy and the banned-patterns table.
3. `node_modules/@xenon-kit/web/docs/TOKENS.md` and `docs/guidelines/*.md`: tokens, type, spacing, shape, color, motion, interaction.
4. `node_modules/@xenon-kit/web/dist/index.d.ts`: the exact props of every component. If a prop is not in the types, it does not exist.
5. Online (same content, plus examples): `https://xenon.hi-ashwin.xyz/llms.txt`, `https://xenon.hi-ashwin.xyz/llms-full.txt`, component registry `https://xenon.hi-ashwin.xyz/r` and `https://xenon.hi-ashwin.xyz/r/<component>.json`.

Never invent a component, prop or token. If something you need is missing, compose it from existing components, or tell the user.

## Setup (React 19+, any bundler: Vite, Next.js App Router)

```bash
npm install @xenon-kit/web @phosphor-icons/react
```

```tsx
import "@xenon-kit/web/styles.css"; // once, at the app root: tokens + base layer
import { XenonProvider } from "@xenon-kit/web";

<XenonProvider defaultTheme="dark" defaultAccent="lime" defaultRadius={5}>
  {children}
</XenonProvider>;
```

- `theme`: `"dark" | "light" | "system"`. `accent`: `"lime" | "orange" | "pink" | "blue" | "purple" | "green"`. `radius`: stop `0`–`6` (5 is the default, 6 is pill).
- The package is marked `"use client"`. In Next.js, the provider can sit in `app/layout.tsx` directly.
- To avoid a light flash on first paint, put the same values on `<html>`: `<html lang="en" data-x-theme="dark" data-x-accent="lime" data-x-radius="5">` (`npx @xenon-kit/cli init` does this for you).
- Xenon needs no Tailwind. Do not add Tailwind or another CSS framework to style Xenon pages.

## Hard rules (never violate)

- **No gradients. No shadows** (`box-shadow`, `drop-shadow`, `text-shadow`, glows). Depth comes from 1px hairlines (`var(--x-border)`) and surface tone (`--x-bg`, `--x-surface`, `--x-surface-2`).
- **No blur** except Liquid Glass on floating layers (navbar, tab bar, popovers, dialogs, command palette). Never on content cards, inputs or the page canvas.
- **No emoji. No ASCII glyphs as UI chrome** (`×`, `+`, `-`, `>`, `!`, `?`). Every icon is Phosphor, weight `thin`, wrapped in Xenon `Icon`: `<Icon><MagnifyingGlass /></Icon>`.
- **Font weights 200, 300 or 400 only.** Never 500+. Build hierarchy with size and color (`tone="muted"`), not weight.
- **Borders are 1px.** No 2px+ borders, no dashed decoration, no detached focus outlines.
- **No card inside a card.** Inside one `Surface`, group with spacing, a header row or a `Divider`.
- **Dividers separate major sections only**, not consecutive items inside a section. Use proximity and negative space.
- **Inputs are not pills.** Pills are only for buttons, chips and dedicated search bars.
- **One accent per screen.** Everything else is neutral. Semantic colors (`--x-danger`, `--x-success`, `--x-warning`, `--x-info`) are for status only.
- **No raw hex, px, ms or cubic-bezier in your own styles.** Use the CSS variables listed below.
- **Motion is never instant.** Any custom transition uses `var(--x-dur-base)` with `var(--x-ease-standard)` or `var(--x-ease-spring)`. Never toggle `display: none` on something that should animate.
- **Hover is an enhancement only**, gated by `@media (hover: hover)`. Never hide critical actions behind hover.
- **Disclosures must signal their state.** Anything that expands has a rotating caret (Accordion, Select and DropdownMenu already do this).
- **Restraint.** Pages are sparse, grid-aligned and typographically led. One idea per viewport on landing pages. Popovers and dialogs stay compact: no duplicate buttons, no decorative preview boxes. Avoid the generic AI look: purple gradients, glowing cards, emoji bullets, badge-stuffed cards.

## Build pages from these primitives

Layout and type: `Stack` (`direction`, `gap` in px, `align`, `justify`), `Group` (horizontal, `wrap`), `Surface` (`variant="default"|"subtle"|"glass"`, `padding`; nested radius is computed automatically), `Divider`, `Heading` (`level`, `styleKey="display"|"largeTitle"|"title1"|"title2"|"title3"`), `Text` (`styleKey`, `tone`, `as`), `Link`, `Icon`.

Actions: `Button` (`variant="accent"|"filled"|"subtle"|"outline"|"ghost"|"glass"`, `size="sm"|"md"|"lg"`, `loading`), `IconButton` (requires `ariaLabel`), `ButtonGroup`, `ToggleButton`, `SegmentedControl`.

Forms: `Field`, `Input`, `InputGroup`, `Textarea`, `Checkbox`, `Radio`/`RadioGroup`, `Switch`, `Slider`, `Select`, `Combobox`.

Navigation: `Navbar`, `GlassBar`, `Sidebar`, `Tabs`, `TabBar`, `Breadcrumb`, `Pagination`.

Overlays: `Popover`, `Dialog`, `Sheet`, `DropdownMenu`, `Tooltip`, `CommandPalette`, `Toast` (mount `ToastProvider` once, then call `toast(...)`).

Feedback and data: `Alert`, `Badge`, `Avatar`, `Progress`, `Spinner`, `Skeleton`, `Table`/`DataTable`, `Accordion`, `CodeBlock`.

Before using a compound component (Dialog, Select, Tabs, Sidebar and so on), look up its sub-components and props in `dist/index.d.ts` or `https://xenon.hi-ashwin.xyz/r/<component>.json`.

## Tokens for your own layout CSS

- Surfaces: `--x-bg`, `--x-surface`, `--x-surface-2`. Lines: `--x-border`, `--x-border-active`, `--x-border-width`.
- Text: `--x-text`, `--x-text-muted`. Accent: `--x-accent`, `--x-on-accent`.
- Space: `--x-space-1` … `--x-space-10`. Radius: `--x-radius`, `--x-radius-surface`, `--x-radius-control`.
- Motion: `--x-dur-fast`, `--x-dur-base`, `--x-dur-slow`, `--x-ease-standard`, `--x-ease-spring`.
- Type scale: `--x-text-{display|title1|title2|title3|headline|body|callout|subhead|footnote|caption1|caption2}-{size|lh|weight|tracking}`. Prefer `Heading` and `Text` over hand-rolled type.

## Self-check before you finish

Search your diff for `box-shadow`, `gradient`, `font-weight: 5`, `font-weight: 6`, `#` hex colors, emoji, and icons not wrapped in `Icon`. Fix every hit.
<!-- xenon:end -->
