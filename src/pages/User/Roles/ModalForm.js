import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../components/iconify';
import { GetSingleResult, PostCommonSp } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  useEffect(() => {
    if (initialValues !== null ) {
      setIsNew(false);
    } else {
      setIsNew(true);
    }
  }, [initialValues]);

  const validationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    active: yup.boolean().required('Active is required'),
  });


  const HandleSave = async (data) => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        "key": "ROLE_CRUD",
        "TYPE": "ADD",
        "R_NAME": data.name,
        "R_IS_ACTIVE":data.active
      })
      if (Success) {
        showToast( 'Role created !', 'success');
        onClose()
      }
      else {
        showToast(Message, "error");
      }
    } catch {
      console.log("err")
    }
  }

  const HandleUpdate = async (data) => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        "key": "ROLE_CRUD",
        "TYPE": "UPDATE",
        "R_NAME": data.name,
        "R_CODE": data.id,
        "R_IS_ACTIVE":data.active

      })
      if (Success) {
        showToast( 'Role updated !', 'success');
        onClose()
      }
      else {
        showToast(Message, "error");
      }
    } catch {
      console.log("err")
    }
  }


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
          {isNew ? "Create Role" : "Update Role"}
        </Typography>

        <Formik
          initialValues={{
            name: initialValues?.R_NAME || '', // Load R_NAME for editing
            id: initialValues?.R_CODE || '', // Load R_NAME for editing
            active: initialValues?.R_IS_ACTIVE || '', // Load R_NAME for editing
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            if (isNew)
              HandleSave(values);
            else
              HandleUpdate(values);
            // Handle form submission
            console.log(values);
          }}
        >
          {({ values, errors, touched, handleChange,setFieldValue }) => (
            <Form>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Name"
                    name="name" // Ensure this matches the validation schema
                    value={values.name} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.active}
                          onChange={(event) => setFieldValue('active', event.target.checked)}
                          name="active"
                        />
                      }
                      label="Active"
                    />
                  <Stack direction="row" alignItems="center" justifyContent="flex-end">
                    <Button variant="outlined" color="error" startIcon={<Iconify icon="mdi:cancel" />}
                      sx={{ mr: 2 }}
                      onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color={isNew ? "success" : "warning"}  startIcon={<Iconify icon="basil:save-outline" />}>
                      {isNew ? "Save" : "Update"} Role
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
