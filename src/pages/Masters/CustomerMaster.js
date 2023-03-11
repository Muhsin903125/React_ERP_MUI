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
import { PostCommonSp, PostMultiSp } from  '../../hooks/Api';
import useAuth from '../../hooks/useAuth';

// ----------------------------------------------------------------------


export default function CustomerMaster() {
  const {userToken} =useAuth()
  const [formData, setFormData] = useState({
    customerName: '',
    customerCode: '1001',
    Address: '',
    TRN: '',
    Mobile: ''
  })

  const handleInputChange = event => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const [trn, setTRN] = useState();
  const [mob, setMOB] = useState();
  const handleTrnChange = (event) => {
    if (event.target.value.length > 15) {
      return
    }
    setTRN(event.target.value);
  };

  const SaveCustomer = async () => {
    const dataArray = [formData];
    const response = await PostMultiSp({
      "key": "string",
      "userId": "string",
      "json": JSON.stringify({ "json": dataArray,
      "Test":"123"
     }),
      "controller": "string"
    },userToken) //  JSON.stringify({ "json": items }));
    console.log(response.Data)
    console.log(response);
    setFormData(response.Data[0][0])
    // setAlertDialog(true)
    
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
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}  >
                <FormControl fullWidth>
                  <TextField
                    id="cust_id"
                    label="Customer Code"
                    name="customerCode"
                    value={formData.customerCode}
                    onChange={handleInputChange}
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
                    name="Address"
                    value={formData.Address}
                    onChange={handleInputChange}
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
                      name="TRN"
                      value={formData.TRN}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={12} >
                  <FormControl fullWidth>
                    <TextField
                      type="tel"
                      id="cust_mob"
                      label="Mobile No"
                      name="Mobile"
                      value={formData.Mobile}
                      inputProps={{ maxLength: 10 }}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" m={2.5}>
            <Typography />
            <Button variant="contained" startIcon={<Iconify icon="material-symbols:person-add-rounded" />} onClick={SaveCustomer}>
              Save Customer
            </Button>
          </Stack>
        </Card>
      </Container>

    </>
  );
}
