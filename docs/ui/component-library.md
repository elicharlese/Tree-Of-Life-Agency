# Tree of Life Agency - Component Library Documentation

## Overview

The Tree of Life Agency component library is built with React 18, TypeScript 5.0, and Tailwind CSS, following atomic design principles and Windsurf Global Rules for consistent, reusable UI components.

## Design System

### Color Palette

```css
/* Primary Colors */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;

/* Semantic Colors */
--color-success: #10b981;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Neutral Colors */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-500: #6b7280;
--color-gray-900: #111827;
```

### Typography Scale

```css
/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System

```css
/* Spacing Scale (based on 0.25rem = 4px) */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## Core Components

### Button Component

A versatile button component with multiple variants and sizes.

```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

#### Usage Examples

```tsx
// Primary button
<Button variant="primary" size="md">
  Save Changes
</Button>

// Button with icon
<Button variant="outline" leftIcon={<Plus />}>
  Add User
</Button>

// Loading state
<Button variant="primary" isLoading>
  Processing...
</Button>

// Full width button
<Button variant="primary" fullWidth>
  Sign In
</Button>
```

#### Variants

| Variant | Use Case | Visual Style |
|---------|----------|-------------|
| `primary` | Main actions, CTAs | Solid indigo background |
| `secondary` | Secondary actions | Solid gray background |
| `outline` | Alternative actions | White background with border |
| `ghost` | Subtle actions | Transparent background |
| `danger` | Destructive actions | Solid red background |
| `success` | Positive actions | Solid green background |

#### Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| `xs` | 28px | 10px 12px | 12px |
| `sm` | 32px | 8px 12px | 14px |
| `md` | 36px | 10px 16px | 14px |
| `lg` | 44px | 12px 24px | 16px |
| `xl` | 52px | 16px 32px | 18px |

### Input Component

A flexible input component with validation and icon support.

```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}
```

#### Usage Examples

```tsx
// Basic input
<Input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
/>

// Input with validation
<Input
  label="Password"
  type="password"
  error="Password must be at least 8 characters"
/>

// Input with icons
<Input
  label="Search"
  leftIcon={<Search />}
  rightIcon={<Filter />}
  placeholder="Search users..."
/>
```

### Card Component

A flexible container component for grouping related content.

```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}
```

#### Usage Examples

```tsx
// Basic card
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <p>User information goes here...</p>
  </CardContent>
  <CardFooter>
    <Button variant="primary">Edit Profile</Button>
  </CardFooter>
</Card>

// Card with hover effect
<Card hover shadow="md">
  <CardContent>
    <h3>Interactive Card</h3>
    <p>This card has hover effects</p>
  </CardContent>
</Card>
```

### Alert Component

A component for displaying important messages to users.

```typescript
interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}
```

#### Usage Examples

```tsx
// Success alert
<Alert variant="success" title="Success!">
  Your changes have been saved successfully.
</Alert>

// Error alert with close button
<Alert 
  variant="error" 
  title="Error" 
  onClose={() => setError(null)}
>
  Something went wrong. Please try again.
</Alert>
```

## Layout Components

### Page Layout

Standard page layout with header, sidebar, and content areas.

```tsx
<PageLayout>
  <PageHeader>
    <PageTitle>Dashboard</PageTitle>
    <PageActions>
      <Button variant="primary">New Item</Button>
    </PageActions>
  </PageHeader>
  
  <PageContent>
    {/* Main content */}
  </PageContent>
</PageLayout>
```

### Grid System

Responsive grid system using CSS Grid and Flexbox.

```tsx
// Responsive grid
<Grid cols={1} md={2} lg={3} gap={6}>
  <GridItem>Content 1</GridItem>
  <GridItem>Content 2</GridItem>
  <GridItem>Content 3</GridItem>
</Grid>

// Flex layout
<Flex direction="row" align="center" justify="between">
  <FlexItem>Left content</FlexItem>
  <FlexItem>Right content</FlexItem>
</Flex>
```

## Form Components

### Form Field

Wrapper component for form inputs with consistent styling.

```tsx
<FormField>
  <FormLabel required>Email Address</FormLabel>
  <FormInput 
    type="email" 
    placeholder="Enter your email"
    error={errors.email}
  />
  <FormHelperText>
    We'll never share your email with anyone else.
  </FormHelperText>
</FormField>
```

### Form Validation

Integration with form validation libraries.

```tsx
// Using react-hook-form
const { register, handleSubmit, formState: { errors } } = useForm();

<form onSubmit={handleSubmit(onSubmit)}>
  <FormField>
    <FormLabel>Email</FormLabel>
    <FormInput
      {...register('email', { required: 'Email is required' })}
      error={errors.email?.message}
    />
  </FormField>
</form>
```

## Navigation Components

### Navigation Menu

Hierarchical navigation with role-based visibility.

```tsx
<NavigationMenu>
  <NavigationItem href="/dashboard" icon={<Home />}>
    Dashboard
  </NavigationItem>
  
  <NavigationGroup title="Management" requiredRole="AGENT">
    <NavigationItem href="/customers" icon={<Users />}>
      Customers
    </NavigationItem>
    <NavigationItem href="/projects" icon={<Briefcase />}>
      Projects
    </NavigationItem>
  </NavigationGroup>
  
  <NavigationGroup title="Administration" requiredRole="ADMIN">
    <NavigationItem href="/users" icon={<UserCog />}>
      Users
    </NavigationItem>
    <NavigationItem href="/invitations" icon={<UserPlus />}>
      Invitations
    </NavigationItem>
  </NavigationGroup>
</NavigationMenu>
```

### Breadcrumbs

Navigation breadcrumbs for deep page hierarchies.

```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
  <BreadcrumbItem href="/customers">Customers</BreadcrumbItem>
  <BreadcrumbItem current>John Doe</BreadcrumbItem>
</Breadcrumbs>
```

## Data Display Components

### Table Component

Responsive table with sorting, filtering, and pagination.

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableCell sortable sortKey="name">Name</TableCell>
      <TableCell sortable sortKey="email">Email</TableCell>
      <TableCell sortable sortKey="role">Role</TableCell>
      <TableCell>Actions</TableCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    {users.map(user => (
      <TableRow key={user.id}>
        <TableCell>{user.name}</TableCell>
        <TableCell>{user.email}</TableCell>
        <TableCell>
          <Badge variant={getRoleVariant(user.role)}>
            {user.role}
          </Badge>
        </TableCell>
        <TableCell>
          <Button size="sm" variant="outline">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Badge Component

Small status indicators and labels.

```tsx
// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Expired</Badge>

// Role badges
<Badge variant="primary">ADMIN</Badge>
<Badge variant="secondary">AGENT</Badge>
<Badge variant="outline">CLIENT</Badge>
```

## Feedback Components

### Loading States

Various loading indicators for different contexts.

```tsx
// Spinner
<Spinner size="sm" />
<Spinner size="md" color="primary" />

// Skeleton loading
<Skeleton height={20} width="100%" />
<Skeleton height={40} width={200} />

// Loading overlay
<LoadingOverlay visible={isLoading}>
  <div>Content being loaded...</div>
</LoadingOverlay>
```

### Toast Notifications

Temporary notifications for user feedback.

```tsx
// Success toast
toast.success('Changes saved successfully!');

// Error toast
toast.error('Something went wrong. Please try again.');

// Custom toast
toast.custom(
  <Alert variant="info" title="Information">
    Your session will expire in 5 minutes.
  </Alert>
);
```

## Modal Components

### Modal Dialog

Overlay dialogs for focused interactions.

```tsx
<Modal isOpen={isOpen} onClose={onClose} size="md">
  <ModalHeader>
    <ModalTitle>Confirm Deletion</ModalTitle>
  </ModalHeader>
  <ModalBody>
    <p>Are you sure you want to delete this user?</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={onClose}>
      Cancel
    </Button>
    <Button variant="danger" onClick={onConfirm}>
      Delete
    </Button>
  </ModalFooter>
</Modal>
```

### Drawer Component

Slide-out panels for additional content.

```tsx
<Drawer isOpen={isOpen} onClose={onClose} position="right">
  <DrawerHeader>
    <DrawerTitle>User Details</DrawerTitle>
  </DrawerHeader>
  <DrawerBody>
    {/* User details content */}
  </DrawerBody>
</Drawer>
```

## Accessibility Guidelines

### Keyboard Navigation

All interactive components support keyboard navigation:

- **Tab**: Navigate between focusable elements
- **Enter/Space**: Activate buttons and links
- **Arrow Keys**: Navigate within component groups
- **Escape**: Close modals and dropdowns

### Screen Reader Support

Components include proper ARIA attributes:

```tsx
// Button with aria-label
<Button aria-label="Close dialog" onClick={onClose}>
  <X />
</Button>

// Input with aria-describedby
<Input
  aria-describedby="email-error"
  error="Invalid email format"
/>
<div id="email-error" role="alert">
  Invalid email format
</div>
```

### Color Contrast

All text and interactive elements meet WCAG AA standards:

- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **Interactive elements**: 3:1 contrast ratio minimum

## Responsive Design

### Breakpoints

```css
/* Mobile First Approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Medium devices */
--breakpoint-lg: 1024px;  /* Large devices */
--breakpoint-xl: 1280px;  /* Extra large devices */
```

### Responsive Utilities

```tsx
// Responsive grid
<Grid cols={1} sm={2} md={3} lg={4}>
  {/* Grid items */}
</Grid>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</div>

// Responsive visibility
<div className="block md:hidden">
  Mobile only content
</div>
<div className="hidden md:block">
  Desktop only content
</div>
```

## Performance Optimization

### Code Splitting

Components are lazy-loaded to reduce initial bundle size:

```tsx
// Lazy load heavy components
const DataVisualization = lazy(() => import('./DataVisualization'));

// Use with Suspense
<Suspense fallback={<Spinner />}>
  <DataVisualization data={data} />
</Suspense>
```

### Bundle Analysis

Regular bundle analysis ensures optimal performance:

```bash
# Analyze bundle size
npm run analyze

# Performance budget
npm run build:analyze
```

## Testing Strategy

### Component Testing

All components include comprehensive tests:

```tsx
// Button component test
describe('Button', () => {
  it('renders with correct variant styles', () => {
    render(<Button variant="primary">Click me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-indigo-600');
  });

  it('handles loading state', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Visual Regression Testing

Storybook stories with visual testing:

```tsx
// Button.stories.tsx
export const AllVariants: Story = {
  render: () => (
    <div className="space-x-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};
```

## Usage Guidelines

### Do's and Don'ts

#### ✅ Do's
- Use semantic HTML elements
- Follow the established design system
- Include proper ARIA attributes
- Test with keyboard navigation
- Provide loading states for async operations

#### ❌ Don'ts
- Override component styles with custom CSS
- Use colors outside the design system
- Forget to handle error states
- Ignore accessibility requirements
- Create one-off components without reusability

### Component Composition

Build complex interfaces by composing simple components:

```tsx
// Good: Composable components
<Card>
  <CardHeader>
    <Flex justify="between" align="center">
      <CardTitle>User Profile</CardTitle>
      <Button size="sm" variant="outline">Edit</Button>
    </Flex>
  </CardHeader>
  <CardContent>
    <UserAvatar user={user} />
    <UserDetails user={user} />
  </CardContent>
</Card>
```

## Contributing

### Adding New Components

1. Create component in `libs/shared-ui/components/`
2. Include TypeScript interfaces
3. Add comprehensive tests
4. Create Storybook stories
5. Update documentation
6. Add to component index

### Component Checklist

- [ ] TypeScript interfaces defined
- [ ] Accessibility attributes included
- [ ] Responsive design implemented
- [ ] Loading and error states handled
- [ ] Tests written and passing
- [ ] Storybook stories created
- [ ] Documentation updated
