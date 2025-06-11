import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  Grid,
  TextField,
  Stack,
  Box,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Fade,
  IconButton,
  Divider,
  Alert,
  Chip,
  useTheme,
  alpha,
  Paper,
  useMediaQuery,
  Slide
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import Iconify from '../../../../components/iconify';
import { GetSingleListResult, GetSingleResult, PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [country, setCountry] = useState([]);
  const [codeEditable, setCodeEditable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
      getCode();
    }
    getCountry();
  }, [initialValues, open]);
  const validationSchema = yup.object().shape({
    code: yup.string().required('Location code is required'),
    name: yup.string().required('Location name is required').min(2, 'Name must be at least 2 characters'),
    desc: yup.string().max(500, 'Description must not exceed 500 characters'),
    address: yup.string().max(500, 'Address must not exceed 500 characters'),
    city: yup.string().max(100, 'City must not exceed 100 characters'),
    state: yup.string().max(100, 'State must not exceed 100 characters'),
    country: yup.string(),
    postalCode: yup.string().max(20, 'Postal code must not exceed 20 characters'),
  });

  const HandleData = async (data, type) => {
    setLoading(true);
    try {
      const { Success, Message } = await GetSingleResult({
        key: 'LOCATION_CRUD',
        TYPE: type,
        LM_LOCATION_CODE: data.code,
        LM_LOCATION_NAME: data.name,
        LM_DESCRIPTION: data.desc,
        LM_ADDRESS: data.address,
        LM_CITY: data.city,
        LM_STATE: data.state,
        LM_COUNTRY: data.country,
        LM_POSTAL_CODE: data.postalCode,
      });

      if (Success) {
        showToast(
          type === "ADD"
            ? '✅ Location created successfully!'
            : '✅ Location updated successfully!',
          'success'
        );
        onClose();
      } else {
        showToast(Message || 'Operation failed', "error");
      }
    } catch (error) {
      showToast('Network error - please try again', "error");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const getCode = async () => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        key: 'LAST_NO',
        TYPE: 'LOCATION',
      });

      if (Success) {
        setCode(Data?.LAST_NO);
        setCodeEditable(Data?.IS_EDITABLE);
      } else {
        showToast(Message || 'Failed to get location code', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Network error while getting code', 'error');
    }
  };

  const getCountry = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: 'LOOKUP',
        TYPE: 'COUNTRY',
      });

      if (Success) {
        setCountry(Data);
      } else {
        showToast(Message || 'Failed to load countries', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Network error while loading countries', 'error');
    }
  };
  return (
    <Modal
      open={open}
      onClose={!loading ? onClose : undefined}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
      }}
    >
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            width: { xs: '100%', sm: '95%', md: '720px', lg: '800px' },
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '95vh' },
            display: 'flex',
            flexDirection: 'column',
            ...(isMobile && {
              borderRadius: '16px 16px 0 0',
            })
          }}
        >
          <Paper
            elevation={24}
            sx={{
              borderRadius: isMobile ? '16px 16px 0 0' : 3,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >            {/* Mobile-Friendly Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: { xs: 1.5, sm: 2 },
                position: 'relative',
                flexShrink: 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Box
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    borderRadius: 2,
                    backgroundColor: alpha('#fff', 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LocationOnIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant={isSmallMobile ? "subtitle1" : "h6"}
                    sx={{
                      fontWeight: 600,
                      mb: 0.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isNew ? "Create New Location" : "Update Location"}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={isNew ? "NEW" : "EDIT"}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#fff', 0.2),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                    {!isNew && initialValues && !isSmallMobile && (
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        ID: {initialValues.LM_LOCATION_CODE}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <IconButton
                onClick={onClose}
                disabled={loading}
                sx={{
                  position: 'absolute',
                  right: { xs: 6, sm: 12 },
                  top: { xs: 6, sm: 12 },
                  color: 'white',
                  backgroundColor: alpha('#fff', 0.1),
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.2),
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>            {/* Form Content */}
            <Box sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto', flex: 1 }}>
              <Formik
                initialValues={{
                  code: initialValues?.LM_LOCATION_CODE || code || '',
                  name: initialValues?.LM_LOCATION_NAME || '',
                  desc: initialValues?.LM_DESCRIPTION || '',
                  address: initialValues?.LM_ADDRESS || '',
                  city: initialValues?.LM_CITY || '',
                  state: initialValues?.LM_STATE || '',
                  country: initialValues?.LM_COUNTRY || '',
                  postalCode: initialValues?.LM_POSTAL_CODE || '',
                }}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={(values) => {
                  if (isNew) {
                    HandleData(values, 'ADD');
                  } else {
                    HandleData(values, 'UPDATE');
                  }
                }}
              >
                {({ values, errors, touched, handleChange, isSubmitting }) => (
                  <Form>
                    <Grid container spacing={{ xs: 2 }}>
                      {/* Location Code & Name */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          <BusinessIcon color="primary" fontSize="small" />
                          Basic Information
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Location Code"
                          disabled={isNew ? !codeEditable : true}
                          name="code"
                          value={values.code}
                          onChange={handleChange}
                          error={Boolean(touched.code && errors.code)}
                          helperText={touched.code && errors.code}
                          InputProps={{
                            startAdornment: (
                              <Box sx={{ mr: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                #
                              </Box>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Location Name"
                          name="name"
                          value={values.name}
                          onChange={handleChange}
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
                          placeholder="Enter location name"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Description"
                          name="desc"
                          value={values.desc}
                          onChange={handleChange}
                          error={Boolean(touched.desc && errors.desc)}
                          helperText={touched.desc && errors.desc}
                          placeholder="Enter location description"
                          multiline
                          rows={2}
                        />
                      </Grid>

                      {/* Address Information */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: { xs: 1 } }} />
                        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          <MapIcon color="primary" fontSize="small" />
                          Address Information
                        </Typography>
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Address"
                          name="address"
                          value={values.address}
                          onChange={handleChange}
                          error={Boolean(touched.address && errors.address)}
                          helperText={touched.address && errors.address}
                          placeholder="Enter complete address"
                          multiline
                          rows={2}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" error={Boolean(touched.country && errors.country)}>
                          <InputLabel>Country</InputLabel>
                          <Field
                            as={Select}
                            label="Country"
                            name="country"
                            value={values.country}
                            onChange={handleChange}
                            startAdornment={
                              <PublicIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem' }} />
                            }
                          >
                            {country && country.map((item) => (
                              <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                                {item.LK_VALUE}
                              </MenuItem>
                            ))}
                          </Field>
                          {touched.country && errors.country && (
                            <Typography color="error" variant="caption">
                              {errors.country}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="State"
                          name="state"
                          value={values.state}
                          onChange={handleChange}
                          error={Boolean(touched.state && errors.state)}
                          helperText={touched.state && errors.state}
                          placeholder="Enter state"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="City"
                          name="city"
                          value={values.city}
                          onChange={handleChange}
                          error={Boolean(touched.city && errors.city)}
                          helperText={touched.city && errors.city}
                          placeholder="Enter city"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Postal Code"
                          name="postalCode"
                          value={values.postalCode}
                          onChange={handleChange}
                          error={Boolean(touched.postalCode && errors.postalCode)}
                          helperText={touched.postalCode && errors.postalCode}
                          placeholder="Enter postal code"
                        />
                      </Grid>

                      {/* Form Actions */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            color="inherit"
                            startIcon={<CloseIcon />}
                            onClick={onClose}
                            disabled={loading}
                            size="small"
                            sx={{ minWidth: { xs: '100%', sm: 120 } }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            color={isNew ? "success" : "warning"}
                            startIcon={
                              loading ? (
                                <Box
                                  component="div"
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    border: '2px solid',
                                    borderColor: 'currentColor',
                                    borderTopColor: 'transparent',
                                    animation: 'spin 1s linear infinite',
                                    '@keyframes spin': {
                                      '0%': { transform: 'rotate(0deg)' },
                                      '100%': { transform: 'rotate(360deg)' },
                                    },
                                  }}
                                />
                              ) : (
                                <Iconify icon="basil:save-outline" />
                              )
                            }
                            disabled={loading}
                            size="small"
                            sx={{ minWidth: { xs: '100%', sm: 140 } }}
                          >
                            {loading ? 'Saving...' : `${isNew ? "Create" : "Update"} Location`}
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Box>
          </Paper>
        </Box> 
      </Slide>
    </Modal>
  );
};

export default ModalForm;
