import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react'; 
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Button, Box, Menu, MenuItem, IconButton, useMediaQuery } from '@mui/material';
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
  AppConversionRates,
} from '../sections/@dashboard/app';
import useAuth from '../hooks/useAuth';
import { GetMultipleResult } from '../hooks/Api';
import AppWidgetSummary2 from '../sections/@dashboard/app/AppWidgetSummary2';
// ----------------------------------------------------------------------

export default function DashboardAppPage() {
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
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '6px 16px',
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    color: '#fff',
    '&:hover': {
      boxShadow: '0 6px 20px rgba(33, 150, 243, 0.3)',
      transform: 'translateY(-2px)',
      background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
    },
    '& .MuiButton-startIcon': {
      marginRight: '8px',
      '& svg': {
        fontSize: '1.25rem',
      }
    }
  };

  const menuItemStyles = {
    py: 1.5,
    px: 2,
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(33, 150, 243, 0.08)',
      transform: 'translateX(4px)',
    },
    '& .MuiSvgIcon-root': {
      marginRight: '12px',
      color: theme.palette.primary.main,
      fontSize: '1.25rem',
    }
  };

  return (
    <>
      <Helmet>
        <title> Dashboard | Exapp ERP </title>
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          background: isMobile ? 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.7))' : 'none',
          borderRadius: '12px',
          p: isMobile ? 2 : 1,
          boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.05)' : 'none',
          backdropFilter: 'blur(8px)',
        }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: { xs: 1, sm: 0 },
              fontWeight: 700,
              background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              letterSpacing: '-0.5px',
            }}
          >
            Hi {displayName}, Welcome back
          </Typography>
          
          <Button
            variant="contained"
            size="small"
            onClick={handleMenuClick}
            startIcon={<Iconify icon="mdi:menu" />}
            sx={{ 
              ...buttonStyles,
              width: '100%',
              maxWidth: !isMobile ? '180px' : '100%',
            }}
          >
            Quick Actions
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                width: '100%',
                maxWidth: !isMobile ? '320px' : '100%',
                mt: 1,
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.18)',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(8px)',
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => handleNavigation('/sales-entry')} sx={menuItemStyles}>
              <Iconify icon="mdi:plus" sx={{ marginRight: '8px' }} />
              Add Sales Invoice Entry
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/purchase-entry')} sx={menuItemStyles}>
              <Iconify icon="mdi:plus" sx={{ marginRight: '8px' }} />
              Add Purchase Invoice Entry
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/receipt-entry')} sx={menuItemStyles}>
              <Iconify icon="mdi:plus" sx={{ marginRight: '8px' }} />
              Add Receipt Entry
            </MenuItem>
            <MenuItem onClick={() => handleNavigation('/payment-entry')} sx={menuItemStyles}>
              <Iconify icon="mdi:plus" sx={{ marginRight: '8px' }} />
              Add Payment Entry
            </MenuItem>
          </Menu>
        </Box>

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Today Sales" 
              total={dashboardcount?.TodaySales || 0} 
              icon={'mdi:cash-multiple'} 
              color="success"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Today Purchases" 
              total={dashboardcount?.TodayPurchases || 0} 
              color="info" 
              icon={'mdi:cart-arrow-down'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Today Orders" 
              total={dashboardcount?.TodayPOs || 0} 
              color="warning" 
              icon={'mdi:clock-outline'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2     
              title="Today Quotations" 
              total={dashboardcount?.TodayQuotes || 0} 
              color="success" 
              icon={'mdi:chart-line'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Total Sales" 
              total={dashboardcount?.TotalSales || 0} 
              icon={'mdi:cash-multiple'} 
              color="success"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Total Purchases" 
              total={dashboardcount?.TotalPurchases || 0} 
              color="info" 
              icon={'mdi:cart-arrow-down'} 
            />

          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Total Orders" 
              total={dashboardcount?.TotalPOs || 0} 
              color="warning" 
              icon={'mdi:clock-outline'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary2 
              title="Total Quotations" 
              total={dashboardcount?.TotalQuotes || 0} 
              color="success" 
              icon={'mdi:chart-line'} 
            />
          </Grid>

         {dateList && (
          <Grid item xs={12} md={6} lg={8}>
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
          )}

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
              ]}
            />
          </Grid>
          )}

          {/* <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Conversion Rates"
              subheader="(+43%) than last year"
              chartData={[
                { label: 'Italy', value: 400 },
                { label: 'Japan', value: 430 },
                { label: 'China', value: 448 },
                { label: 'Canada', value: 470 },
                { label: 'France', value: 540 },
                { label: 'Germany', value: 580 },
                { label: 'South Korea', value: 690 },
                { label: 'Netherlands', value: 1100 },
                { label: 'United States', value: 1200 },
                { label: 'United Kingdom', value: 1380 },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Current Subject"
              chartLabels={['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math']}
              chartData={[
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="News Update"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: faker.name.jobTitle(),
                description: faker.name.jobTitle(),
                image: `/assets/images/covers/cover_${index + 1}.jpg`,
                postedAt: faker.date.recent(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title="Order Timeline"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: [
                  '1983, orders, $4220',
                  '12 Invoices have been paid',
                  'Order #37745 from September',
                  'New order placed #XF-2356',
                  'New order placed #XF-2346',
                ][index],
                type: `order${index + 1}`,
                time: faker.date.past(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite
              title="Traffic by Site"
              list={[
                {
                  name: 'FaceBook',
                  value: 323234,
                  icon: <Iconify icon={'eva:facebook-fill'} color="#1877F2" width={32} />,
                },
                {
                  name: 'Google',
                  value: 341212,
                  icon: <Iconify icon={'eva:google-fill'} color="#DF3E30" width={32} />,
                },
                {
                  name: 'Linkedin',
                  value: 411213,
                  icon: <Iconify icon={'eva:linkedin-fill'} color="#006097" width={32} />,
                },
                {
                  name: 'Twitter',
                  value: 443232,
                  icon: <Iconify icon={'eva:twitter-fill'} color="#1C9CEA" width={32} />,
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppTasks
              title="Tasks"
              list={[
                { id: '1', label: 'Create FireStone Logo' },
                { id: '2', label: 'Add SCSS and JS files if required' },
                { id: '3', label: 'Stakeholder Meeting' },
                { id: '4', label: 'Scoping & Estimations' },
                { id: '5', label: 'Sprint Showcase' },
              ]}
            />
          </Grid> */}
        </Grid>
      </Container>
    </>
  );
}
