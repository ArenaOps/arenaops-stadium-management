# Stadium View Component Design Document

## 1. Overview
The Stadium View feature provides Event Managers with a simplified 2D visualization of a venue's seating layout. This allows users to review section capacities, seat types, and landmarks before making booking or layout decisions without needing computationally expensive 3D rendering.

## 2. Architecture & Components
Located in `FRONTEND/arenaops-web/src/components/stadium/` and `src/app/(dashboard)/event-manager/`

### 2.1 Core Components
*   **`StadiumLayoutView.tsx`**: The main container component that orchestrates data fetching (via Redux/Service), manages interactive state (selected section), and holds layout structure.
*   **`StadiumCanvas.tsx`**: A pure 2D rendering component utilizing HTML5 Canvas. Responsible for drawing the field, sections (arc/rectangle), and landmarks. Handles zooming, panning, and hit-detection (tooltips on hover/click).
*   **`CapacitySummaryPanel.tsx`**: Displays the aggregated data (`TotalCapacity`) and breaks down capacities by `SeatType` (VIP, Premium, etc.) and section types (Seated vs Standing).
*   **`SectionDetailTooltip.tsx`**: A floating tooltip/panel that renders upon hovering or clicking a section in the canvas.
*   **`StadiumLegend.tsx`**: Displays color coding for seat types and icon mappings for landmarks (STAGE, GATE, EXIT, RESTROOM).

### 2.2 Integration into Existing Pages
*   `src/app/(dashboard)/event-manager/stadiums/[id]/page.tsx` will be updated to embed `<StadiumLayoutView seatingPlanId={planId} />` directly within or in place of the generic "Supported Seating Blueprints" text cards. The "Propose Event" flow can also reference this component in a dialog/drawer.

## 3. Data Models & API Integration

We map the existing C# CoreService Entities into TypeScript interfaces in `src/services/coreService.ts`.

```typescript
export interface Landmark {
    featureId: string;
    seatingPlanId: string;
    type: string; // "STAGE", "GATE", "EXIT", "RESTROOM"
    label?: string;
    posX: number;
    posY: number;
    width: number;
    height: number;
}

export interface GeometryDataArc {
    innerRadius: number;
    outerRadius: number;
    startAngle: number; // in radians
    endAngle: number;   // in radians
}

export interface GeometryDataRect {
    width: number;
    height: number;
    rotation: number; // in radians
}

export interface Section {
    sectionId: string;
    seatingPlanId: string;
    name: string;
    type: "Seated" | "Standing";
    capacity: number;
    seatType?: string; // "VIP", "Premium", "Standard", "Economy", "Accessible"
    color?: string; // Hex color
    posX: number;
    posY: number;
    rows?: number;
    seatsPerRow?: number;
    geometryType?: "arc" | "rectangle";
    geometryData?: string; // JSON string parsing into GeometryDataArc | GeometryDataRect
}

export interface SeatingPlan {
    seatingPlanId: string;
    stadiumId: string;
    name: string;
    description?: string;
    fieldConfigMetadata?: string; // JSON string
    totalCapacity?: number;
    sections: Section[];
    landmarks: Landmark[];
}
```

## 4. Canvas Rendering Implementation

### 4.1 Drawing Logic (`StadiumCanvas.tsx`)
We use the standard HTML5 Canvas 2D API (`ctx`). 
*   **Coordinate System**: We'll use a relative coordinate system mapping `PosX`/`PosY` (center coordinates) to the canvas, supporting zoom and pan via Context transforms (`ctx.translate`, `ctx.scale`).
*   **Arc Rendering**:
    ```javascript
    // For GeometryType === "arc"
    ctx.beginPath();
    ctx.arc(posX, posY, outerRadius, startAngle, endAngle);
    ctx.arc(posX, posY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = section.color || defaultColor;
    ctx.fill();
    ```
*   **Rectangle Rendering**:
    ```javascript
    // For GeometryType === "rectangle"
    ctx.save();
    ctx.translate(posX, posY);
    ctx.rotate(rotation);
    ctx.fillStyle = section.color || defaultColor;
    ctx.fillRect(-width/2, -height/2, width, height); // Center origin
    ctx.restore();
    ```

### 4.2 Interactivity & Hit Detection
*   Using `ctx.isPointInPath()` or bounding box mathematics for hit detection on mouse moves/clicks to display the `SectionDetailTooltip`.
*   We'll map viewport coordinates to canvas local coordinates based on the current transform matrix to know which section the user is hovering over.

### 4.3 Rendering Performance
*   **Progressive Rendering**: For stadiums with >50 sections, we will chunk the draw calls using `requestAnimationFrame(renderChunk)` to prevent blocking the main thread.
*   **Viewport Culling**: Before drawing a section, we will formulate an AABB (Axis-Aligned Bounding Box) using its `PosX/PosY` and inner dimensions, and compare to the viewport bounds. If out of bounds, skip rendering.
*   **Caching**: We will pre-parse the `geometryData` JSON strings into objects on initial component mount and cache them to avoid JSON parsing costs on every frame (on pan/zoom).

## 5. Fallback & Edge Cases
*   **Missing Geometry**: Render a default 50x50 rectangle at `PosX`, `PosY`.
*   **Missing Color**: Assign standard fallback colors based on `SeatType` (e.g., VIP: `#FFD700`, Standard: `#4169E1`).
*   **Missing Capacity**: If `TotalCapacity` is null, calculate via `sections.reduce((acc, curr) => acc + curr.capacity, 0)`.
*   **Missing Field Config**: Render a standard rectangular field placeholder if `fieldConfigMetadata` is null.
*   **Loading/Error States**: Display skeleton loaders horizontally/vertically inside the layout container during fetch. Display error cards with a "Retry" button if API requests fail.

## 6. Layout & UI Structure
We will adopt the existing application theme (dark mode, `#111827` background, `#10b981` accents).

*   **Top Bar**: "View Stadium Layout" toggle or breadcrumb, Zoom In (+), Zoom Out (-), Reset View controls, and Settings Toggle (show/hide labels & landmarks).
*   **Main Container**: 2-column layout (min-width: 768px for desktop/tablet flex).
    *   **Left Pane (2/3 width)**: `StadiumCanvas` interactive map centered and spanning height.
    *   **Right Pane (1/3 width)**: `CapacitySummaryPanel` rendering cards with total capacity, section capacities, and type breakdown. Will stack underneath Canvas on mobile.
*   **Bottom Legend**: Flex-row component mapping colors to seat types and icon mappings to landmark types underneath the canvas.
