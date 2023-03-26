import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
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
import { AuthContext } from '../../../App';
import { deleteRole, GetRoleList, saveRole } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';

const UserRole = ({ user,  onDelete }) => {
  const [roleName, setRoleName] = useState(user && user.roleName || ''); 
  const [errors, setErrors] = useState({});
  const navigate= useNavigate();
  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast(); 
  
  const isEditing = Boolean(user && user.RoleId);

  const validate = () => {
    const errors = {};
 
    if (validator.isEmpty(roleName)) {
      errors.roleName = 'Role Name is required';
    }
 
    setErrors(errors);

    return Object.keys(errors).length === 0;
  };
  const onSave = async (data) => {
    try {
      setLoadingFull(true);
      const { Success, Data, Message } = await saveRole(data)
      if (Success) { 
        navigate('/rolelist')
        showToast(Message, 'success');
      }
      else {
        showToast(Message, "error");
      }
    }
    finally {
      setLoadingFull(false);
    }
    // Your code here
  }
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
          <Grid container p={2} md={12} spacing={1} >
            <Grid item xs={12}  md={7} >
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
          
            <Grid item xs={12} md={6}  >

              <LoadingButton    variant="contained" color="primary" fullWidth size="large" onClick={handleSave}>
                {isEditing ? 'Update' : 'Save'}
              </LoadingButton>
            </Grid>
            <Grid item xs={12} md={4}  >
              {isEditing && (
                <LoadingButton   variant="outlined" color="error" fullWidth size="large" onClick={handleDelete}>
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