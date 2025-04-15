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
  const [Roles, setRoles] = useState([]); 

  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
     
    }
    getRoles();
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
        key: 'USR_CRUD',
        TYPE: type,
        USR_CODE: data.code ,
        USR_FNAME: data.fname,
        USR_LNAME: data.lname,
        SUP_EMAIL: data.email, 
        SUP_MOB: data.mobile.toString(),  
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
 

  const getRoles = async () => {
    try {
      const { Success, Data, Message } = await PostCommonSp({
        key: 'USR_CRUD',
        TYPE: 'GET_ROLES',
      });

      if (Success) {
        setRoles(Data[0]);
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
          {isNew ? 'Create User' : 'Update User'}
        </Typography>

        <Formik
          initialValues={{
            code: initialValues?.USR_CODE || '',
            fname: initialValues?.USR_FNAME || '',
            lname: initialValues?.USR_LNAME || '',
            email: initialValues?.USR_EMAIL || '',
            mobile: initialValues?.USR_MOBILE || '',
            role: initialValues?.USR_ROLE || '', 
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
                    label="First Name"
                    name="fname"
                    value={values.fname}
                    onChange={handleChange}
                    error={Boolean(touched.fname && errors.fname)}
                    helperText={touched.fname && errors.fname}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lname"
                    value={values.lname}
                    onChange={handleChange}
                    error={Boolean(touched.lname && errors.lname)}
                    helperText={touched.lname && errors.lname}
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
                
                {/* <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.role && errors.role)}>
                    <InputLabel>Role</InputLabel>
                    <Field
                      as={Select}
                      label="Tax treatment"
                      name="role"
                      value={values.role}
                      onChange={handleChange}
                    >
                      {Roles.map((item) => (
                        <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                          {item.LK_VALUE}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.role && errors.role && (
                      <Typography color="error" variant="caption">
                        {errors.role}
                      </Typography>
                    )}
                  </FormControl>
                </Grid> */}
                
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
                      {isNew ? 'Save' : 'Update'} User
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
