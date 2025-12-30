# 09 - Feedback & States

> Apple HIG guidelines for loading states, errors, empty states, and notifications in AGENT.

## Feedback Philosophy

Apple's approach to feedback:

1. **Immediate**: Respond to user actions within 100ms
2. **Informative**: Tell users what's happening
3. **Reassuring**: Confirm successful actions
4. **Helpful**: Guide users through errors

## Loading States

### Loading Indicators

| Type | Usage | Duration |
|------|-------|----------|
| **Spinner** | Short operations (<3s) | Indeterminate |
| **Progress Bar** | Known duration operations | Determinate |
| **Skeleton** | Content loading | Until content loads |
| **Pull to Refresh** | Manual refresh | User-initiated |

### Spinner Component

```tsx
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

const spinnerSizes = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

const spinnerColors = {
  primary: "text-primary",
  secondary: "text-label-secondary",
  white: "text-white",
};

const Spinner = ({ size = 'md', color = 'primary' }: SpinnerProps) => (
  <svg
    className={cn(
      "animate-spin",
      spinnerSizes[size],
      spinnerColors[color]
    )}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);
```

### Progress Bar Component

```tsx
interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const ProgressBar = ({
  value,
  showLabel = false,
  size = 'md',
}: ProgressBarProps) => (
  <div className="w-full">
    <div
      className={cn(
        "w-full bg-fill rounded-full overflow-hidden",
        size === 'sm' ? "h-1" : "h-2"
      )}
    >
      <div
        className="h-full bg-primary rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
    {showLabel && (
      <p className="text-caption-1 text-label-secondary mt-1 text-right">
        {Math.round(value)}%
      </p>
    )}
  </div>
);
```

### Skeleton Component

```tsx
interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className,
}: SkeletonProps) => (
  <div
    className={cn(
      "animate-pulse bg-fill",
      variant === 'text' && "h-4 rounded",
      variant === 'circular' && "rounded-full",
      variant === 'rectangular' && "rounded-lg",
      className
    )}
    style={{
      width: width ?? (variant === 'circular' ? 40 : '100%'),
      height: height ?? (variant === 'circular' ? 40 : variant === 'rectangular' ? 100 : undefined),
    }}
  />
);

// Skeleton presets for common patterns
const SkeletonText = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '60%' : '100%'}
      />
    ))}
  </div>
);

const SkeletonAvatar = ({ size = 40 }: { size?: number }) => (
  <Skeleton variant="circular" width={size} height={size} />
);

const SkeletonCard = () => (
  <div className="p-4 space-y-3">
    <div className="flex items-center gap-3">
      <SkeletonAvatar />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="60%" />
      </div>
    </div>
    <Skeleton variant="rectangular" height={120} />
    <SkeletonText lines={2} />
  </div>
);
```

### Loading Screen

```tsx
interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen = ({ message = "Loading..." }: LoadingScreenProps) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8">
    <Spinner size="lg" />
    <p className="text-body text-label-secondary mt-4">{message}</p>
  </div>
);
```

## Error States

### Error Types

| Type | Severity | Action |
|------|----------|--------|
| **Inline** | Low | Show near field |
| **Banner** | Medium | Show at top of content |
| **Full Screen** | High | Replace content |
| **Alert** | Critical | Modal interruption |

### Inline Error

```tsx
interface InlineErrorProps {
  message: string;
}

const InlineError = ({ message }: InlineErrorProps) => (
  <div className="flex items-center gap-2 text-red">
    <AlertCircle className="w-4 h-4 flex-shrink-0" />
    <p className="text-footnote">{message}</p>
  </div>
);
```

### Error Banner

```tsx
interface ErrorBannerProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const ErrorBanner = ({
  title,
  message,
  onRetry,
  onDismiss,
}: ErrorBannerProps) => (
  <div className="bg-red/10 border border-red/20 rounded-xl p-4">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h3 className="text-body font-semibold text-red">{title}</h3>
        {message && (
          <p className="text-footnote text-label-secondary mt-1">{message}</p>
        )}
        {(onRetry || onDismiss) && (
          <div className="flex gap-3 mt-3">
            {onRetry && (
              <Button variant="tinted" size="small" onClick={onRetry}>
                Try Again
              </Button>
            )}
            {onDismiss && (
              <Button variant="plain" size="small" onClick={onDismiss}>
                Dismiss
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
);
```

### Full Screen Error

```tsx
interface FullScreenErrorProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

const FullScreenError = ({
  icon,
  title,
  message,
  primaryAction,
  secondaryAction,
}: FullScreenErrorProps) => (
  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
    <div className="w-16 h-16 rounded-2xl bg-red/10 flex items-center justify-center mb-6">
      {icon || <AlertTriangle className="w-8 h-8 text-red" />}
    </div>
    <h2 className="text-title-2 text-label mb-2">{title}</h2>
    <p className="text-body text-label-secondary max-w-sm mb-8">{message}</p>
    <div className="flex flex-col sm:flex-row gap-3">
      {primaryAction && (
        <Button variant="filled" onClick={primaryAction.onClick}>
          {primaryAction.label}
        </Button>
      )}
      {secondaryAction && (
        <Button variant="plain" onClick={secondaryAction.onClick}>
          {secondaryAction.label}
        </Button>
      )}
    </div>
  </div>
);
```

### Error Usage Examples

```tsx
// Network error
<FullScreenError
  icon={<WifiOff className="w-8 h-8 text-red" />}
  title="No Internet Connection"
  message="Please check your connection and try again."
  primaryAction={{
    label: "Retry",
    onClick: handleRetry,
  }}
  secondaryAction={{
    label: "Work Offline",
    onClick: handleOffline,
  }}
/>

// Not found error
<FullScreenError
  icon={<FileQuestion className="w-8 h-8 text-label-tertiary" />}
  title="Conversation Not Found"
  message="This conversation may have been deleted or you don't have access."
  primaryAction={{
    label: "Go to Messages",
    onClick: () => navigate('/messages'),
  }}
/>
```

## Empty States

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
  <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
    {icon && (
      <div className="w-16 h-16 rounded-2xl bg-fill flex items-center justify-center mb-6">
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

## Notifications / Toasts

### Toast Component

```tsx
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onDismiss: (id: string) => void;
}

const toastIcons = {
  success: <CheckCircle className="w-5 h-5 text-green" />,
  error: <XCircle className="w-5 h-5 text-red" />,
  warning: <AlertTriangle className="w-5 h-5 text-orange" />,
  info: <Info className="w-5 h-5 text-blue" />,
};

const Toast = ({
  id,
  type,
  title,
  message,
  duration = 4000,
  onDismiss,
}: ToastProps) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onDismiss(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);
  
  return (
    <div
      className={cn(
        "w-full max-w-sm",
        "bg-background/95 backdrop-blur-xl",
        "rounded-xl shadow-lg border border-separator",
        "p-4 flex items-start gap-3",
        "animate-slide-in-right"
      )}
    >
      {toastIcons[type]}
      <div className="flex-1 min-w-0">
        <p className="text-body font-medium text-label">{title}</p>
        {message && (
          <p className="text-footnote text-label-secondary mt-0.5">{message}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="flex-shrink-0 p-1 hover:bg-fill rounded"
      >
        <X className="w-4 h-4 text-label-tertiary" />
      </button>
    </div>
  );
};
```

### Toast Container

```tsx
interface ToastContainerProps {
  toasts: ToastProps[];
  onDismiss: (id: string) => void;
}

const ToastContainer = ({ toasts, onDismiss }: ToastContainerProps) => (
  <div className="fixed top-4 right-4 z-50 space-y-2">
    {toasts.map((toast) => (
      <Toast key={toast.id} {...toast} onDismiss={onDismiss} />
    ))}
  </div>
);
```

### Toast Hook

```tsx
const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);
  
  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onDismiss'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...toast, id, onDismiss: removeToast }]);
    return id;
  }, []);
  
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  
  const toast = {
    success: (title: string, message?: string) =>
      addToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      addToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      addToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      addToast({ type: 'info', title, message }),
  };
  
  return { toasts, toast, removeToast };
};
```

## Status Indicators

### Badge Component

```tsx
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const badgeVariants = {
  default: "bg-fill text-label",
  success: "bg-green/15 text-green",
  warning: "bg-orange/15 text-orange",
  error: "bg-red/15 text-red",
  info: "bg-blue/15 text-blue",
};

const Badge = ({ variant = 'default', children }: BadgeProps) => (
  <span
    className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full",
      "text-caption-1 font-medium",
      badgeVariants[variant]
    )}
  >
    {children}
  </span>
);
```

### Status Dot

```tsx
interface StatusDotProps {
  status: 'online' | 'away' | 'busy' | 'offline';
  size?: 'sm' | 'md';
}

const statusColors = {
  online: "bg-green",
  away: "bg-yellow",
  busy: "bg-red",
  offline: "bg-label-quaternary",
};

const StatusDot = ({ status, size = 'sm' }: StatusDotProps) => (
  <span
    className={cn(
      "rounded-full",
      statusColors[status],
      size === 'sm' ? "w-2 h-2" : "w-3 h-3"
    )}
  />
);
```

## Best Practices

### Do's

- ✅ Provide immediate feedback for all actions
- ✅ Use appropriate loading indicators for duration
- ✅ Show helpful error messages with recovery options
- ✅ Design meaningful empty states
- ✅ Auto-dismiss non-critical notifications
- ✅ Maintain context during loading states

### Don'ts

- ❌ Leave users waiting without feedback
- ❌ Show technical error messages
- ❌ Use spinners for long operations
- ❌ Block the entire UI unnecessarily
- ❌ Stack too many notifications
- ❌ Use empty states without guidance

---

*Next: [10-motion-animation.md](./10-motion-animation.md) - Transitions and micro-interactions*
