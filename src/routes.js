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
import ChartOfAccount from './pages/Masters/Finance/ChartOfAccount/index';
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
import Journal from './pages/Transactions/Finance/Jounal';
import JournalEntry from './pages/Transactions/Finance/Jounal/JournalEntry';
import Payment from './pages/Transactions/Finance/Payment';
import PaymentEntry from './pages/Transactions/Finance/Payment/PaymentEntry';
import Allocation from './pages/Transactions/Finance/Allocation';
import AllocationEntry from './pages/Transactions/Finance/Allocation/AllocationEntry';
import StatementOfAccount from './pages/Reports/Finance/StatementOfAccount';
import TrailBalance from './pages/Reports/Finance/TrailBalance';
import ActivityPage from './pages/ActivityPage';

// Stock Adjustment
import StockAdjustment from './pages/Transactions/Store/StockAdjustment';
import StockAdjustmentEntry from './pages/Transactions/Store/StockAdjustment/StockAdjustmentEntry';

// Transfer
import Transfer from './pages/Transactions/Store/Transfer';
import TransferEntry from './pages/Transactions/Store/Transfer/TransferEntry';
import PAndL from './pages/Reports/Finance/PAndL';
import BalanceSheet from './pages/Reports/Finance/BalanceSheet';
import Ageing from './pages/Reports/Finance/Ageing';
import SalesSummary from './pages/Reports/Sales/Summary';
import SalesAnalysis from './pages/Reports/Sales/Analysis';
import PurchaseSummary from './pages/Reports/Purchase/Summary';
import PurchaseAnalysis from './pages/Reports/Purchase/Analysis';
import StockBalance from './pages/Reports/Inventory/StockBalance';
import StockLedger from './pages/Reports/Inventory/StockLedger';
import StockAgeing from './pages/Reports/Inventory/StockAgeing';
import StockLocBalance from './pages/Reports/Inventory/StockLocBalance';
import StockMovement from './pages/Reports/Inventory/StockMovement';

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

  { path: 'journal', element: <Journal /> },
  { path: 'journal-entry', element: <JournalEntry /> },
  { path: 'journal-entry/:id', element: <JournalEntry /> },

  { path: 'allocation', element: <Allocation /> },
  { path: 'allocation-entry', element: <AllocationEntry /> },
  { path: 'allocation-entry/:id', element: <AllocationEntry /> },

  { path: 'payment', element: <Payment /> },
  { path: 'payment-entry', element: <PaymentEntry /> },
  { path: 'payment-entry/:id', element: <PaymentEntry /> },
  { path: 'stock-adjustment', element: <StockAdjustment /> },
  { path: 'stock-adjustment-entry', element: <StockAdjustmentEntry /> },
  { path: 'stock-adjustment-entry/:id', element: <StockAdjustmentEntry /> },

  { path: 'stock-transfer', element: <Transfer /> },
  { path: 'stock-transfer-entry', element: <TransferEntry /> },
  { path: 'stock-transfer-entry/:id', element: <TransferEntry /> },

  { path: 'statement-of-account', element: <StatementOfAccount /> }, 

  { path: 'trail-balance', element: <TrailBalance /> }, 
  { path: 'pl', element: <PAndL /> }, 
  { path: 'balance-sheet', element: <BalanceSheet /> }, 

  { path: 'ageing', element: <Ageing /> }, 

  { path: 'sales-summary', element: <SalesSummary /> },
  { path: 'sales-analysis', element: <SalesAnalysis /> },

  { path: 'purchase-summary', element: <PurchaseSummary /> },
  { path: 'purchase-analysis', element: <PurchaseAnalysis /> },

  { path: 'stock-balance', element: <StockBalance /> },
  { path: 'stock-location-balance', element: <StockLocBalance /> },
  { path: 'stock-ledger', element: <StockLedger /> },
  { path: 'stock-ageing', element: <StockAgeing /> },
  { path: 'stock-movement', element: <StockMovement /> },
 
];

export default function Router() {
  const routes = useRoutes([
    {
      path: '/',
      element: <RequireAuth><DashboardLayout /></RequireAuth>,
      children: [
        { element: <Navigate to="/app" />, index: true },        { path: 'app', element: <DashboardAppPage /> },
        { path: 'activity', element: <ActivityPage /> },
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
      element: <LoginForm />,
    },
    {
      path: '/forgotpassword',
      element: <ForgotPassword />,
    },
    {
      path: '/resetpassword',
      element: <ResetPassword />,
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
