import { useQuery } from '@tanstack/react-query';
import { RealMapScene } from '../features/real-map/RealMapScene';
import { fetchMapProperties } from '../features/real-map/realMapQuery';
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

  const { data: properties, isLoading, isError, refetch } = useQuery({
    queryKey: ['real-map', 'properties'],
    queryFn: fetchMapProperties,
    staleTime: 60_000,
  });

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

  if (isError || !properties) {
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
        <p className={styles.eyebrow}>{t.sidebar.nav.digitalTwin}</p>
        <p className={styles.count}>{properties.length} properties</p>
      </div>
      <RealMapScene apiKey={apiKey} properties={properties} />
    </div>
  );
}
