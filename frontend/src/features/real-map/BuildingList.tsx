import type { Property } from '../../api/properties';
import { STATUS_COLOR, SIGNAL_COLOR } from './statusColors';
import styles from './BuildingList.module.css';

interface BuildingListProps {
  properties: Property[];
  selectedId: string | null;
  onSelect: (property: Property) => void;
}

export function BuildingList({ properties, selectedId, onSelect }: BuildingListProps) {
  return (
    <div className={styles.panel}>
      {properties.map((property) => {
        const active = property.id === selectedId;
        return (
          <button
            key={property.id}
            type="button"
            className={`${styles.item} ${active ? styles.itemActive : ''}`}
            onClick={() => onSelect(property)}
          >
            <span className={styles.dot} style={{ background: active ? SIGNAL_COLOR : STATUS_COLOR[property.status] }} />
            <span className={styles.name}>{property.name}</span>
          </button>
        );
      })}
    </div>
  );
}
