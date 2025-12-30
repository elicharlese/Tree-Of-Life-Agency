# Components

Our design system provides a comprehensive set of reusable UI components built with React, TypeScript, and modern accessibility standards. All components follow consistent APIs and support theming, responsive design, and accessibility.

## 🧩 Component Architecture

Components are organized into three layers:

### Primitives
Low-level, highly reusable components that form the foundation of the design system.

### Patterns
Mid-level components that combine primitives into common interaction patterns.

### Components
High-level, feature-rich components for specific use cases.

## 🎯 Button Component

The Button component is our most fundamental interactive element, supporting multiple variants and states.

### Variants

```tsx
import { Button } from '@/libs/design-system';

// Primary action buttons
<Button variant="primary">Save Changes</Button>

// Secondary actions
<Button variant="secondary">Cancel</Button>

// Subtle actions
<Button variant="ghost">Edit</Button>

// Outlined buttons
<Button variant="outline">Learn More</Button>

// Destructive actions
<Button variant="destructive">Delete</Button>

// Success states
<Button variant="success">Confirm</Button>

// Warning states
<Button variant="warning">Proceed with Caution</Button>

// AI-themed buttons
<Button variant="ai">Ask AI</Button>

// Human-themed buttons
<Button variant="human">Human Response</Button>

// Gradient buttons
<Button variant="gradient">Get Started</Button>
```

### Sizes

```tsx
// Extra small
<Button size="xs">XS Button</Button>

// Small
<Button size="sm">Small Button</Button>

// Medium (default)
<Button size="md">Medium Button</Button>

// Large
<Button size="lg">Large Button</Button>

// Extra large
<Button size="xl">XL Button</Button>

// Icon-only buttons
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

### States and Features

```tsx
// Loading state
<Button loading>Processing...</Button>

// Disabled state
<Button disabled>Unavailable</Button>

// Full width
<Button fullWidth>Full Width Button</Button>

// With icons
<Button leftIcon={<Star className="h-4 w-4" />}>
  Favorite
</Button>

<Button rightIcon={<ChevronRight className="h-4 w-4" />}>
  Continue
</Button>
```

### Props API

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'success' | 'warning' | 'ai' | 'human' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}
```

## ✨ ShinyButton Component

A premium button component with glassmorphic effects and animated sheen.

### Basic Usage

```tsx
import { ShinyButton } from '@/libs/design-system';

<ShinyButton>Premium Action</ShinyButton>
```

### Variants

```tsx
// Primary (default)
<ShinyButton variant="primary">Get Started</ShinyButton>

// Secondary
<ShinyButton variant="secondary">Learn More</ShinyButton>

// Glass effect
<ShinyButton variant="glass">Explore</ShinyButton>
```

### Sizes

```tsx
<ShinyButton size="md">Medium</ShinyButton>
<ShinyButton size="lg">Large</ShinyButton>
```

### Features

- **Glassmorphism**: Frosted glass effect with backdrop blur
- **Animated Sheen**: Moving highlight effect on hover
- **3D Transform**: Subtle perspective and rotation effects
- **Theme Aware**: Adapts to light/dark themes automatically

## 📝 Input Components

Form input components with consistent styling and validation states.

### Text Input

```tsx
import { Input } from '@/libs/design-system';

<Input placeholder="Enter your name" />
<Input type="email" placeholder="Enter your email" />
<Input type="password" placeholder="Enter your password" />
```

### Textarea

```tsx
import { Textarea } from '@/libs/design-system';

<Textarea
  placeholder="Enter your message"
  rows={4}
/>
```

### Select

```tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/libs/design-system';

<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

## 🏷️ Badge Component

Status indicators and labels with semantic colors.

```tsx
import { Badge } from '@/libs/design-system';

// Status badges
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>

// Semantic badges
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
```

## 🃏 Card Component

Content containers with flexible layouts.

```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/libs/design-system';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
</Card>
```

## 📱 Dialog/Modal Components

Overlay components for confirmations and complex interactions.

### Alert Dialog

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/libs/design-system';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Item</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Regular Dialog

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/libs/design-system';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div>Dialog content</div>
  </DialogContent>
</Dialog>
```

## 📊 Data Display Components

### Table

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/libs/design-system';

<Table>
  <TableCaption>A list of recent activities</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell><Badge variant="success">Active</Badge></TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Avatar

```tsx
import { Avatar, AvatarFallback, AvatarImage } from '@/libs/design-system';

<Avatar>
  <AvatarImage src="/avatar.jpg" alt="User" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

## 🎛️ Interactive Components

### Tabs

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/libs/design-system';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
    <TabsTrigger value="advanced">Advanced</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    Overview content
  </TabsContent>
  <TabsContent value="settings">
    Settings content
  </TabsContent>
</Tabs>
```

### Switch

```tsx
import { Switch } from '@/libs/design-system';

<Switch />
```

### Slider

```tsx
import { Slider } from '@/libs/design-system';

<Slider defaultValue={[50]} max={100} step={1} />
```

## 🎨 Advanced Components

### TiltGlassCard

A premium card component with 3D tilt effects and glassmorphism.

```tsx
import { TiltGlassCard } from '@/libs/design-system';

<TiltGlassCard>
  <h3>Premium Content</h3>
  <p>Enhanced with 3D effects</p>
</TiltGlassCard>
```

### GlassmorphicCard

A modern glassmorphic card with frosted glass effect, no borders, and subtle hover animations.

```tsx
// Glassmorphic Card Pattern (Tailwind CSS)
<div className={cn(
  // Base layout
  "rounded-2xl p-4 transition-all duration-200",
  // Glassmorphic background
  "bg-white/60 dark:bg-white/[0.06]",
  "backdrop-blur-xl backdrop-saturate-150",
  // Subtle inner glow (glass effect)
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(255,255,255,0.15)]",
  "dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(255,255,255,0.03)]",
  // Outer shadow for depth
  "shadow-sm hover:shadow-md",
  // No border, subtle hover lift
  "border-0 hover:translate-y-[-2px]"
)}>
  <h3>Card Title</h3>
  <p>Card content with glassmorphic styling</p>
</div>
```

**Features:**
- **Frosted Glass**: Semi-transparent background with backdrop blur
- **No Borders**: Clean, modern appearance without visible borders
- **Inner Glow**: Subtle inset shadows create glass-like depth
- **Hover Lift**: Smooth translateY animation on hover
- **Theme Aware**: Adapts opacity and shadows for light/dark modes

**Usage Guidelines:**
- Use for cards that need visual prominence without heavy borders
- Ideal for project cards, feature cards, and interactive list items
- Combine with colored avatar/icon elements for visual hierarchy
- Works best on backgrounds with some visual texture or gradient

### GridOverlay

Development utility for alignment and spacing visualization.

```tsx
import { GridOverlay } from '@/libs/design-system';

// Only show in development
{process.env.NODE_ENV === 'development' && <GridOverlay />}
```

### HeroCopy

Marketing text component with gradient effects.

```tsx
import { HeroCopy } from '@/libs/design-system';

<HeroCopy
  title="Welcome to ECE-AGENT"
  subtitle="The future of AI-powered collaboration"
  gradient="primary"
/>
```

## ♿ Accessibility Features

All components include built-in accessibility features:

- **ARIA attributes**: Proper labeling and descriptions
- **Keyboard navigation**: Full keyboard support
- **Focus management**: Visible focus indicators
- **Screen reader support**: Semantic markup and announcements
- **Color contrast**: WCAG 2.1 AA compliant colors
- **Reduced motion**: Respects `prefers-reduced-motion`

## 🎯 Usage Patterns

### Form Composition

```tsx
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from '@/libs/design-system';

<Card>
  <CardHeader>
    <CardTitle>Contact Information</CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" placeholder="Enter your name" />
    </div>
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="Enter your email" />
    </div>
    <Button>Submit</Button>
  </CardContent>
</Card>
```

### Loading States

```tsx
import { Button, Skeleton, Card, CardContent } from '@/libs/design-system';

// Loading button
<Button loading>Processing...</Button>

// Loading card
<Card>
  <CardContent className="space-y-4">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-8 w-full" />
  </CardContent>
</Card>
```

### Error States

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/libs/design-system';

<Alert variant="destructive">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Something went wrong. Please try again.
  </AlertDescription>
</Alert>
```

## 🔧 Component Development Guidelines

### Creating New Components

1. **Use TypeScript** with proper prop interfaces
2. **Implement variants** using Class Variance Authority (CVA)
3. **Support theming** with CSS custom properties
4. **Include accessibility** features (ARIA, keyboard navigation)
5. **Add comprehensive documentation** with examples
6. **Test across themes** (light/dark)
7. **Follow naming conventions** (`ComponentName.tsx`, `ComponentName.test.tsx`)

### Component API Design

```typescript
// Good: Clear, typed props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

// Avoid: Generic or unclear props
interface GenericButtonProps {
  style?: string; // Too vague
  config?: any;   // Not type-safe
}
```

### Styling Guidelines

- Use design tokens instead of hardcoded values
- Prefer utility classes over custom CSS
- Support both light and dark themes
- Ensure responsive design
- Test component combinations