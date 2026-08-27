import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { Button } from '../components/Button';
import { ApiError } from '../lib/api-client';
import { useAuthStore } from '../store/auth-store';
import { useTranslation } from '../i18n/useTranslation';
import styles from './LoginPage.module.css';
import { LoginSpatialScene } from './LoginSpatialScene';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!EMAIL_PATTERN.test(email)) {
      errors.email = t.login.errors.invalidEmail;
    }
    if (password.length < 8) {
      errors.password = t.login.errors.invalidPassword;
    }
    return errors;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setAuthError(null);

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const result = await login({ email, password });
      setSession(result.token, result.user);
      navigate('/overview', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setAuthError(t.login.errors.authError);
      } else {
        setAuthError(t.login.errors.genericError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.spatial}>
        <LoginSpatialScene />
        <span className={styles.wordmark}>{t.login.wordmark}</span>
        <h1 className={styles.headline}>
          {t.login.headline[0]}
          <br />
          {t.login.headline[1]}
        </h1>
        <p className={styles.tagline}>
          {t.login.tagline[0]}
          <br />
          {t.login.tagline[1]}
        </p>
        <div className={styles.breadcrumb}>
          {t.login.breadcrumb.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      </section>

      <section className={styles['form-panel']}>
        <div className={styles.formInner}>
          <p className={styles.eyebrow}>{t.login.secureWorkspace}</p>
          <h2 className={styles.title}>{t.login.welcomeBack}</h2>
          <p className={styles.subtitle}>{t.login.subtitle}</p>

          {authError && (
            <div className={styles.authError} role="alert">
              <span className={styles.authErrorDot} />
              <span>{authError}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                {t.login.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                placeholder={t.login.emailPlaceholder}
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
              {fieldErrors.email && <p className={styles.fieldError}>{fieldErrors.email}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                {t.login.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {fieldErrors.password && <p className={styles.fieldError}>{fieldErrors.password}</p>}
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting}>
              {isSubmitting ? t.login.signingIn : t.login.signIn}
            </Button>
          </form>

          <p className={styles.demoAccess}>{t.login.demoAccess}&nbsp;&nbsp;admin@estateos.dev&nbsp;&nbsp;/&nbsp;&nbsp;ChangeMe123!</p>
          <p className={styles.caption}>{t.login.caption}</p>
        </div>
      </section>
    </div>
  );
}
