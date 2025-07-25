import { Helmet } from 'react-helmet-async';
import { useContext, useState, useEffect, useRef } from 'react';
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
    Tab,
    Tabs,
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
import TransactionItem from '../../../../components/TransactionItem';
import PrintComponent from '../../../../components/PrintComponent';
import PendingBillsDialog from './PendingBillsDialog';
import PendingBillsTable from './PendingBillsTable';
import JournalTable from './JournalTable';
import ReceiptPrint from './ReceiptPrint';
import PrintDialog from '../../../../components/PrintDialog';
import PageHeader from '../../../../components/PageHeader';
import EnableEditConfirmation from '../../../../components/EnableEditConfirmation';   

const PaymentModeOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'TT', label: 'TT' },
    { value: 'OTHER', label: 'Others' },
];

export default function ReceiptEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    const [selectedReceiptDate, setSelectedReceiptDate] = useState(new Date());
    const [IsAlertDialog, setAlertDialog] = useState(false);
    const [disableFutureDate] = useState(true);
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [showPrintView, setShowPrintView] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const { state } = useLocation();
    const { invoiceData } = state || {};

    const [pendingBills, setPendingBills] = useState([]);
    const [selectedBills, setSelectedBills] = useState([]);
    const [showPendingBillsDialog, setShowPendingBillsDialog] = useState(false);

    const [headerData, setheaderData] = useState({
        RpNo: code,
        RpDate: selectedReceiptDate,
        Account1: '',
        Account2: '',
        RefNo: '',
        RefDate: new Date(),
        PaymentMode: 'CASH',
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
    const [totalAllocatedAmount, setTotalAllocatedAmount] = useState(0);
    const [payerLoading, setPayerLoading] = useState(false);

    const [currentTab, setCurrentTab] = useState('allocation');

    const printRef = useRef(null);

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingPayerChange, setPendingPayerChange] = useState(null);

    const getAccounts = async () => {
        const { Success, Data, Message } = await GetSingleListResult({
            "key": "COA_CRUD",
            "TYPE": "GET_ALL_ACCOUNT",
        });
        if (Success) {
            setAccounts(Data);
        } else {
            showToast(Message, "error");
        }
    }


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
        if (!headerData.PaymentMode) {
            errors.PaymentMode = 'Payment mode is required';
            showToast('Payment mode is required', "error");
            hasError = true;
        }

        // Amount validation
        if (!headerData.Amount || Number(headerData.Amount) <= 0) {
            errors.Amount = 'Valid amount is required';
            showToast('Valid amount is required', "error");
            hasError = true;
        }

        if (Number(headerData.Amount) < totalAllocatedAmount) {
            errors.Amount = 'Allocated amount cannot be greater than the total amount';
            showToast('Allocated amount cannot be greater than the total amount', "error");
            hasError = true;
        }


        // Validate journal entries sum to zero
        const journalSum = journal.reduce((sum, entry) => {
            const amount = Number(entry.amount) || 0;
            return sum + (entry.type === "Credit" ? -amount : amount);
        }, 0);

        if (Math.abs(journalSum) > 0.01) {
            errors.journal = 'Voucher not tally';
            const sign = journalSum > 0 ? 'Debit' : 'Credit';
            showToast(`Voucher not tally. Difference: ${Math.abs(journalSum).toFixed(2)} ${sign}`, "error");
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
            'RpDate': selectedReceiptDate,
            'RefDate': selectedRefDate
        });
    }, [selectedReceiptDate, selectedRefDate]);

    // Calculate total allocated amount from detailData
    useEffect(() => {
        const totalAllocated = detailData.reduce((sum, bill) => sum + (Number(bill.alloc_amount) - Number(bill.discount || 0)), 0);
        setTotalAllocatedAmount(totalAllocated);
    }, [detailData]);

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
        getAccounts();
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


    const removeItem = (index) => {
        if(items.length <= 1) {
            showToast("At least one item is required", "error");
            return;
        }
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
        Confirm(`Do you want to ${isEditMode || id ? 'update' : 'save'}?`).then(async () => {
            try {
                setLoadingFull(true);

                const base64Data = btoa(JSON.stringify({
                    "key": "RV_CRUD",
                    "TYPE": isEditMode || id ? "UPDATE" : "INSERT",
                    "DOC_NO": id || '',
                    "headerData": {
                        ...headerData,

                        account2: headerData.Account2,
                        account1: headerData.Account1,
                        RpNo: headerData.RpNo,
                        RpDate: headerData.RpDate,
                        RefNo: headerData.RefNo,
                        RefDate: headerData.RefDate,
                        PaymentMode: headerData.PaymentMode,
                        Amount: headerData.Amount,
                        Remarks: headerData.Remarks
                    },
                    "detailData": detailData.map((item, index) => ({
                        ...item,
                        srno: index + 1,
                        account: item.account,
                        doc_code: item.doc_code,
                        doc_date: item.doc_date,
                        doc_amount: item.doc_amount,
                        doc_bal_amount: item.doc_bal_amount,
                        alloc_amount: item.alloc_amount,
                        amount_type: item.amount_type,
                        actrn_srno: item.actrn_srno,
                        discount: item.discount
                    })),
                    "journal": journal.map((item, index) => ({
                        ...item,
                        srno: index + 1,
                        account: item.account,
                        type: item.type === 'Debit' ? '1' : '-1',
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
                    showToast(id ? "Receipt Voucher Updated ! " : "Receipt Voucher Saved ! ", 'success');
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
                "key": "RV_CRUD",
                "TYPE": "GET",
                "DOC_NO": invoiceId
            });

            if (Success) {
                // Data[0] contains header data, Data[1] contains items
                const headData = Data[0][0]; // First array's first element
                const itemsData = Data[1]; // Second array contains all items
                const journalData = Data[2]; // Third array contains all journal

                setheaderData({
                    ...headData,
                    RpNo: headData?.RpNo,
                    RpDate: new Date(headData?.RpDate),
                    Account1: headData?.account1,
                    Account2: headData?.account2,
                    RefNo: headData?.RefNo,
                    RefDate: new Date(headData?.RefDate),
                    PaymentMode: headData?.PaymentMode,
                    Amount: headData?.Amount,
                    Remarks: headData?.Remarks
                });
                setSelectedReceiptDate(new Date(headData?.RpDate));
                setselectedRefDate(new Date(headData?.RefDate));
                setDetailData(itemsData || []);
                if (headData?.account1) {
                    fetchPendingBills(headData?.account1);
                    setSelectedBills(itemsData?.map(item => ({
                        ...item,
                        allocatedAmount: item.alloc_amount,
                        discount: item.discount,
                        amount_type: item.amount_type,
                        actrn_srno: item.actrn_srno
                    })));
                    setJournal(journalData?.map(item => ({
                        ...item,
                        type: item.type === 1 ? 'Debit' : 'Credit'
                    })));

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
            RpNo: '',
            RpDate: selectedReceiptDate,
            Account1: '',
            Account2: '',
            RefNo: '',
            RefDate: new Date(),
            PaymentMode: 'CASH',
            Amount: 0,
            Remarks: ''
        });
        setDetailData([]);
        setJournal([]);
        setItems([]);
        setSelectedReceiptDate(new Date());

        setselectedRefDate(new Date());
        setPendingBills([]);
        setSelectedBills([]);
        setShowPendingBillsDialog(false);
        setShowItemDialog(false);
        
        setSelectedItems([]);
        setErrors({});
        setIsEditable(true);
        setIsEditMode(false);
        getCode(); // Get new invoice number
        navigate('/receipt-entry');
    };





    const fetchPendingBills = async (payer) => {
        if (!payer) {
            showToast("Please select a payer first", "error");
            return;
        }
        console.log("payer", payer);
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "RV_CRUD",
                "TYPE": "GET_OUTSTANDING",
                "ac_code": payer,
                "DOC_NO": id || ''
            });
            if (Success) {
                console.log("Data", Data);
                setPendingBills(Data.map(bill => ({
                    ...bill,
                    allocatedAmount: bill.doc_bal_amount
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



    const handleAllocatedAmountChange = (srno, amount) => {
        setSelectedBills(prev => prev.map(bill =>
            bill.srno === srno
                ? { ...bill, allocatedAmount: amount }
                : bill
        ));
    };

    const handleDiscountChange = (srno, discount) => {
        setSelectedBills(prev => prev.map(bill =>
            bill.srno === srno
                ? { ...bill, discount }
                : bill
        ));
    };
    const handleConfirmBillSelection = () => {
        // Format the selected bills into detailData format
        const formattedBills = selectedBills.map((bill, index) => ({
            srno: index + 1,
            account: headerData.Account1,
            doc_code: bill.doc_code,
            doc_date: bill.doc_date,
            doc_amount: bill.doc_amount,
            doc_bal_amount: bill.doc_bal_amount,
            alloc_amount: Number(bill.allocatedAmount) || 0,
            discount: Number(bill.discount) || 0,
            amount_type: bill.amount_type,
            actrn_srno: bill.actrn_srno
        }));

        // Create journal entries
        const totalAlloc = formattedBills.reduce((sum, bill) => sum + (bill.alloc_amount - bill.discount), 0);
        const totalDiscount = formattedBills.reduce((sum, bill) => sum + bill.discount, 0);
        const journalEntries = [
            {
                srno: 1,
                account: headerData.Account1,
                type: "Credit",
                amount: totalAlloc + totalDiscount,
                isManual: 0
            },
            {
                srno: 2,
                account: headerData.Account2,
                type: "Debit",
                amount: totalAlloc,
                isManual: 0
            },
            ...(totalDiscount > 0 ? [{
                srno: 3,
                account: "10001",
                type: "Debit",
                amount: totalDiscount,
                isManual: 0
            }] : []),
            ...journal.filter(entry => entry.isManual === 1).map((entry, index) => ({
                ...entry,
                srno: index + 4
            }))
        ];

        setDetailData(formattedBills);
        setJournal(journalEntries);
        setShowPendingBillsDialog(false);

        // Update total amount
        setTotalAllocatedAmount(totalAlloc);
        setheaderData(prev => ({
            ...prev,
            Amount: totalAlloc
        }));
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handlePayerChange = (newValue) => {
        if (detailData.length > 0) {
            setPendingPayerChange(newValue);
            setShowConfirmDialog(true);
        } else {
            setheaderData(prev => ({
                ...prev,
                Account1: newValue?.AC_CODE || ''
            }));
            fetchPendingBills(newValue?.AC_CODE || '');
        }
    };

    const handleConfirmPayerChange = () => {
        if (pendingPayerChange) {
            setheaderData(prev => ({
                ...prev,
                Account1: pendingPayerChange?.AC_CODE || '',
                Amount: 0,
            }));
            setDetailData([]);

            setJournal([]);
            setSelectedBills([]);
            fetchPendingBills(pendingPayerChange?.AC_CODE || '');
        }
        setShowConfirmDialog(false);
        setPendingPayerChange(null);
    };



    const handleEditConfirm = async (messages = []) => {
        if (id) {
            loadInvoiceDetails(id);
        }
        if (messages && messages.length > 0) {
            const { Success, Message } = await GetSingleResult({
                "key": "RV_CRUD",
                "TYPE": "EDIT_CONFIRM",
                "DOC_NO": id,
                "message_types": messages
            });
            if (!Success) {
                setIsEditable(false);
                showToast(Message, "error");
            }
        } else {
            setIsEditable(!isEditable);
        }
    };

    return (
        <>
            <Helmet>
                <title>Sales Receipt | Exapp</title>
            </Helmet>

            <PageHeader
                title={isEditMode ? 'Edit Receipt' : 'New Receipt'}
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
                        label: 'New Receipt',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: handleNewInvoice,
                        show: true,
                        showInActions: true,
                    },
                ]}
                onEditConfirm={handleEditConfirm}
                editCheckApiKey="RV_CRUD"
                editCheckApiType="EDIT_VALIDATE"
                editCheckDocNo={id}
            />

            <Card>
                <Stack maxwidth={'md'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                    <Grid container spacing={3} mt={1} maxwidth={'md'}  >
                        <Grid item xs={6} md={6}  >
                            <FormControl fullWidth>
                                <TextField
                                    id="receipt-no"
                                    label="Receipt#"
                                    size="small"
                                    name="RpNo"
                                    value={headerData?.RpNo}
                                    onChange={handleInputChange}
                                    inputProps={{
                                        readOnly: true
                                    }}
                                    disabled={!isEditable}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={6} >
                            <FormControl fullWidth error={Boolean(errors.RpDate)}>
                                <DateSelector
                                    label="Receipt Date"
                                    disableFuture={disableFutureDate}
                                    value={headerData?.RpDate}
                                    size="small"
                                    onChange={setSelectedReceiptDate}
                                    disable={!isEditable}
                                    error={Boolean(errors.RpDate)}
                                    helperText={errors.RpDate}
                                    required
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>

                            <FormControl fullWidth error={Boolean(errors.Account1)}>
                                <Autocomplete
                                    size="small"
                                    disabled={!isEditable}
                                    options={accounts || []}
                                    getOptionLabel={(option) =>
                                        option ? `${option.AC_DESC} ` : ''
                                    }
                                    value={accounts?.find(p => p.AC_CODE === headerData.Account1) || null}
                                    loading={payerLoading}
                                    onChange={(_, newValue) => handlePayerChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Payer"
                                            size="small"
                                            required
                                            error={Boolean(errors.Account1)}
                                            helperText={errors.Account1}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>

                            <FormControl fullWidth error={Boolean(errors.Account2)}>
                                <Autocomplete
                                    size="small"
                                    disabled={!isEditable}
                                    options={accounts || []}
                                    getOptionLabel={(option) =>
                                        option ? `${option.AC_DESC} ` : ''
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





                        <Grid item xs={6} md={6}   >
                            <FormControl fullWidth>
                                <TextField
                                    id="ref-no"
                                    label="Ref.No"
                                    name="RefNo"
                                    size="small"
                                    value={headerData?.RefNo}
                                    onChange={handleInputChange}
                                    disabled={!isEditable}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={6} >
                            <FormControl fullWidth error={Boolean(errors.RefDate)}>
                                <DateSelector
                                    label="Ref.Date"
                                    size="small"
                                    disableFuture={disableFutureDate}
                                    value={headerData?.RefDate}
                                    onChange={setselectedRefDate}
                                    disable={!isEditable}
                                    error={Boolean(errors.RefDate)}
                                    helperText={errors.RefDate}
                                    required
                                />
                            </FormControl>
                        </Grid>


                        <Grid item xs={6} md={6}  >
                            <FormControl fullWidth error={Boolean(errors.PaymentMode)}>
                                <Autocomplete
                                    size="small"
                                    disabled={!isEditable}
                                    options={PaymentModeOptions || []}
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
                        <Grid item xs={6} md={6} >
                            <FormControl fullWidth error={Boolean(errors.Amount)}>
                                <TextField
                                    id="amount"
                                    label="Amount"
                                    name="Amount"
                                    size="small"
                                    value={headerData?.Amount || 0}
                                    min={totalAllocatedAmount}
                                    type="number"
                                    inputProps={{
                                        min: 0,
                                        step: "0.01",
                                        inputMode: "decimal",
                                        pattern: "[0-9]*"
                                    }}
                                    onChange={(e) => {
                                        if (!headerData.Account1 || !headerData.Account2 || headerData.Account1 === '' || headerData.Account2 === '') {
                                            showToast("Please select both accounts before changing amount", "error");
                                            return;
                                        }

                                        // Only allow numbers and decimal point
                                        const value = e.target.value.replace(/[^0-9.]/g, '');

                                        // Prevent multiple decimal points
                                        const parts = value.split('.');
                                        if (parts.length > 2) {
                                            return;
                                        }

                                        // Limit to 2 decimal places
                                        if (parts[1] && parts[1].length > 2) {
                                            return;
                                        }

                                        handleInputChange({
                                            target: {
                                                name: 'Amount',
                                                value
                                            }
                                        });

                                        const amount = Number(value) || 0;
                                        const totalAlloc = detailData.reduce((sum, bill) => sum + (bill.alloc_amount - bill.discount), 0);
                                        const totalDiscount = detailData.reduce((sum, bill) => sum + Number(bill.discount || 0), 0);
                                        const journalEntries = [
                                            {
                                                srno: 1,
                                                account: headerData.Account1,
                                                type: "Credit",
                                                amount: (totalAlloc + totalDiscount) || amount,
                                                isManual: 0
                                            },
                                            {
                                                srno: 2,
                                                account: headerData.Account2,
                                                type: "Debit",
                                                amount,
                                                isManual: 0
                                            },
                                            ...(totalDiscount > 0 ? [{
                                                srno: 3,
                                                account: "10001",
                                                type: "Debit",
                                                amount: totalDiscount,
                                                isManual: 0
                                            }] : []),
                                            ...journal.filter(entry => entry.isManual === 1).map((entry, index) => ({
                                                ...entry,
                                                srno: index + 4
                                            }))
                                        ];
                                        setJournal(journalEntries);
                                    }}
                                    disabled={!isEditable}
                                    error={Boolean(errors.Amount)}
                                    helperText={errors.Amount}
                                />
                            </FormControl>
                        </Grid>


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
                </Stack>
                <Stack m={2.5} maxwidth={'lg'}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1 }}>
                        <Tabs
                            value={currentTab}
                            onChange={handleTabChange}
                            aria-label="receipt tabs"
                        >
                            <Tab value="allocation" label="Allocation" />
                            <Tab value="journal" label="Journal" />
                        </Tabs>
                    </Box>

                    {currentTab === 'allocation' && (
                        <>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                {isEditable && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        disabled={!headerData.Account1}
                                        startIcon={<Iconify icon="eva:file-add-outline" />}
                                        onClick={() => setShowPendingBillsDialog(true)}
                                    >
                                        View Pending Bills
                                    </Button>
                                )}
                            </Box>

                            <PendingBillsTable detailData={detailData} />
                        </>
                    )}

                    {currentTab === 'journal' && (
                        <Box>

                            <JournalTable
                                journal={journal}
                                isEditable={isEditable}
                                id={id || null}
                                accounts={accounts}
                                onJournalChange={(newJournal) => {
                                    setJournal(newJournal);
                                }}
                            />
                        </Box>
                    )}

                    <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                        {isEditable && (
                            <Button variant="contained" color={isEditMode || id ? 'warning' : 'success'} size='large' onClick={handleSave}>
                                {isEditMode || id ? 'Update Receipt' : 'Create Receipt'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Card >


            {/* Print Dialog */}
            <PrintDialog
                open={printDialogOpen}
                onClose={() => setPrintDialogOpen(false)}
                title="Receipt Print Preview"
                printRef={printRef}
                documentTitle={`Receipt Voucher-${headerData.RpNo}`}
            >
                <ReceiptPrint
                    headerData={headerData}
                    journal={journal}
                    accounts={accounts}
                    detailData={detailData}
                />
            </PrintDialog>

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
                onDiscountChange={handleDiscountChange}
            />

            <Dialog
                open={showConfirmDialog}
                onClose={() => {
                    setShowConfirmDialog(false);
                    setPendingPayerChange(null);
                }}
            >
                <DialogTitle>Confirm Payer Change</DialogTitle>
                <DialogContent>
                    <Typography>
                        Changing the payer will remove all selected bills and journal details. Do you want to continue?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowConfirmDialog(false);
                        setPendingPayerChange(null);
                    }}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmPayerChange} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

            {/* <EnableEditConfirmation
                open={showEditConfirmDialog}
                onClose={() => setShowEditConfirmDialog(false)}
                onConfirm={handleEditConfirm}
                loading={editCheckLoading}
                title="Enable Edit Mode"
                message="Are you sure you want to enable edit mode for this receipt? This will allow you to modify the document."
                confirmText="Enable Edit"
                cancelText="Cancel"
                confirmColor="primary"
            /> */}
        </>
    );
}
