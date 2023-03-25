import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  TextField, 
  Typography,
  Container,
  Stack,
  Grid,
  Card,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import validator from 'validator';

const UserRole = ({ user, onSave, onDelete }) => {
  const [roleName, setRoleName] = useState(user && user.roleName || ''); 
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(user && user.RoleId);

  const validate = () => {
    const errors = {};
 
    if (validator.isEmpty(roleName)) {
      errors.fullName = 'Role Name is required';
    }
 
    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        RoleName: roleName,
        RoleId: user?.RoleId,
        IsActive:true
      });
    }
  };

  const handleDelete = () => {
    onDelete(user.RoleId);
  };
  return (
    <>
      <Helmet>
        <title>User Role </title>
      </Helmet>

      <Container  >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            {isEditing ? 'Edit User Role' : 'New User Role'}
          </Typography>
        </Stack>
        <Card>
          <Grid container p={3} spacing={1} >
            <Grid item xs={12} md={6}  >
              <TextField
                label="Role Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                error={errors.roleName !== undefined}
                helperText={errors.roleName}
              />
            </Grid>
          
            <Grid item xs={12} md={4}  >

              <LoadingButton variant="contained" color="primary" fullWidth size="large" onClick={handleSave}>
                {isEditing ? 'Update' : 'Save'}
              </LoadingButton>
            </Grid>
            <Grid item xs={12} md={4}  >
              {isEditing && (
                <LoadingButton variant="outlined" color="error" fullWidth size="large" onClick={handleDelete}>
                  Delete
                </LoadingButton>
              )}
            </Grid>
          </ Grid></Card>
      </ Container>
    </>
  );
};

export default UserRole;    