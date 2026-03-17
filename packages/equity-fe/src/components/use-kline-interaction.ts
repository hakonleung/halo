import { startTransition, useCallback, useEffect, useRef, useState } from 'react';

import type { ChartBar } from './equity-kline-utils';
import type { KlineMode } from './equity-kline-chart';

// Must match ComposedChart margin + YAxis width in equity-kline-chart.tsx
const YAXIS_WIDTH = 55;
const CHART_RIGHT_MARGIN = 8;

// Must match the 360px price chart: margin.top=4, XAxis ~30px → plot area y∈[4,330]
const PLOT_TOP = 4;
const PLOT_BOTTOM = 330;
const PLOT_HEIGHT = PLOT_BOTTOM - PLOT_TOP;

interface UseKlineInteractionParams {
  visible: ChartBar[];
  priceMin: number;
  priceMax: number;
  mode: KlineMode;
  onSelectRange?: (start: string, end: string) => void;
}

export function useKlineInteraction({
  visible,
  priceMin,
  priceMax,
  mode,
  onSelectRange,
}: UseKlineInteractionParams) {
  // ── Hover ──────────────────────────────────────────────────────────────────
  const [hoveredBar, setHoveredBar] = useState<
    | (ChartBar & {
        ystClose: number;
      })
    | null
  >(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hoveredBarRef = useRef<ChartBar | null>(null);
  const hoveredIndexRef = useRef<number | null>(null);
  // Reset when visible data changes (bars/range switch)
  const visibleRef = useRef(visible);
  useEffect(() => {
    visibleRef.current = visible;
    hoveredBarRef.current = null;
    hoveredIndexRef.current = null;
    setHoveredBar(null);
    setHoveredIndex(null);
  }, [visible]);

  // ── Crosshair + vertical cursor DOM refs (zero React re-renders) ───────────
  const crosshairHLineRef = useRef<HTMLDivElement>(null); // horizontal dashed line
  const crosshairVLineRef = useRef<HTMLDivElement>(null); // vertical dashed line
  const crosshairLabelRef = useRef<HTMLDivElement>(null); // price label on y-axis
  const crosshairPriceTextRef = useRef<HTMLSpanElement>(null);
  const priceRangeRef = useRef({ min: priceMin, max: priceMax });
  useEffect(() => {
    priceRangeRef.current = { min: priceMin, max: priceMax };
  }, [priceMin, priceMax]);

  // ── Click-based selection ──────────────────────────────────────────────────
  // First click sets the anchor; second click confirms the range.
  const selStartRef = useRef<string | null>(null);
  const [selStartDate, setSelStartDate] = useState<string | null>(null);
  const [selRange, setSelRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    if (mode !== 'select') {
      setSelRange(null);
      setSelStartDate(null);
      selStartRef.current = null;
    }
  }, [mode]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const hideCrosshair = useCallback(() => {
    if (crosshairHLineRef.current) crosshairHLineRef.current.style.display = 'none';
    if (crosshairVLineRef.current) crosshairVLineRef.current.style.display = 'none';
    if (crosshairLabelRef.current) crosshairLabelRef.current.style.display = 'none';
  }, []);

  // ── Container-level handlers ───────────────────────────────────────────────
  const handleContainerClick = useCallback(() => {
    if (mode !== 'select' || !hoveredBarRef.current) return;
    if (!selStartRef.current) {
      // First click: set anchor
      selStartRef.current = hoveredBarRef.current.trade_date;
      setSelStartDate(hoveredBarRef.current.trade_date);
      setSelRange([hoveredBarRef.current.trade_date, hoveredBarRef.current.trade_date]);
    } else {
      // Second click: confirm range
      const sorted = [selStartRef.current, hoveredBarRef.current.trade_date].sort() as [
        string,
        string,
      ];
      selStartRef.current = null;
      setSelStartDate(null);
      setSelRange(null);
      onSelectRange?.(sorted[0], sorted[1]);
    }
  }, [mode, onSelectRange]);

  const handleContainerMouseLeave = useCallback(() => {
    // Keep the anchor on mouse leave (user may re-enter) but collapse preview to anchor point
    if (selStartRef.current) {
      setSelRange([selStartRef.current, selStartRef.current]);
    }
    hideCrosshair();
    if (hoveredBarRef.current !== null) {
      hoveredBarRef.current = null;
      hoveredIndexRef.current = null;
      startTransition(() => {
        setHoveredBar(null);
        setHoveredIndex(null);
      });
    }
  }, [hideCrosshair]);

  // Single native onMouseMove handles EVERYTHING — no Recharts onMouseMove needed.
  // This prevents Recharts from calling setState on every pixel → no SVG re-render.
  const handleContainerMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const { bars: vis } = { bars: visibleRef.current };

      // ── Vertical crosshair + bar detection (from x) ─────────────────────────
      const plotWidth = rect.width - YAXIS_WIDTH - CHART_RIGHT_MARGIN;
      const chartX = x - YAXIS_WIDTH;

      if (chartX >= 0 && chartX <= plotWidth && vis.length > 0) {
        const idx = Math.min(
          vis.length - 1,
          Math.max(0, Math.floor((chartX / plotWidth) * vis.length)),
        );
        const bar = vis[idx] ?? null;

        // Only trigger React state update when bar changes.
        // startTransition marks the info panel re-render as non-urgent so React
        // can skip intermediate frames during fast mouse movement.
        if (bar?.trade_date !== hoveredBarRef.current?.trade_date) {
          hoveredBarRef.current = bar;
          hoveredIndexRef.current = idx;
          startTransition(() => {
            setHoveredBar({
              ...bar,
              ystClose: vis[idx - 1]?.close ?? bar.open,
            });
            setHoveredIndex(idx);
          });
        }

        // Live preview: update range end as user hovers after setting anchor
        if (mode === 'select' && selStartRef.current && bar) {
          setSelRange([selStartRef.current, bar.trade_date].sort() as [string, string]);
        }

        // Vertical line at bar center
        if (crosshairVLineRef.current) {
          const barCenterX = YAXIS_WIDTH + (idx + 0.5) * (plotWidth / vis.length);
          crosshairVLineRef.current.style.display = 'block';
          crosshairVLineRef.current.style.left = `${barCenterX}px`;
        }
      } else {
        if (crosshairVLineRef.current) crosshairVLineRef.current.style.display = 'none';
      }

      // ── Horizontal crosshair + price label (from y) ──────────────────────────
      if (y >= PLOT_TOP && y <= PLOT_BOTTOM) {
        const { min, max } = priceRangeRef.current;
        const ratio = (y - PLOT_TOP) / PLOT_HEIGHT;
        const price = max - ratio * (max - min);
        const labelY = Math.max(PLOT_TOP, Math.min(PLOT_BOTTOM - 18, y - 9));

        if (crosshairHLineRef.current) {
          crosshairHLineRef.current.style.display = 'block';
          crosshairHLineRef.current.style.top = `${y}px`;
        }
        if (crosshairLabelRef.current) {
          crosshairLabelRef.current.style.display = 'flex';
          crosshairLabelRef.current.style.top = `${labelY}px`;
        }
        if (crosshairPriceTextRef.current) {
          crosshairPriceTextRef.current.textContent = price.toFixed(2);
        }
      } else {
        if (crosshairHLineRef.current) crosshairHLineRef.current.style.display = 'none';
        if (crosshairLabelRef.current) crosshairLabelRef.current.style.display = 'none';
      }
    },
    [mode],
  );

  return {
    hoveredBar,
    hoveredIndex,
    selRange,
    selStartDate,
    crosshairHLineRef,
    crosshairVLineRef,
    crosshairLabelRef,
    crosshairPriceTextRef,
    handleContainerClick,
    handleContainerMouseLeave,
    handleContainerMouseMove,
  };
}
