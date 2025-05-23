import { Navigate, useRoutes } from 'react-router-dom';
import { RequireAuth } from './hooks/RequireAuth';

// layouts
import DashboardLayout from './layouts/dashboard';
import SimpleLayout from './layouts/simple';

// pages
import BlogPage from './pages/BlogPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/LoginPage';
import Page404 from './pages/Page404';
import ProductsPage from './pages/ProductsPage';
import DashboardAppPage from './pages/DashboardAppPage';
import Settings from './pages/Settings';

// auth
import { LoginForm } from './sections/auth/login';
import ChangePassword from './pages/User/ChangePassword';
import ForgotPassword from './pages/User/ForgotPassword';
import ResetPassword from './pages/User/ResetPassword';
import RegisterUser from './pages/User/RegisterUser';
import UserList from './pages/User/UserList';
import UserRoleList from './pages/User/Roles/UserRoleList';

// masters
import CustomerMaster from './pages/Masters/CustomerMaster';
import CustomerMasterV2 from './pages/Masters/CustomerMasterV2';
import ProductList from './pages/Masters/Inventory/Product/ProductList';
import ChartOfAccount from './pages/Masters/Finance/ChartOfAccount';
import Supplier from './pages/Masters/Finance/Supplier';
import Salesman from './pages/Masters/Finance/Salesman';
import Customer from './pages/Masters/Finance/Customer';
import Product from './pages/Masters/Inventory/Product';
import Unit from './pages/Masters/Inventory/Unit';
import Location from './pages/Masters/Inventory/Location';

// settings
import LastNumber from './pages/Settings/ERP/LastNumber';
import Screens from './pages/Settings/Menu/Screens';
import Permissions from './pages/Settings/Menu/Permissions';
import Documents from './pages/Settings/ERP/Documents';
import Lookups from './pages/Settings/ERP/Lookups';
import CompanyProfile from './pages/Settings/ERP/CompanyProfile';

// transactions
import SalesInvoice from './pages/Transactions/Sales/Invoice';
import SalesEntry from './pages/Transactions/Sales/Invoice/SalesEntry';
import SalesQuotation from './pages/Transactions/Sales/Quotation';
import QuotationEntry from './pages/Transactions/Sales/Quotation/QuotationEntry';
import CreditNote from './pages/Transactions/Sales/CreditNote';
import CreditNoteEntry from './pages/Transactions/Sales/CreditNote/CreditNoteEntry';
import PurchaseInvoice from './pages/Transactions/Purchase/Invoice';
import PurchaseEntry from './pages/Transactions/Purchase/Invoice/PurchaseEntry';
import PurchaseOrder from './pages/Transactions/Purchase/Order';
import PurchaseOrderEntry from './pages/Transactions/Purchase/Order/OrderEntry';
import DebitNoteEntry from './pages/Transactions/Purchase/DebitNote/DebitNoteEntry';
import DebitNote from './pages/Transactions/Purchase/DebitNote';
import Receipt from './pages/Transactions/Finance/Receipt';
import ReceiptEntry from './pages/Transactions/Finance/Receipt/ReceiptEntry';
import ComingSoon from './components/ComingSoon';

// ----------------------------------------------------------------------

const userMenus = [
  { path: 'customermasterv2', element: <CustomerMasterV2 /> },
];

const adminMenus = [
  { path: 'userlist', element: <UserList /> },
  { path: 'registeruser', element: <RegisterUser /> },
  { path: 'rolelist', element: <UserRoleList /> },
  { path: 'product', element: <Product /> },
  { path: 'productlist', element: <ProductList /> },
  { path: 'unit', element: <Unit /> },
  { path: 'location', element: <Location /> },
  { path: 'coa', element: <ChartOfAccount /> },
  { path: 'supplier', element: <Supplier /> },
  { path: 'salesman', element: <Salesman /> },
  { path: 'customer', element: <Customer /> },
  { path: 'lastno', element: <LastNumber /> },
  { path: 'screens', element: <Screens /> },
  { path: 'permissions', element: <Permissions /> },
  { path: 'salesinvoice', element: <SalesInvoice /> },
  { path: 'sales-entry', element: <SalesEntry /> },
  { path: 'sales-entry/:id', element: <SalesEntry /> },
  { path: 'quotation', element: <SalesQuotation /> },
  { path: 'quotation-entry', element: <QuotationEntry /> },
  { path: 'quotation-entry/:id', element: <QuotationEntry /> },
  { path: 'creditnote', element: <CreditNote /> },
  { path: 'creditnote-entry', element: <CreditNoteEntry /> },
  { path: 'creditnote-entry/:id', element: <CreditNoteEntry /> },
  { path: 'debitnote', element: <DebitNote /> },
  { path: 'debitnote-entry', element: <DebitNoteEntry /> },
  { path: 'debitnote-entry/:id', element: <DebitNoteEntry /> },
  { path: 'documents', element: <Documents /> },
  { path: 'purchase', element: <PurchaseInvoice /> },
  { path: 'purchase-entry', element: <PurchaseEntry /> },
  { path: 'purchase-entry/:id', element: <PurchaseEntry /> },
  { path: 'purchase-order', element: <PurchaseOrder /> },
  { path: 'purchase-order-entry', element: <PurchaseOrderEntry /> },
  { path: 'purchase-order-entry/:id', element: <PurchaseOrderEntry /> },
  { path: 'receipt', element: <Receipt /> },
  { path: 'receipt-entry', element: <ReceiptEntry /> },
  { path: 'receipt-entry/:id', element: <ReceiptEntry /> },
  { path: 'lookups', element: <Lookups /> },
  { path: 'companyprofile', element: <CompanyProfile /> },

  { path: 'journal', element: <ComingSoon title="Journal"  /> },
  { path: 'journal-entry', element: <ComingSoon title="Journal Entry" /> },
  { path: 'journal-entry/:id', element: <ComingSoon title="Journal Entry" /> },

  { path: 'allocation', element: <ComingSoon title="Allocation" /> },
  { path: 'allocation-entry', element: <ComingSoon title="Allocation Entry" /> },
  { path: 'allocation-entry/:id', element: <ComingSoon title="Allocation Entry" /> },

  { path: 'payment', element: <ComingSoon title="Payment" /> },
  { path: 'payment-entry', element: <ComingSoon title="Payment Entry" /> },
  { path: 'payment-entry/:id', element: <ComingSoon title="Payment Entry" /> },

  { path: 'stock-adjustment', element: <ComingSoon title="Stock Adjustment" /> },
  { path: 'stock-adjustment-entry', element: <ComingSoon title="Stock Adjustment Entry" /> },
  { path: 'stock-adjustment-entry/:id', element: <ComingSoon title="Stock Adjustment Entry" /> },

  { path: 'transfer', element: <ComingSoon title="Transfer" /> },
  { path: 'transfer-entry', element: <ComingSoon title="Transfer Entry" /> },
  { path: 'transfer-entry/:id', element: <ComingSoon title="Transfer Entry" /> },

  { path: 'statement-of-account', element: <ComingSoon title="Statement of Account" /> },
  { path: 'statement-of-account-entry', element: <ComingSoon title="Statement of Account Entry" /> },
  { path: 'statement-of-account-entry/:id', element: <ComingSoon title="Statement of Account Entry" /> },

  { path: 'trail-balance', element: <ComingSoon title="Trail Balance" /> },
  { path: 'trail-balance-entry', element: <ComingSoon title="Trail Balance Entry" /> },
  { path: 'trail-balance-entry/:id', element: <ComingSoon title="Trail Balance Entry" /> },

  { path: 'pl', element: <ComingSoon title="Profit and Loss" /> },
  { path: 'pl-entry', element: <ComingSoon title="Profit and Loss Entry" /> },
  { path: 'pl-entry/:id', element: <ComingSoon title="Profit and Loss Entry" /> },

  { path: 'balance-sheet', element: <ComingSoon title="Balance Sheet" /> },
  { path: 'balance-sheet-entry', element: <ComingSoon title="Balance Sheet Entry" /> },
  { path: 'balance-sheet-entry/:id', element: <ComingSoon title="Balance Sheet Entry" /> },

  { path: 'ageing', element: <ComingSoon title="Ageing" /> },
  { path: 'ageing-entry', element: <ComingSoon title="Ageing Entry" /> },
  { path: 'ageing-entry/:id', element: <ComingSoon title="Ageing Entry" /> },

  { path: 'sales-summary', element: <ComingSoon title="Sales Summary" /> },
  { path: 'sales-analysis', element: <ComingSoon title="Sales Analysis" /> },

  { path: 'purchase-summary', element: <ComingSoon title="Purchase Summary" /> },
  { path: 'purchase-analysis', element: <ComingSoon title="Purchase Analysis" /> },

  { path: 'stock-balance', element: <ComingSoon title="Stock Balance" /> },
  { path: 'stock-location-balance', element: <ComingSoon title="Stock Location Balance" /> },
  { path: 'stock-ledger', element: <ComingSoon title="Stock Ledger" /> },
  { path: 'stock-ageing', element: <ComingSoon title="Stock Ageing" /> },
  { path: 'stock-movement', element: <ComingSoon title="Stock Movement" /> },
 
];

export default function Router() {
  const routes = useRoutes([
    {
      path: '/',
      element: <RequireAuth><DashboardLayout /></RequireAuth>,
      children: [
        { element: <Navigate to="/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'changepassword', element: <ChangePassword /> },
        { path: 'salesinvoice', element: <SalesInvoice /> },
        { path: 'sales-entry', element: <SalesEntry /> },
        { path: 'sales-entry/:id', element: <SalesEntry /> },
        { path: 'user', element: <UserPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        { path: 'customermaster', element: <CustomerMaster /> },
        { path: 'settings', element: <Settings /> },
        { path: 'lookups', element: <Lookups /> },
        ...userMenus,
        ...adminMenus,
      ],
    },
    {
      path: '/comingsoon',
      element: <ComingSoon />,
    },
    {
      path: '/login',
      element: <LoginPage Page={LoginForm} />,
    },
    {
      path: '/forgotpassword',
      element: <LoginPage Page={ForgotPassword} />,
    },
    {
      path: '/resetpassword',
      element: <LoginPage Page={ResetPassword} />,
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
}
