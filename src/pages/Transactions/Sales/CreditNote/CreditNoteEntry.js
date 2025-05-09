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
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    Autocomplete,
} from '@mui/material';
import validator from 'validator';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getLastNumber, getLocationList } from '../../../../utils/CommonServices';
import Confirm from '../../../../components/Confirm';
import Iconify from '../../../../components/iconify';
import DateSelector from '../../../../components/DateSelector';
import Dropdownlist from '../../../../components/DropdownList';
import CreditNoteItem from './CreditNoteItem';
import SubTotalSec from '../../../../components/SubTotalSec';
import AlertDialog from '../../../../components/AlertDialog';
import CustomerDialog from '../../../../components/CustomerDialog';
import { GetSingleResult, GetSingleListResult, GetMultipleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import CreditNotePrint from './CreditNotePrint';
import InvoiceItemsDialog from './InvoiceItemsDialog';
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


export default function CreditNoteEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    // const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDueDate, setselectedDueDate] = useState(new Date());
    const [selectedCNDate, setselectedCNDate] = useState(new Date());
    const [IsAlertDialog, setAlertDialog] = useState(false);
    const [disableFutureDate] = useState(true);
    // const [status, setStatus] = useState('draft');
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [showPrintView, setShowPrintView] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [salesmenList, setSalesmenList] = useState([]);
    const [salesmanLoading, setSalesmanLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const { state } = useLocation();
    const { invoiceData } = state || {};

    const [headerData, setheaderData] = useState(
        {
            CnNo:  code  ,
            CnDate:  selectedCNDate  ,
            InvNo:  invoiceData.InvNo  ,
            InvDate: invoiceData?.InvDate  ,
            Status: invoiceData?.Status || 'PAID',
            CustomerCode: invoiceData?.CustomerCode || '',
            Customer: invoiceData?.Customer || 'Customer Name',
            Address: invoiceData?.Address || '',
            TRN: invoiceData?.TRN || '',
            ContactNo: invoiceData?.ContactNo || '',
            Email: invoiceData?.Email || '',
            LPONo: invoiceData?.LPONo || '',
            RefNo: invoiceData?.RefNo || '',
            PaymentMode: invoiceData?.PaymentMode || 'CASH',
            Location: invoiceData?.Location || '',
            CrDays: invoiceData?.CrDays || 0,
            Discount: invoiceData?.Discount || 0,
            Tax: invoiceData?.Tax || 5,
            GrossAmount: invoiceData?.GrossAmount || 0,
            TaxAmount: invoiceData?.TaxAmount || 0,
            NetAmount: invoiceData?.NetAmount || 0,
            SManCode: invoiceData?.SManCode || '',
            Remarks: invoiceData?.Remarks || ''
        })

    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showItemDialog, setShowItemDialog] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState(state?.invoiceItems || []);
    const [accounts, setAccounts] = useState([]);
    const getAccounts = async () => {
        const { Success, Data, Message } = await GetSingleListResult({
            "key": "COA_CRUD",
            "TYPE": "GET_ALL_ACCOUNT",
        });
        if (Success) {
            setAccounts(Data);
        }
    }
    useEffect(() => {
        getAccounts();
    }, []);
    const validate = () => {
        const errors = {};
        let hasError = false;

        // Customer validation
        if (validator.isEmpty(headerData.CustomerCode)) {
            errors.CustomerCode = 'Customer is required';
            showToast('Customer is required', "error");
            hasError = true;
        }

        // Salesman validation
        if (!headerData.SManCode) {
            errors.SManCode = 'Salesman is required';
            showToast('Salesman is required', "error");
            hasError = true;
        }

        // Invoice date validation
        if (!selectedCNDate) {
            errors.CnDate = 'Credit Note date is required';
            showToast('Credit Note date is required', "error");
            hasError = true;
        }

        // Credit Days validation
        if (headerData.CrDays < 0) {
            errors.CrDays = 'Credit days cannot be negative';
            showToast('Credit days cannot be negative', "error");
            hasError = true;
        }

        // Email validation (if provided)
        if (headerData.Email && !validator.isEmail(headerData.Email)) {
            errors.Email = 'Invalid email address';
            showToast('Invalid email address', "error");
            hasError = true;
        }

        // Contact number validation (if provided)
        if (headerData.ContactNo && !validator.isMobilePhone(headerData.ContactNo)) {
            errors.ContactNo = 'Invalid contact number';
            showToast('Invalid contact number', "error");
            hasError = true;
        }

        // Items validation
        if (items.length === 0) {
            errors.items = 'At least one item is required';
            showToast('At least one item is required', "error");
            hasError = true;
        }

        // Validate each item
        const itemErrors = items.map((item, index) => {
            const itemError = {};
            if (!item.name) {
                itemError.name = 'Item name is required';
                hasError = true;
            }
            if (!item.qty || item.qty <= 0) {
                itemError.qty = 'Valid quantity is required';
                hasError = true;
            }
            if (!item.price || item.price <= 0) {
                itemError.price = 'Valid price is required';
                hasError = true;
            }
            return Object.keys(itemError).length > 0 ? itemError : null;
        }).filter(Boolean);

        if (itemErrors.length > 0) {
            errors.items = itemErrors;
            showToast('Please check all item details', "error");
        }

        // Payment validation
        if (!headerData.PaymentMode) {
            errors.PaymentMode = 'Payment mode is required';
            showToast('Payment mode is required', "error");
            hasError = true;
        }

        setErrors(errors);
        return !hasError;
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
        
        setheaderData({
            ...headerData,
            'CnDate': selectedCNDate
        });
    }, [selectedCNDate]);
    useEffect(() => {
        getProducts();
    }, []);
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
    };

    const handleDateChange = (event, name) => {
        const newDate = event.$d;
        setheaderData(prev => {
            const updatedData = {
                ...prev,
                [name]: newDate
            };

            // Calculate new due date whenever invoice date changes
            if (name === 'InvDate') {
                const dueDate = new Date(newDate);
                dueDate.setDate(dueDate.getDate() + Number(updatedData.CrDays));
                setselectedDueDate(dueDate);
            }

            return updatedData;
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
        const { lastNo, IsEditable } = await getLastNumber('CN');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            CnNo: lastNo
        }));
    };



    const addItem = (event) => {
        if (validate()) {
            event.preventDefault();
            // console.log(ItemNewLength);
            setItems([...items, {
                name: "",
                price: 0,
                desc: "",
                qty: 0,
                unit: "",
                type: "inventory",
                account: "",
                discountPercent: 0,
                tax: 0,
                discount: 0,
                total: 0,
                
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
            "ContactNo": value.CUS_MOB,
            "Email": value.CUS_EMAIL

        });
        // setSelectedValue(value.name);
    };

    const getLocations = async () => {
        const Data = await getLocationList();
        setLocations(Data);
        console.log("locationList", locations);
    };
    useEffect(() => {
        getLocations();
    }, []);

    const CreateInvoice = async () => {
        Confirm(`Do you want to ${isEditMode ? 'update' : 'save'}?`).then(async () => {
            try {
                setLoadingFull(false);

                const encodeJsonToBase64 = (json) => {
                    // Step 1: Convert the string to Base64
                    const base64Encoded = btoa(json);
                    return base64Encoded;
                };

                const base64Data = encodeJsonToBase64(JSON.stringify({
                    "key": "SALE_INV_CRUD",
                    "TYPE": isEditMode ? "UPDATE" : "INSERT",
                    "DOC_NO": id,
                    "headerData": {
                        ...headerData, 
                        "InvDate": selectedCNDate,
                        "InvNo": code,
                        "GrossAmount": calculateTotal(items),
                        "TaxAmount": (calculateTotal(items) - headerData.Discount) * headerData.Tax / 100.00,
                        "NetAmount": (calculateTotal(items) - headerData.Discount) * (1 + headerData.Tax / 100.00),
                        "Remarks": headerData.Remarks || ''
                    },
                    "detailData": items.map((item, index) => {
                        return {
                            ...item,
                            srno: index + 1
                        };
                    })
                }));

                const { Success, Message, Data } = await GetSingleResult({
                    "json": base64Data
                });

                if (Success) {
                    setIsEditMode(false);
                    setIsEditable(false);
                    navigate(`/sales-entry/${Data.id}`, { replace: true });
                    showToast(Data.Message, 'success');
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
    const [products, setProducts] = useState([]);
    const getProducts = async () => {
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "ITEM_CRUD",
                "TYPE": "GET_ALL",
            });
            if (Success) {
                setProducts(Data);
            }
        } catch (error) {
            console.error("Error:", error); // More informative error handling
        }
    };
    const loadInvoiceDetails = async (invoiceId) => {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetMultipleResult({
                "key": "CN_CRUD",
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
                    // Status: headerData?.Status,
                    CustomerCode: headerData?.CustomerCode,
                    InvDate: new Date(headerData.InvDate)
                });
                setselectedCNDate(new Date(headerData.CnDate));
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
        console.log('Opening print dialog');
        setPrintDialogOpen(true);
    };

    const handleClosePrintDialog = () => {
        console.log('Closing print dialog');
        setPrintDialogOpen(false);
    };


    const handlePrintFromDialog = () => {
        const printContent = document.getElementById('print-content');
        if (!printContent) {
            console.error('Print content not found');
            return;
        }

        const printWindow = window.open('', '', 'width=800,height=600');
        if (!printWindow) {
            console.error('Could not open print window');
            return;
        }

        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Print Invoice</title>
                    <style>
                        ${styles}
                        body {
                            padding: 20px;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            @page {
                                size: A4;
                                margin: 1cm;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    const toggleEditMode = () => {
        if (id) {
            loadInvoiceDetails(id);
        }
        if (invoiceData && isEditable)
            handleNewInvoice();


        setIsEditable(!isEditable);

    };

    const handleNewInvoice = () => {
        // Reset all data
        setheaderData({
            CnNo: '',
            CnDate: selectedCNDate,
            InvNo: '',
            InvDate: '',
            Status: 'PAID',
            CustomerCode: '',
            Customer: 'Customer Name',
            Address: '',
            Location: '',
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
            NetAmount: 0,
            SManCode: '',
            Remarks: ''
        });
        setItems([]);  // Initialize with empty array instead of default item
        setErrors({});
        setIsEditable(true);
        setIsEditMode(false);
        getCode(); // Get new invoice number
        navigate('/sales-entry');
    };

    const fetchSalesmen = async () => {
        try {
            setSalesmanLoading(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "SMAN_CRUD",
                "TYPE": "GET_ALL"
            });
            if (Success) {
                setSalesmenList(Data);
            }
        } catch (error) {
            showToast("Error fetching salesmen", "error");
            console.error('Error fetching salesmen:', error);
        } finally {
            setSalesmanLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesmen();
    }, []);

    const handleItemSelect = (item) => {
        if (Array.isArray(item)) {
            // Handle select all
            setSelectedItems(item);
            return;
        }

        setSelectedItems(prev => {
            const exists = prev.some(i => i.name === item.name);
            if (exists) {
                return prev.filter(i => i.name !== item.name);
            }
            return [...prev, item];
        });
    };

    const handleConfirmItems = () => {
        const itemsWithType = selectedItems.map(item => ({
            ...item,
            type: 'inventory'  // Set default type for items from invoice
        }));
        setItems(itemsWithType);
        setShowItemDialog(false);
    };

    return (
        <>
            <Helmet>
                <title> Sales Credit Note </title>
            </Helmet>

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4" gutterBottom>
                    {isEditMode ? 'Edit Sales Credit Note' : 'New Sales Credit Note'}
                </Typography>
                <Stack direction="row" spacing={2}>
                    {!isEditable && (id) && (
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon="eva:printer-fill" />}
                            onClick={handlePrint}
                        >
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

            <Card>
                <Stack maxwidth={'lg'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                    <Grid container spacing={2} mt={1}  >
                        <Grid item xs={12} md={4}>
                            <Grid container spacing={2} mt={1}>
                                <Grid item xs={8} md={8}>
                                    <Typography variant="subtitle1" ml={2} mb={1} style={{ color: "gray" }} >
                                        Customer :   {headerData.CustomerCode}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4} md={4} align='right'>
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
                                <Grid item xs={12} md={12}>
                                    <Typography variant="body2" ml={2} style={{ color: "black" }} >
                                        {headerData.Customer}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Typography variant="body2" ml={2} style={{ color: "gray" }} >
                                        {headerData.TRN}
                                    </Typography>
                                    <Typography variant="body2" ml={2} mb={2} style={{ color: "gray" }} >
                                        {headerData.Address}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <Grid container spacing={1}>
                            <Grid item xs={6} md={2}  >
                                    <FormControl fullWidth>
                                        <TextField
                                            id="credit-note-no"
                                            label="Credit Note#"
                                            name="CnNo"
                                            value={headerData.CnNo}
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
                                    <FormControl fullWidth error={Boolean(errors.CnDate)}>
                                        <DateSelector
                                            label="Credit Note Date"
                                            size="small"
                                            disableFuture={disableFutureDate}
                                            value={headerData.CnDate}
                                            onChange={setselectedCNDate}
                                            disable={!isEditable}
                                            error={Boolean(errors.CnDate)}
                                            helperText={errors.CnDate}
                                            required
                                        />
                                    </FormControl>
                                </Grid>
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
                                            disabled 
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={4} >
                                    <FormControl fullWidth error={Boolean(errors.InvDate)}>
                                        <DateSelector
                                            label="Invoice Date"
                                            size="small"
                                            disableFuture={disableFutureDate}
                                            value={headerData.InvDate} 
                                            disable 
                                            error={Boolean(errors.InvDate)}
                                            helperText={errors.InvDate}
                                            required
                                        />
                                    </FormControl>
                                </Grid>
                           
                            </Grid>
                            <Grid container spacing={1} mt={1}>
                                <Grid item xs={6} md={3}  >
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
                                            error={Boolean(errors.ContactNo)}
                                            helperText={errors.ContactNo}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={3} >
                                    <FormControl fullWidth>
                                        <TextField
                                            id="email"
                                            label="Email Id"
                                            name="Email"
                                            size="small"
                                            type="email"
                                            value={headerData.Email}
                                            onChange={handleInputChange}
                                            error={Boolean(errors.Email)}
                                            helperText={errors.Email}
                                            disabled={!isEditable}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6} md={3} >
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
                                <Grid item xs={6} md={3} b >
                                    <FormControl fullWidth>
                                        <TextField
                                            id="ref-no"
                                            label="Ref.No"
                                            name="RefNo"
                                            size="small"
                                            value={headerData.RefNo}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={4} mt={1} >
                                    <FormControl fullWidth error={Boolean(errors.SManCode)}>
                                        <Autocomplete
                                            disabled={!isEditable}
                                            options={salesmenList}
                                            value={salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode) || null}
                                            getOptionLabel={(option) =>
                                                option ? `${option.SMAN_DESC} (${option.SMAN_DOCNO})` : ''
                                            }
                                            loading={salesmanLoading}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Sales Person"
                                                    size="small"
                                                    error={Boolean(errors.SManCode)}
                                                    helperText={errors.SManCode}
                                                    required
                                                />
                                            )}
                                            onChange={(event, value) => {
                                                setheaderData({
                                                    ...headerData,
                                                    SManCode: value?.SMAN_DOCNO || ''
                                                });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6} md={4} mt={1}    >
                                    <FormControl size='small' fullWidth error={Boolean(errors.Location)}>
                                        <Autocomplete
                                            size='small'
                                            disabled={!isEditable}
                                            options={locations}
                                            getOptionLabel={(option) => `${option.LM_LOCATION_CODE} - ${option.LM_LOCATION_NAME}`}
                                            value={locations.find(l => l.LM_LOCATION_CODE === headerData.Location) || null}
                                            onChange={(_, newValue) => {
                                                setheaderData(prev => ({
                                                    ...prev,
                                                    Location: newValue?.LM_LOCATION_CODE || ''
                                                }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Location"
                                                    required
                                                    error={Boolean(errors.Location)}
                                                    helperText={errors.Location}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={4} mt={1}    >
                                    <FormControl fullWidth error={Boolean(errors.PaymentMode)}>
                                        <Dropdownlist
                                            options={PaymentModeOptions}
                                            name="PaymentMode"
                                            value={headerData.PaymentMode}
                                            label="Payment Mode"
                                            onChange={handleInputChange}
                                            disable={!isEditable}
                                            error={Boolean(errors.PaymentMode)}
                                            helperText={errors.PaymentMode}
                                            required
                                        />
                                    </FormControl>
                                </Grid>
                                {/* <Grid item xs={6} md={6} mt={1} >
                                    <FormControl fullWidth>
                                        <Dropdownlist options={InvoiceStatusOptions}
                                            name="Status"
                                            value={headerData.Status}
                                            label={"Status"}
                                            onChange={handleInputChange}
                                            disable={!isEditable}
                                        />
                                    </FormControl>
                                </Grid> */}
                            </Grid>
                            <Grid container spacing={1} mt={1}>
                                <Grid item xs={12} md={12}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id="remarks"
                                            label="Remarks"
                                            name="Remarks"
                                            size="small"
                                            multiline
                                            rows={2}
                                            value={headerData.Remarks}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            placeholder="Enter any additional notes or remarks "
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Stack>
                <Stack m={2.5} maxwidth={'lg'}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            Item Details
                        </Typography>
                        {isEditable && (
                            <Button
                                variant="contained"
                                startIcon={<Iconify icon="eva:plus-fill" />}
                                onClick={() => setShowItemDialog(true)}
                            >
                                Add Items from Invoice
                            </Button>
                        )}
                    </Box>

                    {items.map((field, index) => (
                        <CreditNoteItem
                            key={index}
                            Propkey={index}
                            accounts={accounts}
                            tax={headerData.Tax}
                            discountPercent={1-(headerData.Discount / calculateTotal(items))}
                            products={products}
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
                        calculateTotal={calculateTotal(items)}
                        discount={headerData.Discount}
                        tax={headerData.Tax}
                        handleInputChange={(e) => handleInputChange(e)}
                        isEditable={isEditable}
                    />
                    <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                        {isEditable && (
                            <Button variant="contained" color={isEditMode ? 'warning' : 'success'} size='large' onClick={handleSave}>
                                {isEditMode ? 'Update Credit Note' : 'Create Credit Note'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Card>

            <InvoiceItemsDialog
                open={showItemDialog}
                onClose={() => setShowItemDialog(false)}
                items={invoiceItems}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
                onConfirm={handleConfirmItems}
            />

            {/* Print Dialog */}
            <Dialog
                open={printDialogOpen}
                onClose={() => setPrintDialogOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    sx: {
                        minHeight: '80vh',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }
                }}
            >
                <DialogTitle>
                    <Typography variant="h6">Print Preview</Typography>
                </DialogTitle>
                <DialogContent>
                    <Box id="print-content" sx={{ p: 2 }}>
                        <CreditNotePrint
                            headerData={{
                                ...headerData,
                                SalesmanName: salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode)?.SMAN_DESC ?
                                    `${salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode).SMAN_DESC} (${headerData.SManCode})` :
                                    headerData.SManCode || ''
                            }}
                            items={items}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPrintDialogOpen(false)}>
                        Close
                    </Button>
                    <Button
                        onClick={handlePrintFromDialog}
                        variant="contained"
                        color="primary"
                        startIcon={<Iconify icon="eva:printer-fill" />}
                    >
                        Print
                    </Button>
                </DialogActions>
            </Dialog>

            {IsAlertDialog && (
                <AlertDialog
                    Message="Are you sure you want to proceed?"
                    OnSuccess={setAlertDialog}
                />
            )}
        </>
    );
}
