# 04 - Spacing & Layout

> Guidelines for implementing Apple's spacing system, grid layouts, margins, and safe areas in AGENT.

## The 8-Point Grid System

Apple's design system is built on an 8-point grid, where all spacing values are multiples of 8 (or 4 for fine adjustments).

### Base Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-0` | 0px | No spacing |
| `space-1` | 4px | Tight spacing, icon padding |
| `space-2` | 8px | Default small spacing |
| `space-3` | 12px | Compact element spacing |
| `space-4` | 16px | Standard element spacing |
| `space-5` | 20px | Medium spacing |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large section spacing |
| `space-10` | 40px | Extra large spacing |
| `space-12` | 48px | Page section spacing |
| `space-16` | 64px | Major section breaks |

### CSS Variables

```css
:root {
  /* Spacing Scale */
  --space-0: 0px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Semantic Spacing */
  --spacing-xs: var(--space-1);   /* 4px */
  --spacing-sm: var(--space-2);   /* 8px */
  --spacing-md: var(--space-4);   /* 16px */
  --spacing-lg: var(--space-6);   /* 24px */
  --spacing-xl: var(--space-8);   /* 32px */
  --spacing-2xl: var(--space-12); /* 48px */
}
```

## Layout Margins

### Standard Margins by Device

| Device | Leading/Trailing Margin | Readable Width |
|--------|------------------------|----------------|
| iPhone SE | 16px | 288px |
| iPhone 14 | 16px | 358px |
| iPhone 14 Pro Max | 16px | 398px |
| iPad Portrait | 20px | Variable |
| iPad Landscape | 20px | Variable |
| Mac | 20px | Variable |

### Responsive Margins

```css
:root {
  /* Default margins */
  --margin-page: 16px;
  --margin-content: 16px;
  --margin-card: 16px;
}

/* Tablet and larger */
@media (min-width: 768px) {
  :root {
    --margin-page: 20px;
    --margin-content: 24px;
    --margin-card: 20px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  :root {
    --margin-page: 24px;
    --margin-content: 32px;
    --margin-card: 24px;
  }
}
```

## Safe Areas

### iPhone Safe Areas

The iPhone X and later have safe area insets for the notch and home indicator:

```
┌─────────────────────────────────┐
│         Status Bar (44pt)        │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │      Safe Area          │    │
│  │                         │    │
│  │                         │    │
│  │                         │    │
│  └─────────────────────────┘    │
│       Home Indicator (34pt)      │
└─────────────────────────────────┘

Top Safe Area:    44pt (with notch)
Bottom Safe Area: 34pt (home indicator)
Left/Right:       0pt (portrait), varies (landscape)
```

### CSS Safe Area Implementation

```css
/* Use env() for safe area insets */
.safe-area-container {
  padding-top: env(safe-area-inset-top, 0px);
  padding-right: env(safe-area-inset-right, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-left: env(safe-area-inset-left, 0px);
}

/* Navigation bar with safe area */
.navigation-bar {
  padding-top: calc(env(safe-area-inset-top, 0px) + 8px);
  min-height: calc(44px + env(safe-area-inset-top, 0px));
}

/* Tab bar with safe area */
.tab-bar {
  padding-bottom: env(safe-area-inset-bottom, 0px);
  min-height: calc(49px + env(safe-area-inset-bottom, 0px));
}

/* Full-bleed content */
.full-bleed {
  margin-left: calc(-1 * env(safe-area-inset-left, 0px));
  margin-right: calc(-1 * env(safe-area-inset-right, 0px));
  padding-left: env(safe-area-inset-left, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}
```

### Tailwind Safe Area Plugin

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 0px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-left': 'env(safe-area-inset-left, 0px)',
        'safe-right': 'env(safe-area-inset-right, 0px)',
      },
      padding: {
        'safe': 'env(safe-area-inset-top, 0px) env(safe-area-inset-right, 0px) env(safe-area-inset-bottom, 0px) env(safe-area-inset-left, 0px)',
      },
    },
  },
};
```

## Component Spacing

### Standard Component Dimensions

| Component | Height | Padding |
|-----------|--------|---------|
| Navigation Bar | 44px | 16px horizontal |
| Large Navigation Bar | 96px | 16px horizontal |
| Tab Bar | 49px | - |
| Toolbar | 44px | 16px horizontal |
| Search Bar | 36px | 8px vertical |
| Table Row | 44px minimum | 16px horizontal |
| Button (standard) | 44px | 16px horizontal |
| Button (small) | 32px | 12px horizontal |
| Text Field | 44px | 16px horizontal |

### Touch Targets

**Minimum touch target: 44×44 points**

```css
/* Ensure minimum touch target */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Icon button with proper touch target */
.icon-button {
  width: 44px;
  height: 44px;
  padding: 10px; /* (44 - 24) / 2 for 24px icon */
}

/* Small visual element with large touch target */
.small-toggle {
  position: relative;
  width: 24px;
  height: 24px;
}

.small-toggle::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -10px;
  right: -10px;
  bottom: -10px;
}
```

## Layout Patterns

### Three-Column Layout (AGENT Main View)

```tsx
// Based on screenshot: Sidebar | Main Content | Right Panel
const AppLayout = () => (
  <div className="flex h-screen">
    {/* Left Sidebar - Chat List */}
    <aside className="w-[280px] flex-shrink-0 border-r border-separator">
      <div className="p-4">
        {/* Sidebar content */}
      </div>
    </aside>
    
    {/* Main Content - Chat View */}
    <main className="flex-1 flex flex-col min-w-0">
      {/* Navigation bar */}
      <header className="h-11 border-b border-separator px-4 flex items-center">
        {/* Nav content */}
      </header>
      
      {/* Content area */}
      <div className="flex-1 overflow-auto p-4">
        {/* Messages */}
      </div>
      
      {/* Input area */}
      <footer className="border-t border-separator p-4">
        {/* Message input */}
      </footer>
    </main>
    
    {/* Right Panel - Projects */}
    <aside className="w-[300px] flex-shrink-0 border-l border-separator">
      <div className="p-4">
        {/* Projects content */}
      </div>
    </aside>
  </div>
);
```

### Responsive Breakpoints

```css
:root {
  /* Breakpoints (matching Apple device sizes) */
  --breakpoint-sm: 320px;   /* iPhone SE */
  --breakpoint-md: 390px;   /* iPhone 14 */
  --breakpoint-lg: 744px;   /* iPad Mini */
  --breakpoint-xl: 1024px;  /* iPad Pro */
  --breakpoint-2xl: 1280px; /* Desktop */
}
```

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'sm': '320px',
      'md': '390px',
      'lg': '744px',
      'xl': '1024px',
      '2xl': '1280px',
    },
  },
};
```

## Content Width

### Readable Content Width

For optimal readability, limit text content width:

```css
.readable-content {
  max-width: 672px; /* ~70 characters at 17px */
  margin-left: auto;
  margin-right: auto;
}

/* Chat messages */
.message-content {
  max-width: 80%; /* Relative to container */
}

/* Form fields */
.form-field {
  max-width: 400px;
}
```

## Grid System

### CSS Grid for Layouts

```css
/* Card grid */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  padding: var(--space-4);
}

/* Dashboard grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

/* Sidebar layout */
.sidebar-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100vh;
}

/* Three-panel layout */
.three-panel {
  display: grid;
  grid-template-columns: 280px 1fr 300px;
  height: 100vh;
}
```

## Spacing in AGENT Components

### Chat Message Spacing

```tsx
const ChatMessage = ({ message, isUser }) => (
  <div className={cn(
    "flex gap-3 px-4 py-2", // 12px gap, 16px horizontal, 8px vertical
    isUser ? "flex-row-reverse" : "flex-row"
  )}>
    {/* Avatar */}
    <Avatar className="w-8 h-8 flex-shrink-0" /> {/* 32px */}
    
    {/* Message bubble */}
    <div className={cn(
      "rounded-2xl px-4 py-2 max-w-[80%]", // 16px horizontal, 8px vertical
      isUser ? "bg-primary" : "bg-fill"
    )}>
      <p className="text-body">{message.content}</p>
      <span className="text-caption-2 text-label-tertiary mt-1 block">
        {message.time}
      </span>
    </div>
  </div>
);
```

### Sidebar Item Spacing

```tsx
const SidebarItem = ({ conversation, isActive }) => (
  <button className={cn(
    "w-full px-4 py-3 flex items-center gap-3", // 16px horizontal, 12px vertical, 12px gap
    "rounded-lg transition-colors",
    isActive ? "bg-fill" : "hover:bg-fill-secondary"
  )}>
    {/* Avatar */}
    <Avatar className="w-10 h-10 flex-shrink-0" /> {/* 40px */}
    
    {/* Content */}
    <div className="flex-1 min-w-0 text-left">
      <p className="text-headline truncate">{conversation.title}</p>
      <p className="text-subheadline text-label-secondary truncate">
        {conversation.lastMessage}
      </p>
    </div>
    
    {/* Metadata */}
    <div className="flex-shrink-0 text-right">
      <p className="text-caption-2 text-label-tertiary">
        {conversation.time}
      </p>
      {conversation.unread > 0 && (
        <Badge className="mt-1">{conversation.unread}</Badge>
      )}
    </div>
  </button>
);
```

## Best Practices

### Do's

- ✅ Use the 8-point grid consistently
- ✅ Respect safe area insets on all devices
- ✅ Maintain minimum 44×44pt touch targets
- ✅ Use consistent margins across screens
- ✅ Apply appropriate spacing for content density
- ✅ Test layouts on multiple device sizes

### Don'ts

- ❌ Use arbitrary spacing values (e.g., 13px, 27px)
- ❌ Ignore safe areas on notched devices
- ❌ Make touch targets smaller than 44pt
- ❌ Crowd elements without breathing room
- ❌ Use fixed widths that don't adapt
- ❌ Forget landscape orientation

---

*Next: [05-navigation.md](./05-navigation.md) - Navigation patterns and components*
