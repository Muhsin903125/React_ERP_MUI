// LoginForm.js
// This component renders the login form for the application, handling user authentication and the 'Remember Me' feature.
// It uses Material UI components and custom hooks for authentication and toast notifications.

import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Link as Alink, 
  Stack, 
  IconButton, 
  Typography, 
  InputAdornment, 
  Card, 
  TextField, 
  Checkbox, 
  FormControlLabel,
  Box,
  Container,
  Alert,
  useTheme,
  alpha,
  Fade,
  Slide,
  styled
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { useToast } from '../../../hooks/Common';
import Iconify from '../../../components/iconify';
import Logo from '../../../components/logo';
import { AuthContext } from '../../../App';
import { PostLogin } from '../../../hooks/Api';
import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, 
    ${theme.palette.primary.main}25 0%, 
    ${theme.palette.primary.light}15 25%, 
    ${theme.palette.background.default} 50%, 
    ${theme.palette.secondary.light}15 75%, 
    ${theme.palette.secondary.main}25 100%
  )`,
  
  // Mobile-specific brighter background
  [theme.breakpoints.down('md')]: {
    background: `linear-gradient(135deg, 
      ${theme.palette.primary.main}15 0%, 
      ${theme.palette.primary.light}08 25%, 
      ${alpha(theme.palette.background.paper, 0.95)} 50%, 
      ${theme.palette.secondary.light}08 75%, 
      ${theme.palette.secondary.main}15 100%
    )`,
  },
  
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
    opacity: 0.2,
    zIndex: 0,
    
    // Lighter opacity for mobile
    [theme.breakpoints.down('md')]: {
      opacity: 0.1,
    },
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
    
    // Lighter gradients for mobile
    [theme.breakpoints.down('md')]: {
      background: `radial-gradient(circle at 20% 20%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%), 
                   radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
    },
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
  
  // Mobile-specific bright background
  [theme.breakpoints.down('md')]: {
    background: `${alpha(theme.palette.background.paper, 0.85)}`,
    backdropFilter: 'blur(10px)',
    
    borderRadius: 16,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `
      0 8px 32px ${alpha(theme.palette.common.black, 0.06)},
      0 4px 16px ${alpha(theme.palette.common.black, 0.04)}
    `,
    minHeight: '300px',
    marginTop: '20vh',
    padding: theme.spacing(2, 2),
    alignItems: 'center',  
    textAlign: 'center',
  },
  
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

/**
 * LoginForm component handles user login, including:
 * - Input fields for username/email and password
 * - 'Remember Me' functionality (stores credentials in localStorage)
 * - Password visibility toggle
 * - Calls API for authentication and manages login state
 * - Shows toast notifications for success/error
 */
export default function LoginForm() {
  const theme = useTheme();
  // Toast notification hook
  const { showToast } = useToast();
  // Context for global loading state
  const { setLoadingFull } = useContext(AuthContext);
  // Custom authentication hook
  const { login, logout } = useAuth();
  // React Router navigation
  const navigate = useNavigate();

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State for 'Remember Me' checkbox
  const [rememberMe, setRememberMe] = useState(false);
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for form errors
  const [errors, setErrors] = useState({});
  // Ref for focusing the user input
  const userRef = useRef();

  // State for user/email input, initialized from localStorage if available
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) setRememberMe(true);
    return savedUser || '';
  });
  // State for password input, initialized from localStorage if available
  const [pwd, setPwd] = useState(() => {
    const savedPwd = localStorage.getItem('rememberedPassword');
    return savedPwd || '';
  });

  // Focus the user input on mount
  useEffect(() => {
    userRef.current.focus();
  }, []);
  /**
   * Handles the login button click event.
   * Calls the login API, manages localStorage for credentials,
   * updates authentication context, and navigates on success.
   */
  const handleClick = async () => {
    // Basic validation
    const newErrors = {};
    if (!user.trim()) {
      newErrors.user = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(user)) {
      newErrors.user = 'Please enter a valid email address';
    }
    if (!pwd.trim()) {
      newErrors.pwd = 'Password is required';
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setLoadingFull(true);
    try {
      const { Success, Data, Message } = await PostLogin(JSON.stringify({ username: user, password: pwd }));
      if (Success) {
        // Store or clear credentials based on 'Remember Me'
        if (rememberMe) {
          localStorage.setItem('rememberedUser', user);
          localStorage.setItem('rememberedPassword', pwd);
        } else {
          localStorage.removeItem('rememberedUser');
          localStorage.removeItem('rememberedPassword');
        }
        // Extract user and company info from API response
        const {
          accessToken,
          refreshToken,
          firstName,
          lastName,
          email,
          profileImg,
          expiration,
          userName,
          role,
          companyCode,
          companyName,
          companyLogo,
          companyLogoURL,
          companyAddress,
          companyPhone,
          companyEmail,
          companyWebsite,
          companyTRN
        } = Data || {};
        // Update authentication context
        login(
          userName,
          accessToken,
          refreshToken,
          expiration,
          firstName,
          lastName,
          profileImg,
          email,
          role,
          companyCode,
          companyName,
          companyLogo,
          companyLogoURL,
          companyAddress,
          companyPhone,
          companyEmail,
          companyWebsite,
          companyTRN
        );

        // Get the redirect URL from sessionStorage
        const redirectUrl = sessionStorage.getItem('redirectUrl');
        // Navigate to the redirect URL if it exists, otherwise go to home
        navigate(redirectUrl || '/', { replace: true });
        // Clear the redirect URL from sessionStorage
        sessionStorage.removeItem('redirectUrl');
        
        showToast(Message, 'success');
      } else {
        logout();
        showToast(Message, 'error');
      }
    } finally {
      setIsSubmitting(false);
      setLoadingFull(false);
    }
  };  return (
    <StyledRoot>
      {/* Floating Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: '50%',
          top: '10%',
          right: '15%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          animation: 'float 6s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translateY(0px) rotate(0deg)',
            },
            '50%': {
              transform: 'translateY(-20px) rotate(180deg)',
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 60,
          height: 60,
          borderRadius: '50%',
          bottom: '20%',
          left: '10%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          animation: 'float 6s ease-in-out infinite',
          animationDelay: '2s',
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translateY(0px) rotate(0deg)',
            },
            '50%': {
              transform: 'translateY(-20px) rotate(180deg)',
            },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          top: '60%',
          right: '8%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
          animation: 'float 6s ease-in-out infinite',
          animationDelay: '4s',
          '@keyframes float': {
            '0%, 100%': {
              transform: 'translateY(0px) rotate(0deg)',
            },
            '50%': {
              transform: 'translateY(-20px) rotate(180deg)',
            },
          },
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 10 }}>
        <Slide direction="up" in timeout={1000}>
          <StyledContent>
            {/* Welcome Header */}
            <Fade in timeout={1200} style={{ transitionDelay: '200ms' }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box sx={{ mb: 3 }}>
                  <Logo 
                    sx={{
                      width: 120,
                      mx: 'auto',
                      mb: 2
                    }}
                  />
                </Box>
                
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
                  Welcome to Exapp
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
                <form onSubmit={(e) => { e.preventDefault(); handleClick(); }}>
                  <Stack spacing={3}>
                    {/* Email Input */}
                    <TextField
                      name="email"
                      id="email"
                      autoComplete="email"
                      onChange={e => {
                        setUser(e.target.value);
                        if (errors.user) setErrors(prev => ({ ...prev, user: '' }));
                      }}
                      value={user}
                      required
                      fullWidth
                      label="Email Address"
                      type="email"
                      error={!!errors.user}
                      helperText={errors.user}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'primary.main',
                        },
                      }}
                    />

                    {/* Password Input */}
                    <TextField
                      name="password"
                      label="Password"
                      onChange={e => {
                        setPwd(e.target.value);
                        if (errors.pwd) setErrors(prev => ({ ...prev, pwd: '' }));
                      }}
                      value={pwd}
                      ref={userRef}
                      required
                      fullWidth
                      error={!!errors.pwd}
                      helperText={errors.pwd}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton 
                              onClick={() => setShowPassword(!showPassword)} 
                              edge="end"
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                }
                              }}
                            >
                              {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          '&:hover fieldset': {
                            borderColor: 'primary.main',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'primary.main',
                            borderWidth: '2px',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: 'primary.main',
                        },
                      }}
                    />

                    {/* Remember Me and Forgot Password */}
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            name="rememberMe"
                            sx={{
                              color: 'primary.main',
                              '&.Mui-checked': {
                                color: 'primary.main',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="body2" color="text.secondary">
                            Remember me
                          </Typography>
                        }
                      />
                      <Link 
                        to="/forgotpassword" 
                        style={{ textDecoration: 'none' }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'primary.main',
                            fontWeight: 600,
                            '&:hover': {
                              color: 'primary.dark',
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Forgot password?
                        </Typography>
                      </Link>
                    </Stack>

                    {/* Login Button */}
                    <LoadingButton 
                      fullWidth 
                      size="large" 
                      type="submit" 
                      variant="contained"
                      loading={isSubmitting}
                      startIcon={<LoginIcon />}
                      onClick={handleClick}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          transform: 'translateY(-1px)',
                          boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&.Mui-disabled': {
                          background: alpha(theme.palette.grey[500], 0.3),
                          transform: 'none',
                          boxShadow: 'none'
                        }
                      }}
                    >
                      Sign In
                    </LoadingButton>
                  </Stack>
                </form>
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
                  © 2025 Exapp. All rights reserved.
                </Typography>
              </Box>
            </Fade>
          </StyledContent>
        </Slide>
      </Container>
    </StyledRoot>
  );
}
