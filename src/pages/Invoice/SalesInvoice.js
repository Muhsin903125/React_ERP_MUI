import { Helmet } from 'react-helmet-async';
import { useContext, useRef, useState } from 'react';
// @mui
import {
  Card,
  Stack,
  Button, 
  Typography,
  Grid,
  TextField,
  FormControl,
} from '@mui/material';
import Iconify from '../../components/iconify';
import DateSelector from '../../components/DateSelector';
import Dropdownlist from '../../components/DropdownList';
import InvoiceItem from './InvoiceItem';
import SubTotalSec from './SubTotalSec';
import AlertDialog from '../../components/AlertDialog';
import CustomerDialog from '../../components/CustomerDialog';
import { PostCommonSp } from '../../hooks/Api'; 
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';

// ----------------------------------------------------------------------

const InvoiceStatusOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'draft', label: 'Draft' },
];


export default function SalesInvoice() {

  const { showToast } = useToast();
  const { setLoadingFull } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDueDate, setselectedDueDate] = useState(new Date());
  const [IsAlertDialog, setAlertDialog] = useState(false);
  const [disableFutureDate] = useState(true);

  const [status, setStatus] = useState('paid');

  const handleStatusChange = event => {
    setStatus(event.target.value);
  };

  const [items, setItems] = useState([{
    name: "",
    price: 0,
    desc: "",
    qty: 0,
    unit: "kg"
  }]);

  const addItem = (event) => {
    event.preventDefault();
    // console.log(ItemNewLength);
    setItems([...items, {
      name: "",
      price: 0,
      desc: "",
      qty: 0,
      unit: "kg"
    }]);
  };


  const editItem = (index, event) => {
    event.preventDefault();
    const newItems = [...items];
    newItems[index] = { name: event.target.itemName.value, price: event.target.itemPrice.value };
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...items];
    console.log(index);
    newItems.splice(index, 1);
    setItems(newItems);
    console.log(newItems);
  };


  function calculateTotal(items) {
    return items.reduce((total, item) => {
      return total + item.price * item.qty;
    }, 0);
  }

  // For Customer Dialog
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState("Customer Name");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
    setSelectedValue(value);
  };


  const [fields, setFields] = useState([{ value: '' }]);
  const codeRef = useRef({});
  const descRef = useRef({});
  const unitRef = useRef({});
  const priceRef = useRef({});
  const qtyRef = useRef({});
  const handleChange = (index, event) => {
    console.log(index);
    const values = [...items];
    values[index].value = event.target.value;
    setFields(values);
  };
  const CreateInvoice = async () => {
    try {
      setLoadingFull(false);
      const { Success, Message } = await PostCommonSp({
        "key": "string",
        "userId": "string",
        "json": JSON.stringify({ "json": items }),
        "controller": "string"
      }) //  JSON.stringify({ "json": items }));

      if (Success) {
        showToast(Message, 'success');
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
        <title> Sales Invoice </title>
      </Helmet>
 
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Sales Invoice
          </Typography>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Invoice
          </Button>
        </Stack>
        <Card>
          <Stack m={2.5} >
            <Grid container spacing={2} mt={1} >
              <Grid item xs={12} md={6}>
                <Grid container spacing={2} mt={1}>
                  <Grid items xs={8} md={8}>
                    <Typography variant="subtitle1" ml={2} mb={1} style={{ color: "gray" }} >
                      Customer :
                    </Typography>
                  </Grid>
                  <Grid items xs={4} md={4} align='right'>
                    <Button size="small" startIcon={<Iconify icon="eva:edit-fill" />} onClick={handleClickOpen}>
                      change
                    </Button>
                    <CustomerDialog
                      selectedValue={selectedValue}
                      open={open}
                      onClose={handleClose}
                    />
                  </Grid>
                  <Grid items xs={12} md={12}>
                    <Typography variant="body2" ml={2} style={{ color: "black" }} >
                      {selectedValue}
                    </Typography>
                  </Grid>
                  <Grid items xs={12} md={12}>
                    <Typography variant="body2" ml={2} mb={2} style={{ color: "gray" }} >
                      Address
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={6}  >
                    <FormControl fullWidth>
                      <TextField
                        id="invoice-no"
                        label="Invoice#"
                        defaultValue="1001"
                        inputProps={{
                          readOnly: true
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={6} >
                    <FormControl fullWidth>
                      <Dropdownlist options={InvoiceStatusOptions}
                        value={status}
                        label={"Status"}
                        onChange={handleStatusChange}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={2} mt={1}>
                  <Grid item xs={6} md={6}  >
                    <FormControl fullWidth>
                      <DateSelector
                        label="Date"
                        disableFuture={disableFutureDate}
                        value={selectedDate}
                        onChange={setSelectedDate}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={6} >
                    <FormControl fullWidth>
                      <DateSelector
                        label="Due Date"
                        disableFuture={!disableFutureDate}
                        value={selectedDueDate}
                        onChange={setselectedDueDate}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            {/* <Grid container spacing={2} mt={1}>
              <Grid item xs={6} md={3}  >
                <FormControl fullWidth>
                  <TextField
                    id="invoice-no"
                    label="Invoice#"
                    defaultValue="1001"
                    inputProps={{
                      readOnly: true
                    }}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3} >
                <FormControl fullWidth>
                  <Dropdownlist options={InvoiceStatusOptions}
                    value={status}
                    label={"Status"}
                    onChange={handleStatusChange}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3} >
                <FormControl fullWidth>
                  <DateSelector
                    label="Date"
                    disableFuture={disableFutureDate}
                    value={selectedDate}
                    onChange={setSelectedDate}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={6} md={3} >
                <FormControl fullWidth>
                  <DateSelector
                    label="Due Date"
                    disableFuture={!disableFutureDate}
                    value={selectedDueDate}
                    onChange={setselectedDueDate}
                  />
                </FormControl>
              </Grid>
            </Grid> */}
          </Stack>
          <Stack m={2.5} >

            <Typography variant="h6" mb={2} >
              Item Details
            </Typography>
            {items.map((field, index) => (
              <InvoiceItem Propkey={index}
                code={items[index].name}
                desc={items[index].desc}
                qty={items[index].qty}
                price={items[index].price}
                unit={items[index].unit}
                items={items}
                setItems={setItems}
                removeItem={() => removeItem(index)} />
            ))}



            <SubTotalSec addItem={addItem} calculateTotal={calculateTotal(items)}
            />
            <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
              <Button variant="contained" color='success' size='large' onClick={CreateInvoice}>
                Create Invoice
              </Button>
            </Stack>
          </Stack>
        </Card>
        {IsAlertDialog && (<AlertDialog
          Message="Are you sure you want to proceed?"
          OnSuccess={setAlertDialog}
        />)} 

    </>
  );
}
