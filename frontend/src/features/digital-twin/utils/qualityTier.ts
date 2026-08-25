import type { QualityTier, ResolvedQualityTier } from '../types/digitalTwin';

export interface QualityTierConfig {
  dprMax: number;
  antialias: boolean;
  shadows: boolean;
  facadeDetail: boolean;
  drawCallBudget: number;
}

export const QUALITY_CONFIG: Record<ResolvedQualityTier, QualityTierConfig> = {
  high: { dprMax: 1.75, antialias: true, shadows: true, facadeDetail: true, drawCallBudget: 180 },
  medium: { dprMax: 1.4, antialias: true, shadows: false, facadeDetail: false, drawCallBudget: 120 },
  low: { dprMax: 1.15, antialias: false, shadows: false, facadeDetail: false, drawCallBudget: 80 },
};

/**
 * Resolve 'auto' using viewport width as the primary, deterministic signal (device pixel
 * ratio as a secondary downgrade hint). Explicit user overrides always win. Not
 * user-agent sniffing, per spec.
 */
export function resolveQualityTier(tier: QualityTier, viewportWidth: number, devicePixelRatio: number): ResolvedQualityTier {
  if (tier !== 'auto') return tier;

  if (viewportWidth < 768) return 'low';
  if (viewportWidth < 1200) return 'medium';
  if (devicePixelRatio > 3) return 'medium';
  return 'high';
}
