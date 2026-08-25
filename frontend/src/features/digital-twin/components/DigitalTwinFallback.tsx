import { Link } from 'react-router-dom';
import { DataTableHeader, DataTableRow } from '../../../components/DataTable';
import type { DataTableColumn } from '../../../components/DataTable';
import { StatusBadge } from '../../../components/StatusBadge';
import type { StatusTone } from '../../../components/StatusBadge';
import type { DigitalTwinProperty, PropertyStatus } from '../types/digitalTwin';

interface DigitalTwinFallbackProps {
  properties: DigitalTwinProperty[];
  reason: 'webgl-unavailable' | 'context-lost' | 'error';
}

const COLUMNS: DataTableColumn[] = [
  { label: 'PROPERTY', width: 260 },
  { label: 'DISTRICT', width: 200 },
  { label: 'STATUS', width: 170 },
  { label: 'TYPE', width: 140 },
];

const STATUS_TONE: Record<PropertyStatus, StatusTone> = {
  Occupied: 'positive',
  Vacant: 'neutral',
  Maintenance: 'warning',
  Archived: 'neutral',
};

const REASON_COPY: Record<DigitalTwinFallbackProps['reason'], string> = {
  'webgl-unavailable': 'This browser or device cannot render the 3D Digital Twin. Showing the same portfolio as a list.',
  'context-lost': 'The 3D scene lost its rendering context and could not recover. Showing the same portfolio as a list.',
  error: 'The 3D scene could not render. Showing the same portfolio as a list.',
};

export function DigitalTwinFallback({ properties, reason }: DigitalTwinFallbackProps) {
  return (
    <section style={{ padding: '24px 0' }}>
      <p style={{ color: '#737B75', marginBottom: 16, maxWidth: 560 }}>{REASON_COPY[reason]}</p>
      <div style={{ border: '1px solid #C9CDC7', borderRadius: 6, overflow: 'hidden' }}>
        <DataTableHeader columns={COLUMNS} />
        {properties.map((property) => (
          <DataTableRow key={property.id} to={`/properties/${property.id}`} columns={COLUMNS}>
            <span style={{ fontWeight: 500 }}>{property.name}</span>
            <span>
              {property.city} · {property.district}
            </span>
            <StatusBadge label={property.status} tone={STATUS_TONE[property.status]} />
            <span>{property.type}</span>
          </DataTableRow>
        ))}
      </div>
      {properties.length === 0 && <p style={{ marginTop: 16, color: '#737B75' }}>No active properties match this view.</p>}
      <p style={{ marginTop: 16 }}>
        <Link to="/properties">Open the Properties list instead</Link>
      </p>
    </section>
  );
}
