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

    const handleSubmit = async (e) => {
        e.preventDefault();

        let error = "";

        if (validator.isEmpty(oldPass)) {
            error = "Enter Current Password";
        } else if (validator.isEmpty(newPass)) {
            error = "Enter New Password";
        } else if (validator.isEmpty(confirmPass)) {
            error = "Enter Confirm Password";
        }

        else if (newPass.length < 6) {
            error = "Password Should have alteast 6 digits";
        } else if (!validator.matches(newPass, confirmPass)) {
            error = "New Password and Confirm Password do not match";
        } else if (validator.matches(oldPass, confirmPass)) {
            error = "Current Password and New Password are the same";
        }

        if (error) {
            showToast(error, "error");
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
                                            <TextField name="Current password"
                                                autoComplete="off"
                                                // size='small'
                                                onChange={(e) => setOldPass(e.target.value)}
                                                value={oldPass}
                                                required
                                                label="Current Password" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <TextField name="newpassword"
                                                autoComplete="off"
                                                // size='small'

                                                onChange={(e) => setNewPass(e.target.value)}
                                                value={newPass}
                                                required
                                                label="New Password" />

                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <TextField name="confirmpassword"
                                                autoComplete="off"
                                                // size='small'

                                                onChange={(e) => setConfirmPass(e.target.value)}
                                                value={confirmPass}
                                                required
                                                label="Confirm Password" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <LoadingButton fullWidth size="large"  variant="contained" onClick={handleSubmit} >
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
