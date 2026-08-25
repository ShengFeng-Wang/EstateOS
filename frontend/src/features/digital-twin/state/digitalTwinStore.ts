import { create } from 'zustand';
import type { CameraMode, PropertyStatus, PropertyType, QualityTier, VisualizationMode } from '../types/digitalTwin';

// Zustand owns only spatial UI state (IDs, never copied Property objects).
// TanStack Query owns property/aggregate data.
export interface DigitalTwinViewState {
  hoveredPropertyId: string | null;
  selectedPropertyId: string | null;
  focusedDistrict: string | null;
  visualizationMode: VisualizationMode;
  statusFilter: PropertyStatus[];
  typeFilter: PropertyType[];
  quality: QualityTier;
  assemblySeen: boolean;
  cameraMode: CameraMode;
  reducedMotion: boolean;

  setHovered: (id: string | null) => void;
  selectProperty: (id: string | null) => void;
  focusDistrict: (district: string | null) => void;
  setVisualizationMode: (mode: VisualizationMode) => void;
  setStatusFilter: (statuses: PropertyStatus[]) => void;
  setTypeFilter: (types: PropertyType[]) => void;
  setQuality: (quality: QualityTier) => void;
  setCameraMode: (mode: CameraMode) => void;
  setReducedMotion: (value: boolean) => void;
  markAssemblySeen: () => void;
  resetToPortfolio: () => void;
  escapeOneLevel: () => void;
}

export const useDigitalTwinStore = create<DigitalTwinViewState>()((set, get) => ({
  hoveredPropertyId: null,
  selectedPropertyId: null,
  focusedDistrict: null,
  visualizationMode: 'occupancy',
  statusFilter: [],
  typeFilter: [],
  quality: 'auto',
  assemblySeen: false,
  cameraMode: { kind: 'portfolio' },
  reducedMotion: false,

  setHovered: (id) => set({ hoveredPropertyId: id }),

  selectProperty: (id) =>
    set({
      selectedPropertyId: id,
      cameraMode: id ? { kind: 'property', propertyId: id } : { kind: get().focusedDistrict ? 'district' : 'portfolio', district: get().focusedDistrict ?? '' } as CameraMode,
    }),

  focusDistrict: (district) =>
    set({
      focusedDistrict: district,
      selectedPropertyId: null,
      cameraMode: district ? { kind: 'district', district } : { kind: 'portfolio' },
    }),

  setVisualizationMode: (mode) => set({ visualizationMode: mode }),
  setStatusFilter: (statuses) => set({ statusFilter: statuses }),
  setTypeFilter: (types) => set({ typeFilter: types }),
  setQuality: (quality) => set({ quality }),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  markAssemblySeen: () => set({ assemblySeen: true }),

  resetToPortfolio: () =>
    set({
      selectedPropertyId: null,
      focusedDistrict: null,
      hoveredPropertyId: null,
      cameraMode: { kind: 'portfolio' },
    }),

  escapeOneLevel: () => {
    const state = get();
    if (state.selectedPropertyId) {
      set({
        selectedPropertyId: null,
        cameraMode: state.focusedDistrict ? { kind: 'district', district: state.focusedDistrict } : { kind: 'portfolio' },
      });
      return;
    }
    if (state.focusedDistrict) {
      set({ focusedDistrict: null, cameraMode: { kind: 'portfolio' } });
    }
  },
}));
