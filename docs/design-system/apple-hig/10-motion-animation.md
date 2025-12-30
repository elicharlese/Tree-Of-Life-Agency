# 10 - Motion & Animation

> Apple HIG guidelines for transitions, micro-interactions, and haptic feedback in AGENT.

## Motion Philosophy

Apple's approach to motion:

1. **Purposeful**: Animation should communicate, not decorate
2. **Natural**: Motion should feel physical and intuitive
3. **Responsive**: Immediate feedback to user actions
4. **Subtle**: Enhance without distracting

## Animation Principles

### Timing Functions

| Easing | Usage | CSS Value |
|--------|-------|-----------|
| **Ease Out** | Elements entering | `cubic-bezier(0, 0, 0.2, 1)` |
| **Ease In** | Elements exiting | `cubic-bezier(0.4, 0, 1, 1)` |
| **Ease In Out** | Elements moving | `cubic-bezier(0.4, 0, 0.2, 1)` |
| **Spring** | Interactive elements | Custom spring physics |

### Duration Guidelines

| Duration | Usage |
|----------|-------|
| **100ms** | Micro-interactions (hover, focus) |
| **200ms** | Small transitions (fade, color) |
| **300ms** | Medium transitions (slide, scale) |
| **400ms** | Large transitions (page, modal) |
| **500ms+** | Complex animations (only when necessary) |

### CSS Variables

```css
:root {
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 400ms;
  
  /* Easings */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
```

## Common Animations

### Fade

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

.animate-fade-in {
  animation: fade-in var(--duration-fast) var(--ease-out);
}

.animate-fade-out {
  animation: fade-out var(--duration-fast) var(--ease-in);
}
```

### Scale

```css
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes scale-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.animate-scale-in {
  animation: scale-in var(--duration-normal) var(--ease-out);
}

.animate-scale-out {
  animation: scale-out var(--duration-fast) var(--ease-in);
}
```

### Slide

```css
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-in-right {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slide-in-left {
  from {
    opacity: 0;
    transform: translateX(-16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Sheet slide from bottom */
@keyframes sheet-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.animate-slide-up { animation: slide-up var(--duration-normal) var(--ease-out); }
.animate-slide-down { animation: slide-down var(--duration-normal) var(--ease-out); }
.animate-slide-in-right { animation: slide-in-right var(--duration-normal) var(--ease-out); }
.animate-slide-in-left { animation: slide-in-left var(--duration-normal) var(--ease-out); }
.animate-sheet-up { animation: sheet-up var(--duration-normal) var(--ease-out); }
```

### Spin

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
```

### Pulse

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

## Micro-Interactions

### Button Press

```tsx
const Button = ({ children, ...props }) => (
  <button
    className={cn(
      "transition-transform duration-100",
      "active:scale-[0.98]"
    )}
    {...props}
  >
    {children}
  </button>
);
```

### Hover Effects

```tsx
// Card hover
const Card = ({ children }) => (
  <div
    className={cn(
      "transition-all duration-200",
      "hover:shadow-lg hover:-translate-y-0.5"
    )}
  >
    {children}
  </div>
);

// List item hover
const ListItem = ({ children }) => (
  <div
    className={cn(
      "transition-colors duration-100",
      "hover:bg-fill-secondary"
    )}
  >
    {children}
  </div>
);
```

### Focus States

```tsx
const Input = (props) => (
  <input
    className={cn(
      "transition-all duration-200",
      "focus:ring-2 focus:ring-primary focus:ring-offset-2",
      "focus:outline-none"
    )}
    {...props}
  />
);
```

### Toggle Animation

```tsx
const Toggle = ({ checked, onChange }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "relative w-[51px] h-[31px] rounded-full",
      "transition-colors duration-200",
      checked ? "bg-primary" : "bg-fill"
    )}
  >
    <span
      className={cn(
        "absolute top-[2px] w-[27px] h-[27px]",
        "bg-white rounded-full shadow-md",
        "transition-transform duration-200 ease-spring",
        checked ? "translate-x-[22px]" : "translate-x-[2px]"
      )}
    />
  </button>
);
```

## Page Transitions

### Navigation Transitions

```tsx
// Slide transition for navigation
const PageTransition = ({ children, direction = 'forward' }) => (
  <motion.div
    initial={{
      opacity: 0,
      x: direction === 'forward' ? 20 : -20,
    }}
    animate={{
      opacity: 1,
      x: 0,
    }}
    exit={{
      opacity: 0,
      x: direction === 'forward' ? -20 : 20,
    }}
    transition={{
      duration: 0.3,
      ease: [0, 0, 0.2, 1],
    }}
  >
    {children}
  </motion.div>
);
```

### Modal Transitions

```tsx
// Modal backdrop
const Backdrop = ({ isVisible }) => (
  <div
    className={cn(
      "fixed inset-0 bg-black/40",
      "transition-opacity duration-200",
      isVisible ? "opacity-100" : "opacity-0"
    )}
  />
);

// Modal content
const ModalContent = ({ isVisible, children }) => (
  <div
    className={cn(
      "transition-all duration-300",
      isVisible
        ? "opacity-100 scale-100"
        : "opacity-0 scale-95"
    )}
  >
    {children}
  </div>
);
```

## Staggered Animations

### List Stagger

```tsx
const StaggeredList = ({ items }) => (
  <div className="space-y-2">
    {items.map((item, index) => (
      <div
        key={item.id}
        className="animate-slide-up"
        style={{
          animationDelay: `${index * 50}ms`,
          animationFillMode: 'backwards',
        }}
      >
        {item.content}
      </div>
    ))}
  </div>
);
```

### Grid Stagger

```tsx
const StaggeredGrid = ({ items }) => (
  <div className="grid grid-cols-3 gap-4">
    {items.map((item, index) => (
      <div
        key={item.id}
        className="animate-scale-in"
        style={{
          animationDelay: `${index * 30}ms`,
          animationFillMode: 'backwards',
        }}
      >
        {item.content}
      </div>
    ))}
  </div>
);
```

## Haptic Feedback

### Haptic Types (iOS)

| Type | Usage |
|------|-------|
| **Light** | Subtle feedback, selections |
| **Medium** | Standard interactions |
| **Heavy** | Significant actions |
| **Success** | Successful completion |
| **Warning** | Caution needed |
| **Error** | Action failed |

### Haptic Hook

```tsx
const useHaptic = () => {
  const trigger = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') => {
    // Check if Haptic Feedback API is available
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        warning: [20, 50, 20],
        error: [30, 50, 30, 50, 30],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);
  
  return { trigger };
};

// Usage
const Button = ({ onClick, children }) => {
  const { trigger } = useHaptic();
  
  return (
    <button
      onClick={() => {
        trigger('light');
        onClick();
      }}
    >
      {children}
    </button>
  );
};
```

## Reduced Motion

### Respecting User Preferences

```css
/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### React Hook

```tsx
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

// Usage
const AnimatedComponent = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  
  return (
    <div
      className={cn(
        prefersReducedMotion
          ? "opacity-100"
          : "animate-fade-in"
      )}
    >
      Content
    </div>
  );
};
```

## Tailwind Animation Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-in',
        'scale-in': 'scale-in 300ms ease-out',
        'scale-out': 'scale-out 200ms ease-in',
        'slide-up': 'slide-up 300ms ease-out',
        'slide-down': 'slide-down 300ms ease-out',
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'slide-in-left': 'slide-in-left 300ms ease-out',
        'sheet-up': 'sheet-up 300ms ease-out',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-16px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'sheet-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },
    },
  },
};
```

## Best Practices

### Do's

- ✅ Use animation to communicate state changes
- ✅ Keep animations under 400ms
- ✅ Use appropriate easing for enter/exit
- ✅ Respect reduced motion preferences
- ✅ Provide haptic feedback for significant actions
- ✅ Stagger list animations for visual interest

### Don'ts

- ❌ Animate for decoration only
- ❌ Use long, complex animations
- ❌ Block user interaction during animation
- ❌ Use jarring or sudden movements
- ❌ Ignore accessibility preferences
- ❌ Overuse animation

---

*Next: [11-accessibility.md](./11-accessibility.md) - VoiceOver and inclusive design*
