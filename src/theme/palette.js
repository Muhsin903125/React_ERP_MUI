import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------
const themeColor = localStorage.getItem("ThemeColor");
const themeMode = localStorage.getItem("ThemeMode");
// SETUP COLORS
let GREY = {
  0: '#FFFFFF',
  100: '#F9FAFB',
  200: '#F4F6F8',
  300: '#DFE3E8',
  400: '#C4CDD5',
  500: '#919EAB',
  600: '#637381',
  700: '#454F5B',
  800: '#212B36',
  900: '#161C24',
};
const GREY_DARK = {
  900: '#FFFFFF',
  800: '#F9FAFB',
  700: '#F4F6F8',
  600: '#DFE3E8',
  500: '#C4CDD5',
  400: '#919EAB',
  300: '#637381',
  200: '#454F5B',
  100: '#212B36',
  0: '#161C24',
};
const PRIMARY = {
  lighter: '#D1E9FC',
  light: '#76B0F1',
  main: '#2065D1',
  dark: '#103996',
  darker: '#061B64',
  contrastText: '#fff',
};

const SECONDARY = {
  lighter: '#D6E4FF',
  light: '#84A9FF',
  main: '#3366FF',
  dark: '#1939B7',
  darker: '#091A7A',
  contrastText: '#fff',
};

// RED
const PRIMARY_RED = {
  lighter: '#FFEBEE',
  light: '#FFCDD2',
  main: '#F44336',
  dark: '#D32F2F',
  darker: '#B71C1C',
  contrastText: '#fff',
};

const SECONDARY_RED = {
  lighter: '#FF8A80',
  light: '#FF5252',
  main: '#FF1744',
  dark: '#D50000',
  darker: '#B2102F',
  contrastText: '#fff',
};

// GREEN
const PRIMARY_GREEN = {
  lighter: '#E8F5E9',
  light: '#81C784',
  main: '#4CAF50',
  dark: '#388E3C',
  darker: '#1B5E20',
  contrastText: '#fff',
};

const SECONDARY_GREEN = {
  lighter: '#B9F6CA',
  light: '#69F0AE',
  main: '#00E676',
  dark: '#00C853',
  darker: '#007A33',
  contrastText: '#fff',
};

// Yellow Theme
const PRIMARY_YELLOW = {
  lighter: '#FFFDE7',
  light: '#FFF9C4',
  main: '#FFEB3B',
  dark: '#FBC02D',
  darker: '#F57F17',
  contrastText: '#000',
};

const SECONDARY_YELLOW = {
  lighter: '#FFF9C4',
  light: '#FFF176',
  main: '#FFC107',
  dark: '#FFA000',
  darker: '#FF6F00',
  contrastText: '#000',
};

// Orange Theme
const PRIMARY_ORANGE = {
  lighter: '#FFF3E0',
  light: '#FFCC80',
  main: '#FF9800',
  dark: '#F57C00',
  darker: '#EF6C00',
  contrastText: '#fff',
};

const SECONDARY_ORANGE = {
  lighter: '#FFD180',
  light: '#FFAB40',
  main: '#FF9100',
  dark: '#FF6D00',
  darker: '#E65100',
  contrastText: '#fff',
};

// Violet Theme
const PRIMARY_VIOLET = {
  lighter: '#F3E5F5',
  light: '#BA68C8',
  main: '#9C27B0',
  dark: '#7B1FA2',
  darker: '#4A148C',
  contrastText: '#fff',
};

const SECONDARY_VIOLET = {
  lighter: '#E1BEE7',
  light: '#AB47BC',
  main: '#673AB7',
  dark: '#512DA8',
  darker: '#311B92',
  contrastText: '#fff',
};



const INFO = {
  lighter: '#D0F2FF',
  light: '#74CAFF',
  main: '#1890FF',
  dark: '#0C53B7',
  darker: '#04297A',
  contrastText: '#fff',
};

const SUCCESS = {
  lighter: '#E9FCD4',
  light: '#AAF27F',
  main: '#54D62C',
  dark: '#229A16',
  darker: '#08660D',
  contrastText: GREY[800],
};

const WARNING = {
  lighter: '#FFF7CD',
  light: '#FFE16A',
  main: '#FFC107',
  dark: '#B78103',
  darker: '#7A4F01',
  contrastText: GREY[800],
};

const ERROR = {
  lighter: '#FFE7D9',
  light: '#FFA48D',
  main: '#FF4842',
  dark: '#B72136',
  darker: '#7A0C2E',
  contrastText: '#fff',
};
const getPrimary = () => {
  let result = PRIMARY;
  if (themeColor === "red")
    result = PRIMARY_RED;
  else if (themeColor === "green")
    result = PRIMARY_GREEN;
  else if (themeColor === "orange")
    result = PRIMARY_ORANGE;
  else if (themeColor === "yellow")
    result = PRIMARY_YELLOW;
  else if (themeColor === "violet")
    result = PRIMARY_VIOLET;
  else
    result = PRIMARY;

  if (themeMode === "dark")
    GREY = GREY_DARK;

  return result;
}
const getSecondary = () => {
  let result = SECONDARY;
  if (themeColor === "red")
    result = SECONDARY_RED;
  else if (themeColor === "green")
    result = SECONDARY_GREEN;
  else if (themeColor === "orange")
    result = SECONDARY_ORANGE;
  else if (themeColor === "yellow")
    result = SECONDARY_YELLOW;
  else if (themeColor === "voilet")
    result = SECONDARY_VIOLET;
  else
    result = SECONDARY;

  return result;
}



const palette = {
  common: { black: '#000', white: '#fff' },
  primary: getPrimary(),
  secondary: getSecondary(),
  info: INFO,
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  grey: GREY,
  divider: alpha(GREY[500], 0.24),
  text: {
    primary: GREY[800],
    secondary: GREY[600],
    disabled: GREY[500],
  },
  background: {
    paper: '#fff',
    default: GREY[100],
    neutral: GREY[200],
    transparent: alpha(GREY[200], 0.95)
  },
  action: {
    active: GREY[600],
    hover: themeMode !== 'dark' ? alpha(GREY[500], 0.08) :  alpha(GREY[100], 0.5),
    selected: themeMode !== 'dark' ? getPrimary().lighter :  getPrimary().darker,
    disabled: alpha(GREY[500], 0.8),
    disabledBackground: alpha(GREY[500], 0.24),
    focus: alpha(GREY[500], 0.24),
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
};
 
export default palette;
