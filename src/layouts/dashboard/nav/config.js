// component
import SvgColor from '../../../components/svg-color';


// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const navConfig = [
  {
    title: 'dashboard',
    path: '/app',
    icon: icon('ic_dashboard'),
  },

  {
    title: 'Masters',
    path: '',
    icon: icon('ic_folder'),
    childern: [
      {
        title: 'Finance',
        path: '',
        icon: icon('ic_folder'),
        childern: [
          
          {
            title: 'Products',
            path: '/productlist',
            icon: <span style={{
              width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
            }} />,
          },
      
          {
            title: 'Units',
            path: '/unitlist',
            icon: <span style={{
              width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
            }} />,
          },
          {
            title: 'Customer',
            path: '/customermaster',
            icon: <span style={{
              width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
            }} />,
      
          },
          {
            title: 'Customer Master List',
            path: '/customermasterv2',
            icon: <span style={{
              width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
            }} />,
          }
        ]
      },
      
     
    ]
  },
  {
    title: 'Invoice',
    path: '',
    icon: icon('ic_file'),
    childern: [
      {
        title: 'Create Invoice',
        path: '/salesinvoice',
        icon: <span style={{
          width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
        }} />,
      }, {
        title: 'Sales List',
        path: '/SalesList',
        icon: <span style={{
          width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
        }} />,
      }
      , {
        title: 'Invoice Print',
        path: '/invoiceprint',
        icon: <span style={{
          width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
        }} />,
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
        icon: <span style={{
          width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
        }} />,
      },
      {
        title: 'User Roles',
        path: '/rolelist',
        icon: <span style={{
          width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
        }} />,
      },
      {
        title: 'Users',
        path: '/userlist',
        icon: <span style={{
          width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
        }} />,
      }
    ]
  },
   {
    title: 'Settings',
    path: '/settings',
    icon: icon('ic_setting'),
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
