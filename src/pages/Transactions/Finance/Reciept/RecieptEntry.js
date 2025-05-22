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
import SubTotalSec from '../../../../components/SubTotalSec';
import AlertDialog from '../../../../components/AlertDialog';
import CustomerDialog from '../../../../components/CustomerDialog';
import { GetSingleResult, GetSingleListResult, GetMultipleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import InvoiceItemsDialog from './InvoiceItemsDialog';
import TransactionItem from '../../../../components/TransactionItem';
import PrintComponent from '../../../../components/PrintComponent';
import PendingBillsDialog from './PendingBillsDialog';
import PayerDialog from './PayerDialog';
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

const DepositToOptions = [
    { value: 'BANK', label: 'Bank' },
    { value: 'CASH', label: 'Cash' },
];

export default function RecieptEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    const [selectedRecieptDate, setselectedRecieptDate] = useState(new Date());
    const [selectedCNDate, setselectedCNDate] = useState(new Date());
    const [IsAlertDialog, setAlertDialog] = useState(false);
    const [disableFutureDate] = useState(true);
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [showPrintView, setShowPrintView] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [salesmenList, setSalesmenList] = useState([]);
    const [salesmanLoading, setSalesmanLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const [unitList, setUnitList] = useState([]);
    const { state } = useLocation();
    const { invoiceData } = state || {};

    const [pendingBills, setPendingBills] = useState([]);
    const [selectedBills, setSelectedBills] = useState([]);
    const [showPendingBillsDialog, setShowPendingBillsDialog] = useState(false);

    const [headerData, setheaderData] = useState({
        RpNo: code,
        RpDate: selectedRecieptDate,
        Account1: '',
        Account2: '',
        RefNo: '',
        RefDate: new Date(),
        PaymentMethod: 'CASH',
        Amount: 0,
        Remarks: ''
    });

    const [detailData, setDetailData] = useState([]);
    const [journal, setJournal] = useState([]);
    const [selectedRefDate, setselectedRefDate] = useState(new Date());

    // headerData (
    //     RpNo,
    //     RpDate,		
    //     account1,	
    //     account2,	
    //     RefNo,		
    //     RefDate,	
    //     PaymentMode,	
    //     Amount,		
    //     Remarks		
    //     )
    //     detailData
    //     (
    //     srno,
    //     account,
    //     doc_code,
    //     doc_date,
    //     doc_amount,
    //     doc_bal_amount,
    //     alloc_amount	
    //     ),
    //     journal
    //     (
    //     srno,	
    //     account	,
    //     type	,
    //     amount	
    //     )
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showItemDialog, setShowItemDialog] = useState(false);
    const [invoiceItems, setInvoiceItems] = useState(state?.invoiceItems || []);
    const [accounts, setAccounts] = useState([]);
    const [payerLoading, setPayerLoading] = useState(false);

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

        // Payer validation
        if (validator.isEmpty(headerData.Account1)) {
            errors.Account1 = 'Payer is required';
            showToast('Payer is required', "error");
            hasError = true;
        }
        if (validator.isEmpty(headerData.Account2)) {
            errors.Account2 = 'Deposit To is required';
            showToast('Deposit To is required', "error");
            hasError = true;
        }

        // Receipt date validation
        if (!headerData.RpDate) {
            errors.RpDate = 'Receipt date is required';
            showToast('Receipt date is required', "error");
            hasError = true;
        }

        // Payment Method validation
        if (!headerData.PaymentMethod) {
            errors.PaymentMethod = 'Payment method is required';
            showToast('Payment method is required', "error");
            hasError = true;
        }

        // Amount validation
        if (!headerData.Amount || headerData.Amount <= 0) {
            errors.Amount = 'Valid amount is required';
            showToast('Valid amount is required', "error");
            hasError = true;
        }

        // Items validation
        if (items.length === 0) {
            errors.items = 'At least one bill is required';
            showToast('At least one bill is required', "error");
            hasError = true;
        }

        // Validate allocated amounts match total
        // const totalAllocated = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        // if (Math.abs(totalAllocated - headerData.Amount) > 0.01) {
        //     errors.Amount = 'Total allocated amount must match receipt amount';
        //     showToast('Total allocated amount must match receipt amount', "error");
        //     hasError = true;
        // }

        setErrors(errors);
        return !hasError;
    };



    useEffect(() => {

        setheaderData({
            ...headerData,
            'RpDate': selectedRecieptDate,
            'RefDate': selectedRefDate
        });
    }, [selectedRecieptDate, selectedRefDate]);

    const handleInputChange = event => {
        const { type, name, value } = event.target;
        if (type === 'number' && Object.keys(value).length > 1)
            setheaderData({
                ...headerData,
                [name]: value.replace(/^0+/, '')
            });
        else
            setheaderData({
                ...headerData,
                [name]: value
            });
    };



    const handleSave = () => {
        if (validate()) {
            CreateReceiptVoucher();
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
        const { lastNo, IsEditable } = await getLastNumber('RV');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            RpNo: lastNo
        }));
    };



    const addItem = (event) => {
        if (validate() || items.length === 0) {
            event.preventDefault();
            // console.log(ItemNewLength);
            setDetailData([...detailData, {
               
                srno: 0,
                account: "",
                doc_code: "",
                doc_date: "",
                doc_amount: 0,
                doc_bal_amount: 0,
                alloc_amount: 0

            }]);
        }
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
    // const [selectedValue, setSelectedValue] = useState("Customer Name");
 
    

    const CreateReceiptVoucher = async () => {
        Confirm(`Do you want to ${isEditMode ? 'update' : 'save'}?`).then(async () => {
            try {
                setLoadingFull(true);

                const base64Data = btoa(JSON.stringify({
                    "key": "RV_CRUD",
                    "TYPE": isEditMode ? "UPDATE" : "INSERT",
                    "DOC_NO": id,
                    "headerData": {
                        ...headerData,
                        RpDate: headerData.RpDate,
                        RefDate: headerData.RefDate,
                        Amount: headerData.Amount,
                        Remarks: headerData.Remarks || ''
                    },
                    "detailData": detailData.map((item, index) => ({
                        ...item,
                        srno: index + 1,
                        account: item.account,
                        doc_code: item.doc_code,
                        doc_date: item.doc_date,
                        doc_amount: item.doc_amount,
                        doc_bal_amount: item.doc_bal_amount,
                        alloc_amount: item.alloc_amount
                    })),
                    "journal": journal.map((item, index) => ({
                        ...item,
                        srno: index + 1,
                        account: item.account,
                        type: item.type,
                        amount: item.amount
                    }))
                }));

                const { Success, Message, Data } = await GetSingleResult({
                    "json": base64Data
                });

                if (Success) {
                    setIsEditMode(false);
                    setIsEditable(false);
                    navigate(`/receipt-entry/${Data.id}`, { replace: true });
                    showToast(id ? "Receipt Voucher Updated Successfully" : "Receipt Voucher Saved Successfully", 'success');
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
                "key": "CN_CRUD",
                "TYPE": "GET",
                "DOC_NO": invoiceId
            });

            if (Success) {
                // Data[0] contains header data, Data[1] contains items
                const headerData = Data[0][0]; // First array's first element
                const itemsData = Data[1]; // Second array contains all items

                setheaderData({
                    ...headerData,
                    InvNo: headerData?.InvNo,
                    CnNo: headerData?.CnNo,
                    CnDate: new Date(headerData.CnDate),
                    CustomerCode: headerData?.CustomerCode,
                    InvDate: new Date(headerData.InvDate)
                });
                setselectedCNDate(new Date(headerData.CnDate));
                setItems(itemsData || []);
                // Fetch invoice items
                console.log("headerData.InvNo", headerData);
                if (headerData?.InvNo) {
                    const { Success: invSuccess, Data: invData, Message: invMessage } = await GetMultipleResult({
                        "key": "SALE_INV_CRUD",
                        "TYPE": "GET",
                        "DOC_NO": headerData.InvNo.replace("INV", '')
                    });

                    if (invSuccess) {
                        setInvoiceItems(invData[1] || []); // Assuming items are in the second array
                    } else {
                        showToast(invMessage, "error");
                    }
                }
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
                    <title >Credit Note-${headerData.CnNo}</title>
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
            RpNo: '',
            RpDate: selectedRecieptDate,
            Account1: '',
            Account2: '',
            RefNo: '',
            RefDate: new Date(),
            PaymentMethod: 'CASH',
            Amount: 0,
            Remarks: ''
        });
        setDetailData([]);
        setJournal([]);
        setItems([]);
        setSelectedItems([]);
        setErrors({});
        setIsEditable(true);
    };

   
 

    const handleItemSelect = (item) => {
        if (Array.isArray(item)) {
            // Handle select all
            const newItems = item.map(itemss => ({
                ...itemss,
                type: 'inventory',
                previous_docno: itemss.name,
                previous_docsrno: itemss.srno,
            }));
            setSelectedItems(prev => [...prev, ...newItems]);
            return;
        }

        setSelectedItems(prev => {
            const exists = prev.some(i => i.name === item.name);
            if (exists) {
                return prev.filter(i => i.name !== item.name);
            }

            // Add the new item with required fields
            const newItem = {
                ...item,
                type: 'inventory',
                previous_docno: item.name,
                previous_docsrno: item.srno,
            };
            return [...prev, newItem];
        });
    };

    const handleConfirmItems = () => {
        const itemsWithType = selectedItems.map(item => ({
            ...item,
            type: 'inventory',
            previous_docno: item.name,
            previous_docsrno: item.srno,
            unit: item.unit || '',
            price: item.price || 0,
            qty: item.qty || 1
        }));

        // Update items state
        setItems(prev => {
            // Get existing item names to avoid duplicates
            const existingNames = new Set(prev.map(item => item.name));

            // Filter out items that already exist
            const newItems = itemsWithType.filter(item => !existingNames.has(item.name));

            // Add new items to existing items
            return [...prev, ...newItems];
        });

        setShowItemDialog(false);
    };

    const fetchPendingBills = async (payerCode) => {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "PENDING_BILLS",
                "TYPE": "GET_ALL",
                "PAYER_CODE": payerCode
            });
            if (Success) {
                setPendingBills(Data.map(bill => ({
                    ...bill,
                    allocatedAmount: bill.balanceAmount
                })));
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            showToast("Error fetching pending bills", "error");
        } finally {
            setLoadingFull(false);
        }
    };

    const handleShowPendingBills = () => {
        if (!headerData.PayerCode) {
            showToast("Please select a payer first", "error");
            return;
        }
        fetchPendingBills(headerData.PayerCode);
        setShowPendingBillsDialog(true);
    };

    const handleAllocatedAmountChange = (billNo, amount) => {
        setSelectedBills(prev => prev.map(bill =>
            bill.billNo === billNo
                ? { ...bill, allocatedAmount: amount }
                : bill
        ));
    };

    const handleConfirmBillSelection = () => {
        // Convert selected bills to items
        const newItems = selectedBills.map((bill, index) => ({
            name: bill.billNo,
            desc: `Bill Date: ${new Date(bill.date).toLocaleDateString()}`,
            qty: 1,
            price: bill.allocatedAmount,
            type: "bill",
            previous_docno: bill.billNo,
            previous_docsrno: index + 1
        }));

        setItems(newItems);
        setShowPendingBillsDialog(false);

        // Update total amount
        const totalAllocated = selectedBills.reduce((sum, bill) => sum + bill.allocatedAmount, 0);
        setheaderData(prev => ({
            ...prev,
            Amount: totalAllocated
        }));
    };

    const fetchPayers = async () => {
        try {
            setPayerLoading(true);
            const { Success, Data } = await GetSingleListResult({
                "key": "PAYER_CRUD",
                "TYPE": "GET_ALL"
            });
            if (Success) {
                setPayersList(Data);
            }
        } catch (error) {
            showToast("Error fetching payers", "error");
            console.error('Error fetching payers:', error);
        } finally {
            setPayerLoading(false);
        }
    };

    useEffect(() => {
        fetchPayers();
    }, []);

    return (
        <>
            <Helmet>
                <title> Sales Reciept | Exapp </title>
            </Helmet>

            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4" gutterBottom>
                    {isEditMode ? 'Edit Sales Reciept' : 'New Sales Reciept'}
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
                    {(!isEditable) && (
                        <Button variant="contained" color="primary" startIcon={<Iconify icon="eva:edit-fill" />} onClick={toggleEditMode}>
                            Enable Edit
                        </Button>
                    )}
                    {isEditable && (
                        <Button variant="contained" color="secondary" startIcon={<Iconify icon="eva:close-fill" />} onClick={toggleEditMode}>
                            Cancel Edit
                        </Button>
                    )}
                    {/* <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />} onClick={handleNewInvoice}>
                        New Invoice
                    </Button> */}
                </Stack>
            </Stack>

            <Card>
                <Stack maxwidth={'lg'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                    <Grid container spacing={2} mt={1}  >
                        <Grid item xs={12} md={4}>

                            <FormControl fullWidth error={Boolean(errors.Account1)}>
                                <Autocomplete
                                    size="small"
                                    disabled={!isEditable}
                                    options={accounts || []}
                                    getOptionLabel={(option) =>
                                        option ? `${option.AC_DESC} (${option.AC_CODE})` : ''
                                    }
                                    value={accounts?.find(p => p.AC_CODE === headerData.Account1) || null}
                                    loading={payerLoading}
                                    onChange={(_, newValue) => {
                                        setheaderData(prev => ({
                                            ...prev,
                                            Account1: newValue?.AC_CODE || ''
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Payer"
                                            required
                                            error={Boolean(errors.Account1)}
                                            helperText={errors.Account1}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>

                            <FormControl fullWidth error={Boolean(errors.Account2)}>
                                <Autocomplete
                                    size="small"
                                    disabled={!isEditable}
                                    options={accounts || []}
                                    getOptionLabel={(option) =>
                                        option ? `${option.AC_DESC} (${option.AC_CODE})` : ''
                                    }
                                    value={accounts?.find(p => p.AC_CODE === headerData.Account2) || null}
                                    loading={payerLoading}
                                    onChange={(_, newValue) => {
                                        setheaderData(prev => ({
                                            ...prev,
                                            Account2: newValue?.AC_CODE || ''
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Deposit To"
                                            required
                                            error={Boolean(errors.Account2)}
                                            helperText={errors.Account2}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>


                        <Grid item xs={12} md={8}>
                            <Grid container spacing={1}>
                                <Grid item xs={6} md={2}  >
                                    <FormControl fullWidth>
                                        <TextField
                                            id="reciept-no"
                                            label="Reciept#"
                                            name="RpNo"
                                            value={headerData.RpNo}
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
                                    <FormControl fullWidth error={Boolean(errors.RpDate)}>
                                        <DateSelector
                                            label="Reciept Date"
                                            size="small"
                                            disableFuture={disableFutureDate}
                                            value={headerData.RpDate}
                                            onChange={setselectedRecieptDate}
                                            disable={!isEditable}
                                            error={Boolean(errors.RpDate)}
                                            helperText={errors.RpDate}
                                            required
                                        />
                                    </FormControl>
                                </Grid>


                            </Grid>
                            <Grid container spacing={1} mt={1}>

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
                                <Grid item xs={6} md={4} >
                                    <FormControl fullWidth error={Boolean(errors.RefDate)}>
                                        <DateSelector
                                            label="Ref.Date"
                                            size="small"
                                            disableFuture={disableFutureDate}
                                            value={headerData.RefDate}
                                            onChange={setselectedRefDate}
                                            disable={!isEditable}
                                            error={Boolean(errors.RefDate)}
                                            helperText={errors.RefDate}
                                            required
                                        />
                                    </FormControl>
                                </Grid>


                                <Grid item xs={6} md={4} mt={1}>
                                    <FormControl fullWidth error={Boolean(errors.PaymentMode)}>
                                        <Autocomplete
                                            size="small"
                                            disabled={!isEditable}
                                            options={PaymentModeOptions}
                                            getOptionLabel={(option) => option.label || ''}
                                            value={PaymentModeOptions.find(opt => opt.value === headerData.PaymentMode) || null}
                                            onChange={(_, newValue) => {
                                                setheaderData(prev => ({
                                                    ...prev,
                                                    PaymentMode: newValue ? newValue.value : ''
                                                }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Payment Mode"
                                                    required
                                                    error={Boolean(errors.PaymentMode)}
                                                    helperText={errors.PaymentMode}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={4} mt={1}>
                                    <FormControl fullWidth error={Boolean(errors.Amount)}>
                                        <TextField
                                            id="amount"
                                            label="Amount"
                                            name="Amount"
                                            size="small"
                                            value={headerData.Amount}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            error={Boolean(errors.Amount)}
                                            helperText={errors.Amount}
                                        />
                                    </FormControl>
                                </Grid>


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
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
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
                        <TransactionItem
                            key={index}
                            Propkey={index}
                            accounts={accounts}
                            tax={headerData.Tax}
                            discountPercent={1 - (headerData.Discount / calculateTotal(items))}
                            products={products}
                            code={items[index].name}
                            desc={items[index].desc}
                            qty={items[index].qty}
                            price={items[index].price}
                            unit={items[index].unit}
                            items={items}
                            setItems={setItems}
                            unitList={unitList}
                            removeItem={() => removeItem(index)}
                            errors={errors.item}
                            isEditable={isEditable}
                            type={'credit'}
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
                                {isEditMode ? 'Update Credit Note' : 'Create Credit Note'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Card >

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
                        <PrintComponent
                            headerData={{
                                ...headerData,
                                SalesmanName: salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode)?.SMAN_DESC ?
                                    `${salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode).SMAN_DESC} (${headerData.SManCode})` :
                                    headerData.SManCode || ''
                            }}
                            items={items}
                            documentType="TAX CREDIT NOTE"
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

            {
                IsAlertDialog && (
                    <AlertDialog
                        Message="Are you sure you want to proceed?"
                        OnSuccess={setAlertDialog}
                    />
                )
            }

            <PendingBillsDialog
                open={showPendingBillsDialog}
                onClose={() => setShowPendingBillsDialog(false)}
                bills={pendingBills}
                selectedBills={selectedBills}
                onBillSelect={setSelectedBills}
                onConfirm={handleConfirmBillSelection}
                onAllocatedAmountChange={handleAllocatedAmountChange}
            />
        </>
    );
}
