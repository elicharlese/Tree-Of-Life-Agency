# 02 - Color System

> Comprehensive guide to implementing Apple's semantic color system with full dark mode support for AGENT.

## Apple's Color Philosophy

Apple's approach to color emphasizes:

1. **Semantic Meaning**: Colors have purpose, not just aesthetics
2. **Automatic Adaptation**: Colors adjust for light/dark modes
3. **Accessibility First**: All colors meet contrast requirements
4. **Restraint**: Vibrant colors are used sparingly for emphasis

## System Colors

### Primary UI Colors

Apple provides semantic colors that automatically adapt to appearance modes:

| Semantic Name | Light Mode | Dark Mode | Usage |
|---------------|------------|-----------|-------|
| `label` | Black | White | Primary text |
| `secondaryLabel` | 60% Gray | 60% Gray | Secondary text |
| `tertiaryLabel` | 30% Gray | 30% Gray | Tertiary text |
| `quaternaryLabel` | 18% Gray | 18% Gray | Placeholder text |
| `systemBackground` | White | Black | Primary background |
| `secondarySystemBackground` | #F2F2F7 | #1C1C1E | Grouped content |
| `tertiarySystemBackground` | White | #2C2C2E | Elevated content |
| `separator` | #C6C6C8 | #38383A | Thin separators |
| `opaqueSeparator` | #C6C6C8 | #38383A | Opaque separators |

### Accent Colors

System-wide tint colors for interactive elements:

| Color | Light Hex | Dark Hex | RGB (Light) |
|-------|-----------|----------|-------------|
| `systemBlue` | #007AFF | #0A84FF | 0, 122, 255 |
| `systemGreen` | #34C759 | #30D158 | 52, 199, 89 |
| `systemIndigo` | #5856D6 | #5E5CE6 | 88, 86, 214 |
| `systemOrange` | #FF9500 | #FF9F0A | 255, 149, 0 |
| `systemPink` | #FF2D55 | #FF375F | 255, 45, 85 |
| `systemPurple` | #AF52DE | #BF5AF2 | 175, 82, 222 |
| `systemRed` | #FF3B30 | #FF453A | 255, 59, 48 |
| `systemTeal` | #5AC8FA | #64D2FF | 90, 200, 250 |
| `systemYellow` | #FFCC00 | #FFD60A | 255, 204, 0 |

## AGENT Color Mapping

Map AGENT's brand colors to Apple's semantic system:

```css
/* Light Mode */
:root {
  /* Brand Primary - Green */
  --color-primary: #047857;           /* emerald-700 */
  --color-primary-hover: #065f46;     /* emerald-800 */
  --color-primary-active: #064e3b;    /* emerald-900 */
  --color-primary-foreground: #ffffff;
  
  /* Semantic Labels */
  --color-label: #000000;
  --color-label-secondary: rgba(60, 60, 67, 0.6);
  --color-label-tertiary: rgba(60, 60, 67, 0.3);
  --color-label-quaternary: rgba(60, 60, 67, 0.18);
  
  /* Backgrounds */
  --color-background: #ffffff;
  --color-background-secondary: #f2f2f7;
  --color-background-tertiary: #ffffff;
  --color-background-elevated: #ffffff;
  
  /* Fills */
  --color-fill: rgba(120, 120, 128, 0.2);
  --color-fill-secondary: rgba(120, 120, 128, 0.16);
  --color-fill-tertiary: rgba(118, 118, 128, 0.12);
  --color-fill-quaternary: rgba(116, 116, 128, 0.08);
  
  /* Separators */
  --color-separator: rgba(60, 60, 67, 0.29);
  --color-separator-opaque: #c6c6c8;
  
  /* System Colors */
  --color-blue: #007aff;
  --color-green: #34c759;
  --color-red: #ff3b30;
  --color-orange: #ff9500;
  --color-yellow: #ffcc00;
  --color-purple: #af52de;
  --color-teal: #5ac8fa;
}

/* Dark Mode */
.dark {
  /* Brand Primary - Green (adjusted for dark) */
  --color-primary: #10b981;           /* emerald-500 */
  --color-primary-hover: #34d399;     /* emerald-400 */
  --color-primary-active: #6ee7b7;    /* emerald-300 */
  --color-primary-foreground: #000000;
  
  /* Semantic Labels */
  --color-label: #ffffff;
  --color-label-secondary: rgba(235, 235, 245, 0.6);
  --color-label-tertiary: rgba(235, 235, 245, 0.3);
  --color-label-quaternary: rgba(235, 235, 245, 0.18);
  
  /* Backgrounds */
  --color-background: #000000;
  --color-background-secondary: #1c1c1e;
  --color-background-tertiary: #2c2c2e;
  --color-background-elevated: #1c1c1e;
  
  /* Fills */
  --color-fill: rgba(120, 120, 128, 0.36);
  --color-fill-secondary: rgba(120, 120, 128, 0.32);
  --color-fill-tertiary: rgba(118, 118, 128, 0.24);
  --color-fill-quaternary: rgba(116, 116, 128, 0.18);
  
  /* Separators */
  --color-separator: rgba(84, 84, 88, 0.65);
  --color-separator-opaque: #38383a;
  
  /* System Colors (brighter for dark mode) */
  --color-blue: #0a84ff;
  --color-green: #30d158;
  --color-red: #ff453a;
  --color-orange: #ff9f0a;
  --color-yellow: #ffd60a;
  --color-purple: #bf5af2;
  --color-teal: #64d2ff;
}
```

## Dark Mode Guidelines

### Background Hierarchy

In dark mode, use elevated backgrounds to create depth:

```
Base Level (z-0):        #000000 (Pure black)
├── Secondary (z-10):    #1C1C1E (Grouped backgrounds)
│   └── Tertiary (z-20): #2C2C2E (Cards, elevated content)
│       └── Elevated:    #3A3A3C (Popovers, modals)
```

### Color Adjustments for Dark Mode

| Element | Light Mode | Dark Mode | Reason |
|---------|------------|-----------|--------|
| Primary actions | Saturated | Slightly brighter | Visibility |
| Backgrounds | White/Light gray | Black/Dark gray | Reduce eye strain |
| Text | Dark on light | Light on dark | Contrast |
| Borders | Darker than bg | Lighter than bg | Definition |
| Shadows | Black with opacity | Reduced/none | Less effective on dark |

### Implementation Example

```tsx
// Component with proper dark mode support
const ChatBubble = ({ isUser, children }) => (
  <div
    className={cn(
      "rounded-2xl px-4 py-2 max-w-[80%]",
      isUser
        ? "bg-primary text-primary-foreground ml-auto"
        : "bg-fill text-label mr-auto"
    )}
  >
    {children}
  </div>
);

// Tailwind config for semantic colors
module.exports = {
  theme: {
    extend: {
      colors: {
        label: 'var(--color-label)',
        'label-secondary': 'var(--color-label-secondary)',
        'label-tertiary': 'var(--color-label-tertiary)',
        background: 'var(--color-background)',
        'background-secondary': 'var(--color-background-secondary)',
        fill: 'var(--color-fill)',
        separator: 'var(--color-separator)',
      }
    }
  }
};
```

## Accessibility Requirements

### Contrast Ratios

| Text Type | Minimum Ratio | Recommended |
|-----------|---------------|-------------|
| Body text | 4.5:1 | 7:1 |
| Large text (18pt+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |
| Decorative | No requirement | - |

### Testing Colors

```tsx
// Utility to check contrast ratio
function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (hex: string) => {
    const rgb = hexToRgb(hex);
    const [r, g, b] = rgb.map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Usage
const ratio = getContrastRatio('#047857', '#ffffff');
console.log(`Contrast ratio: ${ratio.toFixed(2)}:1`);
// Should be >= 4.5 for body text
```

### Color Blindness Considerations

Never rely on color alone to convey information:

```tsx
// ❌ Bad: Color only
<Badge className="bg-red-500">Error</Badge>
<Badge className="bg-green-500">Success</Badge>

// ✅ Good: Color + Icon + Text
<Badge className="bg-red-500">
  <XCircle className="w-4 h-4 mr-1" />
  Error
</Badge>
<Badge className="bg-green-500">
  <CheckCircle className="w-4 h-4 mr-1" />
  Success
</Badge>
```

## Vibrancy and Materials

### Blur Effects

Apple uses vibrancy (blur + color overlay) for depth:

```css
/* Thin material - subtle blur */
.material-thin {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* Regular material - standard blur */
.material-regular {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
}

/* Thick material - heavy blur */
.material-thick {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
}

/* Dark mode variants */
.dark .material-thin {
  background: rgba(30, 30, 30, 0.7);
}

.dark .material-regular {
  background: rgba(30, 30, 30, 0.8);
}

.dark .material-thick {
  background: rgba(30, 30, 30, 0.9);
}
```

### Tailwind Implementation

```tsx
// Tailwind classes for materials
const materials = {
  thin: "bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl",
  regular: "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl",
  thick: "bg-white/90 dark:bg-neutral-900/90 backdrop-blur-3xl",
  chrome: "bg-background/95 dark:bg-background/95 backdrop-blur-xl",
};

// Usage
<Sidebar className={materials.regular}>
  {/* Sidebar content */}
</Sidebar>
```

## Color Usage Guidelines

### Do's

- ✅ Use semantic color names (`label`, `background`, `primary`)
- ✅ Test all colors in both light and dark modes
- ✅ Ensure sufficient contrast for text
- ✅ Use system colors for standard actions (blue for links, red for destructive)
- ✅ Apply vibrancy for overlays and sidebars

### Don'ts

- ❌ Hardcode hex values directly in components
- ❌ Use pure black (#000000) for text in light mode
- ❌ Rely solely on color to convey meaning
- ❌ Use overly saturated colors for large areas
- ❌ Ignore dark mode when designing

## AGENT-Specific Color Tokens

```css
:root {
  /* Chat-specific colors */
  --color-chat-user: var(--color-primary);
  --color-chat-ai: var(--color-fill);
  --color-chat-system: var(--color-fill-tertiary);
  
  /* Status colors */
  --color-status-online: var(--color-green);
  --color-status-away: var(--color-yellow);
  --color-status-busy: var(--color-red);
  --color-status-offline: var(--color-label-tertiary);
  
  /* Project colors */
  --color-project-active: var(--color-primary);
  --color-project-archived: var(--color-label-tertiary);
  --color-project-shared: var(--color-blue);
  
  /* AI mode indicators */
  --color-ai-standard: var(--color-blue);
  --color-ai-creative: var(--color-purple);
  --color-ai-precise: var(--color-teal);
  --color-ai-code: var(--color-orange);
}
```

---

*Next: [03-typography.md](./03-typography.md) - SF Pro font system and text styles*
