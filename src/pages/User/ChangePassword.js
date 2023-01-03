import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab'; 
// components 

// ----------------------------------------------------------------------

export default function ChangePassword() {
    const theme = useTheme();
  
    return (
        <>
            <Helmet>
                <title> Change Password </title>
            </Helmet>

            <Container maxWidth="xl">
                <Typography variant="h4" sx={{ mb: 5 }}>
                    Change Password
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={6}>
                        <Stack spacing={2}>
                            <TextField name="Current password"
                                autoComplete="off"
                                // onChange={(e) => setUser(e.target.value)}
                                // value={user}
                                required
                                label="Current Password" />
                            <TextField name="newpassword"
                                autoComplete="off"
                                // onChange={(e) => setUser(e.target.value)}
                                // value={user}
                                required
                                label="New Password" />

                            <TextField name="confirmpassword"
                                autoComplete="off"
                                // onChange={(e) => setUser(e.target.value)}
                                // value={user}
                                required
                                label="Confirm Password" />


                            <LoadingButton fullWidth size="large" type="submit" variant="contained" >
                                Update Password
                            </LoadingButton>
                        </Stack>

                    </Grid>

                </Grid>
            </Container>
        </>
    );
}
