/**
 * Seat Map Components
 * SVG-based stadium section renderer
 */

export { SeatMapRenderer } from "./SeatMapRenderer";
export type {
    Point,
    SectionColor,
    RectSection,
    PolygonSection,
    CircleSection,
    Section,
    SeatMapConfig,
    SeatMapRendererProps,
    SectionState,
    SeatMapState,
} from "./types";
export {
    defaultStadiumConfig,
    compactStadiumConfig,
    footballStadiumConfig,
    getConfigById,
    STADIUM_CONFIGS,
} from "./seatMap.config";
