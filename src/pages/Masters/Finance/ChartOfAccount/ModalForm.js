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
    accountDescription: yup.string().required('Account Description is required'),
    currency: yup.string().required('Currency is required'),
    narration: yup.string(),
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
          {isNew ? "Create Chart of Account" : "Update Chart of Account"}
          {/* <Button onClick={onClose} color="secondary" size="small">
            Close
          </Button> */}
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account Description"
                    name="accountDescription"
                    value={values?.accountDescription}
                    onChange={handleChange}
                    error={Boolean(touched.accountDescription && errors.accountDescription)}
                    helperText={touched.accountDescription && errors.accountDescription}

                  />
                </Grid>
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
                  <FormControl fullWidth sx={{ mb: 1 }}>
                    <InputLabel id="currency-label">Currency</InputLabel>
                    <Select
                      labelId="currency-label"
                      id="currency"
                      name="currency"
                      value={values?.currency}
                      onChange={handleChange}
                      error={Boolean(touched.currency && errors.currency)}
                    >
                      {currencyOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{touched.currency && errors.currency}</FormHelperText>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth sx={{ mb: 1 }}>
                    <InputLabel id="taxTreatment-label">Tax Treatment</InputLabel>
                    <Select
                      labelId="taxTreatment-label"
                      id="taxTreatment"
                      name="taxTreatment"
                      value={values?.taxTreatment}
                      onChange={handleChange}
                      error={Boolean(touched.taxTreatment && errors.taxTreatment)}
                    >
                      {taxTreatmentOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>{touched.taxTreatment && errors.taxTreatment}</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="Narration"
                    name="narration"
                    multiline
                    rows={2}
                    value={values?.narration}
                    onChange={handleChange}

                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values?.accountOnStop}
                        // onChange={(e) => setActive(e.target.checked)}
                        onChange={handleChange}
                        color="primary"
                        size="large"
                        sx={{
                          '& .MuiSvgIcon-root': {
                            fontSize: 25,
                            borderRadius: 50
                          },
                        }}
                      />
                    }
                    label={
                      <Typography sx={{ fontSize: 14 }}>
                        Account On Stop
                      </Typography>
                    }
                    labelPlacement="end"
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between"  >
                    <Button variant="contained" color="error" startIcon={<Iconify icon="mdi:cancel"  />} onClick={onClose} >
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" startIcon={<Iconify icon="basil:save-outline" />}  >
                      {isNew ? "Save" : "Update"} Chart Of Account
                    </Button>
                  </Stack>  
                  {/* <Button
                    type="submit"
                    variant="contained"
                    size='large'
                    color={isNew ? "primary" : "warning"}
                  >
                    {isNew ? "Save" : "Update"}
                  </Button> */}
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
