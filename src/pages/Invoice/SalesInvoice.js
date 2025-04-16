import { Helmet } from 'react-helmet-async';
import { useContext,  useState, useEffect } from 'react';
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
import validator from 'validator';
import Confirm from '../../components/Confirm';
import Iconify from '../../components/iconify';
import DateSelector from '../../components/DateSelector';
import Dropdownlist from '../../components/DropdownList';
import InvoiceItem from './InvoiceItem';
import SubTotalSec from './SubTotalSec';
import AlertDialog from '../../components/AlertDialog';
import CustomerDialog from '../../components/CustomerDialog';
import { GetSingleResult } from '../../hooks/Api'; 
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';
// import { head } from 'lodash';

// ----------------------------------------------------------------------

const InvoiceStatusOptions = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'draft', label: 'Draft' },
];

const PaymentModeOptions = [
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'TT', label: 'TT' },
  { value: 'OTHER', label: 'Others' },
];


export default function SalesInvoice2() {

  const { showToast } = useToast();
  const { setLoadingFull } = useContext(AuthContext);
  // const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDueDate, setselectedDueDate] = useState(new Date());
  const [IsAlertDialog, setAlertDialog] = useState(false);
  const [disableFutureDate] = useState(true);
  // const [status, setStatus] = useState('draft');
  const [errors, setErrors] = useState({});

  

  const [headerData, setheaderData] = useState(
    {
    InvNo: '1001',
    InvDate: new Date(),
    Status: 'draft',
    CustomerCode: '',
    Customer: 'Customer Name',
    Address: '',
    TRN: '',
    ContactNo: '',
    Email: '',
    LPONo: '',
    RefNo: '',
    PaymentMode: 'CASH',
    CrDays: 0,
    Discount:0,
    Tax:0,
    GrossAmount:0,
    TaxAmount:0,
    NetAmount:0
  })

  const validate = () => {
    const errors = {};

    if (validator.isEmpty(headerData.CustomerCode)) {
        errors.CustomerCode = 'Customer is required';
        showToast('Customer is required', "error");
    }
    if (items.some((item) => validator.isEmpty(item.name))) {
        errors.item = 'Item Should not be blank'
        // showToast(errors.item, "error");
    }
    if ((!validator.isEmail(headerData.Email) && Object.keys(headerData.Email).length > 0)) {
        errors.Email = 'Not a valid Email'
    }
    setErrors(errors);
    console.log(errors);
    return Object.keys(errors).length === 0;
  };  

  useEffect(() => {
    // if (headerData.InvDate && headerData.CrDays) {
      const dueDate = new Date(headerData.InvDate);
      dueDate.setDate(dueDate.getDate() + Number(headerData.CrDays));
      setselectedDueDate(dueDate);
    // }
  }, [headerData.InvDate, headerData.CrDays]);

  useEffect(() => {
    // if (invoiceDate && dueDate) {
      const creditDays = Math.round(
        (new Date(selectedDueDate) - new Date(headerData.InvDate)) / (1000 * 60 * 60 * 24));
        setheaderData({
          ...headerData,
          'CrDays': creditDays
        });
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ selectedDueDate]);

  const handleInputChange = event => {
    const {type, name, value } = event.target;
    if (type === 'number' && Object.keys(value).length > 1)
    setheaderData({
      ...headerData,
      [name]: value.replace(/^0+/, '')
    });
    else
    if (name === 'CrDays' && value==='')
    setheaderData({
      ...headerData,
      [name]: 0
    });
    else
    setheaderData({
      ...headerData,
      [name]: value
    });
    console.log(headerData)
    // console.log(selectedDate)
    console.log(selectedDueDate.$d)

  };

  const handleDateChange = (event,name) => {
    setheaderData({
      ...headerData,
      [name]: event.$d
    });
    console.log(headerData)
    // console.log(selectedDate)
    console.log(selectedDueDate.$d)
  };

  const handleSave = () => {
    if (validate()) {
      CreateInvoice();
    }
};

  // const handleStatusChange = event => {
  //   setStatus(event.target.value);
  // };

  const [items, setItems] = useState([{
    name: "",
    price: 0,
    desc: "",
    qty: 0,
    unit: "Unit"
  }]);

  const addItem = (event) => {
    if(validate()) {
      event.preventDefault();
      // console.log(ItemNewLength);
      setItems([...items, {
        name: "",
        price: 0,
        desc: "",
        qty: 0,
        unit: ""
      }]);
    }
  };


  // const editItem = (index, event) => {
  //   event.preventDefault();
  //   const newItems = [...items];
  //   newItems[index] = { name: event.target.itemName.value, price: event.target.itemPrice.value };
  //   setItems(newItems);
  // };

  const removeItem = (index) => {
    const newItems = [...items];
    console.log(index);
    newItems.splice(index, 1);
    setItems(newItems);
    console.log(newItems);
  };


  function calculateTotal(items) {
    return items.reduce((total, item) => total + item.price * item.qty, 0);
  }

  // For Customer Dialog
  const [open, setOpen] = useState(false);
  // const [selectedValue, setSelectedValue] = useState("Customer Name");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelect = (value) => {
    setOpen(false);
    setheaderData({
      ...headerData,
      "Customer": value.CUS_DESC,
      "Address": value.CUS_ADDRESS,
      "TRN": value.CUS_TRN,
      "CustomerCode": value.CUS_DOCNO
    });
    // setSelectedValue(value.name);
  };

  // const [fields, setFields] = useState([{ value: '' }]);
  // const codeRef = useRef({});
  // const descRef = useRef({});
  // const unitRef = useRef({});
  // const priceRef = useRef({});
  // const qtyRef = useRef({});
  // const handleChange = (index, event) => {
  //   console.log(index);
  //   const values = [...items];
  //   values[index].value = event.target.value;
  //   setFields(values);
  // };
  const CreateInvoice = async () => {
    Confirm('Do you want to save?').then(async () => {
      try {
        setLoadingFull(false);
        
        const encodeJsonToBase64 = (json) => {
          // Step 1: Convert the string to Base64
          const base64Encoded = btoa(json);
          return base64Encoded;
        };
      
        const base64Data = encodeJsonToBase64(JSON.stringify({
            "key": "INVOICE_CRUD",
            "TYPE": "INSERT",
            "headerData": {
                ...headerData,
                "GrossAmount": calculateTotal(items),
                "TaxAmount": (calculateTotal(items) - headerData.Discount) * headerData.Tax / 100.00,
                "NetAmount": (calculateTotal(items) - headerData.Discount) * (1 + headerData.Tax / 100.00)
              },
            "detailData": items.map((item, index) => {
                  return {
                    ...item,
                    srno: index + 1
                  };
              })
          }));

        const { Success, Message } = await GetSingleResult({
          "json": base64Data
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
    });
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
        <Card  >
          <Stack maxwidth={'lg'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px'  }}>
            <Grid container spacing={2} mt={1}  >
              <Grid item xs={12} md={5}>
                <Grid container spacing={2} mt={1}>
                  <Grid items xs={8} md={8}>
                    <Typography variant="subtitle1" ml={2} mb={1} style={{ color: "gray" }} >
                      Customer :   {headerData.CustomerCode}
                    </Typography>
                  </Grid>
                  <Grid items xs={4} md={4} align='right'>
                    <Button size="small" startIcon={<Iconify icon={headerData?.CustomerCode? "eva:edit-fill" : "eva:person-add-fill"} />} onClick={handleClickOpen}>
                      {headerData?.CustomerCode? 'change' : 'Add'}
                    </Button>
                    <CustomerDialog
                      open={open}
                      onClose={handleClose}
                      onSelect={handleSelect}
                    />
                  </Grid>
                  <Grid items xs={12} md={12}>
                    <Typography variant="body2" ml={2} style={{ color: "black" }} >
                      {headerData.Customer}
                    </Typography>
                  </Grid>
                  <Grid items xs={12} md={12}>
                    <Typography variant="body2" ml={2}  style={{ color: "gray" }} >
                    {headerData.TRN}
                    </Typography>
                    <Typography variant="body2" ml={2} mb={2} style={{ color: "gray" }} >
                    {headerData.Address}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={7}>
                <Grid container spacing={1}>
                  <Grid item xs={6} md={2}  >
                    <FormControl fullWidth>
                      <TextField
                        id="invoice-no"
                        label="Invoice#"
                        name="InvNo"
                        value={headerData.InvNo}
                        onChange={handleInputChange}
                        size="small"
                        inputProps={{
                          readOnly: true
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4} >
                    <FormControl fullWidth>
                      <DateSelector
                        label="Date"
                        size="small"
                        disableFuture={disableFutureDate}
                        value={headerData.InvDate}
                        onChange={(e)=>{
                          handleDateChange(e,"InvDate")}
                        }
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={2}  >
                    <FormControl fullWidth>
                      <TextField
                        id="credit-days"
                        label="Credit Days"
                        name="CrDays"
                        type='number'
                        value={headerData.CrDays}
                        onChange={handleInputChange}
                        size="small"
                        inputProps={{
                          style: {
                            textAlign: 'right',
                          },
                          min: 0,
                        }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4} >
                    <FormControl fullWidth>
                      <DateSelector
                             size="small"
                        label="Due Date"
                        disableFuture={!disableFutureDate}
                        value={selectedDueDate}
                        onChange={setselectedDueDate}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={1} mt={1}>
                  <Grid item xs={6} md={6}  >
                    <FormControl fullWidth>
                      <TextField
                        id="mob-no"
                        label="Mobile#"
                        name="ContactNo"
                        size="small"
                        type="tel"
                        value={headerData.ContactNo}
                        onChange={handleInputChange}
                        // inputProps={{
                        //   pattern: '^\\+(?:[0-9] ?){6,14}[0-9]$',
                        // }}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={6} >
                    <FormControl fullWidth>
                    <TextField
                        id="email"
                        label="Email Id"
                        name="Email"
                        size="small"
                        type="email"
                        value={headerData.Email}
                        onChange={handleInputChange}
                        error = {errors.Email !== undefined}
                        helperText = {errors.Email}
                        // inputProps={{
                        //   pattern: '^\\+(?:[0-9] ?){6,14}[0-9]$',
                        // }}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={1} mt={1}>
                  <Grid item xs={6} md={8} >
                    <FormControl fullWidth>
                      <TextField
                        id="lpo-no"
                        label="Cus.LPO No"
                        name="LPONo"
                        size="small"
                        value={headerData.LPONo}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4}  >
                    <FormControl fullWidth>
                      <Dropdownlist options={PaymentModeOptions}
                        name="PaymentMode"
                        value={headerData.PaymentMode}
                        label={"Payment Mode"}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
                <Grid container spacing={1} mt={1}>
                  <Grid item xs={6} md={8} >
                    <FormControl fullWidth>
                      <TextField
                        id="Ref-no"
                        label="Reference"
                        name="RefNo"
                        value={headerData.RefNo}
                        onChange={handleInputChange}
                        size="small"
                        // required
                        // error="true"
                      />
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} md={4}  >
                    <FormControl fullWidth>
                      <Dropdownlist options={InvoiceStatusOptions}
                        name="Status"
                        value={headerData.Status}
                        label={"Status"}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Stack>
          <Stack m={2.5}  maxwidth={'lg'}  >

            <Typography variant="h6" mb={2} >
              Item Details
            </Typography>
            {items.map((field, index) => (
              <InvoiceItem 
                key={index} 
                Propkey={index}
                code={items[index].name}
                desc={items[index].desc}
                qty={items[index].qty}
                price={items[index].price}
                unit={items[index].unit}
                items={items}
                setItems={setItems}
                removeItem={() => removeItem(index)} 
                errors = {errors.item}
              />
            ))}



            <SubTotalSec 
              addItem={addItem} 
              calculateTotal={calculateTotal(items)} 
              discount={headerData.Discount}
              tax={headerData.Tax}
              handleInputChange={(e)=>handleInputChange(e)}
            />
            <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
              <Button variant="contained" color='success' size='large' onClick={handleSave}>
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
