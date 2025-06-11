import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, MenuItem, FormControl, InputLabel, Select, IconButton, CircularProgress } from '@mui/material';
import { Formik, Form, Field, FieldArray } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { GetMultipleResult, GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { GetLookupList } from '../../../../utils/CommonServices';

const ModalForm = ({ open, onClose, initialValues }) => {
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
    code: yup.string().required('Code is required'),
    desc: yup.string().required('Description is required'),
    unit: yup.string().required('Unit is required'),
    price: yup.string().required('Price is required'),
    conversions: yup.array().of(
      yup.object().shape({
        conversionUnit: yup.string().required('Conversion unit is required'),
        conversionRate: yup.string().required('Conversion rate is required').min(1, 'Conversion rate must be greater than 0'),
        conversionPrice: yup.string() 
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
        showToast(type=== "ADD" ? 'Product created !' : 'Product updated !', 'success');
        onClose();
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('An error occurred while saving the product', 'error');
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
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('An error occurred while getting the code', 'error');
    }
  };

  const getUnit = async () => {
    const data = await GetLookupList('UNITS');
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
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '90%', sm: '550px', md: '720px' },
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          p: 3,
          mx: 'auto',
          mt: { xs: '10%', md: '5%' },
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        <Typography variant="h4" component="h2" sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between' }}>
          {isNew ? 'Create Product' : 'Update Product'}
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
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
            {({ values, errors, touched, handleChange, setFieldValue }) => {
              console.log('Current form values:', values); // Debug log
              return (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Code"
                        disabled={isNew ? !codeEditable : true}
                        name="code"
                        value={values.code || ''}
                        onChange={handleChange}
                        error={Boolean(touched.code && errors.code)}
                        helperText={touched.code && errors.code}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description"
                        name="desc"
                        value={values.desc || ''}
                        onChange={handleChange}
                        error={Boolean(touched.desc && errors.desc)}
                        helperText={touched.desc && errors.desc}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        label="Price"
                        name="price"
                        value={values.price || ''}
                        onChange={handleChange}
                        error={Boolean(touched.price && errors.price)}
                        helperText={touched.price && errors.price}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size="small" error={Boolean(touched.unit && errors.unit)}>
                        <InputLabel>Base Unit</InputLabel>
                        <Field
                          as={Select}
                          label="Base Unit"
                          size="small"
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

                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Unit Conversions
                      </Typography>
                      <FieldArray name="conversions">
                        {({ push, remove }) => (
                          <Stack spacing={2} gap={1}>
                            {values.conversions.map((conversion, index) => (
                              <Grid key={index} container alignItems="center" gap={1}>
                                <Grid item xs={12} sm={4}>
                                  <FormControl size="small"
                                  fullWidth error={Boolean(touched.conversions?.[index]?.conversionUnit && errors.conversions?.[index]?.conversionUnit)}>
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
                                  />
                                </Grid>
                                <Grid item xs={12} sm={3}>
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
                                  />
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                  <IconButton
                                    color="error"
                                    onClick={() => remove(index)}
                                    sx={{ mt: 1 }}
                                  >
                                    <Iconify icon="mdi:delete" />
                                  </IconButton>
                                </Grid>
                              </Grid>
                            ))}
                            <Button
                              startIcon={<Iconify icon="mdi:plus" />}
                              onClick={() => push({ conversionUnit: '', conversionRate: '' })}
                              variant="outlined"
                              sx={{ alignSelf: 'flex-start' }}
                            >
                              Add Conversion
                            </Button>
                          </Stack>
                        )}
                      </FieldArray>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack direction="row" alignItems="center" justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Iconify icon="mdi:cancel" />}
                          sx={{ mr: 2 }}
                          onClick={onClose}
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          color={isNew ? 'success' : 'warning'} 
                          startIcon={<Iconify icon="basil:save-outline" />}
                          disabled={isLoading}
                        >
                          {isNew ? 'Save' : 'Update'} Product
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Form>
              );
            }}
          </Formik>
        )}
      </Box>
    </Modal>
  );
};

export default ModalForm;
