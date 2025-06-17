
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
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
    alpha,
    useTheme,
    InputAdornment,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Fade,
    Slide,
    styled
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
    Email as EmailIcon,
    VpnKey as VpnKeyIcon,
    Security as SecurityIcon,
    CheckCircle as CheckCircleIcon,
    Timer as TimerIcon,
    Refresh as RefreshIcon,
    ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useToast } from '../../hooks/Common';
// components 
import CountDownTimer from '../../components/CountDownTimer';
import Iconify from '../../components/iconify';
import { AuthContext } from '../../App';
import { PostForgotPassword, PostOTPVerify } from '../../hooks/Api';

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
    padding: theme.spacing(4, 2),

    // Mobile and small tablet responsive design
    [theme.breakpoints.down('sm')]: {
        background: `${alpha(theme.palette.background.paper, 0.9)}`,
        backdropFilter: 'blur(10px)',
        margin: theme.spacing(1, 1),
        borderRadius: 12,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `
      0 4px 20px ${alpha(theme.palette.common.black, 0.08)},
      0 2px 8px ${alpha(theme.palette.common.black, 0.04)}
    `,
        marginTop: "20vh",
        minHeight: '300px',
        padding: theme.spacing(1.5, 1.5),
        // maxWidth: 'calc(100vw - 16px)',
    },

    // Medium devices (tablets)
    [theme.breakpoints.between('sm', 'md')]: {
        background: `${alpha(theme.palette.background.paper, 0.9)}`,
        backdropFilter: 'blur(15px)',
        margin: theme.spacing(1, 2),
        borderRadius: 16,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `
      0 8px 32px ${alpha(theme.palette.common.black, 0.08)},
      0 4px 16px ${alpha(theme.palette.common.black, 0.04)}
    `,
        minHeight: 'calc(100vh - 16px)',
        padding: theme.spacing(4, 3),
        maxWidth: 600,
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
    },

    [theme.breakpoints.up('lg')]: {
        padding: theme.spacing(8, 6),
        maxWidth: 520,
    },
}));

export default function ForgotPassword() {
    const theme = useTheme();

    const GenerateRandomKey = (min, max) => {
        return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
    }

    const { showToast } = useToast();
    const navigate = useNavigate()
    const { setLoadingFull } = useContext(AuthContext)
    const [OTPKey, setOTPKey] = useState(GenerateRandomKey(1111111, 9999999))
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [resetTimer, setResetTimer] = useState(-1);
    const [errMsg, setErrMsg] = useState('');
    const [isOtpSend, setIsOtpSend] = useState(false);
    const [isTimerEnable, setIsTimerEnable] = useState(false);
    const [isResendEnable, setIsResendEnable] = useState(false);
    const [hoursMinSecs, sethoursMinSecs] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const usernameRef = useRef();
    const otpRef = useRef();
    const errRef = useRef();
    useEffect(() => {
        usernameRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [username, otp]);

    const SendOtp = async (e) => {
        e.preventDefault();

        try {
            if (validator.isEmpty(username) || !validator.isEmail(username)) {
                setErrMsg("Enter Valid Email");
                showToast("Enter Valid Email", "warning")
                usernameRef.current.focus();
            } else {
                setIsSubmitting(true);
                setLoadingFull(true);
                const { Success, Data, Message } = await PostForgotPassword(JSON.stringify({ "Username": username, "OTPKey": OTPKey }));
                if (Success) {
                    setResetTimer(resetTimer + 1);
                    const minutes1 = 1;
                    const seconds1 = 0;
                    const resetTimer1 = 0;
                    const withHour1 = false;
                    sethoursMinSecs({ minutes1, seconds1, withHour1, resetTimer1 });

                    setIsOtpSend(true);// for enable timer
                    setActiveStep(1);
                    setIsResendEnable(false)
                    setIsTimerEnable(true);
                    setTimeout(
                        () => {
                            setIsResendEnable(true)
                            setIsTimerEnable(false);
                        },
                        60000
                    );
                    showToast(Message, "success")
                    setTimeout(() => otpRef.current?.focus(), 100);
                }
                else {
                    setOTPKey(GenerateRandomKey(1111111, 9999999));
                    usernameRef.current.focus();
                    showToast(Message, "error");
                }
            }
        }
        finally {
            setIsSubmitting(false);
            setLoadingFull(false);
        }
    };

    const VerifyOtp = async (e) => {
        e.preventDefault();

        try {
            if (validator.isEmpty(otp)) {
                showToast("OTP is required", "warning")
                setErrMsg("Enter OTP");
                otpRef.current.focus();
            } else {
                setIsSubmitting(true);
                setLoadingFull(true)
                const { Success, Data, Message } = await PostOTPVerify(JSON.stringify({ "Username": username, "OTPKey": OTPKey, "OTP": otp.trim() })
                );
                if (Success) {
                    setActiveStep(2);
                    showToast(Message, "success")
                    navigate('/resetpassword', { state: { OTPKey, username } })
                }
                else {
                    showToast(Message, "error")
                    usernameRef.current.focus();
                }
            }
        }
        finally {
            setIsSubmitting(false);
            setLoadingFull(false);
        }
    };

    const steps = [
        {
            label: 'Enter Email',
            description: 'Enter your registered email address',
            icon: <EmailIcon />
        },
        {
            label: 'Verify OTP',
            description: 'Enter the OTP sent to your email',
            icon: <VpnKeyIcon />
        },
        {
            label: 'Reset Password',
            description: 'Create a new password',
            icon: <SecurityIcon />
        }
    ]; return (
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
                        {/* Header Section */}
                        <Fade in timeout={1200} style={{ transitionDelay: '200ms' }}>
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 2,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                                        }}
                                    >
                                        <SecurityIcon sx={{ color: 'white', fontSize: 20 }} />
                                    </Box>
                                </Stack>                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                        backgroundClip: 'text',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        mb: 1,
                                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' }
                                    }}
                                >
                                    Forgot Password
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                        lineHeight: { xs: 1.4, sm: 1.5 }
                                    }}
                                >
                                    Reset your password securely
                                </Typography>                                {/* Progress Stepper */}
                                <Box sx={{ mt: { xs: 3, sm: 4 } }}>
                                    <Stack
                                        direction="row"
                                        spacing={{ xs: 0.5, sm: 1, md: 2 }}
                                        alignItems="center"
                                        sx={{
                                            flexWrap: 'nowrap',
                                            overflow: 'visible',
                                            justifyContent: 'center',
                                            px: { xs: 1, sm: 0 }
                                        }}
                                    >
                                        {steps.map((step, index) => (
                                            <Stack key={index} direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }} sx={{ flex: 1, minWidth: 0 }}>
                                                <Box
                                                    sx={{
                                                        width: { xs: 28, sm: 32, md: 36 },
                                                        height: { xs: 28, sm: 32, md: 36 },
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: activeStep >= index
                                                            ? theme.palette.primary.main
                                                            : alpha(theme.palette.grey[500], 0.2),
                                                        color: activeStep >= index ? 'white' : 'text.disabled',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                        flexShrink: 0,
                                                        boxShadow: activeStep >= index
                                                            ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                                                            : 'none',
                                                    }}
                                                >
                                                    {activeStep > index ? (
                                                        <CheckCircleIcon sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }} />
                                                    ) : (
                                                        React.cloneElement(step.icon, { sx: { fontSize: { xs: 14, sm: 16, md: 18 } } })
                                                    )}
                                                </Box>
                                                {index < steps.length - 1 && (
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            height: { xs: 2, sm: 2 },
                                                            backgroundColor: activeStep > index
                                                                ? theme.palette.primary.main
                                                                : alpha(theme.palette.grey[500], 0.2),
                                                            borderRadius: 1,
                                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                            minWidth: { xs: 12, sm: 16, md: 20 },
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                        ))}
                                    </Stack>
                                </Box>
                            </Box>
                        </Fade>                        {/* Form Section */}
                        <Fade in timeout={1400} style={{ transitionDelay: '400ms' }}>
                            <Box>
                                <Stack spacing={{ xs: 2.5, sm: 3 }}>
                                    {/* Current Step Indicator */}
                                    <Alert
                                        severity="info"
                                        variant="outlined"
                                        sx={{
                                            borderRadius: { xs: 12, sm: 16 },
                                            backgroundColor: alpha(theme.palette.info.main, 0.05),
                                            '& .MuiAlert-icon': {
                                                color: 'primary.main',
                                                fontSize: { xs: 18, sm: 20 }
                                            },
                                            '& .MuiAlert-message': {
                                                width: '100%'
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
                                            {steps[activeStep]?.label}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                lineHeight: { xs: 1.3, sm: 1.4 }
                                            }}
                                        >
                                            {steps[activeStep]?.description}
                                        </Typography>
                                    </Alert>

                                    {/* Email Input Step */}
                                    {!isOtpSend && (
                                        <>                                            <TextField
                                            name="email"
                                            id="username"
                                            ref={usernameRef}
                                            autoComplete="off"
                                            onChange={(e) => setUsername(e.target.value)}
                                            value={username}
                                            required
                                            label="Email Address"
                                            type="email"
                                            fullWidth
                                            error={!!errMsg}
                                            helperText={errMsg}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <EmailIcon sx={{
                                                            color: 'primary.main',
                                                            fontSize: { xs: 18, sm: 20 }
                                                        }} />
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
                                        />                                              <LoadingButton
                                            fullWidth
                                            size="large"
                                            type="submit"
                                            variant="contained"
                                            loading={isSubmitting}
                                            onClick={SendOtp}
                                            startIcon={<EmailIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                                            sx={{
                                                py: { xs: 1.5, sm: 1.8, md: 2 },
                                                borderRadius: { xs: 12, sm: 16 },
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' },
                                                fontWeight: 600,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                },
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&.Mui-disabled': {
                                                    background: alpha(theme.palette.grey[500], 0.3),
                                                }
                                            }}
                                        >
                                                Send OTP
                                            </LoadingButton>
                                        </>
                                    )}

                                    {/* OTP Verification Step */}
                                    {isOtpSend && (
                                        <>                                            <Box>
                                            <Alert
                                                severity="success"
                                                variant="outlined"
                                                sx={{
                                                    mb: { xs: 2, sm: 2.5 },
                                                    borderRadius: { xs: 12, sm: 16 },
                                                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                                                    '& .MuiAlert-icon': {
                                                        fontSize: { xs: 18, sm: 20 }
                                                    },
                                                    py: { xs: 1, sm: 1.5 },
                                                    px: { xs: 1.5, sm: 2 }
                                                }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        fontSize: { xs: '0.875rem', sm: '1rem' },
                                                        lineHeight: { xs: 1.4, sm: 1.5 }
                                                    }}
                                                >
                                                    OTP sent successfully to <strong>{username}</strong>
                                                </Typography>
                                            </Alert>

                                            <TextField
                                                name="otp"
                                                id="OTP"
                                                label="Enter OTP"
                                                ref={otpRef}
                                                onChange={(e) => setOtp(e.target.value)}
                                                value={otp}
                                                required
                                                placeholder="Enter 6-digit OTP"
                                                fullWidth inputProps={{
                                                    maxLength: 6,
                                                    style: {
                                                        textAlign: 'center',
                                                        fontSize: window.innerWidth < 600 ? '1rem' : '1.2rem',
                                                        letterSpacing: '0.5rem'
                                                    }
                                                }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <VpnKeyIcon sx={{
                                                                color: 'primary.main',
                                                                fontSize: { xs: 18, sm: 20 }
                                                            }} />
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
                                            />                                            </Box>                                            <LoadingButton
                                                fullWidth
                                                size="large"
                                                type="submit"
                                                variant="contained"
                                                loading={isSubmitting}
                                                onClick={VerifyOtp}
                                                startIcon={<CheckCircleIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
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
                                                    }
                                                }}
                                            >
                                                Verify OTP
                                            </LoadingButton>                                            {/* Timer and Resend Section */}
                                            <Box
                                                sx={{
                                                    p: { xs: 1.5, sm: 2, md: 2.5 },
                                                    borderRadius: { xs: 12, sm: 16 },
                                                    backgroundColor: alpha(theme.palette.grey[500], 0.05),
                                                    border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                                                }}
                                            >
                                                <Stack
                                                    direction={{ xs: 'column', sm: 'row' }}
                                                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                                                    justifyContent="space-between"
                                                    spacing={{ xs: 1.5, sm: 1 }}
                                                >
                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                        <TimerIcon sx={{
                                                            fontSize: { xs: 16, sm: 18 },
                                                            color: 'text.secondary'
                                                        }} />
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                            sx={{
                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                                fontWeight: 500
                                                            }}
                                                        >
                                                            {isTimerEnable ? 'OTP expires in:' : 'OTP expired'}
                                                        </Typography>
                                                    </Stack>

                                                    {isTimerEnable && (
                                                        <Chip
                                                            icon={<TimerIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />}
                                                            label={<CountDownTimer hoursMinSecs={hoursMinSecs} />}
                                                            size="small"
                                                            color="warning"
                                                            sx={{
                                                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                                height: { xs: 24, sm: 28 }
                                                            }}
                                                        />
                                                    )}

                                                    {isResendEnable && (
                                                        <LoadingButton
                                                            variant="text"
                                                            size="small"
                                                            startIcon={<RefreshIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                                                            onClick={SendOtp}
                                                            sx={{
                                                                color: 'primary.main',
                                                                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                                fontWeight: 600,
                                                                py: { xs: 0.5, sm: 0.75 },
                                                                px: { xs: 1, sm: 1.5 },
                                                                borderRadius: { xs: 8, sm: 12 },
                                                                '&:hover': {
                                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                                }
                                                            }}
                                                        >
                                                            Resend OTP
                                                        </LoadingButton>
                                                    )}
                                                </Stack>
                                            </Box>
                                        </>
                                    )}
                                </Stack>
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
