import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { Box, Link, Button, Drawer, Typography, Avatar, Stack, useTheme } from '@mui/material';
// mock
import account from '../../../_mock/account';
// hooks
import useResponsive from '../../../hooks/useResponsive';
// components
import Logo from '../../../components/logo';
import Scrollbar from '../../../components/scrollbar';
import { NavSection } from '../../../components/nav-section'; 

import useAuth from '../../../hooks/useAuth';
//
import navConfig from './config';
import StringAvatar from '../../../components/StringAvatar';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

const StyledAccount = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: alpha(theme.palette.grey[500], 0.12),
}));

// ----------------------------------------------------------------------

Nav.propTypes = {
  openNav: PropTypes.bool,
  onCloseNav: PropTypes.func,
};

export default function Nav({ openNav, onCloseNav }) {
  const { pathname } = useLocation();
  const { displayName,username,profileImg,role} =useAuth() 
  const isDesktop = useResponsive('up', 'xl');
  const theme = useTheme();

  const PRIMARY_LIGHT = theme.palette.primary.light;

  const PRIMARY_MAIN = theme.palette.primary.main;

  const PRIMARY_DARK = theme.palette.primary.dark;

  useEffect(() => {
    if (openNav) {
      onCloseNav();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const renderContent = (
    <Scrollbar
      sx={{
        height: 1,
        '& .simplebar-content': { height: 1, display: 'flex', flexDirection: 'column' },
      }}
    >
      <Box sx={{ px: 2.5, py: 2, display: 'inline-flex' }}>
        <Logo />
      </Box>

      <Box sx={{ mb: 2, mx: 1 }}>
        <Link underline="none">
          <StyledAccount>
          <StringAvatar string={displayName} />

            <Box sx={{ ml: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                {/* {account.displayName} */}
                {displayName}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {role}
              </Typography>
            </Box>
          </StyledAccount>
        </Link>
      </Box>

      <NavSection data={navConfig} />

      <Box sx={{ flexGrow: 1 }} />

      <Box sx={{ px: 2.5, pb: 3, mt: 5 }}>
        <Stack
          spacing={1.5}
          sx={{
            p: 2,
            borderRadius: 2,
            position: 'relative',
            background: `linear-gradient(to right bottom,${PRIMARY_DARK}, ${PRIMARY_MAIN})`,
            boxShadow: '0 4px 12px rgba(121, 40, 202, 0.15)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to right, rgba(255,255,255,0.1), rgba(255,255,255,0))',
            }}
          />
          
          <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 600, position: 'relative' }}>
            Get more features
          </Typography>
          
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.85)', position: 'relative' }}>
            Upgrade to unlock premium features
          </Typography>

          <Link 
            href="https://www.exapp.online" 
            target="_blank" 
            sx={{ 
              textDecoration: 'none',
              display: 'inline-block',
              width: '100%',
              position: 'relative'
            }}
          >
            <Button
              variant="contained"
              size="small"
              sx={{
                width: '100%',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: '#7928CA',
                '&:hover': {
                  bgcolor: 'white',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
                },
                transition: 'all 0.2s',
                textTransform: 'none',
                fontWeight: 600,
                py: 0.5
              }}
            >
              Upgrade Now
            </Button>
          </Link>
        </Stack>
      </Box>
    </Scrollbar>
  );

  return (
    <Box
      component="nav"
      sx={{
        flexShrink: { lg: 0 },
        width: { xl: NAV_WIDTH },
      }}
    >
      {isDesktop ? (
        <Drawer
        // open={openNav}
        // onClose={onCloseNav}
        // ModalProps={{
        //   keepMounted: true,
        // }}
        // PaperProps={{
        //   sx: { width: NAV_WIDTH },
        // }}
        open	
        variant="permanent"	
        PaperProps={{	
          sx: {	
            width: NAV_WIDTH,	
            bgcolor: 'background.default',	            
            borderRightStyle: 'dashed',	
          },	
        }}
      >
        {renderContent}
      </Drawer>
      ) : (
        <Drawer
          open={openNav}
          onClose={onCloseNav}
          ModalProps={{
            keepMounted: true,
          }}
          PaperProps={{
            sx: { width: NAV_WIDTH },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
