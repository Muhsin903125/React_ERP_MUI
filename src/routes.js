import { createContext, useContext, useEffect, useState } from 'react';
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
import CustomerMasterV2 from './pages/Masters/CustomerMasterV2';
import RegisterUser from './pages/User/RegisterUser';
import UserList from './pages/User/UserList';
import UserRoleList from './pages/User/Roles/UserRoleList'; 
import ProductList from './pages/Masters/Product/ProductList';
import Product from './pages/Masters/Product/Product';
import UnitList from './pages/Masters/Unit/UnitList';
import Unit from './pages/Masters/Unit/Unit'; 
import Settings from './pages/Settings';
import InvoicePrint from './pages/Invoice/InvoicePrint';
import ChartOfAccount from './pages/Masters/Finance/ChartOfAccount';
import Supplier from './pages/Masters/Finance/Supplier';
import Salesman from './pages/Masters/Finance/Salesman';
import LastNumber from './pages/Settings/ERP/LastNumber';
import Customer from './pages/Masters/Finance/Customer';
import Screens from './pages/Settings/Menu/Screens';
import Permissions from './pages/Settings/Menu/Permissions';

// ----------------------------------------------------------------------
const RequiredRolesContext = createContext();

const fetchRequiredRoles = async (routePath) => {
  // Replace with your actual API call
  const response = await fetch(`/api/routes/${routePath}/requiredRoles`);
  const data = await response.json();
  return data.requiredRoles;
};

const canAccess = (userRoles, requiredRoles) => {
  return requiredRoles.some(role => userRoles.includes(role));
};

const ProtectedRoute = ({ children }) => {
  const requiredRoles = useContext(RequiredRolesContext);

  if (!requiredRoles) {
    return <div>Loading...</div>; // or display a loading indicator
  }

  const userRoles ='admin' /* Get user roles from state or context */;

  if (!canAccess(userRoles, requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
export default function Router() {


  const [requiredRoles, setRequiredRoles] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      const roles = await fetchRequiredRoles(window.location.pathname);
      setRequiredRoles(roles);
    };
console.log("pathh- ",window.location.pathname);

    fetchRoles();
  }, []);





  const userMenus = [
    { path: 'customermasterv2', element: <CustomerMasterV2 /> },
    { path: 'SalesList', element: <SalesList /> },
  ]
 const AdminMenus = [
    { path: 'userlist', element: <UserList /> },
    { path: 'registeruser', element: <RegisterUser /> },
    { path: 'rolelist', element: <UserRoleList /> }, 
    { path: 'product', element: <Product /> },
    { path: 'productlist', element: <ProductList /> },
    { path: 'unit', element: <Unit /> },
    { path: 'unitlist', element: <UnitList /> },
    { path: 'coa', element: <ChartOfAccount /> },
    { path: 'supplier', element: <Supplier /> },   
    { path: 'salesman', element: <Salesman /> },
    { path: 'customer', element: <Customer /> },
      { path: 'lastno', element: <LastNumber /> },
      { path: 'screens', element: <Screens /> },
      { path: 'permissions', element: <Permissions /> },
    { path: 'invoiceprint', element: <InvoicePrint /> },
  ]
  const routes = useRoutes([
    {
      path: '/',
      element: <RequireAuth><DashboardLayout /></RequireAuth>,
      children: [
        { element: <Navigate to="/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'changepassword', element: <ChangePassword/> },
        { path: 'salesinvoice', element: <SalesInvoice/> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'customermaster', element: <CustomerMaster /> },
        { path: 'settings', element: <Settings /> },

        ...userMenus,
        ...AdminMenus
        // { path: 'customermasterv2', element: <CustomerMasterV2 /> },
        // { path: 'SalesList', element: <SalesList /> },
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
        { element: <Navigate to="/app" />, index: true },
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
  // return (
  //   <RequiredRolesContext.Provider value={requiredRoles}>
  //     <Routes>
  //       <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  //       {/* Other routes */}
  //     </Routes>
  //   </RequiredRolesContext.Provider>
  // );
}
