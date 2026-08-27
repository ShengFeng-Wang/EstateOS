import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RealMapScene } from '../features/real-map/RealMapScene';
import { RealMapSelectionPanel } from '../features/real-map/RealMapSelectionPanel';
import { fetchMapProperties } from '../features/real-map/realMapQuery';
import type { Property } from '../api/properties';
import { useTranslation } from '../i18n/useTranslation';
import styles from './RealMapPage.module.css';

function detectWebglSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

export function RealMapPage() {
  const { t } = useTranslation();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const webglSupported = detectWebglSupport();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: allProperties, isLoading, isError, refetch } = useQuery({
    queryKey: ['real-map', 'properties'],
    queryFn: fetchMapProperties,
    staleTime: 60_000,
  });

  // Scoped to a single requested zone — only Bade properties appear on this map.
  const properties = useMemo(
    () => (allProperties ?? []).filter((p) => p.city === 'Taoyuan' && p.district === 'Bade'),
    [allProperties],
  );

  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;

  function handleSelect(property: Property) {
    setSelectedId((current) => (current === property.id ? null : property.id));
  }

  if (!webglSupported) {
    return (
      <div className={styles.statusScreen}>
        <p role="alert">This browser doesn't support WebGL, which the map requires.</p>
      </div>
    );
  }

  if (!apiKey) {
    return (
      <div className={styles.statusScreen}>
        <p role="alert">
          No Google Maps API key configured. Set <code>VITE_GOOGLE_MAPS_API_KEY</code> in
          <code> frontend/.env</code> and restart the dev server.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.statusScreen}>
        <p>{t.common.loading}</p>
      </div>
    );
  }

  if (isError || !allProperties) {
    return (
      <div className={styles.statusScreen}>
        <p role="alert">Failed to load the portfolio.</p>
        <button type="button" onClick={() => refetch()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.titleOverlay}>
        <p className={styles.eyebrow}>{t.realMap.zoneLabel}</p>
        <p className={styles.count}>{t.realMap.propertiesCount(properties.length)}</p>
      </div>

      {selectedProperty && (
        <div className={styles.selectionOverlay}>
          <RealMapSelectionPanel property={selectedProperty} onClose={() => setSelectedId(null)} />
        </div>
      )}

      <RealMapScene
        apiKey={apiKey}
        properties={properties}
        selectedPropertyId={selectedId}
        onSelectProperty={handleSelect}
      />
    </div>
  );
}
