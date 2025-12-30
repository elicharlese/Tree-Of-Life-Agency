# 13 - Implementation Checklist

> Actionable checklist for redesigning AGENT to comply with Apple Human Interface Guidelines.

## Overview

This checklist provides a systematic approach to auditing and updating AGENT's UI to align with Apple HIG. Work through each section, marking items as complete.

## Phase 1: Foundation Audit

### Color System

- [ ] **Audit current colors** - Document all colors currently in use
- [ ] **Map to semantic colors** - Replace hardcoded values with semantic tokens
- [ ] **Implement dark mode** - Ensure all colors adapt properly
- [ ] **Verify contrast ratios** - Test all text/background combinations (4.5:1 minimum)
- [ ] **Add system colors** - Implement Apple's semantic color palette
- [ ] **Test color blindness** - Verify UI is usable without color alone

### Typography

- [ ] **Implement SF Pro** - Use system font stack with SF Pro fallbacks
- [ ] **Define type scale** - Implement Apple's standard text styles
- [ ] **Apply text styles** - Replace arbitrary font sizes with semantic styles
- [ ] **Support Dynamic Type** - Ensure text scales with user preferences
- [ ] **Verify line heights** - Match Apple's recommended line heights
- [ ] **Check letter spacing** - Apply appropriate tracking values

### Spacing

- [ ] **Adopt 8pt grid** - Align all spacing to 8pt increments
- [ ] **Define spacing tokens** - Create consistent spacing scale
- [ ] **Update component spacing** - Apply tokens to all components
- [ ] **Implement safe areas** - Support notch and home indicator
- [ ] **Verify touch targets** - Ensure 44×44pt minimum
- [ ] **Test responsive margins** - Verify margins adapt to screen size

## Phase 2: Navigation

### Navigation Bar

- [ ] **Standard height** - 44pt (96pt with large title)
- [ ] **Back button** - Chevron + previous title
- [ ] **Title centering** - Properly centered with actions
- [ ] **Large title support** - Collapsing large title on scroll
- [ ] **Blur background** - Translucent material effect
- [ ] **Border separator** - Subtle bottom border

### Tab Bar

- [ ] **Standard height** - 49pt + safe area
- [ ] **Maximum 5 tabs** - Consolidate if more
- [ ] **Icon + label** - Both for each tab
- [ ] **Active state** - Filled icon, primary color
- [ ] **Badge support** - Notification badges
- [ ] **Always visible** - Except in modals

### Sidebar (Desktop)

- [ ] **Standard width** - 280pt
- [ ] **Section headers** - Uppercase, secondary color
- [ ] **Item states** - Hover, selected, active
- [ ] **Collapsible** - Support for compact mode
- [ ] **Search integration** - Search bar at top
- [ ] **Keyboard navigation** - Arrow keys, shortcuts

### Search

- [ ] **Search bar design** - Rounded, gray background
- [ ] **Placeholder text** - "Search" with icon
- [ ] **Cancel button** - Appears on focus
- [ ] **Clear button** - X icon when has content
- [ ] **Recent searches** - Show history
- [ ] **Suggestions** - Real-time suggestions

## Phase 3: Components

### Buttons

- [ ] **Implement variants** - Filled, tinted, gray, plain
- [ ] **Define sizes** - Large (50pt), regular (44pt), small (32pt)
- [ ] **Touch targets** - Minimum 44×44pt
- [ ] **Loading state** - Spinner replacement
- [ ] **Disabled state** - 50% opacity
- [ ] **Press animation** - Scale to 98%

### Forms

- [ ] **Text fields** - 44pt height, rounded corners
- [ ] **Labels** - Above or inline
- [ ] **Placeholder text** - Quaternary color
- [ ] **Error states** - Red border, error message
- [ ] **Helper text** - Below field, footnote size
- [ ] **Focus ring** - Primary color ring

### Toggles & Controls

- [ ] **Switch size** - 51×31pt
- [ ] **Switch animation** - 200ms spring
- [ ] **Slider track** - 4pt height
- [ ] **Slider thumb** - 27pt diameter
- [ ] **Segmented control** - Rounded background
- [ ] **Stepper buttons** - 44pt touch targets

### Cards

- [ ] **Border radius** - 12-16pt
- [ ] **Shadow levels** - Elevation hierarchy
- [ ] **Padding** - 16pt standard
- [ ] **Header/footer** - Separator lines
- [ ] **Hover state** - Subtle elevation change
- [ ] **Dark mode** - Elevated backgrounds

### Lists

- [ ] **Row heights** - 44pt minimum
- [ ] **Inset grouping** - Rounded corners
- [ ] **Section headers** - Uppercase, secondary
- [ ] **Chevron indicator** - For navigation rows
- [ ] **Swipe actions** - Delete, archive, etc.
- [ ] **Selection state** - Checkmark or highlight

## Phase 4: Overlays

### Sheets

- [ ] **Handle indicator** - 36×5pt, centered
- [ ] **Size variants** - Small, medium, large, full
- [ ] **Slide animation** - 300ms ease-out
- [ ] **Backdrop** - Black 40% opacity
- [ ] **Safe area padding** - Bottom safe area
- [ ] **Dismiss gesture** - Swipe down

### Alerts

- [ ] **Max width** - 270pt
- [ ] **Title** - Headline, centered
- [ ] **Message** - Footnote, centered
- [ ] **Button layout** - Side by side or stacked
- [ ] **Destructive style** - Red text
- [ ] **Cancel style** - Bold text

### Popovers

- [ ] **Arrow indicator** - Points to trigger
- [ ] **Position logic** - Avoid screen edges
- [ ] **Blur background** - Material effect
- [ ] **Shadow** - Elevated appearance
- [ ] **Dismiss on outside tap** - Click away to close
- [ ] **Animation** - Fade + scale

### Action Sheets

- [ ] **Bottom position** - Slide up from bottom
- [ ] **Cancel button** - Separate, bold
- [ ] **Destructive actions** - Red text
- [ ] **Title/message** - Optional header
- [ ] **Safe area** - Bottom padding
- [ ] **Backdrop dismiss** - Tap outside to close

## Phase 5: Feedback

### Loading States

- [ ] **Spinner component** - Animated SVG
- [ ] **Progress bar** - Determinate progress
- [ ] **Skeleton screens** - Content placeholders
- [ ] **Pull to refresh** - Native-feeling refresh
- [ ] **Loading messages** - Contextual text
- [ ] **Timeout handling** - Error after delay

### Error States

- [ ] **Inline errors** - Field-level validation
- [ ] **Error banners** - Page-level errors
- [ ] **Full screen errors** - Critical failures
- [ ] **Retry actions** - Clear recovery path
- [ ] **Error messages** - Human-readable text
- [ ] **Error icons** - Consistent iconography

### Empty States

- [ ] **Illustration/icon** - Visual indicator
- [ ] **Title** - Clear heading
- [ ] **Description** - Helpful guidance
- [ ] **Action button** - Primary action
- [ ] **Consistent styling** - Match app design
- [ ] **Contextual content** - Relevant to section

### Notifications

- [ ] **Toast component** - Non-blocking alerts
- [ ] **Position** - Top right (desktop)
- [ ] **Auto dismiss** - 4 second default
- [ ] **Manual dismiss** - X button
- [ ] **Type variants** - Success, error, warning, info
- [ ] **Stacking** - Multiple toasts

## Phase 6: Motion

### Transitions

- [ ] **Page transitions** - Slide or fade
- [ ] **Modal transitions** - Scale + fade
- [ ] **List animations** - Staggered entrance
- [ ] **State changes** - Smooth interpolation
- [ ] **Duration limits** - Under 400ms
- [ ] **Easing functions** - Appropriate curves

### Micro-interactions

- [ ] **Button press** - Scale feedback
- [ ] **Hover effects** - Subtle highlights
- [ ] **Focus indicators** - Ring animation
- [ ] **Toggle animation** - Spring physics
- [ ] **Loading spinners** - Smooth rotation
- [ ] **Success feedback** - Checkmark animation

### Reduced Motion

- [ ] **Media query** - Detect preference
- [ ] **Disable animations** - Instant transitions
- [ ] **Maintain function** - UI still works
- [ ] **Test thoroughly** - Verify all states

## Phase 7: Accessibility

### Screen Readers

- [ ] **Semantic HTML** - Proper elements
- [ ] **ARIA labels** - All interactive elements
- [ ] **Live regions** - Dynamic content
- [ ] **Focus management** - Modal trapping
- [ ] **Skip links** - Bypass navigation
- [ ] **Heading hierarchy** - Logical structure

### Keyboard Navigation

- [ ] **Tab order** - Logical sequence
- [ ] **Focus indicators** - Visible rings
- [ ] **Keyboard shortcuts** - Common actions
- [ ] **Escape to close** - Modals, menus
- [ ] **Arrow navigation** - Lists, menus
- [ ] **Enter to activate** - Buttons, links

### Visual Accessibility

- [ ] **Color contrast** - WCAG AA minimum
- [ ] **Text scaling** - Support 200% zoom
- [ ] **High contrast** - Support mode
- [ ] **Focus visible** - Clear indicators
- [ ] **Error identification** - Not color alone
- [ ] **Link distinction** - Underline or icon

## Phase 8: Testing

### Device Testing

- [ ] **iPhone SE** - Smallest screen
- [ ] **iPhone 14** - Standard size
- [ ] **iPhone 14 Pro Max** - Largest phone
- [ ] **iPad** - Tablet layout
- [ ] **Desktop** - Wide screens
- [ ] **Safari** - Primary browser

### Accessibility Testing

- [ ] **VoiceOver** - iOS/macOS
- [ ] **Keyboard only** - No mouse
- [ ] **High contrast** - System setting
- [ ] **Reduced motion** - System setting
- [ ] **Large text** - Dynamic Type
- [ ] **Automated audit** - axe, Lighthouse

### Performance Testing

- [ ] **Animation FPS** - 60fps target
- [ ] **Load time** - Under 3 seconds
- [ ] **Interaction delay** - Under 100ms
- [ ] **Bundle size** - Minimize JS/CSS
- [ ] **Image optimization** - Proper formats
- [ ] **Lazy loading** - Defer non-critical

## Implementation Priority

### High Priority (Week 1-2)

1. Color system with dark mode
2. Typography scale
3. Spacing tokens
4. Button components
5. Navigation bar
6. Basic accessibility

### Medium Priority (Week 3-4)

1. Tab bar / Sidebar
2. Form components
3. Cards and lists
4. Loading states
5. Error states
6. Keyboard navigation

### Lower Priority (Week 5-6)

1. Sheets and modals
2. Alerts and popovers
3. Motion and animation
4. Empty states
5. Advanced accessibility
6. Performance optimization

## Resources

### Design Files

- [Apple Design Resources](https://developer.apple.com/design/resources/)
- [SF Symbols App](https://developer.apple.com/sf-symbols/)
- [SF Pro Fonts](https://developer.apple.com/fonts/)

### Documentation

- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Accessibility Guidelines](https://developer.apple.com/accessibility/)
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools

- Xcode Accessibility Inspector
- Figma iOS UI Kit
- Color Contrast Analyzer
- axe DevTools

---

## Progress Tracking

| Phase | Status | Completion |
|-------|--------|------------|
| Foundation Audit | Not Started | 0% |
| Navigation | Not Started | 0% |
| Components | Not Started | 0% |
| Overlays | Not Started | 0% |
| Feedback | Not Started | 0% |
| Motion | Not Started | 0% |
| Accessibility | Not Started | 0% |
| Testing | Not Started | 0% |

**Overall Progress: 0%**

---

*Last Updated: November 2024*
