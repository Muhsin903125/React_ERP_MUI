// component
import { appBarClasses, SvgIcon } from '@mui/material';
import { AccountBalance, AccountBalanceTwoTone, AccountBalanceWalletTwoTone, ArticleTwoTone, Assessment, Assignment, CardTravelTwoTone, DashboardTwoTone, Inventory2TwoTone, LocalGroceryStoreTwoTone, LocalShippingTwoTone, MenuTwoTone, PermIdentityTwoTone, SettingsTwoTone, StorefrontTwoTone, ToggleOffTwoTone } from '@mui/icons-material';
import SvgColor from '../../../components/svg-color';
// import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

const icon = (name, isMaterialIcon = false) => {
  if (isMaterialIcon) {
    return <SvgIcon sx={{ width: 1, height: 1 }}>{name}</SvgIcon>;
  }
  return <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;
};

const subIcon = () => <span style={{
  width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgb(145, 158, 171)", display: "inline-block", marginRight: "5px"
}} />
const APP_PLAN = process.env.REACT_APP_PLAN;
// const {role} = useAuth();
const role = sessionStorage.getItem('role');
const navConfig1 = [    
  {
    title: 'dashboard',
    path: '/app',
    icon: icon(<DashboardTwoTone />, true),
    visible: true
  },
  // master
  {
    title: 'Masters',
    path: '',
      icon: icon(<Assignment />, true),
    childern: [
      {
        title: 'Finance',
        path: '',
        icon: icon(<AccountBalanceTwoTone />, true),
        childern: [
           
          {
            title: 'Supplier',
            path: '/supplier',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Salesman',
            path: '/salesman',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Customer',
            path: '/customer',
            icon: subIcon(),
            visible:true
          },


        ]
      },
      {
        title: 'Inventory',
        path: '',
        icon: icon(<Inventory2TwoTone />, true),
        childern: [
          {
            title: 'Products',
            path: '/product',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Units',
            path: '/unit',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Locations',
            path: '/location',
            icon: subIcon(),
            visible:true
          },
        ]
      },


    ]
  },

  // transactions
  {
    title: 'Transactions',
    path: '',
    icon: icon(<AccountBalanceWalletTwoTone />, true),
    childern: [
      {
        title: 'Purchase',
        path: '',
        icon: icon(<LocalShippingTwoTone />, true),
        childern: [
          {
            title: 'Order',
            path: '/purchase-order',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Invoice',
            path: '/purchase',
            icon: subIcon(),
            visible:true
          },
          // {
          //   title: 'Debit Note',
          //   path: '/debitnote',
          //   icon: subIcon()
          // },
        ]
      },
      {
        title: 'Sales',
        path: '',
        icon: icon(<LocalGroceryStoreTwoTone />, true),
        childern: [
          {
            title: 'Quotation',
            path: '/quotation',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Invoice',
            path: '/salesinvoice',
            icon: subIcon(),
            visible:true
          },
          // {
          //   title: 'Credit Note',
          //   path: '/creditnote',
          //   icon: subIcon()
          // },
        ]
      }
      
       
    ]
  },

  // reports 
  // {
  //   title: 'Reports',
  //   path: '',
  //   icon: icon(<ArticleTwoTone />, true),
  //   childern: [
      
  //     {
  //       title: 'Sales',
  //       path: '',
  //       icon: icon(<LocalGroceryStoreTwoTone />, true),
  //       childern: [
  //         {
  //           title: 'Summary',
  //           path: '/productlist',
  //           icon: subIcon()
  //         },
  //         {
  //           title: 'Analysis',
  //           path: '/unitlist',
  //           icon: subIcon()
  //         },
  //       ]
  //     },
  //     {
  //       title: 'Purchase',
  //       path: '',
  //       icon: icon(<LocalShippingTwoTone />, true),
  //       childern: [
  //         {
  //           title: 'Summary',
  //           path: '/productlist',
  //           icon: subIcon()
  //         },
  //       ]
  //     },
      
  //   ]
  // },

  {
    title: 'Settings',
    path: '',
    icon: icon(<SettingsTwoTone />, true),
    childern: [
      {
        title: 'Account',
        path: '',
        icon: icon(<PermIdentityTwoTone />, true),
        childern: [
          {
            title: 'Change Password',
            path: '/changepassword',
            icon: subIcon(),
            visible:true
          },

          {
            title: 'Users',
            path: '/userlist',
            icon: subIcon(),
            visible: role?.toLowerCase() !== 'employee'
          },
          {
            title: 'User Roles',
            path: '/rolelist',
            icon: subIcon(),
            visible: role?.toLowerCase() !== 'employee'
          },
          // {
          //   title: 'Permissions',
          //   path: '/customermasterv2',
          //   icon: subIcon()
          // },


        ]
      },
      {
        title: 'ERP',
        path: '',
        icon: icon(<ToggleOffTwoTone />, true),
        childern: [
          {
            title: 'Configs',
            path: '/settings',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Company',
            path: '/companyprofile',
            icon: subIcon(),
            visible:true
          },
          
          {
            title: 'Documents',
            path: '/documents',
            icon: subIcon(),
            visible:true
          },
        ]
      }

    ]
  }


];
const navConfig = [
  {
    title: 'dashboard',
    path: '/app',
    icon: icon('ic_dashboard'),
  },
  // master
  {
    title: 'Masters',
    path: '',
    icon: icon(<Assignment />, true),
    childern: [
      {
        title: 'Finance',
        path: '',
        icon: icon(<AccountBalanceTwoTone />, true),
        childern: [
           {
            title: 'Chart Of Account',
            path: '/coa',
            icon: subIcon()
          },
          {
            title: 'Supplier',
            path: '/supplier',
            icon: subIcon()
          },
          {
            title: 'Salesman',
            path: '/salesman',
            icon: subIcon()
          },
          {
            title: 'Customer',
            path: '/customer',
            icon: subIcon()
          },


        ]
      },
      {
        title: 'Inventory',
        path: '',
        icon: icon(<Inventory2TwoTone />, true),
        childern: [
          {
            title: 'Products',
            path: '/product',
            icon: subIcon()
          },
          {
            title: 'Units',
            path: '/unit',
            icon: subIcon()
          },
          {
            title: 'Locations',
            path: '/location',
            icon: subIcon()
          },
        ]
      },


    ]
  },

  // transactions
  {
    title: 'Transactions',
    path: '',
    icon: icon(<AccountBalanceWalletTwoTone />, true),
    childern: [
      {
        title: 'Purchase',
        path: '',
        icon: icon(<LocalShippingTwoTone />, true),
        childern: [
          {
            title: 'Order',
            path: '/purchase-order',
            icon: subIcon()
          },
          {
            title: 'Invoice',
            path: '/purchase',
            icon: subIcon()
          },
          {
            title: 'Debit Note',
            path: '/debitnote',
            icon: subIcon()
          },
        ]
      },
      {
        title: 'Sales',
        path: '',
        icon: icon(<LocalGroceryStoreTwoTone />, true),
        childern: [
          {
            title: 'Quotation',
            path: '/quotation',
            icon: subIcon()
          },
          {
            title: 'Invoice',
            path: '/salesinvoice',
            icon: subIcon()
          },
          {
            title: 'Credit Note',
            path: '/creditnote',
            icon: subIcon()
          },
        ]
      },
      {
        title: 'Finance',
        path: '',
        icon: icon(<CardTravelTwoTone />, true),
        childern: [
          {
            title: 'Reciept',
            path: '/productlist',
            icon: subIcon()
          },
          {
            title: 'Payment',
            path: '/customermasterv2',
            icon: subIcon()
          },
          {
            title: 'Journal',
            path: '/customermasterv2',
            icon: subIcon()
          },
          {
            title: 'Allocation',
            path: '/customermasterv2',
            icon: subIcon()
          },
        ]
      },
      {
        title: 'Store',
        path: '',
        icon: icon(<StorefrontTwoTone />, true),
        childern: [
          {
            title: 'Stock Adjustment',
            path: '/productlist',
            icon: subIcon()
          },
          {
            title: 'Transfer',
            path: '/customermasterv2',
            icon: subIcon()
          },
        ]
      },
    ]
  },

  // reports 
  {
    title: 'Reports',
    path: '',
    icon: icon(<ArticleTwoTone />, true),
    childern: [
      {
        title: 'Finance',
        path: '',
        icon: icon(<AccountBalanceTwoTone />, true),
        childern: [
          {
            title: 'Statement of Account',
            path: '/productlist',
            icon: subIcon()
          },
          {
            title: 'Trail Balance',
            path: '/customermasterv2',
            icon: subIcon()
          },
          {
            title: 'P&L',
            path: '/customermasterv2',
            icon: subIcon()
          },
          {
            title: 'Balance Sheet',
            path: '/customermasterv2',
            icon: subIcon()
          },

          {
            title: 'Ageing',
            path: '/customermasterv2',
            icon: subIcon()
          },
        ]
      },
      {
        title: 'Sales',
        path: '',
        icon: icon(<LocalGroceryStoreTwoTone />, true),
        childern: [
          {
            title: 'Summary',
            path: '/productlist',
            icon: subIcon()
          },
          {
            title: 'Analysis',
            path: '/unitlist',
            icon: subIcon()
          },
        ]
      },
      {
        title: 'Purchase',
        path: '',
        icon: icon(<LocalShippingTwoTone />, true),
        childern: [
          {
            title: 'Summary',
            path: '/productlist',
            icon: subIcon()
          },
        ]
      },
      {
        title: 'Inventory',
        path: '',
        icon: icon(<Inventory2TwoTone />, true),
        childern: [
          {
            title: 'Stock Balance',
            path: '/productlist',
            icon: subIcon()
          }, {
            title: 'Stock Location Wise Balance',
            path: '/productlist',
            icon: subIcon()
          }, {
            title: 'Stock Ledger',
            path: '/productlist',
            icon: subIcon()
          }, {
            title: 'Stock Ageing',
            path: '/productlist',
            icon: subIcon()
          }, {
            title: 'Stock Movement',
            path: '/productlist',
            icon: subIcon()
          },
        ]
      },
    ]
  },

  {
    title: 'Settings',
    path: '',
    icon: icon(<SettingsTwoTone />, true),
    childern: [
      {
        title: 'Account',
        path: '',
        icon: icon(<PermIdentityTwoTone />, true),
        childern: [
          {
            title: 'Change Password',
            path: '/changepassword',
            icon: subIcon()
          },

          {
            title: 'Users',
            path: '/userlist',
            icon: subIcon()
          },
          {
            title: 'User Roles',
            path: '/rolelist',
            icon: subIcon()
          },
          {
            title: 'Permissions',
            path: '/customermasterv2',
            icon: subIcon()
          },


        ]
      },
      {
        title: 'Menu',
        path: '',
        icon: icon(<MenuTwoTone />, true),
        childern: [
          {
            title: 'Screens',
            path: '/screens',
            icon: subIcon()
          },
          {
            title: 'Permissions',
            path: '/permissions',
            icon: subIcon()
          },
        ]
      },
      {
        title: 'ERP',
        path: '',
        icon: icon(<ToggleOffTwoTone />, true),
        childern: [
          {
            title: 'Configs',
            path: '/settings',
            icon: subIcon()
          },
          {
            title: 'Company',
            path: '/companyprofile',
            icon: subIcon()
          },
          {
            title: 'Lookups',
            path: '/lookups',
            icon: subIcon()
          },
          {
            title: 'Last Number',
            path: '/lastno',
            icon: subIcon()
          },
          {
            title: 'Documents',
            path: '/documents',
            icon: subIcon()
          },
        ]
      }

    ]
  }


];
export default APP_PLAN > 1 ? navConfig : navConfig1;
