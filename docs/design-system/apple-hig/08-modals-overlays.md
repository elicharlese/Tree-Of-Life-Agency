# 08 - Modals & Overlays

> Apple HIG guidelines for sheets, alerts, popovers, action sheets, and dialogs in AGENT.

## Modal Philosophy

Apple's approach to modals:

1. **Purposeful**: Only use modals when focus is required
2. **Dismissible**: Always provide a clear way to exit
3. **Contextual**: Maintain connection to triggering content
4. **Minimal**: Don't overuse - modals interrupt flow

## Sheets

Sheets slide up from the bottom and are used for focused tasks.

### Sheet Sizes

| Size | Coverage | Usage |
|------|----------|-------|
| **Small** | ~25% | Quick actions, confirmations |
| **Medium** | ~50% | Forms, selections |
| **Large** | ~90% | Complex tasks, full content |
| **Full** | 100% | Immersive experiences |

### Sheet Component

```tsx
interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'small' | 'medium' | 'large' | 'full';
  title?: string;
  children: React.ReactNode;
  showHandle?: boolean;
}

const sheetSizes = {
  small: "max-h-[25vh]",
  medium: "max-h-[50vh]",
  large: "max-h-[90vh]",
  full: "h-full",
};

const Sheet = ({
  isOpen,
  onClose,
  size = 'medium',
  title,
  children,
  showHandle = true,
}: SheetProps) => {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "bg-background rounded-t-xl",
          "animate-slide-up",
          sheetSizes[size],
          size !== 'full' && "pb-safe-bottom"
        )}
      >
        {/* Handle */}
        {showHandle && (
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-9 h-1 bg-label-quaternary rounded-full" />
          </div>
        )}
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-separator">
            <button
              onClick={onClose}
              className="text-primary text-body min-w-[60px]"
            >
              Cancel
            </button>
            <h2 className="text-headline">{title}</h2>
            <div className="min-w-[60px]" /> {/* Spacer for centering */}
          </div>
        )}
        
        {/* Content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </>
  );
};
```

### Sheet Usage

```tsx
// New chat sheet
<Sheet
  isOpen={showNewChat}
  onClose={() => setShowNewChat(false)}
  size="large"
  title="New Conversation"
>
  <div className="p-4 space-y-4">
    <TextField
      label="Title"
      placeholder="Conversation title..."
    />
    <TextField
      label="Description"
      placeholder="Optional description..."
    />
    <Button variant="filled" fullWidth>
      Create Conversation
    </Button>
  </div>
</Sheet>
```

## Alerts

Alerts communicate important information and require user acknowledgment.

### Alert Types

| Type | Buttons | Usage |
|------|---------|-------|
| **Informational** | 1 (OK) | Notifications, confirmations |
| **Decision** | 2 (Cancel/Action) | Choices requiring decision |
| **Destructive** | 2 (Cancel/Delete) | Irreversible actions |

### Alert Component

```tsx
interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  actions: AlertAction[];
}

interface AlertAction {
  label: string;
  onClick: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

const Alert = ({
  isOpen,
  onClose,
  title,
  message,
  actions,
}: AlertProps) => {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />
      
      {/* Alert */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full max-w-[270px]",
            "bg-background/95 backdrop-blur-xl",
            "rounded-2xl overflow-hidden",
            "animate-scale-in"
          )}
        >
          {/* Content */}
          <div className="px-4 pt-5 pb-4 text-center">
            <h2 className="text-headline mb-1">{title}</h2>
            {message && (
              <p className="text-footnote text-label-secondary">{message}</p>
            )}
          </div>
          
          {/* Actions */}
          <div className={cn(
            "border-t border-separator",
            actions.length === 2 ? "flex" : "flex flex-col"
          )}>
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  onClose();
                }}
                className={cn(
                  "flex-1 py-3 text-body",
                  "hover:bg-fill-secondary active:bg-fill",
                  "transition-colors",
                  action.style === 'cancel' && "font-semibold",
                  action.style === 'destructive' && "text-red",
                  action.style === 'default' && "text-primary",
                  !action.style && "text-primary",
                  actions.length === 2 && index === 0 && "border-r border-separator"
                )}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
```

### Alert Usage

```tsx
// Confirmation alert
<Alert
  isOpen={showDeleteAlert}
  onClose={() => setShowDeleteAlert(false)}
  title="Delete Conversation?"
  message="This action cannot be undone. All messages will be permanently deleted."
  actions={[
    {
      label: "Cancel",
      onClick: () => {},
      style: 'cancel',
    },
    {
      label: "Delete",
      onClick: handleDelete,
      style: 'destructive',
    },
  ]}
/>

// Informational alert
<Alert
  isOpen={showSuccessAlert}
  onClose={() => setShowSuccessAlert(false)}
  title="Message Sent"
  message="Your message has been delivered successfully."
  actions={[
    {
      label: "OK",
      onClick: () => {},
      style: 'default',
    },
  ]}
/>
```

## Popovers

Popovers display content in a floating container anchored to a trigger element.

### Popover Component

```tsx
interface PopoverProps {
  isOpen: boolean;
  onClose: () => void;
  anchor: React.RefObject<HTMLElement>;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
}

const Popover = ({
  isOpen,
  onClose,
  anchor,
  children,
  position = 'bottom',
  align = 'center',
}: PopoverProps) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  
  useEffect(() => {
    if (isOpen && anchor.current) {
      const rect = anchor.current.getBoundingClientRect();
      // Calculate position based on anchor and position/align props
      setCoords(calculatePosition(rect, position, align));
    }
  }, [isOpen, anchor, position, align]);
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop (invisible, for click-outside) */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Popover */}
      <div
        className={cn(
          "fixed z-50",
          "bg-background/95 backdrop-blur-xl",
          "rounded-xl shadow-lg",
          "border border-separator",
          "animate-fade-in",
          "min-w-[200px] max-w-[320px]"
        )}
        style={{ top: coords.top, left: coords.left }}
      >
        {/* Arrow */}
        <div
          className={cn(
            "absolute w-3 h-3 bg-background/95 border-separator",
            "transform rotate-45",
            position === 'bottom' && "-top-1.5 border-t border-l",
            position === 'top' && "-bottom-1.5 border-b border-r"
          )}
        />
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </>
  );
};
```

### Popover Menu

```tsx
interface PopoverMenuProps {
  isOpen: boolean;
  onClose: () => void;
  anchor: React.RefObject<HTMLElement>;
  items: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    destructive?: boolean;
    disabled?: boolean;
  }[];
}

const PopoverMenu = ({
  isOpen,
  onClose,
  anchor,
  items,
}: PopoverMenuProps) => (
  <Popover isOpen={isOpen} onClose={onClose} anchor={anchor}>
    <div className="py-1">
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          disabled={item.disabled}
          className={cn(
            "w-full px-4 py-2.5 flex items-center gap-3",
            "text-body text-left",
            "hover:bg-fill-secondary",
            "disabled:opacity-50 disabled:pointer-events-none",
            item.destructive && "text-red"
          )}
        >
          {item.icon && (
            <span className={item.destructive ? "text-red" : "text-label-secondary"}>
              {item.icon}
            </span>
          )}
          {item.label}
        </button>
      ))}
    </div>
  </Popover>
);
```

## Action Sheets

Action sheets present a set of choices related to the current context.

### Action Sheet Component

```tsx
interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  actions: {
    label: string;
    onClick: () => void;
    destructive?: boolean;
  }[];
  cancelLabel?: string;
}

const ActionSheet = ({
  isOpen,
  onClose,
  title,
  message,
  actions,
  cancelLabel = "Cancel",
}: ActionSheetProps) => {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Action Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-2 pb-safe-bottom animate-slide-up">
        {/* Actions group */}
        <div className="bg-background/95 backdrop-blur-xl rounded-xl overflow-hidden mb-2">
          {/* Header */}
          {(title || message) && (
            <div className="px-4 py-3 text-center border-b border-separator">
              {title && (
                <p className="text-footnote text-label-secondary font-semibold">
                  {title}
                </p>
              )}
              {message && (
                <p className="text-footnote text-label-secondary mt-1">
                  {message}
                </p>
              )}
            </div>
          )}
          
          {/* Actions */}
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onClose();
              }}
              className={cn(
                "w-full py-4 text-body text-center",
                "hover:bg-fill-secondary active:bg-fill",
                "border-b border-separator last:border-0",
                action.destructive ? "text-red" : "text-primary"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
        
        {/* Cancel button */}
        <button
          onClick={onClose}
          className={cn(
            "w-full py-4 text-body font-semibold text-center",
            "bg-background rounded-xl",
            "hover:bg-fill-secondary active:bg-fill"
          )}
        >
          {cancelLabel}
        </button>
      </div>
    </>
  );
};
```

### Action Sheet Usage

```tsx
// Share action sheet
<ActionSheet
  isOpen={showShareSheet}
  onClose={() => setShowShareSheet(false)}
  title="Share Conversation"
  actions={[
    {
      label: "Copy Link",
      onClick: handleCopyLink,
    },
    {
      label: "Share via Email",
      onClick: handleEmailShare,
    },
    {
      label: "Export as PDF",
      onClick: handleExportPDF,
    },
  ]}
/>

// Destructive action sheet
<ActionSheet
  isOpen={showDeleteSheet}
  onClose={() => setShowDeleteSheet(false)}
  title="Delete this conversation?"
  message="This action cannot be undone."
  actions={[
    {
      label: "Delete Conversation",
      onClick: handleDelete,
      destructive: true,
    },
  ]}
/>
```

## Dialog (macOS Style)

For desktop contexts, use centered dialogs.

### Dialog Component

```tsx
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const dialogSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
};

const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  size = 'md',
}: DialogProps) => {
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={cn(
            "w-full bg-background rounded-xl shadow-2xl",
            "animate-scale-in",
            dialogSizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-separator">
            <h2 className="text-headline">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-fill flex items-center justify-center"
            >
              <X className="w-4 h-4 text-label-secondary" />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
          
          {/* Actions */}
          {actions && (
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-separator bg-background-secondary rounded-b-xl">
              {actions}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
```

## Animation Keyframes

```css
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

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

.animate-fade-in {
  animation: fade-in 200ms ease-out;
}

.animate-slide-up {
  animation: slide-up 300ms ease-out;
}

.animate-scale-in {
  animation: scale-in 200ms ease-out;
}
```

## Best Practices

### Do's

- ✅ Use sheets for focused tasks on mobile
- ✅ Provide clear dismiss options
- ✅ Use alerts sparingly for important decisions
- ✅ Keep modal content focused and minimal
- ✅ Animate modals smoothly
- ✅ Support keyboard dismiss (Escape key)

### Don'ts

- ❌ Stack multiple modals
- ❌ Use modals for simple information
- ❌ Block dismiss without good reason
- ❌ Put complex navigation in modals
- ❌ Use alerts for non-critical information
- ❌ Make modals too large on mobile

---

*Next: [09-feedback-states.md](./09-feedback-states.md) - Loading, errors, and notifications*
