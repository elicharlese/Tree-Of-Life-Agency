# 07 - Content Containers

> Guidelines for cards, lists, tables, and collection views following Apple HIG for AGENT.

## Cards

Cards group related content and actions.

### Card Anatomy

```
┌─────────────────────────────────┐
│ Header (optional)               │
│ ─────────────────────────────── │
│                                 │
│ Content Area                    │
│                                 │
│ ─────────────────────────────── │
│ Footer / Actions (optional)     │
└─────────────────────────────────┘
```

### Card Component

```tsx
interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'filled' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const cardVariants = {
  elevated: "bg-background shadow-lg",
  filled: "bg-background-secondary",
  outlined: "bg-background border border-separator",
};

const cardPadding = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
};

const Card = ({
  children,
  variant = 'elevated',
  padding = 'md',
  className,
}: CardProps) => (
  <div
    className={cn(
      "rounded-xl overflow-hidden",
      cardVariants[variant],
      cardPadding[padding],
      className
    )}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("pb-3 border-b border-separator mb-3", className)}>
    {children}
  </div>
);

const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("", className)}>
    {children}
  </div>
);

const CardFooter = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("pt-3 border-t border-separator mt-3 flex gap-2", className)}>
    {children}
  </div>
);
```

### Card Usage in AGENT

```tsx
// Conversation card
const ConversationCard = ({ conversation }) => (
  <Card variant="filled" className="hover:bg-fill transition-colors cursor-pointer">
    <div className="flex items-start gap-3">
      <Avatar src={conversation.avatar} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-headline truncate">{conversation.title}</h3>
          <span className="text-caption-2 text-label-tertiary">
            {conversation.time}
          </span>
        </div>
        <p className="text-subheadline text-label-secondary truncate mt-0.5">
          {conversation.lastMessage}
        </p>
      </div>
    </div>
  </Card>
);

// Project card
const ProjectCard = ({ project }) => (
  <Card variant="elevated">
    <CardHeader>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Folder className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-headline">{project.name}</h3>
          <p className="text-caption-1 text-label-secondary">
            {project.taskCount} tasks
          </p>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-body text-label-secondary">
        {project.description}
      </p>
    </CardContent>
    <CardFooter>
      <Button variant="tinted" size="small">View Project</Button>
      <Button variant="plain" size="small">Settings</Button>
    </CardFooter>
  </Card>
);
```

## Lists

Lists display rows of information, typically with consistent formatting.

### List Row Heights

| Style | Height | Usage |
|-------|--------|-------|
| **Compact** | 44pt | Simple single-line items |
| **Standard** | 56pt | Title + subtitle |
| **Large** | 72pt | Title + subtitle + metadata |
| **Custom** | Variable | Complex content |

### List Component

```tsx
interface ListProps {
  children: React.ReactNode;
  header?: string;
  footer?: string;
  inset?: boolean;
}

const List = ({ children, header, footer, inset = false }: ListProps) => (
  <div className={cn(inset && "px-4")}>
    {header && (
      <h3 className="px-4 py-2 text-footnote text-label-secondary font-semibold uppercase">
        {header}
      </h3>
    )}
    <div className={cn(
      "bg-background-secondary rounded-xl overflow-hidden",
      "divide-y divide-separator"
    )}>
      {children}
    </div>
    {footer && (
      <p className="px-4 py-2 text-footnote text-label-secondary">
        {footer}
      </p>
    )}
  </div>
);

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightContent?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  destructive?: boolean;
}

const ListItem = ({
  title,
  subtitle,
  leftIcon,
  rightContent,
  showChevron = false,
  onClick,
  destructive = false,
}: ListItemProps) => {
  const Component = onClick ? 'button' : 'div';
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        "w-full px-4 flex items-center gap-3",
        "min-h-[44px]",
        subtitle && "py-3",
        onClick && "hover:bg-fill-secondary active:bg-fill transition-colors",
        "text-left"
      )}
    >
      {/* Left icon */}
      {leftIcon && (
        <span className={cn(
          "flex-shrink-0",
          destructive ? "text-red" : "text-label-secondary"
        )}>
          {leftIcon}
        </span>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-body",
          destructive ? "text-red" : "text-label"
        )}>
          {title}
        </p>
        {subtitle && (
          <p className="text-footnote text-label-secondary truncate">
            {subtitle}
          </p>
        )}
      </div>
      
      {/* Right content */}
      {rightContent && (
        <span className="flex-shrink-0 text-label-secondary">
          {rightContent}
        </span>
      )}
      
      {/* Chevron */}
      {showChevron && (
        <ChevronRight className="w-4 h-4 text-label-quaternary flex-shrink-0" />
      )}
    </Component>
  );
};
```

### List Usage Examples

```tsx
// Settings list
<List header="Account" inset>
  <ListItem
    title="Profile"
    leftIcon={<User className="w-5 h-5" />}
    showChevron
    onClick={() => navigate('/profile')}
  />
  <ListItem
    title="Notifications"
    leftIcon={<Bell className="w-5 h-5" />}
    rightContent={<Toggle checked={notifications} onChange={setNotifications} />}
  />
  <ListItem
    title="Privacy"
    leftIcon={<Lock className="w-5 h-5" />}
    showChevron
    onClick={() => navigate('/privacy')}
  />
</List>

<List header="Danger Zone" footer="This action cannot be undone." inset>
  <ListItem
    title="Delete Account"
    leftIcon={<Trash className="w-5 h-5" />}
    destructive
    onClick={handleDeleteAccount}
  />
</List>
```

## Tables

For displaying structured data with multiple columns.

### Table Component

```tsx
interface Column<T> {
  key: keyof T;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

function Table<T extends { id: string }>({
  columns,
  data,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-separator">
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  "px-4 py-3 text-footnote font-semibold text-label-secondary",
                  column.align === 'center' && "text-center",
                  column.align === 'right' && "text-right",
                  !column.align && "text-left"
                )}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "border-b border-separator last:border-0",
                onRowClick && "hover:bg-fill-secondary cursor-pointer"
              )}
            >
              {columns.map((column) => (
                <td
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-body",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : String(row[column.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Collection Views

For displaying grids of items.

### Grid Component

```tsx
interface GridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4 | 'auto';
  gap?: 'sm' | 'md' | 'lg';
}

const gridColumns = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  auto: "grid-cols-[repeat(auto-fill,minmax(280px,1fr))]",
};

const gridGap = {
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

const Grid = ({ children, columns = 'auto', gap = 'md' }: GridProps) => (
  <div className={cn("grid", gridColumns[columns], gridGap[gap])}>
    {children}
  </div>
);
```

### Collection Item

```tsx
interface CollectionItemProps {
  image?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick?: () => void;
}

const CollectionItem = ({
  image,
  title,
  subtitle,
  badge,
  onClick,
}: CollectionItemProps) => (
  <button
    onClick={onClick}
    className="text-left group"
  >
    {/* Image */}
    <div className="relative aspect-square rounded-xl overflow-hidden bg-fill mb-2">
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-label-quaternary" />
        </div>
      )}
      {badge && (
        <span className="absolute top-2 right-2 px-2 py-1 bg-background/80 backdrop-blur rounded-full text-caption-2">
          {badge}
        </span>
      )}
    </div>
    
    {/* Content */}
    <h3 className="text-body text-label truncate">{title}</h3>
    {subtitle && (
      <p className="text-footnote text-label-secondary truncate">{subtitle}</p>
    )}
  </button>
);
```

## Empty States

When containers have no content.

### Empty State Component

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {icon && (
      <div className="w-16 h-16 rounded-2xl bg-fill flex items-center justify-center mb-4">
        <span className="text-label-tertiary">{icon}</span>
      </div>
    )}
    <h3 className="text-title-2 text-label mb-2">{title}</h3>
    {description && (
      <p className="text-body text-label-secondary max-w-sm mb-6">
        {description}
      </p>
    )}
    {action && (
      <Button variant="filled" onClick={action.onClick}>
        {action.label}
      </Button>
    )}
  </div>
);
```

### Empty State Usage

```tsx
// No conversations
<EmptyState
  icon={<MessageSquare className="w-8 h-8" />}
  title="No conversation selected"
  description="Select a conversation from the left, or start a new one to begin chatting."
  action={{
    label: "Start new chat",
    onClick: handleNewChat,
  }}
/>

// No search results
<EmptyState
  icon={<Search className="w-8 h-8" />}
  title="No results found"
  description="Try adjusting your search terms or filters."
/>

// No projects
<EmptyState
  icon={<Folder className="w-8 h-8" />}
  title="No projects yet"
  description="Create your first project to organize your work."
  action={{
    label: "New Project",
    onClick: handleNewProject,
  }}
/>
```

## Grouped Content

For organizing related items into sections.

### Grouped List

```tsx
interface GroupedListProps {
  sections: {
    title: string;
    items: React.ReactNode[];
  }[];
}

const GroupedList = ({ sections }: GroupedListProps) => (
  <div className="space-y-6">
    {sections.map((section, index) => (
      <div key={index}>
        <h3 className="px-4 py-2 text-footnote text-label-secondary font-semibold uppercase">
          {section.title}
        </h3>
        <div className="bg-background-secondary rounded-xl overflow-hidden divide-y divide-separator">
          {section.items}
        </div>
      </div>
    ))}
  </div>
);
```

## Best Practices

### Do's

- ✅ Use consistent card styles throughout the app
- ✅ Provide clear visual hierarchy within containers
- ✅ Include empty states for all containers
- ✅ Use appropriate row heights for content density
- ✅ Group related items logically
- ✅ Support swipe actions on list items (mobile)

### Don'ts

- ❌ Mix card styles inconsistently
- ❌ Overcrowd cards with too much content
- ❌ Leave containers empty without guidance
- ❌ Use tables for simple lists
- ❌ Nest cards within cards
- ❌ Ignore touch target sizes in lists

---

*Next: [08-modals-overlays.md](./08-modals-overlays.md) - Sheets, alerts, and popovers*
