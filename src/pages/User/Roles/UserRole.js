import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { deleteRole, saveRole, UpdateRole } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';
import Confirm from '../../../components/Confirm';

function useConfirmationDialog() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setOpen(false);
  };

  return [handleClick, handleClose, handleConfirm, confirmed];
}
const UserRole = () => {
  const [handleClick, handleClose, handleConfirm, confirmed] = useConfirmationDialog();

  const location = useLocation();
  const user = location.state?.user;
  const [roleName, setRoleName] = useState(user && user.name || '');
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast();


  const isEditing = Boolean(user && user.id);

  const validate = () => {
    const errors = {};

    if (validator.isEmpty(roleName)) {
      errors.roleName = 'Role Name is required';
    }

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };
  const onSave = async (data) => {
    Confirm('Are you sure?').then(async () => {
      try {
        setLoadingFull(true);
        const { Success, Data, Message } = !isEditing ? await saveRole(data) : await UpdateRole(data);
        if (Success) {
          showToast(Message, 'success');
          navigate('/rolelist')
        } else {
          showToast(Message, 'error');
        }
        console.log('proceed!');
      } finally {
        setLoadingFull(false);
      }
    }, () => {
      // cancel case
    });


  };

  const handleSave = () => {
    if (validate()) {
      onSave({
        RoleName: roleName,
        RoleId: user?.id,
        IsActive: true
      });
    }
  };
  const handleDelete = async () => {
    Confirm('Are you sure to Delete?').then(async () => {
      try {
        setLoadingFull(true);

        const { Success, Data, Message } = await deleteRole(user?.id)
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
    });
  }

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
        <Card >
          <Grid container p={2} md={7} padding={4} spacing={3} >
            <Grid item xs={12} md={12} >
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

              <LoadingButton variant="contained" color="primary" fullWidth size="large" onClick={handleSave}>
                {isEditing ? 'Update' : 'Save'}
              </LoadingButton>
            </Grid>
            <Grid item xs={12} md={6}  >
              {isEditing && (
                <LoadingButton variant="contained" color="error" fullWidth size="large" onClick={handleDelete}>
                  Delete
                </LoadingButton>
              )}
            </Grid>
          </ Grid>
        </Card>

      </ Container>
    </>
  );
};

export default UserRole;    