# Apple Human Interface Guidelines Compliance

> A comprehensive guide for redesigning AGENT's UI to align with Apple's Human Interface Guidelines (HIG) for modern, native-feeling experiences across all platforms.

## Overview

This documentation provides detailed guidance for implementing Apple's design principles in the AGENT application. Following these guidelines ensures:

- **Native Feel**: Users experience familiar patterns and behaviors
- **Consistency**: Unified visual language across all screens
- **Accessibility**: Inclusive design for all users
- **App Store Approval**: Higher likelihood of passing Apple's review process
- **User Trust**: Familiar interfaces build confidence and reduce learning curves

## Documentation Structure

| Document | Description |
|----------|-------------|
| [01-foundations.md](./01-foundations.md) | Core design principles, hierarchy, and philosophy |
| [02-color-system.md](./02-color-system.md) | Semantic colors, dark mode, and color accessibility |
| [03-typography.md](./03-typography.md) | SF Pro font system, text styles, and hierarchy |
| [04-spacing-layout.md](./04-spacing-layout.md) | Grid systems, margins, padding, and safe areas |
| [05-navigation.md](./05-navigation.md) | Navigation bars, tab bars, sidebars, and search |
| [06-buttons-controls.md](./06-buttons-controls.md) | Buttons, toggles, sliders, pickers, and inputs |
| [07-content-containers.md](./07-content-containers.md) | Cards, lists, tables, and collection views |
| [08-modals-overlays.md](./08-modals-overlays.md) | Sheets, alerts, popovers, and action sheets |
| [09-feedback-states.md](./09-feedback-states.md) | Loading, errors, empty states, and notifications |
| [10-motion-animation.md](./10-motion-animation.md) | Transitions, micro-interactions, and haptics |
| [11-accessibility.md](./11-accessibility.md) | VoiceOver, Dynamic Type, and inclusive design |
| [12-iconography.md](./12-iconography.md) | SF Symbols, app icons, and custom icons |
| [13-implementation-checklist.md](./13-implementation-checklist.md) | Actionable checklist for AGENT redesign |
| [14-lockups.md](./14-lockups.md) | Icon + text combinations and standardized arrangements |
| [15-outline-views.md](./15-outline-views.md) | Hierarchical data display with expandable rows |
| [16-boxes.md](./16-boxes.md) | Content containers, panels, and visual grouping |
| [17-charting-data.md](./17-charting-data.md) | Charts, graphs, sparklines, and data visualization |

## Quick Reference: Core Principles

### 1. Clarity
- Content is paramount; UI should support, not distract
- Text must be legible at every size
- Icons should be precise and meaningful
- Subtle visual cues guide focus without overwhelming

### 2. Deference
- Fluid motion and crisp interface help users understand content
- Content fills the screen; translucency hints at more
- Minimal use of bezels, gradients, and drop shadows
- Focus on content, not chrome

### 3. Depth
- Distinct visual layers convey hierarchy
- Translucency provides context
- Motion creates a sense of vitality and spatial relationships

## Key Metrics for AGENT Redesign

### Touch Targets
```
Minimum: 44×44 pt (points)
Recommended: 48×48 pt for primary actions
```

### Typography Scale
```
Large Title: 34pt (SF Pro Display)
Title 1: 28pt
Title 2: 22pt
Title 3: 20pt
Headline: 17pt (SF Pro Text, Semibold)
Body: 17pt (SF Pro Text)
Callout: 16pt
Subheadline: 15pt
Footnote: 13pt
Caption 1: 12pt
Caption 2: 11pt
```

### Spacing System (8pt Grid)
```
xs: 4pt
sm: 8pt
md: 16pt
lg: 24pt
xl: 32pt
2xl: 48pt
```

### Color Contrast Requirements
```
Normal Text: 4.5:1 minimum (WCAG AA)
Large Text: 3:1 minimum
UI Components: 3:1 minimum
```

## Platform Considerations

### iOS/iPadOS
- Tab bar navigation for primary sections
- Navigation bar with back button for hierarchical content
- Safe area insets for notch and home indicator
- Support for Dynamic Type and Dark Mode

### macOS
- Sidebar navigation for primary sections
- Toolbar for contextual actions
- Menu bar integration
- Window management and resizing

### Web (Cross-Platform)
- Responsive design adapting to iOS patterns
- Touch-friendly targets for mobile Safari
- Keyboard navigation for desktop
- Progressive enhancement for all capabilities

## Getting Started

1. **Read the Foundations** - Start with [01-foundations.md](./01-foundations.md) to understand core principles
2. **Review Current UI** - Audit existing AGENT components against these guidelines
3. **Prioritize Changes** - Use [13-implementation-checklist.md](./13-implementation-checklist.md) to plan work
4. **Implement Incrementally** - Apply changes component by component
5. **Test Thoroughly** - Verify accessibility, dark mode, and responsive behavior

## Resources

### Official Apple Resources
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
- [SF Symbols](https://developer.apple.com/sf-symbols/)
- [SF Pro Fonts](https://developer.apple.com/fonts/)
- [Design Resources (Figma/Sketch)](https://developer.apple.com/design/resources/)

### Tools
- Xcode Accessibility Inspector
- Figma iOS UI Kit
- SF Symbols App
- Color Contrast Analyzer

---

*Last Updated: November 2024*
*Based on Apple HIG as of iOS 18, macOS 15, and visionOS 2*
