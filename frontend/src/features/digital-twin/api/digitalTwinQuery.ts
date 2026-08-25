import { listContracts } from '../../../api/contracts';
import type { Contract } from '../../../api/contracts';
import { listMaintenance } from '../../../api/maintenance';
import type { MaintenanceRequest } from '../../../api/maintenance';
import { listProperties } from '../../../api/properties';
import type { Property } from '../../../api/properties';
import type { ContractSignal, DigitalTwinProperty } from '../types/digitalTwin';

const MAX_PAGE_SIZE = 100;
const MAX_PAGES = 4; // supports up to 400 records, comfortably above the 50-200 property target

async function fetchAllPages<T>(fetchPage: (page: number) => Promise<{ items: T[]; total: number }>): Promise<T[]> {
  const first = await fetchPage(1);
  const items = [...first.items];
  const totalPages = Math.min(MAX_PAGES, Math.ceil(first.total / MAX_PAGE_SIZE));

  for (let page = 2; page <= totalPages; page++) {
    const next = await fetchPage(page);
    items.push(...next.items);
  }

  return items;
}

/**
 * Adapts the property/contract/maintenance API responses into the Digital Twin's
 * property contract exactly once, at the query boundary (see the implementation spec's
 * "Data contract" section). There is no separate hard-coded 3D dataset.
 */
export async function fetchDigitalTwinProperties(): Promise<DigitalTwinProperty[]> {
  const [properties, contracts, maintenanceRequests] = await Promise.all([
    fetchAllPages<Property>((page) => listProperties({ page, pageSize: MAX_PAGE_SIZE })),
    fetchAllPages<Contract>((page) => listContracts({ page, pageSize: MAX_PAGE_SIZE })),
    fetchAllPages<MaintenanceRequest>((page) => listMaintenance({ page, pageSize: MAX_PAGE_SIZE })),
  ]);

  const contractSignalByProperty = new Map<string, ContractSignal>();
  for (const contract of contracts) {
    if (contract.status !== 'Active' && contract.status !== 'ExpiringSoon') continue;
    const current = contractSignalByProperty.get(contract.propertyId);
    // ExpiringSoon takes priority for the signal if a property somehow has both.
    if (contract.status === 'ExpiringSoon' || current == null) {
      contractSignalByProperty.set(contract.propertyId, contract.status);
    }
  }

  const openMaintenanceByProperty = new Map<string, number>();
  for (const request of maintenanceRequests) {
    if (request.status !== 'Open' && request.status !== 'InProgress') continue;
    openMaintenanceByProperty.set(request.propertyId, (openMaintenanceByProperty.get(request.propertyId) ?? 0) + 1);
  }

  return properties
    .filter((p) => p.status !== 'Archived')
    .map((property) => ({
      id: property.id,
      code: property.code,
      name: property.name,
      city: property.city,
      district: property.district,
      type: property.type,
      status: property.status,
      size: property.size ?? null,
      monthlyRent: property.monthlyRent ?? null,
      contractSignal: contractSignalByProperty.get(property.id) ?? 'None',
      occupancyPercent: null,
      monthlyRevenue: property.status === 'Occupied' ? property.monthlyRent ?? null : null,
      maintenanceOpenCount: openMaintenanceByProperty.get(property.id) ?? 0,
    }));
}
