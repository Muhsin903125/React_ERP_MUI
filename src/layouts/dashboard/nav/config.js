// component
import SvgColor from '../../../components/svg-color';


// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/app',
    icon: icon('ic_analytics'),
  },
   
  {
    title: 'Masters',
    path: '',
    icon: icon('ic_user'),
    childern: [     
      {
        title: 'Customer Master',
        path: '/customermaster',
        icon: icon('ic_user'),
      },
      {
        title: 'Customer Master List',
        path: '/customermasterv2',
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
        path: '/salesinvoice',
        icon: icon('ic_radio_button'),
      }  ,{
        title: 'Sales List',
        path: '/SalesList',
        icon: icon('ic_radio_button'),
      } 
    ]
  },  
  {
    title: 'user',
    path: '/user',
    icon: icon('ic_user'),
    childern: [     
      {
        title: 'Change Password',
        path: '/changepassword',
        icon: icon('ic_radio_button'),
      } ,
        {
        title: 'User Roles',
        path: '/rolelist',
        icon: icon('ic_radio_button'),
      } ,
        {
        title: 'Users',
        path: '/userlist',
        icon: icon('ic_radio_button'),
      } 
    ]
  },
  {
    title: 'product',
    path: '/products',
    icon: icon('ic_cart'),
  },
  {
    title: 'blog',
    path: '/blog',
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
