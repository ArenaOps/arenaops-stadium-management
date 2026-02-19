/**
 * Seat Map Types
 * Defines TypeScript interfaces for stadium section rendering
 */

/**
 * Represents a point in 2D space
 */
export type Point = {
    x: number;
    y: number;
};

/**
 * Represents the color and status information for a section
 */
export type SectionColor = {
    name: string;
    fill: string;
    stroke?: string;
    opacity?: number;
    hoverFill?: string;
};

/**
 * Represents a rectangular section of the stadium
 */
export type RectSection = {
    type: "rect";
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    colorKey: string;
    rotation?: number;
};

/**
 * Represents a polygon section (arbitrary shape)
 */
export type PolygonSection = {
    type: "polygon";
    id: string;
    label: string;
    points: Point[];
    colorKey: string;
};

/**
 * Represents a circular section
 */
export type CircleSection = {
    type: "circle";
    id: string;
    label: string;
    cx: number;
    cy: number;
    r: number;
    colorKey: string;
};

/**
 * Union type for any section shape
 */
export type Section = RectSection | PolygonSection | CircleSection;

/**
 * Complete seat map configuration
 */
export type SeatMapConfig = {
    /** Unique identifier for this seat map */
    id: string;
    
    /** Human-readable name */
    name: string;
    
    /** SVG viewBox dimensions */
    viewBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    
    /** Stadium sections to render */
    sections: Section[];
    
    /** Color palette for sections */
    colors: Record<string, SectionColor>;
    
    /** Optional metadata */
    metadata?: {
        capacity?: number;
        region?: string;
        lastUpdated?: string;
    };
};

/**
 * Props for SeatMapRenderer component
 */
export type SeatMapRendererProps = {
    /** Seat map configuration */
    config: SeatMapConfig;
    
    /** Width of SVG container (CSS) */
    width?: string | number;
    
    /** Height of SVG container (CSS) */
    height?: string | number;
    
    /** CSS class for styling */
    className?: string;
    
    /** Callback when section is clicked (for future interaction) */
    onSectionClick?: (section: Section) => void;
    
    /** Callback when section is hovered (for future interaction) */
    onSectionHover?: (section: Section | null) => void;
    
    /** Show section labels */
    showLabels?: boolean;
    
    /** Default color key if section's color is not found */
    defaultColorKey?: string;
    
    /** SVG styling options */
    svgProps?: React.SVGAttributes<SVGSVGElement>;
};

/**
 * Represents the state of a section
 */
export type SectionState = {
    id: string;
    status: "available" | "booked" | "blocked" | "selected";
    occupancy?: number;
    capacity?: number;
};

/**
 * Seat map state including all sections and their current status
 */
export type SeatMapState = {
    config: SeatMapConfig;
    sectionStates: Record<string, SectionState>;
};
