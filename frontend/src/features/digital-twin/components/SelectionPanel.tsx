import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/Button';
import { useDigitalTwinStore } from '../state/digitalTwinStore';
import type { DigitalTwinProperty } from '../types/digitalTwin';

interface SelectionPanelProps {
  property: DigitalTwinProperty;
}

function formatCurrency(amount: number): string {
  return `NT$${Math.round(amount).toLocaleString('en-US')}`;
}

// Locked-selection panel entering from the right (spec: "Selection" motion). Second
// click on the building, or this panel's button, opens the property detail route.
export function SelectionPanel({ property }: SelectionPanelProps) {
  const navigate = useNavigate();
  const selectProperty = useDigitalTwinStore((s) => s.selectProperty);

  return (
    <div
      style={{
        width: 280,
        padding: 18,
        borderRadius: 8,
        background: 'rgba(10, 15, 13, 0.92)',
        border: '1px solid #275B43',
        color: '#F1F0E9',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#B7F34A' }}>{property.code}</p>
          <h3 style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600 }}>{property.name}</h3>
        </div>
        <button
          type="button"
          onClick={() => selectProperty(null)}
          aria-label="Close selection"
          style={{ background: 'none', border: 'none', color: '#737B75', cursor: 'pointer', fontSize: 16 }}
        >
          ×
        </button>
      </div>

      <dl style={{ margin: 0, fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 6 }}>
        <dt style={{ color: '#737B75' }}>Status</dt>
        <dd style={{ margin: 0 }}>{property.status}</dd>
        <dt style={{ color: '#737B75' }}>Location</dt>
        <dd style={{ margin: 0 }}>
          {property.city} · {property.district}
        </dd>
        <dt style={{ color: '#737B75' }}>Type</dt>
        <dd style={{ margin: 0 }}>{property.type}</dd>
        {property.monthlyRevenue != null && (
          <>
            <dt style={{ color: '#737B75' }}>Monthly revenue</dt>
            <dd style={{ margin: 0 }}>{formatCurrency(property.monthlyRevenue)}</dd>
          </>
        )}
        {property.contractSignal !== 'None' && (
          <>
            <dt style={{ color: '#737B75' }}>Contract</dt>
            <dd style={{ margin: 0 }}>{property.contractSignal}</dd>
          </>
        )}
        {property.maintenanceOpenCount > 0 && (
          <>
            <dt style={{ color: '#737B75' }}>Open maintenance</dt>
            <dd style={{ margin: 0 }}>{property.maintenanceOpenCount}</dd>
          </>
        )}
      </dl>

      <Button size="medium" fullWidth onClick={() => navigate(`/properties/${property.id}`)}>
        Open property
      </Button>
    </div>
  );
}
