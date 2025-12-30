# 05 - Navigation

> Apple HIG navigation patterns including navigation bars, tab bars, sidebars, and search for AGENT.

## Navigation Philosophy

Apple's navigation principles:

1. **Clarity**: Users should always know where they are
2. **Predictability**: Navigation should behave consistently
3. **Efficiency**: Minimize taps to reach any destination
4. **Context**: Preserve user's place when navigating

## Navigation Bar

The navigation bar appears at the top of screens and provides navigation controls.

### Standard Navigation Bar

```
┌─────────────────────────────────────────────┐
│ ← Back      Title                    Action │
└─────────────────────────────────────────────┘
Height: 44pt (standard) / 96pt (large title)
```

### Implementation

```tsx
interface NavigationBarProps {
  title: string;
  largeTitle?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

const NavigationBar = ({
  title,
  largeTitle = false,
  leftAction,
  rightAction,
  transparent = false,
}: NavigationBarProps) => (
  <header
    className={cn(
      "sticky top-0 z-40",
      "px-4 flex items-center justify-between",
      "border-b border-separator",
      transparent
        ? "bg-transparent"
        : "bg-background/80 backdrop-blur-xl",
      largeTitle ? "h-24 flex-col items-start pt-2" : "h-11"
    )}
  >
    {/* Standard bar */}
    <div className="flex items-center justify-between w-full h-11">
      {/* Left action */}
      <div className="w-20 flex justify-start">
        {leftAction}
      </div>
      
      {/* Title (inline for standard, hidden for large) */}
      {!largeTitle && (
        <h1 className="text-headline text-center flex-1 truncate">
          {title}
        </h1>
      )}
      
      {/* Right action */}
      <div className="w-20 flex justify-end">
        {rightAction}
      </div>
    </div>
    
    {/* Large title */}
    {largeTitle && (
      <h1 className="text-large-title font-bold px-0 pb-2">
        {title}
      </h1>
    )}
  </header>
);
```

### Back Button

```tsx
const BackButton = ({ onClick, label = "Back" }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1 text-primary min-h-[44px] -ml-2 px-2"
  >
    <ChevronLeft className="w-5 h-5" />
    <span className="text-body">{label}</span>
  </button>
);
```

## Tab Bar

The tab bar provides navigation between main sections of an app.

### Standard Tab Bar

```
┌─────────────────────────────────────────────┐
│                                             │
│   🏠      💬      🔍      ⚙️      👤       │
│  Home   Chats   Search  Settings Profile    │
│                                             │
└─────────────────────────────────────────────┘
Height: 49pt (+ safe area)
```

### Implementation

```tsx
interface TabBarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface TabBarProps {
  items: TabBarItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const TabBar = ({ items, activeId, onSelect }: TabBarProps) => (
  <nav
    className={cn(
      "fixed bottom-0 left-0 right-0 z-50",
      "bg-background/80 backdrop-blur-xl",
      "border-t border-separator",
      "pb-safe-bottom" // Safe area padding
    )}
  >
    <div className="flex items-center justify-around h-[49px]">
      {items.map((item) => {
        const isActive = item.id === activeId;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex flex-col items-center justify-center",
              "min-w-[64px] h-full px-2",
              "transition-colors"
            )}
          >
            <div className="relative">
              <Icon
                className={cn(
                  "w-6 h-6",
                  isActive ? "text-primary" : "text-label-secondary"
                )}
              />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red text-white text-caption-2 flex items-center justify-center">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </div>
            <span
              className={cn(
                "text-caption-2 mt-0.5",
                isActive ? "text-primary" : "text-label-secondary"
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);
```

### Tab Bar Guidelines

- **Maximum 5 tabs** for comfortable touch targets
- **Always visible** except in modal contexts
- **Consistent icons** - use filled for active, outlined for inactive
- **Badge placement** - top-right of icon

## Sidebar

For iPad and Mac, sidebars provide primary navigation.

### Sidebar Structure

```
┌──────────────────┐
│ App Name    [+]  │
├──────────────────┤
│ 🔍 Search        │
├──────────────────┤
│ SECTION HEADER   │
│ ├─ Item 1        │
│ ├─ Item 2 (3)    │
│ └─ Item 3        │
├──────────────────┤
│ SECTION HEADER   │
│ ├─ Item A        │
│ └─ Item B        │
└──────────────────┘
Width: 280pt (standard)
```

### Implementation

```tsx
interface SidebarSection {
  title?: string;
  items: SidebarItem[];
}

interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  children?: SidebarItem[];
}

const Sidebar = ({
  sections,
  activeId,
  onSelect,
  header,
}: {
  sections: SidebarSection[];
  activeId: string;
  onSelect: (id: string) => void;
  header?: React.ReactNode;
}) => (
  <aside className="w-[280px] h-full bg-background-secondary border-r border-separator flex flex-col">
    {/* Header */}
    {header && (
      <div className="h-[52px] px-4 flex items-center justify-between border-b border-separator">
        {header}
      </div>
    )}
    
    {/* Scrollable content */}
    <div className="flex-1 overflow-y-auto py-2">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="mb-4">
          {/* Section header */}
          {section.title && (
            <h3 className="px-4 py-2 text-footnote text-label-secondary font-semibold uppercase tracking-wide">
              {section.title}
            </h3>
          )}
          
          {/* Items */}
          <div className="px-2">
            {section.items.map((item) => (
              <SidebarItemComponent
                key={item.id}
                item={item}
                isActive={item.id === activeId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </aside>
);

const SidebarItemComponent = ({
  item,
  isActive,
  onSelect,
  depth = 0,
}: {
  item: SidebarItem;
  isActive: boolean;
  onSelect: (id: string) => void;
  depth?: number;
}) => {
  const Icon = item.icon;
  
  return (
    <button
      onClick={() => onSelect(item.id)}
      className={cn(
        "w-full px-3 py-2 rounded-lg flex items-center gap-3",
        "transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-label hover:bg-fill-secondary",
        depth > 0 && "ml-6"
      )}
    >
      {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
      <span className="flex-1 text-left text-body truncate">
        {item.label}
      </span>
      {item.badge && (
        <span className="text-caption-1 text-label-secondary bg-fill px-2 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </button>
  );
};
```

## Search

### Search Bar

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  showCancel?: boolean;
  onCancel?: () => void;
}

const SearchBar = ({
  value,
  onChange,
  placeholder = "Search",
  onFocus,
  onBlur,
  showCancel = false,
  onCancel,
}: SearchBarProps) => (
  <div className="flex items-center gap-2 px-4 py-2">
    <div className="flex-1 relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-label-tertiary" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          "w-full h-9 pl-9 pr-3 rounded-lg",
          "bg-fill text-body placeholder:text-label-quaternary",
          "focus:outline-none focus:ring-2 focus:ring-primary/50"
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          <XCircle className="w-4 h-4 text-label-tertiary" />
        </button>
      )}
    </div>
    
    {showCancel && (
      <button
        onClick={onCancel}
        className="text-primary text-body min-h-[44px] px-2"
      >
        Cancel
      </button>
    )}
  </div>
);
```

### Search Suggestions

```tsx
const SearchSuggestions = ({
  suggestions,
  recentSearches,
  onSelect,
}: {
  suggestions: string[];
  recentSearches: string[];
  onSelect: (query: string) => void;
}) => (
  <div className="bg-background border-t border-separator">
    {/* Recent searches */}
    {recentSearches.length > 0 && (
      <div className="py-2">
        <h3 className="px-4 py-2 text-footnote text-label-secondary font-semibold">
          Recent
        </h3>
        {recentSearches.map((query, index) => (
          <button
            key={index}
            onClick={() => onSelect(query)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-fill-secondary"
          >
            <Clock className="w-4 h-4 text-label-tertiary" />
            <span className="text-body">{query}</span>
          </button>
        ))}
      </div>
    )}
    
    {/* Suggestions */}
    {suggestions.length > 0 && (
      <div className="py-2 border-t border-separator">
        <h3 className="px-4 py-2 text-footnote text-label-secondary font-semibold">
          Suggestions
        </h3>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-fill-secondary"
          >
            <Search className="w-4 h-4 text-label-tertiary" />
            <span className="text-body">{suggestion}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);
```

## Navigation Patterns for AGENT

### Mobile Navigation

```tsx
// Mobile: Tab bar + Navigation bar
const MobileLayout = () => (
  <div className="flex flex-col h-screen">
    <NavigationBar title="Messages" />
    <main className="flex-1 overflow-auto pb-[49px]">
      {/* Content */}
    </main>
    <TabBar
      items={[
        { id: 'chats', label: 'Chats', icon: MessageSquare },
        { id: 'projects', label: 'Projects', icon: Folder },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]}
      activeId="chats"
      onSelect={handleTabSelect}
    />
  </div>
);
```

### Desktop Navigation

```tsx
// Desktop: Sidebar + Content
const DesktopLayout = () => (
  <div className="flex h-screen">
    <Sidebar
      header={<AppLogo />}
      sections={[
        {
          title: 'Conversations',
          items: conversations.map(c => ({
            id: c.id,
            label: c.title,
            badge: c.unread,
          })),
        },
        {
          title: 'Projects',
          items: projects.map(p => ({
            id: p.id,
            label: p.name,
            icon: Folder,
          })),
        },
      ]}
      activeId={activeId}
      onSelect={handleSelect}
    />
    <main className="flex-1 flex flex-col">
      <NavigationBar
        title={activeTitle}
        rightAction={<ToolbarActions />}
      />
      <div className="flex-1 overflow-auto">
        {/* Content */}
      </div>
    </main>
  </div>
);
```

## Best Practices

### Do's

- ✅ Keep navigation consistent across the app
- ✅ Use standard navigation patterns users expect
- ✅ Provide clear back navigation
- ✅ Show current location in navigation
- ✅ Support keyboard navigation
- ✅ Maintain navigation state during app lifecycle

### Don'ts

- ❌ Hide navigation in unexpected places
- ❌ Use more than 5 tab bar items
- ❌ Mix navigation patterns inconsistently
- ❌ Require too many taps to reach content
- ❌ Use custom gestures for basic navigation
- ❌ Remove back button without alternative

---

*Next: [06-buttons-controls.md](./06-buttons-controls.md) - Buttons, toggles, and input controls*
