# 03 - Typography

> Complete guide to implementing Apple's SF Pro typography system for AGENT's UI redesign.

## San Francisco Font Family

Apple's San Francisco (SF) is designed specifically for digital interfaces with optimal legibility across all sizes and devices.

### Font Variants

| Variant | Usage | Size Range |
|---------|-------|------------|
| **SF Pro Display** | Large headings, titles | 20pt and above |
| **SF Pro Text** | Body text, UI elements | Below 20pt |
| **SF Pro Rounded** | Friendly, approachable UI | Any size |
| **SF Mono** | Code, technical content | Any size |

### Optical Sizing

SF Pro automatically adjusts letter spacing and weight based on size:

- **Small sizes (< 20pt)**: Wider letter spacing for legibility
- **Large sizes (≥ 20pt)**: Tighter letter spacing for visual appeal

## Type Scale

### iOS Standard Text Styles

| Style | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| Large Title | 34pt | Regular | 41pt | 0.37pt |
| Title 1 | 28pt | Regular | 34pt | 0.36pt |
| Title 2 | 22pt | Regular | 28pt | 0.35pt |
| Title 3 | 20pt | Regular | 24pt | 0.38pt |
| Headline | 17pt | Semibold | 22pt | -0.41pt |
| Body | 17pt | Regular | 22pt | -0.41pt |
| Callout | 16pt | Regular | 21pt | -0.32pt |
| Subheadline | 15pt | Regular | 20pt | -0.24pt |
| Footnote | 13pt | Regular | 18pt | -0.08pt |
| Caption 1 | 12pt | Regular | 16pt | 0pt |
| Caption 2 | 11pt | Regular | 13pt | 0.07pt |

### CSS Implementation

```css
:root {
  /* Font Families */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont,
                'Helvetica Neue', Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco,
                'Cascadia Code', monospace;
  
  /* Type Scale */
  --text-large-title: 34px;
  --text-title-1: 28px;
  --text-title-2: 22px;
  --text-title-3: 20px;
  --text-headline: 17px;
  --text-body: 17px;
  --text-callout: 16px;
  --text-subheadline: 15px;
  --text-footnote: 13px;
  --text-caption-1: 12px;
  --text-caption-2: 11px;
  
  /* Line Heights */
  --leading-large-title: 41px;
  --leading-title-1: 34px;
  --leading-title-2: 28px;
  --leading-title-3: 24px;
  --leading-headline: 22px;
  --leading-body: 22px;
  --leading-callout: 21px;
  --leading-subheadline: 20px;
  --leading-footnote: 18px;
  --leading-caption-1: 16px;
  --leading-caption-2: 13px;
  
  /* Font Weights */
  --font-ultralight: 100;
  --font-thin: 200;
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-heavy: 800;
  --font-black: 900;
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'SF Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Cascadia Code',
          'monospace',
        ],
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '41px', letterSpacing: '0.37px' }],
        'title-1': ['28px', { lineHeight: '34px', letterSpacing: '0.36px' }],
        'title-2': ['22px', { lineHeight: '28px', letterSpacing: '0.35px' }],
        'title-3': ['20px', { lineHeight: '24px', letterSpacing: '0.38px' }],
        'headline': ['17px', { lineHeight: '22px', letterSpacing: '-0.41px', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '22px', letterSpacing: '-0.41px' }],
        'callout': ['16px', { lineHeight: '21px', letterSpacing: '-0.32px' }],
        'subheadline': ['15px', { lineHeight: '20px', letterSpacing: '-0.24px' }],
        'footnote': ['13px', { lineHeight: '18px', letterSpacing: '-0.08px' }],
        'caption-1': ['12px', { lineHeight: '16px', letterSpacing: '0px' }],
        'caption-2': ['11px', { lineHeight: '13px', letterSpacing: '0.07px' }],
      },
    },
  },
};
```

## Typography Components

### Text Component

```tsx
import { cn } from '@/utils/cn';

type TextVariant = 
  | 'largeTitle' 
  | 'title1' 
  | 'title2' 
  | 'title3'
  | 'headline'
  | 'body'
  | 'callout'
  | 'subheadline'
  | 'footnote'
  | 'caption1'
  | 'caption2';

interface TextProps {
  variant?: TextVariant;
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary';
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const variantStyles: Record<TextVariant, string> = {
  largeTitle: 'text-large-title',
  title1: 'text-title-1',
  title2: 'text-title-2',
  title3: 'text-title-3',
  headline: 'text-headline font-semibold',
  body: 'text-body',
  callout: 'text-callout',
  subheadline: 'text-subheadline',
  footnote: 'text-footnote',
  caption1: 'text-caption-1',
  caption2: 'text-caption-2',
};

const colorStyles = {
  primary: 'text-label',
  secondary: 'text-label-secondary',
  tertiary: 'text-label-tertiary',
  quaternary: 'text-label-quaternary',
};

const weightStyles = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export function Text({
  variant = 'body',
  weight = 'regular',
  color = 'primary',
  children,
  className,
  as: Component = 'span',
}: TextProps) {
  return (
    <Component
      className={cn(
        variantStyles[variant],
        colorStyles[color],
        variant !== 'headline' && weightStyles[weight],
        className
      )}
    >
      {children}
    </Component>
  );
}
```

### Usage Examples

```tsx
// Page title
<Text variant="largeTitle" as="h1">
  Messages
</Text>

// Section heading
<Text variant="title2" as="h2">
  Recent Conversations
</Text>

// Body text
<Text variant="body">
  Start a new conversation or select an existing one.
</Text>

// Secondary information
<Text variant="footnote" color="secondary">
  Last updated 5 minutes ago
</Text>

// Metadata
<Text variant="caption2" color="tertiary">
  3 participants
</Text>
```

## Dynamic Type Support

### Accessibility Scaling

Support users who adjust text size in system settings:

```css
/* Base styles with relative units */
.text-body {
  font-size: 1.0625rem; /* 17px base */
  line-height: 1.375rem; /* 22px */
}

/* Respect user's preferred text size */
@media (prefers-reduced-motion: no-preference) {
  html {
    font-size: clamp(14px, 1rem + 0.5vw, 18px);
  }
}

/* Support for iOS Dynamic Type via CSS */
@supports (font: -apple-system-body) {
  .dynamic-type {
    font: -apple-system-body;
  }
}
```

### React Implementation

```tsx
// Hook for Dynamic Type support
function useDynamicType() {
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    // Check for user's text size preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    // In a real implementation, you'd detect iOS text size settings
    // This is a simplified version for web
    const updateScale = () => {
      const rootFontSize = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      setScale(rootFontSize / 16);
    };
    
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  
  return scale;
}
```

## Text Hierarchy in AGENT

### Chat Interface

```tsx
// Message bubble
<div className="message-bubble">
  {/* Sender name - Headline style */}
  <Text variant="headline" color="primary">
    {sender.name}
  </Text>
  
  {/* Message content - Body style */}
  <Text variant="body">
    {message.content}
  </Text>
  
  {/* Timestamp - Caption style */}
  <Text variant="caption2" color="tertiary">
    {formatTime(message.timestamp)}
  </Text>
</div>
```

### Sidebar Navigation

```tsx
// Sidebar section
<nav className="sidebar">
  {/* Section header */}
  <Text variant="footnote" color="secondary" className="uppercase tracking-wide">
    Conversations
  </Text>
  
  {/* Conversation item */}
  <div className="conversation-item">
    <Text variant="headline">
      {conversation.title}
    </Text>
    <Text variant="subheadline" color="secondary">
      {conversation.lastMessage}
    </Text>
  </div>
</nav>
```

### Empty States

```tsx
// Empty state
<div className="empty-state text-center">
  <Text variant="title2" as="h2">
    No conversation selected
  </Text>
  <Text variant="body" color="secondary">
    Select a conversation from the left, or start a new one to begin chatting.
  </Text>
</div>
```

## Best Practices

### Do's

- ✅ Use semantic text styles (headline, body, caption) not arbitrary sizes
- ✅ Maintain consistent hierarchy across screens
- ✅ Support Dynamic Type for accessibility
- ✅ Use appropriate weights for emphasis (semibold for headlines)
- ✅ Apply negative letter spacing for body text sizes
- ✅ Test readability at various sizes

### Don'ts

- ❌ Use more than 2-3 font sizes per screen
- ❌ Mix font families arbitrarily
- ❌ Use light weights for body text (poor legibility)
- ❌ Set text smaller than 11pt (Caption 2)
- ❌ Ignore line height specifications
- ❌ Use justified text alignment (causes uneven spacing)

## Monospace Typography

For code and technical content:

```css
.code-block {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 18px;
  letter-spacing: 0;
  tab-size: 2;
}

.inline-code {
  font-family: var(--font-mono);
  font-size: 0.9em; /* Slightly smaller than surrounding text */
  background: var(--color-fill-tertiary);
  padding: 0.125em 0.25em;
  border-radius: 4px;
}
```

## AGENT Typography Tokens

```css
:root {
  /* Application-specific text styles */
  
  /* Chat */
  --text-chat-message: var(--text-body);
  --text-chat-sender: var(--text-headline);
  --text-chat-timestamp: var(--text-caption-2);
  
  /* Navigation */
  --text-nav-title: var(--text-headline);
  --text-nav-subtitle: var(--text-subheadline);
  --text-nav-badge: var(--text-caption-1);
  
  /* Forms */
  --text-input: var(--text-body);
  --text-label: var(--text-subheadline);
  --text-placeholder: var(--text-body);
  --text-helper: var(--text-footnote);
  --text-error: var(--text-footnote);
  
  /* Buttons */
  --text-button-large: var(--text-headline);
  --text-button-medium: var(--text-body);
  --text-button-small: var(--text-subheadline);
}
```

---

*Next: [04-spacing-layout.md](./04-spacing-layout.md) - Grid systems and safe areas*
