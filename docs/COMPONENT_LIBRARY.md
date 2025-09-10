# Tree of Life Agency Component Library

## Overview
A professional, scalable component library built with TypeScript, React, and Tailwind CSS following atomic design principles and the Tree of Life Agency design system.

## Design System

### Color Palette
- **Leaf**: Primary green tones (#3a9b3a to #f0f9f0)
- **Bark**: Neutral browns (#2d241a to #faf9f7)  
- **Root**: Warm earth tones (#a66d28 to #fdf8f3)
- **Wisdom**: Accent yellows (#d97706 to #fffbeb)

### Typography
- **Font Family**: Inter (sans-serif), Georgia (serif)
- **Scale**: xs (0.75rem) to 6xl (3.75rem)
- **Weights**: normal (400), medium (500), semibold (600), bold (700)

## Component Architecture

### Base Components (`/components/ui/`)

#### Button (`button-variants.tsx`)
```tsx
<Button variant="organic" size="md">Click me</Button>
```
**Variants**: `organic` | `leaf` | `wisdom` | `secondary` | `ghost` | `link`
**Sizes**: `sm` | `md` | `lg` | `icon`

#### Input (`input-variants.tsx`)
```tsx
<Input variant="organic" placeholder="Enter text..." />
```
**Variants**: `default` | `organic`
**Props**: `error` boolean for validation states

#### Select (`select.tsx`)
```tsx
<Select variant="organic">
  <option value="1">Option 1</option>
</Select>
```
**Features**: Built-in chevron icon, consistent styling with inputs

#### Card (`card-variants.tsx`)
```tsx
<Card variant="organic">
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```
**Variants**: `default` | `organic` | `elevated` | `outlined`

### Layout Components (`/components/layout/`)

#### PageHeader
```tsx
<PageHeader 
  title="Page Title"
  showBackButton={true}
  actionButton={{
    label: "Action",
    href: "/path",
    variant: "leaf"
  }}
/>
```

#### SearchFilter
```tsx
<SearchFilter
  searchQuery={query}
  onSearchChange={setQuery}
  filterValue={filter}
  onFilterChange={setFilter}
  filterOptions={options}
/>
```

## Design Tokens (`/lib/design-tokens.ts`)

Centralized design system tokens including:
- Color palette with semantic naming
- Typography scale and font families
- Spacing scale (xs to 4xl)
- Border radius values (organic, branch)
- Shadow definitions
- Animation durations

## Usage Guidelines

### Import Pattern
```tsx
import { Button, Input, Card } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
```

### Styling Consistency
- Use design tokens for consistent spacing and colors
- Prefer component variants over custom CSS classes
- Follow the organic design language (rounded corners, natural shadows)

### Accessibility
- All components include proper ARIA attributes
- Focus states are clearly defined
- Color contrast meets WCAG guidelines

## Migration Guide

### From Legacy CSS Classes
- `btn-organic` → `<Button variant="organic">`
- `btn-leaf` → `<Button variant="leaf">`
- `input-organic` → `<Input variant="organic">`
- `card-organic` → `<Card variant="organic">`

### Benefits of Component Library
1. **Consistency**: Unified design language across all pages
2. **Maintainability**: Single source of truth for styling
3. **Scalability**: Easy to add new variants and components
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Performance**: Optimized bundle size with tree-shaking
6. **Developer Experience**: IntelliSense and auto-completion

## Future Enhancements
- [ ] Add animation components
- [ ] Implement dark mode variants
- [ ] Create form validation components
- [ ] Add data visualization components
- [ ] Implement responsive breakpoint utilities
