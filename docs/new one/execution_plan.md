# Stadium View Execution Plan: Parallel Development Tracks

This document breaks down the implementation of the Event Manager Stadium View into two independent streams (Backend and Frontend) so two developers can execute them in parallel based on `requirements.md` and `design.md`.

---

## 🛠️ Developer 1: Backend & API Track (C# / .NET)

**Objective**: Ensure the frontend has all necessary data to map out the canvas. The underlying domain models (`SeatingPlan`, `Section`, `Landmark`) already exist. Your goal is to fetch, map, and expose this fully nested structure efficiently.

### Task 1: API DTO Construction
Create Data Transfer Objects (DTOs) so we do not expose raw Entity representations.
*   **Location**: `BACKEND/ArenaOps.CoreService/ArenaOps.CoreService.Application/DTOs/`
*   Create `SeatingPlanDto.cs`, `SectionDto.cs` and `LandmarkDto.cs`.
*   Ensure the fields listed in Section 3 of `design.md` are accurately represented (e.g., camelCase serialization, mapping `GeometryType` and raw `GeometryData`).

### Task 2: Repository Updates
Ensure eager loading is functional for `SeatingPlan` queries.
*   **Location**: `ArenaOps.CoreService.Infrastructure/Repositories/`
*   Update `StadiumRepository` or `SeatingPlanRepository` to `Include(sp => sp.Sections)` and `Include(sp => sp.Landmarks)` when fetching seating plans associated with a stadium.

### Task 3: API Endpoint verification & Response Mapping
Ensure the endpoint the frontend relies on returns the fully nested object.
*   **Endpoint**: `GET /api/stadiums/{id}/seating-plans` (or `/api/seating-plans/{stadiumId}`)
*   Ensure that AutoMapper (or manual mapping) is successfully projecting the Domain logic into the new DTOs.
*   **Testing Requirement**: Run swagger and verify that navigating to a seated plan emits JSON with populated `"sections": [ ... ]` and `"landmarks": [ ... ]` arrays.

### Task 4: Missing Data Tolerances
*   Ensure fields like `GeometryData` and `Color` can safely return `null` without throwing internal server exceptions.

---

## 🎨 Developer 2: Frontend UI & Canvas Track (React / Next.js)

**Objective**: Build out the user interface, implement the interactive Canvas engine, and embed the feature into the Event Manager workflow.

### Task 1: Data Contracts and Services
*   **Location**: `src/services/coreService.ts`
*   Define the Typescript interfaces: `SeatingPlan`, `Section`, `Landmark`, `GeometryDataArc`, `GeometryDataRect`.
*   *(Mocking strategy until Developer 1 finishes: Create a hardcoded mock JSON file based on the TS interfaces so you are not blocked by the API track).*

### Task 2: UI Presentation Components
Build these inside `src/components/stadium/`:
*   Create **`CapacitySummaryPanel.tsx`**: Calculate and display capacities (using `TotalCapacity`, or reducing sections if absent) and breakdowns by VIP/Premium/Standing.
*   Create **`StadiumLegend.tsx`**: Simple Flexbox bar displaying SeatTypes to Color nodes, and Landmark icons.
*   Create **`SectionDetailTooltip.tsx`**: A floating div (absolute position, z-index) that accepts section data as props and displays it.

### Task 3: Canvas Rendering Engine (The Core)
*   Create **`StadiumCanvas.tsx`**.
*   Initialize `<canvas>` ref and 2D Context.
*   **Rendering Loop**: Map over `SeatingPlan.Sections`.
    *   Parse `GeometryData`.
    *   If `GeometryType === "arc"`, draw using `ctx.arc()`.
    *   If `GeometryType === "rectangle"`, draw using `ctx.fillRect()`.
*   Implement basic panning/zooming via context scale and translate.
*   Implement `onMouseMove` boundary intersection logic to trigger the tooltip state.

### Task 4: Layout & Wiring
*   Create **`StadiumLayoutView.tsx`** to act as the parent container, bridging the Redux state, the Canvas map (Left Pane), and the Summary panels (Right Pane).
*   **Integration**: Edit `src/app/(dashboard)/event-manager/stadiums/[id]/page.tsx` down to embed `<StadiumLayoutView />`, removing the static blueprint cards.

---

## 🚀 Final Integration (Dev 1 & Dev 2 Together)
1. Turn off frontend mock data and switch `coreService.ts` to make genuine API calls.
2. Validate that the Canvas geometry matches the JSON sent from the API.
3. Verify performance handling bounds (ensure the API loading large JSON responds under 500ms, and canvas renders under 2 seconds requirement).
