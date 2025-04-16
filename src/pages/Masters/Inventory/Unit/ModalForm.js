import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { GetSingleResult, PostCommonSp } from '../../../../hooks/Api';
  import { useToast } from '../../../../hooks/Common'; 

const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  // const [code, setCode] = useState(null);
  // const [unit, setUnit] = useState([]);
  const [codeEditable, setCodeEditable] = useState(false);

  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
        setIsNew(true);
        // getCode();
    }
      // getUnit();
  }, [initialValues, open]);

  const validationSchema = yup.object().shape({
    Key: yup.string().required('Key is required'),
    Value: yup.string().required('Value is required'), 
  });

  const HandleData = async (data, type) => {
    try {
      const { Success, Message } = await GetSingleResult({
        key: 'UNITS_CRUD',
        TYPE: type,
        LK_KEY: data.Key,
        LK_VALUE: data.Value, 
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
          {isNew ? 'Create Unit' : 'Update Unit'}
        </Typography>

        <Formik
          initialValues={{
            Key: initialValues?.LK_KEY || '',
            Value: initialValues?.LK_VALUE || '', 
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (isNew) {
              HandleData(values, 'CREATE');
            } else {
              // HandleData(values, 'UPDATE');
            }
          }}
        >
          {({ values, errors, touched, handleChange }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Key"
                  
                    name="Key"
                    value={values.Key}
                    onChange={handleChange}
                    error={Boolean(touched.Key && errors.Key)}
                    helperText={touched.Key && errors.Key}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Value"
                    name="Value"
                    value={values.Value}
                    onChange={handleChange}
                    error={Boolean(touched.Value && errors.Value)}
                    helperText={touched.Value && errors.Value}
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
                      {isNew ? 'Save' : 'Update'} Unit
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
