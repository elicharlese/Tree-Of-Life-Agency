# Theming

Our design system supports comprehensive theming with automatic light/dark mode switching, custom theme extensions, and consistent semantic color mappings across all components.

## 🌙 Light and Dark Themes

The design system includes two built-in themes that automatically adapt based on user preference or manual selection.

### Light Theme

```css
:root {
  /* Background colors */
  --background: 0 0% 100%;
  --foreground: 110 25% 25%;

  /* Card surfaces */
  --card: 210 20% 98%;
  --card-foreground: 150 25% 20%;

  /* Interactive elements */
  --primary: 110 25% 49%;
  --primary-foreground: 0 0% 100%;
  --secondary: 110 15% 65%;
  --secondary-foreground: 150 25% 20%;

  /* Semantic colors */
  --muted: 110 10% 85%;
  --muted-foreground: 150 25% 45%;
  --accent: 110 20% 60%;
  --accent-foreground: 0 0% 100%;

  /* Status colors */
  --destructive: 354 69% 61%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 76% 50%;
  --warning: 48 96% 50%;

  /* UI elements */
  --border: 110 10% 90%;
  --input: 110 10% 95%;
  --ring: 110 25% 49%;

  /* Sidebar */
  --sidebar: 110 15% 97%;
  --sidebar-foreground: 110 25% 25%;
  --sidebar-primary: 110 25% 49%;
  --sidebar-accent: 110 15% 85%;
  --sidebar-border: 110 10% 90%;

  /* Charts */
  --chart-1: 110 25% 49%;
  --chart-2: 110 20% 60%;
  --chart-3: 110 15% 70%;
  --chart-4: 110 10% 80%;
  --chart-5: 110 30% 40%;
}
```

### Dark Theme

```css
.dark {
  /* Deep backgrounds for dark theme */
  --background: 110 25% 8%;
  --foreground: 110 15% 90%;

  /* Elevated surfaces */
  --card: 150 20% 12%;
  --card-foreground: 95 20% 90%;

  /* Brighter interactive elements */
  --primary: 110 35% 55%;
  --primary-foreground: 150 25% 8%;
  --secondary: 110 20% 50%;
  --secondary-foreground: 95 20% 90%;

  /* Muted elements */
  --muted: 150 15% 20%;
  --muted-foreground: 95 15% 65%;
  --accent: 110 25% 65%;
  --accent-foreground: 150 25% 8%;

  /* Status colors (brighter for dark) */
  --destructive: 354 75% 65%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 76% 60%;
  --warning: 48 96% 60%;

  /* Subtle borders */
  --border: 150 12% 24%;
  --input: 150 12% 24%;
  --ring: 110 35% 55%;

  /* Sidebar (darker) */
  --sidebar: 150 20% 12%;
  --sidebar-foreground: 95 20% 90%;
  --sidebar-primary: 150 40% 50%;
  --sidebar-accent: 150 15% 20%;
  --sidebar-border: 150 12% 24%;

  /* Charts (adjusted for dark) */
  --chart-1: 150 40% 50%;
  --chart-2: 190 40% 60%;
  --chart-3: 95 30% 55%;
  --chart-4: 354 75% 65%;
  --chart-5: 25 100% 80%;
}
```

## 🎨 Theme Implementation

### CSS Custom Properties

All theme values are defined as CSS custom properties (CSS variables) that automatically update when the theme changes.

```css
/* Usage in components */
.my-component {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  border: 1px solid hsl(var(--border));
}
```

### Theme Provider

The theme system is managed through a React context provider that handles theme switching and persistence.

```tsx
import { ThemeProvider } from '@/libs/shared-ui/src/app-components/theme-provider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ece-agent-theme">
      <YourApp />
    </ThemeProvider>
  );
}
```

### Theme Toggle Component

```tsx
import { ThemeToggle } from '@/libs/design-system';

function Header() {
  return (
    <header>
      <ThemeToggle />
    </header>
  );
}
```

## 🔧 Custom Theme Creation

### Extending Existing Themes

You can extend the built-in themes by overriding CSS variables:

```css
/* Custom theme overrides */
:root {
  --primary: 220 89% 56%; /* Custom blue primary */
  --border-radius: 0.75rem; /* Larger border radius */
}

.dark {
  --primary: 220 89% 66%; /* Brighter blue for dark mode */
}
```

### Creating New Themes

For completely custom themes, define all required CSS variables:

```css
/* Purple theme */
.purple-theme {
  --background: 270 20% 98%;
  --foreground: 270 10% 10%;
  --primary: 270 80% 55%;
  --primary-foreground: 0 0% 100%;
  /* ... define all variables */
}
```

### Theme Configuration

```tsx
// In your theme provider
<ThemeProvider
  themes={['light', 'dark', 'purple']}
  defaultTheme="system"
  storageKey="custom-theme"
>
  <App />
</ThemeProvider>
```

## 🎯 Semantic Color Usage

### Component Color Mapping

Components automatically use semantic colors that adapt to the current theme:

```tsx
// Button component automatically uses semantic colors
<Button variant="primary" /> // Uses --primary and --primary-foreground

// Card component
<Card /> // Uses --card and --card-foreground
```

### Status and Semantic Colors

```tsx
// Success states
<Badge variant="success" /> // Green in both themes

// Warning states
<Alert variant="warning" /> // Amber in both themes

// Error states
<Button variant="destructive" /> // Red in both themes
```

### AI and Human Indicators

```tsx
// AI-generated content
<div className="text-ai">AI Response</div> // Purple color

// Human-generated content
<div className="text-human">Human Response</div> // Blue color
```

## 🌈 Color Contrast and Accessibility

All themes are designed to meet WCAG 2.1 AA accessibility standards:

- **Minimum contrast ratio**: 4.5:1 for normal text, 3:1 for large text
- **Focus indicators**: High contrast focus rings
- **Interactive elements**: Clear visual states for hover, active, and focus

### Contrast Checking

```typescript
// Utility for checking contrast ratios
import { getContrastRatio } from '@/libs/design-system/utils';

const ratio = getContrastRatio('#6E9B68', '#FFFFFF'); // Primary on white
console.log(ratio); // Should be >= 4.5 for AA compliance
```

## 📱 Responsive Theming

Themes automatically adapt to different screen sizes and device capabilities:

### Breakpoint-Specific Overrides

```css
/* Mobile-specific theme adjustments */
@media (max-width: 768px) {
  :root {
    --border-radius: 0.5rem; /* Smaller radius on mobile */
  }
}
```

### High Contrast Mode

```css
/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --border: 0 0% 0%; /* Pure black borders */
    --background: 0 0% 100%; /* Pure white background */
  }
}
```

## 🔄 Theme Switching

### Automatic Theme Switching

The theme system supports automatic switching based on:

- **System preference**: `prefers-color-scheme` media query
- **User selection**: Manual theme toggle
- **Time-based**: Automatic switching (optional)

### Theme Persistence

```tsx
// Themes are automatically saved to localStorage
const theme = useTheme();
theme.setTheme('dark'); // Persists across sessions
```

### Smooth Transitions

All theme changes include smooth transitions:

```css
* {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
```

## 🛠️ Development Tools

### Theme Debugging

```tsx
// Development utility to show current theme values
import { useThemeDebug } from '@/libs/design-system/hooks';

function DevPanel() {
  const themeValues = useThemeDebug();

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded">
      <pre>{JSON.stringify(themeValues, null, 2)}</pre>
    </div>
  );
}
```

### Theme Validation

```typescript
// Validate theme completeness
import { validateTheme } from '@/libs/design-system/utils';

const isValid = validateTheme(customTheme);
// Returns true if all required CSS variables are defined
```

## 📋 Best Practices

### Theme Design

1. **Consistency**: Use the same color palette across themes
2. **Hierarchy**: Maintain clear visual hierarchy in both themes
3. **Accessibility**: Ensure sufficient contrast in all themes
4. **Performance**: Minimize theme-specific CSS for better performance

### Implementation

1. **CSS Variables**: Always use CSS custom properties for theming
2. **Semantic Naming**: Use purpose-based names, not appearance-based
3. **Fallbacks**: Provide fallbacks for unsupported CSS features
4. **Testing**: Test components in both light and dark themes

### Component Development

```tsx
// Good: Theme-aware component
function ThemedButton({ variant = 'primary' }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-md font-medium transition-colors',
        'bg-primary text-primary-foreground', // Uses CSS variables
        'hover:bg-primary/90' // Theme-aware hover state
      )}
    >
      Button
    </button>
  );
}

// Avoid: Hardcoded colors
function BadButton() {
  return (
    <button className="bg-blue-500 text-white hover:bg-blue-600">
      Button
    </button>
  );
}
```

## 🔮 Future Enhancements

- **Dynamic themes**: User-customizable color schemes
- **Theme presets**: Pre-built themes for different use cases
- **Advanced animations**: Smooth theme transitions with advanced effects
- **Theme inheritance**: Component-level theme overrides