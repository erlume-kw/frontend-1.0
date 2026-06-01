# Erlume Design System

Erlume is an online consignment store for vintage and luxury secondhand goods.
This document is the single source of truth for any frontend developer building new screens or components.
All values here take precedence over individual judgment — check here first, then the Figma file.

---

## 1. Color Palette

| Token               | Hex       | Usage                                               |
|---------------------|-----------|-----------------------------------------------------|
| `brand-primary`     | `#18230F` | Primary actions, headers, key UI elements, nav bg   |
| `brand-secondary`   | `#C5705D` | CTAs, highlights, accent elements, hover states     |
| `bg-light`          | `#DFD3C3` | Page backgrounds, card backgrounds, light surfaces  |
| `white`             | `#FFFFFF` | Content surfaces, input backgrounds, overlays       |
| `black`             | `#000000` | Rarely used; prefer brand-primary for dark contexts |
| `text-primary`      | `#18230F` | Main body text on light backgrounds                 |
| `text-secondary`    | `#C5705D` | Labels, tags, secondary text with brand accent      |
| `text-muted`        | `#7A7060` | Placeholder text, disabled states, meta text        |
| `border`            | `#C9BFAD` | Dividers, input borders, card outlines              |
| `error`             | `#B94040` | Validation errors, destructive actions              |
| `success`           | `#2E5D2E` | Confirmation states                                 |

> **Note:** Additional semantic colors (e.g. sold-out overlays, badge colors) will be added as screens are implemented.

---

## 2. Typography

### Typefaces

| Role                      | Font Family     | Import Method              |
|---------------------------|-----------------|----------------------------|
| Headings & Subheadings    | Clash Display   | Google Fonts / expo-font   |
| Body, UI, labels, inputs  | DM Sans         | Google Fonts / expo-font   |

### Type Scale

All sizes are defined as `[mobile size, desktop size]`.

#### Clash Display (Headings)

| Token        | Mobile  | Desktop | Weight         | Usage                           |
|--------------|---------|---------|----------------|---------------------------------|
| `display`    | 36px    | 56px    | 600 (SemiBold) | Hero sections, landing headline |
| `h1`         | 28px    | 40px    | 600 (SemiBold) | Page titles                     |
| `h2`         | 22px    | 32px    | 500 (Medium)   | Section headers                 |
| `h3`         | 18px    | 24px    | 500 (Medium)   | Card titles, subsections        |
| `h4`         | 16px    | 20px    | 500 (Medium)   | Minor headings, labels          |
| `subheading` | 14px    | 16px    | 500 (Medium)   | Subheadings, category labels    |

#### DM Sans (Body)

| Token          | Mobile  | Desktop | Weight         | Usage                          |
|----------------|---------|---------|----------------|--------------------------------|
| `body-lg`      | 16px    | 18px    | 400 (Regular)  | Lead paragraphs, descriptions  |
| `body`         | 14px    | 16px    | 400 (Regular)  | Standard body copy             |
| `body-sm`      | 12px    | 14px    | 400 (Regular)  | Secondary text, metadata       |
| `label`        | 12px    | 14px    | 500 (Medium)   | Form labels, input labels      |
| `caption`      | 10px    | 12px    | 400 (Regular)  | Timestamps, fine print         |
| `button`       | 14px    | 16px    | 500 (Medium)   | Button text, CTA copy          |
| `price`        | 16px    | 20px    | 600 (SemiBold) | Product pricing (DM Sans)      |
| `price-sm`     | 13px    | 15px    | 500 (Medium)   | Secondary pricing, struck-out  |

### Line Heights

| Token   | Value | Usage                  |
|---------|-------|------------------------|
| `tight` | 1.1   | Large display headings |
| `snug`  | 1.25  | Headings               |
| `normal`| 1.5   | Body copy              |
| `loose` | 1.75  | Long-form text         |

### Letter Spacing

| Token     | Value    | Usage                    |
|-----------|----------|--------------------------|
| `tight`   | -0.02em  | Display/H1               |
| `normal`  | 0em      | Body text                |
| `wide`    | 0.04em   | Subheadings, labels      |
| `widest`  | 0.1em    | Caps/tags/badges         |

---

## 3. Spacing System

Base unit: **8px (mobile)** / **16px (desktop)**

| Token  | Mobile | Desktop | Usage                               |
|--------|--------|---------|-------------------------------------|
| `xs`   | 4px    | 8px     | Inline gaps, icon padding           |
| `sm`   | 8px    | 12px    | Tight inner padding                 |
| `md`   | 12px   | 16px    | Default padding, list item gaps     |
| `lg`   | 16px   | 24px    | Section padding, card padding       |
| `xl`   | 24px   | 32px    | Section separation                  |
| `2xl`  | 32px   | 48px    | Large section gaps                  |
| `3xl`  | 48px   | 64px    | Page-level vertical rhythm          |
| `4xl`  | 64px   | 96px    | Hero spacing                        |

### Screen Padding (Horizontal Page Margins)

| Screen Width       | Horizontal Padding |
|--------------------|--------------------|
| Mobile (< 768px)   | 16px               |
| Tablet (768–1024px)| 32px               |
| Desktop (> 1024px) | 64px               |

### Grid

| Platform | Columns | Gutter | Margin |
|----------|---------|--------|--------|
| Mobile   | 4       | 8px    | 16px   |
| Desktop  | 12      | 16px   | 64px   |

---

## 4. Border Radius

**Erlume uses zero border radius across all UI elements.**

| Token     | Value | Usage                      |
|-----------|-------|----------------------------|
| `none`    | 0px   | Buttons, cards, inputs, modals, badges, tags — everything |

> No rounded corners anywhere. This is a deliberate brand decision that reflects the sharp, editorial aesthetic of the store.

---

## 5. Borders & Dividers

| Token           | Value                    | Usage                          |
|-----------------|--------------------------|--------------------------------|
| `border-default`| 1px solid `#C9BFAD`      | Cards, inputs, dividers        |
| `border-strong` | 1px solid `#18230F`      | Active inputs, selected states |
| `border-none`   | none                     | Borderless elements            |

---

## 6. Elevation / Shadows

| Token       | Value                              | Usage                    |
|-------------|------------------------------------|--------------------------|
| `shadow-sm` | `0 1px 4px rgba(0,0,0,0.08)`       | Cards at rest            |
| `shadow-md` | `0 4px 12px rgba(0,0,0,0.10)`      | Dropdowns, popovers      |
| `shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)`      | Modals, bottom sheets    |

---

## 7. Components

### Buttons

All buttons: `border-radius: 0`, `font: DM Sans Medium (button token)`, `text-transform: uppercase` with `letter-spacing: widest`.

| Variant    | Background     | Text       | Border                       | Padding (mobile)  | Padding (desktop) |
|------------|----------------|------------|------------------------------|-------------------|-------------------|
| `primary`  | `#18230F`      | `#FFFFFF`  | none                         | 12px 24px         | 14px 32px         |
| `secondary`| `#C5705D`      | `#FFFFFF`  | none                         | 12px 24px         | 14px 32px         |
| `outline`  | transparent    | `#18230F`  | 1px solid `#18230F`          | 12px 24px         | 14px 32px         |
| `ghost`    | transparent    | `#18230F`  | none                         | 12px 24px         | 14px 32px         |
| `disabled` | `#C9BFAD`      | `#7A7060`  | none                         | 12px 24px         | 14px 32px         |

Button heights:
- Mobile: 44px (min-height for touch targets)
- Desktop: 48px

### Inputs / Text Fields

- Background: `#FFFFFF`
- Border: 1px solid `#C9BFAD`
- Active border: 1px solid `#18230F`
- Error border: 1px solid `#B94040`
- Border radius: 0
- Padding: 12px 16px (mobile), 14px 16px (desktop)
- Font: DM Sans Regular, `body` size
- Placeholder color: `#7A7060`
- Label: DM Sans Medium, `label` size, `#18230F`

### Cards (Product Cards)

- Background: `#DFD3C3` or `#FFFFFF` depending on context
- Border: 1px solid `#C9BFAD` or none (image-led cards)
- Border radius: 0
- Shadow: `shadow-sm` or none (flat)
- Padding: `lg` token
- Image aspect ratio: 3:4 (portrait, standard for apparel)

### Tags / Badges

- Background: `#18230F`
- Text: `#FFFFFF`
- Font: DM Sans Medium, `caption` size, `letter-spacing: widest`, uppercase
- Border radius: 0
- Padding: 4px 8px (mobile), 4px 10px (desktop)

Variants: `sold-out` (`#7A7060` bg), `new` (`#C5705D` bg), `sale` (`#B94040` bg)

### Navigation Bar

- Background: `#18230F`
- Text/icons: `#DFD3C3`
- Active icon/text: `#C5705D`
- Font: DM Sans Medium, `caption` size

### Bottom Tab Bar (Mobile)

- Background: `#18230F`
- Height: 64px (including safe area)
- Icon size: 24px
- Active indicator: `#C5705D` underline or tint

---

## 8. Iconography

- Style: line icons (not filled), consistent 2px stroke weight
- Size: 20px (small), 24px (default), 32px (large)
- Color: inherits from context; default `#18230F`, on dark bg `#DFD3C3`

---

## 9. Imagery

- Product images: portrait (3:4 ratio), no border radius, no shadow
- Cover/hero images: full-bleed, no border radius
- Image overlay text: always on a semi-transparent `#18230F` scrim
- No image filters or tints applied in code — editorial integrity is maintained

---

## 10. Breakpoints

| Name      | Min Width | Usage                             |
|-----------|-----------|-----------------------------------|
| `mobile`  | 0px       | Default (mobile-first)            |
| `tablet`  | 768px     | Tablet layouts                    |
| `desktop` | 1024px    | Desktop layouts                   |
| `wide`    | 1280px    | Max-width container clamp         |

Max content width: **1280px**, centered.

---

## 11. Animation & Transitions

| Token           | Duration | Easing          | Usage                          |
|-----------------|----------|-----------------|--------------------------------|
| `transition-fast`| 150ms   | ease-out        | Hover states, icon swaps       |
| `transition-base`| 250ms   | ease-in-out     | Button press, input focus      |
| `transition-slow`| 400ms   | ease-in-out     | Page transitions, modals       |

---

## 12. Accessibility

- All text must meet WCAG AA contrast (4.5:1 body, 3:1 large text)
- `#18230F` on `#DFD3C3` = high contrast ✓
- `#FFFFFF` on `#18230F` = high contrast ✓
- `#FFFFFF` on `#C5705D` = verify at implementation
- Touch targets: minimum 44×44px on mobile
- Focus states: 2px solid `#C5705D` outline

---

## 13. Implementation Notes (React Native / NativeWind)

- Use `tailwind.config.js` custom tokens (see file) for all colors, spacing, and typography
- Fonts must be loaded via `expo-font` with the exact family names:
  - `ClashDisplay-Medium`, `ClashDisplay-SemiBold`
  - `DMSans-Regular`, `DMSans-Medium`, `DMSans-SemiBold`
- All spacing values in RN are unitless numbers (device-independent pixels), matching the px values above
- For responsive sizing use the `useWindowDimensions` hook or `Platform.OS`
- Screen padding should be applied via a `<ScreenWrapper>` component (to be created)
- NativeWind class naming follows the custom token names defined in `tailwind.config.js`

---

## 14. Screen Inventory

Screens implemented so far and the Figma source used:

| Screen           | Status      | Mobile | Desktop | Figma node(s)                                               |
|------------------|-------------|--------|---------|-------------------------------------------------------------|
| Login            | ✅ Done     | ✅     | ✅      | Designed from brand language (no Figma frame)               |
| Home (Anticipation) | ✅ Done  | ✅     | ✅      | Mobile: 249:1774 · Desktop: 194:950                         |
| All Drops        | ✅ Done     | ✅     | ✅      | Mobile: 249:1942 · Desktop: 180:828                         |
| Drop Detail      | ✅ Done     | ✅     | ✅      | Mobile: 252:2091 · Desktop: 186:699                         |
| Product Detail   | ✅ Done     | ✅     | ✅      | Mobile: 253:2176 · Desktop: 205:646                         |
| Cart             | ✅ Done     | ✅     | ✅      | Mobile: 253:2289 · Desktop: 226:797                         |
| Checkout         | ✅ Done     | ✅     | ✅      | Mobile: 268:6336 · Desktop: 267:4391                        |
| Sell             | ✅ Done     | ✅     | ✅      | Mobile: 258:3591 · Desktop: 258:4105                        |

---

*Last updated: 2026-05-31. Update this document when adding new screens or discovering design inconsistencies.*
