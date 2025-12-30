# 12 - Iconography

> Apple HIG guidelines for SF Symbols, app icons, and custom icons in AGENT.

## SF Symbols

SF Symbols is Apple's icon library with 5,000+ symbols designed to integrate seamlessly with San Francisco font.

### Symbol Categories

| Category | Examples | Usage |
|----------|----------|-------|
| **Communication** | message, phone, envelope | Messaging, contacts |
| **Weather** | sun, cloud, rain | Weather, conditions |
| **Objects** | folder, doc, trash | Files, documents |
| **Devices** | iphone, laptop, tv | Device references |
| **Connectivity** | wifi, bluetooth, antenna | Network status |
| **Transportation** | car, airplane, bicycle | Travel, maps |
| **Human** | person, hand, figure | Users, gestures |
| **Nature** | leaf, flame, drop | Environment |
| **Editing** | pencil, scissors, paintbrush | Creation tools |
| **Media** | play, pause, speaker | Playback controls |

### Symbol Weights

SF Symbols support 9 weights matching SF Pro:

```tsx
// Weight options
type SymbolWeight = 
  | 'ultralight'
  | 'thin'
  | 'light'
  | 'regular'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'heavy'
  | 'black';

// Usage with Lucide (SF Symbol-compatible)
<MessageSquare strokeWidth={1.5} /> // Regular
<MessageSquare strokeWidth={2} />   // Semibold
<MessageSquare strokeWidth={2.5} /> // Bold
```

### Symbol Scales

Three scales for different contexts:

| Scale | Usage | Size Adjustment |
|-------|-------|-----------------|
| **Small** | Compact UI, dense lists | -20% |
| **Medium** | Default, most contexts | Baseline |
| **Large** | Emphasis, touch targets | +20% |

### Rendering Modes

| Mode | Description | Usage |
|------|-------------|-------|
| **Monochrome** | Single color | Standard UI |
| **Hierarchical** | Primary + secondary opacity | Depth emphasis |
| **Palette** | Custom multi-color | Brand customization |
| **Multicolor** | Full color (preset) | Realistic representation |

## Icon Component

```tsx
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'destructive';
  className?: string;
}

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

const iconColors = {
  primary: 'text-label',
  secondary: 'text-label-secondary',
  tertiary: 'text-label-tertiary',
  accent: 'text-primary',
  destructive: 'text-red',
};

const Icon = ({
  icon: IconComponent,
  size = 'md',
  color = 'primary',
  className,
}: IconProps) => (
  <IconComponent
    className={cn(
      iconSizes[size],
      iconColors[color],
      className
    )}
    aria-hidden="true"
  />
);
```

## Icon Usage Guidelines

### Navigation Icons

```tsx
// Tab bar icons - 25pt, medium weight
const TabBarIcon = ({ icon: Icon, isActive }) => (
  <Icon
    className={cn(
      'w-[25px] h-[25px]',
      isActive ? 'text-primary' : 'text-label-secondary'
    )}
    strokeWidth={isActive ? 2 : 1.5}
  />
);

// Navigation bar icons - 22pt
const NavBarIcon = ({ icon: Icon }) => (
  <Icon className="w-[22px] h-[22px] text-primary" />
);

// Toolbar icons - 22pt
const ToolbarIcon = ({ icon: Icon }) => (
  <Icon className="w-[22px] h-[22px] text-label" />
);
```

### List Icons

```tsx
// List item leading icon - 24pt
const ListIcon = ({ icon: Icon, color = 'primary' }) => (
  <div className={cn(
    'w-7 h-7 rounded-md flex items-center justify-center',
    `bg-${color}/10`
  )}>
    <Icon className={`w-4 h-4 text-${color}`} />
  </div>
);

// Settings list icon with background
const SettingsIcon = ({ icon: Icon, bgColor }) => (
  <div className={cn(
    'w-7 h-7 rounded-md flex items-center justify-center',
    bgColor
  )}>
    <Icon className="w-4 h-4 text-white" />
  </div>
);
```

### Button Icons

```tsx
// Icon with text
<Button>
  <Plus className="w-4 h-4 mr-2" />
  New Chat
</Button>

// Icon only (must have aria-label)
<Button variant="ghost" size="icon" aria-label="Settings">
  <Settings className="w-5 h-5" />
</Button>

// Trailing icon
<Button>
  Continue
  <ChevronRight className="w-4 h-4 ml-2" />
</Button>
```

## App Icons

### App Icon Sizes

| Context | Size (pt) | Size (px @1x) | Size (px @2x) | Size (px @3x) |
|---------|-----------|---------------|---------------|---------------|
| App Store | 1024 | 1024 | - | - |
| iPhone App | 60 | 60 | 120 | 180 |
| iPad App | 76 | 76 | 152 | - |
| iPad Pro App | 83.5 | 83.5 | 167 | - |
| Spotlight | 40 | 40 | 80 | 120 |
| Settings | 29 | 29 | 58 | 87 |
| Notification | 20 | 20 | 40 | 60 |

### App Icon Guidelines

```
┌─────────────────────────────────┐
│                                 │
│    ┌───────────────────┐        │
│    │                   │        │
│    │   Icon Content    │        │
│    │   (Safe Area)     │        │
│    │                   │        │
│    └───────────────────┘        │
│                                 │
└─────────────────────────────────┘

- Use simple, recognizable imagery
- Avoid text (doesn't scale well)
- Use a single focal point
- Maintain visual weight balance
- Design for the rounded rectangle mask
```

### App Icon Component (Web)

```tsx
interface AppIconProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const appIconSizes = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const AppIcon = ({ src, alt, size = 'md' }: AppIconProps) => (
  <img
    src={src}
    alt={alt}
    className={cn(
      appIconSizes[size],
      'rounded-[22%]', // iOS app icon radius
      'shadow-sm'
    )}
  />
);
```

## Custom Icons

### Design Guidelines

When creating custom icons:

1. **Grid**: Use a 24×24pt grid with 2pt padding
2. **Stroke**: 1.5-2pt stroke width for consistency
3. **Corners**: 2pt corner radius for rounded elements
4. **Alignment**: Align to pixel grid for crisp rendering
5. **Optical Balance**: Adjust for visual weight, not mathematical center

### Custom Icon Template

```tsx
// Custom icon following SF Symbol conventions
const CustomIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Icon paths */}
  </svg>
);
```

### Icon Sprite

```tsx
// Icon sprite for performance
const IconSprite = () => (
  <svg style={{ display: 'none' }}>
    <symbol id="icon-chat" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </symbol>
    <symbol id="icon-settings" viewBox="0 0 24 24">
      {/* Settings icon paths */}
    </symbol>
  </svg>
);

// Usage
const SpriteIcon = ({ name, className }) => (
  <svg className={className}>
    <use href={`#icon-${name}`} />
  </svg>
);
```

## Icon States

### Interactive States

```tsx
// Icon button with states
const IconButton = ({ icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'p-2 rounded-lg',
      'text-label-secondary',
      'hover:text-label hover:bg-fill-secondary',
      'active:bg-fill',
      'focus:outline-none focus:ring-2 focus:ring-primary',
      'disabled:opacity-50 disabled:pointer-events-none',
      'transition-colors duration-100'
    )}
  >
    <Icon className="w-5 h-5" />
  </button>
);
```

### Selected State

```tsx
// Tab bar with selected state
const TabBarItem = ({ icon: Icon, label, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 min-w-[64px]"
  >
    <Icon
      className={cn(
        'w-6 h-6 transition-colors',
        isSelected ? 'text-primary' : 'text-label-secondary'
      )}
      fill={isSelected ? 'currentColor' : 'none'}
    />
    <span
      className={cn(
        'text-caption-2',
        isSelected ? 'text-primary' : 'text-label-secondary'
      )}
    >
      {label}
    </span>
  </button>
);
```

## AGENT Icon Mapping

Map common actions to appropriate icons:

```tsx
const AGENT_ICONS = {
  // Navigation
  home: Home,
  messages: MessageSquare,
  projects: Folder,
  settings: Settings,
  profile: User,
  
  // Actions
  newChat: Plus,
  send: Send,
  attach: Paperclip,
  search: Search,
  filter: Filter,
  sort: ArrowUpDown,
  
  // Status
  online: Circle,
  typing: MoreHorizontal,
  delivered: Check,
  read: CheckCheck,
  error: AlertCircle,
  
  // AI
  ai: Sparkles,
  thinking: Brain,
  generating: Loader,
  
  // Media
  image: Image,
  video: Video,
  audio: Mic,
  file: FileText,
  
  // Editing
  edit: Pencil,
  delete: Trash,
  copy: Copy,
  share: Share,
  
  // Navigation
  back: ChevronLeft,
  forward: ChevronRight,
  up: ChevronUp,
  down: ChevronDown,
  close: X,
  menu: Menu,
};
```

## Best Practices

### Do's

- ✅ Use SF Symbols or SF Symbol-compatible icons
- ✅ Match icon weight to surrounding text
- ✅ Provide accessible labels for icon-only buttons
- ✅ Use consistent icon sizes within contexts
- ✅ Apply appropriate colors for states
- ✅ Align icons to pixel grid

### Don'ts

- ❌ Mix icon styles (outlined vs filled) inconsistently
- ❌ Use icons without accessible alternatives
- ❌ Scale icons disproportionately
- ❌ Use overly detailed icons at small sizes
- ❌ Rely on icons alone without labels for new users
- ❌ Use non-standard icons for common actions

---

*Next: [13-implementation-checklist.md](./13-implementation-checklist.md) - Actionable checklist for AGENT redesign*
