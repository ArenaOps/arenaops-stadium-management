# Stadium Seat Map Renderer - ARENA-37

## Overview

A reusable, SVG-based seat map renderer that visualizes stadium sections with full TypeScript support and responsive scaling. This is the **foundation layer** for stadium visualization - it handles static rendering of sections with color coding based on predefined configurations.

**Status:** ✅ Foundation Layer Complete  
**Branch:** ARENA-37  
**Date:** February 19, 2026

---

## Architecture

### Component Structure

```
seat-map/
├── types.ts                    # TypeScript definitions
├── seatMap.config.ts          # Configuration & presets
├── SeatMapRenderer.tsx         # Main component
├── SeatMapDemo.tsx             # Demo/example component
└── index.ts                    # Exports
```

### Data Flow

```
Configuration File
    ↓
SeatMapConfig (types)
    ↓
SeatMapRenderer Component
    ↓
SVG Visualization
```

---

## Features

### Current (Foundation Layer)

✅ **SVG Rendering**
- Render stadium sections dynamically from configuration
- Support for rectangles, polygons, and circles
- Responsive viewBox scaling

✅ **Color Management**
- Predefined color palettes
- Color assignment by section type
- Opacity and stroke styling

✅ **Layout Control**
- Section positioning and sizing
- Rotation support (for rectangles)
- Label rendering with positioning

✅ **Responsive Design**
- CSS-based sizing (width, height)
- viewBox for scalable SVG
- Dark mode support

### Future Capabilities (Ready to Add)

🔲 **Interactivity**
- Hover effects and tooltips
- Click selection
- Multi-select capabilities

🔲 **Advanced Rendering**
- Seat-level visualization
- Animated transitions
- Loading states

🔲 **Zoom & Pan**
- Viewport controls
- Section focus
- Dynamic scaling

🔲 **Booking Integration**
- Real-time availability updates
- Status visualization
- Selection history

---

## Types

### Core Types

```typescript
// A 2D coordinate point
type Point = { x: number; y: number };

// Color definition with hover and style options
type SectionColor = {
    name: string;           // Display name
    fill: string;          // Main color
    stroke?: string;       // Border color
    opacity?: number;      // 0-1 opacity
    hoverFill?: string;    // Hover color (future)
};

// Rectangular section (axis-aligned or rotatable)
type RectSection = {
    type: "rect";
    id: string;            // Unique identifier
    label: string;         // Display label
    x: number;             // X position
    y: number;             // Y position
    width: number;         // Width in viewBox units
    height: number;        // Height in viewBox units
    colorKey: string;      // Key to colors map
    rotation?: number;     // Rotation in degrees
};

// Polygon section (arbitrary shape via points)
type PolygonSection = {
    type: "polygon";
    id: string;
    label: string;
    points: Point[];       // Array of coordinates
    colorKey: string;
};

// Circular section
type CircleSection = {
    type: "circle";
    id: string;
    label: string;
    cx: number;            // Center X
    cy: number;            // Center Y
    r: number;             // Radius
    colorKey: string;
};
```

### Configuration Type

```typescript
type SeatMapConfig = {
    id: string;                    // Unique config ID
    name: string;                  // Stadium name
    viewBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    sections: Section[];           // All sections to render
    colors: Record<string, SectionColor>;  // Color palette
    metadata?: {                   // Optional metadata
        capacity?: number;
        region?: string;
        lastUpdated?: string;
    };
};
```

---

## Usage

### Basic Implementation

```tsx
import { SeatMapRenderer, defaultStadiumConfig } from "@/components/seat-map";

export function StadiumView() {
    return (
        <SeatMapRenderer
            config={defaultStadiumConfig}
            width="100%"
            height="600px"
        />
    );
}
```

### With Labels

```tsx
<SeatMapRenderer
    config={defaultStadiumConfig}
    width="100%"
    height="600px"
    showLabels={true}  // Show section labels
/>
```

### With Callbacks (Future Interaction)

```tsx
export function StadiumWithSelection() {
    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);

    return (
        <SeatMapRenderer
            config={defaultStadiumConfig}
            width="100%"
            height="600px"
            onSectionClick={(section) => setSelected(section)}
            onSectionHover={(section) => setHovered(section)}
        />
    );
}
```

### Custom Configuration

```tsx
import { SeatMapRenderer } from "@/components/seat-map";
import type { SeatMapConfig } from "@/components/seat-map";

const myStadium: SeatMapConfig = {
    id: "my-arena",
    name: "My Arena",
    viewBox: { x: 0, y: 0, width: 1000, height: 800 },
    sections: [
        {
            type: "rect",
            id: "section-a",
            label: "Section A",
            x: 100,
            y: 100,
            width: 200,
            height: 300,
            colorKey: "standard",
        },
        // ... more sections
    ],
    colors: {
        standard: {
            name: "Standard",
            fill: "#3b82f6",
            stroke: "#1e40af",
            opacity: 0.85,
        },
        // ... more colors
    },
};

export function MyStadium() {
    return (
        <SeatMapRenderer
            config={myStadium}
            width="100%"
            height="600px"
        />
    );
}
```

---

## Predefined Configurations

### 1. Default Stadium Config

```typescript
import { defaultStadiumConfig } from "@/components/seat-map";
```

**Features:**
- 10+ sections (North, South, East, West with premium areas)
- 4 color tiers: standard, premium, VIP, blocked
- 1000x800 viewBox
- ~50,000 capacity

**Sections:**
- North Upper, Center (2)
- South Upper, Center (2)
- East Upper, Premium polygon (2)
- West Upper, Premium polygon (2)
- Center Field (1)

### 2. Compact Arena Config

```typescript
import { compactStadiumConfig } from "@/components/seat-map";
```

**Features:**
- 5 sections (compact oval layout)
- 3 color tiers: standard, premium, blocked
- 600x500 viewBox
- Smaller capacity

### 3. Football Stadium Config

```typescript
import { footballStadiumConfig } from "@/components/seat-map";
```

**Features:**
- 9 sections (lower bowl, multiple sides)
- Football field-specific layout
- 1200x700 viewBox
- Professional stadium sizing

### Using Presets

```tsx
import { STADIUM_CONFIGS } from "@/components/seat-map";

// Access by key
<SeatMapRenderer config={STADIUM_CONFIGS.default} />
<SeatMapRenderer config={STADIUM_CONFIGS.compact} />
<SeatMapRenderer config={STADIUM_CONFIGS.football} />

// Or get by ID
import { getConfigById } from "@/components/seat-map";
const config = getConfigById("stadium-01");
```

---

## SVG Rendering Details

### Section Rendering

Each section is rendered as an SVG group (`<g>`) containing:

1. **Shape element** (rect, polygon, or circle)
   - Fill color from config
   - Stroke color and width
   - Opacity handling
   - Cursor pointer on hover

2. **Label text** (optional)
   - Centered within shape's bounds or centroid
   - White color, semi-bold font
   - Pointer events disabled (click passes through)

### ViewBox Responsiveness

```tsx
// SVG scales responsively while maintaining aspect ratio
<svg
    viewBox={`${x} ${y} ${width} ${height}`}
    style={{ width: "100%", height: "600px" }}
    preserveAspectRatio="xMidYMid meet"
/>
```

### Dark Mode Support

```tsx
// Automatic dark mode via CSS media query
@media (prefers-color-scheme: dark) {
    svg { 
        background-color: #1f2937;
        border-color: #374151;
    }
}
```

---

## Component Props

```typescript
interface SeatMapRendererProps {
    // Required
    config: SeatMapConfig;

    // Optional sizing
    width?: string | number;        // Default: "100%"
    height?: string | number;       // Default: "600px"

    // Styling
    className?: string;             // Additional CSS classes

    // Callbacks (future interactivity)
    onSectionClick?: (section: Section) => void;
    onSectionHover?: (section: Section | null) => void;

    // Display options
    showLabels?: boolean;           // Default: true
    defaultColorKey?: string;       // Fallback color

    // Advanced
    svgProps?: React.SVGAttributes<SVGSVGElement>;
}
```

---

## Creating Custom Configurations

### Step 1: Define Sections

```typescript
const sections = [
    // Rectangle sections
    {
        type: "rect" as const,
        id: "north-1",
        label: "North 1",
        x: 100,
        y: 50,
        width: 200,
        height: 100,
        colorKey: "standard",
    },
    
    // Polygon sections (custom shapes)
    {
        type: "polygon" as const,
        id: "vip-corner",
        label: "VIP Corner",
        points: [
            { x: 400, y: 300 },
            { x: 450, y: 280 },
            { x: 480, y: 350 },
            { x: 430, y: 380 },
        ],
        colorKey: "vip",
    },
    
    // Circle sections
    {
        type: "circle" as const,
        id: "center-pit",
        label: "Center",
        cx: 500,
        cy: 400,
        r: 50,
        colorKey: "special",
    },
];
```

### Step 2: Define Colors

```typescript
const colors = {
    standard: {
        name: "Standard Seating",
        fill: "#3b82f6",
        stroke: "#1e40af",
        opacity: 0.85,
    },
    vip: {
        name: "VIP",
        fill: "#ec4899",
        stroke: "#be185d",
        opacity: 0.9,
    },
    special: {
        name: "Special",
        fill: "#f59e0b",
        stroke: "#d97706",
        opacity: 0.85,
    },
};
```

### Step 3: Create Config

```typescript
const myConfig: SeatMapConfig = {
    id: "my-arena-1",
    name: "My Custom Arena",
    viewBox: { x: 0, y: 0, width: 1000, height: 800 },
    sections,
    colors,
    metadata: {
        capacity: 45000,
        region: "North America",
    },
};
```

### Step 4: Use in Component

```tsx
<SeatMapRenderer config={myConfig} width="100%" height="600px" />
```

---

## Positioning Guide

### Understanding viewBox Coordinates

The `viewBox` defines the coordinate system. All positions are relative to this:

```typescript
viewBox: {
    x: 0,        // Left edge
    y: 0,        // Top edge
    width: 1000, // Total width (0-1000)
    height: 800, // Total height (0-800)
}
```

### Centering Elements

```typescript
// Center a 200x100 rect in 1000x800 viewBox
const rect = {
    x: (1000 - 200) / 2,  // x = 400
    y: (800 - 100) / 2,   // y = 350
    width: 200,
    height: 100,
};
```

### Calculating Polygon Centroids

For labels, the component calculates centroid automatically:

```typescript
const section = {
    type: "polygon",
    points: [
        { x: 100, y: 100 },
        { x: 300, y: 100 },
        { x: 300, y: 300 },
        { x: 100, y: 300 },
    ],
};
// Centroid calculated as average: (200, 200)
```

---

## Color Configuration

### Color Properties

```typescript
type SectionColor = {
    name: string;        // Display name in legend
    fill: string;        // SVG fill color (hex, rgb, etc.)
    stroke?: string;     // Border color
    opacity?: number;    // 0 (transparent) to 1 (opaque)
    hoverFill?: string;  // Hover color (for future interactions)
};
```

### Color Formats

```typescript
// All of these work:
fill: "#3b82f6"              // Hex
fill: "rgb(59, 130, 244)"    // RGB
fill: "hsl(217, 92%, 59%)"   // HSL
fill: "red"                  // Named color
```

---

## Demo Component

The `SeatMapDemo` component provides an interactive playground for testing different configurations:

```tsx
import { SeatMapDemo } from "@/components/seat-map";

export function DemoPage() {
    return <SeatMapDemo />;
}
```

**Demo Features:**
- Switch between predefined configs
- Toggle section labels
- Live hover/click feedback
- Color legend display
- Code example

---

## Performance Considerations

### Rendering Performance

- **SVG elements:** One group per section regardless of the number of seats
- **No animation loops:** Only CSS transitions
- **Lazy rendering:** All sections render once at mount
- **Large stadium support:** Tested with 100+ sections

### Optimization Tips

1. **Avoid overly complex polygons** - Keep point counts low
2. **Reuse configurations** - Don't recreate config on every render
3. **Memoize callbacks** - Use `useCallback` for onSectionClick/onSectionHover
4. **Consider virtualization** for massive stadiums (future)

---

## Styling & Customization

### CSS Classes

```tsx
<SeatMapRenderer
    config={config}
    className="shadow-lg border-2 border-blue-500"
/>
```

### SVG Props

```tsx
<SeatMapRenderer
    config={config}
    svgProps={{
        style: { filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" },
    }}
/>
```

### Dark Mode

```tsx
// Automatic via Tailwind dark mode
// Styles apply based on prefers-color-scheme
```

---

## Next Steps (Future Development)

### Phase 2: Interactions
- [ ] Hover effects (color change, scale)
- [ ] Click selection
- [ ] Tooltips with section info
- [ ] Multi-select with keyboard modifiers

### Phase 3: Seat-Level Rendering
- [ ] Individual seat visualization
- [ ] Seat status colors
- [ ] Seat-level click events
- [ ] High-density rendering optimization

### Phase 4: Advanced Features
- [ ] Zoom and pan controls
- [ ] Animated transitions
- [ ] Real-time availability updates
- [ ] Custom seat layouts
- [ ] Accessibility features

### Phase 5: Booking Integration
- [ ] Connect to booking system
- [ ] Show availability in real-time
- [ ] Handle seat reservation
- [ ] Selection validation
- [ ] Price display

---

## File Reference

### types.ts (80 lines)
- Point
- SectionColor
- RectSection, PolygonSection, CircleSection
- Section (union)
- SeatMapConfig
- SeatMapRendererProps
- SectionState
- SeatMapState

### seatMap.config.ts (280 lines)
- `defaultStadiumConfig` - Full-featured stadium (10+ sections)
- `compactStadiumConfig` - Small arena (5 sections)
- `footballStadiumConfig` - Football-specific layout (9 sections)
- `getConfigById()` - Lookup function
- `STADIUM_CONFIGS` - Preset object

### SeatMapRenderer.tsx (310 lines)
- Main render component
- Section rendering by type (rect, polygon, circle)
- Label positioning
- Color management
- Event handlers (click, hover)

### SeatMapDemo.tsx (190 lines)
- Interactive demo
- Config switching
- Label toggling
- Hover/selection display
- Legend and code example

---

## Accessibility

### Current Features
- ✅ Semantic SVG structure
- ✅ Text labels (pointer events disabled)
- ✅ High contrast colors by default
- ✅ Keyboard hover state (CSS)

### Future Improvements
- [ ] ARIA labels for sections
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Focus indicators
- [ ] Alternative text representation

---

## Troubleshooting

### Issue: Sections overlapping
**Solution:** Check viewBox dimensions and section coordinates don't exceed bounds

### Issue: Labels not visible
**Solution:** Ensure color fill is solid, text element has `fill="white"`

### Issue: SVG not scaling
**Solution:** Verify `preserveAspectRatio="xMidYMid meet"` and proper width/height

### Issue: Colors not matching config
**Solution:** Check colorKey exists in colors map, use defaultColorKey as fallback

---

## Examples

### Concert Venue Configuration

```typescript
const concertVenue: SeatMapConfig = {
    id: "concert-venue",
    name: "Concert Hall",
    viewBox: { x: 0, y: 0, width: 800, height: 600 },
    sections: [
        // Floor sections
        { type: "rect", id: "floor-1", label: "Floor 1", x: 100, y: 100, width: 150, height: 200, colorKey: "standard" },
        { type: "rect", id: "floor-2", label: "Floor 2", x: 300, y: 100, width: 150, height: 200, colorKey: "standard" },
        // Balcony
        { type: "rect", id: "balcony", label: "Balcony", x: 150, y: 350, width: 500, height: 150, colorKey: "premium" },
        // Stage
        { type: "rect", id: "stage", label: "Stage", x: 250, y: 480, width: 300, height: 80, colorKey: "blocked" },
    ],
    colors: {
        standard: { name: "Standard", fill: "#3b82f6", stroke: "#1e40af", opacity: 0.85 },
        premium: { name: "Premium", fill: "#f59e0b", stroke: "#d97706", opacity: 0.85 },
        blocked: { name: "Stage", fill: "#22c55e", stroke: "#15803d", opacity: 0.6 },
    },
};
```

---

## Summary

The **SVG-based seat map renderer** provides a solid foundation for stadium visualization with:

✅ Flexible section definitions  
✅ Responsive scaling  
✅ Color management  
✅ Multiple shape types  
✅ Label rendering  
✅ Dark mode support  
✅ Ready for future interactions  

This is Phase 1 of the seat map feature - a clean, extensible foundation for adding interactions, seat-level rendering, and booking features.

---

**ARENA-37 Status:** ✅ Foundation Layer Complete

For usage questions, refer to the code examples throughout this document or check `SeatMapDemo.tsx` for a working implementation.
