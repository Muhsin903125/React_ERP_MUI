import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, Paper } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues, parentId, grpCode }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [codeEditable, setCodeEditable] = useState(false);
  const [parents, setParents] = useState([]);
  const [accountType, setAccountType] = useState([]);
  const [taxTreat, setTaxTreat] = useState([]);
  const [defaultBalance, setDefaultBalance] = useState([]);
  const [accountCode, setAccountCode] = useState(null);
  const [accountCodeEditable, setAccountCodeEditable] = useState(false);
  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
      getCOACode();
      getParents();
      getAccountType();
      getTaxTreat();
      getAccountCode();
    }
    console.log(grpCode, "grpCode");
  }, [initialValues, open]);

 
const validationSchema = yup.object().shape({
  code: yup.string().required('Code is required'),
  desc: yup.string().required('Description is required'),
  parent: yup.string().nullable(),
  isGroup: yup.boolean(),

  accNo: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Account Number is required'),
    otherwise: schema => schema.nullable(),
  }),

  defaultBalance: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Default Balance is required'),
    otherwise: schema => schema.nullable(),
  }),

  tax: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Tax is required'),
    otherwise: schema => schema.nullable(),
  }),

  accCode: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Account Code is required'),
    otherwise: schema => schema.nullable(),
  }),

  accDesc: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Name is required'),
    otherwise: schema => schema.nullable(),
  }),

  enableAccount: yup.boolean(),
  remark: yup.string().nullable(),
});
  const getTaxTreat = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        key: 'LOOKUP',
        TYPE: 'TAX_TREAT',
      });

      if (Success) {
        setTaxTreat(Data);
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const HandleData = async (data, type) => {
    try {
      const { Success, Message } = await PostCommonSp({
        "key": "COA_CRUD",
        "TYPE": type, // Pass the type as a parameter
        "ACMAIN_CODE": data.code,
        "ACMAIN_DESC": data.desc,
        "ACMAIN_PARENT": data.parent,
        "ACMAIN_ACTYPE_DOCNO": grpCode === "GH" ? (data.isGroup ? "GH" : "GL") : 'GL',
        "ACMAIN_DEFAULT_BALANCE_SIGN": data.defaultBalance,
        // "ACMAIN_ACTYPE": data.acType,
        "ACMAIN_ACCNO": data.accNo,
        "ACMAIN_ACCOUNT_TAX": data.tax,
        "ACMAIN_ACCOUNT_ON_STOP": !data.enableAccount ? 0 : 1,
        "ACMAIN_ACC_CODE": data.accCode,
        "ACMAIN_ACCOUNT_REMARK": data.remark,
        "ACMAIN_ACCOUNT_DESC": data.accDesc,
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
  const getParents = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        "key": "COA_CRUD",
        "TYPE": "GET_ALL_GH",
      });
      if (Success) {
        setParents(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  }
  const getAccountType = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        "key": "LOOKUP",
        "TYPE": "CAO_ACTYPE",
      });
      if (Success) {
        // setAccountType(Data);
        setDefaultBalance(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  }
  const getCOACode = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        "key": "LAST_NO",
        "TYPE": "COA",
      });

      if (Success) {
        setCode(Data?.LAST_NO);
        setCodeEditable(Data?.IS_EDITABLE);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  };
  const getAccountCode = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        "key": "LAST_NO",
        "TYPE": "ACC",
      });

      if (Success) {
        setAccountCode(Data?.LAST_NO);
        setAccountCodeEditable(Data?.IS_EDITABLE);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '90%', sm: '550px', md: "720px" },
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
        </Typography>

        <Formik
          initialValues={{
            code: initialValues?.ACMAIN_CODE || code,
            desc: initialValues?.ACMAIN_DESC || '',
            parent: initialValues?.ACMAIN_PARENT || parentId,
            // acType: initialValues?.ACMAIN_ACTYPE || '',
            accNo: initialValues?.ACMAIN_ACCNO || '',
            isGroup: initialValues?.ACMAIN_ACTYPE_DOCNO==="GH" || false,
            defaultBalance: initialValues?.ACMAIN_DEFAULT_BALANCE_SIGN || '',
            tax: initialValues?.ACMAIN_ACCOUNT_TAX || '',
            accCode: initialValues?.ACMAIN_ACC_CODE || accountCode,
            enableAccount: initialValues?.ACMAIN_ACCOUNT_ON_STOP===0 || true,
            remark: initialValues?.ACMAIN_ACCOUNT_REMARK || '',
            accDesc: initialValues?.ACMAIN_ACCOUNT_DESC
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
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
                    label="Code"
                    size='small'
                    disabled={isNew ? !codeEditable : true}
                    name="code" //  Ensure this matches the validation schema
                    value={values.code} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.code && errors.code)}
                    helperText={touched.code && errors.code}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Description"
                    size='small'
                    name="desc" // Ensure this matches the validation schema
                    value={values.desc} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.desc && errors.desc)}
                    helperText={touched.desc && errors.desc}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.parent && errors.parent)}>
                    <InputLabel>Parent</InputLabel>
                    <Field
                      as={Select}
                      label="Parent"
                      size='small'
                      name="parent"
                      value={values.parent}
                      onChange={handleChange}
                    >
                      {parents.length > 0 && parents.map((item) => (
                        <MenuItem key={item.ACMAIN_CODE} value={item.ACMAIN_CODE}>
                          {item.ACMAIN_DESC}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.parent && errors.parent && (
                      <Typography color="error" variant="caption">
                        {errors.parent}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                {grpCode === "GH" && <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={<Checkbox checked={values.isGroup} onChange={(e) => setFieldValue('isGroup', e.target.checked)} />}
                    label="Is Group"
                  />
                </Grid>
                }
                {(grpCode !== "GH" || !values.isGroup) &&
                  <Grid item xs={12} sm={12}>
                    <Paper sx={{ p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                      <Typography variant="h6" gutterBottom mb={2}>
                        Account Details
                      </Typography>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Account Code"
                            size="small"
                            disabled={isNew ? !accountCodeEditable : true}
                            name="accCode"
                            value={values.accCode}
                            onChange={handleChange}
                            error={Boolean(touched.accCode && errors.accCode)}
                            helperText={touched.accCode && errors.accCode}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Account No"
                            size="small"
                            name="accNo"
                            value={values.accNo}
                            onChange={handleChange}
                            error={Boolean(touched.accNo && errors.accNo)}
                            helperText={touched.accNo && errors.accNo}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Account Name"
                            size="small"
                            name="accDesc"
                            value={values.accDesc}
                            onChange={handleChange}
                            error={Boolean(touched.accDesc && errors.accDesc)}
                            helperText={touched.accDesc && errors.accDesc}
                          />
                        </Grid>
                        {/* <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small" error={Boolean(touched.acType && errors.acType)}>
                            <InputLabel>Account Type</InputLabel>
                            <Field
                              as={Select}
                              label="Account Type"
                              size="small"
                              name="acType"
                              value={values.acType}
                              onChange={handleChange}
                            >
                              {accountType.map((item) => (
                                <MenuItem size='small' key={item.LK_KEY} value={item.LK_KEY}>
                                  {item.LK_VALUE}
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.acType && errors.acType && (
                              <Typography color="error" variant="caption">
                                {errors.acType}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid> */}
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size='small' error={Boolean(touched.tax && errors.tax)}>
                            <InputLabel>Tax treatment</InputLabel>
                            <Field
                              as={Select}
                              label="Tax treatment"
                              size='small'
                              name="tax"
                              value={values.tax}
                              onChange={handleChange}
                            >
                              {taxTreat.map((item) => (
                                <MenuItem size='small' key={item.LK_KEY} value={item.LK_KEY}>
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
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small" error={Boolean(touched.defaultBalance && errors.defaultBalance)}>
                            <InputLabel>Default Balance</InputLabel>
                            <Field
                              as={Select}
                              label="Default Balance"
                              size="small"
                              name="defaultBalance"
                              value={values.defaultBalance}
                              onChange={handleChange}
                            >
                              {defaultBalance.map((item) => (
                                <MenuItem size='small' key={item.LK_KEY} value={item.LK_KEY}>
                                  {item.LK_VALUE}
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.defaultBalance && errors.defaultBalance && (
                              <Typography color="error" variant="caption">
                                {errors.defaultBalance}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid> 
                        <Grid item xs={12} sm={6}>
                          <FormControlLabel
                            control={<Checkbox size= "small" checked={values.enableAccount} onChange={(e) => setFieldValue('enableAccount', e.target.checked)} />}
                            label="Enable Account"
                          />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <TextField
                            fullWidth
                            label="ٌRemarks"
                            size="small"
                            name="remark"
                            multiline
                            rows={2}
                            value={values.remark}
                            onChange={handleChange}
                            error={Boolean(touched.remark && errors.remark)}
                            helperText={touched.remark && errors.remark}
                          />
                        </Grid>
                       
                      </Grid>
                    </Paper>

                  </Grid>
                }


                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <Button variant="outlined" color="error" startIcon={<Iconify icon="mdi:cancel" />}
                      sx={{ mr: 2 }}
                      onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color={isNew ? "success" : "warning"} startIcon={<Iconify icon="basil:save-outline" />}>
                      {isNew ? "Save" : "Update"} Chart of Account
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
