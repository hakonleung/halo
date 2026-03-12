'use client';

const W = 80;
const H = 28;

interface Props {
  prices: number[];
}

export function EquitySparkline({ prices }: Props) {
  if (prices.length < 2) return <svg width={W} height={H} />;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices
    .map((p, i) => {
      const x = (i / (prices.length - 1)) * W;
      const y = H - ((p - min) / range) * (H - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const isUp = prices[prices.length - 1] >= prices[0];
  const color = isUp ? '#FF4444' : '#00FF41';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}
