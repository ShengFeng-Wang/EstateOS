import { useLocaleStore } from './localeStore';
import { en, zhTW } from './translations';
import type { Translations } from './translations';

const DICTIONARIES: Record<string, Translations> = { en, 'zh-TW': zhTW };

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const t = DICTIONARIES[locale];
  return { t, locale, setLocale };
}
