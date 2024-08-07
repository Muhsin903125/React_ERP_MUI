import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, CheckBox, FormControlLabel, Checkbox } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
    }
  }, [initialValues]);

  const validationSchema = yup.object().shape({
    docType: yup.string().required('Doc Type is required'),
    lastno: yup.number().required('Last No is required'),
    prefix: yup.string().required('Prefix is required'),
    length: yup.number().required('Lenght is required'),
    edit: yup.boolean().required('Editable is required'),
  });

  const HandleData = async (data, type) => {
    console.log("sdsdsd",data);
    
    try {
      const { Success, Data, Message } = await PostCommonSp({
        "key": "LAST_NO_CRUD",
        "TYPE": type, // Pass the type as a parameter
        "LASTNO_DOCTYPE": data.docType,
        "LASTNO_LASTNO": data.lastno,
        "LASTNO_PREFIX": data.prefix,
        "LASTNO_LENGTH": data.length,
        "LASTNO_IS_EDITABLE": data.edit,
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


  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '90%', sm: '500px', md: "720px" },
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          p: 3,
          mx: 'auto',
          mt: { xs: '10%', md: '5%' },
        }}
      >
        <Typography variant="h4" component="h2" sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between' }}>
          {isNew ? "Create Last Number" : "Update Last Number"}
        </Typography>

        <Formik
          initialValues={{
            docType: initialValues?.LASTNO_DOCTYPE || '',
            lastno: initialValues?.LASTNO_LASTNO || '',
            prefix: initialValues?.LASTNO_PREFIX || '',
            length: initialValues?.LASTNO_LENGTH || '',
            edit: initialValues?.LASTNO_IS_EDITABLE || '',
            // id: initialValues?.R_CODE || '',  
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log("sdsdsd",values);
    
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
                    disabled={!isNew}
                    label="Doc Type"
                    name="docType" // Ensure this matches the validation schema
                    value={values.docType} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.docType && errors.docType)}
                    helperText={touched.docType && errors.docType}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last No"
                    name="lastno" // Ensure this matches the validation schema
                    value={values.lastno} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.lastno && errors.lastno)}
                    helperText={touched.lastno && errors.lastno}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Prefix"
                    name="prefix" // Ensure this matches the validation schema
                    value={values.prefix} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.prefix && errors.prefix)}
                    helperText={touched.prefix && errors.prefix}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Length"
                    name="length" // Ensure this matches the validation schema
                    value={values.length} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.length && errors.length)}
                    helperText={touched.length && errors.length}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.edit}
                          onChange={(event) => setFieldValue('edit', event.target.checked)}
                          name="edit"
                        />
                      }
                      label="Editable"
                    />
                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                      <Button variant="outlined" color="error" startIcon={<Iconify icon="mdi:cancel" />}
                        sx={{ mr: 2 }}
                        onClick={onClose}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="contained" color={isNew ? "success" : "warning"} startIcon={<Iconify icon="basil:save-outline" />}>
                        {isNew ? "Save" : "Update"} Last Number
                      </Button>
                    </Stack>
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
