# Apple HIG Charting Data Standards

> Based on [Apple Human Interface Guidelines - Charting Data](https://developer.apple.com/design/human-interface-guidelines/charting-data)

## Overview

Charts help people understand data at a glance. Well-designed charts communicate complex information clearly and efficiently, enabling users to identify patterns, trends, and outliers quickly.

## Core Principles

### 1. Clarity First

- **Prioritize readability** over decoration
- **Remove unnecessary elements** that don't convey information
- **Use clear labels** that explain what data represents
- **Maintain consistent scales** across related charts

### 2. Purposeful Color

- **Use color to highlight** important data points
- **Maintain sufficient contrast** for accessibility
- **Avoid using color alone** to convey meaning
- **Support both light and dark modes**

### 3. Interactivity

- **Enable exploration** through hover states and tooltips
- **Provide context** when users interact with data points
- **Support touch interactions** on mobile devices
- **Use smooth animations** for state changes

## Chart Types

### Line Charts

Best for showing trends over time.

```tsx
import { HIGChart } from '@/components/ui/hig-chart'

<HIGChart
  type="line"
  data={[
    { label: 'Jan', value: 100 },
    { label: 'Feb', value: 150 },
    { label: 'Mar', value: 120 },
    { label: 'Apr', value: 180 },
  ]}
  title="Monthly Performance"
  height={300}
  showGrid
  showAxis
  animated
/>
```

**When to use:**
- Displaying continuous data over time
- Showing trends and patterns
- Comparing multiple data series

### Area Charts

Line charts with filled areas, emphasizing volume or magnitude.

```tsx
<HIGChart
  type="area"
  data={priceHistory}
  title="Price History"
  subtitle="Last 30 days"
  height={250}
  colors={['#A6E22E']}
/>
```

**When to use:**
- Emphasizing the magnitude of change
- Showing cumulative totals
- Highlighting the area between values

### Bar Charts

Best for comparing discrete categories.

```tsx
<HIGChart
  type="bar"
  data={[
    { label: 'AAPL', value: 45.2 },
    { label: 'GOOGL', value: 38.7 },
    { label: 'MSFT', value: 52.1 },
    { label: 'AMZN', value: 29.4 },
  ]}
  title="Portfolio Allocation"
  showLabels
  showLegend
/>
```

**When to use:**
- Comparing values across categories
- Showing rankings or distributions
- Displaying discrete data points

### Pie & Donut Charts

Best for showing parts of a whole.

```tsx
<HIGChart
  type="donut"
  data={[
    { label: 'Legendary', value: 15, color: '#FFD700' },
    { label: 'Epic', value: 25, color: '#AE81FF' },
    { label: 'Rare', value: 35, color: '#66D9EF' },
    { label: 'Common', value: 25, color: '#8E8E93' },
  ]}
  title="Card Rarity Distribution"
  showLabels
  showLegend
/>
```

**When to use:**
- Showing proportions of a whole
- Displaying percentage breakdowns
- Limited to 5-7 categories maximum

### Sparklines

Compact inline charts for quick trend visualization.

```tsx
import { Sparkline } from '@/components/ui/hig-chart'

<Sparkline
  data={recentPrices}
  height={40}
  showArea
/>
```

**When to use:**
- Inline trend indicators
- Dashboard widgets
- Table cells showing trends

## Color Palette

### Primary Chart Colors (Apple HIG)

| Color | Hex | Usage |
|-------|-----|-------|
| Blue | `#007AFF` | Primary data series |
| Green | `#34C759` | Positive values, gains |
| Orange | `#FF9500` | Warnings, attention |
| Red | `#FF3B30` | Negative values, losses |
| Purple | `#AF52DE` | Secondary data |
| Indigo | `#5856D6` | Tertiary data |
| Pink | `#FF2D55` | Accent |
| Teal | `#00C7BE` | Alternative primary |

### ECE Monokai Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Green | `#A6E22E` | Positive trends, gains |
| Blue | `#66D9EF` | Primary data, info |
| Pink | `#F92672` | Negative trends, losses |
| Orange | `#FD971F` | Warnings, highlights |
| Purple | `#AE81FF` | Secondary data |
| Yellow | `#E6DB74` | Accent, attention |

### Semantic Colors

```css
/* Positive/Negative */
--chart-positive: #34C759;  /* or #A6E22E for Monokai */
--chart-negative: #FF3B30;  /* or #F92672 for Monokai */
--chart-neutral: #8E8E93;

/* Gradients for area fills */
--chart-gradient-start: rgba(166, 226, 46, 0.4);
--chart-gradient-end: rgba(166, 226, 46, 0.05);
```

## Accessibility

### Color Contrast

- Maintain **4.5:1 contrast ratio** for text
- Use **3:1 contrast ratio** for graphical elements
- Never rely on color alone to convey information

### Screen Reader Support

```tsx
<HIGChart
  type="bar"
  data={data}
  accessibilityLabel="Bar chart showing quarterly revenue: Q1 $100K, Q2 $150K, Q3 $120K, Q4 $180K"
/>
```

### Alternative Representations

- Provide data tables as alternatives
- Include descriptive titles and subtitles
- Use patterns in addition to colors when possible

## Animation Guidelines

### Entry Animations

- **Duration**: 300-500ms for chart elements
- **Easing**: `ease-out` for natural feel
- **Stagger**: 50-100ms delay between elements

```tsx
<HIGChart
  animated
  // Elements animate in sequence
/>
```

### Interaction Animations

- **Hover states**: 150ms transition
- **Selection**: 200ms scale/highlight
- **Tooltip appearance**: 100ms fade

### Reduced Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .chart-element {
    animation: none;
    transition: none;
  }
}
```

## Responsive Design

### Breakpoint Considerations

| Breakpoint | Chart Behavior |
|------------|----------------|
| Mobile (<640px) | Simplified axes, larger touch targets |
| Tablet (640-1024px) | Full axes, medium density |
| Desktop (>1024px) | Full detail, hover interactions |

### Touch Targets

- Minimum **44x44pt** touch target for interactive elements
- Increase data point hit areas on touch devices
- Support pinch-to-zoom for detailed charts

## Implementation Examples

### Asset Price Chart

```tsx
import { HIGChart } from '@/components/ui/hig-chart'

function AssetPriceChart({ asset }) {
  const chartData = asset.priceHistory.map(point => ({
    label: formatDate(point.timestamp),
    value: point.price,
  }))

  const isPositive = asset.changePercent >= 0

  return (
    <HIGChart
      type="area"
      data={chartData}
      title={`${asset.symbol} Price`}
      subtitle={`${isPositive ? '+' : ''}${asset.changePercent.toFixed(2)}%`}
      height={300}
      colors={[isPositive ? '#A6E22E' : '#F92672']}
      showGrid
      showAxis
      showTooltip
      animated
      interactive
      onDataPointHover={(point) => {
        // Show detailed price info
      }}
    />
  )
}
```

### Deck Value Breakdown

```tsx
function DeckValueChart({ deck }) {
  const chartData = deck.cards.map(card => ({
    label: card.name,
    value: card.price,
    color: getRarityColor(card.rarity),
  }))

  return (
    <HIGChart
      type="donut"
      data={chartData}
      title="Deck Composition"
      subtitle={`Total: $${deck.totalValue.toFixed(2)}`}
      height={280}
      showLabels
      showLegend
      animated
    />
  )
}
```

### Performance Sparkline

```tsx
import { Sparkline } from '@/components/ui/hig-chart'

function PerformanceIndicator({ values, change }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-8">
        <Sparkline
          data={values.map((v, i) => ({ label: `${i}`, value: v }))}
          color={change >= 0 ? '#A6E22E' : '#F92672'}
          height={32}
          showArea
        />
      </div>
      <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
      </span>
    </div>
  )
}
```

## Best Practices

### Do's ✅

- **Use appropriate chart types** for your data
- **Label axes clearly** with units
- **Provide context** through titles and subtitles
- **Support dark mode** with appropriate colors
- **Test with real data** to ensure readability
- **Include loading states** for async data

### Don'ts ❌

- **Don't use 3D effects** - they distort perception
- **Don't truncate Y-axis** misleadingly
- **Don't use too many colors** - limit to 6-8
- **Don't animate excessively** - respect reduced motion
- **Don't crowd labels** - use tooltips for detail
- **Don't forget mobile** - test touch interactions

## Component API Reference

### HIGChart Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `'line' \| 'area' \| 'bar' \| 'pie' \| 'donut' \| 'sparkline'` | Required | Chart type |
| `data` | `ChartDataPoint[]` | Required | Data points |
| `title` | `string` | - | Chart title |
| `subtitle` | `string` | - | Chart subtitle |
| `height` | `number` | `300` | Chart height in pixels |
| `showGrid` | `boolean` | `true` | Show grid lines |
| `showAxis` | `boolean` | `true` | Show axis labels |
| `showLegend` | `boolean` | `false` | Show legend |
| `showTooltip` | `boolean` | `true` | Show tooltips on hover |
| `showLabels` | `boolean` | `false` | Show value labels |
| `animated` | `boolean` | `true` | Enable animations |
| `interactive` | `boolean` | `true` | Enable interactions |
| `colors` | `string[]` | Monokai palette | Custom colors |
| `onDataPointClick` | `(point, index) => void` | - | Click handler |
| `onDataPointHover` | `(point, index) => void` | - | Hover handler |

### ChartDataPoint Interface

```typescript
interface ChartDataPoint {
  label: string      // X-axis label or category name
  value: number      // Numeric value
  color?: string     // Optional custom color
  metadata?: Record<string, unknown>  // Additional data
}
```

## File Locations

| File | Description |
|------|-------------|
| `/app/src/components/ui/hig-chart.tsx` | Main chart component |
| `/app/src/components/asset/asset-chart.tsx` | Asset-specific chart |
| `/app/src/components/trading-chart.tsx` | Trading chart with Recharts |
| `/docs/design-system/apple-hig/17-charting-data.md` | This documentation |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-XX | Initial Apple HIG charting implementation |

---

*For questions or contributions, refer to the main [Design System README](/docs/design-system/README.md).*
