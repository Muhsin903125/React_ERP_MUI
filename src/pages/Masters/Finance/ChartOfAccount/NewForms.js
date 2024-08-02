import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, TextField, Select, MenuItem, Checkbox, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';

const AccountForm = ({ open, onClose, initialValues, onSubmit }) => {
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [taxTreatmentOptions, setTaxTreatmentOptions] = useState([]);

  useEffect(() => {
    // Replace with your actual API calls or data fetching logic
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

    fetchCurrencyAndTaxTreatmentOptions()
      .then(({ currencyOptions, taxTreatmentOptions }) => {
        setCurrencyOptions(currencyOptions);
        setTaxTreatmentOptions(taxTreatmentOptions);
      })
      .catch((error) => {
        console.error('Error fetching options:', error);
      });
  }, []);

  const validationSchema = yup.object().shape({
    accountDescription: yup.string().required('Account Description is required'),
    currency: yup.string().required('Currency is required'),
    narration: yup.string(),
    taxTreatment: yup.string().required('Tax Treatment is required'),
  });
  return (
    <Modal open={open} onClose={onClose}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <Form>
            <TextField
              fullWidth
              label="Account Description"
              name="accountDescription"
              value={values.accountDescription}
              onChange={handleChange}
              error={Boolean(touched.accountDescription && errors.accountDescription)}
              helperText={touched.accountDescription && errors.accountDescription}
            />
            <TextField
              fullWidth
              label="Code"
              name="code"
              value={values.code}
              disabled // Assuming code is auto-generated
            />
            <FormControl fullWidth>
              <InputLabel id="currency-label">Currency</InputLabel>
              <Select
                labelId="currency-label"
                id="currency"
                name="currency"
                value={values.currency}
                onChange={handleChange}
                error={Boolean(touched.currency && errors.currency)}
                helperText={touched.currency && errors.currency}
              >
                {currencyOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Narration"
              name="narration"
              multiline
              rows={4}
              value={values.narration}
              onChange={handleChange}
            />
            <Checkbox
              name="accountOnStop"
              checked={values.accountOnStop}
              onChange={handleChange}
              label="Account on Stop"
            />
            <FormControl fullWidth>
              <InputLabel id="taxTreatment-label">Tax Treatment</InputLabel>
              <Select
                labelId="taxTreatment-label"
                id="taxTreatment"
                name="taxTreatment"
                value={values.taxTreatment}
                onChange={handleChange}
                error={Boolean(touched.taxTreatment && errors.taxTreatment)}
                helperText={touched.taxTreatment && errors.taxTreatment}
              >
                {taxTreatmentOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary">
              Save
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default AccountForm;
