# Lockups

> A lockup is a standardized arrangement of a symbol or image with text that creates a unified, recognizable element.

## Overview

Lockups combine visual and textual elements into cohesive units that communicate information efficiently. In AGENT, lockups are used for:

- **User profiles** - Avatar + name + status
- **Chat items** - Icon + title + preview
- **Agent cards** - Symbol + name + description
- **File items** - Icon + filename + metadata
- **Notification items** - Icon + title + message

## Apple HIG Principles

### 1. Visual Hierarchy

The arrangement should guide the eye naturally:

```
┌─────────────────────────────────────────┐
│  ┌───┐                                  │
│  │ ● │  Primary Text (Title)            │
│  │   │  Secondary Text (Subtitle)       │
│  └───┘                                  │
└─────────────────────────────────────────┘
```

### 2. Consistent Spacing

Use the 8pt grid system for all spacing:

```css
/* Lockup spacing tokens */
--lockup-gap-sm: 8px;      /* Between icon and text */
--lockup-gap-md: 12px;     /* Standard gap */
--lockup-gap-lg: 16px;     /* Large lockups */
--lockup-padding: 12px;    /* Internal padding */
```

### 3. Proportional Sizing

Icons and text should be proportionally sized:

| Lockup Size | Icon Size | Title Size | Subtitle Size |
|-------------|-----------|------------|---------------|
| Small       | 24×24     | 13pt       | 11pt          |
| Medium      | 32×32     | 15pt       | 13pt          |
| Large       | 44×44     | 17pt       | 15pt          |
| Extra Large | 56×56     | 20pt       | 17pt          |

## AGENT Implementation

### Base Lockup Component

```tsx
// Apple HIG Lockup Component
interface LockupProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'prominent' | 'minimal';
}

const Lockup: React.FC<LockupProps> = ({
  icon,
  title,
  subtitle,
  trailing,
  size = 'md',
  variant = 'default',
}) => {
  const sizeClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-5',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-11 w-11',
    xl: 'h-14 w-14',
  };

  const titleSizes = {
    sm: 'text-[13px]',
    md: 'text-[15px]',
    lg: 'text-[17px]',
    xl: 'text-[20px]',
  };

  const subtitleSizes = {
    sm: 'text-[11px]',
    md: 'text-[13px]',
    lg: 'text-[15px]',
    xl: 'text-[17px]',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      {/* Icon Container */}
      <div className={`${iconSizes[size]} flex-shrink-0 flex items-center justify-center`}>
        {icon}
      </div>
      
      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <p className={`${titleSizes[size]} font-medium text-gray-900 dark:text-gray-100 truncate`}>
          {title}
        </p>
        {subtitle && (
          <p className={`${subtitleSizes[size]} text-gray-500 dark:text-gray-400 truncate`}>
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Trailing Content */}
      {trailing && (
        <div className="flex-shrink-0">
          {trailing}
        </div>
      )}
    </div>
  );
};
```

### CSS Classes

```css
/* Apple HIG: Lockup Container */
.agent-lockup {
  @apply flex items-center;
  @apply gap-3;
}

/* Apple HIG: Lockup Icon */
.agent-lockup-icon {
  @apply flex-shrink-0;
  @apply flex items-center justify-center;
  @apply rounded-[10px];
}

.agent-lockup-icon-sm { @apply h-6 w-6; }
.agent-lockup-icon-md { @apply h-8 w-8; }
.agent-lockup-icon-lg { @apply h-11 w-11; }
.agent-lockup-icon-xl { @apply h-14 w-14; }

/* Apple HIG: Lockup Text */
.agent-lockup-text {
  @apply flex-1 min-w-0;
}

.agent-lockup-title {
  @apply font-medium;
  @apply text-gray-900 dark:text-gray-100;
  @apply truncate;
}

.agent-lockup-subtitle {
  @apply text-gray-500 dark:text-gray-400;
  @apply truncate;
}

/* Apple HIG: Lockup Trailing */
.agent-lockup-trailing {
  @apply flex-shrink-0;
  @apply flex items-center;
}
```

## Lockup Variants

### 1. User Lockup

For displaying user information:

```tsx
<div className="agent-lockup">
  <div className="agent-lockup-icon-lg rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
    <span className="text-white text-sm font-semibold">JD</span>
  </div>
  <div className="agent-lockup-text">
    <p className="agent-lockup-title text-[15px]">John Doe</p>
    <p className="agent-lockup-subtitle text-[13px]">Online</p>
  </div>
  <div className="agent-lockup-trailing">
    <div className="h-2 w-2 rounded-full bg-green-500" />
  </div>
</div>
```

### 2. Chat Lockup

For conversation list items:

```tsx
<div className="agent-lockup p-3 rounded-[12px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
  <div className="agent-lockup-icon-lg rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
    <MessageSquare className="h-5 w-5 text-white" />
  </div>
  <div className="agent-lockup-text">
    <div className="flex items-center justify-between">
      <p className="agent-lockup-title text-[15px]">Project Discussion</p>
      <span className="text-[11px] text-gray-400">2m ago</span>
    </div>
    <p className="agent-lockup-subtitle text-[13px]">Latest message preview...</p>
  </div>
</div>
```

### 3. Agent Lockup

For AI agent cards:

```tsx
<div className="agent-lockup p-4 rounded-[14px] bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-black/5 dark:border-white/10">
  <div className="agent-lockup-icon-xl rounded-[12px] bg-gradient-to-br from-violet-500 to-purple-600 shadow-sm">
    <Bot className="h-7 w-7 text-white" />
  </div>
  <div className="agent-lockup-text">
    <p className="agent-lockup-title text-[17px]">Research Assistant</p>
    <p className="agent-lockup-subtitle text-[15px]">Helps with research and analysis</p>
  </div>
  <div className="agent-lockup-trailing">
    <ChevronRight className="h-5 w-5 text-gray-400" />
  </div>
</div>
```

### 4. File Lockup

For file/document items:

```tsx
<div className="agent-lockup p-2 rounded-[8px] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
  <div className="agent-lockup-icon-md rounded-[6px] bg-blue-100 dark:bg-blue-900/30">
    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  </div>
  <div className="agent-lockup-text">
    <p className="agent-lockup-title text-[13px]">document.pdf</p>
    <p className="agent-lockup-subtitle text-[11px]">2.4 MB • Modified today</p>
  </div>
</div>
```

## Accessibility

### VoiceOver Support

```tsx
<div 
  className="agent-lockup"
  role="listitem"
  aria-label={`${title}, ${subtitle}`}
>
  {/* ... */}
</div>
```

### Focus States

```css
.agent-lockup:focus-visible {
  @apply outline-none;
  @apply ring-2 ring-ring ring-offset-2;
  @apply rounded-[12px];
}
```

## Best Practices

1. **Maintain Alignment** - Keep icons and text vertically centered
2. **Use Truncation** - Prevent text overflow with ellipsis
3. **Consistent Sizing** - Use predefined size variants
4. **Touch Targets** - Ensure minimum 44×44pt for interactive lockups
5. **Visual Balance** - Icon weight should match text weight
6. **Semantic Colors** - Use appropriate colors for status indicators

## Related Components

- [Outline Views](./15-outline-views.md) - Hierarchical list structures
- [Boxes](./16-boxes.md) - Content containers
- [Content Containers](./07-content-containers.md) - Cards and lists

---

*Based on Apple HIG Lockups: https://developer.apple.com/design/human-interface-guidelines/lockups*
