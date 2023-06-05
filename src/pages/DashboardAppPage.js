import { Helmet } from 'react-helmet-async';
import React, { useState, useEffect, Suspense } from 'react';
import { Faker } from '@faker-js/faker';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
// @mui
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
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

  const [orders, setOrders] = useState([])
  const [revenueByWeek, setRevenueByWeek] = useState({});
  const [latestWeekRevenue, setLatestWeekRevenue] = useState();
  const [ordersToday, setOrdersToday] = useState(0);
  const [bestSellingProduct, setBestSellingProduct] = useState('');
  const [salesCount, setSalesCount] = useState(0);
  const [products, setProducts] = useState([]);
  const [showComponent, setShowComponent] = useState(false);

  
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/v1/order');
        setOrders(response.data.json);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/v1/products`);
        setProducts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const calculateRevenueByWeek = () => {
      const newRevenueByWeek = {};
      orders.forEach((order) => {
        const createdAt = new Date(order.createdAt);
        const weekNumber = getWeekNumber(createdAt);
        if (!newRevenueByWeek[weekNumber]) {
          newRevenueByWeek[weekNumber] = 0;
        }
        newRevenueByWeek[weekNumber] += order.totalPrice;
      });
      setRevenueByWeek(newRevenueByWeek);
  
      const weeks = Object.keys(newRevenueByWeek);
      const latestWeek = Math.max(...weeks.map(Number));
      const latestWeekRevenue = newRevenueByWeek[latestWeek];
      setLatestWeekRevenue(latestWeekRevenue); 
    };
  
    const getWeekNumber = (date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
      const dayOffset = firstDayOfYear.getDay() === 0 ? 1 : 0;
      const diff = (date - firstDayOfYear) / 86400000;
      const weekNumber = Math.floor((diff + firstDayOfYear.getDay() - dayOffset) / 7);
      return weekNumber;
    };
  
    calculateRevenueByWeek();
  }, [orders]);

  useEffect(() => {
    const countOrdersToday = () => {
      const today = new Date(); 
      const todayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });
      setOrdersToday(todayOrders.length);
    };
  
    countOrdersToday();
  }, [orders]);

  useEffect(() => {
    const calculateBestSellingProduct = () => {
      const productSales = {};
  
      orders.forEach((order) => {
        order.products.forEach((product) => {
          const { name } = product;
          if (productSales[name]) {
            productSales[name] += product.quantity;
          } else {
            productSales[name] = product.quantity;
          }
        });
      });
  
      let bestSellingProduct = '';
      let maxSales = 0;
  
      Object.entries(productSales).forEach(([productName, sales]) => {
        if (sales > maxSales) {
          bestSellingProduct = productName;
          maxSales = sales;
        }
      });
  
      setBestSellingProduct(bestSellingProduct);
      setSalesCount(maxSales);
    };
  
    calculateBestSellingProduct();
  }, [orders]);


  const getProductSalesData = (data) => {
    const productSales = {};
  
    data.forEach((item) => {
      item.products.forEach((product) => {
        const { name } = product;
        if (productSales[name]) {
          productSales[name] += product.quantity;
        } else {
          productSales[name] = product.quantity;
        }
      });
    });
  
    const salesData = Object.entries(productSales).map(([label, value]) => ({
      label,
      value,
    }));
  
    return salesData;
  };
  
  const salesData = getProductSalesData(orders);
  
  return (
    <>
      <Helmet>
        <title> Dashboard | Minimal UI </title>
      </Helmet>

      <Container maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Hi, Welcome back
        </Typography>

        <Grid container spacing={3}>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Week Revenue" total={latestWeekRevenue} icon={'ant-design:android-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Order Today" total={ordersToday} color="info" icon={'ant-design:apple-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title={bestSellingProduct} total={salesCount} color="warning" icon={'ant-design:windows-filled'} />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AppWidgetSummary title="Total products" total={products.length} color="error" icon={'ant-design:bug-filled'} />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <AppCurrentVisits
              title="Current Visits"
              chartData={salesData}
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
              title="Conversion Rates"
              subheader="(+43%) than last year"
              chartData={salesData}
            />
          </Grid>
{/* 
          <Grid item xs={12} md={6} lg={8}>
            <AppWebsiteVisits
              title="Website Visits"
              subheader="(+43%) than last year"
              chartLabels={[
                '01/01/2003',
                '02/01/2003',
                '03/01/2003',
                '04/01/2003',
                '05/01/2003',
                '06/01/2003',
                '07/01/2003',
                '08/01/2003',
                '09/01/2003',
                '10/01/2003',
                '11/01/2003',
              ]}
              chartData={[
                {
                  name: 'Team A',
                  type: 'column',
                  fill: 'solid',
                  data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30],
                },
                {
                  name: 'Team B',
                  type: 'area',
                  fill: 'gradient',
                  data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43],
                },
                {
                  name: 'Team C',
                  type: 'line',
                  fill: 'solid',
                  data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39],
                },
              ]}
            />
          </Grid> */}

{/*         
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
          </Grid>
           */}

        </Grid>
      </Container>
    </>
  );
}
