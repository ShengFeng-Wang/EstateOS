import { PALETTE } from '../materials/statusAppearance';
import type { VisualizationMode } from '../types/digitalTwin';

const LEGEND_BY_MODE: Record<VisualizationMode, { swatch: string; label: string }[]> = {
  occupancy: [
    { swatch: PALETTE.occupied, label: 'Occupied' },
    { swatch: PALETTE.vacant, label: 'Vacant' },
    { swatch: PALETTE.maintenance, label: 'Maintenance' },
  ],
  revenue: [
    { swatch: PALETTE.occupied, label: 'Higher normalized revenue = brighter' },
    { swatch: PALETTE.gridLine, label: 'Revenue unavailable' },
  ],
  contract: [
    { swatch: PALETTE.occupied, label: 'Active' },
    { swatch: PALETTE.maintenance, label: 'Expiring soon' },
    { swatch: PALETTE.gridLine, label: 'No contract' },
  ],
  maintenance: [
    { swatch: PALETTE.gridLine, label: '0 open requests' },
    { swatch: PALETTE.maintenance, label: '1 / 2–3 / 4+ open (intensity increases)' },
  ],
};

interface SpatialLegendProps {
  mode: VisualizationMode;
}

export function SpatialLegend({ mode }: SpatialLegendProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: '10px 14px',
        borderRadius: 6,
        background: 'rgba(10, 15, 13, 0.85)',
        border: '1px solid #275B43',
        color: '#F1F0E9',
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        fontSize: 11,
        maxWidth: 220,
      }}
    >
      {LEGEND_BY_MODE[mode].map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: item.swatch, flexShrink: 0 }} />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
