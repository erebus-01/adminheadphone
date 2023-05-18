// component
import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/dashboard/app',
    icon: icon('ic_analytics'),
  },
  {
    title: 'admin',
    path: '/dashboard/admin',
    icon: icon('ic_admin'),
  },
  {
    title: 'Product',
    path: '/dashboard/products',
    icon: icon('ic_lock'),
  },
  {
    title: 'blog',
    path: '/dashboard/blog',
    icon: icon('ic_blog'),
  },
  {
    title: 'order',
    path: '/dashboard/order',
    icon: icon('ic_order'),
  },
  {
    title: 'user',
    path: '/dashboard/user',
    icon: icon('ic_user'),
  },
  {
    title: 'exhibit',
    path: '/dashboard/products/exhibit',
    icon: icon('ic_cart'),
  },
  {
    title: 'blog list',
    path: '/dashboard/blog_list',
    icon: icon('ic_blog'),
  },
  {
    title: 'logout',
    path: '/login',
    icon: icon('ic_logout'),
  },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
