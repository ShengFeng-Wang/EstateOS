import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import type { Property } from '../../api/properties';
import { useTranslation } from '../../i18n/useTranslation';
import { formatCurrency } from '../../i18n/format';
import styles from './RealMapSelectionPanel.module.css';

interface RealMapSelectionPanelProps {
  property: Property;
  onClose: () => void;
}

export function RealMapSelectionPanel({ property, onClose }: RealMapSelectionPanelProps) {
  const navigate = useNavigate();
  const { t, locale } = useTranslation();
  const f = t.properties.detail.overviewFields;

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div>
          <p className={styles.code}>{property.code}</p>
          <h3 className={styles.name}>{property.name}</h3>
        </div>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close selection">
          ×
        </button>
      </div>

      <dl className={styles.fields}>
        <dt className={styles.fieldLabel}>{f.status}</dt>
        <dd className={styles.fieldValue}>{t.propertyStatus[property.status]}</dd>
        <dt className={styles.fieldLabel}>{f.type}</dt>
        <dd className={styles.fieldValue}>{t.propertyType[property.type]}</dd>
        <dt className={styles.fieldLabel}>{f.monthlyRent}</dt>
        <dd className={styles.fieldValue}>{formatCurrency(property.monthlyRent, locale)}</dd>
        <dt className={styles.fieldLabel}>{f.size}</dt>
        <dd className={styles.fieldValue}>{property.size} m²</dd>
        <dt className={styles.fieldLabel}>{f.address}</dt>
        <dd className={styles.fieldValue} style={{ gridColumn: '1 / -1' }}>
          {property.address}
        </dd>
      </dl>

      <Button size="medium" fullWidth onClick={() => navigate(`/properties/${property.id}`)}>
        {t.common.openProperty}
      </Button>
    </div>
  );
}
