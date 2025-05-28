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
import { getLastNumber, getLocationList, getUnitList } from '../../../../utils/CommonServices';
import Confirm from '../../../../components/Confirm';
import Iconify from '../../../../components/iconify';
import DateSelector from '../../../../components/DateSelector';
import Dropdownlist from '../../../../components/DropdownList';  
import AlertDialog from '../../../../components/AlertDialog';
import { GetSingleResult, GetSingleListResult, GetMultipleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import SupplierDialog from '../../../../components/SupplierDialog';
import PrintComponent from '../../../../components/PrintComponent';
import TransactionItem from '../../../../components/TransactionItem';
import PrintDialog from '../../../../components/PrintDialog';   
import SubTotalSec from '../../../../components/SubTotalSec';
import PageHeader from '../../../../components/PageHeader';
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


export default function PurchaseEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    // const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDueDate, setselectedDueDate] = useState(new Date());
    const [selectedInvDate, setselectedInvDate] = useState(new Date());
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
            InvNo: invoiceData?.InvNo || code,
            InvDate: invoiceData?.InvDate || selectedInvDate,
            Status: invoiceData?.Status || 'PAID',
            SupplierCode: invoiceData?.SupplierCode || '',
            Supplier: invoiceData?.Supplier || 'Supplier Name',
            Location: invoiceData?.Location || '',
            Address: invoiceData?.Address || '',
            TRN: invoiceData?.TRN || '',
            ContactNo: invoiceData?.ContactNo || '',
            Email: invoiceData?.Email || '',
            RefNo: invoiceData?.RefNo || '',
            SuppInvNo: invoiceData?.SuppInvNo || '',
            PaymentMode: invoiceData?.PaymentMode || 'CASH',
            CrDays: invoiceData?.CrDays || 0,
            Discount: invoiceData?.Discount || 0,
            Tax: invoiceData?.Tax || 5,
            GrossAmount: invoiceData?.GrossAmount || 0,
            TaxAmount: invoiceData?.TaxAmount || 0,
            NetAmount: invoiceData?.NetAmount || 0,
            SManCode: invoiceData?.SManCode || '',
            Remarks: invoiceData?.Remarks || ''
        })

    const [items, setItems] = useState(invoiceData?.items || [{
        name: "",
        price: 0,
        desc: "",
        qty: 0,
        unit: "Unit"
    }]);
    const validate = () => {
        const errors = {};
        let hasError = false;

        // Customer validation
        if (validator.isEmpty(headerData.SupplierCode)) {
            errors.SupplierCode = 'Supplier is required';
            showToast('Supplier is required', "error");
            hasError = true;
        }

        // Salesman validation
        if (!headerData.SManCode) {
            errors.SManCode = 'Salesman is required';
            showToast('Salesman is required', "error");
            hasError = true;
        }

        // Invoice date validation
        if (!selectedInvDate) {
            errors.InvDate = 'Invoice date is required';
            showToast('Invoice date is required', "error");
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
        const dueDate = new Date(selectedInvDate);
        dueDate.setDate(dueDate.getDate() + Number(headerData.CrDays));
        setselectedDueDate(dueDate);
        setheaderData({
            ...headerData,
            'InvDate': selectedInvDate
        });
    }, [selectedInvDate]);
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
        const { lastNo, IsEditable } = await getLastNumber('PUR');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            InvNo: lastNo
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
            "Supplier": value.SUP_DESC,
            "Address": value.SUP_ADDRESS,
            "TRN": value.SUP_TRN,
            "SupplierCode": value.SUP_DOCNO,
            "ContactNo": value.SUP_MOB,
            "Email": value.SUP_EMAIL

        });
        // setSelectedValue(value.name);
    };
    const [unitList, setUnitList] = useState([]);
    const getunits = async () => {
        const Data = await getUnitList();
        setUnitList(Data);
        
    }

    const getLocations = async () => {
        const Data = await getLocationList();
        setLocations(Data);
        console.log("locationList", locations);
    };
    useEffect(() => {
        getLocations();
        getunits();
    }, []);

    const CreateInvoice = async () => {
        Confirm(`Do you want to ${isEditMode || id ? 'update' : 'save'}?`).then(async () => {
            try {
                setLoadingFull(false);

                const encodeJsonToBase64 = (json) => {
                    // Step 1: Convert the string to Base64
                    const base64Encoded = btoa(json);
                    return base64Encoded;
                };

                const base64Data = encodeJsonToBase64(JSON.stringify({
                    "key": "PURCH_INV_CRUD",
                    "TYPE": isEditMode || id ? "UPDATE" : "INSERT",
                    "DOC_NO": id || '',
                    "headerData": {
                        ...headerData,
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
                    navigate(`/purchase-entry/${Data.id}`, { replace: true });
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
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            console.error("Error:", error); // More informative error handling
        }
    };
    const loadInvoiceDetails = async (invoiceId) => {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetMultipleResult({
                "key": "PURCH_INV_CRUD",
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
                    SupplierCode: headerData?.SupplierCode,
                    InvDate: new Date(headerData.InvDate)
                });
                setselectedInvDate(new Date(headerData.InvDate));
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
        setPrintDialogOpen(true);
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
            InvNo: '',
            InvDate: selectedInvDate,
            Status: 'PAID',
            SupplierCode: '',
            Supplier: 'Supplier Name',
            Address: '',
            Location: '',
            TRN: '',
            ContactNo: '',
            Email: '',
            SuppInvNo: '',
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
        navigate('/purchase-entry');
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
            } else {
                showToast(Message, "error");
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

    const handleAddDebitNote = () => {
        navigate('/debitnote-entry', {
            state: {
                "invoiceData": headerData,
                "invoiceItems": items,
            }
        });
    }; 

    const handleEditConfirm = () => {
        if (id) {
            loadInvoiceDetails(id);
        }
        setIsEditable(!isEditable);
    }


    return (
        <>
            <Helmet>
                <title> Purchase Invoice-${headerData.InvNo} </title>
            </Helmet>

            <PageHeader
                title={isEditMode ? 'Edit Purchase Invoice' : 'New Purchase Invoice'}
                actions={[
                    {
                        label: 'Print',
                        icon: 'eva:printer-fill',
                        variant: 'outlined',
                        onClick: handlePrint,
                        show: !isEditable && id,
                        showInActions: true,
                    },
                    {
                        label: 'Add Debit Note',
                        icon: 'eva:file-add-fill',
                        variant: 'outlined',
                        onClick: handleAddDebitNote,
                        show: !isEditable && id,
                        showInActions: true,
                    },
                    {
                        label: 'Enable Edit',
                        icon: 'eva:edit-fill',
                        variant: 'contained',
                        color: 'primary',
                        type: 'enableEdit',
                        show: !isEditable,
                        showInActions: false,
                    },
                    {
                        label: 'Cancel Edit',
                        icon: 'eva:close-fill',
                        variant: 'contained',
                        color: 'secondary',
                        onClick: toggleEditMode,
                        show: isEditable,
                        showInActions: false,
                    },
                    {
                        label: 'New Invoice',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: handleNewInvoice,
                        show: true,
                        showInActions: true,
                    },
                ]}
                onEditConfirm={handleEditConfirm}
            />

            <Card>
                <Stack maxwidth={'lg'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                    <Grid container spacing={2} mt={1}  >
                        <Grid item xs={12} md={4}>
                            <Grid container spacing={2} mt={1}>
                                <Grid item xs={8} md={8}>
                                    <Typography variant="subtitle1" ml={2} mb={1} style={{ color: "gray" }} >
                                        Supplier :   {headerData.SupplierCode}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4} md={4} align='right'>
                                    {isEditable && (
                                        <Button size="small" startIcon={<Iconify icon={headerData?.SupplierCode ? "eva:edit-fill" : "eva:person-add-fill"} />} onClick={handleClickOpen}>
                                            {headerData?.SupplierCode ? 'change' : 'Add'}
                                        </Button>
                                    )}
                                    <SupplierDialog
                                        open={open}
                                        onClose={handleClose}
                                        onSelect={handleSelect}
                                    />
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Typography variant="body2" ml={2} style={{ color: "black" }} >
                                        {headerData.Supplier}
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
                                    <FormControl fullWidth error={Boolean(errors.InvDate)}>
                                        <DateSelector
                                            label="Date"
                                            size="small"
                                            disableFuture={disableFutureDate}
                                            value={headerData.InvDate}
                                            onChange={setselectedInvDate}
                                            disable={!isEditable}
                                            error={Boolean(errors.InvDate)}
                                            helperText={errors.InvDate}
                                            required
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={2}  >
                                    <FormControl fullWidth error={Boolean(errors.CrDays)}>
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
                                            error={Boolean(errors.CrDays)}
                                            helperText={errors.CrDays}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={4} >
                                    <FormControl fullWidth>
                                        <DateSelector
                                            size="small"
                                            label="Due Date"
                                            value={selectedDueDate}
                                            disable={!!true}
                                            disableFuture={false}
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
                                            id="supplier-inv-no"
                                            label="Supplier Inv.No"
                                            name="SuppInvNo"
                                            size="small"
                                            value={headerData.SuppInvNo}
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
                <Stack m={2.5} maxwidth={'lg'}  >

                    <Typography variant="h6" mb={2} >
                        Item Details
                    </Typography>
                    {items.map((field, index) => (
                        <TransactionItem
                            key={index}
                            Propkey={index}
                            unitList={unitList}
                            discountPercent={1 - (headerData.Discount / calculateTotal(items))}
                            tax={headerData.Tax}
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
                        addItem={addItem}
                        calculateTotal={calculateTotal(items)}
                        discount={headerData.Discount}
                        tax={headerData.Tax}
                        handleInputChange={(e) => handleInputChange(e)}
                        isEditable={isEditable}
                    />
                    <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                        {isEditable && (
                            <Button variant="contained" color={isEditMode || id ? 'warning' : 'success'} size='large' onClick={handleSave}>
                                {isEditMode || id ? 'Update Invoice' : 'Create Invoice'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Card>

            {/* Replace the old Dialog with PrintDialog */}
            <PrintDialog
                open={printDialogOpen}
                onClose={() => setPrintDialogOpen(false)}
                title="Purchase Invoice Print Preview"
                documentTitle={`Purchase Invoice-${headerData.InvNo}`}
            >
                <PrintComponent
                    headerData={{
                        ...headerData,
                        SalesmanName: salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode)?.SMAN_DESC ?
                            `${salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode).SMAN_DESC} (${headerData.SManCode})` :
                            headerData.SManCode || ''
                    }}
                    items={items}
                    documentType="PURCHASE INVOICE"
                />
            </PrintDialog>

            {IsAlertDialog && (
                <AlertDialog
                    Message="Are you sure you want to proceed?"
                    OnSuccess={setAlertDialog}
                />
            )}
        </>
    );
}
