import type { Locale } from './localeStore';

// Business locale is always Taiwan/TWD regardless of interface language
// (docs/estateos/estateos-responsive-localization-spec.md); only the number/date
// grouping and script follow the interface locale.
const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', 'zh-TW': 'zh-TW' };

export function formatDate(value: string | null, locale: Locale): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(INTL_LOCALE[locale], { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function formatCurrency(amount: number, locale: Locale): string {
  return `NT$ ${amount.toLocaleString(INTL_LOCALE[locale])}`;
}

export function formatCompactCurrency(amount: number, locale: Locale): string {
  const intl = INTL_LOCALE[locale];
  if (amount >= 1_000_000) return `NT$ ${trimZero((amount / 1_000_000).toLocaleString(intl, { maximumFractionDigits: 1 }))}M`;
  if (amount >= 1_000) return `NT$ ${trimZero((amount / 1_000).toLocaleString(intl, { maximumFractionDigits: 1 }))}K`;
  return `NT$ ${amount.toLocaleString(intl)}`;
}

export function formatCompactNumber(value: number, locale: Locale): string {
  const intl = INTL_LOCALE[locale];
  if (value >= 1_000_000) return `${trimZero((value / 1_000_000).toLocaleString(intl, { maximumFractionDigits: 1 }))}M`;
  if (value >= 1_000) return `${trimZero((value / 1_000).toLocaleString(intl, { maximumFractionDigits: 1 }))}K`;
  return value.toLocaleString(intl);
}

function trimZero(value: string): string {
  return value.replace(/\.0$/, '');
}
