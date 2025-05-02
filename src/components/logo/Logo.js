import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Box, Link } from '@mui/material';

// ----------------------------------------------------------------------

const Logo = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  const theme = useTheme();

  const PRIMARY_LIGHT = theme.palette.primary.light;

  const PRIMARY_MAIN = theme.palette.primary.main;

  const PRIMARY_DARK = theme.palette.primary.dark;

  // OR using local (public folder)
  // -------------------------------------------------------
  // const logo = (
  //   <Box
  //     component="img"
  //     src="/logo/logo_single.svg" => your path
  //     sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
  //   />
  // );

  const logo = (
    <Box
      ref={ref}
      component="div"
      sx={{
        width: 40,
        height: 40,
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 512 512">
        <defs>
          <linearGradient id="BG1" x1="100%" x2="50%" y1="9.946%" y2="50%">
            <stop offset="0%" stopColor={PRIMARY_DARK} />
            <stop offset="100%" stopColor={PRIMARY_MAIN} />
          </linearGradient>

          <linearGradient id="BG2" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} />
            <stop offset="100%" stopColor={PRIMARY_MAIN} />
          </linearGradient>

          <linearGradient id="BG3" x1="50%" x2="50%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={PRIMARY_LIGHT} />
            <stop offset="100%" stopColor={PRIMARY_MAIN} />
          </linearGradient>
        </defs>

        <g fill={PRIMARY_MAIN} fillRule="evenodd" stroke="none" strokeWidth="1">
          <path
            fill="url(#BG1)"
            d="M95.3717,221.33392v59.37895l-17.01092,-10.83093c-2.8033,-2.2299 -4.20495,-5.41546 -4.20495,-9.5567v-63.77503c0.19113,2.16618 1.01938,4.33237 2.54845,6.43485c1.52907,2.10247 3.63154,4.01381 6.24371,5.67031c1.97505,1.27423 4.77835,2.93072 8.4099,4.96949c2.67587,1.46536 4.01381,4.07753 4.01381,7.70907zM143.7923,184.12651h-64.41215c-2.86701,0 -5.35175,1.01938 -7.39051,3.05814c-2.03876,2.03876 -3.05814,4.5235 -3.05814,7.39051v11.40433v54.34576c0,5.86144 2.10247,10.38494 6.24371,13.63422l0.44598,0.31855l17.01092,10.83093c0.82825,0.50969 1.78391,0.76454 2.73959,0.76454c0.89196,0 1.72021,-0.19113 2.48474,-0.63711c1.78391,-0.95567 2.67587,-2.48474 2.67587,-4.5235v-5.22433h26.69504c4.58722,0 8.47361,-1.59278 11.72288,-4.84206c3.24928,-3.24928 4.84206,-7.13567 4.84206,-11.72288v-5.35175h-43.25999v-12.86969h26.69504c4.58722,0 8.47361,-1.59278 11.72288,-4.84206c3.24928,-3.24928 4.84206,-7.13567 4.84206,-11.65917v-5.35175h-43.45112c-0.70082,-4.5235 -2.86701,-7.77278 -6.43485,-9.74783c-2.10247,-1.14681 -3.88639,-2.16618 -5.41546,-3.12186h38.73648c4.58722,0 8.47361,-1.59278 11.72288,-4.84206c3.24928,-3.24928 4.84206,-7.13567 4.84206,-11.65917z"
            // d="M183.168 285.573l-2.918 5.298-2.973 5.363-2.846 5.095-2.274 4.043-2.186 3.857-2.506 4.383-1.6 2.774-2.294 3.939-1.099 1.869-1.416 2.388-1.025 1.713-1.317 2.18-.95 1.558-1.514 2.447-.866 1.38-.833 1.312-.802 1.246-.77 1.18-.739 1.111-.935 1.38-.664.956-.425.6-.41.572-.59.8-.376.497-.537.69-.171.214c-10.76 13.37-22.496 23.493-36.93 29.334-30.346 14.262-68.07 14.929-97.202-2.704l72.347-124.682 2.8-1.72c49.257-29.326 73.08 1.117 94.02 40.927z"
          />
          {/* <path
            fill="url(#BG2)"
            d="M444.31 229.726c-46.27-80.956-94.1-157.228-149.043-45.344-7.516 14.384-12.995 42.337-25.267 42.337v-.142c-12.272 0-17.75-27.953-25.265-42.337C189.79 72.356 141.96 148.628 95.69 229.584c-3.483 6.106-6.828 11.932-9.69 16.996 106.038-67.127 97.11 135.667 184 137.278V384c86.891-1.611 77.962-204.405 184-137.28-2.86-5.062-6.206-10.888-9.69-16.994"
          />
          <path
            fill="url(#BG3)"
            d="M450 384c26.509 0 48-21.491 48-48s-21.491-48-48-48-48 21.491-48 48 21.491 48 48 48"
          /> */}
        </g>
      </svg>
    </Box>
  );

  if (disabledLink) {
    return <>{logo}</>;
  }

  return (
    <Link to="/" component={RouterLink} sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  sx: PropTypes.object,
  disabledLink: PropTypes.bool,
};

export default Logo;
