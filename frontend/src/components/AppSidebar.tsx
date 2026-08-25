import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import styles from './AppSidebar.module.css';

const NAV_ITEMS = [
  { to: '/overview', label: 'Overview' },
  { to: '/digital-twin', label: 'Digital Twin' },
  { to: '/properties', label: 'Properties' },
  { to: '/tenants', label: 'Tenants' },
  { to: '/payments', label: 'Payments' },
  { to: '/maintenance', label: 'Maintenance' },
];

function formatRole(role: string): string {
  return role.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
}

export function AppSidebar() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const navigate = useNavigate();

  function handleSignOut() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <aside className={styles.sidebar}>
      <span className={styles.wordmark}>ESTATE / OS</span>
      <span className={styles.tagline}>ASSET INTELLIGENCE</span>
      <div className={styles.brandSpacing} />

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
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

      {user && (
        <button type="button" className={styles.footer} onClick={handleSignOut} title="Sign out">
          {user.name.toUpperCase()}
          <br />
          {formatRole(user.role)}
        </button>
      )}
    </aside>
  );
}
