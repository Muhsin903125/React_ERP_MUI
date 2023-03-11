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
import SalesList from './pages/Invoice/SalesList';
import CustomerMaster from './pages/Masters/CustomerMaster';
import { LoginForm } from './sections/auth/login'; 
import ForgotPassword from './pages/User/ForgotPassword';
import ResetPassword from './pages/User/ResetPassword';
import {Post} from './hooks/axios';
import { RequireAuth } from './hooks/RequireAuth';

// ----------------------------------------------------------------------

export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: <RequireAuth><DashboardLayout /></RequireAuth>,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'changepassword', element: <ChangePassword/> },
        { path: 'salesinvoice', element: <SalesInvoice/> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'customermaster', element: <CustomerMaster /> },
        { path: 'SalesList', element: <SalesList /> },
      ],
    },
    {
      path: '/login',
      element: <LoginPage Page={LoginForm}  />,
    },
    {
      path: '/testt',
      element: <Post  />,
    },
     {
      path: '/forgotpassword',
      element: <LoginPage Page={ForgotPassword}  />,
    }, 
    {
      path: '/resetpassword',
      element: <LoginPage Page={ResetPassword}  />,
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
