# ECE-AGENT Design System

A comprehensive design system for the ECE-AGENT platform, built with modern React, TypeScript, and Tailwind CSS. This system provides consistent, accessible, and scalable UI components for building high-quality user experiences.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Design Tokens](#design-tokens)
- [Components](#components)
- [Patterns](#patterns)
- [Theming](#theming)
- [Usage Guidelines](#usage-guidelines)
- [Contributing](#contributing)

## 🎯 Overview

The ECE-AGENT design system is built on several core principles:

- **Consistency**: Unified visual language across all components
- **Accessibility**: WCAG 2.1 AA compliant components
- **Scalability**: Modular architecture that grows with the platform
- **Performance**: Optimized for fast loading and smooth interactions
- **Developer Experience**: Type-safe, well-documented APIs

### Key Features

- 🎨 **Comprehensive Token System**: Colors, typography, spacing, shadows, and motion
- 🧩 **Component Library**: 40+ reusable UI primitives and patterns
- 🌙 **Dark/Light Themes**: Automatic theme switching with CSS variables
- 📱 **Responsive Design**: Mobile-first approach with breakpoint system
- ♿ **Accessibility**: Built-in ARIA support and keyboard navigation
- 🔧 **Developer Tools**: TypeScript, Storybook, and comprehensive documentation

## 🏗️ Architecture

The design system is organized into layered architecture:

```
libs/design-system/
├── tokens/           # Design tokens (colors, typography, spacing)
├── primitives/       # Base UI components (Button, Input, Card, etc.)
├── patterns/         # Layout and interaction patterns
├── components/       # Higher-level components
└── utils/           # Utility functions and helpers
```

### Dependencies

- **React 18+** with TypeScript
- **Tailwind CSS** for utility-first styling
- **Radix UI** for accessible primitives
- **Lucide React** for icons
- **Class Variance Authority (CVA)** for component variants

## 🎨 Design Tokens

### Color System

The color system uses HSL values for broad browser compatibility and provides semantic color mappings:

```typescript
// Primary brand colors (Green theme)
--primary: 110 25% 49%;     // #6E9B68
--primary-foreground: 0 0% 100%;

// Semantic colors
--success: 142 76% 50%;     // Green for positive actions
--warning: 48 96% 50%;      // Amber for warnings
--error: 0 84% 50%;         // Red for errors
--ai: 258 90% 50%;          // Purple for AI elements
--human: 217 91% 50%;       // Blue for human elements
```

### Typography

Built on Quicksand (sans-serif) and Geist Mono (monospace) with semantic scales:

```typescript
// Display text (large headings)
display: {
  '2xl': ['4.5rem', { lineHeight: '1' }],    // 72px
  xl: ['3.75rem', { lineHeight: '1' }],     // 60px
}

// Body text (paragraphs)
body: {
  lg: ['1.125rem', { lineHeight: '1.75rem' }], // 18px
  md: ['1rem', { lineHeight: '1.5rem' }],      // 16px
}
```

### Spacing

8px base unit system for consistent spacing:

```typescript
spacing: {
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
}
```

## 🧩 Components

### Primitives

Core building blocks with consistent APIs:

- **Button**: Multiple variants (primary, secondary, ghost, outline, destructive)
- **Input/Textarea**: Form controls with validation states
- **Card**: Content containers with header/body/footer slots
- **Dialog/Modal**: Overlay components with focus management
- **Badge**: Status indicators and labels
- **Avatar**: User profile images with fallbacks

### Advanced Components

Higher-level components for complex interactions:

- **ShinyButton**: Glassmorphic button with animated sheen
- **GridOverlay**: Development grid for alignment
- **HeroCopy**: Marketing text with gradient effects
- **TiltGlassCard**: 3D glassmorphic cards with hover effects

## 📐 Patterns

### Layout Patterns

- **Container**: Centered content wrapper
- **Grid**: Responsive grid system
- **PageLayout**: Standard page structure

### Interaction Patterns

- **Loading States**: Skeleton screens and spinners
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: Non-intrusive feedback
- **Form Validation**: Real-time validation with error messages

## 🌙 Theming

The design system supports automatic light/dark theme switching:

### Light Theme
```css
--background: 0 0% 100%;
--foreground: 110 25% 25%;
--card: 210 20% 98%;
```

### Dark Theme
```css
--background: 110 25% 8%;
--foreground: 110 15% 90%;
--card: 150 20% 12%;
```

### Custom Themes

Extend themes by overriding CSS variables:

```css
:root {
  --primary: 220 89% 56%; /* Custom blue primary */
  --radius: 0.75rem;       /* Larger border radius */
}
```

## 📖 Usage Guidelines

### Component Usage

```tsx
import { Button, Card, Input } from '@/libs/design-system';

// Use semantic variants
<Button variant="primary">Save Changes</Button>
<Button variant="destructive">Delete</Button>

// Compose components
<Card>
  <CardHeader>
    <CardTitle>Project Settings</CardTitle>
  </CardHeader>
  <CardContent>
    <Input placeholder="Project name" />
  </CardContent>
</Card>
```

### Styling Guidelines

- Use design tokens instead of hardcoded values
- Prefer component variants over custom CSS
- Maintain consistent spacing using the spacing scale
- Test components in both light and dark themes

### Accessibility

- All components include proper ARIA attributes
- Keyboard navigation is fully supported
- Color contrast meets WCAG 2.1 AA standards
- Screen reader announcements for dynamic content

## 🤝 Contributing

### Adding Components

1. Create component in appropriate directory (`primitives/` or `components/`)
2. Use TypeScript with proper prop types
3. Implement variants using Class Variance Authority
4. Add comprehensive documentation
5. Include accessibility features
6. Test in both themes

### Design Token Updates

1. Update token files in `tokens/` directory
2. Ensure backward compatibility
3. Update CSS variable definitions
4. Test across all components
5. Update documentation

### Testing

- Unit tests for component logic
- Visual regression tests for styling
- Accessibility audits
- Cross-browser testing

---

For detailed component documentation, see the individual component guides in this directory.