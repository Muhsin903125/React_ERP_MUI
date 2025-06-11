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
  IconButton,
  CircularProgress,
  Fade,
  Divider,
  Alert,
  Chip,
  useTheme,
  alpha,
  Paper,
  useMediaQuery,
  Slide
} from '@mui/material';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import InventoryIcon from '@mui/icons-material/Inventory';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Iconify from '../../../../components/iconify';
import { GetMultipleResult, GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { getLookupList } from '../../../../utils/CommonServices';

const ModalForm = ({ open, onClose, initialValues }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [unit, setUnit] = useState([]);
  const [codeEditable, setCodeEditable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    desc: '',
    unit: '',
    price: '',
    conversions: []
  });

  // Load units first
  useEffect(() => {
    getUnit();
  }, []);

  // Handle form data loading
  useEffect(() => {
    if (open) {
      if (initialValues !== null) {
        setIsNew(false);
        getDetails();
      } else {
        setIsNew(true);
        getCode();
        setFormData({
          code: '',
          desc: '',
          unit: '',
          price: '',
          conversions: []
        });
      }
    }
  }, [initialValues, open]);
  const validationSchema = yup.object().shape({
    code: yup.string().required('Product code is required'),
    desc: yup.string().required('Product description is required').min(2, 'Description must be at least 2 characters'),
    unit: yup.string().required('Base unit is required'),
    price: yup.number().required('Price is required').min(0, 'Price must be greater than or equal to 0'),
    conversions: yup.array().of(
      yup.object().shape({
        conversionUnit: yup.string().required('Conversion unit is required'),
        conversionRate: yup.number().required('Conversion rate is required').min(0.01, 'Conversion rate must be greater than 0'),
        conversionPrice: yup.number().min(0, 'Conversion price must be greater than or equal to 0')
      })
    ),
  });

  const HandleData = async (data, type) => {
    setIsLoading(true);
    try {
      const { Success, Message } = await GetSingleResult({
        key: 'ITEM_CRUD',
        TYPE: type,
        IM_CODE: data.code,
        IM_DESC: data.desc,
        IM_UNIT_CODE: data.unit,
        IM_PRICE: data.price,
        IM_CONVERSIONS: data.conversions,
      });

      if (Success) {
        showToast(
          type === "ADD"
            ? '✅ Product created successfully!'
            : '✅ Product updated successfully!',
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
      setIsLoading(false);
    }
  };
  const getCode = async () => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        key: 'LAST_NO',
        TYPE: 'PRODUCT',
      });

      if (Success) {
        setCode(Data.LAST_NO);
        setCodeEditable(Data.IS_EDITABLE);
        setFormData(prev => ({
          ...prev,
          code: Data.LAST_NO
        }));
      } else {
        showToast(Message || 'Failed to get product code', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Network error while getting code', 'error');
    }
  };

  const getUnit = async () => {
    const data = await getLookupList('UNITS');
    setUnit(data);
  };

  const getDetails = async () => {
    try {
      setIsLoading(true);
      const { Success, Data, Message } = await GetMultipleResult({
        key: 'ITEM_CRUD',
        TYPE: 'GET',
        IM_CODE: initialValues?.IM_CODE,
      });

      if (Success && Data && Data[0] && Data[0][0]) {
        const productData = Data[0][0];
        const conversionData = Data[1]

        const newFormData = {
          code: productData.IM_CODE || '',
          desc: productData.IM_DESC || '',
          unit: productData.IM_UNIT_CODE || '',
          price: productData.IM_PRICE?.toString() || '',
          conversions: conversionData.map(conv => ({
            conversionUnit: conv.conversionUnit || '',
            conversionRate: conv.conversionRate?.toString() || '',
            conversionPrice: conv.conversionPrice?.toString() || ''
          }))
        };

        console.log('Setting form data:', newFormData); // Debug log
        setFormData(newFormData);
      } else {
        showToast(Message || 'No data found', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('An error occurred while getting product details', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      open={open}
      onClose={!isLoading ? onClose : undefined}
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
            width: { xs: '100%', sm: '95%', md: '760px', lg: '860px' },
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
                  <InventoryIcon fontSize={isSmallMobile ? 'medium' : 'large'} />
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
                    {isNew ? "Create New Product" : "Update Product"}
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
                        ID: {initialValues.IM_CODE}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <IconButton
                onClick={onClose}
                disabled={isLoading}
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
            <Box sx={{ p: { xs: 2, sm: 3 }, overflow: 'auto', flex: 1 }}>
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Formik
                  enableReinitialize
                  initialValues={formData}
                  validationSchema={validationSchema}
                  onSubmit={(values) => {
                    if (isNew) {
                      HandleData(values, 'ADD');
                    } else {
                      HandleData(values, 'UPDATE');
                    }
                  }}
                >
                  {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
                    <Form>
                      <Grid container spacing={{ xs: 2 }}>
                        {/* Product Code & Description */}
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
                            label="Product Code"
                            disabled={isNew ? !codeEditable : true}
                            name="code"
                            value={values.code || ''}
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
                            label="Product Description"
                            name="desc"
                            value={values.desc || ''}
                            onChange={handleChange}
                            error={Boolean(touched.desc && errors.desc)}
                            helperText={touched.desc && errors.desc}
                            placeholder="Enter product description"
                          />
                        </Grid>

                        {/* Pricing & Unit Information */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: { xs: 1 } }} />
                          <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            <MonetizationOnIcon color="primary" fontSize="small" />
                            Pricing & Unit Information
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            type="number"
                            size="small"
                            label="Base Price"
                            name="price"
                            value={values.price || ''}
                            onChange={handleChange}
                            error={Boolean(touched.price && errors.price)}
                            helperText={touched.price && errors.price}
                            placeholder="0.00"
                            InputProps={{
                              startAdornment: (
                                <MonetizationOnIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem' }} />
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small" error={Boolean(touched.unit && errors.unit)}>
                            <InputLabel>Base Unit</InputLabel>
                            <Field
                              as={Select}
                              label="Base Unit"
                              name="unit"
                              value={values.unit || ''}
                              onChange={handleChange}
                            >
                              {unit.map((item) => (
                                <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                                  {item.LK_VALUE}
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.unit && errors.unit && (
                              <Typography color="error" variant="caption">
                                {errors.unit}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>

                        {/* Unit Conversions */}
                        <Grid item xs={12}>
                          <Divider sx={{ my: { xs: 1 } }} />
                          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            <SwapHorizIcon color="primary" fontSize="small" />
                            Unit Conversions
                          </Typography>
                          <FieldArray name="conversions">
                            {({ push, remove }) => (
                              <Stack spacing={1}>
                                {values.conversions.length > 0 && 
                                  <Paper
                                    elevation={2}
                                    sx={{
                                      p: 1,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: 2
                                    }}
                                  >
                                    {values.conversions.map((conversion, index) => (

                                    <Grid container key={index} spacing={2} my={1} alignItems="center">
                                      <Grid item xs={12} sm={4}>
                                        <FormControl
                                          size="small"
                                          fullWidth
                                          error={Boolean(touched.conversions?.[index]?.conversionUnit && errors.conversions?.[index]?.conversionUnit)}
                                        >
                                          <InputLabel>Conversion Unit</InputLabel>
                                          <Field
                                            as={Select}
                                            label="Conversion Unit"
                                            name={`conversions.${index}.conversionUnit`}
                                            value={conversion.conversionUnit || ''}
                                            onChange={handleChange}
                                          >
                                            {unit.map((item) => (
                                              <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                                                {item.LK_VALUE}
                                              </MenuItem>
                                            ))}
                                          </Field>
                                          {touched.conversions?.[index]?.conversionUnit && errors.conversions?.[index]?.conversionUnit && (
                                            <Typography color="error" variant="caption">
                                              {errors.conversions[index].conversionUnit}
                                            </Typography>
                                          )}
                                        </FormControl>
                                      </Grid>

                                      <Grid item xs={12} sm={3}>
                                        <TextField
                                          size="small"
                                          fullWidth
                                          type="number"
                                          label="Conversion Rate"
                                          name={`conversions.${index}.conversionRate`}
                                          value={conversion.conversionRate || ''}
                                          onChange={handleChange}
                                          error={Boolean(touched.conversions?.[index]?.conversionRate && errors.conversions?.[index]?.conversionRate)}
                                          helperText={touched.conversions?.[index]?.conversionRate && errors.conversions?.[index]?.conversionRate}
                                          placeholder="1.0"
                                        />
                                      </Grid>

                                      <Grid item xs={12} sm={4}>
                                        <TextField
                                          size="small"
                                          fullWidth
                                          type="number"
                                          label="Conversion Price"
                                          name={`conversions.${index}.conversionPrice`}
                                          value={conversion.conversionPrice || ''}
                                          onChange={handleChange}
                                          error={Boolean(touched.conversions?.[index]?.conversionPrice && errors.conversions?.[index]?.conversionPrice)}
                                          helperText={touched.conversions?.[index]?.conversionPrice && errors.conversions?.[index]?.conversionPrice}
                                          placeholder="0.00"
                                        />
                                      </Grid>

                                      <Grid item xs={12} sm={1}>
                                        <IconButton
                                          color="error"
                                          onClick={() => remove(index)}
                                          size="small"
                                          sx={{
                                            width: '100%',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'error.main'
                                          }}
                                        >
                                          <Iconify icon="mdi:delete" />
                                        </IconButton>
                                      </Grid>
                                    </Grid>
                                  ))}
                                </Paper>}

                                <Button
                                  startIcon={<Iconify icon="mdi:plus" />}
                                  onClick={() => push({ conversionUnit: '', conversionRate: '', conversionPrice: '' })}
                                  variant="outlined"
                                  size="small"
                                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                                >
                                  Add Conversion
                                </Button>
                              </Stack>
                            )}
                          </FieldArray>
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
                              disabled={isLoading}
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
                                isLoading ? (
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
                              disabled={isLoading}
                              size="small"
                              sx={{ minWidth: { xs: '100%', sm: 140 } }}
                            >
                              {isLoading ? 'Saving...' : `${isNew ? "Create" : "Update"} Product`}
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              )}
            </Box>
          </Paper>
        </Box>
      </Slide>
    </Modal>
  );
};

export default ModalForm;
