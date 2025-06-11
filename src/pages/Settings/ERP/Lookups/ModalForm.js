import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { GetSingleResult, PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues, onSuccess }) => {
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
    desc: yup.string().required('Description is required'),
    type: yup.string().required('Type is required'),
    group: yup.string().required('Key is required'),
    active: yup.boolean()
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        "key": "LOOKUP_CRUD",
        "TYPE": "ADD", // Pass the type as a parameter
        "LK_CODE": values.code,
        "LK_VALUE": values.desc,
        "LK_TYPE": values.type, 
        "LK_KEY": values.group,
        "LK_IS_ACTIVE": values.active,
      });

      if (Success) {
        showToast("Lookup created ", 'success');
        if (onSuccess) onSuccess(Data);
        onClose();
      } else {
        showToast(Message || "Error creating lookup", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Error creating lookup", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: '90%', sm: '300px', md: "420px" },
          bgcolor: 'background.paper',
          borderRadius: '8px',
          boxShadow: 24,
          p: 3,
          mx: 'auto',
          mt: { xs: '10%', md: '5%' },
        }}
      >
        <Typography variant="h4" component="h2" sx={{ mb: 3.5, display: 'flex', justifyContent: 'space-between' }}>
          {isNew ? "Create Lookup" : "Update Lookup"}
        </Typography>

        <Formik
          initialValues={{
            code: '',
            desc: '',
            type: '',
            group: '',
            active: true
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
            <Form>
              <Grid container spacing={2}>
                 
                
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="Lookup Type"
                    size="small"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    error={Boolean(touched.type && errors.type)}
                    helperText={touched.type && errors.type}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="Lookup Key"
                    size="small"
                    name="group"
                    value={values.group}
                    onChange={handleChange}
                    error={Boolean(touched.group && errors.group)}
                    helperText={touched.group && errors.group}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="Lookup Value"
                    size="small"
                    name="desc"
                    value={values.desc}
                    onChange={handleChange}
                    error={Boolean(touched.desc && errors.desc)}
                    helperText={touched.desc && errors.desc}
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
                      <Button 
                        variant="outlined" 
                        color="error" 
                        startIcon={<Iconify icon="mdi:cancel" />}
                        sx={{ mr: 2 }}
                        onClick={onClose}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        startIcon={<Iconify icon="basil:save-outline" />}
                      >
                        {isSubmitting ? 'Saving...' : 'Save Lookup'}
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
