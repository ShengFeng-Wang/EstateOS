import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Locales per docs/estateos/estateos-responsive-localization-spec.md:
// "Primary interface: English, Secondary interface: Traditional Chinese, Default locale: en-US".
export type Locale = 'en' | 'zh-TW';

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'estateos-locale' },
  ),
);
