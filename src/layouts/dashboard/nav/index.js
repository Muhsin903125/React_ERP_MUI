import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { 
  Box, 
  Link, 
  Button, 
  Drawer, 
  Typography, 
  Avatar, 
  Stack, 
  useTheme,
  Divider,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Settings, 
  Logout, 
  Notifications,
  AccountCircle,
  StarBorder
} from '@mui/icons-material';
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
  padding: theme.spacing(1, 1.5),
  borderRadius: 12,
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.primary.light, 0.05)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  backdropFilter: 'blur(8px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)}, transparent)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
    
    '&:before': {
      opacity: 1,
    },
  },
}));

const StyledBrand = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1.5, 2),
  position: 'relative',
  
  '&:after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: theme.spacing(2),
    right: theme.spacing(2),
    height: 1,
    background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.3)}, transparent)`,
  },
}));

const StyledUpgradeCard = styled(Stack)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(1.5), // Reduced from 2.5 to 1.5
  borderRadius: 12, // Reduced from 20 to 12
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.25)}`, // Reduced shadow
  overflow: 'hidden',
  
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
    backdropFilter: 'blur(6px)',
  },
  
  '&:after': {
    content: '""',
    position: 'absolute',
    top: -30, // Reduced from -50
    right: -30, // Reduced from -50
    width: 60, // Reduced from 100
    height: 60, // Reduced from 100
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.08)}, transparent)`,
  },
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
  }, [pathname]);  const renderContent = (
    <Box
      sx={{
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.background.paper,
      }}
    >
      <Scrollbar
        sx={{
          flex: 1,
          '& .simplebar-content': { 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: '100%',
          },
        }}
      >{/* Brand Section */}
      <StyledBrand sx={{ py: 1.5, px: 2 }}>
        <Logo sx={{ width: 32, height: 32 }} />
      </StyledBrand>

      {/* User Account Section */}
      <Box sx={{ mb: 1.5, mx: 1.5 }}>
        <Link underline="none">
          <StyledAccount sx={{ p: 1.5, borderRadius: 2 }}>            <Box sx={{ position: 'relative' }}>
              <StringAvatar string={displayName} sx={{ width: 32, height: 32 }} />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  border: 2,
                  borderColor: 'background.paper',
                }}
              />
            </Box>

            <Box sx={{ ml: 2, flex: 1 }}>
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  color: 'text.primary',
                  fontWeight: 600,
                  lineHeight: 1.2,
                  fontSize: 13,
                }}
              >
                {displayName}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Chip
                  size="small"
                  label={role}
                  sx={{
                    height: 16,
                    fontSize: 9,
                    fontWeight: 500,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: 'primary.main',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                />
              </Box>
            </Box>

            <IconButton
              size="small"
              sx={{
                color: 'text.secondary',
                p: 0.5,
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <AccountCircle fontSize="small" />
            </IconButton>
          </StyledAccount>        </Link>
      </Box>      <Divider sx={{ mx: 2, mb: 1, opacity: 0.6 }} />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, px: 1 }}>
        <NavSection data={navConfig} />
      </Box>      <Box sx={{ flexGrow: 1 }} />
      </Scrollbar>

      {/* Bottom Section - Always at bottom */}
      <Box sx={{ mt: 'auto' }}>
        {/* Upgrade Section */}
        <Box sx={{ px: 1.5, pb: 0.5, mt: 1.5 }}>
          <StyledUpgradeCard spacing={1}>
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: 'white', 
                  fontWeight: 700,
                  fontSize: 12,
                  mb: 0.25,
                }}
              >
                ✨ Premium
              </Typography>
              
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: 1.3,
                  mb: 1,
                  fontSize: 10,
                }}
              >
                Advanced features & support
              </Typography>

              <Link 
                href="https://www.exapp.online" 
                target="_blank" 
                sx={{ 
                  textDecoration: 'none',
                  display: 'block',
                }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.95)',
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    py: 0.5,
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontSize: 10,
                    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)',
                    '&:hover': {
                      bgcolor: 'white',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Upgrade
                </Button>
              </Link>
            </Box>
          </StyledUpgradeCard>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 2, pb: 1, mt: 0.5 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              opacity: 0.7,
              display: 'block',
              textAlign: 'center',
              fontSize: 9,
            }}
          >
            © 2025 Exapp. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
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
          open	
          variant="permanent"          PaperProps={{	
            sx: {	
              width: NAV_WIDTH,	
              bgcolor: 'background.paper',	            
              borderRightStyle: 'dashed',
              borderRight: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
              boxShadow: `0 0 20px ${alpha(theme.palette.common.black, 0.05)}`,
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
          }}          PaperProps={{
            sx: { 
              width: NAV_WIDTH,
              bgcolor: 'background.paper',
            },
          }}
        >
          {renderContent}
        </Drawer>
      )}
    </Box>
  );
}
