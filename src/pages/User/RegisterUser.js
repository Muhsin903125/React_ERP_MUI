import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Stack,
  Grid,
  Box,
  Paper,
  Container,
  Divider,
  Avatar,
  Alert,
  Chip,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  useTheme,
  alpha,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import {
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import validator from 'validator';
import { GetSingleListResult, PostCommonSp, PostUserRegister } from '../../hooks/Api';
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';
import Confirm from '../../components/Confirm';
import MyContainer from '../../components/MyContainer';

const RegisterUser = () => {
  const location = useLocation();
  const user = location.state?.user;
  const navigate = useNavigate();
  const theme = useTheme();
  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast();

  const [roleList, setRoleList] = useState([]);
  const [username, setUsername] = useState(user?.email || '');
  const [firstName, setFirstname] = useState(user?.firstName || '');
  const [lastName, setLastname] = useState(user?.lastName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.roles || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const isEditing = Boolean(user?.id);

  useEffect(() => {
    fetchRoleList();
  }, []);

  async function fetchRoleList() {
    try { 
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "ROLE_CRUD",
        "TYPE": "GET_ALL",
      });
      if (Success) {
        setRoleList(Data);
      } else {
        showToast(Message, "error");
      }
    } finally {
      setLoadingFull(false);
    }
  }
  const validate = () => {
    const errors = {};

    if (!validator.isEmail(username) || validator.isEmpty(username)) {
      errors.username = 'Username should be a valid email';
    }

    if (validator.isEmpty(firstName)) {
      errors.firstName = 'First Name is required';
    }

    if (!validator.isNumeric(mobileNumber) || mobileNumber.length < 10) {
      errors.mobileNumber = 'Mobile Number should be a valid numeric value of at least 10 digits';
    }

    if (!isEditing && validator.isEmpty(password)) {
      errors.password = 'Password is required';
    } else if (!isEditing && password.length < 6) {
      errors.password = "Password should have at least 6 characters";
    }

    if (!isEditing && (!role || role === '')) {
      errors.role = 'Role is required';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

  const steps = [
    { label: 'Personal Information', icon: <PersonIcon /> },
    { label: 'Contact Details', icon: <EmailIcon /> },
    { label: 'Security Settings', icon: <SecurityIcon /> }
  ];

  const onSave = async (payload) => {
    try {
      setIsSubmitting(true);
      setLoadingFull(true);
      
      const { Success, Message } =!isEditing ? 
      await PostUserRegister(payload) :  await GetSingleListResult({
        key: "USR_CRUD",
        TYPE: isEditing ? "UPDATE" : "ADD",
        USR_FNAME: payload.FirstName,
        USR_LNAME: payload.LastName,
        USR_EMAIL: payload.Email,
          USR_MOBILE: payload.MobileNumber,
          USR_CODE: isEditing ? user.id : null
        })
      
      
      if (Success) {
        navigate('/userlist');
        showToast((isEditing ? 'User updated successfully' : 'User added successfully'), 'success');
      } else {
        showToast(Message || 'Operation failed', "error");
      }
    } finally {
      setIsSubmitting(false);
      setLoadingFull(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (validate()) {
      const payload = {
        "Email": username,
        "FirstName": firstName,
        "LastName": lastName,
        "MobileNumber": mobileNumber,
        "Password": password,
        "Roles": role.toString(),
      }
      
      Confirm('Are you sure?').then(() => onSave(payload)); 
    }
  };

  // const handleUnBlock = () => {
  //   Confirm('Are you sure to Activate this User?').then(async () => {
  //     try {
  //       setLoadingFull(true);
  //       const { Success, Message } = await PostActiveUser(user?.id);
  //       if (Success) {
  //         navigate('/userlist');
  //         showToast(Message, 'success');
  //       } else {
  //         showToast(Message, "error");
  //       }
  //     } finally {
  //       setLoadingFull(false);
  //     }
  //   });
  // };

  // const handleBlock = () => {
  //   Confirm('Are you sure to Block this User?').then(async () => {
  //     try {
  //       setLoadingFull(true);
  //       const { Success, Message } = await PostDeactiveUser(user?.id);
  //       if (Success) {
  //         navigate('/userlist');
  //         showToast(Message, 'success');
  //       } else {
  //         showToast(Message, "error");
  //       }
  //     } finally {
  //       setLoadingFull(false);
  //     }
  //   });
  // };
  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit User' : 'New User'} | User Management</title>
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
            <IconButton
              onClick={() => navigate('/userlist')}
              sx={{
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            
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
              {isEditing ? (
                <EditIcon sx={{ color: 'white', fontSize: 28 }} />
              ) : (
                <PersonAddIcon sx={{ color: 'white', fontSize: 28 }} />
              )}
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
                {isEditing ? 'Edit User' : 'Create New User'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {isEditing ? 'Update user information and settings' : 'Add a new user to the system'}
              </Typography>
            </Box>
          </Stack>

          {/* Progress Steps - Only show for new users */}
          {!isEditing && (
            <Box sx={{ mt: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((step, index) => (
                  <Step key={index}>
                    <StepLabel
                      StepIconComponent={({ active, completed }) => (
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: completed || active 
                              ? theme.palette.primary.main 
                              : alpha(theme.palette.grey[500], 0.2),
                            color: completed || active ? 'white' : 'text.disabled',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        >
                          {completed ? (
                            <CheckCircleIcon sx={{ fontSize: 20 }} />
                          ) : (
                            React.cloneElement(step.icon, { sx: { fontSize: 20 } })
                          )}
                        </Box>
                      )}
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          )}
        </Paper>

        <form onSubmit={handleSave}>
          <Grid container spacing={4}>
            {/* Main Form */}
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
                <CardContent sx={{ p: 4 }}>
                  <Stack spacing={4}>
                    {/* Personal Information Section */}
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <PersonIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>
                          Personal Information
                        </Typography>
                      </Stack>
                      <Divider sx={{ mb: 3 }} />
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="First Name"
                            variant="outlined"
                            fullWidth
                            value={firstName}
                            onChange={(e) => setFirstname(e.target.value)}
                            error={Boolean(errors.firstName)}
                            helperText={errors.firstName}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon sx={{ color: 'primary.main', fontSize: 20 }} />
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Last Name"
                            variant="outlined"
                            fullWidth
                            value={lastName}
                            onChange={(e) => setLastname(e.target.value)}
                            error={Boolean(errors.lastName)}
                            helperText={errors.lastName}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonIcon sx={{ color: 'primary.main', fontSize: 20 }} />
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
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Contact Information Section */}
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                        <EmailIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="h6" fontWeight={600}>
                          Contact Information
                        </Typography>
                      </Stack>
                      <Divider sx={{ mb: 3 }} />
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Email Address"
                            variant="outlined"
                            fullWidth
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            error={Boolean(errors.username)}
                            helperText={errors.username}
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
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            label="Mobile Number"
                            variant="outlined"
                            fullWidth
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            error={Boolean(errors.mobileNumber)}
                            helperText={errors.mobileNumber}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PhoneIcon sx={{ color: 'primary.main', fontSize: 20 }} />
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
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Security Settings Section - Only for new users */}
                    {!isEditing && (
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                          <SecurityIcon sx={{ color: 'primary.main' }} />
                          <Typography variant="h6" fontWeight={600}>
                            Security Settings
                          </Typography>
                        </Stack>
                        <Divider sx={{ mb: 3 }} />
                        
                        <Grid container spacing={3}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              label="Password"
                              type={showPassword ? 'text' : 'password'}
                              variant="outlined"
                              fullWidth
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              error={Boolean(errors.password)}
                              helperText={errors.password}
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
                            
                            {/* Password Strength Indicator */}
                            {password && (
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
                              </Box>
                            )}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl 
                              fullWidth 
                              error={Boolean(errors.role)}
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
                            >
                              <InputLabel>User Role</InputLabel>
                              <Select
                                value={role}
                                label="User Role"
                                onChange={(e) => setRole(e.target.value)}
                                startAdornment={
                                  <InputAdornment position="start">
                                    <SecurityIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                                  </InputAdornment>
                                }
                              >
                                {roleList.map((roleItem) => (
                                  <MenuItem key={roleItem.R_CODE} value={roleItem.R_CODE}>
                                    {roleItem.R_NAME}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors.role && (
                                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                                  {errors.role}
                                </Typography>
                              )}
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <Divider />
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <LoadingButton
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/userlist')}
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
                      <LoadingButton
                        loading={isSubmitting}
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
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
                          '&.Mui-disabled': {
                            background: alpha(theme.palette.grey[500], 0.3),
                          }
                        }}
                      >
                        {isEditing ? 'Update User' : 'Create User'}
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Sidebar with Guidelines */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  boxShadow: `0 8px 32px ${alpha(theme.palette.info.main, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <AccountCircleIcon sx={{ color: 'info.main' }} />
                    <Typography variant="h6" fontWeight={600} color="info.main">
                      User Guidelines
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
                      <Typography variant="body2" fontWeight={600}>
                        {isEditing ? 'Editing User' : 'Creating New User'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isEditing 
                          ? 'Update user information carefully to maintain data integrity.'
                          : 'Fill in all required fields to create a new user account.'
                        }
                      </Typography>
                    </Alert>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom color="text.primary" fontWeight={600}>
                        {isEditing ? 'Update Guidelines:' : 'Required Fields:'}
                      </Typography>
                      <Stack spacing={1}>
                        {[
                          { text: 'First Name - Required', met: !!firstName },
                          { text: 'Valid Email Address', met: validator.isEmail(username) },
                          { text: 'Mobile Number (10+ digits)', met: mobileNumber.length >= 10 },
                          ...(!isEditing ? [
                            { text: 'Strong Password (6+ chars)', met: password.length >= 6 },
                            { text: 'User Role Selection', met: !!role }
                          ] : [])
                        ].map((req, index) => (
                          <Stack key={index} direction="row" alignItems="center" spacing={1}>
                            {req.met ? (
                              <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            ) : (
                              <Box sx={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: alpha(theme.palette.grey[500], 0.3) }} />
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

                    {!isEditing && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom color="text.primary" fontWeight={600}>
                          Available Roles:
                        </Typography>
                        <Stack spacing={0.5}>
                          {roleList.map((roleItem) => (
                            <Chip
                              key={roleItem.R_CODE}
                              label={roleItem.R_NAME}
                              size="small"
                              variant={role === roleItem.R_CODE ? "filled" : "outlined"}
                              color={role === roleItem.R_CODE ? "primary" : "default"}
                              sx={{ 
                                fontSize: '0.75rem',
                                alignSelf: 'flex-start'
                              }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </form>
      </Container>
    </>
  );
};

export default RegisterUser;    