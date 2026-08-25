import { Html } from '@react-three/drei';
import type { DigitalTwinProperty } from '../types/digitalTwin';

interface PropertyLabelProps {
  property: DigitalTwinProperty;
  height: number;
}

function formatCurrency(amount: number): string {
  return `NT$${Math.round(amount).toLocaleString('en-US')}`;
}

// HTML overlay anchored above the building. Only renders fields the API actually
// supplied — never invents an occupancy/revenue number (spec: "Label behavior").
export function PropertyLabel({ property, height }: PropertyLabelProps) {
  return (
    <Html position={[0, height + 0.6, 0]} center distanceFactor={14} style={{ pointerEvents: 'none' }} occlude={false}>
      <div
        style={{
          minWidth: 160,
          padding: '8px 10px',
          borderRadius: 6,
          background: 'rgba(10, 15, 13, 0.92)',
          border: '1px solid #275B43',
          color: '#F1F0E9',
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          fontSize: 11,
          lineHeight: 1.5,
          whiteSpace: 'nowrap',
          transform: 'translateY(-4px)',
        }}
      >
        <div style={{ color: '#B7F34A', letterSpacing: '0.04em' }}>{property.code}</div>
        <div>
          {property.city} · {property.district}
        </div>
        {property.occupancyPercent != null && <div>Occupancy {property.occupancyPercent}%</div>}
        {property.monthlyRevenue != null && <div>Monthly Revenue {formatCurrency(property.monthlyRevenue)}</div>}
      </div>
    </Html>
  );
}
