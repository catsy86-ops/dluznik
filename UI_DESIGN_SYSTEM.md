# 🎨 Design System Reference

## Color Palette

### Primary Colors
- **Primary:** `#6366f1` (Indigo)
- **Primary Light:** `#818cf8`
- **Primary Dark:** `#4f52d9`
- **Primary Glow:** `rgba(99, 102, 241, 0.2)`

### Semantic Colors
- **Success:** `#10b981` (Green)
- **Warning:** `#f59e0b` (Amber)
- **Danger:** `#f43f5e` (Rose)
- **Info:** `#38bdf8` (Cyan)

### Neutral Colors
- **Background:** `#060810` (Dark)
- **Surface:** `#0d1117` (Light dark)
- **Border:** `#1e2535` (Subtle)
- **Text:** `#e2e8f5` (Main)
- **Text Muted:** `#6b7a99` (Dimmed)

### Gradients
```
Primary: linear-gradient(135deg, #6366f1, #8b5cf6)
Success: linear-gradient(135deg, #10b981, #059669)
Danger:  linear-gradient(135deg, #f43f5e, #be123c)
```

---

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

### Font Sizes
| Size  | Usage                      | CSS Class |
|-------|----------------------------|-----------|
| 11px  | Labels, badges, footnotes  | `.text-xs` |
| 12px  | Small text                 | `.text-sm` |
| 13px  | Body text                  | `.text-base` |
| 14px  | Input text                 | `.input` |
| 15px  | Standard body              | `body` |
| 16px  | Emphasis                   | `.text-lg` |
| 18px  | Headings (h3)              | `h3` |
| 24px  | Headings (h2)              | `h2` |
| 28px  | Page titles (h1)           | `h1` |
| 32px  | Major headings             | `.title-xl` |

### Font Weights
- **300:** Light (not commonly used)
- **400:** Regular (body text)
- **500:** Medium (emphasis)
- **600:** Semibold (labels, buttons)
- **700:** Bold (headings)
- **800:** Extrabold (h2, major headings)
- **900:** Black (h1, page titles)

---

## Spacing

### Space Scale
```css
--space-xs:  4px
--space-sm:  8px
--space-md:  12px
--space-lg:  16px
--space-xl:  20px
--space-2xl: 24px
--space-3xl: 32px
--space-4xl: 40px
```

### Common Patterns
- **Card padding:** 20px
- **Form gaps:** 12px
- **Section gaps:** 24px
- **Margin bottom:** 16px
- **Button padding:** 9px 18px

---

## Shadows

### Shadow System
```css
--shadow-xs:   0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-sm:   0 1px 3px rgba(0, 0, 0, 0.1), 
               0 1px 2px rgba(0, 0, 0, 0.06)
--shadow-md:   0 4px 6px rgba(0, 0, 0, 0.1), 
               0 2px 4px rgba(0, 0, 0, 0.06)
--shadow-lg:   0 10px 15px rgba(0, 0, 0, 0.1), 
               0 4px 6px rgba(0, 0, 0, 0.05)
--shadow-xl:   0 20px 25px rgba(0, 0, 0, 0.1), 
               0 10px 10px rgba(0, 0, 0, 0.04)
--shadow-glow: 0 0 40px rgba(99, 102, 241, 0.15)
```

---

## Border Radius

### Radius Scale
- **xs:** 6px (small buttons, tight components)
- **sm:** 10px (inputs, small cards)
- **md:** 14px (cards, modals)
- **lg:** 16px (large cards, featured sections)
- **xl:** 20px (splash screens, hero sections)
- **full:** 999px (pills, badges)

---

## Elevation System

### Layering Strategy
1. **Flat (0):** Background, text
2. **Raised (1):** Cards, buttons at rest
3. **Floating (2):** Hovered cards, active buttons
4. **Overlay (3):** Modals, dropdowns
5. **Topmost (4):** Tooltips, notifications

---

## Button Styles

### Button Types
```tsx
// Primary - Main action
<button className="btn-primary">Save</button>

// Secondary/Ghost - Alternative
<button className="btn-ghost">Cancel</button>

// Success - Positive action
<button className="btn-success">Complete</button>

// Danger - Destructive action
<button className="btn-danger">Delete</button>

// Icon - For icon-only buttons
<button className="btn-icon">🗑️</button>
```

### Button States
- **Default:** Full opacity, scale 1
- **Hover:** Slightly elevated (translateY -2px), enhanced shadow
- **Active:** Pressed (scale 0.97)
- **Disabled:** 45% opacity, cursor not-allowed
- **Focus:** Outline 2px solid primary

---

## Input Components

### Input States
```css
/* Default */
input {
  background: var(--bg3);
  border: 1.5px solid var(--border2);
  border-radius: 10px;
  padding: 11px 14px;
  color: var(--text);
}

/* Focus */
input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
  background: var(--bg4);
}

/* Error */
input.error {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px rgba(244, 63, 94, 0.1);
}

/* Success */
input.success {
  border-color: var(--success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Disabled */
input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Cards

### Card Variants

**Basic Card**
```css
.card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 20px;
}
```

**Interactive Card (Hover)**
```css
.card-interactive:hover {
  border-color: var(--primary);
  transform: translateY(-3px);
  box-shadow: 0 0 0 1px var(--primary-glow), 
              var(--shadow-sm), 
              var(--shadow-glow);
}
```

**Gradient Border Card**
```css
.card-gradient::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 14px;
  padding: 1px;
  background: linear-gradient(135deg, 
    rgba(99,102,241,0.4), 
    rgba(168,85,247,0.2), 
    transparent 60%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, 
                linear-gradient(#fff 0 0);
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
}
```

---

## Badges & Tags

### Badge Styles
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.badge-active {
  background: rgba(99,102,241,0.12);
  color: var(--primary-light);
  border: 1px solid rgba(99,102,241,0.2);
}

.badge-paid {
  background: rgba(16,185,129,0.12);
  color: var(--success-light);
  border: 1px solid rgba(16,185,129,0.2);
}

.badge-overdue {
  background: rgba(244,63,94,0.12);
  color: var(--danger-light);
  border: 1px solid rgba(244,63,94,0.2);
}
```

---

## Icons & Emojis

### Emoji Usage
- 💰 Money/Finance
- 📋 Lists/Documents
- 📊 Charts/Analytics
- 📅 Calendar/Dates
- 🔮 Predictions/Future
- 💡 Ideas/Suggestions
- ⚙️ Settings/Rules
- 🎯 Goals/Targets
- ✅ Success/Complete
- ⚠️ Warning/Alert
- 🗑️ Delete/Remove
- 📱 Mobile/Actions
- 🔐 Security/Privacy
- 🌙 Dark Mode

---

## Animations

### Animation Library
```css
/* Timing functions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

/* Durations */
--duration-fast: 0.15s
--duration-normal: 0.2s
--duration-slow: 0.3s
--duration-slower: 0.5s
```

### Common Animations
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes glow {
  0%, 100% { box-shadow: 0 0 5px var(--primary-glow); }
  50% { box-shadow: 0 0 20px var(--primary-glow); }
}
```

---

## Responsive Breakpoints

### Screen Sizes
```css
/* Mobile First Approach */
/* Base: 320px+ */

/* Small devices */
@media (max-width: 480px) {
  /* Phone optimizations */
}

/* Medium devices */
@media (max-width: 768px) {
  /* Tablet optimizations */
}

/* Large devices */
@media (max-width: 1024px) {
  /* Desktop optimizations */
}

/* Extra large */
@media (max-width: 1440px) {
  /* Large desktop */
}
```

---

## Accessibility Features

### Focus Indicators
```css
button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### Color Contrast
- Normal text: 7:1 (AAA)
- Large text: 4.5:1 (AA)
- UI components: 3:1 (AA)

### Touch Targets
- Minimum: 44x44px
- Recommended: 48x48px
- Spacing: 8px minimum

---

## Loading States

### Skeleton Screen
```css
.skeleton {
  background: linear-gradient(90deg, 
    var(--bg3) 25%, 
    var(--bg4) 50%, 
    var(--bg3) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite ease-in-out;
  border-radius: 10px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Loading Spinner
```css
.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255,255,255,0.15);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Dark/Light Mode

### Theme Variables
```css
/* Light Mode */
[data-theme="light"] {
  --bg: #f0f4ff;
  --bg2: #ffffff;
  --bg3: #f5f7ff;
  --text: #0f172a;
  --text-muted: #64748b;
}

/* Dark Mode (default) */
:root {
  --bg: #060810;
  --bg2: #0d1117;
  --bg3: #161b27;
  --text: #e2e8f5;
  --text-muted: #6b7a99;
}
```

---

## Best Practices

### Do's ✅
- Use consistent spacing (multiples of 4)
- Maintain color contrast ratio
- Use semantic HTML
- Provide focus indicators
- Test on real devices
- Optimize for mobile first
- Use CSS variables
- Create reusable components

### Don'ts ❌
- Don't use color alone to convey meaning
- Don't forget disabled states
- Don't make touch targets too small
- Don't use too many different fonts
- Don't add animations everywhere
- Don't forget loading states
- Don't hardcode colors
- Don't over-complicate designs

---

## Component Checklist

- [ ] Responsive design (works on 320px - 1440px)
- [ ] Dark/light mode compatible
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Disabled states
- [ ] Focus indicators for keyboard navigation
- [ ] Touch targets 44x44px minimum
- [ ] Animations below 300ms
- [ ] ARIA labels where needed
- [ ] Sufficient color contrast
- [ ] No auto-playing media
- [ ] Tested with screen reader
- [ ] Works without JavaScript (graceful degradation)
- [ ] Performance tested (< 100ms interactions)

---

## Resources

- **Fonts:** [Google Fonts](https://fonts.google.com) - Inter
- **Colors:** [Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)
- **Animations:** [Animate.css](https://animate.style)
- **Icons:** Mix of Emojis + Custom SVGs
- **Accessibility:** [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**This design system ensures consistency, accessibility, and professional quality across your entire application!** 🎨✨
