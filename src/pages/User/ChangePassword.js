import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
// @mui 
import { Grid, Card, Container, Typography, Stack, TextField, FormControl, InputAdornment, IconButton } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';
import { PostChangePassword } from '../../hooks/Api';
import MyContainer from '../../components/MyContainer';

// components 

// ----------------------------------------------------------------------

export default function ChangePassword() {
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false
    });

    const handleClickShowPassword = (field) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleSubmit = async (e) => {
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
            setLoadingFull(false);
        }
    };

    const passwordField = (value, setValue, error, label, showPass, field) => (
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
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            onClick={() => handleClickShowPassword(field)}
                            edge="end"
                            size="small"
                        >
                            {showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </InputAdornment>
                ),
            }}
            sx={{
                '& .MuiOutlinedInput-root': {
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
    );

    return (
        <>
            <Helmet>
                <title> Change Password </title>
            </Helmet>

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h4" sx={{ 
                    color: 'primary.main',
                    fontWeight: 600,
                    fontSize: '1.5rem',
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -4,
                        left: 0,
                        width: '40px',
                        height: '3px',
                        backgroundColor: 'primary.main',
                        borderRadius: '2px',
                    }
                }}>
                    Change Password
                </Typography>
            </Stack>

            <Grid container>
                <Grid item xs={12} md={6}>
                    <MyContainer>
                        <Stack 
                            spacing={1} 
                            component="form" 
                            onSubmit={handleSubmit}
                            sx={{ p: 2 }}
                        >
                            <Grid container spacing={1.5}>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        {passwordField(oldPass, setOldPass, errors.oldPass, "Current Password", showPassword.old, 'old')}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        {passwordField(newPass, setNewPass, errors.newPass, "New Password", showPassword.new, 'new')}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        {passwordField(confirmPass, setConfirmPass, errors.confirmPass, "Confirm Password", showPassword.confirm, 'confirm')}
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12}>
                                    <LoadingButton 
                                        variant="contained" 
                                        fullWidth 
                                        size="medium" 
                                        onClick={handleSubmit}
                                        sx={{
                                            mt: 1,
                                            py: 1,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Update Password
                                    </LoadingButton>
                                </Grid>
                            </Grid>
                        </Stack>
                    </MyContainer>
                </Grid>
            </Grid>
        </>
    );
}
