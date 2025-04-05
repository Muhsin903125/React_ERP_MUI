import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [country, setCountry] = useState([]);
  const [codeEditable, setCodeEditable] = useState(false);

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
    code: yup.string().required('Code is required'),
    name: yup.string().required('Name is required'),
    desc: yup.string(),
    address: yup.string(),
    city: yup.string(),
    state: yup.string(),
    country: yup.string(),
    postalCode: yup.string(),
  });

  const HandleData = async (data, type) => {
    try {
      const { Success, Message } = await PostCommonSp({
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
        showToast(Message, 'success');
        onClose();
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCode = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        key: 'LAST_NO',
        TYPE: 'LOCATION',
      });

      if (Success) {
        setCode(Data?.LAST_NO);
        setCodeEditable(Data?.IS_EDITABLE);
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCountry = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        key: 'LOOKUP',
        TYPE: 'COUNTRY',
      });

      if (Success) {
        setCountry(Data);
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
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
        }}
      >
        <Typography variant="h4" component="h2" sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between' }}>
          {isNew ? 'Create Location' : 'Update Location'}
        </Typography>

        <Formik
          initialValues={{
            code: initialValues?.LM_LOCATION_CODE || code,
            name: initialValues?.LM_LOCATION_NAME || '',
            desc: initialValues?.LM_DESCRIPTION || '',
            address: initialValues?.LM_ADDRESS || '',
            city: initialValues?.LM_CITY || '',
            state: initialValues?.LM_STATE || '',
            country: initialValues?.LM_COUNTRY || '',
            postalCode: initialValues?.LM_POSTAL_CODE || '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (isNew) {
              HandleData(values, 'ADD');
            } else {
              HandleData(values, 'UPDATE');
            }
          }}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Code"
                    disabled={isNew ? !codeEditable : true}
                    name="code"
                    value={values.code}
                    onChange={handleChange}
                    error={Boolean(touched.code && errors.code)}
                    helperText={touched.code && errors.code}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="desc"
                    value={values.desc}
                    onChange={handleChange}
                    error={Boolean(touched.desc && errors.desc)}
                    helperText={touched.desc && errors.desc}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Address"
                    name="address"
                    value={values.address}
                    onChange={handleChange}
                    error={Boolean(touched.address && errors.address)}
                    helperText={touched.address && errors.address}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.country && errors.country)}>
                    <InputLabel>Country</InputLabel>
                    <Field
                      as={Select}
                      label="Country"
                      name="country"
                      value={values.country}
                      onChange={handleChange}
                    >
                      { country && country.map((item) => (
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
                    label="State"
                    name="state"
                    value={values.state}
                    onChange={handleChange}
                    error={Boolean(touched.state && errors.state)}
                    helperText={touched.state && errors.state}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="City"
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    error={Boolean(touched.city && errors.city)}
                    helperText={touched.city && errors.city}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Postal Code"
                    name="postalCode"
                    value={values.postalCode}
                    onChange={handleChange}
                    error={Boolean(touched.postalCode && errors.postalCode)}
                    helperText={touched.postalCode && errors.postalCode}
                  />
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
                    <Button type="submit" variant="contained" color={isNew ? 'success' : 'warning'} startIcon={<Iconify icon="basil:save-outline" />}>
                      {isNew ? 'Save' : 'Update'} Location
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
};

export default ModalForm;
