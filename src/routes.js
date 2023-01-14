import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';
//
import BlogPage from './pages/BlogPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import ProductsPage from './pages/ProductsPage';
import DashboardAppPage from './pages/DashboardAppPage';
import ChangePassword from './pages/User/ChangePassword';
import SalesInvoice from './pages/Invoice/SalesInvoice';
import CustomerMaster from './pages/Masters/CustomerMaster';
import { LoginForm } from './sections/auth/login';
import ForgotPassword from './pages/User/ForgotPassword';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <DashboardLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'changepassword', element: <ChangePassword/> },
        { path: 'salesinvoice', element: <SalesInvoice/> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'customermaster', element: <CustomerMaster /> },
      ],
    },
    {
      path: 'login',
      element: <LoginPage Children={LoginForm} title="Login"/>,
    },
     {
      path: 'forgotpassword',
      element: <LoginPage Children={ForgotPassword} title="Forgot Password"/>,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
