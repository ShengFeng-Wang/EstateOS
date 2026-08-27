import { listProperties } from '../../api/properties';
import type { Property } from '../../api/properties';
import { fetchAllPages } from '../../lib/fetchAllPages';

export async function fetchMapProperties(): Promise<Property[]> {
  return fetchAllPages<Property>((page, pageSize) => listProperties({ page, pageSize }));
}
