import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
// @mui 
import { 
  Grid, 
  Card, 
  Container, 
  Typography, 
  Stack, 
  TextField, 
  FormControl, 
  InputAdornment, 
  IconButton,
  Box,
  Paper,
  Divider,
  Alert,
  LinearProgress,
  Chip,
  useTheme,
  alpha
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { 
  Visibility, 
  VisibilityOff, 
  Security,
  CheckCircle,
  Cancel,
  Shield,
  Key,
  Lock
} from '@mui/icons-material';
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';
import { PostChangePassword } from '../../hooks/Api';
import MyContainer from '../../components/MyContainer';

// components 

// ----------------------------------------------------------------------

export default function ChangePassword() {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const theme = useTheme();
    const { setLoadingFull } = useContext(AuthContext);
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

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

    const passwordStrength = getPasswordStrength(newPass);

    const handleClickShowPassword = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };    const handleSubmit = async (e) => {
        e.preventDefault();
        const errors = {};

        // Validation checks
        if (!oldPass) {
            errors.oldPass = "Enter Current Password";
        }
        if (!newPass) {
            errors.newPass = "Enter New Password";
        } else if (newPass.length < 6) {
            errors.newPass = "Password should have at least 6 characters";
        }
        if (!confirmPass) {
            errors.confirmPass = "Enter Confirm Password";
        } else if (newPass !== confirmPass) {
            errors.confirmPass = "New Password and Confirm Password do not match";
        }
        if (oldPass === newPass) {
            errors.newPass = "New Password must be different from Current Password";
        }

        setErrors(errors);
        
        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSubmitting(true);
        setLoadingFull(true);
        const storedUsername = sessionStorage.getItem("username");
        const payload = {
            Username: storedUsername,
            OldPassword: oldPass,
            Password: confirmPass,
        };

        try {
            const { Success, Message } = await PostChangePassword(JSON.stringify(payload));
            if (Success) {
                showToast(Message, "success");
                navigate("/");
            } else {
                showToast(Message, "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setIsSubmitting(false);
            setLoadingFull(false);
        }
    };    const passwordField = (value, setValue, error, label, showPass, field, showStrength = false) => (
        <Box>
            <TextField
                variant="outlined"
                fullWidth
                size="small"
                margin="dense"
                type={showPass ? 'text' : 'password'}
                onChange={(e) => setValue(e.target.value)}
                value={value}
                error={!!error}
                helperText={error}
                label={label}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Key sx={{ color: 'primary.main', fontSize: 20 }} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => handleClickShowPassword(field)}
                                edge="end"
                                size="small"
                                sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                    }
                                }}
                            >
                                {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
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
                    '& .MuiFormHelperText-root': {
                        marginTop: 0.5,
                        marginBottom: 0
                    }
                }}
            />
            {showStrength && newPass && (
                <Box sx={{ mt: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            Password Strength:
                        </Typography>
                        <Chip
                            label={passwordStrength.label}
                            color={passwordStrength.color}
                            size="small"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={passwordStrength.score}
                        color={passwordStrength.color}
                        sx={{
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.grey[300], 0.3)
                        }}
                    />
                </Box>
            )}
        </Box>
    );    return (
        <>
            <Helmet>
                <title> Change Password | Security Settings </title>
            </Helmet>

            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Header Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 4,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -50,
                            right: -50,
                            width: 150,
                            height: 150,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                        }}
                    />
                    <Stack direction="row" alignItems="center" spacing={3}>
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                            }}
                        >
                            <Security sx={{ color: 'white', fontSize: 28 }} />
                        </Box>
                        <Box>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 700,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                }}
                            >
                                Change Password
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Update your password to keep your account secure
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                <Grid container spacing={4}>
                    {/* Password Change Form */}
                    <Grid item xs={12} md={8}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
                                backdropFilter: 'blur(20px)',
                                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.grey[500], 0.12)}`,
                            }}
                        >
                            <Box sx={{ p: 4 }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                                    <Lock sx={{ color: 'primary.main' }} />
                                    <Typography variant="h6" fontWeight={600}>
                                        Password Information
                                    </Typography>
                                </Stack>
                                
                                <Divider sx={{ mb: 3 }} />

                                <Stack 
                                    spacing={3} 
                                    component="form" 
                                    onSubmit={handleSubmit}
                                >
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                {passwordField(oldPass, setOldPass, errors.oldPass, "Current Password", showPassword.old, 'old')}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                {passwordField(newPass, setNewPass, errors.newPass, "New Password", showPassword.new, 'new', true)}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth>
                                                {passwordField(confirmPass, setConfirmPass, errors.confirmPass, "Confirm New Password", showPassword.confirm, 'confirm')}
                                            </FormControl>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                                <LoadingButton 
                                                    variant="contained" 
                                                    size="large"
                                                    loading={isSubmitting}
                                                    onClick={handleSubmit}
                                                    startIcon={<Shield />}
                                                    sx={{
                                                        px: 4,
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                                                        '&:hover': {
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                        },
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    }}
                                                >
                                                    Update Password
                                                </LoadingButton>
                                                <LoadingButton 
                                                    variant="outlined" 
                                                    size="large"
                                                    onClick={() => navigate('/')}
                                                    sx={{
                                                        px: 4,
                                                        py: 1.5,
                                                        borderRadius: 2,
                                                        borderColor: alpha(theme.palette.grey[500], 0.3),
                                                        color: theme.palette.text.secondary,
                                                        '&:hover': {
                                                            borderColor: theme.palette.primary.main,
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                            color: theme.palette.primary.main,
                                                        },
                                                    }}
                                                >
                                                    Cancel
                                                </LoadingButton>
                                            </Stack>
                                        </Grid>
                                    </Grid>
                                </Stack>
                            </Box>
                        </Card>
                    </Grid>

                    {/* Security Tips */}
                    <Grid item xs={12} md={4}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.light, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.1)}`,
                            }}
                        >
                            <Box sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                    <Shield sx={{ color: 'success.main' }} />
                                    <Typography variant="h6" fontWeight={600} color="success.main">
                                        Security Tips
                                    </Typography>
                                </Stack>

                                <Stack spacing={2}>
                                    <Alert 
                                        severity="info" 
                                        variant="outlined"
                                        sx={{ 
                                            borderRadius: 2,
                                            backgroundColor: alpha(theme.palette.info.main, 0.05)
                                        }}
                                    >
                                        Use a strong password with at least 8 characters
                                    </Alert>

                                    <Box>
                                        <Typography variant="subtitle2" gutterBottom color="text.primary" fontWeight={600}>
                                            Password Requirements:
                                        </Typography>
                                        <Stack spacing={1}>
                                            {[
                                                { text: 'At least 8 characters long', met: newPass.length >= 8 },
                                                { text: 'Contains uppercase letters', met: /[A-Z]/.test(newPass) },
                                                { text: 'Contains lowercase letters', met: /[a-z]/.test(newPass) },
                                                { text: 'Contains numbers', met: /\d/.test(newPass) },
                                                { text: 'Contains special characters', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPass) }
                                            ].map((req, index) => (
                                                <Stack key={index} direction="row" alignItems="center" spacing={1}>
                                                    {req.met ? (
                                                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                                                    ) : (
                                                        <Cancel sx={{ fontSize: 16, color: 'text.disabled' }} />
                                                    )}
                                                    <Typography 
                                                        variant="caption" 
                                                        color={req.met ? 'success.main' : 'text.secondary'}
                                                        sx={{ fontSize: '0.75rem' }}
                                                    >
                                                        {req.text}
                                                    </Typography>
                                                </Stack>
                                            ))}
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
}
