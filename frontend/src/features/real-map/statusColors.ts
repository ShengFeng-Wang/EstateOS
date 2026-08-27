import type { Property } from '../../api/properties';

export const STATUS_COLOR: Record<Property['status'], string> = {
  Occupied: '#275b43',
  Vacant: '#737b75',
  Maintenance: '#d69a35',
  Archived: '#c9cdc7',
};

export const SIGNAL_COLOR = '#b7f34a';
