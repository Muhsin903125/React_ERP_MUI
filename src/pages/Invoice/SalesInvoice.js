import { Helmet } from 'react-helmet-async';
import { useRef, useState } from 'react';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination, Grid,
  TextField,
  FormControl,
  ListItemSecondaryAction,
  ListItem,
  List,
  Divider,
  Input,
} from '@mui/material';
import Iconify from '../../components/iconify';
import DateSelector from '../../components/DateSelector';
import Dropdownlist from '../../components/DropdownList';
import InvoiceItem from './InvoiceItem';

// ----------------------------------------------------------------------

const InvoiceStatusOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'draft', label: 'Draft' },
];

export default function SalesInvoice() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDueDate, setselectedDueDate] = useState(new Date());
  const [disableFutureDate] = useState(true);

  const [status, setStatus] = useState('paid');

  const handleStatusChange = event => {
    setStatus(event.target.value);
  };

  const [items, setItems] = useState([{
    name: "",
    price: 0,
    quantity: 0
  }]);

  const addItem = (event) => {
    event.preventDefault();
    setItems([...items, {
      name: "",
      price: 0,
      quantity: 0
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
    newItems.splice(index, 1);
    setItems(newItems);
 
  };


  const [fields, setFields] = useState([{ value: '' }]);
  const nameRef = useRef({});
  const priceRef= useRef({});
  const qtyRef = useRef({});
  const handleChange = (index, event) => {
    console.log(index);
    const values = [...items];
    values[index].value = event.target.value;
    setFields(values);
  };

  const handleAddField = () => {
    const values = [...fields];
    values.push({ value: '' });
    setFields(values);
  };

  const handleRemoveField = index => {
    const values = [...fields];
    values.splice(index, 1);
    setFields(values);
  };
  return (
    <>
      <Helmet>
        <title> Sales Invoice </title>
      </Helmet>

      <Container>
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
            <Grid container spacing={2} mt={1}>
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
            </Grid>
          </Stack>
          <Stack m={2.5} >

            <Typography variant="h6" mb={2} >
              Item Details
            </Typography>

            <List>
              {items.map((field, index) => (                 
                  <InvoiceItem key={index}
                  nameRef={nameRef[index]}
                    priceRef={priceRef[index]}
                     qtyRef={qtyRef[index]} 
                     removeItem={() => removeItem(index)} />            
              ))}
           </List>
            <Grid container spacing={2}  >
              <Grid item xs={12} md={3} >
                <Button variant="outlined" fullWidth onClick={addItem}>Add Item</Button>
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Container>

    </>
  );
}
