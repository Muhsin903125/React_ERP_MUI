import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react'; 
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Button, Box, Menu, MenuItem, IconButton, useMediaQuery, Paper, Stack, Divider } from '@mui/material';
// components
import Iconify from '../components/iconify';
// sections
import {
  AppTasks,
  AppNewsUpdate,
  AppOrderTimeline,
  AppCurrentVisits,
  AppWebsiteVisits,
  AppTrafficBySite,
  AppWidgetSummary, 
  AppCurrentSubject,
  AppConversionRates,  AppRecentActivity,
  AppTopProducts,
  AppPendingTasks,
  AppTopCustomers,
  AppQuickStats,
  AppActivitySummary,
} from '../sections/@dashboard/app';
import useAuth from '../hooks/useAuth';
import { GetMultipleResult } from '../hooks/Api';
import AppWidgetSummary2 from '../sections/@dashboard/app/AppWidgetSummary2';
import { useToast } from '../hooks/Common';
// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const { showToast } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const { displayName } = useAuth();
  const [dashboardcount, setDashboardcount] = useState();
  const [chartData, setChartData] = useState(); 
  const [dateList, setDateList] = useState();
  const [salesList, setSalesList] = useState();
  const [purchaseList, setPurchaseList] = useState();
  const [profitList, setProfitList] = useState(); 
  const [salesmanchart, setSalesmanchart] = useState();

  // Dummy data for new sections (you can replace with API calls later)
  const [recentActivities] = useState([
    {
      id: '1',
      type: 'sale',
      title: 'New Sale Invoice #SI-001',
      description: 'Customer ABC Corp - AED 15,500',
      time: '2 minutes ago',
      status: 'completed'
    },
    {
      id: '2',
      type: 'purchase',
      title: 'Purchase Order #PO-045',
      description: 'Supplier XYZ Ltd - AED 8,750',
      time: '15 minutes ago',
      status: 'pending'
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      description: 'Customer DEF Inc - AED 12,300',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      id: '4',
      type: 'invoice',
      title: 'Invoice Generated #INV-789',
      description: 'Customer GHI Corp - AED 5,900',
      time: '2 hours ago',
      status: 'pending'
    },
  ]);

  const [topProducts] = useState([
    {
      id: '1',
      name: 'Premium Office Chair',
      sales: 145,
      revenue: 'AED 87,500',
      progress: 85,
      image: null
    },
    {
      id: '2',
      name: 'Standing Desk Pro',
      sales: 132,
      revenue: 'AED 79,200',
      progress: 78,
      image: null
    },
    {
      id: '3',
      name: 'Wireless Headset',
      sales: 98,
      revenue: 'AED 49,000',
      progress: 65,
      image: null
    },
    {
      id: '4',
      name: 'Laptop Stand',
      sales: 87,
      revenue: 'AED 26,100',
      progress: 45,
      image: null
    },
  ]);

  const [pendingTasks] = useState([
    {
      id: '1',
      title: 'Review Monthly Financial Reports',
      description: 'Analyze sales performance and generate insights',
      priority: 'high',
      dueDate: 'Today',
      status: 'in-progress',
      progress: 60,
      assignees: [
        { name: 'John Doe', avatar: null },
        { name: 'Jane Smith', avatar: null }
      ]
    },
    {
      id: '2',
      title: 'Update Inventory Levels',
      description: 'Sync with warehouse management system',
      priority: 'medium',
      dueDate: 'Tomorrow',
      status: 'pending',
      progress: 0,
      assignees: [
        { name: 'Mike Johnson', avatar: null }
      ]
    },
    {
      id: '3',
      title: 'Process Pending Orders',
      description: 'Review and approve 12 pending purchase orders',
      priority: 'high',
      dueDate: 'Today',
      status: 'pending',
      progress: 25,
      assignees: [
        { name: 'Sarah Wilson', avatar: null }
      ]
    },
  ]);

  const [topCustomers] = useState([
    {
      id: '1',
      name: 'ABC Corporation',
      email: 'contact@abc-corp.com',
      totalPurchases: 'AED 245,000',
      lastOrder: '2 days ago',
      status: 'active',
      avatar: null
    },
    {
      id: '2',
      name: 'XYZ Industries',
      email: 'orders@xyz-industries.com',
      totalPurchases: 'AED 189,500',
      lastOrder: '1 week ago',
      status: 'active',
      avatar: null
    },
    {
      id: '3',
      name: 'DEF Solutions',
      email: 'procurement@def-solutions.com',
      totalPurchases: 'AED 156,200',
      lastOrder: '3 days ago',
      status: 'active',
      avatar: null
    },
    {
      id: '4',
      name: 'GHI Enterprises',
      email: 'buying@ghi-ent.com',
      totalPurchases: 'AED 98,750',
      lastOrder: '2 weeks ago',
      status: 'inactive',
      avatar: null
    },
  ]);

  const [quickStats] = useState([
    {
      label: 'Conversion Rate',
      value: '12.5%',
      change: '+2.1%',
      trend: 'up',
      icon: 'mdi:chart-line',
      color: 'success'
    },
    {
      label: 'Avg. Order Value',
      value: 'AED 1,250',
      change: '+5.3%',
      trend: 'up',
      icon: 'mdi:currency-usd',
      color: 'info'
    },
    {
      label: 'Customer Retention',
      value: '89.2%',
      change: '-1.2%',
      trend: 'down',
      icon: 'mdi:account-heart',
      color: 'warning'
    },
    {
      label: 'Inventory Turnover',
      value: '4.2x',
      change: '+0.8',
      trend: 'up',
      icon: 'mdi:refresh',      color: 'primary'
    },
  ]);

  const [activitySummary] = useState({
    todayActivities: 23,
    weekActivities: 156,
    monthActivities: 647,
    pendingTasks: 8,
    completedTasks: 42,
    activeUsers: 12,
    recentTypes: ['sale', 'purchase', 'payment', 'invoice', 'user'],
  });

const navigate = useNavigate();
const getDashboardData = async () => {
  const { Success, Data, Message } = await GetMultipleResult({
    "key": "DASHBOARD_CRUD" 
  });
  if (Success) {
    setDashboardcount(Data[0][0]);  
    setChartData(Data[1]);
    setDateList(Data[1].map(item => item.Date));
    setSalesList(Data[1].map(item => item.Sales));
    setPurchaseList(Data[1].map(item => item.Purchases));
    setProfitList(Data[1].map(item => item.Profit));
    setSalesmanchart(Data[2]);
  } else {
    showToast(Message, "error");
  }
}
useEffect(() => {
  getDashboardData();
}, []);
 
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };
   const buttonStyles = {
    borderRadius: '8px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.8rem',
    padding: '4px 12px',
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    color: '#fff',
    '&:hover': {
      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)',
      transform: 'translateY(-2px)',
      background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
    },
    '& .MuiButton-startIcon': {
      marginRight: '6px',
      '& svg': {
        fontSize: '1rem',
      }
    }
  };
  const menuItemStyles = {
    py: 1,
    px: 1.5,
    transition: 'all 0.2s ease',
    fontSize: '0.85rem',
    '&:hover': {
      backgroundColor: 'rgba(33, 150, 243, 0.08)',
      transform: 'translateX(4px)',
    },
    '& .MuiSvgIcon-root': {
      marginRight: '10px',
      color: theme.palette.primary.main,
      fontSize: '1.1rem',
    }
  };

  return (
    <>
      <Helmet>
        <title> Dashboard | Exapp ERP </title>
      </Helmet>      <Container maxWidth="xl" sx={{ py: 1.5 }}>
        {/* Modern Header Section */}        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 2.5,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Box>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600" sx={{ mb: 1, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
                  Welcome back, {displayName}! 👋
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  Here's what's happening with your business today
                </Typography>
              </Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>                <Button
                  variant="contained"
                  startIcon={<Iconify icon="mdi:plus" />}
                  onClick={handleMenuClick}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    py: 0.8,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Quick Actions
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:history" />}
                  onClick={() => navigate('/activity')}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    py: 0.8,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Activity History
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:chart-line" />}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                    py: 0.8,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  View Reports
                </Button>
              </Stack>
            </Stack>
          </Box>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                width: 320,
                mt: 1,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
              }
            }}
          >            <MenuItem onClick={() => handleNavigation('/sales-entry')} sx={menuItemStyles}>
              <Iconify icon="mdi:plus" sx={{ marginRight: '6px' }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Add Sales Invoice Entry</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/purchase-entry')} sx={menuItemStyles}>
              <Iconify icon="mdi:plus" sx={{ marginRight: '6px' }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Add Purchase Invoice Entry</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/receipt-entry')} sx={menuItemStyles}>
              <Iconify icon="mdi:plus" sx={{ marginRight: '6px' }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Add Receipt Entry</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/payment-entry')} sx={menuItemStyles}>
              <Iconify icon="mdi:plus" sx={{ marginRight: '6px' }} />
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>Add Payment Entry</Typography>
            </MenuItem>
          </Menu>
        </Paper>        {/* Main Grid Layout */}
        <Grid container spacing={2.5}>{/* Key Performance Metrics - Top Row */}
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Today Sales" 
              total={dashboardcount?.TodaySales || 0} 
              icon={'mdi:cash-multiple'} 
              color="success"
              trend="up"
              change="+12.5%"
              subtitle="vs yesterday"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Today Purchases" 
              total={dashboardcount?.TodayPurchases || 0} 
              color="info" 
              icon={'mdi:cart-arrow-down'} 
              trend="up"
              change="+8.2%"
              subtitle="vs yesterday"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Today Orders" 
              total={dashboardcount?.TodayPOs || 0} 
              color="warning" 
              icon={'mdi:clock-outline'} 
              trend="down"
              change="-3.1%"
              subtitle="vs yesterday"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2     
              title="Today Quotations" 
              total={dashboardcount?.TodayQuotes || 0} 
              color="error" 
              icon={'mdi:chart-line'} 
              trend="up"
              change="+15.7%"
              subtitle="vs yesterday"
            />
          </Grid>

          {/* Additional Metrics - Second Row */}
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Total Sales" 
              total={dashboardcount?.TotalSales || 0} 
              icon={'mdi:cash-multiple'} 
              color="success"
              trend="up"
              change="+24.8%"
              subtitle="this month"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Total Purchases" 
              total={dashboardcount?.TotalPurchases || 0} 
              color="info" 
              icon={'mdi:cart-arrow-down'} 
              trend="up"
              change="+18.3%"
              subtitle="this month"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Total Orders" 
              total={dashboardcount?.TotalPOs || 0} 
              color="warning" 
              icon={'mdi:clock-outline'} 
              trend="neutral"
              change="+2.1%"
              subtitle="this month"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Total Quotations" 
              total={dashboardcount?.TotalQuotes || 0} 
              color="error" 
              icon={'mdi:chart-line'} 
              trend="up"
              change="+31.2%"
              subtitle="this month"
            />
          </Grid>

          {/* Charts and Analytics Section */}
          {dateList && (
            <Grid item xs={12} lg={8}>
              <AppWebsiteVisits
                title="Sales vs Purchases Trend"
                subheader="Last 6 months comparison"
                chartLabels={dateList}
                chartData={[
                  {
                    name: 'Sales',
                    type: 'column',
                    fill: 'solid',
                    data: salesList,
                  },
                  {
                    name: 'Purchases',
                    type: 'area',
                    fill: 'gradient',
                    data: purchaseList,
                  },
                  {
                    name: 'Profit',
                    type: 'line',
                    fill: 'solid',
                    data: profitList,
                  },
                ]}
              />
            </Grid>
          )}          <Grid item xs={12} lg={4}>
            <AppActivitySummary
              title="Activity Overview"
              data={activitySummary}
            />
          </Grid>

          {/* Sales Performance Section */}
          {salesmanchart && (
            <Grid item xs={12} md={6} lg={4}>
              <AppCurrentVisits
                title="Sales by Salesman"
                chartData={salesmanchart}
                chartColors={[
                  theme.palette.primary.main,
                  theme.palette.info.main,
                  theme.palette.warning.main,
                  theme.palette.error.main,
                  theme.palette.success.main,
                ]}
              />
            </Grid>
          )}

          <Grid item xs={12} md={6} lg={4}>
            <AppTopProducts
              title="Top Selling Products"
              list={topProducts}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTopCustomers
              title="Top Customers"
              list={topCustomers}
            />
          </Grid>          {/* Activity and Task Management Section */}
          <Grid item xs={12} md={6} lg={4}>
            <AppRecentActivity
              title="Recent Activities"
              list={recentActivities}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppQuickStats
              title="Business Insights"
              stats={quickStats}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppPendingTasks
              title="Pending Tasks"
              list={pendingTasks}
            />
          </Grid>

          {/* Optional: Conversion Rates for future use */}
          {/* <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Product Performance"
              subheader="(+12%) than last month"
              chartData={[
                { label: 'Office Chairs', value: 400 },
                { label: 'Standing Desks', value: 430 },
                { label: 'Laptops', value: 448 },
                { label: 'Monitors', value: 470 },
                { label: 'Keyboards', value: 540 },
                { label: 'Headsets', value: 580 },
                { label: 'Webcams', value: 690 },
                { label: 'Speakers', value: 1100 },
                { label: 'Tablets', value: 1200 },
                { label: 'Smartphones', value: 1380 },
              ]}
            />
          </Grid> */}
        </Grid>
      </Container>
    </>
  );
}
