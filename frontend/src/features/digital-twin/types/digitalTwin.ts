export type PropertyType = 'Apartment' | 'Studio' | 'Townhouse' | 'Office' | 'Retail';
export type PropertyStatus = 'Occupied' | 'Vacant' | 'Maintenance' | 'Archived';
export type ContractSignal = 'None' | 'Active' | 'ExpiringSoon';

export interface DigitalTwinProperty {
  id: string;
  code: string;
  name: string;
  city: string;
  district: string;
  type: PropertyType;
  status: PropertyStatus;
  size: number | null;
  monthlyRent: number | null;
  contractSignal: ContractSignal;
  occupancyPercent: number | null;
  monthlyRevenue: number | null;
  maintenanceOpenCount: number;
}

export type VisualizationMode = 'occupancy' | 'revenue' | 'contract' | 'maintenance';

export type CameraMode =
  | { kind: 'portfolio' }
  | { kind: 'district'; district: string }
  | { kind: 'property'; propertyId: string }
  | { kind: 'manual'; returnTo: Exclude<CameraMode, { kind: 'manual' }> };

export type QualityTier = 'auto' | 'high' | 'medium' | 'low';
export type ResolvedQualityTier = 'high' | 'medium' | 'low';

export interface CityLayoutEntry {
  propertyId: string;
  district: string;
  x: number;
  z: number;
}

export interface DistrictBounds {
  district: string;
  centerX: number;
  centerZ: number;
  radius: number;
  propertyIds: string[];
}
