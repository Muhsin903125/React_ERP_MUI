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
    visible:true
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
            icon: subIcon(),
            visible:true
          },
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
          {
            title: 'Debit Note',
            path: '/debitnote',
            icon: subIcon(),
            visible:true
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
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Invoice',
            path: '/salesinvoice',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Credit Note',
            path: '/creditnote',
            icon: subIcon(),
            visible:true
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
            path: '/receipt',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Payment',
            path: '/payment',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Journal',
            path: '/journal',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Allocation',
            path: '/allocation',
            icon: subIcon(),
            visible:true
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
            path: '/stock-adjustment',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Transfer',
            path: '/transfer',
            icon: subIcon(),
            visible:true
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
            path: '/statement-of-account',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Trail Balance',
            path: '/trail-balance',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'P&L',
            path: '/pl',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Balance Sheet',
            path: '/balance-sheet',
            icon: subIcon(),
            visible:true
          },

          {
            title: 'Ageing',
            path: '/ageing',
            icon: subIcon(),
            visible:true
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
            path: '/sales-summary',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Analysis',
            path: '/sales-analysis',
            icon: subIcon(),
            visible:true
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
            path: '/purchase-summary',
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
            title: 'Stock Balance',
            path: '/stock-balance',
            icon: subIcon(),
            visible:true
          }, {
            title: 'Stock Location Wise Balance',
            path: '/stock-location-balance',
            icon: subIcon(),
            visible:true
          }, {
            title: 'Stock Ledger',
            path: '/stock-ledger',
            icon: subIcon(),
            visible:true
          }, {
            title: 'Stock Ageing',
            path: '/stock-ageing',
            icon: subIcon(),
            visible:true
          }, {
            title: 'Stock Movement',
            path: '/stock-movement',
            icon: subIcon(),
            visible:true
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
            icon: subIcon(),
            visible:true
          },

          {
            title: 'Users',
            path: '/userlist',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'User Roles',
            path: '/rolelist',
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Permissions',
            path: '/permissions',
            icon: subIcon(),
            visible:true
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
            icon: subIcon(),
            visible:true
          },
          {
            title: 'Permissions',
            path: '/permissions',
            icon: subIcon(),
            visible:true
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
            title: 'Lookups',
            path: '/lookups',
            icon: subIcon()
          },
          {
            title: 'Last Number',
            path: '/lastno',
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
export default APP_PLAN > 1 ? navConfig : navConfig1;
