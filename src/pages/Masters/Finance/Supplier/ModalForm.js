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
  const [taxTreat, setTaxTreat] = useState([]);
  const [codeEditable, setCodeEditable] = useState(false);

  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
      getCode();
    }
    getTaxTreat();
  }, [initialValues, open]);

  const validationSchema = yup.object().shape({
    docNo: yup.string().required('Doc No is required'),
    desc: yup.string().required('Description is required'),
    email: yup.string().email('Invalid email format'),
    mobile: yup.string().required('Mobile number is required'),
    trn: yup.string().max(15, 'TRN must be at most 15 characters'),
    address: yup.string(),
    tax: yup.string().required('Tax treatment is required'),
  });

  const HandleData = async (data, type) => {
    try {
      const { Success, Message } = await PostCommonSp({
        key: 'SUP_CRUD',
        TYPE: type,
        SUP_DOCNO: data.docNo,
        SUP_DESC: data.desc,
        SUP_EMAIL: data.email,
        SUP_TRN: data.trn,
        SUP_ADDRESS: data.address,
        SUP_MOB: data.mobile.toString(),
        SUP_TAX_TREATMENT: data.tax || 'SR',
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
        TYPE: 'SUP',
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
          {isNew ? 'Create Supplier' : 'Update Supplier'}
        </Typography>

        <Formik
          initialValues={{
            docNo: initialValues?.SUP_DOCNO || code,
            desc: initialValues?.SUP_DESC || '',
            email: initialValues?.SUP_EMAIL || '',
            mobile: initialValues?.SUP_MOB || '',
            address: initialValues?.SUP_ADDRESS || '',
            trn: initialValues?.SUP_TRN || '',
            tax: initialValues?.SUP_TAX_TREATMENT || '',
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
                    label="Doc No"
                    disabled={isNew ? !codeEditable : true}
                    name="docNo"
                    value={values.docNo}
                    onChange={handleChange}
                    error={Boolean(touched.docNo && errors.docNo)}
                    helperText={touched.docNo && errors.docNo}
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
                    type="email"
                    label="Email"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Mobile"
                    name="mobile"
                    value={values.mobile}
                    onChange={handleChange}
                    error={Boolean(touched.mobile && errors.mobile)}
                    helperText={touched.mobile && errors.mobile}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="TRN"
                    name="trn"
                    value={values.trn}
                    onChange={handleChange}
                    error={Boolean(touched.trn && errors.trn)}
                    helperText={touched.trn && errors.trn}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.tax && errors.tax)}>
                    <InputLabel>Tax treatment</InputLabel>
                    <Field
                      as={Select}
                      label="Tax treatment"
                      name="tax"
                      value={values.tax}
                      onChange={handleChange}
                    >
                      {taxTreat.map((item) => (
                        <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
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
                <Grid item xs={12} >
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
                      {isNew ? 'Save' : 'Update'} Supplier
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
