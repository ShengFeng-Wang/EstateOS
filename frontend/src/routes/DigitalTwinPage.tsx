import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { AssetListMirror } from '../features/digital-twin/components/AssetListMirror';
import { DigitalTwinCanvas } from '../features/digital-twin/components/DigitalTwinCanvas';
import { DigitalTwinErrorBoundary } from '../features/digital-twin/components/DigitalTwinErrorBoundary';
import { DigitalTwinFallback } from '../features/digital-twin/components/DigitalTwinFallback';
import { SelectionPanel } from '../features/digital-twin/components/SelectionPanel';
import { SpatialLegend } from '../features/digital-twin/components/SpatialLegend';
import { SpatialToolbar } from '../features/digital-twin/components/SpatialToolbar';
import { computeCityLayout } from '../features/digital-twin/geometry/cityLayout';
import { fetchDigitalTwinProperties } from '../features/digital-twin/api/digitalTwinQuery';
import { useDigitalTwinStore } from '../features/digital-twin/state/digitalTwinStore';
import type { PropertyStatus, PropertyType, VisualizationMode } from '../features/digital-twin/types/digitalTwin';
import { spatialOrder } from '../features/digital-twin/utils/spatialNavigation';

function detectWebglSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

const VALID_MODES: VisualizationMode[] = ['occupancy', 'revenue', 'contract', 'maintenance'];
const VALID_STATUSES: PropertyStatus[] = ['Occupied', 'Vacant', 'Maintenance', 'Archived'];
const VALID_TYPES: PropertyType[] = ['Apartment', 'Studio', 'Townhouse', 'Office', 'Retail'];

export function DigitalTwinPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [webglSupported] = useState(detectWebglSupport);
  const [announcement, setAnnouncement] = useState('');

  const visualizationMode = useDigitalTwinStore((s) => s.visualizationMode);
  const statusFilter = useDigitalTwinStore((s) => s.statusFilter);
  const typeFilter = useDigitalTwinStore((s) => s.typeFilter);
  const selectedPropertyId = useDigitalTwinStore((s) => s.selectedPropertyId);
  const quality = useDigitalTwinStore((s) => s.quality);
  const setVisualizationMode = useDigitalTwinStore((s) => s.setVisualizationMode);
  const setStatusFilter = useDigitalTwinStore((s) => s.setStatusFilter);
  const setTypeFilter = useDigitalTwinStore((s) => s.setTypeFilter);
  const setReducedMotion = useDigitalTwinStore((s) => s.setReducedMotion);
  const setHovered = useDigitalTwinStore((s) => s.setHovered);

  // Hydrate durable mode/filter state from the URL once on mount.
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode && VALID_MODES.includes(mode as VisualizationMode)) setVisualizationMode(mode as VisualizationMode);

    const status = searchParams.get('status');
    if (status) setStatusFilter(status.split(',').filter((s): s is PropertyStatus => VALID_STATUSES.includes(s as PropertyStatus)));

    const type = searchParams.get('type');
    if (type) setTypeFilter(type.split(',').filter((t): t is PropertyType => VALID_TYPES.includes(t as PropertyType)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync with mode/filters so they're durable/shareable.
  useEffect(() => {
    const next = new URLSearchParams();
    if (visualizationMode !== 'occupancy') next.set('mode', visualizationMode);
    if (statusFilter.length > 0) next.set('status', statusFilter.join(','));
    if (typeFilter.length > 0) next.set('type', typeFilter.join(','));
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visualizationMode, statusFilter, typeFilter]);

  // Respect the OS/browser reduced-motion preference from first render.
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(query.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener('change', handler);
    return () => query.removeEventListener('change', handler);
  }, [setReducedMotion]);

  const { data: properties, isLoading, isError, refetch } = useQuery({
    queryKey: ['digital-twin', 'properties'],
    queryFn: fetchDigitalTwinProperties,
    staleTime: 60_000,
  });

  const layout = useMemo(() => (properties ? computeCityLayout(properties) : null), [properties]);

  const visibleProperties = useMemo(() => {
    if (!properties) return [];
    return properties.filter(
      (p) => (statusFilter.length === 0 || statusFilter.includes(p.status)) && (typeFilter.length === 0 || typeFilter.includes(p.type)),
    );
  }, [properties, statusFilter, typeFilter]);

  const orderedProperties = useMemo(
    () => (layout ? spatialOrder(visibleProperties, layout.entries) : visibleProperties),
    [visibleProperties, layout],
  );

  const selectedProperty = useMemo(
    () => properties?.find((p) => p.id === selectedPropertyId) ?? null,
    [properties, selectedPropertyId],
  );

  useEffect(() => {
    if (!selectedProperty) return;
    setAnnouncement(`${selectedProperty.name} selected, ${selectedProperty.status.toLowerCase()}, ${selectedProperty.city} ${selectedProperty.district}`);
  }, [selectedProperty]);

  if (isLoading) {
    return (
      <section>
        <h1 style={{ marginTop: 0 }}>Digital Twin City</h1>
        <p>Loading asset model…</p>
      </section>
    );
  }

  if (isError || !properties) {
    return (
      <section>
        <h1 style={{ marginTop: 0 }}>Digital Twin City</h1>
        <p role="alert">Failed to load the portfolio.</p>
        <button type="button" onClick={() => refetch()}>
          Retry
        </button>
      </section>
    );
  }

  if (!webglSupported) {
    return (
      <section>
        <h1 style={{ marginTop: 0 }}>Digital Twin City</h1>
        <DigitalTwinFallback properties={orderedProperties} reason="webgl-unavailable" />
      </section>
    );
  }

  if (properties.length === 0) {
    return (
      <section>
        <h1 style={{ marginTop: 0 }}>Digital Twin City</h1>
        <p>No active properties match this view.</p>
      </section>
    );
  }

  return (
    <section style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh' }}>
      <div aria-live="polite" role="status" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}>
        {announcement}
      </div>

      <div style={{ position: 'relative', flex: 1, minHeight: 560, borderRadius: 8, overflow: 'hidden' }}>
        <DigitalTwinErrorBoundary fallback={<DigitalTwinFallback properties={orderedProperties} reason="error" />}>
          <DigitalTwinCanvas
            properties={properties}
            quality={quality}
            interactive
            onPointerMissed={() => setHovered(null)}
          />
        </DigitalTwinErrorBoundary>

        <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <SpatialToolbar />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 16, left: 16, pointerEvents: 'auto' }}>
          <SpatialLegend mode={visualizationMode} />
        </div>

        {selectedProperty && (
          <div style={{ position: 'absolute', top: 76, right: 16, pointerEvents: 'auto' }}>
            <SelectionPanel property={selectedProperty} />
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <AssetListMirror orderedProperties={orderedProperties} />
      </div>
    </section>
  );
}
