'use client';

import type { ChartBar } from './equity-kline-utils';

interface CandlestickShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartBar;
}

export const CandlestickShape = ({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
}: CandlestickShapeProps) => {
  if (!payload) return null;
  const { open, close, high, low } = payload;
  const isGain = close >= open;
  const color = isGain ? '#FF4444' : '#00FF41';
  const cx = x + width / 2;
  const candleWidth = Math.max(width * 0.7, 2);

  const wickSpan = high - low;
  let yOpen: number;
  let yClose: number;
  if (wickSpan <= 0) {
    yOpen = y;
    yClose = y;
  } else {
    yOpen = y + height * ((high - open) / wickSpan);
    yClose = y + height * ((high - close) / wickSpan);
  }

  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1);

  return (
    <g>
      <line x1={cx} y1={y} x2={cx} y2={y + height} stroke={color} strokeWidth={1} />
      <rect
        x={cx - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight}
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

export const VolumeBar = (props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  close?: number;
  open?: number;
}) => {
  const { x = 0, y = 0, width = 0, height = 0, close = 0, open = 0 } = props;
  const fill = close >= open ? 'rgba(255,68,68,0.6)' : 'rgba(0,255,65,0.6)';
  return <rect x={x} y={y} width={width} height={height} fill={fill} />;
};
