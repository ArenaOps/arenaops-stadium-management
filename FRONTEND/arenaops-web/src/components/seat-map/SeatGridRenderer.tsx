"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ArcGeometry, SectionTemplate, SeatTemplate } from "./types";
import { useBooking } from "@/features/bookings/useBooking";

type SeatGridRendererProps = {
  section: SectionTemplate;
  seats: SeatTemplate[];
};

type RenderSeat = {
  seat: SeatTemplate;
  x: number;
  y: number;
  rowIndex: number;
  columnIndex: number;
};

type SeatBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

type CameraState = {
  scale: number;
  translateX: number;
  translateY: number;
};

type SeatVisualState = "available" | "selected" | "booked";

const VIEWPORT = {
  width: 1000,
  height: 800,
};

const LAYOUT_ORIGIN = {
  x: VIEWPORT.width / 2,
  y: VIEWPORT.height / 2,
};

const SEAT_GRID_SPACING_X = 28;
const SEAT_GRID_SPACING_Y = 23;

const SEAT_WIDTH = 20;
const SEAT_HEIGHT = 14;
const SEAT_BACKREST_WIDTH = 14;
const SEAT_BACKREST_HEIGHT = 4.2;

const CAMERA_TRANSITION_MS = 420;
const CAMERA_CONTENT_PADDING = 56;

const DEFAULT_CAMERA: CameraState = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

const ROW_COLLATOR = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const getSeatBounds = (renderSeats: RenderSeat[]): SeatBounds => {
  if (!renderSeats.length) {
    return {
      minX: LAYOUT_ORIGIN.x,
      maxX: LAYOUT_ORIGIN.x,
      minY: LAYOUT_ORIGIN.y,
      maxY: LAYOUT_ORIGIN.y,
      width: 1,
      height: 1,
      centerX: LAYOUT_ORIGIN.x,
      centerY: LAYOUT_ORIGIN.y,
    };
  }

  const xs = renderSeats.map((entry) => entry.x);
  const ys = renderSeats.map((entry) => entry.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
};

const getSeatPalette = (seatState: SeatVisualState) => {
  if (seatState === "booked") {
    return {
      fill: "#6b7280",
      backrest: "#9ca3af",
      label: "#f8fafc",
      stroke: "#334155",
      selectionStroke: "transparent",
      labelStroke: "#0f172a",
    };
  }

  if (seatState === "selected") {
    return {
      fill: "#10b981",
      backrest: "#34d399",
      label: "#ecfeff",
      stroke: "#065f46",
      selectionStroke: "#6ee7b7",
      labelStroke: "#065f46",
    };
  }

  return {
    fill: "#f8fafc",
    backrest: "#cbd5e1",
    label: "#0f172a",
    stroke: "#334155",
    selectionStroke: "transparent",
    labelStroke: "#ffffff",
  };
};

const resolveSectionRotation = (section: SectionTemplate) => {
  if (section.geometry.geometryType !== "Arc") {
    return 0;
  }

  const arc = section.geometry as ArcGeometry;
  const midAngle = (arc.startAngle + arc.endAngle) / 2;
  return midAngle > 180 ? midAngle - 360 : midAngle;
};

const clampWithFallback = (
  value: number,
  min: number,
  max: number,
  fallback: number
) => {
  if (min > max) {
    return fallback;
  }

  return clamp(value, min, max);
};

const buildCameraTarget = (
  renderSeats: RenderSeat[],
  selectedSeatIdSet: Set<string>
): CameraState => {
  if (!renderSeats.length) {
    return DEFAULT_CAMERA;
  }

  const selectedSeats = selectedSeatIdSet.size
    ? renderSeats.filter((entry) => selectedSeatIdSet.has(entry.seat.seatId))
    : renderSeats;

  const focusBounds = getSeatBounds(selectedSeats);
  const allBounds = getSeatBounds(renderSeats);

  const focusPadding = selectedSeatIdSet.size > 0 ? 72 : 156;
  const minFocusWidth = selectedSeatIdSet.size > 0 ? 176 : 460;
  const minFocusHeight = selectedSeatIdSet.size > 0 ? 148 : 340;

  const focusWidth = Math.max(focusBounds.width + focusPadding * 2, minFocusWidth);
  const focusHeight = Math.max(focusBounds.height + focusPadding * 2, minFocusHeight);

  const rawScale = Math.min(VIEWPORT.width / focusWidth, VIEWPORT.height / focusHeight);
  const maxScale = selectedSeatIdSet.size > 0 ? 3.4 : 2.15;
  const scale = clamp(rawScale, 1, maxScale);

  const centeredX = VIEWPORT.width / 2 - focusBounds.centerX * scale;
  const centeredY = VIEWPORT.height / 2 - focusBounds.centerY * scale;

  const minTranslateX = VIEWPORT.width - (allBounds.maxX + CAMERA_CONTENT_PADDING) * scale;
  const maxTranslateX = -(allBounds.minX - CAMERA_CONTENT_PADDING) * scale;
  const minTranslateY = VIEWPORT.height - (allBounds.maxY + CAMERA_CONTENT_PADDING) * scale;
  const maxTranslateY = -(allBounds.minY - CAMERA_CONTENT_PADDING) * scale;

  const fallbackTranslateX = VIEWPORT.width / 2 - allBounds.centerX * scale;
  const fallbackTranslateY = VIEWPORT.height / 2 - allBounds.centerY * scale;

  return {
    scale,
    translateX: clampWithFallback(
      centeredX,
      minTranslateX,
      maxTranslateX,
      fallbackTranslateX
    ),
    translateY: clampWithFallback(
      centeredY,
      minTranslateY,
      maxTranslateY,
      fallbackTranslateY
    ),
  };
};

type SeatNodeProps = {
  renderSeat: RenderSeat;
  isSelected: boolean;
  onToggleSeat: (seatId: string) => void;
};

const SeatNode = React.memo(
  ({ renderSeat, isSelected, onToggleSeat }: SeatNodeProps) => {
    const isAvailable = renderSeat.seat.isActive;
    const seatState: SeatVisualState = !isAvailable
      ? "booked"
      : isSelected
        ? "selected"
        : "available";
    const palette = getSeatPalette(seatState);

    const handleToggle = () => {
      if (!isAvailable) return;
      onToggleSeat(renderSeat.seat.seatId);
    };

    return (
      <g transform={`translate(${renderSeat.x} ${renderSeat.y})`}>
        <g
          className={isAvailable ? "seat-node seat-node--interactive" : "seat-node seat-node--booked"}
          onClick={handleToggle}
          role={isAvailable ? "button" : undefined}
          tabIndex={isAvailable ? 0 : -1}
          aria-disabled={!isAvailable}
          aria-pressed={isSelected}
          aria-label={`Seat ${renderSeat.seat.seatLabel} ${
            isAvailable ? (isSelected ? "selected" : "available") : "booked"
          }`}
          onKeyDown={(event) => {
            if (!isAvailable) return;

            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onToggleSeat(renderSeat.seat.seatId);
            }
          }}
        >
          {isSelected && (
            <rect
              x={-SEAT_WIDTH / 2 - 5}
              y={-SEAT_HEIGHT / 2 - 7}
              width={SEAT_WIDTH + 10}
              height={SEAT_HEIGHT + 12}
              rx={7}
              fill="none"
              stroke={palette.selectionStroke}
              strokeWidth={2}
              opacity={0.92}
            />
          )}

          <rect
            x={-SEAT_BACKREST_WIDTH / 2}
            y={-SEAT_HEIGHT / 2 - 5.6}
            width={SEAT_BACKREST_WIDTH}
            height={SEAT_BACKREST_HEIGHT}
            rx={2}
            fill={palette.backrest}
          />

          <rect
            x={-SEAT_WIDTH / 2}
            y={-SEAT_HEIGHT / 2}
            width={SEAT_WIDTH}
            height={SEAT_HEIGHT}
            rx={4.4}
            fill={palette.fill}
            stroke={palette.stroke}
            strokeWidth={1.2}
          />

          {!isAvailable && (
            <line
              x1={-SEAT_WIDTH / 2 + 2}
              y1={-SEAT_HEIGHT / 2 + 2}
              x2={SEAT_WIDTH / 2 - 2}
              y2={SEAT_HEIGHT / 2 - 2}
              stroke="#0f172a"
              strokeWidth={1.3}
              opacity={0.52}
              pointerEvents="none"
            />
          )}

          <text
            x={0}
            y={0.6}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="7.1"
            fontWeight="700"
            fill={palette.label}
            stroke={palette.labelStroke}
            strokeWidth={0.46}
            paintOrder="stroke"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
            pointerEvents="none"
          >
            {renderSeat.seat.seatNumber}
          </text>
        </g>
      </g>
    );
  },
  (previous, next) =>
    previous.renderSeat === next.renderSeat &&
    previous.isSelected === next.isSelected
);

SeatNode.displayName = "SeatNode";

export const SeatGridRenderer = React.memo(
  ({ section, seats }: SeatGridRendererProps) => {
    const { state, toggleSeat, resetSection, canProceed } = useBooking();

    const sectionSeats = useMemo(
      () => seats.filter((seat) => seat.sectionId === section.sectionId),
      [seats, section.sectionId]
    );

    const sectionSeatIdSet = useMemo(
      () => new Set(sectionSeats.map((seat) => seat.seatId)),
      [sectionSeats]
    );

    const selectedSectionSeatIds = useMemo(
      () => state.selectedSeats.filter((seatId) => sectionSeatIdSet.has(seatId)),
      [sectionSeatIdSet, state.selectedSeats]
    );

    const shouldLockPageScroll = selectedSectionSeatIds.length > 0;

    useEffect(() => {
      if (!shouldLockPageScroll) {
        return undefined;
      }

      const body = document.body;
      const html = document.documentElement;

      const previousBodyOverflow = body.style.overflow;
      const previousHtmlOverflow = html.style.overflow;
      const previousBodyOverscrollBehavior = body.style.overscrollBehavior;
      const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;

      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      body.style.overscrollBehavior = "none";
      html.style.overscrollBehavior = "none";

      return () => {
        body.style.overflow = previousBodyOverflow;
        html.style.overflow = previousHtmlOverflow;
        body.style.overscrollBehavior = previousBodyOverscrollBehavior;
        html.style.overscrollBehavior = previousHtmlOverscrollBehavior;
      };
    }, [shouldLockPageScroll]);

    const selectedSeatIdSet = useMemo(
      () => new Set(selectedSectionSeatIds),
      [selectedSectionSeatIds]
    );

    const seatLayout = useMemo(() => {
      const rowMap = new Map<string, SeatTemplate[]>();
      sectionSeats.forEach((seat) => {
        const existingRow = rowMap.get(seat.rowLabel);
        if (existingRow) {
          existingRow.push(seat);
        } else {
          rowMap.set(seat.rowLabel, [seat]);
        }
      });

      const orderedRows = [...rowMap.entries()]
        .sort(([leftRow], [rightRow]) => ROW_COLLATOR.compare(leftRow, rightRow))
        .map(([, rowSeats]) => rowSeats.sort((left, right) => left.seatNumber - right.seatNumber));

      const rotationDegrees = resolveSectionRotation(section);
      const radians = (rotationDegrees * Math.PI) / 180;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);

      const totalRows = orderedRows.length;
      const renderSeats: RenderSeat[] = [];

      orderedRows.forEach((rowSeats, rowIndex) => {
        const rowOffset = (rowSeats.length - 1) / 2;

        rowSeats.forEach((seat, columnIndex) => {
          const localX = (columnIndex - rowOffset) * SEAT_GRID_SPACING_X;
          const localY = (rowIndex - (totalRows - 1) / 2) * SEAT_GRID_SPACING_Y;

          renderSeats.push({
            seat,
            rowIndex,
            columnIndex,
            x: LAYOUT_ORIGIN.x + localX * cos - localY * sin,
            y: LAYOUT_ORIGIN.y + localX * sin + localY * cos,
          });
        });
      });

      return {
        renderSeats,
        seatById: new Map(renderSeats.map((entry) => [entry.seat.seatId, entry])),
      };
    }, [section, sectionSeats]);

    const selectedSeatLabels = useMemo(
      () =>
        selectedSectionSeatIds
          .map((seatId) => seatLayout.seatById.get(seatId)?.seat.seatLabel)
          .filter((label): label is string => Boolean(label)),
      [seatLayout.seatById, selectedSectionSeatIds]
    );

    const targetCamera = useMemo(
      () => buildCameraTarget(seatLayout.renderSeats, selectedSeatIdSet),
      [seatLayout.renderSeats, selectedSeatIdSet]
    );

    const [camera, setCamera] = useState<CameraState>(() => targetCamera);
    const animationFrameRef = useRef<number | null>(null);
    const lastCameraRef = useRef<CameraState>(targetCamera);

    useEffect(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      const from = lastCameraRef.current;
      const to = targetCamera;

      const hasMeaningfulDelta =
        Math.abs(from.scale - to.scale) > 0.001 ||
        Math.abs(from.translateX - to.translateX) > 0.2 ||
        Math.abs(from.translateY - to.translateY) > 0.2;

      if (!hasMeaningfulDelta) {
        animationFrameRef.current = requestAnimationFrame(() => {
          setCamera(to);
          lastCameraRef.current = to;
          animationFrameRef.current = null;
        });

        return () => {
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
        };
      }

      const start = performance.now();

      const animateCamera = (timestamp: number) => {
        const progress = Math.min((timestamp - start) / CAMERA_TRANSITION_MS, 1);
        const eased = easeOutCubic(progress);

        const nextCamera: CameraState = {
          scale: from.scale + (to.scale - from.scale) * eased,
          translateX: from.translateX + (to.translateX - from.translateX) * eased,
          translateY: from.translateY + (to.translateY - from.translateY) * eased,
        };

        setCamera(nextCamera);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateCamera);
        } else {
          lastCameraRef.current = to;
          animationFrameRef.current = null;
        }
      };

      animationFrameRef.current = requestAnimationFrame(animateCamera);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [targetCamera]);

    const handleToggleSeat = useCallback(
      (seatId: string) => {
        toggleSeat(seatId);
      },
      [toggleSeat]
    );

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/70">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{section.name}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {selectedSectionSeatIds.length > 0
                ? `${selectedSectionSeatIds.length} seat(s) selected`
                : "Choose one or more seats to continue"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border border-slate-500 bg-slate-50" />
                Available
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border border-emerald-900 bg-emerald-500" />
                Selected
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm border border-slate-700 bg-slate-500" />
                Booked
              </span>
            </div>

            <button
              type="button"
              onClick={resetSection}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Back to Sections
            </button>
            <button
              type="button"
              disabled={!canProceed}
              className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-45"
            >
              Proceed
            </button>
          </div>
        </div>

        {selectedSeatLabels.length > 0 && (
          <div className="flex max-h-28 flex-wrap gap-2 overflow-auto rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            {selectedSeatLabels.map((label) => (
              <span
                key={label}
                className="rounded-full border border-emerald-300 bg-white px-2 py-0.5 font-medium dark:border-emerald-800 dark:bg-emerald-900/40"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="seat-map-scroll-shell rounded-lg border">
          <div className="seat-map-scroll-area">
            <svg
              viewBox={`0 0 ${VIEWPORT.width} ${VIEWPORT.height}`}
              width={VIEWPORT.width}
              height={VIEWPORT.height}
              className="seat-map-canvas seat-map-canvas--section"
              preserveAspectRatio="xMidYMid meet"
            >
              <g
                transform={`matrix(${camera.scale} 0 0 ${camera.scale} ${camera.translateX} ${camera.translateY})`}
              >
                {seatLayout.renderSeats.map((renderSeat) => (
                  <SeatNode
                    key={renderSeat.seat.seatId}
                    renderSeat={renderSeat}
                    isSelected={selectedSeatIdSet.has(renderSeat.seat.seatId)}
                    onToggleSeat={handleToggleSeat}
                  />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>
    );
  }
);

SeatGridRenderer.displayName = "SeatGridRenderer";
