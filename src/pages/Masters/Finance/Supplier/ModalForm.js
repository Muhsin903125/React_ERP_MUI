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
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Iconify from '../../../../components/iconify';
import { GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [taxTreat, setTaxTreat] = useState([]);
  const [codeEditable, setCodeEditable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
      getCode();
    }
    getTaxTreat();
  }, [initialValues, open]);
  const validationSchema = yup.object().shape({
    docNo: yup.string().required('Supplier code is required'),
    desc: yup.string().required('Supplier name is required').min(2, 'Name must be at least 2 characters'),
    email: yup.string().email('Please enter a valid email address'),
    mobile: yup.string().matches(/^[0-9+\-\s()]*$/, 'Please enter a valid mobile number'),
    trn: yup.string().max(15, 'TRN must not exceed 15 characters'),
    address: yup.string().max(500, 'Address must not exceed 500 characters'),
    tax: yup.string(),
  });

  const HandleData = async (data, type) => {
    setLoading(true);
    try {
      const { Success, Message } = await GetSingleResult({
        key: 'SUP_CRUD',
        TYPE: type,
        SUP_DOCNO: data.docNo,
        SUP_DESC: data.desc,
        SUP_EMAIL: data.email,
        SUP_TRN: data.trn,
        SUP_ADDRESS: data.address,
        SUP_MOB: data.mobile.toString(),
        SUP_TAX_TREATMENT: data.tax || 'SR',
      });

      if (Success) {
        showToast(
          type === "ADD"
            ? '✅ Supplier created successfully!'
            : '✅ Supplier updated successfully!',
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
        TYPE: 'SUP',
      });

      if (Success) {
        setCode(Data.LAST_NO);
        setCodeEditable(Data?.IS_EDITABLE);
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getTaxTreat = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: 'LOOKUP',
        TYPE: 'TAX_TREAT',
      });

      if (Success) {
        setTaxTreat(Data); // Updated to set the entire Data instead of Data[0]
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
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
          >
            {/* Mobile-Friendly Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: { xs: 2, sm: 3 },
                position: 'relative',
                flexShrink: 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Box
                  sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: 2,
                    backgroundColor: alpha('#fff', 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <BusinessIcon fontSize={isSmallMobile ? 'medium' : 'large'} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant={isSmallMobile ? "h6" : "h5"}
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isNew ? "Create New Supplier" : "Update Supplier"}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={isNew ? "NEW" : "EDIT"}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#fff', 0.2),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    {!isNew && initialValues && !isSmallMobile && (
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        ID: {initialValues.SUP_DOCNO}
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
                  right: { xs: 8, sm: 16 },
                  top: { xs: 8, sm: 16 },
                  color: 'white',
                  backgroundColor: alpha('#fff', 0.1),
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.2),
                  }
                }}
              >
                <CloseIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
              </IconButton>
            </Box>

            {/* Form Content */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Formik
                initialValues={{
                  docNo: initialValues?.SUP_DOCNO || code || '',
                  desc: initialValues?.SUP_DESC || '',
                  email: initialValues?.SUP_EMAIL || '',
                  mobile: initialValues?.SUP_MOB || '',
                  address: initialValues?.SUP_ADDRESS || '',
                  trn: initialValues?.SUP_TRN || '',
                  tax: initialValues?.SUP_TAX_TREATMENT || '',
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
                      {/* Supplier Code & Name */}
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
                          label="Supplier Code"
                          disabled={isNew ? !codeEditable : true}
                          name="docNo"
                          value={values.docNo}
                          onChange={handleChange}
                          error={Boolean(touched.docNo && errors.docNo)}
                          helperText={touched.docNo && errors.docNo}
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
                          label="Supplier Name"
                          name="desc"
                          value={values.desc}
                          onChange={handleChange}
                          error={Boolean(touched.desc && errors.desc)}
                          helperText={touched.desc && errors.desc}
                          placeholder="Enter supplier name"
                        />
                      </Grid>

                      {/* Contact Information */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: { xs: 1 } }} />
                        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          <EmailIcon color="primary" fontSize="small" />
                          Contact Information
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type="email"
                          label="Email Address"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                          placeholder="supplier@example.com"
                          InputProps={{
                            startAdornment: (
                              <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem' }} />
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Mobile Number"
                          name="mobile"
                          value={values.mobile}
                          onChange={handleChange}
                          error={Boolean(touched.mobile && errors.mobile)}
                          helperText={touched.mobile && errors.mobile}
                          placeholder="+971 XX XXX XXXX"
                          InputProps={{
                            startAdornment: (
                              <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem' }} />
                            ),
                          }}
                        />
                      </Grid>

                      {/* Tax & Address Information */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: { xs: 1 } }} />
                        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          <ReceiptIcon color="primary" fontSize="small" />
                          Tax & Address Information
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="TRN Number"
                          name="trn"
                          value={values.trn}
                          onChange={handleChange}
                          error={Boolean(touched.trn && errors.trn)}
                          helperText={touched.trn && errors.trn}
                          placeholder="Tax Registration Number"
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small" error={Boolean(touched.tax && errors.tax)}>
                          <InputLabel>Tax Treatment</InputLabel>
                          <Field
                            as={Select}
                            label="Tax Treatment"
                            name="tax"
                            value={values.tax}
                            onChange={handleChange}
                          >
                            {taxTreat.map((item) => (
                              <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                                {item.LK_VALUE}
                              </MenuItem>
                            ))}
                          </Field>
                          {touched.tax && errors.tax && (
                            <Typography color="error" variant="caption">
                              {errors.tax}
                            </Typography>
                          )}
                        </FormControl>
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
                          InputProps={{
                            startAdornment: (
                              <LocationOnIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem', alignSelf: 'flex-start', mt: 1 }} />
                            ),
                          }}
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
                            {loading ? 'Saving...' : `${isNew ? "Create" : "Update"} Supplier`}
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
