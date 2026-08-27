import type { Locale } from '../i18n/localeStore';
import { useTranslation } from '../i18n/useTranslation';
import styles from './LanguageSwitcher.module.css';

const OPTIONS: { value: Locale; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'zh-TW', label: '繁中' },
];

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className={styles.switcher} role="group" aria-label="Language">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`${styles.option} ${locale === opt.value ? styles.optionActive : ''}`}
          aria-pressed={locale === opt.value}
          onClick={() => setLocale(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
