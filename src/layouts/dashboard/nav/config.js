// component
import { SvgIcon } from '@mui/material';
import { AccountBalance, AccountBalanceTwoTone, AccountBalanceWalletTwoTone, ArticleTwoTone, Assessment, Assignment, CardTravelTwoTone, Inventory2TwoTone, LocalGroceryStoreTwoTone, LocalShippingTwoTone, MenuTwoTone, PermIdentityTwoTone, SettingsTwoTone, StorefrontTwoTone, ToggleOffTwoTone } from '@mui/icons-material';
import SvgColor from '../../../components/svg-color';

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
          
  
        ]
      },
      {
        title: 'Inventory',
        path: '',
        icon: icon(<Inventory2TwoTone />, true),
        childern: [
          {
            title: 'Products',
            path: '/productlist',
            icon: subIcon()
          },
          {
            title: 'Units',
            path: '/unitlist',
            icon: subIcon()
          },
          {
            title: 'Locations',
            path: '/unitlist',
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
            path: '/productlist',
            icon: subIcon()
          },
          {
            title: 'Invoice',
            path: '/customermasterv2',
            icon: subIcon()
          },
          {
            title: 'Debit Note',
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
            title: 'Quotation',
            path: '/productlist',
            icon: subIcon()
          },
          {
            title: 'Invoice',
            path: '/customermasterv2',
            icon: subIcon()
          },
          {
            title: 'Credit Note',
            path: '/customermasterv2',
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
            path: '/productlist',
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
            title: 'Lookups',
            path: '/settings', 
            icon: subIcon()
          }, 
          {
            title: 'Last Number',
            path: '/lastno', 
            icon: subIcon()
          }, 
        ]
      }

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
    
  
];

export default navConfig;
