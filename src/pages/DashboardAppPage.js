import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography } from '@mui/material';
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

// ----------------------------------------------------------------------

export default function DashboardAppPage() {
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Sales & Purchase Dashboard | Exapp ERP </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Sales & Purchase Overview
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Total Sales" 
              total={714000} 
              icon={'mdi:cash-multiple'} 
              color="success"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Total Purchases" 
              total={523000} 
              color="info" 
              icon={'mdi:cart-arrow-down'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Pending Orders" 
              total={45} 
              color="warning" 
              icon={'mdi:clock-outline'} 
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary 
              title="Profit Margin" 
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
              title="Sales by Category"
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

          <Grid item xs={12} md={6} lg={8}>
            <AppConversionRates
              title="Top Performing Products"
              subheader="Based on sales volume"
              chartData={[
                { label: 'Product A', value: 400 },
                { label: 'Product B', value: 430 },
                { label: 'Product C', value: 448 },
                { label: 'Product D', value: 470 },
                { label: 'Product E', value: 540 },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentSubject
              title="Purchase Categories"
              chartLabels={['Raw Materials', 'Equipment', 'Office Supplies', 'Services', 'Packaging', 'Others']}
              chartData={[
                { name: 'This Month', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Last Month', data: [20, 30, 40, 80, 20, 80] },
              ]}
              chartColors={[...Array(6)].map(() => theme.palette.text.secondary)}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppNewsUpdate
              title="Recent Transactions"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: faker.commerce.productName(),
                description: `Transaction #${faker.datatype.number({ min: 1000, max: 9999 })}`,
                image: `/assets/images/covers/cover_${index + 1}.jpg`,
                postedAt: faker.date.recent(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppOrderTimeline
              title="Purchase Orders"
              list={[...Array(5)].map((_, index) => ({
                id: faker.datatype.uuid(),
                title: [
                  'PO #1234 - Raw Materials',
                  'PO #1235 - Office Supplies',
                  'PO #1236 - Equipment',
                  'PO #1237 - Services',
                  'PO #1238 - Packaging',
                ][index],
                type: `order${index + 1}`,
                time: faker.date.past(),
              }))}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppTrafficBySite
              title="Top Suppliers"
              list={[
                {
                  name: 'Supplier A',
                  value: 323234,
                  icon: <Iconify icon={'mdi:factory'} color="#1877F2" width={32} />,
                },
                {
                  name: 'Supplier B',
                  value: 341212,
                  icon: <Iconify icon={'mdi:factory'} color="#DF3E30" width={32} />,
                },
                {
                  name: 'Supplier C',
                  value: 411213,
                  icon: <Iconify icon={'mdi:factory'} color="#006097" width={32} />,
                },
                {
                  name: 'Supplier D',
                  value: 443232,
                  icon: <Iconify icon={'mdi:factory'} color="#1C9CEA" width={32} />,
                },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={8}>
            <AppTasks
              title="Pending Tasks"
              list={[
                { id: '1', label: 'Review Purchase Orders' },
                { id: '2', label: 'Approve Supplier Payments' },
                { id: '3', label: 'Update Inventory Levels' },
                { id: '4', label: 'Generate Sales Reports' },
                { id: '5', label: 'Follow up on Pending Orders' },
              ]}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
