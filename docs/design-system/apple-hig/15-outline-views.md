# Outline Views

> An outline view displays hierarchical data as an expandable list, letting people reveal or hide nested content by expanding or collapsing rows.

## Overview

Outline views are essential for displaying hierarchical information in AGENT:

- **Chat threads** - Parent messages with replies
- **Project structures** - Folders and files
- **Task hierarchies** - Tasks with subtasks
- **Navigation trees** - Nested menu items
- **Agent configurations** - Grouped settings

## Apple HIG Principles

### 1. Visual Hierarchy

Use indentation and disclosure indicators to show relationships:

```text
▼ Parent Item
    ├─ Child Item 1
    ├─ Child Item 2
    │   ├─ Grandchild 1
    │   └─ Grandchild 2
    └─ Child Item 3
► Collapsed Parent
```

### 2. Disclosure Indicators

- **Chevron (►/▼)** - Standard disclosure triangle
- **Plus/Minus (+/-)** - Alternative for dense views
- **Rotation** - Animate 90° rotation on expand/collapse

### 3. Indentation

Use consistent indentation per level:

```css
/* Indentation tokens */
--outline-indent-base: 16px;    /* Per level */
--outline-indent-icon: 24px;    /* With icon */
--outline-row-height: 44px;     /* Minimum touch target */
```

## AGENT Implementation

### Base Outline View Component

```tsx
interface OutlineItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: OutlineItem[];
  metadata?: string;
}

interface OutlineViewProps {
  items: OutlineItem[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  defaultExpanded?: string[];
}

const OutlineView: React.FC<OutlineViewProps> = ({
  items,
  selectedId,
  onSelect,
  defaultExpanded = [],
}) => {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(defaultExpanded));

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const renderItem = (item: OutlineItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded.has(item.id);
    const isSelected = selectedId === item.id;

    return (
      <div key={item.id}>
        <button
          type="button"
          onClick={() => {
            if (hasChildren) toggleExpand(item.id);
            onSelect?.(item.id);
          }}
          className={`
            agent-outline-row
            ${isSelected ? 'agent-outline-row-selected' : ''}
          `}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          aria-expanded={hasChildren ? isExpanded : undefined}
        >
          {/* Disclosure Indicator */}
          {hasChildren && (
            <ChevronRight 
              className={`
                agent-outline-disclosure
                ${isExpanded ? 'rotate-90' : ''}
              `}
            />
          )}
          
          {/* Spacer for items without children */}
          {!hasChildren && <div className="w-4" />}
          
          {/* Icon */}
          {item.icon && (
            <div className="agent-outline-icon">
              {item.icon}
            </div>
          )}
          
          {/* Label */}
          <span className="agent-outline-label">{item.label}</span>
          
          {/* Metadata */}
          {item.metadata && (
            <span className="agent-outline-metadata">{item.metadata}</span>
          )}
        </button>
        
        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="agent-outline-children">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="agent-outline-view" role="tree">
      {items.map(item => renderItem(item))}
    </div>
  );
};
```

### CSS Classes

```css
/* Apple HIG: Outline View Container */
.agent-outline-view {
  @apply flex flex-col;
  @apply w-full;
}

/* Apple HIG: Outline Row */
.agent-outline-row {
  @apply flex items-center;
  @apply w-full;
  @apply min-h-[44px];
  @apply px-3 py-2;
  @apply text-left;
  @apply text-[13px] font-medium;
  @apply text-gray-900 dark:text-gray-100;
  @apply rounded-[8px];
  @apply transition-colors duration-150;
  @apply hover:bg-black/[0.04] dark:hover:bg-white/[0.06];
  @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-ring;
}

/* Apple HIG: Selected Row */
.agent-outline-row-selected {
  @apply bg-[#047857]/10 dark:bg-[#10b981]/10;
  @apply text-[#047857] dark:text-[#10b981];
}

/* Apple HIG: Disclosure Indicator */
.agent-outline-disclosure {
  @apply h-4 w-4;
  @apply mr-1;
  @apply text-gray-400 dark:text-gray-500;
  @apply transition-transform duration-200 ease-out;
  @apply flex-shrink-0;
}

/* Apple HIG: Row Icon */
.agent-outline-icon {
  @apply h-5 w-5;
  @apply mr-2;
  @apply flex items-center justify-center;
  @apply flex-shrink-0;
}

/* Apple HIG: Row Label */
.agent-outline-label {
  @apply flex-1;
  @apply truncate;
}

/* Apple HIG: Row Metadata */
.agent-outline-metadata {
  @apply ml-2;
  @apply text-[11px];
  @apply text-gray-400 dark:text-gray-500;
  @apply flex-shrink-0;
}

/* Apple HIG: Children Container */
.agent-outline-children {
  @apply flex flex-col;
}
```

## Outline View Variants

### 1. File Browser

For project file structures:

```tsx
const fileItems: OutlineItem[] = [
  {
    id: 'src',
    label: 'src',
    icon: <Folder className="h-4 w-4 text-blue-500" />,
    children: [
      {
        id: 'components',
        label: 'components',
        icon: <Folder className="h-4 w-4 text-blue-500" />,
        children: [
          { id: 'Button.tsx', label: 'Button.tsx', icon: <FileCode className="h-4 w-4 text-emerald-500" /> },
          { id: 'Card.tsx', label: 'Card.tsx', icon: <FileCode className="h-4 w-4 text-emerald-500" /> },
        ],
      },
      { id: 'index.ts', label: 'index.ts', icon: <FileCode className="h-4 w-4 text-emerald-500" /> },
    ],
  },
  {
    id: 'package.json',
    label: 'package.json',
    icon: <FileJson className="h-4 w-4 text-yellow-500" />,
  },
];
```

### 2. Chat Threads

For nested conversation replies:

```tsx
const threadItems: OutlineItem[] = [
  {
    id: 'msg-1',
    label: 'How do we implement this feature?',
    icon: <MessageCircle className="h-4 w-4" />,
    metadata: '3 replies',
    children: [
      { id: 'reply-1', label: 'I think we should start with...', icon: <CornerDownRight className="h-4 w-4 text-gray-400" /> },
      { id: 'reply-2', label: 'Good point, also consider...', icon: <CornerDownRight className="h-4 w-4 text-gray-400" /> },
      { id: 'reply-3', label: 'Agreed, let\'s proceed with...', icon: <CornerDownRight className="h-4 w-4 text-gray-400" /> },
    ],
  },
];
```

### 3. Task Hierarchy

For tasks with subtasks:

```tsx
const taskItems: OutlineItem[] = [
  {
    id: 'task-1',
    label: 'Design System Implementation',
    icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    metadata: '2/5',
    children: [
      { id: 'subtask-1', label: 'Define color tokens', icon: <Circle className="h-4 w-4 text-gray-300" /> },
      { id: 'subtask-2', label: 'Create typography scale', icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
      { id: 'subtask-3', label: 'Build component library', icon: <Circle className="h-4 w-4 text-gray-300" /> },
    ],
  },
];
```

### 4. Navigation Tree

For sidebar navigation:

```tsx
const navItems: OutlineItem[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    icon: <LayoutDashboard className="h-4 w-4" />,
    children: [
      { id: 'projects', label: 'Projects', icon: <FolderKanban className="h-4 w-4" /> },
      { id: 'tasks', label: 'Tasks', icon: <ListTodo className="h-4 w-4" /> },
      { id: 'calendar', label: 'Calendar', icon: <Calendar className="h-4 w-4" /> },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    children: [
      { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
      { id: 'preferences', label: 'Preferences', icon: <Sliders className="h-4 w-4" /> },
    ],
  },
];
```

## Animation

### Expand/Collapse Animation

```css
/* Smooth height animation */
.agent-outline-children {
  @apply overflow-hidden;
  animation: outline-expand 200ms ease-out;
}

@keyframes outline-expand {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Disclosure rotation */
.agent-outline-disclosure {
  @apply transition-transform duration-200 ease-out;
}

.agent-outline-disclosure.rotate-90 {
  transform: rotate(90deg);
}
```

## Accessibility

### ARIA Attributes

```tsx
<div role="tree" aria-label="File browser">
  <div role="treeitem" aria-expanded="true" aria-level="1">
    <button aria-label="src folder, expanded, 3 items">
      {/* ... */}
    </button>
    <div role="group">
      <div role="treeitem" aria-level="2">
        {/* ... */}
      </div>
    </div>
  </div>
</div>
```

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `↑` / `↓` | Move between items |
| `←` | Collapse current / move to parent |
| `→` | Expand current / move to first child |
| `Enter` / `Space` | Select item |
| `Home` | Move to first item |
| `End` | Move to last visible item |

## Best Practices

1. **Clear Hierarchy** - Use consistent indentation (16px per level)
2. **Disclosure Indicators** - Always show expand/collapse state
3. **Touch Targets** - Minimum 44pt row height
4. **Visual Feedback** - Highlight selected and hovered items
5. **Lazy Loading** - Load children on expand for large trees
6. **Keyboard Support** - Full arrow key navigation
7. **State Persistence** - Remember expanded state across sessions

## Related Components

- [Lockups](./14-lockups.md) - Icon + text combinations
- [Boxes](./16-boxes.md) - Content containers
- [Navigation](./05-navigation.md) - Navigation patterns

---

*Based on Apple HIG Outline Views: https://developer.apple.com/design/human-interface-guidelines/outline-views*
