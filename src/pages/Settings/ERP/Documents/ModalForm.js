import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, CheckBox, FormControlLabel, Checkbox, MenuItem, InputLabel, FormControl, Select, RadioGroup, Radio, Autocomplete } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { GetSingleListResult, GetSingleResult, PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

/**
 * ModalForm Component
 * Handles the creation and editing of document settings
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls modal visibility
 * @param {Function} props.onClose - Callback for closing modal
 * @param {Object} props.initialValues - Initial form values for editing
 */
const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState('');
  const [codeEditable, setCodeEditable] = useState(false);
  const [taxTreat, setTaxTreat] = useState([]);
  const [account, setAccount] = useState([]);

  // Initialize form data and fetch required lists
  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      getCode();
      setIsNew(true);
    }
    getTaxTreat();
    getAccount();
  }, [initialValues]);

  // Form validation schema
  const validationSchema = yup.object().shape({
    docCode: yup.string().required('Doc Code is required'),
    desc: yup.string().required('Description is required'),
    // debitAccount: yup.string().required('Debit Account is required'),
    // creditAccount: yup.string().required('Credit Account is required'),
    // taxTreatment: yup.string().required('Tax Treatment is required'),
  });

  /**
   * Fetches the next available document code
   */
  const getCode = async () => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        key: 'LAST_NO',
        TYPE: 'DOC',
      });

      if (Success) {
        setCode(Data.LAST_NO);
        setCodeEditable(Data?.IS_EDITABLE);
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error fetching document code:', error);
    }
  };

  /**
   * Handles form submission for both create and update operations
   * @param {Object} data - Form data
   * @param {string} type - Operation type ('ADD' or 'UPDATE')
   */
  const HandleData = async (data, type) => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        key: "DOC_CRUD",
        TYPE: type,
        DM_CODE: data.docCode,
        DM_DESC: data.desc,
        DM_ACCOUNT_IMPACT: data.accountImpact ? 1 : 0,
        DM_STOCK_IMPACT: data.stockImpact ? 1 : 0,
        DM_DEBIT_ACCOUNT: data.debitAccount,
        DM_CREDIT_ACCOUNT: data.creditAccount,
        DM_TAX_TREATMENT: Number(data.taxTreatment),
        DM_STOCK_UP_OR_DOWN: Number(data.stockUpDown),
      });

      if (Success) {
        showToast(Message, 'success');
        onClose();
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error handling document data:", error);
    }
  };

  /**
   * Fetches tax treatment options
   */
  const getTaxTreat = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: 'LOOKUP',
        TYPE: 'CAO_ACTYPE',
      });

      if (Success) {
        setTaxTreat(Data);
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error fetching tax treatments:', error);
    }
  };

  /**
   * Fetches account list for selection
   */
  const getAccount = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: "COA_CRUD",
        TYPE: "GET_ALL_ACCOUNT",
      });
      if (Success) {
        setAccount(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '90%', sm: '500px', md: "800px" },
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          p: 3,
          mx: 'auto',
          mt: { xs: '10%', md: '5%' },
        }}
      >
        <Typography variant="h4" component="h2" sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between' }}>
          {isNew ? "Create Document" : "Update Document"}
        </Typography>

        <Formik
          initialValues={{
            docCode: initialValues?.DM_CODE || code,
            desc: initialValues?.DM_DESC || '',
            accountImpact: initialValues?.DM_ACCOUNT_IMPACT || false,
            stockImpact: initialValues?.DM_STOCK_IMPACT || false,
            debitAccount: initialValues?.DM_DEBIT_ACCOUNT || '',
            creditAccount: initialValues?.DM_CREDIT_ACCOUNT || '',
            taxTreatment: initialValues?.DM_TAX_TREATMENT || '',
            stockUpDown: initialValues?.DM_STOCK_UP_OR_DOWN || '1',
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
          {({ values, errors, touched, handleChange, setFieldValue }) => (
            <Form>
              <Grid container spacing={2}>
                {/* Document Code Field */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Doc Code"
                    name="docCode"
                    value={values.docCode}
                    onChange={handleChange}
                    error={Boolean(touched.docCode && errors.docCode)}
                    helperText={touched.docCode && errors.docCode}
                  />
                </Grid>

                {/* Description Field */}
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

                {/* Debit Account Autocomplete */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Autocomplete
                      options={account || []}
                      getOptionLabel={(option) => `${option.AC_CODE} - ${option.AC_DESC}`}
                      value={account?.find(item => item.AC_CODE === values.debitAccount) || null}
                      onChange={(event, newValue) => {
                        setFieldValue('debitAccount', newValue?.AC_CODE || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Debit Account"
                          error={Boolean(touched.debitAccount && errors.debitAccount)}
                          helperText={touched.debitAccount && errors.debitAccount}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Credit Account Autocomplete */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <Autocomplete
                      options={account || []}
                      getOptionLabel={(option) => `${option.AC_CODE} - ${option.AC_DESC}`}
                      value={account?.find(item => item.AC_CODE === values.creditAccount) || null}
                      onChange={(event, newValue) => {
                        setFieldValue('creditAccount', newValue?.AC_CODE || '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Credit Account"
                          error={Boolean(touched.creditAccount && errors.creditAccount)}
                          helperText={touched.creditAccount && errors.creditAccount}
                        />
                      )}
                    />
                  </FormControl>
                </Grid>

                {/* Tax Treatment Select */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.taxTreatment && errors.taxTreatment)}>
                    <InputLabel>Tax treatment</InputLabel>
                    <Field
                      as={Select}
                      label="Tax treatment"
                      name="taxTreatment"
                      value={values.taxTreatment}
                      onChange={handleChange}
                    >
                      {taxTreat?.map((item) => (
                        <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                          {item.LK_VALUE}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.taxTreatment && errors.taxTreatment && (
                      <Typography color="error" variant="caption">
                        {errors.taxTreatment}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {/* Impact Checkboxes */}
                <Grid item xs={12} sm={6} justifyContent="center" alignItems="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        fullWidth
                        checked={values.stockImpact === 1}
                        name="stockImpact"
                        onChange={e => setFieldValue('stockImpact', e.target.checked ? 1 : 0)}
                        error={Boolean(touched.stockImpact && errors.stockImpact)}
                      />
                    }
                    label="Stock Impact"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        fullWidth
                        checked={values.accountImpact === 1}
                        name="accountImpact"
                        onChange={e => setFieldValue('accountImpact', e.target.checked ? 1 : 0)}
                        error={Boolean(touched.accountImpact && errors.accountImpact)}
                      />
                    }
                    label="Account Impact"
                  />
                </Grid>

                {/* Stock Direction Radio Group */}
                {values.stockImpact===1 && (
                  <Grid item xs={12} sm={6} justifyContent="center" alignItems="center">
                    <RadioGroup
                      row
                      name="stockUpDown"
                      value={values.stockUpDown}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="1" control={<Radio />} label="Stock Up" />
                      <FormControlLabel value="-1" control={<Radio />} label="Stock Down" />
                    </RadioGroup>
                  </Grid>
                )}

                {/* Action Buttons */}
                <Grid item xs={12} sm={12}>
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
                      color={isNew ? "success" : "warning"} 
                      startIcon={<Iconify icon="basil:save-outline" />}
                    >
                      {isNew ? "Save" : "Update"} Document
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
