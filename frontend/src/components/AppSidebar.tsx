import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { useTranslation } from '../i18n/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './AppSidebar.module.css';

function formatRole(role: string): string {
  return role.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
}

export function AppSidebar() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { to: '/overview', label: t.sidebar.nav.overview },
    { to: '/digital-twin', label: t.sidebar.nav.digitalTwin },
    { to: '/properties', label: t.sidebar.nav.properties },
    { to: '/tenants', label: t.sidebar.nav.tenants },
    { to: '/contracts', label: t.sidebar.nav.contracts },
    { to: '/payments', label: t.sidebar.nav.payments },
    { to: '/maintenance', label: t.sidebar.nav.maintenance },
  ];

  function handleSignOut() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <aside className={styles.sidebar}>
      <span className={styles.wordmark}>{t.login.wordmark}</span>
      <span className={styles.tagline}>{t.sidebar.tagline}</span>
      <div className={styles.brandSpacing} />

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
          >
            <span className={styles.iconSlot} aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.spacer} />

      <LanguageSwitcher />

      {user && (
        <button type="button" className={styles.footer} onClick={handleSignOut} title={t.sidebar.signOut}>
          {user.name.toUpperCase()}
          <br />
          {formatRole(user.role)}
        </button>
      )}
    </aside>
  );
}
