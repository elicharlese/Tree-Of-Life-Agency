# Usage Guide

This guide provides practical examples and best practices for using the ECE-AGENT design system in your applications.

## 🚀 Getting Started

### Installation

```bash
# Install the design system package
npm install @ece-agent/design-system

# Or with yarn
yarn add @ece-agent/design-system
```

### Basic Setup

```tsx
// In your app root (e.g., app/layout.tsx or src/App.tsx)
import { ThemeProvider } from '@/libs/shared-ui/src/app-components/theme-provider';
import '@/libs/design-system/styles/globals.css';

function App({ children }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ece-agent-theme">
      {children}
    </ThemeProvider>
  );
}
```

### Importing Components

```tsx
// Import individual components
import { Button, Card, Input } from '@/libs/design-system';

// Import patterns
import { Container, Grid } from '@/libs/design-system/patterns/layouts';

// Import utilities
import { cn } from '@/libs/design-system/utils';
```

## 🎨 Basic Usage Examples

### Simple Button

```tsx
import { Button } from '@/libs/design-system';

function MyComponent() {
  return (
    <Button onClick={() => console.log('Clicked!')}>
      Click me
    </Button>
  );
}
```

### Form with Validation

```tsx
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system';

function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your message"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full">
            Send Message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Data Display

```tsx
import { Card, CardContent, CardHeader, CardTitle, Badge, Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system';

function UserProfile({ user }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
            {user.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            Joined {user.joinDate}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 🎯 Advanced Patterns

### Loading States

```tsx
import { Button, Skeleton, Card, CardContent } from '@/libs/design-system';

function LoadingExample({ loading, data }) {
  if (loading) {
    return (
      <Card>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <h3 className="text-lg font-semibold">{data.title}</h3>
        <p className="text-muted-foreground">{data.description}</p>
      </CardContent>
    </Card>
  );
}
```

### Error Handling

```tsx
import { Alert, AlertDescription, AlertTitle, Button } from '@/libs/design-system';

function ErrorExample({ error, onRetry }) {
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          {error.message}
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return <div>Content loaded successfully</div>;
}
```

### Responsive Layout

```tsx
import { Grid, Card, CardContent } from '@/libs/design-system';

function ResponsiveGrid({ items }) {
  return (
    <Grid columns={{ sm: 1, md: 2, lg: 3, xl: 4 }} gap="md">
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </Grid>
  );
}
```

## 🎨 Theming and Customization

### Using Theme Variables

```tsx
// Direct CSS variable usage
const customStyles = {
  backgroundColor: 'hsl(var(--primary))',
  color: 'hsl(var(--primary-foreground))',
  border: '1px solid hsl(var(--border))',
};
```

### Custom Component Styling

```tsx
import { cn } from '@/libs/design-system/utils';

function CustomButton({ className, ...props }) {
  return (
    <Button
      className={cn(
        'custom-button-styles',
        className
      )}
      {...props}
    />
  );
}
```

### Theme Overrides

```css
/* In your global CSS file */
:root {
  /* Override primary color */
  --primary: 220 89% 56%;

  /* Custom spacing */
  --spacing-4: 1.5rem;
}
```

## 📱 Responsive Design

### Breakpoint Usage

```tsx
// Using responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Content */}
</div>

// Responsive text sizes
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

### Mobile-First Components

```tsx
function ResponsiveComponent() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Sidebar className="w-full md:w-64" />
      <MainContent className="flex-1" />
    </div>
  );
}
```

## ♿ Accessibility

### Semantic HTML

```tsx
// Good: Semantic form structure
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend>Personal Information</legend>
    <Label htmlFor="name">Full Name</Label>
    <Input id="name" aria-describedby="name-help" />
    <div id="name-help">Enter your full legal name</div>
  </fieldset>
</form>
```

### Keyboard Navigation

```tsx
// Focus management
<Button
  onClick={handleAction}
  aria-label="Save document"
>
  <SaveIcon aria-hidden="true" />
</Button>
```

### Screen Reader Support

```tsx
// ARIA live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {message && <Alert>{message}</Alert>}
</div>
```

## 🔧 Utility Functions

### Class Name Merging

```tsx
import { cn } from '@/libs/design-system/utils';

function Component({ className, variant }) {
  return (
    <div
      className={cn(
        'base-styles',
        {
          'variant-primary': variant === 'primary',
          'variant-secondary': variant === 'secondary',
        },
        className
      )}
    >
      Content
    </div>
  );
}
```

### Responsive Utilities

```tsx
import { useResponsive } from '@/libs/design-system/hooks';

function ResponsiveComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

## 🧪 Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/libs/design-system';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Hello World</Button>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Accessibility Testing

```tsx
import { render } from '@testing-library/react';
import { axe } from 'jest-axe';

it('should be accessible', async () => {
  const { container } = render(<Button>Accessible Button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 🚀 Performance Optimization

### Code Splitting

```tsx
// Lazy load heavy components
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  { loading: () => <Skeleton /> }
);
```

### Memoization

```tsx
import { memo } from 'react';

const MemoizedComponent = memo(function Component({ data }) {
  return <div>{data.value}</div>;
});
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Check for unused exports
npm run lint:unused
```

## 📋 Best Practices

### Component Development

1. **Use TypeScript** for type safety
2. **Follow naming conventions** (`ComponentName.tsx`)
3. **Include comprehensive props** documentation
4. **Test all variants** and states
5. **Ensure accessibility** compliance

### Code Organization

```tsx
// Good: Clear component structure
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading && <Spinner />}
        {props.children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Error Boundaries

```tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}
```

## 🔍 Troubleshooting

### Common Issues

**Theme not applying:**
- Ensure `ThemeProvider` wraps your app
- Check CSS import order
- Verify CSS variables are defined

**Components not responsive:**
- Use responsive utilities from Tailwind
- Test on different screen sizes
- Check breakpoint definitions

**Accessibility warnings:**
- Run accessibility audits
- Use semantic HTML elements
- Include proper ARIA attributes

### Debug Tools

```tsx
// Development helpers
if (process.env.NODE_ENV === 'development') {
  // Show theme debug info
  console.log('Current theme:', theme);

  // Show component props
  console.log('Component props:', props);
}
```

## 📚 Additional Resources

- [Design Tokens Reference](./design-tokens.md)
- [Component API Documentation](./components.md)
- [Theming Guide](./theming.md)
- [Pattern Library](./patterns.md)
- [Contributing Guidelines](../CONTRIBUTING.md)