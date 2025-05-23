import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// @mui
import { styled } from '@mui/material/styles';
import { Box, Stack, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// components
import Iconify from '../../../components/iconify';
//
import Searchbar from './Searchbar';
import AccountPopover from './AccountPopover';
import LanguagePopover from './LanguagePopover';
import NotificationsPopover from './NotificationsPopover';
import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const HEADER_MOBILE = 64;

const HEADER_DESKTOP = 92;

const StyledRoot = styled(AppBar)(({ theme }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  boxShadow: 'none',
  // [theme.breakpoints.up('lg')]: {
  //   width: `calc(100% - ${NAV_WIDTH + 1}px)`,
  // },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: HEADER_MOBILE,
  [theme.breakpoints.up('lg')]: {
    minHeight: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

// ----------------------------------------------------------------------

Header.propTypes = {
  onOpenNav: PropTypes.func,
};

export default   function Header({ onOpenNav }) {
  const { companyWebsite, companyLogoUrl, companyName } = useAuth();
  

  return (
    <StyledRoot>
      <StyledToolbar>
        <IconButton
          onClick={onOpenNav}
          sx={{
            mr: 1,
            color: 'text.primary',
            // display: { lg: 'none' },
          }}
        >
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>

        <Searchbar />
        <Box sx={{ flexGrow: 1 }} />

        <Stack
          direction="row"
          alignItems="center"
          spacing={{
            xs: 0.5,
            sm: 1,
          }}          
        >      
        <Box sx={{display:"flex",alignItems:"center"}} onClick={() => window.open(companyWebsite, '_blank')}>
          {companyLogoUrl ? <img  src={companyLogoUrl} alt="Company Logo" style={{ width: 'auto', height: '50px',padding:"5px",marginRight:"10px",
            borderRadius:"5px",
            border:"1px solid #e0e0e0",
           }} /> :
            <Typography  variant="h6" sx={{ ml: 1 }}>{companyName}</Typography>}
          </Box>

          {/* <LanguagePopover />
          <NotificationsPopover /> */}
          <AccountPopover />
        </Stack>
      </StyledToolbar>
    </StyledRoot>
  );
}
