import React, { useContext, useState } from 'react';


import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl, 
  Typography,
  Container,
  Stack,
  Grid,
  Card,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import validator from 'validator';
import { PostUserResgister } from '../../hooks/Api';
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';

const RegisterUser = ({ user,  onDelete }) => {
  const navigate= useNavigate();
  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast(); 

  const [username, setUsername] = useState(user && user.username || '');
  const [firstName, setfirstname] = useState(user && user.firstName || '');
  const [lastName, setlastname] = useState(user && user.lastName || '');
  const [mobileNumber, setMobileNumber] = useState(user && user.mobileNumber || '');
  const [password, setPassword] = useState(user && user.password || '');
  const [gender, setGender] = useState(user && user.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(user && user.dateOfBirth || ''); 
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(user && user.id);

  const validate = () => {
    const errors = {};

    if (!validator.isEmail(username)  ) {
      errors.username = 'Username should be either a valid email ';
    }

    if (validator.isEmpty(firstName)) {
      errors.firstName = 'First Name is required';
    }

    if (!validator.isNumeric(mobileNumber) || mobileNumber.length < 10) {
      errors.mobileNumber = 'Mobile Number should be a valid numeric value of at least 10 digits';
    }

    if (validator.isEmpty(password)) {
      errors.password = 'Password is required';
    }

    if (validator.isEmpty(gender)) {
      errors.gender = 'Gender is required';
    }

    if (validator.isEmpty(dateOfBirth)) {
      errors.dateOfBirth = 'Date of Birth is required';
    } else if (new Date(dateOfBirth) > new Date()) {
      errors.dateOfBirth = 'Date of Birth cannot be a future date';
    }
 
    setErrors(errors);

    return Object.keys(errors).length === 0;
  };
  const onSave = async (data) => {
    try {
      setLoadingFull(true);
      const { Success, Data, Message } = await PostUserResgister(data)
      if (Success) { 
        navigate('/userlist')
        showToast(Message, 'success');
      }
      else {
        showToast(Message, "error");
      }
    }
    finally {
      setLoadingFull(false);
    }
  }
  const handleSave = () => {
    if (validate()) {
      onSave({
        Email: username,
        FirstName:firstName,
        LastName:lastName,
        MobileNumber: mobileNumber,
        Password: password,
        Gender: gender,
        DOB:   dateOfBirth,
        // citizenship,
        Id: user?.id,
      });
    }
  };

  const handleDelete = () => {
    onDelete(user.id);
  };
  return (
    <>
      <Helmet>
        <title>User Register </title>
      </Helmet>

      <Container  >
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4" gutterBottom>
            {isEditing ? 'Edit User' : 'New User'}
          </Typography>
        </Stack>
        <Card>
          <Grid container p={3} spacing={1} >
          <Grid item xs={12} md={6}  >
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={firstName}
                onChange={(e) => setfirstname(e.target.value)}
                error={errors.firstName !== undefined}
                helperText={errors.firstName}
              />
            </Grid>
            <Grid item xs={12} md={6}  >
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={lastName}
                onChange={(e) => setlastname(e.target.value)}
                error={errors.lastName !== undefined}
                helperText={errors.lastName}
              />
            </Grid>
            <Grid item xs={12} md={6}  >
              <TextField
                label="Username/Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                error={errors.username !== undefined}
                helperText={errors.username}
              />
            </Grid>
          
            <Grid item xs={12} md={6}  >
              <TextField
                fullWidth
                variant="outlined"
                label="Mobile Number"
                margin="normal"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                error={errors.mobileNumber !== undefined}
                helperText={errors.mobileNumber}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}  >
              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  error={errors.gender !== undefined}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error">
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}  >
              <TextField
                fullWidth
                variant="outlined"
                type="password"
                label="Password"
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password !== undefined}
                helperText={errors.password}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}  >
              <TextField
                fullWidth
                variant="outlined"
                type="date"
                label="Date of Birth"
                margin="normal"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                error={errors.dateOfBirth !== undefined}
                helperText={errors.dateOfBirth}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: new Date().toISOString().split('T')[0],
                }}
              />
            </Grid>
            {/* <Grid item xs={12} md={6}  >
              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel id="citizenship-label">Citizenship</InputLabel>
                <Select
                  labelId="citizenship-label"
                  label="Citizenship"
                  value={citizenship}
                  onChange={(e) => setCitizenship(e.target.value)}
                  error={errors.citizenship !== undefined}
                >
                  <MenuItem value="india">India</MenuItem>
                  <MenuItem value="usa">USA</MenuItem>
                  <MenuItem value="canada">Canada</MenuItem>
                  {/* Add more countries here  
                </Select>
                {errors.citizenship && (
                  <Typography variant="caption" color="error">
                    {errors.citizenship}
                  </Typography>
                )}
              </FormControl>
            </Grid> */}
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

export default RegisterUser;    