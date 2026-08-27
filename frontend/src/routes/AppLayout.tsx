import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import styles from './AppLayout.module.css';

// Routes that need the full content area (no padding) — currently just the map,
// which the user explicitly asked to have more viewport space to work with.
const FULL_BLEED_ROUTES = ['/digital-twin'];

export function AppLayout() {
  const location = useLocation();
  const fullBleed = FULL_BLEED_ROUTES.includes(location.pathname);

  return (
    <div className={styles.shell}>
      <AppSidebar />
      <main className={`${styles.main} ${fullBleed ? styles.mainFullBleed : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
