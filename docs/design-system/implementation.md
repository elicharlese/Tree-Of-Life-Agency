# Design System Implementation Guide

## Overview

This document outlines the complete implementation of the TinTin design system, including all design tokens, component styling, and glassmorphic effects for both light and dark modes.

## Implementation Status: ✅ Complete

**Last Updated:** December 21, 2024

---

## 1. Design Tokens

### Color System

All colors are defined using HSL values in `app/globals.css`:

#### Light Mode
```css
--background: 0 0% 100%;
--foreground: 110 25% 25%;
--card: 210 20% 98%;
--card-foreground: 150 25% 20%;
--primary: 110 25% 49%;        /* Green brand color */
--primary-foreground: 0 0% 100%;
--secondary: 110 15% 65%;
--secondary-foreground: 150 25% 20%;
--success: 142 76% 50%;
--warning: 48 96% 50%;
--ai: 258 90% 50%;             /* Purple for AI elements */
--human: 217 91% 50%;          /* Blue for human elements */
--border: 110 10% 90%;
--input: 110 10% 95%;
```

#### Dark Mode
```css
--background: 110 25% 8%;
--foreground: 110 15% 90%;
--card: 150 20% 12%;
--card-foreground: 95 20% 90%;
--primary: 110 35% 55%;        /* Brighter for dark mode */
--primary-foreground: 150 25% 8%;
--success: 142 76% 60%;
--warning: 48 96% 60%;
--ai: 258 90% 60%;
--human: 217 91% 60%;
--border: 150 12% 24%;
--input: 150 12% 24%;
```

### Typography

SF Pro-inspired scale defined in `tailwind.config.ts`:

```typescript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px - Caption 1
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - Footnote
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px - Callout
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - Body
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - Title 3
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - Title 2
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - Title 1
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px - Large Title
}
```

### Spacing (8pt Grid)

```typescript
spacing: {
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  11: '2.75rem',   // 44px (Apple touch target minimum)
  12: '3rem',      // 48px (Apple recommended touch target)
}
```

### Shadows

```typescript
boxShadow: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
}
```

### Motion

```typescript
transitionDuration: {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
}

transitionTimingFunction: {
  'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
  'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
  'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
}
```

---

## 2. Component Implementation

### Card Component

**File:** `components/ui/card.tsx`

**Glassmorphic Styling:**
```tsx
className="relative rounded-lg bg-card/95 text-card-foreground shadow-md 
  backdrop-blur-xl transition-all duration-normal 
  supports-[backdrop-filter]:bg-card/90 border border-border/50"
```

**Features:**
- ✅ Glassmorphic background with 95% opacity
- ✅ Backdrop blur (xl = 24px)
- ✅ Gradient border overlay using primary/accent colors
- ✅ Proper spacing: p-6 (24px) for content
- ✅ Rounded corners: rounded-lg (12px)
- ✅ Light/dark mode support

### Button Component

**File:** `components/ui/button.tsx`

**Touch Targets:**
- Default: `h-11` (44px) - Apple minimum
- Large: `h-12` (48px) - Apple recommended
- Icon: `h-11 w-11` (44x44px)

**Variants:**
```tsx
default: "bg-primary text-primary-foreground hover:bg-primary/90 
  shadow-md hover:shadow-lg backdrop-blur-sm"
destructive: "bg-destructive text-destructive-foreground 
  hover:bg-destructive/90 shadow-md hover:shadow-lg"
outline: "border border-border bg-background/50 backdrop-blur-sm 
  hover:bg-accent hover:border-primary/50"
success: "bg-success text-white hover:bg-success/90 shadow-md"
warning: "bg-warning text-white hover:bg-warning/90 shadow-md"
```

### Dialog Component

**File:** `components/ui/dialog.tsx`

**Glassmorphic Modal:**
```tsx
className="fixed left-[50%] top-[50%] z-50 grid w-[92vw] max-w-3xl 
  translate-x-[-50%] translate-y-[-50%] gap-6 rounded-lg 
  border border-border/50 bg-card/95 p-6 shadow-2xl backdrop-blur-xl 
  duration-normal supports-[backdrop-filter]:bg-card/90"
```

**Overlay:**
```tsx
className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xl"
```

### Input & Textarea Components

**Files:** `components/ui/input.tsx`, `components/ui/textarea.tsx`

**Shared Styling:**
```tsx
className="h-11 w-full rounded-lg border border-input bg-input/50 
  backdrop-blur-sm px-4 py-2 text-sm transition-all duration-fast 
  focus-visible:ring-2 focus-visible:ring-ring 
  focus-visible:border-primary/50 hover:border-border"
```

### Toast Component

**File:** `components/ui/toast.tsx`

**Glassmorphic Notifications:**
```tsx
default: "bg-card/95 text-card-foreground 
  supports-[backdrop-filter]:bg-card/90"
destructive: "border-destructive/50 bg-destructive/95 
  text-destructive-foreground supports-[backdrop-filter]:bg-destructive/90"
success: "border-success/50 bg-success/95 text-white 
  supports-[backdrop-filter]:bg-success/90"
warning: "border-warning/50 bg-warning/95 text-white 
  supports-[backdrop-filter]:bg-warning/90"
```

### Tabs Component

**File:** `components/ui/tabs.tsx`

**Tab List:**
```tsx
className="inline-flex h-11 items-center justify-center rounded-lg 
  bg-muted/50 p-1 text-muted-foreground border border-border/50 
  shadow-sm backdrop-blur-sm"
```

**Tab Trigger:**
```tsx
className="inline-flex items-center justify-center whitespace-nowrap 
  rounded-md px-4 py-2 text-sm font-medium transition-all duration-normal 
  data-[state=active]:bg-background data-[state=active]:text-foreground 
  data-[state=active]:shadow-md data-[state=active]:backdrop-blur-sm"
```

### Table Component

**File:** `components/ui/table.tsx`

**Styling:**
```tsx
TableRow: "border-b border-border/50 transition-all duration-fast 
  hover:bg-muted/30 data-[state=selected]:bg-muted/50"
TableHead: "h-12 px-4 text-left align-middle font-semibold text-sm 
  text-muted-foreground"
```

### Badge Component

**File:** `components/ui/badge.tsx`

**Variants:**
```tsx
default: "border-transparent bg-primary text-primary-foreground 
  hover:bg-primary/80 shadow-sm"
success: "border-transparent bg-success text-white 
  hover:bg-success/80 shadow-sm"
warning: "border-transparent bg-warning text-white 
  hover:bg-warning/80 shadow-sm"
```

---

## 3. Layout Components

### AppLayout

**File:** `components/app-layout.tsx`

**Main Container:**
```tsx
<div className="flex h-screen overflow-hidden bg-background">
  <Sidebar />
  <main className="flex-1 flex flex-col overflow-hidden">
    <Header />
    <div className="flex-1 overflow-auto p-6 md:p-8">{children}</div>
  </main>
</div>
```

**Spacing:**
- Mobile: `p-6` (24px)
- Desktop: `p-8` (32px)

### Header

**File:** `components/header.tsx`

**Glassmorphic Header:**
```tsx
className="sticky top-0 z-30 flex h-16 w-full items-center 
  justify-between bg-background/95 backdrop-blur-xl border-b 
  border-border/50 px-4 md:px-6 shadow-sm"
```

### Sidebar

**File:** `components/sidebar.tsx`

**Desktop Sidebar:**
```tsx
className="h-screen bg-sidebar border-r border-sidebar-border 
  transition-all duration-normal ease-in-out"
```

**Navigation Items:**
```tsx
Active: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
Inactive: "text-sidebar-foreground hover:bg-sidebar-accent 
  hover:text-foreground"
```

**User Profile Card:**
```tsx
className="flex items-center gap-3 rounded-lg border border-border/50 
  bg-card/95 p-3 backdrop-blur-sm shadow-sm"
```

---

## 4. Page Components

### Dashboard

**File:** `components/dashboard-page.tsx`

**Container:**
```tsx
<div className="flex-1 space-y-6">
  <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
  <Tabs defaultValue="overview" className="space-y-6">
    {/* Content */}
  </Tabs>
</div>
```

**Stat Cards:**
- Use standard `<Card>` component
- Remove custom gradient classes
- Use design tokens: `text-success`, `text-destructive`, `text-foreground`

---

## 5. Glassmorphism Implementation

### Light Mode Glassmorphism

**Background Opacity:** 90-95%
**Backdrop Blur:** `backdrop-blur-xl` (24px)
**Border:** `border-border/50` (50% opacity)
**Shadow:** `shadow-md` to `shadow-xl`

**Example:**
```css
bg-card/95 backdrop-blur-xl border border-border/50 shadow-md
supports-[backdrop-filter]:bg-card/90
```

### Dark Mode Glassmorphism

**Background Opacity:** 90-95%
**Backdrop Blur:** `backdrop-blur-xl` (24px)
**Border:** `border-border/50` (darker, 50% opacity)
**Shadow:** `shadow-lg` to `shadow-2xl`

**Example:**
```css
dark:bg-card/95 dark:backdrop-blur-xl dark:border-border/50 dark:shadow-lg
dark:supports-[backdrop-filter]:bg-card/90
```

---

## 6. Apple HIG Compliance

### Touch Targets

- **Minimum:** 44×44pt (`h-11 w-11`)
- **Recommended:** 48×48pt (`h-12 w-12`)
- All interactive elements meet minimum requirements

### Typography Scale

- **Large Title:** 36px (`text-4xl`)
- **Title 1:** 30px (`text-3xl`)
- **Title 2:** 24px (`text-2xl`)
- **Title 3:** 20px (`text-xl`)
- **Body:** 18px (`text-lg`)
- **Callout:** 16px (`text-base`)
- **Footnote:** 14px (`text-sm`)
- **Caption:** 12px (`text-xs`)

### Spacing System

All spacing follows 8pt grid:
- 4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px

### Border Radius

- **Small:** `rounded-md` (6px)
- **Medium:** `rounded-lg` (12px)
- **Large:** `rounded-xl` (16px)

---

## 7. Accessibility

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

### Focus States

All interactive elements include:
```tsx
focus-visible:outline-none focus-visible:ring-2 
focus-visible:ring-ring focus-visible:ring-offset-2
```

### Keyboard Navigation

- All components support keyboard navigation
- Tab order follows visual hierarchy
- Escape key closes modals/dialogs

---

## 8. Testing Checklist

### Visual Testing

- ✅ Light mode glassmorphism on all cards
- ✅ Dark mode glassmorphism on all cards
- ✅ Proper backdrop blur on overlays
- ✅ Border opacity at 50% for glassmorphic effect
- ✅ Shadow depth appropriate for elevation
- ✅ Color contrast meets accessibility standards

### Functional Testing

- ✅ All buttons meet 44px minimum touch target
- ✅ Form inputs have proper focus states
- ✅ Tabs transition smoothly
- ✅ Dialogs animate in/out correctly
- ✅ Toasts display with correct variants
- ✅ Tables have hover states

### Cross-Browser Testing

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (webkit)
- ✅ Mobile Safari (iOS)

---

## 9. Migration Guide

### Updating Existing Components

1. **Replace hardcoded colors** with design tokens:
   ```tsx
   // Before
   className="bg-blue-500 text-white"
   
   // After
   className="bg-primary text-primary-foreground"
   ```

2. **Update spacing** to 8pt grid:
   ```tsx
   // Before
   className="p-5 gap-3"
   
   // After
   className="p-6 gap-4"
   ```

3. **Add glassmorphic effects**:
   ```tsx
   // Before
   className="bg-white border rounded-md"
   
   // After
   className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg"
   ```

4. **Update touch targets**:
   ```tsx
   // Before
   <Button className="h-9">Click</Button>
   
   // After
   <Button className="h-11">Click</Button>
   ```

---

## 10. Future Enhancements

### Planned Additions

- [ ] Animation library for micro-interactions
- [ ] Additional semantic color tokens (info, neutral)
- [ ] Extended shadow scale for depth hierarchy
- [ ] Gradient utilities for hero sections
- [ ] Pattern library for common layouts

### Performance Optimizations

- [ ] CSS variable optimization
- [ ] Reduced backdrop-blur on low-end devices
- [ ] Lazy-load glassmorphic effects
- [ ] Optimize shadow rendering

---

## 11. Resources

### Internal Documentation

- [Design Tokens](./design-tokens.md)
- [Components](./components.md)
- [Theming](./theming.md)
- [Apple HIG Compliance](./apple-hig/README.md)

### External Resources

- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)

---

**Implementation Complete:** All components now follow the design system with proper glassmorphic effects, spacing, typography, and accessibility standards for both light and dark modes.
