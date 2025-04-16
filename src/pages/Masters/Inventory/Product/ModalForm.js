import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [unit, setUnit] = useState([]);
  const [codeEditable, setCodeEditable] = useState(false);

  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
      getCode();
    }
      getUnit();
  }, [initialValues, open]);

  const validationSchema = yup.object().shape({
    code: yup.string().required('Code is required'),
    desc: yup.string().required('Description is required'),
    unit: yup.string().required('Unit is required'),
    price: yup.string().required('Price is required'), 
  });

  const HandleData = async (data, type) => {
    try {
      const { Success, Message } = await GetSingleResult({
        key: 'ITEM_CRUD',
        TYPE: type,
        IM_CODE: data.code,
        IM_DESC: data.desc,
        IM_UNIT_CODE: data.unit,
        IM_PRICE: data.price, 
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
      const { Success, Data, Message } = await GetSingleResult({
        key: 'LAST_NO',
        TYPE: 'PRODUCT',
      });

      if (Success) {
        setCode(Data.LAST_NO);
        setCodeEditable(Data.IS_EDITABLE);
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getUnit = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: 'LOOKUP',
        TYPE: 'UNITS',
      });

      if (Success) {
        setUnit(Data);
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
          {isNew ? 'Create Product' : 'Update Product'}
        </Typography>

        <Formik
          initialValues={{
            code: initialValues?.IM_CODE || code,
            desc: initialValues?.IM_DESC || '',
            unit: initialValues?.IM_UNIT_CODE || '',
            price: initialValues?.IM_PRICE || '', 
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
                    label="Code"
                    disabled={isNew ? !codeEditable : true}
                    name="code"
                    value={values.code}
                    onChange={handleChange}
                    error={Boolean(touched.code && errors.code)}
                    helperText={touched.code && errors.code}
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
                    type="number"
                    label="Price"
                    name="price"
                    value={values.price}
                    onChange={handleChange}
                    error={Boolean(touched.price && errors.price)}
                    helperText={touched.price && errors.price}
                  />
                </Grid>
             
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.unit && errors.unit)}>
                    <InputLabel>Unit</InputLabel>
                    <Field
                      as={Select}
                      label="Unit"
                      name="unit"
                      value={values.unit}
                      onChange={handleChange}
                    >
                      {unit.map((item) => (
                        <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                          {item.LK_VALUE}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.unit && errors.unit && (
                      <Typography color="error" variant="caption">
                        {errors.unit}
                      </Typography>
                    )}
                  </FormControl>
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
                      {isNew ? 'Save' : 'Update'} Product
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
