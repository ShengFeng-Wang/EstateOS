import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './routes/AppLayout';
import { DigitalTwinPage } from './routes/DigitalTwinPage';
import { LoginPage } from './routes/LoginPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { OverviewPage } from './routes/OverviewPage';
import { PlaceholderPage } from './routes/PlaceholderPage';
import { PropertiesListPage } from './routes/PropertiesListPage';
import { PropertyDetailPage } from './routes/PropertyDetailPage';
import { ProtectedRoute } from './routes/ProtectedRoute';

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
          { path: '/digital-twin', element: <DigitalTwinPage /> },
          { path: '/properties', element: <PropertiesListPage /> },
          { path: '/properties/:id', element: <PropertyDetailPage /> },
          { path: '/tenants', element: <PlaceholderPage title="Tenants" /> },
          { path: '/contracts', element: <PlaceholderPage title="Contracts" /> },
          { path: '/payments', element: <PlaceholderPage title="Payments" /> },
          { path: '/maintenance', element: <PlaceholderPage title="Maintenance" /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
