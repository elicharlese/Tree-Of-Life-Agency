# Boxes

> A box is a container that groups related interface elements and content, providing visual organization and hierarchy.

## Overview

Boxes are fundamental building blocks in AGENT's interface:

- **Cards** - Elevated content containers
- **Panels** - Sidebar and workspace sections
- **Groups** - Related form fields or settings
- **Callouts** - Highlighted information
- **Wells** - Inset content areas

## Apple HIG Principles

### 1. Visual Containment

Boxes create clear boundaries for content:

```text
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐    │
│  │     Content Area            │    │
│  │                             │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Another Section         │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

### 2. Depth & Elevation

Use subtle shadows and backgrounds to convey hierarchy:

| Level | Background | Shadow | Use Case |
|-------|------------|--------|----------|
| 0 (Base) | Transparent | None | Page background |
| 1 (Surface) | White/5% | None | Panels, sidebars |
| 2 (Card) | White/80% | sm | Cards, dialogs |
| 3 (Elevated) | White/95% | md | Popovers, dropdowns |
| 4 (Modal) | White/95% | lg | Modals, sheets |

### 3. Corner Radius

Consistent rounding creates visual harmony:

```css
/* Corner radius tokens */
--box-radius-sm: 8px;     /* Small elements */
--box-radius-md: 12px;    /* Cards, buttons */
--box-radius-lg: 16px;    /* Panels, dialogs */
--box-radius-xl: 20px;    /* Large containers */
--box-radius-full: 9999px; /* Pills, avatars */
```

## AGENT Implementation

### Base Box Component

```tsx
interface BoxProps {
  children: React.ReactNode;
  variant?: 'surface' | 'card' | 'elevated' | 'inset' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Box: React.FC<BoxProps> = ({
  children,
  variant = 'card',
  padding = 'md',
  radius = 'lg',
  className,
}) => {
  const variantClasses = {
    surface: 'bg-white/5 dark:bg-white/5',
    card: 'bg-white/80 dark:bg-white/5 backdrop-blur-xl shadow-sm border border-black/5 dark:border-white/10',
    elevated: 'bg-white/95 dark:bg-[#1c1c1e]/95 backdrop-blur-xl shadow-lg border border-black/5 dark:border-white/10',
    inset: 'bg-black/[0.03] dark:bg-white/[0.03]',
    outline: 'border border-black/10 dark:border-white/10',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  const radiusClasses = {
    none: 'rounded-none',
    sm: 'rounded-[8px]',
    md: 'rounded-[12px]',
    lg: 'rounded-[16px]',
    xl: 'rounded-[20px]',
  };

  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${paddingClasses[padding]}
        ${radiusClasses[radius]}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
```

### CSS Classes

```css
/* ============================================
   Apple HIG Box System
   ============================================ */

/* Base Box */
.agent-box {
  @apply relative;
  @apply overflow-hidden;
}

/* Surface Box - Subtle background */
.agent-box-surface {
  @apply bg-white/5 dark:bg-white/5;
  @apply rounded-[16px];
}

/* Card Box - Elevated with glass effect */
.agent-box-card {
  @apply bg-white/80 dark:bg-white/5;
  @apply backdrop-blur-xl;
  @apply rounded-[16px];
  @apply border border-black/5 dark:border-white/10;
  @apply shadow-sm;
}

/* Elevated Box - Higher elevation */
.agent-box-elevated {
  @apply bg-white/95 dark:bg-[#1c1c1e]/95;
  @apply backdrop-blur-xl backdrop-saturate-150;
  @apply rounded-[14px];
  @apply border border-black/5 dark:border-white/10;
  @apply shadow-xl shadow-black/10 dark:shadow-black/30;
}

/* Inset Box - Recessed appearance */
.agent-box-inset {
  @apply bg-black/[0.03] dark:bg-white/[0.03];
  @apply rounded-[12px];
}

/* Outline Box - Border only */
.agent-box-outline {
  @apply border border-black/10 dark:border-white/10;
  @apply rounded-[12px];
}

/* Box Padding Variants */
.agent-box-padding-none { @apply p-0; }
.agent-box-padding-sm { @apply p-3; }
.agent-box-padding-md { @apply p-4; }
.agent-box-padding-lg { @apply p-6; }
.agent-box-padding-xl { @apply p-8; }

/* Box Radius Variants */
.agent-box-radius-none { @apply rounded-none; }
.agent-box-radius-sm { @apply rounded-[8px]; }
.agent-box-radius-md { @apply rounded-[12px]; }
.agent-box-radius-lg { @apply rounded-[16px]; }
.agent-box-radius-xl { @apply rounded-[20px]; }
```

## Box Variants

### 1. Panel Box

For sidebars and main content areas:

```tsx
<div className="agent-box-card h-full">
  {/* Panel Header */}
  <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
    <h2 className="text-[15px] font-semibold">Panel Title</h2>
  </div>
  
  {/* Panel Content */}
  <div className="p-4">
    {/* Content */}
  </div>
</div>
```

### 2. Content Card

For displaying content items:

```tsx
<div className="agent-box-card p-4 hover:shadow-md transition-shadow cursor-pointer">
  <div className="flex items-start gap-3">
    <div className="h-10 w-10 rounded-[10px] bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <Sparkles className="h-5 w-5 text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="text-[15px] font-semibold text-gray-900 dark:text-gray-100">Card Title</h3>
      <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">
        Card description text goes here...
      </p>
    </div>
  </div>
</div>
```

### 3. Settings Group

For grouped form fields:

```tsx
<div className="agent-box-inset p-4 space-y-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[15px] font-medium">Notifications</p>
      <p className="text-[13px] text-gray-500">Receive push notifications</p>
    </div>
    <Switch />
  </div>
  
  <div className="h-px bg-black/5 dark:bg-white/10" />
  
  <div className="flex items-center justify-between">
    <div>
      <p className="text-[15px] font-medium">Sound</p>
      <p className="text-[13px] text-gray-500">Play notification sounds</p>
    </div>
    <Switch />
  </div>
</div>
```

### 4. Callout Box

For important information:

```tsx
<div className="agent-box-outline p-4 border-l-4 border-l-[#047857]">
  <div className="flex items-start gap-3">
    <Info className="h-5 w-5 text-[#047857] flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-[15px] font-medium text-gray-900 dark:text-gray-100">
        Important Note
      </p>
      <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-1">
        This is important information that users should be aware of.
      </p>
    </div>
  </div>
</div>
```

### 5. Well Box

For inset content areas:

```tsx
<div className="agent-box-inset p-4">
  <textarea
    className="w-full h-32 bg-transparent border-0 resize-none focus:outline-none text-[15px]"
    placeholder="Enter your message..."
  />
</div>
```

### 6. Modal Box

For dialogs and sheets:

```tsx
<div className="agent-box-elevated p-0 max-w-[500px] w-full">
  {/* Header */}
  <div className="px-5 pt-5 pb-4 border-b border-black/5 dark:border-white/10">
    <h2 className="text-[17px] font-semibold">Modal Title</h2>
  </div>
  
  {/* Content */}
  <div className="px-5 py-4">
    {/* Modal content */}
  </div>
  
  {/* Footer */}
  <div className="px-5 py-4 border-t border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]">
    <div className="flex justify-end gap-2">
      <Button variant="ghost">Cancel</Button>
      <Button>Confirm</Button>
    </div>
  </div>
</div>
```

## Composition Patterns

### Nested Boxes

```tsx
{/* Outer container */}
<div className="agent-box-surface p-4">
  {/* Inner cards */}
  <div className="grid grid-cols-2 gap-4">
    <div className="agent-box-card p-4">
      Card 1
    </div>
    <div className="agent-box-card p-4">
      Card 2
    </div>
  </div>
</div>
```

### Box with Header

```tsx
<div className="agent-box-card overflow-hidden">
  <div className="px-4 py-3 bg-black/[0.02] dark:bg-white/[0.02] border-b border-black/5 dark:border-white/10">
    <h3 className="text-[13px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
      Section Title
    </h3>
  </div>
  <div className="p-4">
    {/* Content */}
  </div>
</div>
```

### Responsive Box Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <div key={item.id} className="agent-box-card p-4">
      {/* Item content */}
    </div>
  ))}
</div>
```

## Accessibility

### Focus Management

```css
.agent-box-card:focus-within {
  @apply ring-2 ring-ring ring-offset-2;
}

.agent-box-card[tabindex="0"]:focus-visible {
  @apply outline-none ring-2 ring-ring ring-offset-2;
}
```

### Semantic Structure

```tsx
<article className="agent-box-card p-4" aria-labelledby="card-title">
  <h3 id="card-title" className="text-[15px] font-semibold">
    Card Title
  </h3>
  <p className="text-[13px] text-gray-500 mt-1">
    Card description...
  </p>
</article>
```

## Animation

### Hover Effects

```css
.agent-box-card {
  @apply transition-all duration-200 ease-out;
}

.agent-box-card:hover {
  @apply shadow-md;
  transform: translateY(-1px);
}

.agent-box-card:active {
  transform: translateY(0);
}
```

### Entrance Animation

```css
@keyframes box-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.agent-box-animate-enter {
  animation: box-enter 200ms ease-out;
}
```

## Best Practices

1. **Consistent Elevation** - Use appropriate depth for context
2. **Proper Spacing** - Maintain consistent padding within boxes
3. **Visual Hierarchy** - Nest boxes to show relationships
4. **Touch Targets** - Ensure interactive boxes meet 44pt minimum
5. **Color Contrast** - Maintain readability in all themes
6. **Responsive Design** - Adapt box layouts for different screens
7. **Performance** - Use `backdrop-blur` sparingly for performance

## Design Tokens Summary

```css
:root {
  /* Box Backgrounds */
  --box-bg-surface: rgba(255, 255, 255, 0.05);
  --box-bg-card: rgba(255, 255, 255, 0.8);
  --box-bg-elevated: rgba(255, 255, 255, 0.95);
  --box-bg-inset: rgba(0, 0, 0, 0.03);
  
  /* Box Borders */
  --box-border-light: rgba(0, 0, 0, 0.05);
  --box-border-medium: rgba(0, 0, 0, 0.1);
  
  /* Box Shadows */
  --box-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --box-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --box-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  --box-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15);
  
  /* Box Radii */
  --box-radius-sm: 8px;
  --box-radius-md: 12px;
  --box-radius-lg: 16px;
  --box-radius-xl: 20px;
  
  /* Box Padding */
  --box-padding-sm: 12px;
  --box-padding-md: 16px;
  --box-padding-lg: 24px;
  --box-padding-xl: 32px;
}

.dark {
  --box-bg-surface: rgba(255, 255, 255, 0.05);
  --box-bg-card: rgba(255, 255, 255, 0.05);
  --box-bg-elevated: rgba(28, 28, 30, 0.95);
  --box-bg-inset: rgba(255, 255, 255, 0.03);
  --box-border-light: rgba(255, 255, 255, 0.1);
  --box-border-medium: rgba(255, 255, 255, 0.15);
}
```

## Related Components

- [Lockups](./14-lockups.md) - Icon + text combinations
- [Outline Views](./15-outline-views.md) - Hierarchical lists
- [Content Containers](./07-content-containers.md) - Cards and lists
- [Modals & Overlays](./08-modals-overlays.md) - Dialog boxes

---

*Based on Apple HIG Boxes: https://developer.apple.com/design/human-interface-guidelines/boxes*
