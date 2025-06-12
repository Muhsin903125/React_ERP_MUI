import { Helmet } from 'react-helmet-async';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { 
  Container, 
  Box, 
  Typography, 
  useTheme,
  Fade,
  Slide
} from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/logo';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}15 0%, 
    ${theme.palette.primary.light}08 25%, 
    ${theme.palette.background.default} 50%, 
    ${theme.palette.secondary.light}08 75%, 
    ${theme.palette.secondary.main}15 100%
  )`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `url(${process.env.REACT_APP_ROOT}/assets/illustrations/LoginBG.svg)`,
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    opacity: 0.3,
    zIndex: 0,
  },
  
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%), 
                 radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
    zIndex: 1,
  },
  
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

const StyledContent = styled('div')(({ theme }) => ({
  position: 'relative',
  zIndex: 10,
  width: '100%',
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(8, 2),
  
  [theme.breakpoints.up('md')]: {
    minHeight: 'auto',
    padding: theme.spacing(6, 4),
    background: `${alpha(theme.palette.background.paper, 0.9)}`,
    backdropFilter: 'blur(20px)',
    borderRadius: 24,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `
      0 24px 48px ${alpha(theme.palette.common.black, 0.08)},
      0 12px 24px ${alpha(theme.palette.common.black, 0.04)},
      inset 0 1px 0 ${alpha(theme.palette.common.white, 0.1)}
    `,
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(8, 6),
    maxWidth: 520,
  },
}));

const StyledLogo = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(3),
  left: theme.spacing(3),
  zIndex: 1000,
  padding: theme.spacing(1),
  // background: `${alpha(theme.palette.background.paper, 0.9)}`,
  backdropFilter: 'blur(12px)',
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  // boxShadow: `0 8px 16px ${alpha(theme.palette.common.black, 0.08)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.12)}`,
  },
  
  [theme.breakpoints.up('sm')]: {
    top: theme.spacing(4),
    left: theme.spacing(4),
    padding: theme.spacing(1.5),
  },
  
  [theme.breakpoints.up('md')]: {
    top: theme.spacing(5),
    left: theme.spacing(5),
  },
}));

const FloatingElement = styled(Box)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  animation: 'float 6s ease-in-out infinite',
  
  '&.element-1': {
    width: 100,
    height: 100,
    top: '10%',
    right: '15%',
    animationDelay: '0s',
  },
  
  '&.element-2': {
    width: 60,
    height: 60,
    bottom: '20%',
    left: '10%',
    animationDelay: '2s',
  },
  
  '&.element-3': {
    width: 80,
    height: 80,
    top: '60%',
    right: '8%',
    animationDelay: '4s',
  },
  
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px) rotate(0deg)',
    },
    '50%': {
      transform: 'translateY(-20px) rotate(180deg)',
    },
  },
}));

// ----------------------------------------------------------------------

export default function LoginPage({ Page }) {
  const mdUp = useResponsive('up', 'md');
  const theme = useTheme();

  return (
    <>
      <Helmet>
        <title> Login | Exapp ERP </title>
      </Helmet>

      <StyledRoot>
        {/* Floating Background Elements */}
        <FloatingElement className="element-1" />
        <FloatingElement className="element-2" />
        <FloatingElement className="element-3" />
        
        {/* Logo */}
        <Fade in timeout={800}>
          <StyledLogo>
            <Logo sx={{   height: { xs: 32, sm: 40,md: 48 } }} />
          </StyledLogo>
        </Fade>

        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
          <Slide direction="up" in timeout={1000}>
            <StyledContent>
              {/* Welcome Header */}
              <Fade in timeout={1200} style={{ transitionDelay: '200ms' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: 28, sm: 32, md: 36 },
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    Welcome Back
                  </Typography>
                  
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: { xs: 14, sm: 16 },
                      fontWeight: 400,
                      opacity: 0.8,
                    }}
                  >
                    Sign in to your account to continue
                  </Typography>
                </Box>
              </Fade>

              {/* Login Form */}
              <Fade in timeout={1400} style={{ transitionDelay: '400ms' }}>
                <Box>
                  {Page && <Page />}
                </Box>
              </Fade>

              {/* Footer */}
              <Fade in timeout={1600} style={{ transitionDelay: '600ms' }}>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      opacity: 0.6,
                      fontSize: 12,
                    }}
                  >
                    © 2025 Exapp. Secure and reliable ERP solution.
                  </Typography>
                </Box>
              </Fade>
            </StyledContent>
          </Slide>
        </Container>
      </StyledRoot>
    </>
  );
}
