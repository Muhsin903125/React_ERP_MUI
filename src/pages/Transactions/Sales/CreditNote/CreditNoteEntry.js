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
import { useNavigate, useParams } from 'react-router-dom';
import { getLastNumber } from '../../../../utils/CommonServices';
import Confirm from '../../../../components/Confirm';
import Iconify from '../../../../components/iconify';
import DateSelector from '../../../../components/DateSelector';
import Dropdownlist from '../../../../components/DropdownList'; 
import AlertDialog from '../../../../components/AlertDialog';
import CustomerDialog from '../../../../components/CustomerDialog';
import { GetSingleResult, GetSingleListResult, GetMultipleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import CreditNotePrint from './CreditNotePrint';
import CreditNoteItem from './CreditNoteItem';
import SubTotalSec from './SubTotalSec';

const CreditNoteStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'posted', label: 'Posted' },
    { value: 'cancelled', label: 'Cancelled' },
];

const ReturnReasonOptions = [
    { value: 'DAMAGED', label: 'Damaged Goods' },
    { value: 'WRONG_ITEM', label: 'Wrong Item Delivered' },
    { value: 'QUALITY', label: 'Quality Issues' },
    { value: 'OTHER', label: 'Other Reasons' },
];

export default function CreditNoteEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    const [selectedCNDate, setSelectedCNDate] = useState(new Date());
    const [IsAlertDialog, setAlertDialog] = useState(false);
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [salesInvoices, setSalesInvoices] = useState([]);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

    const [headerData, setheaderData] = useState({
        CNNo: code,
        CNDate: new Date(),
        Status: 'draft',
        CustomerCode: '',
        Customer: 'Customer Name',
        Address: '',
        TRN: '',
        ContactNo: '',
        Email: '',
        InvoiceNo: '',
        ReturnReason: '',
        Remarks: '',
        Discount: 0,
        Tax: 5,
        GrossAmount: 0,
        TaxAmount: 0,
        NetAmount: 0
    });

    const validate = () => {
        const errors = {};
        let hasError = false;

        // Customer validation
        if (validator.isEmpty(headerData.CustomerCode)) {
            errors.CustomerCode = 'Customer is required';
            showToast('Customer is required', "error");
            hasError = true;
        }

        // Invoice validation
        if (!headerData.InvoiceNo) {
            errors.InvoiceNo = 'Original invoice is required';
            showToast('Original invoice is required', "error");
            hasError = true;
        }

        // Credit Note Date validation
        if (!selectedCNDate) {
            errors.CNDate = 'Credit Note date is required';
            showToast('Credit Note date is required', "error");
            hasError = true;
        }

        // Return Reason validation
        if (!headerData.ReturnReason) {
            errors.ReturnReason = 'Return reason is required';
            showToast('Return reason is required', "error");
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

        setErrors(errors);
        return !hasError;
    };

    const [items, setItems] = useState([{
        name: "",
        price: 0,
        desc: "",
        qty: 0,
        unit: "Unit"
    }]);

    useEffect(() => {
        if (id) {
            loadCreditNoteDetails(id);
            setIsEditMode(true);
            setIsEditable(false);
        } else {
            getCode();
            setIsEditMode(false);
            setIsEditable(true);
        }
    }, [id]);

    const getCode = async () => {
        const { lastNo } = await getLastNumber('CN');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            CNNo: lastNo
        }));
    };

    const fetchSalesInvoices = async (customerCode) => {
        try {
            setInvoiceLoading(true);
            const { Success, Data } = await GetSingleListResult({
                "key": "INVOICE_CRUD",
                "TYPE": "GET_CUSTOMER_INVOICES",
                "CustomerCode": customerCode
            });
            if (Success) {
                setSalesInvoices(Data);
            }
        } catch (error) {
            showToast("Error fetching invoices", "error");
        } finally {
            setInvoiceLoading(false);
        }
    };

    const loadCreditNoteDetails = async (creditNoteId) => {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetMultipleResult({
                "key": "CN_CRUD",
                "TYPE": "GET",
                "DOC_NO": creditNoteId
            });

            if (Success) {
                const headerData = Data[0][0];
                const itemsData = Data[1];

                setheaderData({
                    ...headerData,
                    CNNo: headerData?.CNNo,
                    Status: headerData?.Status,
                    CustomerCode: headerData?.CustomerCode,
                    CNDate: new Date(headerData.CNDate)
                });
                setSelectedCNDate(new Date(headerData.CNDate));
                setItems(itemsData || []);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            showToast("Error loading credit note details", "error");
        } finally {
            setLoadingFull(false);
        }
    };

    const handleInputChange = event => {
        const { name, value } = event.target;
        setheaderData({
            ...headerData,
            [name]: value
        });
    };

    const handleSave = () => {
        if (validate()) {
            CreateCreditNote();
        }
    };

    const CreateCreditNote = async () => {
        Confirm('Do you want to save?').then(async () => {
            try {
                setLoadingFull(true);
                const { Success, Message, Data } = await GetSingleResult({
                    "key": "CN_CRUD",
                    "TYPE": isEditMode ? "UPDATE" : "INSERT",
                    "DOC_NO": id,
                    "headerData": {
                        ...headerData,
                        "GrossAmount": calculateTotal(items),
                        "TaxAmount": (calculateTotal(items) - headerData.Discount) * headerData.Tax / 100.00,
                        "NetAmount": (calculateTotal(items) - headerData.Discount) * (1 + headerData.Tax / 100.00)
                    },
                    "detailData": items.map((item, index) => ({
                        ...item,
                        srno: index + 1
                    }))
                });

                if (Success) {
                    showToast(Data.Message, 'success');
                    navigate(`/credit-note-entry/${Data.id}`, { replace: true });
                    setIsEditMode(true);
                    setIsEditable(false);
                } else {
                    showToast(Message, "error");
                }
            } finally {
                setLoadingFull(false);
            }
        });
    };

    const handleDelete = async () => {
        Confirm('Are you sure you want to delete this credit note?').then(async () => {
            try {
                setLoadingFull(true);
                const { Success, Message } = await GetSingleResult({
                    "key": "CN_CRUD",
                    "TYPE": "DELETE",
                    "DOC_NO": id
                });

                if (Success) {
                    showToast('Credit Note deleted successfully', 'success');
                    navigate('/credit-note-list', { replace: true });
                } else {
                    showToast(Message, "error");
                }
            } finally {
                setLoadingFull(false);
            }
        });
    };

    const addItem = (event) => {
        event.preventDefault();
        setItems([...items, {
            name: "",
            price: 0,
            desc: "",
            qty: 0,
            unit: "Unit"
        }]);
    };

    const removeItem = (index) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    function calculateTotal(items) {
        return items.reduce((total, item) => total + item.price * item.qty, 0);
    }

    // For Customer Dialog
    const [open, setOpen] = useState(false);

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
        // Fetch customer's invoices when customer is selected
        fetchSalesInvoices(value.CUS_DOCNO);
    };

    const handlePrint = () => {
        // Instead of opening a dialog, directly trigger print
        window.print();
    };

    const handleNewCreditNote = () => {
        setheaderData({
            CNNo: '',
            CNDate: new Date(),
            Status: 'draft',
            CustomerCode: '',
            Customer: 'Customer Name',
            Address: '',
            TRN: '',
            ContactNo: '',
            Email: '',
            InvoiceNo: '',
            ReturnReason: '',
            Remarks: '',
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
        getCode();
        navigate('/credit-note-entry');
    };

    const toggleEditMode = () => {
        setIsEditable(!isEditable);
    };

    return (
        <>
            <Helmet>
                <title> Credit Note Entry </title>
            </Helmet>

            {/* Visible UI */}
            <div className="screen-only">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        {isEditMode ? 'Edit Credit Note' : 'New Credit Note'}
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        {!isEditable && (
                            <Button
                                variant="outlined"
                                startIcon={<Iconify icon="eva:printer-fill" />}
                                onClick={handlePrint}
                            >
                                Print
                            </Button>
                        )}
                        {isEditMode && !isEditable && (
                            <>
                                <Button 
                                    variant="contained" 
                                    color="error" 
                                    startIcon={<Iconify icon="eva:trash-2-fill" />} 
                                    onClick={handleDelete}
                                >
                                    Delete
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="primary" 
                                    startIcon={<Iconify icon="eva:edit-fill" />} 
                                    onClick={toggleEditMode}
                                >
                                    Enable Edit
                                </Button>
                            </>
                        )}
                        {isEditable && (
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                startIcon={<Iconify icon="eva:close-fill" />} 
                                onClick={toggleEditMode}
                            >
                                Cancel Edit
                            </Button>
                        )}
                        <Button 
                            variant="contained" 
                            startIcon={<Iconify icon="eva:plus-fill" />} 
                            onClick={handleNewCreditNote}
                        >
                            New Credit Note
                        </Button>
                    </Stack>
                </Stack>

                <Card>
                    <Stack maxwidth={'lg'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                        <Grid container spacing={2} mt={1}>
                            <Grid item xs={12} md={5}>
                                <Grid container spacing={2} mt={1}>
                                    <Grid item xs={8} md={8}>
                                        <Typography variant="subtitle1" ml={2} mb={1} style={{ color: "gray" }} >
                                            Customer: {headerData.CustomerCode}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4} md={4} align='right'>
                                        {isEditable && (
                                            <Button 
                                                size="small" 
                                                startIcon={<Iconify icon={headerData?.CustomerCode ? "eva:edit-fill" : "eva:person-add-fill"} />} 
                                                onClick={handleClickOpen}
                                            >
                                                {headerData?.CustomerCode ? 'Change' : 'Add'}
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

                            <Grid item xs={12} md={7}>
                                <Grid container spacing={1}>
                                    <Grid item xs={6} md={3}>
                                        <FormControl fullWidth>
                                            <TextField
                                                label="Credit Note#"
                                                name="CNNo"
                                                value={headerData.CNNo}
                                                onChange={handleInputChange}
                                                size="small"
                                                inputProps={{
                                                    readOnly: true
                                                }}
                                                disabled={!isEditable}
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <FormControl fullWidth error={Boolean(errors.CNDate)}>
                                            <DateSelector
                                                label="Date"
                                                size="small"
                                                value={selectedCNDate}
                                                onChange={setSelectedCNDate}
                                                disable={!isEditable}
                                                error={Boolean(errors.CNDate)}
                                                helperText={errors.CNDate}
                                                required
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6} md={6}>
                                        <FormControl fullWidth error={Boolean(errors.InvoiceNo)}>
                                            <Autocomplete
                                                disabled={!isEditable}
                                                options={salesInvoices}
                                                value={salesInvoices.find(inv => inv.INV_NO === headerData.InvoiceNo) || null}
                                                getOptionLabel={(option) => 
                                                    option ? `${option.INV_NO} (${new Date(option.INV_DATE).toLocaleDateString()})` : ''
                                                }
                                                loading={invoiceLoading}
                                                renderInput={(params) => (
                                                    <TextField 
                                                        {...params} 
                                                        label="Original Invoice" 
                                                        size="small"
                                                        error={Boolean(errors.InvoiceNo)}
                                                        helperText={errors.InvoiceNo}
                                                        required 
                                                    />
                                                )}
                                                onChange={(event, value) => {
                                                    setheaderData({
                                                        ...headerData,
                                                        InvoiceNo: value?.INV_NO || ''
                                                    });
                                                }}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} mt={1}>
                                    <Grid item xs={6} md={6}>
                                        <FormControl fullWidth error={Boolean(errors.ReturnReason)}>
                                            <Dropdownlist 
                                                options={ReturnReasonOptions}
                                                name="ReturnReason"
                                                value={headerData.ReturnReason}
                                                label="Return Reason"
                                                onChange={handleInputChange}
                                                disable={!isEditable}
                                                error={Boolean(errors.ReturnReason)}
                                                helperText={errors.ReturnReason}
                                                required
                                            />
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={6} md={6}>
                                        <FormControl fullWidth>
                                            <Dropdownlist 
                                                options={CreditNoteStatusOptions}
                                                name="Status"
                                                value={headerData.Status}
                                                label="Status"
                                                onChange={handleInputChange}
                                                disable={!isEditable}
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Grid container spacing={1} mt={1}>
                                    <Grid item xs={6} md={6}>
                                        <FormControl fullWidth>
                                            <TextField
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
                                    <Grid item xs={6} md={6}>
                                        <FormControl fullWidth>
                                            <TextField
                                                label="Email"
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
                                </Grid>

                                <Grid container spacing={1} mt={1}>
                                    <Grid item xs={12} md={12}>
                                        <FormControl fullWidth>
                                            <TextField
                                                label="Remarks"
                                                name="Remarks"
                                                size="small"
                                                multiline
                                                rows={2}
                                                value={headerData.Remarks}
                                                onChange={handleInputChange}
                                                disabled={!isEditable}
                                                placeholder="Enter any additional notes or remarks"
                                            />
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Stack>

                    <Stack m={2.5} maxwidth={'lg'}>
                        <Typography variant="h6" mb={2}>
                            Item Details
                        </Typography>
                        {items.map((field, index) => (
                            <CreditNoteItem
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
                                errors={errors.items}
                                isEditable={isEditable}
                            />
                        ))}

                        <SubTotalSec
                            addItem={addItem}
                            calculateTotal={calculateTotal(items)}
                            discount={headerData.Discount}
                            tax={headerData.Tax}
                            handleInputChange={handleInputChange}
                            isEditable={isEditable}
                        />

                        <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                            {isEditable && (
                                <Button 
                                    variant="contained" 
                                    color={isEditMode ? 'warning' : 'success'} 
                                    size='large' 
                                    onClick={handleSave}
                                >
                                    {isEditMode ? 'Update Credit Note' : 'Create Credit Note'}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Card>
            </div>

            {/* Hidden printable section */}
            <div className="print-only">
                <CreditNotePrint 
                    headerData={headerData} 
                    items={items} 
                />
            </div>

            {/* Add print-specific styles */}
            <style>
                {`
                    @media screen {
                        .print-only {
                            display: none !important;
                        }
                    }
                    @media print {
                        .screen-only {
                            display: none !important;
                        }
                        .print-only {
                            display: block !important;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        .MuiDialog-root {
                            display: none !important;
                        }
                    }
                `}
            </style>

            {/* Dialog should be kept for compatibility but we'll hide it */}
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
                            headerData={headerData} 
                            items={items} 
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPrintDialogOpen(false)}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Iconify icon="eva:printer-fill" />}
                        onClick={() => {
                            window.print();
                        }}
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