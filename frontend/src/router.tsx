import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './routes/AppLayout';
import { ContractsListPage } from './routes/ContractsListPage';
import { LoginPage } from './routes/LoginPage';
import { MaintenanceListPage } from './routes/MaintenanceListPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { OverviewPage } from './routes/OverviewPage';
import { PaymentsListPage } from './routes/PaymentsListPage';
import { PropertiesListPage } from './routes/PropertiesListPage';
import { PropertyDetailPage } from './routes/PropertyDetailPage';
import { PropertyFormPage } from './routes/PropertyFormPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RealMapPage } from './routes/RealMapPage';
import { TenantDetailPage } from './routes/TenantDetailPage';
import { TenantsListPage } from './routes/TenantsListPage';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/overview" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/overview', element: <OverviewPage /> },
          { path: '/digital-twin', element: <RealMapPage /> },
          { path: '/properties', element: <PropertiesListPage /> },
          { path: '/properties/new', element: <PropertyFormPage /> },
          { path: '/properties/:id', element: <PropertyDetailPage /> },
          { path: '/properties/:id/edit', element: <PropertyFormPage /> },
          { path: '/tenants', element: <TenantsListPage /> },
          { path: '/tenants/:id', element: <TenantDetailPage /> },
          { path: '/contracts', element: <ContractsListPage /> },
          { path: '/payments', element: <PaymentsListPage /> },
          { path: '/maintenance', element: <MaintenanceListPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
