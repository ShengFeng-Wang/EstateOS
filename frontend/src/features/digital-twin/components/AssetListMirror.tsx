import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDigitalTwinStore } from '../state/digitalTwinStore';
import type { DigitalTwinProperty } from '../types/digitalTwin';
import { nextIndex } from '../utils/spatialNavigation';

interface AssetListMirrorProps {
  orderedProperties: DigitalTwinProperty[];
}

// Visually integrated DOM list mirroring the visible/filtered properties. The canvas is
// never the sole way to reach a property (spec: "Keyboard and DOM mirror").
export function AssetListMirror({ orderedProperties }: AssetListMirrorProps) {
  const navigate = useNavigate();
  const selectedPropertyId = useDigitalTwinStore((s) => s.selectedPropertyId);
  const selectProperty = useDigitalTwinStore((s) => s.selectProperty);
  const listRef = useRef<HTMLUListElement>(null);

  function currentIndex() {
    return orderedProperties.findIndex((p) => p.id === selectedPropertyId);
  }

  function focusItem(index: number) {
    const el = listRef.current?.querySelector<HTMLButtonElement>(`[data-index="${index}"]`);
    el?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (orderedProperties.length === 0) return;
    const idx = currentIndex();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = nextIndex(idx, 1, orderedProperties.length);
      selectProperty(orderedProperties[next].id);
      focusItem(next);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const next = nextIndex(idx, -1, orderedProperties.length);
      selectProperty(orderedProperties[next].id);
      focusItem(next);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (idx >= 0) navigate(`/properties/${orderedProperties[idx].id}`);
    }
  }

  return (
    <div>
      <label htmlFor="asset-list-mirror" style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#F1F0E9' }}>
        Assets ({orderedProperties.length})
      </label>
      <ul
        id="asset-list-mirror"
        ref={listRef}
        role="listbox"
        aria-label="Digital Twin assets"
        onKeyDown={handleKeyDown}
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          maxHeight: 220,
          overflowY: 'auto',
          border: '1px solid #275B43',
          borderRadius: 6,
          background: 'rgba(10, 15, 13, 0.85)',
        }}
      >
        {orderedProperties.map((property, index) => (
          <li key={property.id} role="presentation">
            <button
              type="button"
              role="option"
              data-index={index}
              aria-selected={property.id === selectedPropertyId}
              tabIndex={property.id === selectedPropertyId || (index === 0 && !selectedPropertyId) ? 0 : -1}
              onClick={() => selectProperty(property.id)}
              onDoubleClick={() => navigate(`/properties/${property.id}`)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '8px 10px',
                border: 'none',
                borderBottom: '1px solid rgba(115,123,117,0.3)',
                background: property.id === selectedPropertyId ? '#275B43' : 'transparent',
                color: '#F1F0E9',
                cursor: 'pointer',
                fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                fontSize: 11,
              }}
            >
              {property.code} · {property.name} · {property.status}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
