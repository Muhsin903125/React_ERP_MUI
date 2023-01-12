import { Helmet } from 'react-helmet-async';
import { useRef, useState } from 'react';
// @mui
import {
  Card,
  Stack,
  Button,
  Container,
  Typography, Grid,
  TextField,
  FormControl,
} from '@mui/material';
import Iconify from '../../components/iconify';

// ----------------------------------------------------------------------


export default function CustomerMaster() {

  const [trn, setTRN] = useState();
  const [mob, setMOB] = useState();
  const handleTrnChange = (event) => {
    if (event.target.value.length > 15) {
      return
    }
    setTRN(event.target.value);
  };

  return (
    <>
      <Helmet>
        <title> Customer Master </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Create New Customer
          </Typography>
        </Stack>
        <Card>
          <Stack m={2.5} >
            <Grid container spacing={2} mt={1}>
              <Grid item xs={12} md={9}  >
                <FormControl fullWidth>
                  <TextField
                    id="cust_name"
                    label="Customer Name"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}  >
                <FormControl fullWidth>
                  <TextField
                    id="cust_id"
                    label="Customer Code"
                    defaultValue="1001"
                    inputProps={{
                      readOnly: true
                    }}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
          <Stack m={2.5}>
            <Grid container spacing={2} >
              <Grid item xs={6} md={6}>
                <FormControl fullWidth>
                  <TextField
                    id="cust_address"
                    label="Address"
                    multiline
                    rows={4}
                    placeholder="Address"
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} md={6}>
                <Grid item xs={12} md={12} mb={1.5} >
                  <FormControl fullWidth>
                    <TextField
                      id="cust_trn"
                      label="TRN"
                      type="number"
                      value={trn}
                      onChange={handleTrnChange}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12} >
                  <FormControl fullWidth>
                    <TextField
                      type="tel"
                      id="cust_mob"
                      label="Mobile No"
                      value={mob}
                      inputProps={{ maxLength: 10 }}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" m={2.5}>
            <Typography />
            <Button variant="contained" startIcon={<Iconify icon="material-symbols:person-add-rounded" />}>
              Save Customer
            </Button>
          </Stack>
        </Card>
      </Container>

    </>
  );
}
