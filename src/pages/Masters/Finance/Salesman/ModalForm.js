import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Select, MenuItem, Checkbox, FormControl, InputLabel, FormHelperText, Box, Typography, FormControlLabel } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';

const ModalForm = ({ open, onClose, initialValues }) => {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [taxTreatmentOptions, setTaxTreatmentOptions] = useState([]);
  const [isNew, setIsNew] = useState(true);

  useEffect(() => {
    const fetchCurrencyAndTaxTreatmentOptions = async () => {
      const currencyOptions = [
        { value: 'USD', label: 'USD' },
        { value: 'EUR', label: 'EUR' },
      ];
      const taxTreatmentOptions = [
        { value: 'standard', label: 'Standard' },
        { value: 'exempt', label: 'Exempt' },
      ];
      return { currencyOptions, taxTreatmentOptions };
    };

    if (initialValues !== null) {
      setIsNew(false);
    }

    fetchCurrencyAndTaxTreatmentOptions()
      .then(({ currencyOptions, taxTreatmentOptions }) => {
        setCurrencyOptions(currencyOptions);
        setTaxTreatmentOptions(taxTreatmentOptions);
      })
      .catch((error) => {
        console.error('Error fetching options:', error);
      });
  }, [initialValues]);

  const validationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    code: yup.string().required('Code is required'),
    address: yup.string().required('Address is required'),
    mobile: yup.string().matches(/^[0-9]+$/, 'Mobile must be a number').required('Mobile is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    trn: yup.string().required('TRN is required'),
    currency: yup.string().required('Currency is required'),
    taxTreatment: yup.string().required('Tax Treatment is required'),
  });

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '90%', sm: '500px', md: "720px" },
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          p: 3,
          mx: 'auto',
          mt: { xs: '10%', md: '5%' },
        }}
      >
        <Typography variant="h4" component="h2" sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between' }}>
          {isNew ? "Create Salesman" : "Update Salesman"}
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <Grid container spacing={2} >
        
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Code"
                    name="code"
                    value={values?.code}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    type="text"
                    value={values?.description}
                    onChange={handleChange}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    name="mobile"
                    type="text"
                    value={values?.mobile}
                    onChange={handleChange}
                    error={Boolean(touched.mobile && errors.mobile)}
                    helperText={touched.mobile && errors.mobile}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={values?.email}
                    onChange={handleChange}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
            
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Button variant="contained" color="error" startIcon={<Iconify icon="mdi:cancel" />} onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<Iconify icon="basil:save-outline" />}>
                      {isNew ? "Save" : "Update"} Salesman
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
