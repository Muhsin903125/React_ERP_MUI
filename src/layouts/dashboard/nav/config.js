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
    title: 'Masters',
    path: '',
    icon: icon('ic_user'),
    childern: [     
      {
        title: 'Customer Master',
        path: '/dashboard/customermaster',
        icon: icon('ic_user'),
      },
      {
        title: 'Customer Master V2',
        path: '/dashboard/customermasterv2',
        icon: icon('ic_user'),
      }  
    ]
  },  
  {
    title: 'Invoice',
    path: '',
    icon: icon('ic_user'),
    childern: [     
      {
        title: 'Create Invoice',
        path: '/dashboard/salesinvoice',
        icon: icon('ic_radio_button'),
      }  ,{
        title: 'Sales List',
        path: '/dashboard/SalesList',
        icon: icon('ic_radio_button'),
      } 
    ]
  },  
  {
    title: 'user',
    path: '/dashboard/user',
    icon: icon('ic_user'),
    childern: [     
      {
        title: 'Change Password',
        path: '/dashboard/changepassword',
        icon: icon('ic_radio_button'),
      } 
      
    ]
  },
  {
    title: 'product',
    path: '/dashboard/products',
    icon: icon('ic_cart'),
  },
  {
    title: 'blog',
    path: '/dashboard/blog',
    icon: icon('ic_blog'),
  },
  {
    title: 'login',
    path: '/login',
    icon: icon('ic_lock'),
  },
  {
    title: 'Not found',
    path: '/404',
    icon: icon('ic_disabled'),
  },
  
];

export default navConfig;
