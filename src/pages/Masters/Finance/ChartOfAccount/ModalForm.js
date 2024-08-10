import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [codeEditable, setCodeEditable] = useState(false);
  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
      getCode();
    }
  }, [initialValues, open]);

  const validationSchema = yup.object().shape({
    docNo: yup.string().required('Doc No is required'),
    desc: yup.string().required('Description is required'),
    email: yup.string(),
    mobile: yup.string(),
    trn: yup.string().max(15),
    address: yup.string(),
  });

  const HandleData = async (data, type) => {
    try {
      const { Success, Message } = await PostCommonSp({
        "key": "CUS_CRUD",
        "TYPE": type, // Pass the type as a parameter
        "CUS_DOCNO": data.docNo,
        "CUS_DESC": data.desc,
        "CUS_EMAIL": data.email,
        "CUS_TRN": data.trn,
        "CUS_ADDRESS": data.address,
        "CUS_MOB": (data.mobile).toString(),
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

  const getCode = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        "key": "LAST_NO",
        "TYPE": "CUS",
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
          {isNew ? "Create Customer" : "Update Customer"}
        </Typography>

        <Formik
          initialValues={{
            docNo: initialValues?.CUS_DOCNO || code,
            desc: initialValues?.CUS_DESC || '',
            email: initialValues?.CUS_EMAIL || '',
            mobile: initialValues?.CUS_MOB || '',
            address: initialValues?.CUS_ADDRESS || '',
            trn: initialValues?.CUS_TRN || '', 
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
                    label="Doc No"
                    disabled={isNew ? !codeEditable : true}
                    name="docNo" //  Ensure this matches the validation schema
                    value={values.docNo} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.docNo && errors.docNo)}
                    helperText={touched.docNo && errors.docNo}
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
                  <TextField
                    fullWidth
                    type='email'
                    label="Email"
                    name="email" // Ensure this matches the validation schema
                    value={values.email} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                 <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type='number'
                    label="Mobile"
                    name="mobile" // Ensure this matches the validation schema
                    value={values.mobile} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.mobile && errors.mobile)}
                    helperText={touched.mobile && errors.mobile}
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth                     
                    label="Address"
                    name="address" // Ensure this matches the validation schema
                    value={values.address} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.address && errors.address)}
                    helperText={touched.address && errors.address}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth 
                  
                    label="TRN"
                    name="trn" // Ensure this matches the validation schema
                    value={values.trn} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.trn && errors.trn)}
                    helperText={touched.trn && errors.trn}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <Button variant="outlined" color="error" startIcon={<Iconify icon="mdi:cancel" />}
                      sx={{ mr: 2 }}
                      onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color={isNew ? "success" : "warning"} startIcon={<Iconify icon="basil:save-outline" />}>
                      {isNew ? "Save" : "Update"} Customer
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
