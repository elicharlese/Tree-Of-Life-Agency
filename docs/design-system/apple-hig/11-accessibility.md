# 11 - Accessibility

> Apple HIG guidelines for VoiceOver, Dynamic Type, and inclusive design in AGENT.

## Accessibility Philosophy

Apple's approach to accessibility:

1. **Universal Design**: Build for everyone from the start
2. **Assistive Technology**: Full support for VoiceOver, Switch Control, etc.
3. **Customization**: Respect user preferences
4. **Testing**: Verify with real assistive technologies

## VoiceOver Support

### Semantic HTML

Use proper HTML elements for their intended purpose:

```tsx
// ❌ Bad: Div as button
<div onClick={handleClick}>Click me</div>

// ✅ Good: Semantic button
<button onClick={handleClick}>Click me</button>

// ❌ Bad: Div as heading
<div className="text-2xl font-bold">Page Title</div>

// ✅ Good: Semantic heading
<h1 className="text-2xl font-bold">Page Title</h1>
```

### ARIA Labels

Provide accessible names for interactive elements:

```tsx
// Icon-only button
<button aria-label="Close dialog">
  <X className="w-5 h-5" />
</button>

// Button with additional context
<button aria-label="Delete conversation: Project Discussion">
  <Trash className="w-5 h-5" />
</button>

// Link with context
<a href="/settings" aria-label="Open settings">
  <Settings className="w-5 h-5" />
</a>
```

### ARIA Roles

Use roles when semantic HTML isn't sufficient:

```tsx
// Tab interface
<div role="tablist" aria-label="Message filters">
  <button
    role="tab"
    aria-selected={activeTab === 'all'}
    aria-controls="panel-all"
    id="tab-all"
  >
    All
  </button>
  <button
    role="tab"
    aria-selected={activeTab === 'unread'}
    aria-controls="panel-unread"
    id="tab-unread"
  >
    Unread
  </button>
</div>

<div
  role="tabpanel"
  id="panel-all"
  aria-labelledby="tab-all"
  hidden={activeTab !== 'all'}
>
  {/* Tab content */}
</div>
```

### Live Regions

Announce dynamic content changes:

```tsx
// Status messages
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  {statusMessage}
</div>

// Error messages
<div
  role="alert"
  aria-live="assertive"
>
  {errorMessage}
</div>

// Loading state
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? 'Loading messages...' : `${messages.length} messages`}
</div>
```

### Focus Management

Control focus for better navigation:

```tsx
// Modal focus trap
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocus.current?.focus();
    }
  }, [isOpen]);
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

// Skip link
const SkipLink = () => (
  <a
    href="#main-content"
    className={cn(
      "sr-only focus:not-sr-only",
      "fixed top-4 left-4 z-50",
      "bg-primary text-primary-foreground",
      "px-4 py-2 rounded-lg"
    )}
  >
    Skip to main content
  </a>
);
```

## Dynamic Type

### Supporting Text Scaling

```css
/* Use relative units */
.text-body {
  font-size: 1.0625rem; /* 17px base */
  line-height: 1.3;
}

/* Clamp for reasonable bounds */
.text-title {
  font-size: clamp(1.25rem, 2vw + 1rem, 2rem);
}

/* Respect user preferences */
@supports (font: -apple-system-body) {
  .dynamic-type {
    font: -apple-system-body;
  }
}
```

### React Implementation

```tsx
// Text component with Dynamic Type support
interface TextProps {
  variant: 'body' | 'headline' | 'title';
  children: React.ReactNode;
}

const Text = ({ variant, children }: TextProps) => {
  const styles = {
    body: 'text-[17px] leading-[22px]',
    headline: 'text-[17px] leading-[22px] font-semibold',
    title: 'text-[28px] leading-[34px]',
  };
  
  return (
    <span
      className={cn(
        styles[variant],
        // Allow text to scale with user preferences
        'text-[max(1em,var(--min-font-size,14px))]'
      )}
    >
      {children}
    </span>
  );
};
```

## Color Contrast

### Minimum Requirements

| Content Type | Minimum Ratio | Recommended |
|--------------|---------------|-------------|
| Body text | 4.5:1 | 7:1 |
| Large text (18pt+) | 3:1 | 4.5:1 |
| UI components | 3:1 | 4.5:1 |
| Non-text (icons) | 3:1 | 4.5:1 |

### Contrast Checker

```tsx
// Utility to check contrast
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

// Component with contrast validation
const AccessibleText = ({ color, background, children }) => {
  const ratio = getContrastRatio(color, background);
  const isAccessible = ratio >= 4.5;
  
  if (!isAccessible && process.env.NODE_ENV === 'development') {
    console.warn(`Low contrast ratio: ${ratio.toFixed(2)}:1`);
  }
  
  return <span style={{ color }}>{children}</span>;
};
```

### High Contrast Mode

```css
/* Support high contrast mode */
@media (prefers-contrast: high) {
  :root {
    --color-label: #000000;
    --color-background: #ffffff;
    --color-border: #000000;
  }
  
  .dark {
    --color-label: #ffffff;
    --color-background: #000000;
    --color-border: #ffffff;
  }
}
```

## Keyboard Navigation

### Focus Indicators

```css
/* Visible focus indicators */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Remove default outline only when using :focus-visible */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Keyboard Shortcuts

```tsx
// Keyboard shortcut hook
const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}
) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        !!e.ctrlKey === !!modifiers.ctrl &&
        !!e.shiftKey === !!modifiers.shift &&
        !!e.altKey === !!modifiers.alt &&
        !!e.metaKey === !!modifiers.meta
      ) {
        e.preventDefault();
        callback();
      }
    };
    
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]);
};

// Usage
const ChatApp = () => {
  useKeyboardShortcut('k', openSearch, { meta: true }); // Cmd+K
  useKeyboardShortcut('n', newChat, { meta: true }); // Cmd+N
  useKeyboardShortcut('Escape', closeModal);
  
  return <div>...</div>;
};
```

### Tab Order

```tsx
// Logical tab order
const Form = () => (
  <form>
    <input tabIndex={0} placeholder="First name" />
    <input tabIndex={0} placeholder="Last name" />
    <input tabIndex={0} placeholder="Email" />
    <button tabIndex={0} type="submit">Submit</button>
  </form>
);

// Skip decorative elements
const Decorative = () => (
  <div tabIndex={-1} aria-hidden="true">
    {/* Decorative content */}
  </div>
);
```

## Reduced Motion

```tsx
// Hook for reduced motion preference
const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReducedMotion;
};

// Conditional animation
const AnimatedComponent = ({ children }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <div
      className={cn(
        'transition-opacity',
        prefersReducedMotion ? 'duration-0' : 'duration-300'
      )}
    >
      {children}
    </div>
  );
};
```

## Screen Reader Utilities

### Visually Hidden

```css
/* Hide visually but keep accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Show on focus (for skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### Accessible Components

```tsx
// Accessible icon button
const IconButton = ({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="p-2 rounded-lg hover:bg-fill"
  >
    <Icon className="w-5 h-5" aria-hidden="true" />
    <span className="sr-only">{label}</span>
  </button>
);

// Accessible loading state
const LoadingButton = ({ isLoading, children, ...props }) => (
  <button
    {...props}
    aria-busy={isLoading}
    disabled={isLoading}
  >
    {isLoading ? (
      <>
        <Spinner className="w-4 h-4" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </>
    ) : (
      children
    )}
  </button>
);
```

## Testing Accessibility

### Automated Testing

```tsx
// Jest + Testing Library
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('Button is accessible', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('Form has proper labels', () => {
  render(<LoginForm />);
  expect(screen.getByLabelText('Email')).toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeInTheDocument();
});
```

### Manual Testing Checklist

- [ ] Navigate entire app with keyboard only
- [ ] Test with VoiceOver/NVDA/JAWS
- [ ] Verify focus indicators are visible
- [ ] Check color contrast ratios
- [ ] Test with 200% text zoom
- [ ] Verify reduced motion is respected
- [ ] Test with high contrast mode
- [ ] Verify all images have alt text
- [ ] Check form error announcements
- [ ] Test modal focus trapping

## Accessibility Checklist for AGENT

### Navigation

- [ ] Skip link to main content
- [ ] Logical heading hierarchy
- [ ] Keyboard-navigable menus
- [ ] Focus visible on all interactive elements

### Forms

- [ ] All inputs have labels
- [ ] Error messages are announced
- [ ] Required fields are indicated
- [ ] Form submission feedback

### Content

- [ ] Images have alt text
- [ ] Videos have captions
- [ ] Links have descriptive text
- [ ] Tables have headers

### Interactive Elements

- [ ] Buttons have accessible names
- [ ] Custom controls have ARIA
- [ ] Modals trap focus
- [ ] Tooltips are accessible

## Best Practices

### Do's

- ✅ Use semantic HTML elements
- ✅ Provide text alternatives for images
- ✅ Ensure keyboard accessibility
- ✅ Maintain sufficient color contrast
- ✅ Support Dynamic Type
- ✅ Test with assistive technologies

### Don'ts

- ❌ Rely on color alone for meaning
- ❌ Remove focus indicators
- ❌ Use placeholder as label
- ❌ Auto-play media with sound
- ❌ Create keyboard traps
- ❌ Use ARIA when HTML suffices

---

*Next: [12-iconography.md](./12-iconography.md) - SF Symbols and icon guidelines*
