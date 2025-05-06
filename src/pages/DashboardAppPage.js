import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useState } from 'react'; 
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Button, Box } from '@mui/material';
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
// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();
  const { displayName } = useAuth();
  const [dashboardcount, setDashboardcount] = useState();
  const [dashboardgraph, setDashboardgraph] = useState();
  const [dashboardcategory, setDashboardcategory] = useState();

const navigate = useNavigate();
const getDashboardData = async () => {
  const { Success, Data, Message } = await GetMultipleResult({
    "key": "DASHBOARD_CRUD",
    "TYPE": "GET_ALL"
  });
  if (Success) {
    setDashboardcount(Data[0][0]);  
    setDashboardgraph(Data[1]);
    setDashboardcategory(Data[2]);
  }
}


  return (
    <>
      <Helmet>
        <title> Dashboard | Exapp ERP </title>
      </Helmet>

      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb:3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Hi {displayName}, Welcome back
          </Typography>
        <Box sx={{ display: 'flex', gap: 1, }}>
          <Button variant="contained" color="primary" sx={{ mb: 5 }} onClick={() => navigate('/sales-entry')}>
            Add Sales Invoice Entry
          </Button>
          <Button variant="contained" color="primary" sx={{ mb: 5 }} onClick={() => navigate('/purchase-entry')}>
              Add Purchase Invoice Entry
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Today Sales" 
              total={714000} 
              icon={'mdi:cash-multiple'} 
              color="success"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Today Purchases" 
              total={523000} 
              color="info" 
              icon={'mdi:cart-arrow-down'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Today Orders" 
              total={45} 
              color="warning" 
              icon={'mdi:clock-outline'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Today Quotations" 
              total="23%" 
              color="success" 
              icon={'mdi:chart-line'} 
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="Sales vs Purchases Trend"
              subheader="Last 6 months comparison"
              chartLabels={[
                '01/01/2025',
                '02/01/2025',
                '03/01/2025',
                '04/01/2025',
                '05/01/2025',
                '06/01/2025',
              ]}
              chartData={[
                {
                  name: 'Sales',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 13, 22],
                },
                {
                  name: 'Purchases',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43],
                },
                {
                  name: 'Profit',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35],
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Sales by Salesman"
              chartData={[
                { label: 'Electronics', value: 4344 },
                { label: 'Clothing', value: 5435 },
                { label: 'Food', value: 1443 },
                { label: 'Others', value: 4443 },
              ]}
              chartColors={[
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.warning.main,
                theme.palette.error.main,
              ]}
            />
          </Grid>

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
