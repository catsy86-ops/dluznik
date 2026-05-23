# 🧪 UI/UX Testing Instructions

Complete guide to testing all the UI/UX enhancements on different devices and browsers.

---

## 🚀 Quick Start

1. **Ensure PostgreSQL is running**:
   ```bash
   docker ps | grep postgres-dluznik
   # If not running:
   docker start postgres-dluznik
   ```

2. **Start backend** (Terminal 1):
   ```bash
   npm run dev
   # Should output: "Server is running on port 3000"
   ```

3. **Start frontend** (Terminal 2):
   ```bash
   cd client
   npm run dev
   # Should output: "Local: http://localhost:5174"
   ```

4. **Open browser**:
   - Desktop: `http://localhost:5174`
   - Mobile: `http://<your-computer-ip>:5174`

---

## 💻 Desktop Testing

### Chrome / Edge / Firefox / Safari

#### 1. Animated Loan Cards ✅
- [ ] Navigate to "Pożyczki" (Loans) page
- [ ] Hover over any loan card
- [ ] Verify:
  - Card lifts up smoothly
  - Shadow appears under card
  - Border becomes primary color
  - Status indicator bar (left side) is visible
  - Transition is smooth (no stuttering)

#### 2. Button Interactions ✅
- [ ] Click various buttons ("+ Nowa", "Spłata", "Edytuj", etc.)
- [ ] Verify:
  - Button scales down on click (press effect)
  - Button lifts on hover (before click)
  - No lag in animation
  - Hover shadow is visible on primary buttons

#### 3. Input Focus States ✅
- [ ] Click on any input field
- [ ] Verify:
  - Blue glow ring appears (4px)
  - Input background changes slightly
  - Border becomes primary color
  - Cursor visible inside
  - Transition is smooth

- [ ] Try typing in an input
- [ ] Verify: Text appears correctly, no lag

- [ ] Tab through multiple inputs
- [ ] Verify: Focus moves smoothly, rings visible

#### 4. Page Header ✅
- [ ] Open Loans page
- [ ] Verify header looks like:
  ```
  📋 Moje Pożyczki
  X aktywnych · $AMOUNT łącznie
  [+ Nowa] button
  ```
- [ ] Verify:
  - Emoji is visible
  - Text is bold (fontWeight: 900)
  - Subtitle shows active count and total
  - Amount animates when page loads
  - Button is properly positioned

#### 5. Empty State ✅
- [ ] Delete all loans (or create new account)
- [ ] Verify empty state shows:
  - Large emoji (💸)
  - "Brak pożyczek" title
  - Description text
  - "+ Dodaj pożyczkę" button

#### 6. Loading Skeletons ✅
- [ ] Open Network tab in DevTools
- [ ] Throttle to slow connection (2G or Slow 3G)
- [ ] Refresh page
- [ ] Verify:
  - Skeleton placeholders appear
  - Shimmer animation runs smoothly
  - Content loads and replaces skeleton
  - No layout shift

#### 7. Dark/Light Mode ✅
- [ ] Toggle theme (ThemeToggle button)
- [ ] Verify in DARK mode:
  - Cards are dark but visible
  - Text has good contrast
  - Animations still smooth
  - Colors are vibrant enough

- [ ] Verify in LIGHT mode:
  - Background is light
  - Cards are white
  - Text is dark and readable
  - All buttons visible
  - Shadows visible but subtle

#### 8. Performance ✅
- [ ] Open DevTools > Performance tab
- [ ] Start recording
- [ ] Hover over several loan cards
- [ ] Stop recording
- [ ] Verify:
  - FPS stays at or above 50 (ideally 60)
  - No red bars in Performance timeline
  - Animations complete in < 300ms

---

## 📱 Mobile Testing

### iOS Safari (recommended)

#### Setup
1. Get computer IP: Open Terminal/CMD
   ```bash
   # macOS
   ifconfig | grep "inet "
   
   # Windows
   ipconfig | find "IPv4"
   ```

2. On iPhone/iPad:
   - Connect to same WiFi as computer
   - Open Safari
   - Go to: `http://<computer-ip>:5174`

#### Tests

##### 1. Touch Targets ✅
- [ ] Tap any button
- [ ] Verify:
  - Tappable area is large (44x44 minimum)
  - No need to zoom to tap
  - Feels responsive (no delay)

- [ ] Tap any input
- [ ] Verify:
  - Input expands slightly (scale: 1.01)
  - Keyboard appears
  - No zoom to 200%

##### 2. Loan Cards on Mobile ✅
- [ ] Scroll through loans
- [ ] Verify:
  - Cards fit screen width
  - No horizontal scroll needed
  - Status bar visible on left
  - Text doesn't overflow
  - Touch feels responsive

- [ ] Tap on a card
- [ ] Verify:
  - Card responds to tap
  - Modal/detail opens smoothly
  - No layout shift

##### 3. Page Header Mobile ✅
- [ ] Open Loans page on small screen
- [ ] Verify:
  - Title and description stack vertically
  - Button is full-width or appropriately sized
  - No text overflow
  - Emoji is visible

##### 4. Modal on Mobile ✅
- [ ] Create a new loan
- [ ] Verify modal:
  - Appears with bottom border-radius (16px 16px 0 0)
  - Takes up ~90% of screen height
  - Keyboard doesn't cover form
  - Form inputs are 44px tall
  - Submit button is large and tappable

##### 5. Swipe Interactions ✅
- [ ] Swipe left on a loan card (if implemented)
- [ ] Verify:
  - Card slides smoothly
  - Delete button appears
  - No scroll interference
  - Responsive to finger

##### 6. Pull to Refresh ✅
- [ ] Scroll to top of loans
- [ ] Pull down on the list
- [ ] Verify:
  - Pull indicator appears
  - "↓ Pociągnij aby odświeżyć" text shows
  - When pulled far enough: "↑ Puść aby odświeżyć"
  - Release triggers refresh
  - Spinner appears during load

##### 7. Text Size ✅
- [ ] All text should be readable
- [ ] Verify input font-size is 16px (prevents iOS zoom)
- [ ] Verify no text is cut off

##### 8. Colors ✅
- [ ] Check in bright sunlight
- [ ] Verify all text readable
- [ ] Colors don't cause eye strain
- [ ] Status indicators clear

##### 9. Landscape Orientation ✅
- [ ] Rotate device to landscape
- [ ] Verify:
  - Layout adjusts properly
  - No content hidden
  - Buttons still accessible
  - Page header responsive

### Android Chrome

Repeat same tests as iOS but on Android device.

Additional check:
- [ ] Verify no "pinch to zoom" issues
- [ ] Check that scrolling is smooth

---

## 🔍 Browser DevTools Testing

### Chrome DevTools

#### Device Emulation
```
1. Press F12 to open DevTools
2. Click device toggle icon (or Ctrl+Shift+M)
3. Select different devices: iPhone 12, iPad, etc.
4. Test each UI enhancement
```

#### Performance Analysis
```
1. Go to Performance tab
2. Click record button
3. Interact with UI (hover cards, click buttons, etc.)
4. Stop recording
5. Analyze:
   - Look for frame drops (should be solid 60 FPS)
   - Check CPU usage (should not spike to 100%)
   - Verify animation timings (smooth curves, not blocky)
```

#### Accessibility Analysis
```
1. Go to Lighthouse tab
2. Run audit for: Accessibility
3. Check score (target: 90+)
4. Address any flagged issues:
   - Contrast warnings
   - Missing ARIA labels
   - Form label issues
```

#### Responsive Design
```
1. Toggle device toolbar (Ctrl+Shift+M)
2. Select "Responsive" mode
3. Manually resize browser width:
   - 1920px (desktop)
   - 768px (tablet)
   - 375px (mobile)
   - 320px (small mobile)
4. Verify layout at each breakpoint
```

### Firefox DevTools

Similar steps as Chrome:
1. Press F12
2. Use responsive design mode (Ctrl+Shift+M)
3. Test at different viewport sizes

---

## 🎨 Visual Testing Checklist

### Color & Contrast
- [ ] Primary color (#6366f1) visible in dark mode
- [ ] Primary color readable in light mode
- [ ] Success color (#10b981) accessible
- [ ] Danger color (#f43f5e) accessible
- [ ] All text passes WCAG AA contrast ratio

### Typography
- [ ] Headings are bold and prominent
- [ ] Body text is readable
- [ ] Labels are uppercase and muted
- [ ] Font sizes scale correctly on mobile

### Spacing & Layout
- [ ] Cards have consistent padding
- [ ] Buttons have consistent spacing
- [ ] Form inputs aligned properly
- [ ] No unexpected margins/padding
- [ ] Mobile padding is comfortable (16px minimum)

### Animations & Transitions
- [ ] All transitions smooth (0.2-0.3s)
- [ ] No stuttering or jank
- [ ] Hover effects visible but not distracting
- [ ] Loading animations are smooth
- [ ] No missing animation keys (easing curves)

---

## 🐛 Common Issues & Fixes

### Issue: Buttons feel unresponsive
**Check**: 
- Verify `transition: all 0.2s` is in CSS
- Check for conflicting CSS transforms
- Test in different browser

### Issue: Loan cards don't animate
**Check**:
- Ensure `.loan-card` class is applied
- Check that hover CSS exists
- Verify card is not `position: fixed`
- Clear browser cache (Ctrl+Shift+Delete)

### Issue: Mobile inputs zoom to 200%
**Check**:
- Verify `font-size: 16px` on inputs
- Check `width: 100%` is not breaking layout
- Ensure viewport meta tag exists in HTML

### Issue: Animations lag on mobile
**Check**:
- Reduce animation complexity
- Test on actual device (emulation isn't always accurate)
- Check CPU usage in DevTools
- Disable other browser extensions

### Issue: Focus ring not visible
**Check**:
- Ensure `:focus-visible` styles exist
- Check `outline: none` isn't removing all feedback
- Verify color contrast of ring
- Test keyboard navigation (Tab key)

---

## ✅ Final QA Checklist

Before considering UI/UX complete:

- [ ] Desktop Chrome: All 8 sections pass
- [ ] Desktop Firefox: All 8 sections pass  
- [ ] Desktop Safari: All 8 sections pass
- [ ] iOS Safari: All 9 sections pass
- [ ] Android Chrome: All 9 sections pass
- [ ] DevTools Performance: 60 FPS achieved
- [ ] DevTools Lighthouse Accessibility: 90+ score
- [ ] Responsive: Works at 320px, 768px, 1920px
- [ ] Dark mode: All features visible
- [ ] Light mode: All features visible
- [ ] No console errors
- [ ] No performance warnings

---

## 📊 Performance Targets

| Metric | Target | How to Check |
|--------|--------|-------------|
| FPS | 60 | DevTools > Performance |
| Animation Duration | 200-400ms | Manual testing |
| First Paint | < 1s | DevTools > Lighthouse |
| Interactive | < 2s | DevTools > Lighthouse |
| Lighthouse Score | 90+ | DevTools > Lighthouse |
| Accessibility | 90+ | DevTools > Lighthouse |

---

## 🔄 Regression Testing

After making future changes, test:

1. Did loan cards still animate?
2. Are buttons still responsive?
3. Are inputs still focusable?
4. Does mobile layout work?
5. Are animations still smooth?

Run these quick tests to catch breaking changes early.

---

## 📸 Screenshots for Documentation

Consider taking before/after screenshots:

1. **Desktop hover effect** - Loan card with shadow
2. **Mobile button tap** - Button scaled down
3. **Focus ring** - Input with blue glow
4. **Empty state** - Full screen emoji and text
5. **Dark mode** - Full page in dark mode
6. **Light mode** - Full page in light mode
7. **Mobile layout** - Page on 375px screen
8. **Loading skeleton** - Shimmer animation

---

## 🎓 Resources

- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Mobile Web Best Practices](https://web.dev/mobile-web-specialist/)
- [CSS Transitions & Animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Transitions)
- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)

---

**Happy Testing!** 🚀 Report any issues in the project issues tab.
