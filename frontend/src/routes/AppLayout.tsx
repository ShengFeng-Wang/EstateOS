import { Outlet } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import styles from './AppLayout.module.css';

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <AppSidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
