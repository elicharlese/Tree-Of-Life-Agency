# Design Tokens

Design tokens are the fundamental building blocks of our design system. They provide consistent values for colors, typography, spacing, shadows, and motion across all components and applications.

## 🎨 Color System

Our color system uses HSL (Hue, Saturation, Lightness) values for broad browser compatibility and provides semantic color mappings for different use cases.

### Primary Colors (Green Brand Theme)

```typescript
primary: {
  50: 'hsl(110, 25%, 95%)',   // Very light green
  100: 'hsl(110, 25%, 90%)',  // Light green
  200: 'hsl(110, 25%, 80%)',  // Lighter green
  300: 'hsl(110, 25%, 70%)',  // Light medium green
  400: 'hsl(110, 25%, 60%)',  // Medium green
  500: 'hsl(110, 25%, 50%)',  // Base green #6E9B68
  600: 'hsl(110, 25%, 40%)',  // Dark medium green
  700: 'hsl(110, 25%, 30%)',  // Dark green
  800: 'hsl(110, 25%, 20%)',  // Darker green
  900: 'hsl(110, 25%, 11%)',  // Very dark green
}
```

### Semantic Colors

```typescript
// Success states
success: {
  50: 'hsl(142, 76%, 95%)',   // Very light green
  500: 'hsl(142, 76%, 50%)',  // Success green
  900: 'hsl(142, 76%, 10%)',  // Dark success green
}

// Warning states
warning: {
  50: 'hsl(48, 96%, 95%)',    // Very light amber
  500: 'hsl(48, 96%, 50%)',   // Warning amber
  900: 'hsl(48, 96%, 10%)',   // Dark warning amber
}

// Error states
error: {
  50: 'hsl(0, 84%, 95%)',     // Very light red
  500: 'hsl(0, 84%, 50%)',    // Error red
  900: 'hsl(0, 84%, 10%)',    // Dark error red
}

// AI and Human indicators
ai: {
  500: 'hsl(258, 90%, 50%)',  // AI purple #8b5cf6
}

human: {
  500: 'hsl(217, 91%, 50%)',  // Human blue #3b82f6
}
```

### Neutral Colors

```typescript
neutral: {
  0: 'hsl(0, 0%, 100%)',      // Pure white
  50: 'hsl(0, 0%, 98%)',      // Off-white
  100: 'hsl(0, 0%, 96%)',     // Very light gray
  200: 'hsl(0, 0%, 90%)',     // Light gray
  300: 'hsl(0, 0%, 80%)',     // Medium light gray
  400: 'hsl(0, 0%, 60%)',     // Medium gray
  500: 'hsl(0, 0%, 50%)',     // Mid gray
  600: 'hsl(0, 0%, 40%)',     // Medium dark gray
  700: 'hsl(0, 0%, 30%)',     // Dark gray
  800: 'hsl(0, 0%, 20%)',     // Darker gray
  900: 'hsl(0, 0%, 10%)',     // Very dark gray
  1000: 'hsl(0, 0%, 0%)',     // Pure black
}
```

## 📝 Typography

Our typography system uses Quicksand for UI text and Geist Mono for code, providing excellent readability and modern aesthetics.

### Font Families

```typescript
fontFamily: {
  sans: ['Quicksand', 'system-ui', 'sans-serif'],
  mono: ['Geist Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
}
```

### Font Sizes

```typescript
fontSize: {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px
  '5xl': ['3rem', { lineHeight: '1' }],         // 48px
  '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px
  '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px
}
```

### Font Weights

```typescript
fontWeight: {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
}
```

### Semantic Text Styles

#### Display Text (Hero sections, large headings)
```typescript
display: {
  '2xl': {
    fontSize: '4.5rem',      // 72px
    lineHeight: '1',
    fontWeight: '700',
    letterSpacing: '-0.05em',
  },
  xl: {
    fontSize: '3.75rem',     // 60px
    lineHeight: '1',
    fontWeight: '700',
    letterSpacing: '-0.05em',
  },
}
```

#### Heading Text (Section titles, card headers)
```typescript
heading: {
  xl: {
    fontSize: '1.875rem',    // 30px
    lineHeight: '2.25rem',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
  lg: {
    fontSize: '1.5rem',      // 24px
    lineHeight: '2rem',
    fontWeight: '600',
    letterSpacing: '-0.025em',
  },
}
```

#### Body Text (Paragraphs, descriptions)
```typescript
body: {
  lg: {
    fontSize: '1.125rem',    // 18px
    lineHeight: '1.75rem',
    fontWeight: '400',
  },
  md: {
    fontSize: '1rem',        // 16px
    lineHeight: '1.5rem',
    fontWeight: '400',
  },
}
```

#### Label Text (Form labels, captions)
```typescript
label: {
  md: {
    fontSize: '0.875rem',    // 14px
    lineHeight: '1.25rem',
    fontWeight: '500',
    letterSpacing: '0.025em',
  },
}
```

#### Code Text (Monospace)
```typescript
code: {
  md: {
    fontSize: '0.875rem',    // 14px
    lineHeight: '1.25rem',
    fontFamily: 'JetBrains Mono',
    fontWeight: '400',
  },
}
```

## 📏 Spacing

Our spacing system uses an 8px base unit for consistent, scalable spacing across all components.

```typescript
spacing: {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
}
```

### Component Spacing Guidelines

```typescript
componentSpacing: {
  xs: '0.25rem',    // 4px - Small gaps, padding
  sm: '0.5rem',     // 8px - Component internal spacing
  md: '1rem',       // 16px - Card content, form groups
  lg: '1.5rem',     // 24px - Section spacing
  xl: '2rem',       // 32px - Major component separation
  '2xl': '3rem',    // 48px - Page sections
  '3xl': '4rem',    // 64px - Hero sections
}
```

## 🌑 Shadows

Shadow tokens provide depth and hierarchy in the interface. Cards should feel airy and refined, so we keep shadows subtle and focused near the surface.

```typescript
shadows: {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.06)',
  lg: '0 6px 14px -4px rgb(0 0 0 / 0.08)',
  card: {
    light: '0px 4px 10px rgba(13, 55, 35, 0.02)',
    dark: '0px 3px 8px rgba(0, 0, 0, 0.15)',
  },
}
```

> **Card elevation rule**  
> Use `shadows.card.light` / `shadows.card.dark` for all cards by default. Only opt into `shadows.md` or above for floating elements such as modals or sticky toolbars.

## 🎭 Motion

Animation tokens ensure consistent, accessible motion design.

```typescript
motion: {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
}
```

## 📱 Responsive Breakpoints

```typescript
responsive: {
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (laptops)
  xl: '1280px',  // Extra large devices (desktops)
  '2xl': '1536px', // 2X large devices (large desktops)
}
```

## 🎯 Usage Guidelines

### Using Design Tokens in Code

```tsx
import { colors, spacing, textStyles } from '@/libs/design-system/tokens';

// Use semantic colors
const buttonStyles = {
  backgroundColor: colors.primary[500],
  color: colors.primary[50],
  padding: spacing[4],
};

// Use text styles
const headingStyles = textStyles.heading.xl;
```

### Using Design Tokens in CSS

```css
.my-component {
  color: hsl(var(--primary-500));
  padding: var(--spacing-4);
  font-size: var(--text-heading-xl-font-size);
  line-height: var(--text-heading-xl-line-height);
}
```

### Best Practices

1. **Always use tokens**: Never hardcode values in components
2. **Semantic naming**: Use color names that describe purpose, not appearance
3. **Consistent spacing**: Use the spacing scale for all margins and padding
4. **Typography hierarchy**: Use semantic text styles for consistent hierarchy
5. **Theme compatibility**: Ensure tokens work in both light and dark themes

### Extending Tokens

When adding new tokens:

1. Follow existing naming conventions
2. Ensure accessibility compliance
3. Test across all themes
4. Update documentation
5. Maintain backward compatibility