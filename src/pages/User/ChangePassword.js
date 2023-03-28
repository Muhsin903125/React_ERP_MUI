import { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
// @mui 
import { Grid, Card, Container, Typography, Stack, TextField, FormControl } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';
import { PostChangePassword } from '../../hooks/Api';

// components 

// ----------------------------------------------------------------------

export default function ChangePassword() {
    const { showToast } = useToast();
    const navigate = useNavigate()
    const { setLoadingFull } = useContext(AuthContext)
    const [oldPass, setOldPass] = useState(null)
    const [newPass, setNewPass] = useState(null)
    const [confirmPass, setConfirmPass] = useState(null)
    const [errors, setErrors] = useState({});
    const handleSubmit = async (e) => {
        e.preventDefault();

        const errors = {};
        if (validator.isEmpty(oldPass)) {
            errors.oldPass = "Enter Current Password";
        }   if (validator.isEmpty(newPass)) {
            errors.newPass = "Enter New Password";
        }   if (validator.isEmpty(confirmPass)) {
            errors.confirmPass = "Enter Confirm Password";
        } 
        else if (newPass.length < 6) {
            errors.newPass = "Password Should have alteast 6 digits";
        } else if (validator.matches(newPass, confirmPass)) {
            errors.confirmPass = "New Password and Confirm Password do not match";
        } else if (validator.matches(oldPass, confirmPass)) {
            errors.confirmPass = "Current Password and New Password are the same";
        }
        setErrors(errors); 
        
        if (!Object.keys(errors).length === 0) { 
            return;
        }

        setLoadingFull(true);
        const storedUsername = sessionStorage.getItem("username");
        const payload = {
            Username: storedUsername,
            OldPassword: oldPass,
            Password: confirmPass,
        };

        try {
            const { Success, Message } = await PostChangePassword(JSON.stringify(payload));
            if (Success) {
                showToast(Message, "success");
                navigate("/");
            } else {
                showToast(Message, "error");
            }
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setLoadingFull(false);
        }
    };

    return (
        <>
            <Helmet>
                <title> Change Password </title>
            </Helmet>

            <Container  >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        Change Password
                    </Typography>
                </Stack>
                <Grid container    >
                    <Grid item xs={12} md={7}  >
                        <Card>
                            <Stack m={2.5} md={6} >
                                <Grid container spacing={2} >
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <TextField  
                                                 variant="outlined"
                                                 fullWidth
                                                 margin="normal"
                                                onChange={(e) => setOldPass(e.target.value)}
                                                value={oldPass}
                                                error={errors.oldPass !== undefined}
                                                helperText={errors.oldPass}
                                                label="Current Password" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <TextField 
                                                 variant="outlined"
                                                 fullWidth
                                                 margin="normal"
                                                onChange={(e) => setNewPass(e.target.value)}
                                                value={newPass}
                                                error={errors.newPass !== undefined}
                                                helperText={errors.newPass}
                                                label="New Password" />

                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <TextField  
                                                variant="outlined"
                                                fullWidth
                                                margin="normal"
                                                onChange={(e) => setConfirmPass(e.target.value)}
                                                value={confirmPass}
                                                error={errors.confirmPass !== undefined}
                                                helperText={errors.confirmPass}
                                                label="Confirm Password" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <LoadingButton variant="contained" color="primary" fullWidth size="large" onClick={handleSubmit} >
                                                Update Password
                                            </LoadingButton>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Card>
                    </Grid>
                </Grid>

            </Container>


        </>
    );
}
