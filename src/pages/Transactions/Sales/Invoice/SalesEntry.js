import { Helmet } from 'react-helmet-async';
import { useContext, useState, useEffect } from 'react';
// @mui
import {
    Card,
    Stack,
    Button,
    Typography,
    Grid,
    TextField,
    FormControl,
    Box,
} from '@mui/material';
import validator from 'validator';
import { useNavigate, useParams } from 'react-router-dom';
import { getLastNumber } from '../../../../utils/CommonServices';
import Confirm from '../../../../components/Confirm';
import Iconify from '../../../../components/iconify';
import DateSelector from '../../../../components/DateSelector';
import Dropdownlist from '../../../../components/DropdownList';
import InvoiceItem from './InvoiceItem';
import SubTotalSec from './SubTotalSec';
import AlertDialog from '../../../../components/AlertDialog';
import CustomerDialog from '../../../../components/CustomerDialog';
import { GetSingleResult, GetSingleListResult, GetMultipleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import InvoicePrint from './InvoicePrint';
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


export default function SalesEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    // const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDueDate, setselectedDueDate] = useState(new Date());
    const [IsAlertDialog, setAlertDialog] = useState(false);
    const [disableFutureDate] = useState(true);
    // const [status, setStatus] = useState('draft');
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [showPrintView, setShowPrintView] = useState(false);





    const [headerData, setheaderData] = useState(
        {
            InvNo: code,
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
            Discount: 0,
            Tax: 5,
            GrossAmount: 0,
            TaxAmount: 0,
            NetAmount: 0
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
        if (!id) {
            const dueDate = new Date(headerData.InvDate);
            dueDate.setDate(dueDate.getDate() + Number(headerData.CrDays));
            setselectedDueDate(dueDate);
        }
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
    }, [selectedDueDate]);

    const handleInputChange = event => {
        const { type, name, value } = event.target;
        if (type === 'number' && Object.keys(value).length > 1)
            setheaderData({
                ...headerData,
                [name]: value.replace(/^0+/, '')
            });
        else
            if (name === 'CrDays' && value === '')
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

    const handleDateChange = (event, name) => {
        setheaderData({
            ...headerData,
            [name]: event.$d
        });
        
    };

    const handleSave = () => {
        if (validate()) {
            CreateInvoice();
        }
    };
    useEffect(() => {
        if (id) {
            loadInvoiceDetails(id);
            setIsEditMode(true);
            setIsEditable(false);
        } else {
            getCode();
            setIsEditMode(false);
            setIsEditable(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    const getCode = async () => {
        const { lastNo, IsEditable } = await getLastNumber('INV');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            InvNo: lastNo
        }));
    };

    const [items, setItems] = useState([{
        name: "",
        price: 0,
        desc: "",
        qty: 0,
        unit: "Unit"
    }]);

    const addItem = (event) => {
        if (validate()) {
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
            "CustomerCode": value.CUS_DOCNO,
            "ContactNo":value.CUS_MOB,
            "Email":value.CUS_EMAIL

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
                    "TYPE": isEditMode ? "UPDATE" : "INSERT",
                    "DOC_NO":id,
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
                });

                if (Success) {
                    navigate('/salesinvoice', { replace: true });
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

    const loadInvoiceDetails = async (invoiceId) => {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetMultipleResult({
                "key": "INVOICE_CRUD",
                "TYPE": "GET",
                "DOC_NO": invoiceId
            });

            if (Success) {
                // Data[0] contains header data, Data[1] contains items
                const headerData = Data[0][0]; // First array's first element
                const itemsData = Data[1]; // Second array contains all items
                console.log("asdas--", itemsData, Data);

                setheaderData({
                    ...headerData,
                    InvNo: headerData?.InvNo,
                    Status: headerData?.Status,
                    CustomerCode: headerData?.CustomerCode,  
                    InvDate: new Date(headerData.InvDate)
                });
                setselectedDueDate(new Date(headerData.InvDate));
                setItems(itemsData || []);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            showToast("Error loading invoice details", "error");
        } finally {
            setLoadingFull(false);
        }
    };

    const handlePrint = () => {
        setShowPrintView(true);
        setTimeout(() => {
            window.print();
            setShowPrintView(false);
        }, 100);
    };

    const toggleEditMode = () => {
        setIsEditable(!isEditable);
    };

    const handleNewInvoice = () => {
        // Reset all data
        setheaderData({
            InvNo: '',
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
            Discount: 0,
            Tax: 5,
            GrossAmount: 0,
            TaxAmount: 0,
            NetAmount: 0
        });
        setItems([{
            name: "",
            price: 0,
            desc: "",
            qty: 0,
            unit: "Unit"
        }]);
        setErrors({});
        setIsEditable(true);
        setIsEditMode(false);
        getCode(); // Get new invoice number
        navigate('/salesentry');
    };

    return (
        <>
            <Helmet>
                <title> Sales Invoice </title>
            </Helmet>

            {!showPrintView ? (
                <>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                        <Typography variant="h4" gutterBottom>
                            {isEditMode ? 'Edit Sales Invoice' : 'New Sales Invoice'}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            {!isEditable && (
                                <Button variant="outlined" startIcon={<Iconify icon="eva:printer-fill" />} onClick={handlePrint}>
                                    Print
                                </Button>
                            )}
                            {isEditMode && !isEditable && (
                                <Button variant="contained" color="primary" startIcon={<Iconify icon="eva:edit-fill" />} onClick={toggleEditMode}>
                                    Enable Edit
                                </Button>
                            )}
                            {isEditable && (
                                <Button variant="contained" color="secondary" startIcon={<Iconify icon="eva:close-fill" />} onClick={toggleEditMode}>
                                    Cancel Edit
                                </Button>
                            )}
                            <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleNewInvoice}>
                                New Invoice
                            </Button>
                        </Stack>
                    </Stack>
                    <Card  >
                        <Stack maxwidth={'lg'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                            <Grid container spacing={2} mt={1}  >
                                <Grid item xs={12} md={5}>
                                    <Grid container spacing={2} mt={1}>
                                        <Grid items xs={8} md={8}>
                                            <Typography variant="subtitle1" ml={2} mb={1} style={{ color: "gray" }} >
                                                Customer :   {headerData.CustomerCode}
                                            </Typography>
                                        </Grid>
                                        <Grid items xs={4} md={4} align='right'>
                                            {isEditable && (
                                                <Button size="small" startIcon={<Iconify icon={headerData?.CustomerCode ? "eva:edit-fill" : "eva:person-add-fill"} />} onClick={handleClickOpen}>
                                                    {headerData?.CustomerCode ? 'change' : 'Add'}
                                                </Button>
                                            )}
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
                                            <Typography variant="body2" ml={2} style={{ color: "gray" }} >
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
                                                    disabled={!isEditable}
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
                                                    onChange={(e) => {
                                                        handleDateChange(e, "InvDate")
                                                    }}
                                                    disabled={!isEditable}
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
                                                    disabled={!isEditable}
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
                                                    disabled={!isEditable}
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
                                                    disabled={!isEditable}
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
                                                    error={errors.Email !== undefined}
                                                    helperText={errors.Email}
                                                    disabled={!isEditable}
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
                                                    disabled={!isEditable}
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
                                                    disabled={!isEditable}
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
                                                    disabled={!isEditable}
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
                                                    disabled={!isEditable}
                                                />
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Stack>
                        <Stack m={2.5} maxwidth={'lg'}  >

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
                                    errors={errors.item}
                                    isEditable={isEditable}
                                />
                            ))}



                            <SubTotalSec
                                addItem={addItem}
                                calculateTotal={calculateTotal(items)}
                                discount={headerData.Discount}
                                tax={headerData.Tax}
                                handleInputChange={(e) => handleInputChange(e)}
                                isEditable={isEditable}
                            />
                            <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                                {isEditable && (
                                    <Button variant="contained" color={isEditMode ? 'warning' : 'success'} size='large' onClick={handleSave}>
                                        {isEditMode ? 'Update Invoice' : 'Create Invoice'}
                                    </Button>
                                )}
                            </Stack>
                        </Stack>
                    </Card>
                </>
            ) : (
                <InvoicePrint headerData={headerData} items={items} />
            )}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .container, .container * {
                            visibility: visible;
                        }
                        .container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .page-break {
                            page-break-before: always;
                        }
                        .no-break {
                            page-break-inside: avoid;
                        }
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 15px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        font-size: 12px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        page-break-inside: avoid;
                    }
                    .company-info {
                        display: flex;
                        align-items: center;
                    }
                    .company-logo {
                        height: 60px;
                        margin-right: 15px;
                        border-radius: 4px;
                    }
                    .invoice-title {
                        text-align: right;
                        color: #113160;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        border-bottom: 2px solid #113160;
                        padding-bottom: 8px;
                    }
                    .customer-details {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }
                    .customer-box {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        flex: 1;
                        margin: 0 8px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        background-color: #fff;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        font-size: 11px;
                    }
                    th {
                        background-color: #113160;
                        color: #fff;
                        padding: 8px;
                        text-align: left;
                        font-size: 11px;
                    }
                    td {
                        padding: 8px;
                        border-bottom: 1px solid #eee;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    .totals {
                        width: 250px;
                        margin-left: auto;
                        background-color: #fff;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        page-break-inside: avoid;
                    }
                    .totals tr:last-child {
                        background-color: #113160;
                        color: #fff;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        border-top: 2px solid #113160;
                        page-break-inside: avoid;
                    }
                    .section-title {
                        color: #113160;
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 8px;
                        border-bottom: 2px solid #113160;
                        padding-bottom: 4px;
                    }
                    .value-text {
                        font-weight: 500;
                        color: #113160;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: bold;
                    }
                    .status-paid {
                        background-color: #e8f5e9;
                        color: #2e7d32;
                    }
                    .status-unpaid {
                        background-color: #ffebee;
                        color: #d32f2f;
                    }
                    .status-overdue {
                        background-color: #fff3e0;
                        color: #ed6c02;
                    }
                    .status-draft {
                        background-color: #e3f2fd;
                        color: #113160;
                    }
                `}
            </style>
            {IsAlertDialog && (<AlertDialog
                Message="Are you sure you want to proceed?"
                OnSuccess={setAlertDialog}
            />)}

        </>
    );
}
