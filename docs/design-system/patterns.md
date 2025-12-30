# Patterns

Design patterns provide reusable solutions for common UI/UX challenges. Our design system includes layout patterns, interaction patterns, and composition patterns that ensure consistency across the platform.

## 📐 Layout Patterns

### Container Pattern

The Container pattern provides consistent content width and centering across different screen sizes.

```tsx
import { Container } from '@/libs/design-system/patterns/layouts';

function PageLayout() {
  return (
    <Container>
      <h1>Page Title</h1>
      <p>Page content goes here</p>
    </Container>
  );
}
```

**Features:**
- Responsive max-widths (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
- Automatic horizontal centering
- Consistent padding across breakpoints

### Grid Pattern

Flexible grid system for responsive layouts.

```tsx
import { Grid } from '@/libs/design-system/patterns/layouts';

function Dashboard() {
  return (
    <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="md">
      <Card>Widget 1</Card>
      <Card>Widget 2</Card>
      <Card>Widget 3</Card>
    </Grid>
  );
}
```

**Features:**
- Responsive column counts
- Configurable gaps
- Auto-fit and auto-fill options
- CSS Grid powered for performance

### Page Layout Pattern

Standard page structure with header, content, and footer areas.

```tsx
import { PageLayout } from '@/libs/design-system/patterns/layouts';

function AppPage() {
  return (
    <PageLayout
      header={<Header />}
      sidebar={<Sidebar />}
      footer={<Footer />}
    >
      <MainContent />
    </PageLayout>
  );
}
```

## 🎯 Interaction Patterns

### Loading States

Consistent loading experiences across the application.

#### Skeleton Loading

```tsx
import { Skeleton } from '@/libs/design-system';

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-20 w-full" />
      </CardContent>
    </Card>
  );
}
```

#### Button Loading States

```tsx
const [loading, setLoading] = useState(false);

<Button loading={loading} onClick={handleSubmit}>
  {loading ? 'Processing...' : 'Submit'}
</Button>
```

#### Page-Level Loading

```tsx
import { LoadingStates } from '@/libs/design-system/patterns';

function PageWithLoading() {
  const { data, loading, error } = useData();

  if (loading) return <LoadingStates.SkeletonPage />;
  if (error) return <LoadingStates.ErrorState />;

  return <PageContent data={data} />;
}
```

### Error States

Graceful error handling with user-friendly messages.

```tsx
import { ErrorBoundary } from '@/libs/design-system';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <AppContent />
    </ErrorBoundary>
  );
}

function ErrorFallback({ error, resetError }) {
  return (
    <div className="text-center py-12">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <Button onClick={resetError}>Try Again</Button>
    </div>
  );
}
```

### Empty States

Helpful guidance when there's no content to display.

```tsx
function EmptyChatState() {
  return (
    <div className="text-center py-12">
      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No messages yet</h3>
      <p className="text-muted-foreground mb-4">
        Start a conversation by sending a message below.
      </p>
      <Button>Send Message</Button>
    </div>
  );
}
```

## 📝 Form Patterns

### Basic Form Structure

```tsx
import { Label, Input, Textarea, Button } from '@/libs/design-system';

function ContactForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Enter your name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="Enter your email" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Enter your message" />
      </div>

      <Button type="submit">Send Message</Button>
    </form>
  );
}
```

### Form Validation

```tsx
import { useFormValidation } from '@/libs/design-system/hooks';

function ValidatedForm() {
  const { errors, validate } = useFormValidation();

  return (
    <form onSubmit={validate}>
      <Input
        error={errors.email}
        placeholder="Enter email"
      />
      {errors.email && (
        <p className="text-sm text-destructive">{errors.email}</p>
      )}
    </form>
  );
}
```

### Multi-Step Forms

```tsx
import { useMultiStepForm } from '@/libs/design-system/hooks';

function MultiStepForm() {
  const { currentStep, nextStep, prevStep, isLastStep } = useMultiStepForm(3);

  return (
    <div>
      <Progress value={(currentStep / 3) * 100} />

      {currentStep === 1 && <Step1 />}
      {currentStep === 2 && <Step2 />}
      {currentStep === 3 && <Step3 />}

      <div className="flex gap-2">
        {currentStep > 1 && (
          <Button variant="outline" onClick={prevStep}>
            Previous
          </Button>
        )}
        <Button onClick={isLastStep ? handleSubmit : nextStep}>
          {isLastStep ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
}
```

## 🔔 Notification Patterns

### Toast Notifications

```tsx
import { useToast } from '@/libs/shared-ui/hooks';

function ComponentWithToast() {
  const { toast } = useToast();

  const handleAction = () => {
    toast({
      title: 'Success!',
      description: 'Your action was completed successfully.',
    });
  };

  return <Button onClick={handleAction}>Do Action</Button>;
}
```

### Inline Alerts

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/libs/design-system';

function ErrorAlert() {
  return (
    <Alert variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Something went wrong. Please try again.
      </AlertDescription>
    </Alert>
  );
}
```

## 📊 Data Display Patterns

### Data Tables

```tsx
import { DataTable } from '@/libs/design-system/patterns';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', render: (value) => <Badge>{value}</Badge> },
];

function UserTable({ users }) {
  return (
    <DataTable
      data={users}
      columns={columns}
      searchable
      paginated
      selectable
    />
  );
}
```

### Cards Grid

```tsx
import { CardGrid } from '@/libs/design-system/patterns';

function ProjectGrid({ projects }) {
  return (
    <CardGrid columns={{ sm: 1, md: 2, lg: 3 }}>
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle>{project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{project.description}</p>
          </CardContent>
        </Card>
      ))}
    </CardGrid>
  );
}
```

### Charts and Visualizations

```tsx
import { ChartContainer } from '@/libs/design-system/patterns';

function AnalyticsChart({ data }) {
  return (
    <ChartContainer
      title="User Growth"
      description="Monthly active users over time"
    >
      <LineChart data={data} />
    </ChartContainer>
  );
}
```

## 🎨 Content Patterns

### Hero Section

```tsx
import { HeroSection } from '@/libs/design-system/patterns';

function LandingPage() {
  return (
    <HeroSection
      title="Welcome to ECE-AGENT"
      subtitle="The future of AI-powered collaboration"
      cta={<Button size="lg">Get Started</Button>}
      background="gradient"
    />
  );
}
```

### Feature Grid

```tsx
import { FeatureGrid } from '@/libs/design-system/patterns';

const features = [
  {
    icon: <Zap />,
    title: 'Fast Performance',
    description: 'Lightning-fast AI responses',
  },
  {
    icon: <Shield />,
    title: 'Secure',
    description: 'Enterprise-grade security',
  },
];

function Features() {
  return <FeatureGrid features={features} />;
}
```

### Testimonial Carousel

```tsx
import { TestimonialCarousel } from '@/libs/design-system/patterns';

function Testimonials() {
  return (
    <TestimonialCarousel
      testimonials={[
        {
          quote: 'Amazing platform!',
          author: 'John Doe',
          role: 'CEO',
          company: 'Tech Corp',
        },
      ]}
    />
  );
}
```

## 🔄 Navigation Patterns

### Top Navigation

```tsx
import { TopNav } from '@/libs/design-system/patterns';

function AppHeader() {
  return (
    <TopNav
      logo={<Logo />}
      navigation={[
        { label: 'Home', href: '/' },
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
      ]}
      actions={<UserMenu />}
    />
  );
}
```

### Sidebar Navigation

```tsx
import { SidebarNav } from '@/libs/design-system/patterns';

function AppSidebar() {
  return (
    <SidebarNav
      items={[
        {
          label: 'Dashboard',
          icon: <Home />,
          href: '/dashboard',
        },
        {
          label: 'Projects',
          icon: <Folder />,
          href: '/projects',
          children: [
            { label: 'All Projects', href: '/projects' },
            { label: 'Archived', href: '/projects/archived' },
          ],
        },
      ]}
    />
  );
}
```

### Breadcrumb Navigation

```tsx
import { Breadcrumbs } from '@/libs/design-system/patterns';

function PageHeader() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '/' },
        { label: 'Projects', href: '/projects' },
        { label: 'My Project', href: '/projects/123' },
      ]}
    />
  );
}
```

## 📱 Responsive Patterns

### Mobile-First Components

```tsx
import { ResponsiveContainer } from '@/libs/design-system/patterns';

function ResponsiveLayout() {
  return (
    <ResponsiveContainer>
      {/* Content automatically adapts to screen size */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>Item 1</Card>
        <Card>Item 2</Card>
        <Card>Item 3</Card>
      </div>
    </ResponsiveContainer>
  );
}
```

### Adaptive Components

```tsx
import { AdaptiveLayout } from '@/libs/design-system/patterns';

function AdaptiveDashboard() {
  return (
    <AdaptiveLayout
      mobile={<MobileDashboard />}
      tablet={<TabletDashboard />}
      desktop={<DesktopDashboard />}
    />
  );
}
```

## ♿ Accessibility Patterns

### Focus Management

```tsx
import { FocusTrap, useFocusManagement } from '@/libs/design-system/patterns';

function Modal({ isOpen, onClose }) {
  const { focusRef } = useFocusManagement(isOpen);

  return (
    <Dialog open={isOpen}>
      <FocusTrap>
        <div ref={focusRef}>
          <DialogContent>
            {/* Modal content */}
          </DialogContent>
        </div>
      </FocusTrap>
    </Dialog>
  );
}
```

### Screen Reader Support

```tsx
import { ScreenReaderOnly } from '@/libs/design-system/patterns';

function AccessibleButton() {
  return (
    <Button>
      <ScreenReaderOnly>Save document</ScreenReaderOnly>
      <SaveIcon aria-hidden="true" />
    </Button>
  );
}
```

### Keyboard Navigation

```tsx
import { useKeyboardNavigation } from '@/libs/design-system/hooks';

function KeyboardNavigableList({ items }) {
  const { focusedIndex, handleKeyDown } = useKeyboardNavigation(items.length);

  return (
    <ul onKeyDown={handleKeyDown} role="listbox">
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === focusedIndex}
          className={index === focusedIndex ? 'focused' : ''}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

## 🔧 Utility Patterns

### Conditional Rendering

```tsx
import { ConditionalRender } from '@/libs/design-system/patterns';

function UserProfile({ user, loading }) {
  return (
    <ConditionalRender
      condition={!loading}
      fallback={<Skeleton />}
      render={() => (
        <div>
          <h1>{user.name}</h1>
          <p>{user.bio}</p>
        </div>
      )}
    />
  );
}
```

### Data Fetching

```tsx
import { useDataFetching } from '@/libs/design-system/hooks';

function DataComponent() {
  const { data, loading, error, refetch } = useDataFetching('/api/data');

  return (
    <div>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={refetch} />}
      {data && <DataDisplay data={data} />}
    </div>
  );
}
```

### Debounced Input

```tsx
import { useDebouncedValue } from '@/libs/shared-ui/hooks';

function SearchInput() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);

  // Use debouncedQuery for API calls
  useEffect(() => {
    if (debouncedQuery) {
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <Input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

## 📋 Best Practices

### Pattern Selection

1. **Consistency**: Use established patterns for common interactions
2. **Accessibility**: Ensure all patterns meet WCAG 2.1 AA standards
3. **Performance**: Optimize patterns for smooth user experience
4. **Scalability**: Design patterns that work across different screen sizes

### Implementation Guidelines

1. **Composition over inheritance**: Build complex UIs by composing simpler patterns
2. **Props over context**: Pass data explicitly rather than relying on global state
3. **Error boundaries**: Wrap complex patterns in error boundaries
4. **Loading states**: Always provide feedback for async operations

### Testing Patterns

```typescript
// Pattern testing utilities
import { renderPattern, testAccessibility } from '@/libs/design-system/testing';

describe('Form Pattern', () => {
  it('should be accessible', async () => {
    const { container } = renderPattern(<ContactForm />);
    await testAccessibility(container);
  });

  it('should handle validation', () => {
    // Test validation logic
  });
});