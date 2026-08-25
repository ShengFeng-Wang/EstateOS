import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './routes/AppLayout';
import { LoginPage } from './routes/LoginPage';
import { NotFoundPage } from './routes/NotFoundPage';
import { OverviewPage } from './routes/OverviewPage';
import { PlaceholderPage } from './routes/PlaceholderPage';
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
          { path: '/digital-twin', element: <PlaceholderPage title="Digital Twin City" /> },
          { path: '/properties', element: <PlaceholderPage title="Properties" /> },
          { path: '/properties/:id', element: <PlaceholderPage title="Property Detail" /> },
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
