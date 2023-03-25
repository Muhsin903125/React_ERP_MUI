import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { faker } from '@faker-js/faker';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Card, Container, Typography, Stack, TextField, FormControl } from '@mui/material';
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
                                                size='small'
                                                // onChange={(e) => setUser(e.target.value)}
                                                // value={user}
                                                required
                                                label="Current Password" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <TextField name="newpassword"
                                                autoComplete="off"
                                                size='small'

                                                // onChange={(e) => setUser(e.target.value)}
                                                // value={user}
                                                required
                                                label="New Password" />

                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <TextField name="confirmpassword"
                                                autoComplete="off"
                                                size='small'

                                                // onChange={(e) => setUser(e.target.value)}
                                                // value={user}
                                                required
                                                label="Confirm Password" />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={12}  >
                                        <FormControl fullWidth>
                                            <LoadingButton fullWidth size="large" type="submit" variant="contained" >
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
