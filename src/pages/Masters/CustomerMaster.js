import { Helmet } from 'react-helmet-async';
import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// @mui
import {
  Card,
  Stack,
  Button, 
  Typography, Grid,
  TextField,
  FormControl,
} from '@mui/material';
import Iconify from '../../components/iconify';
import { PostMultiSp } from '../../hooks/Api'; // PostCommonSp
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';

// ----------------------------------------------------------------------


export default function CustomerMaster() {

  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setLoadingFull } = useContext(AuthContext);
  const [formData, setFormData] = useState(
    {
    customerName: '',
    customerCode: '1001',
    Address: '',
    TRN: '',
    Mobile: ''
  })

  useEffect(() => {

    async function fetchCustomerEntry() {

      try {
        setLoadingFull(false);
        const { Success, Data, Message } = await PostMultiSp({
            "key": "CUSTOMER_ENTRY", 
        })
        if (Success) {
          console.log(Data[0][0]);
          setFormData(Data[0][0])
        //  showToast(Message, 'success');
        }
        else {
          showToast(Message, "error");
        }
      }
      finally {
        setLoadingFull(false);
      } 
    }

    fetchCustomerEntry();

    },[])

  const handleInputChange = event => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // const [trn, setTRN] = useState();
  // const [mob, setMOB] = useState();
  // const handleTrnChange = (event) => {
  //   if (event.target.value.length > 15) {
  //     return
  //   }
  //   setTRN(event.target.value);
  // };

  const SaveCustomer = async () => {
    const dataArray = [formData];

    try {
      setLoadingFull(false);
      const { Success, Data, Message } = await PostMultiSp({
       "json": dataArray,
          "key": "CUSTOMER_SAVE"
      })  
      if (Success) {
        showToast("Saved Successfully", 'success');
        navigate("/customermasterv2", { replace: true })
        // <Navigate  to='/customermasterv2' />
        // setFormData(Data[0][0])
        // showToast(Message, 'success');
      }
      else {
        showToast(Message, "error");
      }
    }
    finally {
      setLoadingFull(false);
    }

  };

  return (
    <>
      <Helmet>
        <title> Customer Master </title>
      </Helmet>
 
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Create New Customer
          </Typography>
        </Stack>
        <Card>
          <Stack m={2.5} >
            <Grid container spacing={2} mt={1}>
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
            </Grid>
          </Stack>
          <Stack m={2.5}>
            <Grid container spacing={2} >
              <Grid item xs={12} md={6}>
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
              <Grid item xs={12} md={6}>
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

    </>
  );
}
