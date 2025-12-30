# 06 - Buttons & Controls

> Apple HIG guidelines for buttons, toggles, sliders, pickers, and other interactive controls in AGENT.

## Button Types

### System Button Styles

| Style | Usage | Appearance |
|-------|-------|------------|
| **Filled** | Primary actions | Solid background, contrasting text |
| **Tinted** | Secondary actions | Tinted background, matching text |
| **Gray** | Neutral actions | Gray background, dark text |
| **Plain** | Tertiary actions | No background, colored text |
| **Borderless** | Inline actions | No background, system blue text |

### Button Sizes

| Size | Height | Padding | Font |
|------|--------|---------|------|
| **Large** | 50pt | 20pt horizontal | 17pt Semibold |
| **Regular** | 44pt | 16pt horizontal | 17pt |
| **Small** | 32pt | 12pt horizontal | 15pt |
| **Mini** | 28pt | 8pt horizontal | 13pt |

### Button Component

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  [
    "inline-flex items-center justify-center gap-2",
    "font-medium rounded-xl",
    "transition-all duration-200",
    "focus:outline-none focus:ring-2 focus:ring-offset-2",
    "disabled:opacity-50 disabled:pointer-events-none",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        filled: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90",
          "focus:ring-primary",
        ],
        tinted: [
          "bg-primary/15 text-primary",
          "hover:bg-primary/25",
          "focus:ring-primary",
        ],
        gray: [
          "bg-fill text-label",
          "hover:bg-fill-secondary",
          "focus:ring-gray-400",
        ],
        plain: [
          "text-primary",
          "hover:bg-primary/10",
          "focus:ring-primary",
        ],
        destructive: [
          "bg-red text-white",
          "hover:bg-red/90",
          "focus:ring-red",
        ],
        destructiveTinted: [
          "bg-red/15 text-red",
          "hover:bg-red/25",
          "focus:ring-red",
        ],
      },
      size: {
        large: "h-[50px] px-5 text-body font-semibold",
        regular: "h-11 px-4 text-body",
        small: "h-8 px-3 text-subheadline",
        mini: "h-7 px-2 text-footnote",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "regular",
      fullWidth: false,
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
}

const Button = ({
  variant,
  size,
  fullWidth,
  leftIcon,
  rightIcon,
  loading,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) => (
  <button
    className={cn(buttonVariants({ variant, size, fullWidth }), className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? (
      <Spinner className="w-4 h-4 animate-spin" />
    ) : (
      leftIcon
    )}
    {children}
    {rightIcon}
  </button>
);
```

### Button Usage Examples

```tsx
// Primary action
<Button variant="filled" size="large" fullWidth>
  Start New Chat
</Button>

// Secondary action
<Button variant="tinted">
  <Plus className="w-4 h-4" />
  Add Project
</Button>

// Destructive action
<Button variant="destructive">
  Delete Conversation
</Button>

// Icon-only button
<Button variant="plain" size="small" aria-label="Settings">
  <Settings className="w-5 h-5" />
</Button>

// Loading state
<Button variant="filled" loading>
  Sending...
</Button>
```

## Toggle / Switch

The toggle (switch) is used for binary on/off settings.

### Toggle Component

```tsx
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
}

const Toggle = ({
  checked,
  onChange,
  disabled = false,
  label,
  description,
}: ToggleProps) => (
  <label
    className={cn(
      "flex items-center justify-between gap-4 py-3",
      disabled && "opacity-50 pointer-events-none"
    )}
  >
    {/* Label */}
    {(label || description) && (
      <div className="flex-1">
        {label && <span className="text-body text-label">{label}</span>}
        {description && (
          <p className="text-footnote text-label-secondary mt-0.5">
            {description}
          </p>
        )}
      </div>
    )}
    
    {/* Switch */}
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative w-[51px] h-[31px] rounded-full",
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        checked ? "bg-primary" : "bg-fill"
      )}
    >
      <span
        className={cn(
          "absolute top-[2px] w-[27px] h-[27px]",
          "bg-white rounded-full shadow-md",
          "transition-transform duration-200",
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        )}
      />
    </button>
  </label>
);
```

### Toggle Guidelines

- **Size**: 51×31pt (fixed, do not resize)
- **Animation**: 200ms ease transition
- **Color**: Green (#34C759) when on, gray fill when off
- **Label**: Always provide accessible label

## Slider

Sliders allow selection of a value from a continuous range.

### Slider Component

```tsx
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  minIcon?: React.ReactNode;
  maxIcon?: React.ReactNode;
}

const Slider = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  showValue = false,
  minIcon,
  maxIcon,
}: SliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={cn(
      "flex items-center gap-3",
      disabled && "opacity-50 pointer-events-none"
    )}>
      {/* Min icon */}
      {minIcon && (
        <span className="text-label-secondary">{minIcon}</span>
      )}
      
      {/* Track */}
      <div className="relative flex-1 h-[4px]">
        {/* Background track */}
        <div className="absolute inset-0 bg-fill rounded-full" />
        
        {/* Filled track */}
        <div
          className="absolute inset-y-0 left-0 bg-primary rounded-full"
          style={{ width: `${percentage}%` }}
        />
        
        {/* Thumb */}
        <input
          type="range"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            "absolute inset-0 w-full opacity-0 cursor-pointer",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-white",
            "[&::-webkit-slider-thumb]:shadow-lg",
            "[&::-webkit-slider-thumb]:cursor-pointer"
          )}
        />
        
        {/* Visual thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white rounded-full shadow-lg pointer-events-none"
          style={{ left: `calc(${percentage}% - 14px)` }}
        />
      </div>
      
      {/* Max icon */}
      {maxIcon && (
        <span className="text-label-secondary">{maxIcon}</span>
      )}
      
      {/* Value display */}
      {showValue && (
        <span className="text-body text-label min-w-[40px] text-right">
          {value}
        </span>
      )}
    </div>
  );
};
```

## Segmented Control

For switching between related views or modes.

### Segmented Control Component

```tsx
interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  size?: 'regular' | 'small';
}

const SegmentedControl = ({
  options,
  value,
  onChange,
  size = 'regular',
}: SegmentedControlProps) => {
  const activeIndex = options.findIndex(o => o.value === value);
  
  return (
    <div
      className={cn(
        "inline-flex bg-fill rounded-lg p-0.5",
        size === 'regular' ? "h-8" : "h-7"
      )}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "relative px-4 rounded-md",
            "transition-colors duration-200",
            size === 'regular' ? "text-subheadline" : "text-footnote",
            option.value === value
              ? "text-label"
              : "text-label-secondary hover:text-label"
          )}
        >
          {/* Active background */}
          {option.value === value && (
            <span className="absolute inset-0.5 bg-background rounded-md shadow-sm" />
          )}
          <span className="relative">{option.label}</span>
        </button>
      ))}
    </div>
  );
};
```

## Stepper

For incrementing/decrementing numeric values.

### Stepper Component

```tsx
interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

const Stepper = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
}: StepperProps) => (
  <div className={cn(
    "inline-flex items-center bg-fill rounded-lg overflow-hidden",
    disabled && "opacity-50 pointer-events-none"
  )}>
    <button
      onClick={() => onChange(Math.max(min, value - step))}
      disabled={disabled || value <= min}
      className={cn(
        "w-11 h-8 flex items-center justify-center",
        "text-primary",
        "hover:bg-fill-secondary",
        "disabled:text-label-quaternary"
      )}
      aria-label="Decrease"
    >
      <Minus className="w-4 h-4" />
    </button>
    
    <div className="w-px h-5 bg-separator" />
    
    <button
      onClick={() => onChange(Math.min(max, value + step))}
      disabled={disabled || value >= max}
      className={cn(
        "w-11 h-8 flex items-center justify-center",
        "text-primary",
        "hover:bg-fill-secondary",
        "disabled:text-label-quaternary"
      )}
      aria-label="Increase"
    >
      <Plus className="w-4 h-4" />
    </button>
  </div>
);
```

## Picker

For selecting from a list of options.

### Picker Trigger

```tsx
interface PickerProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Picker = ({
  value,
  options,
  onChange,
  placeholder = "Select...",
  disabled = false,
}: PickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.value === value);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-11 px-4 rounded-lg",
          "bg-fill text-left",
          "flex items-center justify-between",
          disabled && "opacity-50"
        )}
      >
        <span className={cn(
          "text-body",
          selectedOption ? "text-label" : "text-label-quaternary"
        )}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-label-secondary" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background rounded-lg shadow-lg border border-separator overflow-hidden z-50">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-3 text-left text-body",
                "hover:bg-fill-secondary",
                option.value === value && "text-primary"
              )}
            >
              {option.label}
              {option.value === value && (
                <Check className="w-4 h-4 float-right" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

## Text Input

### Text Field Component

```tsx
interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const TextField = ({
  label,
  error,
  helper,
  leftIcon,
  rightIcon,
  className,
  ...props
}: TextFieldProps) => (
  <div className="space-y-1.5">
    {label && (
      <label className="text-subheadline text-label-secondary">
        {label}
      </label>
    )}
    
    <div className="relative">
      {leftIcon && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-tertiary">
          {leftIcon}
        </span>
      )}
      
      <input
        className={cn(
          "w-full h-11 px-4 rounded-lg",
          "bg-fill text-body text-label",
          "placeholder:text-label-quaternary",
          "focus:outline-none focus:ring-2 focus:ring-primary",
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          error && "ring-2 ring-red",
          className
        )}
        {...props}
      />
      
      {rightIcon && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-label-tertiary">
          {rightIcon}
        </span>
      )}
    </div>
    
    {(error || helper) && (
      <p className={cn(
        "text-footnote",
        error ? "text-red" : "text-label-secondary"
      )}>
        {error || helper}
      </p>
    )}
  </div>
);
```

## Best Practices

### Do's

- ✅ Use appropriate button styles for action importance
- ✅ Maintain 44pt minimum touch targets
- ✅ Provide visual feedback on interaction
- ✅ Use system colors for standard controls
- ✅ Include loading states for async actions
- ✅ Support keyboard navigation

### Don'ts

- ❌ Use too many primary buttons on one screen
- ❌ Make controls smaller than 44pt
- ❌ Use custom colors for standard controls
- ❌ Disable buttons without explanation
- ❌ Hide important actions in menus
- ❌ Use sliders for precise value entry

---

*Next: [07-content-containers.md](./07-content-containers.md) - Cards, lists, and collection views*
