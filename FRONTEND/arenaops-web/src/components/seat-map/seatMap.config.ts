/**
 * Seat Map Configuration
 * Defines stadium sections, colors, and layout
 */

import type { SeatMapConfig } from "./types";

/**
 * Default stadium sections configuration
 * Represents a typical modern stadium with 4 main sections (North, South, East, West)
 * and additional premium sections
 */
export const defaultStadiumConfig: SeatMapConfig = {
    id: "stadium-01",
    name: "Main Arena",
    
    viewBox: {
        x: 0,
        y: 0,
        width: 1000,
        height: 800,
    },
    
    sections: [
        // North Section (Upper)
        {
            type: "rect",
            id: "north-upper",
            label: "North Upper",
            x: 350,
            y: 20,
            width: 300,
            height: 120,
            colorKey: "standard",
        },
        // North Premium (Center-top)
        {
            type: "rect",
            id: "north-center",
            label: "North Center",
            x: 400,
            y: 50,
            width: 200,
            height: 80,
            colorKey: "premium",
        },
        
        // South Section (Lower)
        {
            type: "rect",
            id: "south-upper",
            label: "South Upper",
            x: 350,
            y: 660,
            width: 300,
            height: 120,
            colorKey: "standard",
        },
        // South Premium
        {
            type: "rect",
            id: "south-center",
            label: "South Center",
            x: 400,
            y: 670,
            width: 200,
            height: 80,
            colorKey: "premium",
        },
        
        // East Section (Right)
        {
            type: "rect",
            id: "east-upper",
            label: "East Upper",
            x: 680,
            y: 250,
            width: 120,
            height: 300,
            colorKey: "standard",
        },
        // East Premium (Corner)
        {
            type: "polygon",
            id: "east-premium",
            label: "East Premium",
            points: [
                { x: 700, y: 300 },
                { x: 780, y: 280 },
                { x: 800, y: 400 },
                { x: 780, y: 480 },
                { x: 700, y: 500 },
            ],
            colorKey: "vip",
        },
        
        // West Section (Left)
        {
            type: "rect",
            id: "west-upper",
            label: "West Upper",
            x: 200,
            y: 250,
            width: 120,
            height: 300,
            colorKey: "standard",
        },
        // West Premium (Corner)
        {
            type: "polygon",
            id: "west-premium",
            label: "West Premium",
            points: [
                { x: 300, y: 300 },
                { x: 220, y: 280 },
                { x: 200, y: 400 },
                { x: 220, y: 480 },
                { x: 300, y: 500 },
            ],
            colorKey: "vip",
        },

        // Center Field (Lower-Middle) - for reference/non-bookable
        {
            type: "rect",
            id: "center-field",
            label: "Field",
            x: 350,
            y: 350,
            width: 300,
            height: 100,
            colorKey: "blocked",
        },
    ],
    
    colors: {
        standard: {
            name: "Standard",
            fill: "#3b82f6",
            stroke: "#1e40af",
            opacity: 0.85,
            hoverFill: "#1d4ed8",
        },
        premium: {
            name: "Premium",
            fill: "#f59e0b",
            stroke: "#d97706",
            opacity: 0.85,
            hoverFill: "#d97706",
        },
        vip: {
            name: "VIP",
            fill: "#ec4899",
            stroke: "#be185d",
            opacity: 0.85,
            hoverFill: "#be185d",
        },
        blocked: {
            name: "Not Available",
            fill: "#6b7280",
            stroke: "#374151",
            opacity: 0.6,
            hoverFill: "#6b7280",
        },
        selected: {
            name: "Selected",
            fill: "#10b981",
            stroke: "#047857",
            opacity: 0.9,
            hoverFill: "#059669",
        },
    },
    
    metadata: {
        capacity: 50000,
        region: "North America",
        lastUpdated: new Date().toISOString(),
    },
};

/**
 * Alternative compact stadium configuration
 * Smaller arena with fewer sections
 */
export const compactStadiumConfig: SeatMapConfig = {
    id: "arena-compact",
    name: "Compact Arena",
    
    viewBox: {
        x: 0,
        y: 0,
        width: 600,
        height: 500,
    },
    
    sections: [
        // Main seating area (oval shape approximated with rect)
        {
            type: "rect",
            id: "main-north",
            label: "North",
            x: 150,
            y: 20,
            width: 300,
            height: 100,
            colorKey: "standard",
        },
        {
            type: "rect",
            id: "main-south",
            label: "South",
            x: 150,
            y: 380,
            width: 300,
            height: 100,
            colorKey: "standard",
        },
        {
            type: "rect",
            id: "main-east",
            label: "East",
            x: 470,
            y: 150,
            width: 100,
            height: 200,
            colorKey: "premium",
        },
        {
            type: "rect",
            id: "main-west",
            label: "West",
            x: 30,
            y: 150,
            width: 100,
            height: 200,
            colorKey: "premium",
        },
        {
            type: "rect",
            id: "court",
            label: "Court",
            x: 200,
            y: 200,
            width: 200,
            height: 100,
            colorKey: "blocked",
        },
    ],
    
    colors: {
        standard: {
            name: "Standard",
            fill: "#3b82f6",
            stroke: "#1e40af",
            opacity: 0.85,
        },
        premium: {
            name: "Premium",
            fill: "#f59e0b",
            stroke: "#d97706",
            opacity: 0.85,
        },
        blocked: {
            name: "Not Available",
            fill: "#6b7280",
            stroke: "#374151",
            opacity: 0.6,
        },
    },
};

/**
 * Football stadium configuration
 * Large stadium with more detailed section layout
 */
export const footballStadiumConfig: SeatMapConfig = {
    id: "football-stadium",
    name: "Football Stadium",
    
    viewBox: {
        x: 0,
        y: 0,
        width: 1200,
        height: 700,
    },
    
    sections: [
        // Lower bowl (West side)
        { type: "rect", id: "west-100", label: "100", x: 50, y: 150, width: 80, height: 200, colorKey: "standard" },
        { type: "rect", id: "west-101", label: "101", x: 130, y: 150, width: 80, height: 200, colorKey: "standard" },
        { type: "rect", id: "west-102", label: "102", x: 210, y: 150, width: 80, height: 200, colorKey: "premium" },
        
        // Lower bowl (North side)
        { type: "rect", id: "north-110", label: "110", x: 350, y: 30, width: 200, height: 80, colorKey: "standard" },
        { type: "rect", id: "north-111", label: "111", x: 350, y: 110, width: 200, height: 70, colorKey: "premium" },
        
        // Lower bowl (East side)
        { type: "rect", id: "east-120", label: "120", x: 970, y: 150, width: 80, height: 200, colorKey: "standard" },
        { type: "rect", id: "east-121", label: "121", x: 1050, y: 150, width: 80, height: 200, colorKey: "standard" },
        
        // Lower bowl (South side)
        { type: "rect", id: "south-130", label: "130", x: 350, y: 590, width: 200, height: 80, colorKey: "standard" },
        
        // Field
        { type: "rect", id: "field", label: "Field", x: 300, y: 250, width: 600, height: 200, colorKey: "blocked" },
    ],
    
    colors: {
        standard: {
            name: "Standard",
            fill: "#3b82f6",
            stroke: "#1e40af",
            opacity: 0.8,
        },
        premium: {
            name: "Premium",
            fill: "#f59e0b",
            stroke: "#d97706",
            opacity: 0.8,
        },
        vip: {
            name: "VIP",
            fill: "#ec4899",
            stroke: "#be185d",
            opacity: 0.8,
        },
        blocked: {
            name: "Field",
            fill: "#22c55e",
            stroke: "#15803d",
            opacity: 0.6,
        },
    },
};

/**
 * Get configuration by ID
 */
export const getConfigById = (id: string): SeatMapConfig => {
    const configs: Record<string, SeatMapConfig> = {
        "stadium-01": defaultStadiumConfig,
        "arena-compact": compactStadiumConfig,
        "football-stadium": footballStadiumConfig,
    };
    return configs[id] || defaultStadiumConfig;
};

/**
 * All available stadium configurations
 */
export const STADIUM_CONFIGS = {
    default: defaultStadiumConfig,
    compact: compactStadiumConfig,
    football: footballStadiumConfig,
} as const;
