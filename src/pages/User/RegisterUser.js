import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Stack,
  Grid,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import validator from 'validator';
import { GetSingleListResult, PostCommonSp, PostUserRegister } from '../../hooks/Api';
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';
import Confirm from '../../components/Confirm';
import MyContainer from '../../components/MyContainer';

const RegisterUser = () => {
  const location = useLocation();
  const user = location.state?.user;
  const navigate = useNavigate();
  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast();

  const [roleList, setRoleList] = useState([]);
  const [username, setUsername] = useState(user?.email || '');
  const [firstName, setFirstname] = useState(user?.firstName || '');
  const [lastName, setLastname] = useState(user?.lastName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(user?.roles || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(user?.id);

  useEffect(() => {
    fetchRoleList();
  }, []);

  async function fetchRoleList() {
    try { 
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "ROLE_CRUD",
        "TYPE": "GET_ALL",
      });
      if (Success) {
        setRoleList(Data);
      } else {
        showToast(Message, "error");
      }
    } finally {
      setLoadingFull(false);
    }
  }

  const validate = () => {
    const errors = {};

    if (!validator.isEmail(username) || validator.isEmpty(username)) {
      errors.username = 'Username should be a valid email';
    }

    if (validator.isEmpty(firstName)) {
      errors.firstName = 'First Name is required';
    }

    if (!validator.isNumeric(mobileNumber) || mobileNumber.length < 10) {
      errors.mobileNumber = 'Mobile Number should be a valid numeric value of at least 10 digits';
    }

    if (!isEditing && validator.isEmpty(password)) {
      errors.password = 'Password is required';
    } else if (!isEditing && password.length < 6) {
      errors.password = "Password should have at least 6 characters";
    }

    if (!isEditing && (!role || role === '')) {
      errors.role = 'Role is required';
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSave = async (payload) => {
    try {
      setIsSubmitting(true);
      setLoadingFull(true);
      
      const { Success, Message } =!isEditing ? 
      await PostUserRegister(payload) :  await GetSingleListResult({
        key: "USR_CRUD",
        TYPE: isEditing ? "UPDATE" : "ADD",
        USR_FNAME: payload.FirstName,
        USR_LNAME: payload.LastName,
        USR_EMAIL: payload.Email,
          USR_MOBILE: payload.MobileNumber,
          USR_CODE: isEditing ? user.id : null
        })
      
      
      if (Success) {
        navigate('/userlist');
        showToast((isEditing ? 'User updated successfully' : 'User added successfully'), 'success');
      } else {
        showToast(Message || 'Operation failed', "error");
      }
    } finally {
      setIsSubmitting(false);
      setLoadingFull(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (validate()) {
      const payload = {
        "Email": username,
        "FirstName": firstName,
        "LastName": lastName,
        "MobileNumber": mobileNumber,
        "Password": password,
        "Roles": role.toString(),
      }
      
      Confirm('Are you sure?').then(() => onSave(payload)); 
    }
  };

  // const handleUnBlock = () => {
  //   Confirm('Are you sure to Activate this User?').then(async () => {
  //     try {
  //       setLoadingFull(true);
  //       const { Success, Message } = await PostActiveUser(user?.id);
  //       if (Success) {
  //         navigate('/userlist');
  //         showToast(Message, 'success');
  //       } else {
  //         showToast(Message, "error");
  //       }
  //     } finally {
  //       setLoadingFull(false);
  //     }
  //   });
  // };

  // const handleBlock = () => {
  //   Confirm('Are you sure to Block this User?').then(async () => {
  //     try {
  //       setLoadingFull(true);
  //       const { Success, Message } = await PostDeactiveUser(user?.id);
  //       if (Success) {
  //         navigate('/userlist');
  //         showToast(Message, 'success');
  //       } else {
  //         showToast(Message, "error");
  //       }
  //     } finally {
  //       setLoadingFull(false);
  //     }
  //   });
  // };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit User' : 'New User'}</title>
      </Helmet>
      <form onSubmit={handleSave}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            {isEditing ? 'Edit User' : 'New User'}
          </Typography>
        </Stack>
        <MyContainer>
          <Grid container p={3} spacing={1}>
            <Grid item xs={12} md={6}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                size='small'
                margin="normal"
                value={firstName}
                onChange={(e) => setFirstname(e.target.value)}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                size='small'
                margin="normal"
                value={lastName}
                onChange={(e) => setLastname(e.target.value)}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                size='small'
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={Boolean(errors.username)}
                helperText={errors.username}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Mobile Number"
                variant="outlined"
                fullWidth
                size='small'
                margin="normal"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                error={Boolean(errors.mobileNumber)}
                helperText={errors.mobileNumber}
              />
            </Grid>
            {!isEditing && (
              <Grid item xs={12} md={6}>
                <TextField
                  label="Password"
                  type="password"
                  variant="outlined"
                  fullWidth
                  size='small'
                  margin="normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                />
              </Grid>
            )}
            {!isEditing && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size='small' margin="normal" error={Boolean(errors.role)}>
                  <InputLabel>Role</InputLabel>
                  <Select
                  value={role}
                  label="Role"
                  onChange={(e) => setRole(e.target.value)}
                >
                  {roleList.map((role) => (
                    <MenuItem key={role.ROLE_CODE} value={role.ROLE_CODE}>
                      {role.ROLE_NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            )}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
                <LoadingButton
                  loading={isSubmitting}
                  type="submit"
                  variant="contained"
                >
                  {isEditing || user?.id ? 'Update User' : 'Save User'}
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </MyContainer>
      </form>
    </>
  );
};

export default RegisterUser;    