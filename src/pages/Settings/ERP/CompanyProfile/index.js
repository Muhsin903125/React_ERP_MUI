import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react';
import {
    Stack,
    Button,
    Container,
    Typography,
    TextField,
    Grid,
    Box,
    IconButton,
    InputAdornment,
    CircularProgress,
    Paper,
    alpha,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup'; 
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import Iconify from '../../../../components/iconify';
import {
    StyledRoot,
    StyledCard,
    LogoUploadBox,
    StyledAvatar,
    AvatarOverlay,
} from './styles';
import { GetSingleResult } from '../../../../hooks/Api';

const validationSchema = yup.object().shape({
    CP_NAME: yup.string().required('Company name is required'),
    CP_ADDRESS: yup.string().required('Address is required'),
    CP_PHONE: yup.string()
        .required('Phone number is required'),
        // .matches(/^[0-9+\-() ]+$/, 'Invalid phone number format'),
    CP_EMAIL: yup.string()
        .email('Invalid email format'),
        // .required('Email is required'),
    CP_TRN: yup.string()
        // .required('TRN is required')
        .matches(/^[0-9]+$/, 'TRN must contain only numbers'),
    CP_WEBSITE: yup.string()
        .url('Invalid website URL')
        .nullable(),
});

export default function CompanyProfile() {
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [companyData, setCompanyData] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [logoUrlInput, setLogoUrlInput] = useState('');

    useEffect(() => {
        fetchCompanyProfile();
    }, []);

    const fetchCompanyProfile = async () => {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetSingleResult({
                key: "COMPANY_CRUD",
                TYPE: "GET",
                CP_CODE: 1,
            });
            if (Success && Data) {
                setCompanyData(Data);
                if (Data.CP_LOGO_PATH) {
                    setPreviewUrl(Data.CP_LOGO_PATH);
                }
                
            } else {
                showToast(Message || "Error fetching company profile", "error");
            }
        } catch (error) {
            showToast("Failed to fetch company profile", "error");
        } finally {
            setLoadingFull(false);
        }
    };

    const handleLogoUrlChange = (event) => {
        const url = event.target.value;
        setLogoUrlInput(url);
        if (url) {
            setSelectedFile(null);
            setPreviewUrl(url);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5000000) { // 5MB limit
                showToast("File size should not exceed 5MB", "error");
                return;
            }
            if (!file.type.startsWith('image/')) {
                showToast("Please upload an image file", "error");
                return;
            }
            setSelectedFile(file);
            setLogoUrlInput('');
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            setIsSubmitting(true);
            setLoadingFull(true);

            // Handle logo path - either from file or URL
            let logoPath = values.CP_LOGO_PATH;
            if (selectedFile) {
                // Here you would implement the actual file upload logic
                // For now, we're just using the preview URL
                logoPath = previewUrl;
            } else if (logoUrlInput) {
                logoPath = logoUrlInput;
            }

            const response = await GetSingleResult({
                ...values,
                CP_LOGO_PATH: logoPath,
                TYPE: "UPDATE",
                key: "COMPANY_CRUD"
            });

            if (response.Success) {
                showToast("Company profile updated", "success");
                setCompanyData(response.Data);
            } else {
                showToast(response.Message || "Error updating company profile", "error");
            }
        } catch (error) {
            showToast("Failed to update company profile", "error");
        } finally {
            setLoadingFull(false);
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };    return (
        <StyledRoot>
            <Helmet>
                <title>Company Profile | Exapp ERP</title>
            </Helmet>

            <Container maxWidth="lg">
                <Box sx={{ position: 'relative', mb: 5 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Box>
                            <Typography 
                                variant="h4" 
                                sx={{ 
                                    fontWeight: 700,
                                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1
                                }}
                            >
                                Company Profile
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                                Manage your company's information and branding
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <StyledCard>
                    <Formik
                        initialValues={{
                            CP_CODE: companyData?.CP_CODE || '',
                            CP_NAME: companyData?.CP_NAME || '',
                            CP_ADDRESS: companyData?.CP_ADDRESS || '',
                            CP_PHONE: companyData?.CP_PHONE || '',
                            CP_EMAIL: companyData?.CP_EMAIL || '',
                            CP_TRN: companyData?.CP_TRN || '',
                            CP_WEBSITE: companyData?.CP_WEBSITE || '',
                            CP_LOGO_PATH: companyData?.CP_LOGO_PATH || '',
                            CP_IS_ACTIVE: true
                        }}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ values, errors, touched, handleChange, isSubmitting }) => (                            <Form>
                                <Grid container spacing={{ xs: 2, md: 4 }}>                                    <Grid item xs={12} md={4}>
                                        <Paper 
                                            elevation={0} 
                                            sx={{ 
                                                p: 4,
                                                textAlign: 'center',
                                                borderRadius: 3,
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'center',
                                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
                                                backdropFilter: 'blur(8px)',
                                                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`,
                                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                            }}
                                        >
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    mb: 3, 
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <Iconify icon="mdi:image-filter-hdr" width={24} height={24} />
                                                Company Branding
                                            </Typography>
                                            
                                            <LogoUploadBox>
                                                <StyledAvatar>
                                                    {previewUrl ? (
                                                        <img src={previewUrl} alt="Company Logo" />
                                                    ) : (
                                                        <Box
                                                            display="flex"
                                                            alignItems="center"
                                                            justifyContent="center"
                                                            height="100%"
                                                            sx={{
                                                                background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)}, ${alpha(theme.palette.secondary.light, 0.1)})`,
                                                            }}
                                                        >
                                                            <Iconify 
                                                                icon="mdi:image" 
                                                                sx={{ 
                                                                    width: 64,
                                                                    height: 64,
                                                                    opacity: 0.4,
                                                                    color: 'primary.main'
                                                                }} 
                                                            />
                                                        </Box>
                                                    )}
                                                    <AvatarOverlay className="overlay">
                                                        <Stack spacing={1} alignItems="center">
                                                            <Iconify icon="mdi:camera" width={36} height={36} />
                                                            <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                                                Change Logo
                                                            </Typography>
                                                        </Stack>
                                                    </AvatarOverlay>
                                                </StyledAvatar>

                                                <Grid container spacing={2} sx={{ mt: 3 }}>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Logo URL"
                                                            value={logoUrlInput}
                                                            onChange={handleLogoUrlChange}
                                                            placeholder="Enter logo URL"
                                                            sx={{
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 2,
                                                                }
                                                            }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <Iconify icon="mdi:link" sx={{ color: 'primary.main' }} />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>
                                                    
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            Or upload a file:
                                                        </Typography>
                                                        <Box component="div" role="button">
                                                            <input
                                                                type="file"
                                                                name="logo-upload"
                                                                id="logo-upload"
                                                                hidden
                                                                accept="image/*"
                                                                onChange={handleFileSelect}
                                                            />
                                                            <Button
                                                                fullWidth
                                                                variant="outlined"
                                                                component="label"
                                                                htmlFor="logo-upload"
                                                                startIcon={<Iconify icon="mdi:upload" />}
                                                                aria-label="Upload company logo"
                                                                sx={{
                                                                    py: 1.2,
                                                                    borderRadius: 2,
                                                                    borderWidth: 1.5,
                                                                    borderStyle: 'dashed',
                                                                    boxShadow: 'none',
                                                                    transition: 'all 0.2s ease',
                                                                    '&:hover': {
                                                                        borderColor: 'primary.main',
                                                                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                                                                    }
                                                                }}
                                                            >
                                                                Upload Logo
                                                            </Button>
                                                        </Box>
                                                    </Grid>
                                                </Grid>

                                                <Box sx={{ 
                                                    mt: 3, 
                                                    borderRadius: 2, 
                                                    bgcolor: (theme) => alpha(theme.palette.info.light, 0.1),
                                                    p: 2,
                                                    border: (theme) => `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                                                }}>
                                                    <Typography 
                                                        variant="caption" 
                                                        sx={{ 
                                                            color: 'info.dark',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5
                                                        }}
                                                    >
                                                        <Iconify icon="mdi:information-outline" width={14} height={14} />
                                                        Allowed formats: JPG, PNG, GIF (Max size: 5MB)
                                                    </Typography>
                                                </Box>
                                            </LogoUploadBox>
                                        </Paper>
                                    </Grid>                                    <Grid item xs={12} md={8}>
                                        <Paper 
                                            elevation={0} 
                                            sx={{ 
                                                p: 4,
                                                borderRadius: 3,
                                                height: '100%',
                                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.7),
                                                backdropFilter: 'blur(8px)',
                                                boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.common.black, 0.05)}`,
                                                border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                                            }}
                                        >
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    mb: 4, 
                                                    fontWeight: 600,
                                                    color: 'text.primary',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}
                                            >
                                                <Iconify icon="mdi:office-building-cog" width={24} height={24} />
                                                Company Information
                                            </Typography>
                                            
                                            <Grid container spacing={3}>
                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        label="Company Name"
                                                        name="CP_NAME"
                                                        value={values.CP_NAME}
                                                        onChange={handleChange}
                                                        error={Boolean(touched.CP_NAME && errors.CP_NAME)}
                                                        helperText={touched.CP_NAME && errors.CP_NAME}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                                            }
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Iconify icon="mdi:building" sx={{ color: 'primary.main' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        label="Address"
                                                        name="CP_ADDRESS"
                                                        value={values.CP_ADDRESS}
                                                        onChange={handleChange}
                                                        error={Boolean(touched.CP_ADDRESS && errors.CP_ADDRESS)}
                                                        helperText={touched.CP_ADDRESS && errors.CP_ADDRESS}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                                            }
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.2 }}>
                                                                    <Iconify icon="mdi:map-marker" sx={{ color: 'secondary.main' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Iconify icon="mdi:contact-phone" />
                                                        Contact Information
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Phone"
                                                        name="CP_PHONE"
                                                        value={values.CP_PHONE}
                                                        onChange={handleChange}
                                                        error={Boolean(touched.CP_PHONE && errors.CP_PHONE)}
                                                        helperText={touched.CP_PHONE && errors.CP_PHONE}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                                            }
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Iconify icon="mdi:phone" sx={{ color: 'success.main' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Email"
                                                        name="CP_EMAIL"
                                                        value={values.CP_EMAIL}
                                                        onChange={handleChange}
                                                        error={Boolean(touched.CP_EMAIL && errors.CP_EMAIL)}
                                                        helperText={touched.CP_EMAIL && errors.CP_EMAIL}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                                            }
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Iconify icon="mdi:email" sx={{ color: 'info.main' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12}>
                                                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Iconify icon="mdi:clipboard-text" />
                                                        Business Information
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="TRN / Tax Registration Number"
                                                        name="CP_TRN"
                                                        value={values.CP_TRN}
                                                        onChange={handleChange}
                                                        error={Boolean(touched.CP_TRN && errors.CP_TRN)}
                                                        helperText={touched.CP_TRN && errors.CP_TRN}
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                                            }
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Iconify icon="mdi:file-document" sx={{ color: 'warning.main' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        fullWidth
                                                        label="Website"
                                                        name="CP_WEBSITE"
                                                        value={values.CP_WEBSITE}
                                                        onChange={handleChange}
                                                        error={Boolean(touched.CP_WEBSITE && errors.CP_WEBSITE)}
                                                        helperText={touched.CP_WEBSITE && errors.CP_WEBSITE}
                                                        placeholder="https://www.example.com"
                                                        sx={{
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                                            }
                                                        }}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <Iconify icon="mdi:web" sx={{ color: 'primary.main' }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <Box 
                                                sx={{ 
                                                    mt: 4, 
                                                    display: 'flex', 
                                                    justifyContent: 'flex-end',
                                                    position: 'relative',
                                                    '&::before': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        top: '-16px',
                                                        left: 0,
                                                        right: 0,
                                                        height: '1px',
                                                        background: (theme) => `linear-gradient(90deg, transparent, ${alpha(theme.palette.divider, 0.7)} 50%, transparent)`,
                                                    }
                                                }}
                                            >
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    size="large"
                                                    disabled={isSubmitting}
                                                    sx={{
                                                        px: 4,
                                                        py: 1.2,
                                                        borderRadius: 2,
                                                        background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                                                        boxShadow: (theme) => `0 8px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                                            boxShadow: (theme) => `0 10px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
                                                            transform: 'translateY(-2px)'
                                                        }
                                                    }}
                                                    startIcon={
                                                        isSubmitting ? (
                                                            <CircularProgress size={20} color="inherit" />
                                                        ) : (
                                                            <Iconify icon="mdi:content-save" />
                                                        )
                                                    }
                                                >
                                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                                </Button>
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            </Form>
                        )}
                    </Formik>
                </StyledCard>
            </Container>
        </StyledRoot>
    );
} 