import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, CheckBox, FormControlLabel, Checkbox, MenuItem, InputLabel, FormControl, Select, RadioGroup, Radio } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { GetSingleListResult, GetSingleResult, PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState('');
  const [codeEditable, setCodeEditable] = useState(false);
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

  const validationSchema = yup.object().shape({
    docCode: yup.string().required('Doc Code is required'),
    desc: yup.string().required('Description is required'),
    debitAccount: yup.string().required('Debit Account is required'),
    creditAccount: yup.string().required('Credit Account is required'),
    taxTreatment: yup.string().required('Tax Treatment is required'),
    // stockUpDown: yup.string().when('stockImpact', {
    //   is: true,
    //   then: yup.string().required('Stock Up or Down is required'),
    //   otherwise: yup.string().notRequired(),
    // }),
  });
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
      console.error('Error:', error);
    }
  };
  const HandleData = async (data, type) => {

    try {
      const { Success, Data, Message } = await GetSingleResult({
        "key": "DOC_CRUD",
        "TYPE": type, // Pass the type as a parameter
        "DM_CODE": data.docCode,
        "DM_DESC": data.desc,
        "DM_ACCOUNT_IMPACT": data.accountImpact ? 1 : 0,
        "DM_STOCK_IMPACT": data.stockImpact ? 1 : 0,
        "DM_DEBIT_ACCOUNT": data.debitAccount,
        "DM_CREDIT_ACCOUNT": data.creditAccount,
        "DM_TAX_TREATMENT": Number(data.taxTreatment),
        "DM_STOCK_UP_OR_DOWN": Number(data.stockUpDown),
      });

      if (Success) {
        showToast(Message, 'success');
        onClose();
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  };

  const [taxTreat, setTaxTreat] = useState([]);
  const [account, setAccount] = useState([]);
  const getTaxTreat = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: 'LOOKUP',
        TYPE: 'CAO_ACTYPE',
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
  const getAccount = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "COA_CRUD",
        "TYPE": "GET_ALL_ACCOUNT",
      });
      if (Success) {
        setAccount(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  }
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
            // id: initialValues?.R_CODE || '',  
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log("sdsdsd", values);

            if (isNew)
              HandleData(values, 'ADD');
            else
              HandleData(values, 'UPDATE');
          }}
        >
          {({ values, errors, touched, handleChange, setFieldValue }) => (
            <Form>
              <Grid container spacing={2}>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    // disabled={isNew ? !codeEditable : true}
                    label="Doc Code"
                    name="docCode" // Ensure this matches the validation schema
                    value={values.docCode} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.docCode && errors.docCode)}
                    helperText={touched.docCode && errors.docCode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="desc" // Ensure this matches the validation schema
                    value={values.desc} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.desc && errors.desc)}
                    helperText={touched.desc && errors.desc}
                  />
                </Grid>


                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Debit Account</InputLabel>
                    <Field
                      as={Select}
                      label="Debit Account"
                      name="debitAccount" // Ensure this matches the validation schema
                      value={values.debitAccount} // Use values.name instead of values.R_NAME
                      onChange={handleChange} // This will now work correctly 
                    >
                      {account?.map((item) => (
                        <MenuItem key={`${item.ACMST_CODE} debit`} value={item.ACMST_CODE}>
                          {item.ACMST_ACCNO} - {item.ACMST_DESC}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Credit Account</InputLabel>
                    <Field
                      as={Select}
                      label="Credit Account"
                      name="creditAccount" // Ensure this matches the validation schema
                      value={values.creditAccount} // Use values.name instead of values.R_NAME
                      onChange={handleChange} // This will now work correctly 
                    >
                      {account?.map((item) => (
                        <MenuItem key={`${item.ACMST_CODE} credit`} value={item.ACMST_CODE}>
                          {item.ACMST_ACCNO} - {item.ACMST_DESC}
                        </MenuItem>
                      ))}
                    </Field>
                  </FormControl>
                </Grid>
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

                <Grid item xs={12} sm={6} justifyContent="center" alignItems="center"  >
                  <FormControlLabel
                    control={<Checkbox
                      fullWidth
                      checked={!isNew ? values.stockImpact === 1 : values.stockImpact}
                      label="Stock Impact"
                      name="stockImpact"
                      value={values.stockImpact}
                      onChange={handleChange}
                      error={Boolean(touched.stockImpact && errors.stockImpact)}
                      helperText={touched.stockImpact && errors.stockImpact}
                    />}
                    label="Stock Impact"
                  />
                  <FormControlLabel
                    control={<Checkbox
                      fullWidth
                      checked={!isNew ? values.accountImpact === 1 : values.accountImpact}
                      label="Account Impact"
                      name="accountImpact"
                      value={values.accountImpact}
                      onChange={handleChange}
                      error={Boolean(touched.accountImpact && errors.accountImpact)}
                      helperText={touched.accountImpact && errors.accountImpact}
                    />}
                    label="Account Impact"
                  />
                </Grid>
                {values.stockImpact && (
                  <Grid item xs={12} sm={6} justifyContent="center" alignItems="center"  >
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
                <Grid item xs={12} sm={12}>

                  <Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <Button variant="outlined" color="error" startIcon={<Iconify icon="mdi:cancel" />}
                      sx={{ mr: 2 }}
                      onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color={isNew ? "success" : "warning"} startIcon={<Iconify icon="basil:save-outline" />}>
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
