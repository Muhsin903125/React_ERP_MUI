import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues ,parentId}) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [codeEditable, setCodeEditable] = useState(false);
  const [parents, setParents] = useState([]);
  const [accountType, setAccountType] = useState([]);
  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
      getCode();
      getParents();
      getAccountType();
    }
  }, [initialValues, open]);

  const validationSchema = yup.object().shape({
    code: yup.string().required('Code is required'),
    desc: yup.string().required('Description is required'),
    parent: yup.string(),
    acType: yup.string(),
    accNo: yup.string(), 
  });

  const HandleData = async (data, type) => {
    try {
      const { Success, Message } = await PostCommonSp({
        "key": "COA_CRUD",
        "TYPE": type, // Pass the type as a parameter
        "ACMAIN_CODE": data.code,
        "ACMAIN_DESC": data.desc,
        "ACMAIN_PARENT": data.parent,
        "ACMAIN_ACTYPE_DOCNO": initialValues?.ACMAIN_ACTYPE_DOCNO === "GH" ? "GL" : "GH",
        "ACMAIN_ACCNO": data.accNo,
        "ACMAIN_ACTYPE": data.acType

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
        "TYPE": "GET_ALL",
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
        setAccountType(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  }
  const getCode = async () => {
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
            acType: initialValues?.ACMAIN_ACTYPE || '',
            accNo: initialValues?.ACMAIN_ACCNO || '',
            
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (isNew)
              HandleData(values, 'ADD');
            else
              HandleData(values, 'UPDATE');
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
                      name="parent"
                      value={values.parent}
                      onChange={handleChange}
                    >
                      {parents.map((item) => (
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
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Account No"
                    name="accNo" // Ensure this matches the validation schema
                    value={values.accNo} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.accNo && errors.accNo)}
                    helperText={touched.accNo && errors.accNo}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.acType && errors.acType)}>
                    <InputLabel>Account Type</InputLabel>
                    <Field
                      as={Select}
                      label="Account Type"
                      name="acType"
                      value={values.acType}
                      onChange={handleChange}
                    >
                      {accountType.map((item) => (
                        <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
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
                </Grid>
                  

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
