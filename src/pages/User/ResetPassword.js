import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { 
    Link, 
    Stack, 
    IconButton, 
    Typography, 
    Card, 
    TextField,
    Box,
    Container,
    Divider,
    Alert,
    Chip,
    LinearProgress,
    InputAdornment,
    alpha,
    useTheme,
    Fade,
    Slide,
    styled
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
    Lock as LockIcon,
    Security as SecurityIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Shield as ShieldIcon,
    ArrowBack as ArrowBackIcon,
    Key as KeyIcon
} from '@mui/icons-material';
import { useToast } from '../../hooks/Common';
// components 
import CountDownTimer from '../../components/CountDownTimer';
import Iconify from '../../components/iconify'; 
import { AuthContext } from '../../App';
import { PostResetPassword } from '../../hooks/Api';

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
  margin: '0 auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  padding: theme.spacing(4, 2),
  
  // Mobile and small tablet responsive design
  [theme.breakpoints.down('sm')]: {
    background: `${alpha(theme.palette.background.paper, 0.9)}`,
    backdropFilter: 'blur(10px)',
    // marginTop: '10vh',
    borderRadius: 12,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `
      0 4px 20px ${alpha(theme.palette.common.black, 0.08)},
      0 2px 8px ${alpha(theme.palette.common.black, 0.04)}
    `,
    minHeight: '300px',
    padding: theme.spacing(2, 2),
    maxWidth: 'calc(100vw - 16px)',
    alignSelf: 'center',
  },
  
  // Medium devices (tablets)
  [theme.breakpoints.between('sm', 'md')]: {
    background: `${alpha(theme.palette.background.paper, 0.9)}`,
    backdropFilter: 'blur(15px)',
    margin: theme.spacing(2, 2),
    borderRadius: 16,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow: `
      0 8px 32px ${alpha(theme.palette.common.black, 0.08)},
      0 4px 16px ${alpha(theme.palette.common.black, 0.04)}
    `,
    minHeight: 'calc(100vh - 32px)',
    padding: theme.spacing(4, 3),
    maxWidth: 600,
    alignSelf: 'center',
  },
  
  // Desktop and larger screens
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
    alignItems: 'center',
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(8, 6),
    maxWidth: 520,
  },
}));

 
export default function ResetPassword() {
    const theme = useTheme();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { setLoadingFull } = useContext(AuthContext)
    const [OTPKey] = useState(location.state?.OTPKey);
    const [username] = useState(location.state?.username);
    const [password, setpassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const passwordRef = useRef();
    const confirmpPasswordRef = useRef();
    const errRef = useRef();

    const redirectPath = location.state?.path || '/login';

    // Password strength calculation
    const getPasswordStrength = (password) => {
        if (!password) return { score: 0, label: '', color: 'default' };
        
        let score = 0;
        const checks = {
            length: password.length >= 8,
            lowercase: /[a-z]/.test(password),
            uppercase: /[A-Z]/.test(password),
            numbers: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        score = Object.values(checks).filter(Boolean).length;

        if (score <= 2) return { score: score * 20, label: 'Weak', color: 'error' };
        if (score === 3) return { score: score * 20, label: 'Fair', color: 'warning' };
        if (score === 4) return { score: score * 20, label: 'Good', color: 'info' };
        return { score: 100, label: 'Strong', color: 'success' };
    };

    const passwordStrength = getPasswordStrength(password);
    const passwordsMatch = password && confirmPassword && password === confirmPassword;
    useEffect(() => {
        passwordRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [confirmpPasswordRef, passwordRef])
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (password === null || password === "") {
                showToast("Password is Required", 'warning');
                setErrMsg("Password is Required");
                passwordRef.current.focus();
            }
            else if (password.length < 6) {
                showToast("Password should have 6 characters", 'warning');
                setErrMsg("Password should have 6 characters");
                passwordRef.current.focus();
            } else if (password !== confirmPassword) {
                showToast("Passwords don't match", 'warning');
                setErrMsg("Passwords don't match");
                confirmpPasswordRef.current.focus();
            }
            else {
                setIsSubmitting(true);
                setLoadingFull(true)
                const { Success, Data, Message } = await PostResetPassword( JSON.stringify({ "UserName": username, "OTPKey": OTPKey, "newPassword": password }));
                if (Success) {
                    showToast(Message, "success") 
                    navigate(redirectPath, { replace: true })
                }
                else { 
                    showToast(Message, "error") 
                    errRef.current.focus();
                }
            }        } finally {
            setIsSubmitting(false);
            setLoadingFull(false);
        } 
    }
    
    return (
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

            <Container 
                maxWidth="sm" 
                sx={{ 
                    position: 'relative', 
                    zIndex: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    py: { xs: 1, sm: 2, md: 0 }
                }}
            >
                <Slide direction="up" in timeout={1000}>
                    <StyledContent>
                        {/* Header Section */}
                        <Fade in timeout={1200} style={{ transitionDelay: '200ms' }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.3)}`
                                        }}
                                    >
                                        <ShieldIcon sx={{ color: 'white', fontSize: 20 }} />
                                    </Box>
                                </Stack>                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 700,
                                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 1,
                                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
                                    }}
                                >
                                    Reset Password
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    color="text.secondary"
                                    sx={{ 
                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                        lineHeight: { xs: 1.4, sm: 1.5 }
                                    }}
                                >
                                    Create a new secure password for your account
                                </Typography>                                {/* User Info Alert */}
                                <Alert 
                                    severity="info" 
                                    variant="outlined"
                                    sx={{ 
                                        mt: { xs: 2.5, sm: 3 },
                                        borderRadius: { xs: 12, sm: 16 },
                                        backgroundColor: alpha(theme.palette.info.main, 0.05),
                                        '& .MuiAlert-icon': {
                                            color: 'primary.main',
                                            fontSize: { xs: 18, sm: 20 }
                                        },
                                        py: { xs: 1, sm: 1.5 },
                                        px: { xs: 1.5, sm: 2 }
                                    }}
                                >
                                    <Typography 
                                        variant="body2" 
                                        fontWeight={600}
                                        sx={{ 
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            lineHeight: { xs: 1.4, sm: 1.5 }
                                        }}
                                    >
                                        Resetting password for: {username}
                                    </Typography>
                                    <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ 
                                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                            lineHeight: { xs: 1.3, sm: 1.4 }
                                        }}
                                    >
                                        You're almost done! Just create a new password below.
                                    </Typography>
                                </Alert>
                            </Box>
                        </Fade>                        {/* Form Section */}
                        <Fade in timeout={1400} style={{ transitionDelay: '400ms' }}>
                            <Box>
                                <form onSubmit={handleSubmit}>
                                    <Stack spacing={{ xs: 2.5, sm: 3 }}>
                                        {/* Error Alert */}
                                        {errMsg && (
                                            <Alert 
                                                severity="error" 
                                                variant="outlined"
                                                sx={{ 
                                                    borderRadius: { xs: 12, sm: 16 },
                                                    backgroundColor: alpha(theme.palette.error.main, 0.05),
                                                    '& .MuiAlert-icon': {
                                                        fontSize: { xs: 18, sm: 20 }
                                                    },
                                                    py: { xs: 1, sm: 1.5 },
                                                    px: { xs: 1.5, sm: 2 },
                                                    '& .MuiAlert-message': {
                                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                                    }
                                                }}
                                            >
                                                {errMsg}
                                            </Alert>
                                        )}                                        {/* New Password Field */}
                                        <Box>
                                            <TextField 
                                                id="password"
                                                ref={passwordRef}
                                                autoComplete="new-password"
                                                type={showPassword ? 'text' : 'password'}
                                                onChange={(e) => setpassword(e.target.value)}
                                                value={password}
                                                required
                                                fullWidth
                                                label="New Password"
                                                placeholder="Enter your new password"
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <KeyIcon sx={{ 
                                                                color: 'primary.main', 
                                                                fontSize: { xs: 18, sm: 20 } 
                                                            }} />
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
                                                        borderRadius: { xs: 12, sm: 16 },
                                                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                                        '&:hover fieldset': {
                                                            borderColor: 'primary.main',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: 'primary.main',
                                                            borderWidth: '2px',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                                        '&.Mui-focused': {
                                                            color: 'primary.main',
                                                        }
                                                    },
                                                }}
                                            />                                            
                                            {/* Password Strength Indicator */}
                                            {password && (
                                                <Box sx={{ mt: { xs: 1, sm: 1.5 } }}>
                                                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                                                        <Typography 
                                                            variant="caption" 
                                                            color="text.secondary"
                                                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                                        >
                                                            Password Strength:
                                                        </Typography>
                                                        <Chip
                                                            label={passwordStrength.label}
                                                            color={passwordStrength.color}
                                                            size="small"
                                                            sx={{ 
                                                                fontSize: { xs: '0.65rem', sm: '0.7rem' }, 
                                                                height: { xs: 18, sm: 20 } 
                                                            }}
                                                        />
                                                    </Stack>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={passwordStrength.score}
                                                        color={passwordStrength.color}
                                                        sx={{
                                                            height: { xs: 3, sm: 4 },
                                                            borderRadius: 2,
                                                            backgroundColor: alpha(theme.palette.grey[300], 0.3)
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Box>                                        {/* Confirm Password Field */}
                                        <Box>
                                            <TextField 
                                                id="confirmPassword"
                                                ref={confirmpPasswordRef}
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                autoComplete="new-password"
                                                onChange={(e) => setconfirmPassword(e.target.value)}
                                                value={confirmPassword}
                                                required
                                                fullWidth
                                                label="Confirm New Password"
                                                placeholder="Confirm your new password"
                                                error={confirmPassword && !passwordsMatch}
                                                helperText={confirmPassword && !passwordsMatch ? "Passwords don't match" : ""}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <LockIcon sx={{ 
                                                                color: 'primary.main', 
                                                                fontSize: { xs: 18, sm: 20 } 
                                                            }} />
                                                        </InputAdornment>
                                                    ),
                                                    endAdornment: (
                                                        <InputAdornment position="end">
                                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                                {confirmPassword && (
                                                                    passwordsMatch ? (
                                                                        <CheckCircleIcon sx={{ 
                                                                            color: 'success.main', 
                                                                            fontSize: { xs: 18, sm: 20 } 
                                                                        }} />
                                                                    ) : (
                                                                        <CancelIcon sx={{ 
                                                                            color: 'error.main', 
                                                                            fontSize: { xs: 18, sm: 20 } 
                                                                        }} />
                                                                    )
                                                                )}
                                                                <IconButton
                                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                    edge="end"
                                                                    sx={{
                                                                        color: 'primary.main',
                                                                        '&:hover': {
                                                                            backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                                                        }
                                                                    }}
                                                                >
                                                                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                                                </IconButton>
                                                            </Stack>
                                                        </InputAdornment>
                                                    ),
                                                }}
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: { xs: 12, sm: 16 },
                                                        backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                                        '&:hover fieldset': {
                                                            borderColor: 'primary.main',
                                                        },
                                                        '&.Mui-focused fieldset': {
                                                            borderColor: 'primary.main',
                                                            borderWidth: '2px',
                                                        },
                                                    },
                                                    '& .MuiInputLabel-root': {
                                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                                        '&.Mui-focused': {
                                                            color: 'primary.main',
                                                        }
                                                    },
                                                    '& .MuiFormHelperText-root': {
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
                                                    }
                                                }}
                                            />
                                        </Box>                                        {/* Password Requirements */}
                                        <Box
                                            sx={{
                                                p: { xs: 1.5, sm: 2, md: 2.5 },
                                                borderRadius: { xs: 12, sm: 16 },
                                                backgroundColor: alpha(theme.palette.grey[500], 0.05),
                                                border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                                            }}
                                        >
                                            <Typography 
                                                variant="subtitle2" 
                                                gutterBottom 
                                                color="text.primary" 
                                                fontWeight={600}
                                                sx={{ 
                                                    fontSize: { xs: '0.875rem', sm: '1rem' },
                                                    mb: { xs: 1, sm: 1.5 }
                                                }}
                                            >
                                                Password Requirements:
                                            </Typography>
                                            <Stack spacing={{ xs: 0.75, sm: 1 }}>
                                                {[
                                                    { text: 'At least 8 characters long', met: password.length >= 8 },
                                                    { text: 'Contains uppercase letters', met: /[A-Z]/.test(password) },
                                                    { text: 'Contains lowercase letters', met: /[a-z]/.test(password) },
                                                    { text: 'Contains numbers', met: /\d/.test(password) },
                                                    { text: 'Contains special characters', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
                                                    { text: 'Passwords match', met: passwordsMatch }
                                                ].map((req, index) => (
                                                    <Stack key={index} direction="row" alignItems="center" spacing={1}>
                                                        {req.met ? (
                                                            <CheckCircleIcon sx={{ 
                                                                fontSize: { xs: 14, sm: 16 }, 
                                                                color: 'success.main' 
                                                            }} />
                                                        ) : (
                                                            <CancelIcon sx={{ 
                                                                fontSize: { xs: 14, sm: 16 }, 
                                                                color: 'text.disabled' 
                                                            }} />
                                                        )}
                                                        <Typography 
                                                            variant="caption" 
                                                            color={req.met ? 'success.main' : 'text.secondary'}
                                                            sx={{ 
                                                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                                lineHeight: { xs: 1.2, sm: 1.3 }
                                                            }}
                                                        >
                                                            {req.text}
                                                        </Typography>
                                                    </Stack>
                                                ))}
                                            </Stack>
                                        </Box>                                        {/* Submit Button */}
                                        <LoadingButton 
                                            fullWidth 
                                            size="large" 
                                            type="submit" 
                                            variant="contained"
                                            loading={isSubmitting}
                                            startIcon={<ShieldIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                                            disabled={!password || !confirmPassword || !passwordsMatch}
                                            sx={{
                                                py: { xs: 1.5, sm: 1.8, md: 2 },
                                                borderRadius: { xs: 12, sm: 16 },
                                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                                boxShadow: `0 4px 16px ${alpha(theme.palette.success.main, 0.3)}`,
                                                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                                                fontWeight: 600,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.4)}`,
                                                },
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&.Mui-disabled': {
                                                    background: alpha(theme.palette.grey[500], 0.3),
                                                    transform: 'none',
                                                    boxShadow: 'none'
                                                }
                                            }}
                                        >
                                            Reset Password
                                        </LoadingButton>
                                    </Stack>
                                </form>
                            </Box>
                        </Fade>                        {/* Footer */}
                        <Fade in timeout={1600} style={{ transitionDelay: '600ms' }}>
                            <Box sx={{ textAlign: 'center', mt: { xs: 3, sm: 4 } }}>
                                <Divider sx={{ mb: { xs: 2, sm: 2.5 } }} />
                                
                                <Stack 
                                    direction={{ xs: 'column', sm: 'row' }} 
                                    alignItems="center" 
                                    justifyContent="center" 
                                    spacing={{ xs: 1, sm: 1 }}
                                >
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{ 
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            textAlign: { xs: 'center', sm: 'left' }
                                        }}
                                    >
                                        Remember your password?
                                    </Typography>
                                    <Link 
                                        variant="body2" 
                                        underline="hover" 
                                        onClick={() => navigate('/login')}
                                        sx={{ 
                                            fontWeight: 600,
                                            color: 'primary.main',
                                            cursor: 'pointer',
                                            fontSize: { xs: '0.875rem', sm: '1rem' },
                                            '&:hover': {
                                                color: 'primary.dark'
                                            }
                                        }}
                                    >
                                        Back to Login
                                    </Link>
                                </Stack>
                            </Box>
                        </Fade>
                    </StyledContent>
                </Slide>
            </Container>
        </StyledRoot>
    );
}
