import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import { Button } from '../components/Button';
import { ApiError } from '../lib/api-client';
import { useAuthStore } from '../store/auth-store';
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};
    if (!EMAIL_PATTERN.test(email)) {
      errors.email = 'Enter a valid work email';
    }
    if (password.length < 8) {
      errors.password = 'Password must contain at least 8 characters';
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
        setAuthError('Email or password is incorrect. Try again.');
      } else {
        setAuthError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <section className={styles.spatial}>
        <LoginSpatialScene />
        <span className={styles.wordmark}>ESTATE / OS</span>
        <h1 className={styles.headline}>
          Spatial asset
          <br />
          intelligence
        </h1>
        <p className={styles.tagline}>
          Observe the portfolio. Navigate the district.
          <br />
          Inspect every property as connected operational data.
        </p>
        <div className={styles.breadcrumb}>
          <span>01&nbsp;&nbsp;PORTFOLIO</span>
          <span>02&nbsp;&nbsp;DISTRICT</span>
          <span>03&nbsp;&nbsp;PROPERTY</span>
        </div>
      </section>

      <section className={styles['form-panel']}>
        <div className={styles.formInner}>
          <p className={styles.eyebrow}>SECURE WORKSPACE</p>
          <h2 className={styles.title}>Welcome back.</h2>
          <p className={styles.subtitle}>Sign in to review portfolio performance and property operations.</p>

          {authError && (
            <div className={styles.authError} role="alert">
              <span className={styles.authErrorDot} />
              <span>{authError}</span>
            </div>
          )}

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
              {fieldErrors.email && <p className={styles.fieldError}>{fieldErrors.email}</p>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
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
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className={styles.demoAccess}>DEMO ACCESS&nbsp;&nbsp;admin@estateos.dev&nbsp;&nbsp;/&nbsp;&nbsp;estate2026</p>
          <p className={styles.caption}>Internal asset operations · Portfolio demonstration</p>
        </div>
      </section>
    </div>
  );
}
