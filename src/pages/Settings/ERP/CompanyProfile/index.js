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
        .required('Phone number is required')
        .matches(/^[0-9+\-() ]+$/, 'Invalid phone number format'),
    CP_EMAIL: yup.string()
        .email('Invalid email format')
        .required('Email is required'),
    CP_TRN: yup.string()
        .required('TRN is required')
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
                showToast("Company profile updated successfully", "success");
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
    };

    return (
        <StyledRoot>
            <Helmet>
                <title>Company Profile | Your ERP</title>
            </Helmet>

            <Container maxWidth="lg">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Company Profile
                    </Typography>
                </Stack>

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
                        {({ values, errors, touched, handleChange, isSubmitting }) => (
                            <Form>
                                <Grid container spacing={4}>
                                    <Grid item xs={12} md={4}>
                                        <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
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
                                                            bgcolor="grey.200"
                                                        >
                                                            <Iconify icon="mdi:image" width={64} height={64} />
                                                        </Box>
                                                    )}
                                                    <AvatarOverlay className="overlay">
                                                        <Iconify icon="mdi:camera" width={32} height={32} />
                                                    </AvatarOverlay>
                                                </StyledAvatar>

                                                <Grid container spacing={2} sx={{ mt: 2 }}>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Logo URL"
                                                            value={logoUrlInput}
                                                            onChange={handleLogoUrlChange}
                                                            placeholder="Enter logo URL"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <Iconify icon="mdi:link" />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                        />
                                                    </Grid>
                                                    {/* <Grid item xs={12}>
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
                                                            >
                                                                Upload Logo
                                                            </Button>
                                                        </Box>
                                                    </Grid> */}
                                                </Grid>

                                                <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary' }}>
                                                    Allowed formats: JPG, PNG, GIF (Max size: 5MB)
                                                </Typography>
                                            </LogoUploadBox>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} md={8}>
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
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Iconify icon="mdi:building" />
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
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Iconify icon="mdi:map-marker" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
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
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Iconify icon="mdi:phone" />
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
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Iconify icon="mdi:email" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="TRN"
                                                    name="CP_TRN"
                                                    value={values.CP_TRN}
                                                    onChange={handleChange}
                                                    error={Boolean(touched.CP_TRN && errors.CP_TRN)}
                                                    helperText={touched.CP_TRN && errors.CP_TRN}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Iconify icon="mdi:file-document" />
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
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <Iconify icon="mdi:web" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="large"
                                                disabled={isSubmitting}
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