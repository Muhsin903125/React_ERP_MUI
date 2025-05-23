// LoginForm.js
// This component renders the login form for the application, handling user authentication and the 'Remember Me' feature.
// It uses Material UI components and custom hooks for authentication and toast notifications.

import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Link as Alink, Stack, IconButton, Typography, InputAdornment, Card, TextField, Checkbox, FormControlLabel } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useToast } from '../../../hooks/Common';
import Iconify from '../../../components/iconify';
import { AuthContext } from '../../../App';
import { PostLogin } from '../../../hooks/Api';
import useAuth from '../../../hooks/useAuth';

/**
 * LoginForm component handles user login, including:
 * - Input fields for username/email and password
 * - 'Remember Me' functionality (stores credentials in localStorage)
 * - Password visibility toggle
 * - Calls API for authentication and manages login state
 * - Shows toast notifications for success/error
 */
export default function LoginForm() {
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
      setLoadingFull(false);
    }
  };

  return (
    <Card>
      <Stack m={2.5}>
        <Stack spacing={3}>
          <Typography variant="h3" sx={{ px: 1, mt: 2, mb: 2 }}>
            Login
          </Typography>
          {/* User/Email input */}
          <TextField
            name="email"
            id="email"
            autoComplete="off"
            onChange={e => setUser(e.target.value)}
            value={user}
            required
            label="Email address"
          />
          {/* Password input with visibility toggle */}
          <TextField
            name="password"
            label="Password"
            onChange={e => setPwd(e.target.value)}
            value={pwd}
            ref={userRef}
            required
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
        {/* Remember Me and Forgot Password */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
          <FormControlLabel
            size="small"
            control={
              <Checkbox
                size="small"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                name="rememberMe"
              />
            }
            label="Remember me"
          />
          <Alink variant="subtitle2" underline="hover" size="small">
            <Link to="/forgotpassword">Forgot password?</Link>
          </Alink>
        </Stack>
        {/* Login button */}
        <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
          Login
        </LoadingButton>
      </Stack>
    </Card>
  );
}
