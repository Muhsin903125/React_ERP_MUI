import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Modal, Grid, TextField, Stack, Box, Typography, CheckBox, FormControlLabel, Checkbox, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import Iconify from '../../../../components/iconify';
import { GetSingleListResult, GetSingleResult, PostCommonSp, PostMultiSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import useLookupData from '../../../../datas/useLookupData';

const ModalForm = ({ open, onClose, initialValues }) => {
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [parentMenu, setParentMenu] = useState(null);
  const actionTypeList = useLookupData('MENU_ATYPE');

  useEffect(() => {

    FetchData();
  }, [initialValues]);

  const FetchData = async () => {

    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
    }
    getParentMenu();
  };


  const validationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    seqno: yup.number().required('Sequence No is required'), 
  });

  const HandleData = async (data, type) => {

    try {
      const { Success, Data, Message } = await GetSingleResult({
        "key": "MENU_CRUD",
        "TYPE": type, // Pass the type as a parameter
        "MENU_NAME": data.name,
        "MENU_URL": data.url,
        "MENU_ACTION_TYPE": data.actionType,
        "MENU_SEQ_NO": data.seqno,
        "MENU_PARENT_ID": data.parentId,
        "MENU_ICON_NAME": data.iconName,
        "MENU_IS_ACTIVE": data.isactive,
        "MENU_REMARK": data.remark, 
        "MENU_CODE": data.id, 
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

  const getParentMenu = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: 'MENU_CRUD',
        TYPE: 'GET_MENU_NAME_LIST',
      });

      if (Success) {
        setParentMenu(Data);
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
          {isNew ? "Create Screen" : "Update Screen"}
        </Typography>

        <Formik
          initialValues={{
            name: initialValues?.MENU_NAME || '',
            url: initialValues?.MENU_URL || '',
            actionType: initialValues?.MENU_ACTION_TYPE || '',
            seqno: initialValues?.MENU_SEQ_NO || '',
            parentId: initialValues?.MENU_PARENT_ID || '0',
            iconName: initialValues?.MENU_ICON_NAME || '',
            isactive: initialValues?.MENU_IS_ACTIVE || true,
            remark: initialValues?.MENU_REMARK || '',
            id: initialValues?.MENU_CODE || '',
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            console.log("testt", values);
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
                    // disabled={!isNew}
                    label="Menu Name"
                    name="name" // Ensure this matches the validation schema
                    value={values.name} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.name && errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Url"
                    name="url" // Ensure this matches the validation schema
                    value={values.url} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.url && errors.url)}
                    helperText={touched.url && errors.url}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.tax && errors.tax)}>
                    <InputLabel>Action Type</InputLabel>
                    <Field
                      as={Select}
                      label="Action type"
                      name="actionType"
                      value={values.actionType}
                      onChange={handleChange}
                    >
                      {actionTypeList && actionTypeList?.map((item) => (
                        <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                          {item.LK_VALUE}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.actionType && errors.actionType && (
                      <Typography color="error" variant="caption">
                        {errors.actionType}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={Boolean(touched.tax && errors.tax)}>
                    <InputLabel>Parent Menu</InputLabel>
                    <Field
                      as={Select}
                      label="Parent Menu"
                      name="parentId"
                      value={values.parentId}
                      onChange={handleChange}
                    >
                      {parentMenu && parentMenu?.map((item) => (
                        <MenuItem key={item.MENU_CODE} value={item.MENU_CODE}>
                          {item.FullPath}
                        </MenuItem>
                      ))}
                    </Field>
                    {touched.parentId && errors.parentId && (
                      <Typography color="error" variant="caption">
                        {errors.parentId}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type='number'
                    label="Sequence No"
                    name="seqno" // Ensure this matches the validation schema
                    value={values.seqno} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.seqno && errors.seqno)}
                    helperText={touched.seqno && errors.seqno}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Icon Name"
                    name="iconName" // Ensure this matches the validation schema
                    value={values.iconName} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.iconName && errors.iconName)}
                    helperText={touched.iconName && errors.iconName}
                  />
                </Grid>
                <Grid item xs={12} sm={12}>
                  <TextField
                    fullWidth
                    label="Remark"
                    name="remark" // Ensure this matches the validation schema
                    value={values.remark} // Use values.name instead of values.R_NAME
                    onChange={handleChange} // This will now work correctly
                    error={Boolean(touched.remark && errors.remark)}
                    helperText={touched.remark && errors.remark}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.isactive}
                          onChange={(event) => setFieldValue('isactive', event.target.checked)}
                          name="isactive"
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
                      <Button type="submit" variant="contained" color={isNew ? "success" : "warning"} startIcon={<Iconify icon="basil:save-outline" />}>
                        {isNew ? "Save" : "Update"} Screen
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
