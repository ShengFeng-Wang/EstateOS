import { useDigitalTwinStore } from '../state/digitalTwinStore';
import type { PropertyStatus, PropertyType, QualityTier, VisualizationMode } from '../types/digitalTwin';

const MODES: { value: VisualizationMode; label: string }[] = [
  { value: 'occupancy', label: 'Occupancy' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'contract', label: 'Contract' },
  { value: 'maintenance', label: 'Maintenance' },
];

const STATUSES: PropertyStatus[] = ['Occupied', 'Vacant', 'Maintenance'];
const TYPES: PropertyType[] = ['Apartment', 'Studio', 'Townhouse', 'Office', 'Retail'];
const QUALITIES: QualityTier[] = ['auto', 'high', 'medium', 'low'];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function SpatialToolbar() {
  const visualizationMode = useDigitalTwinStore((s) => s.visualizationMode);
  const statusFilter = useDigitalTwinStore((s) => s.statusFilter);
  const typeFilter = useDigitalTwinStore((s) => s.typeFilter);
  const quality = useDigitalTwinStore((s) => s.quality);
  const reducedMotion = useDigitalTwinStore((s) => s.reducedMotion);
  const setVisualizationMode = useDigitalTwinStore((s) => s.setVisualizationMode);
  const setStatusFilter = useDigitalTwinStore((s) => s.setStatusFilter);
  const setTypeFilter = useDigitalTwinStore((s) => s.setTypeFilter);
  const setQuality = useDigitalTwinStore((s) => s.setQuality);
  const setReducedMotion = useDigitalTwinStore((s) => s.setReducedMotion);
  const resetToPortfolio = useDigitalTwinStore((s) => s.resetToPortfolio);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        padding: '10px 14px',
        borderRadius: 6,
        background: 'rgba(10, 15, 13, 0.85)',
        border: '1px solid #275B43',
        color: '#F1F0E9',
        fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
        fontSize: 12,
      }}
    >
      <fieldset style={{ display: 'flex', gap: 6, border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ display: 'none' }}>Visualization mode</legend>
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => setVisualizationMode(mode.value)}
            aria-pressed={visualizationMode === mode.value}
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid #275B43',
              background: visualizationMode === mode.value ? '#275B43' : 'transparent',
              color: '#F1F0E9',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 11,
            }}
          >
            {mode.label}
          </button>
        ))}
      </fieldset>

      <fieldset style={{ display: 'flex', gap: 6, border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ display: 'none' }}>Status filter</legend>
        {STATUSES.map((status) => (
          <label key={status} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={statusFilter.includes(status)}
              onChange={() => setStatusFilter(toggle(statusFilter, status))}
            />
            {status}
          </label>
        ))}
      </fieldset>

      <select
        value=""
        onChange={(e) => e.target.value && setTypeFilter(toggle(typeFilter, e.target.value as PropertyType))}
        style={{ background: '#0A0F0D', color: '#F1F0E9', border: '1px solid #275B43', borderRadius: 4, padding: '2px 6px' }}
        aria-label="Add a property type filter"
      >
        <option value="">Type: {typeFilter.length === 0 ? 'All' : typeFilter.join(', ')}</option>
        {TYPES.map((type) => (
          <option key={type} value={type}>
            {typeFilter.includes(type) ? `✓ ${type}` : type}
          </option>
        ))}
      </select>

      <select
        value={quality}
        onChange={(e) => setQuality(e.target.value as QualityTier)}
        style={{ background: '#0A0F0D', color: '#F1F0E9', border: '1px solid #275B43', borderRadius: 4, padding: '2px 6px' }}
        aria-label="Rendering quality"
      >
        {QUALITIES.map((q) => (
          <option key={q} value={q}>
            Quality: {q}
          </option>
        ))}
      </select>

      <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
        <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
        Reduce motion
      </label>

      <button
        type="button"
        onClick={resetToPortfolio}
        style={{
          marginLeft: 'auto',
          padding: '4px 10px',
          borderRadius: 4,
          border: '1px solid #737B75',
          background: 'transparent',
          color: '#F1F0E9',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 11,
        }}
      >
        Reset (R)
      </button>
    </div>
  );
}
