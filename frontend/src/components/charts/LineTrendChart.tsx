import { useId, useRef, useState } from 'react';
import styles from '../../styles/visuallyHidden.module.css';

export interface TrendPoint {
  label: string;
  value: number;
}

interface LineTrendChartProps {
  data: TrendPoint[];
  formatValue: (value: number) => string;
  color?: string;
  ariaLabel: string;
}

const WIDTH = 600;
const HEIGHT = 180;
const MARGIN = { top: 22, right: 12, bottom: 24, left: 12 };
const PLOT_W = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_H = HEIGHT - MARGIN.top - MARGIN.bottom;

function niceCeil(value: number): number {
  if (value <= 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const niceNormalized = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return niceNormalized * magnitude;
}

export function LineTrendChart({ data, formatValue, color = '#275b43', ariaLabel }: LineTrendChartProps) {
  const gradientId = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const maxValue = Math.max(...data.map((d) => d.value), 0);
  const yMax = niceCeil(maxValue * 1.15 || 1);
  const n = data.length;

  const xFor = (i: number) => MARGIN.left + (n === 1 ? PLOT_W / 2 : (i / (n - 1)) * PLOT_W);
  const yFor = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(d.value)}`).join(' ');
  const areaPath = `${linePath} L ${xFor(n - 1)} ${MARGIN.top + PLOT_H} L ${xFor(0)} ${MARGIN.top + PLOT_H} Z`;

  const yTicks = [0, yMax / 2, yMax];

  function handlePointerMove(e: React.PointerEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const step = n === 1 ? PLOT_W : PLOT_W / (n - 1);
    const idx = Math.round((relX - MARGIN.left) / step);
    setHoverIndex(Math.min(n - 1, Math.max(0, idx)));
  }

  const hovered = hoverIndex !== null ? data[hoverIndex] : null;
  const last = data[n - 1];

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={ariaLabel}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.12" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="#c9cdc7"
              strokeWidth={1}
            />
            <text x={MARGIN.left} y={yFor(t) - 4} fontSize={9} fill="#737b75" fontFamily="IBM Plex Mono, monospace">
              {formatValue(t)}
            </text>
          </g>
        ))}

        {n > 0 && <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />}
        {n > 0 && <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}

        {data.map((d, i) => (
          <text
            key={d.label}
            x={xFor(i)}
            y={HEIGHT - 4}
            fontSize={9}
            fill="#737b75"
            fontFamily="IBM Plex Mono, monospace"
            textAnchor="middle"
          >
            {d.label}
          </text>
        ))}

        {last && (
          <>
            <circle cx={xFor(n - 1)} cy={yFor(last.value)} r={4} fill={color} stroke="#fff" strokeWidth={2} />
            <text
              x={xFor(n - 1)}
              y={yFor(last.value) - 10}
              fontSize={10}
              fontWeight={600}
              fill="#17201c"
              textAnchor="end"
              fontFamily="Instrument Sans, sans-serif"
            >
              {formatValue(last.value)}
            </text>
          </>
        )}

        {hovered && hoverIndex !== null && (
          <g>
            <line
              x1={xFor(hoverIndex)}
              x2={xFor(hoverIndex)}
              y1={MARGIN.top}
              y2={MARGIN.top + PLOT_H}
              stroke="#737b75"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <circle cx={xFor(hoverIndex)} cy={yFor(hovered.value)} r={4} fill={color} stroke="#fff" strokeWidth={2} />
            <g transform={`translate(${Math.min(Math.max(xFor(hoverIndex), 40), WIDTH - 40)}, ${MARGIN.top - 6})`}>
              <rect x={-34} y={-16} width={68} height={16} rx={3} fill="#17201c" />
              <text x={0} y={-4} fontSize={9} fill="#f1f0e9" textAnchor="middle" fontFamily="IBM Plex Mono, monospace">
                {hovered.label} · {formatValue(hovered.value)}
              </text>
            </g>
          </g>
        )}

        <rect
          x={MARGIN.left}
          y={MARGIN.top}
          width={PLOT_W}
          height={PLOT_H}
          fill="transparent"
          onPointerMove={handlePointerMove}
        />
      </svg>

      <table className={styles.srOnly}>
        <caption>{ariaLabel}</caption>
        <thead>
          <tr>
            <th>Period</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <td>{d.label}</td>
              <td>{formatValue(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
