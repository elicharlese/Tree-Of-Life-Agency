# 01 - Design Foundations

> Core principles and philosophy from Apple's Human Interface Guidelines that inform all design decisions in AGENT.

## Apple's Design Philosophy

Apple's design philosophy centers on three fundamental principles that should guide every design decision:

### 1. Clarity

**Definition**: The interface should make content easy to understand and interact with.

**Implementation Guidelines**:

- **Text Legibility**: Use appropriate font sizes (minimum 11pt, recommended 17pt for body text)
- **Meaningful Icons**: Icons should be instantly recognizable and unambiguous
- **Visual Hierarchy**: Size, weight, and color should clearly indicate importance
- **Whitespace**: Generous spacing reduces cognitive load and improves scanning
- **Contrast**: Maintain minimum 4.5:1 contrast ratio for text

**AGENT Application**:

```tsx
// ❌ Poor Clarity
<div className="text-xs text-gray-400">
  Important action button
</div>

// ✅ Good Clarity
<div className="text-base text-foreground font-medium">
  Important action button
</div>
```

### 2. Deference

**Definition**: The UI should support content without competing with it.

**Implementation Guidelines**:

- **Content First**: UI chrome should be minimal and unobtrusive
- **Translucency**: Use blur effects to hint at underlying content
- **Subtle Borders**: Prefer subtle separators over heavy dividers
- **Restrained Color**: Reserve vibrant colors for interactive elements
- **Fluid Motion**: Animations should feel natural, not decorative

**AGENT Application**:

```tsx
// ❌ UI Competing with Content
<Card className="border-4 border-blue-500 shadow-2xl bg-gradient-to-r from-purple-500 to-pink-500">
  <p>Your message content</p>
</Card>

// ✅ UI Deferring to Content
<Card className="border border-border/50 bg-card/80 backdrop-blur-sm">
  <p>Your message content</p>
</Card>
```

### 3. Depth

**Definition**: Visual layers and motion create hierarchy and context.

**Implementation Guidelines**:

- **Layered Interfaces**: Use elevation to show relationships
- **Translucent Materials**: Background blur indicates depth
- **Meaningful Shadows**: Shadows should reflect actual elevation
- **Spatial Transitions**: Animations should reinforce spatial relationships
- **Context Preservation**: Parent content should remain visible when appropriate

**AGENT Application**:

```tsx
// Depth through layering
<div className="relative">
  {/* Base layer - main content */}
  <MainContent className="z-0" />
  
  {/* Elevated layer - sidebar */}
  <Sidebar className="z-10 shadow-lg bg-background/95 backdrop-blur-xl" />
  
  {/* Top layer - modal */}
  <Modal className="z-50 shadow-2xl bg-background/98 backdrop-blur-2xl" />
</div>
```

## Visual Hierarchy

### Size Hierarchy

Elements should be sized according to their importance:

| Level | Usage | Size Range |
|-------|-------|------------|
| **Primary** | Main headings, hero elements | 28-34pt |
| **Secondary** | Section headings, key info | 20-22pt |
| **Tertiary** | Subheadings, labels | 15-17pt |
| **Body** | Main content text | 17pt |
| **Supporting** | Captions, metadata | 11-13pt |

### Weight Hierarchy

Font weight communicates importance:

| Weight | Usage |
|--------|-------|
| **Bold (700)** | Primary actions, critical info |
| **Semibold (600)** | Headings, emphasis |
| **Medium (500)** | Labels, navigation |
| **Regular (400)** | Body text, descriptions |
| **Light (300)** | Subtle metadata (use sparingly) |

### Color Hierarchy

Color draws attention and indicates state:

| Color Role | Usage |
|------------|-------|
| **Primary** | Main actions, active states |
| **Secondary** | Supporting actions |
| **Muted** | Disabled states, placeholders |
| **Destructive** | Delete, remove actions |
| **Success** | Confirmations, completed states |
| **Warning** | Caution, attention needed |

## Content Priority

### Information Architecture

Organize content by user priority:

```
1. Primary Content (What users came for)
   └── Messages, conversations, main workspace
   
2. Navigation (How users move around)
   └── Tab bar, sidebar, navigation bar
   
3. Actions (What users can do)
   └── Buttons, menus, controls
   
4. Metadata (Supporting information)
   └── Timestamps, status indicators, counts
   
5. System UI (Platform elements)
   └── Status bar, home indicator
```

### Progressive Disclosure

Reveal complexity gradually:

```tsx
// Level 1: Essential actions visible
<Toolbar>
  <Button>New Chat</Button>
  <Button>Search</Button>
  <MoreMenu /> {/* Additional actions hidden */}
</Toolbar>

// Level 2: Secondary actions in menu
<MoreMenu>
  <MenuItem>Settings</MenuItem>
  <MenuItem>Archive</MenuItem>
  <MenuItem>Export</MenuItem>
</MoreMenu>

// Level 3: Advanced options in dedicated screens
<SettingsScreen>
  <AdvancedSection />
</SettingsScreen>
```

## Platform Adaptation

### iOS Characteristics

- **Touch-first**: Large tap targets (44pt minimum)
- **Gesture-rich**: Swipe, pinch, long-press
- **Tab bar navigation**: Bottom navigation for main sections
- **Edge-to-edge content**: Utilize full screen with safe areas

### macOS Characteristics

- **Pointer-precise**: Smaller click targets acceptable
- **Keyboard-centric**: Comprehensive keyboard shortcuts
- **Sidebar navigation**: Left sidebar for main sections
- **Window management**: Multiple windows, resizing

### Web Characteristics

- **Responsive**: Adapt to any viewport size
- **Progressive enhancement**: Core functionality without JS
- **Cross-browser**: Consistent across browsers
- **Accessible**: Full keyboard and screen reader support

## Design Tokens for AGENT

Based on Apple HIG, implement these foundational tokens:

```css
:root {
  /* Hierarchy - Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  
  /* Hierarchy - Typography */
  --text-xs: 11px;
  --text-sm: 13px;
  --text-base: 17px;
  --text-lg: 20px;
  --text-xl: 22px;
  --text-2xl: 28px;
  --text-3xl: 34px;
  
  /* Depth - Elevation */
  --elevation-0: none;
  --elevation-1: 0 1px 3px rgba(0,0,0,0.12);
  --elevation-2: 0 4px 6px rgba(0,0,0,0.15);
  --elevation-3: 0 10px 20px rgba(0,0,0,0.19);
  --elevation-4: 0 15px 40px rgba(0,0,0,0.25);
  
  /* Depth - Blur */
  --blur-sm: 8px;
  --blur-md: 16px;
  --blur-lg: 24px;
  --blur-xl: 40px;
  
  /* Clarity - Opacity */
  --opacity-disabled: 0.5;
  --opacity-muted: 0.7;
  --opacity-subtle: 0.85;
  --opacity-full: 1;
}
```

## Checklist for AGENT Components

When designing or reviewing any component, verify:

- [ ] **Clarity**: Is the purpose immediately obvious?
- [ ] **Hierarchy**: Does visual weight match importance?
- [ ] **Touch Targets**: Are interactive areas at least 44×44pt?
- [ ] **Contrast**: Does text meet 4.5:1 ratio?
- [ ] **Deference**: Does UI support rather than compete with content?
- [ ] **Depth**: Do layers and shadows convey proper relationships?
- [ ] **Consistency**: Does it match other similar components?
- [ ] **Accessibility**: Is it usable with VoiceOver/keyboard?

---

*Next: [02-color-system.md](./02-color-system.md) - Semantic colors and dark mode*
