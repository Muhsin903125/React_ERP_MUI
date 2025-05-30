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
    useTheme,
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
import AllocationPrint from './AllocationPrint';
import PrintDialog from '../../../../components/PrintDialog';
import PageHeader from '../../../../components/PageHeader';
import DocumentDialog from '../../../../components/DocumentDialog';

// ----------------------------------------------------------------------


export default function AllocationEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const theme = useTheme();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    const [selectedAllocationDate, setSelectedAllocationDate] = useState(new Date());
    const [IsAlertDialog, setAlertDialog] = useState(false);
    const [disableFutureDate] = useState(true);
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [showPrintView, setShowPrintView] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const { state } = useLocation();
    const { invoiceData } = state || {};

    const [pendingBills, setPendingBills] = useState([]);
    const [selectedBills, setSelectedBills] = useState([]);
    const [showPendingBillsDialog, setShowPendingBillsDialog] = useState(false);
    const [pendingDocumentChange, setPendingDocumentChange] = useState(null);

    const [headerData, setheaderData] = useState({
        AllocNo: code,
        AllocDate: new Date(),
        account: '',
        fromDocCode: '',
        fromDocSrNo: '',
        fromDocDate: '',
        fromDocAmount: 0,
        fromDocBalAmount: 0,
        Amount: 0,
        Remarks: ''
    });
    const [isNew, setIsNew] = useState(true);
    const [detailData, setDetailData] = useState([]);

    const [totalAllocatedAmount, setTotalAllocatedAmount] = useState(0);
    const [documentLoading, setDocumentLoading] = useState(false);

    const printRef = useRef(null);

    useEffect(() => {
        if (id) {
            console.log("ID--", id);
            setheaderData(prev => ({
                ...prev,
                AllocNo: id
            }));

            setIsNew(false);
        }
    }, [id]);

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
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
        if (validator.isEmpty(headerData.account)) {
            errors.account = 'Account is required';
            showToast('Account is required', "error");
            hasError = true;
        }

        // Payer validation
        if (validator.isEmpty(headerData.fromDocCode)) {
            errors.fromDocCode = 'Document is required';
            showToast('Document is required', "error");
            hasError = true;
        }

        // Allocation date validation
        if (!headerData.AllocDate) {
            errors.AllocDate = 'Allocation date is required';
            showToast('Allocation date is required', "error");
            hasError = true;
        }



        // Amount validation
        if (!headerData.Amount || Number(headerData.Amount) <= 0) {
            errors.Amount = 'Valid amount is required';
            showToast('Valid amount is required', "error");
            hasError = true;
        }

        // if (Number(headerData.Amount) < totalAllocatedAmount) {
        //     errors.Amount = 'Allocated amount cannot be greater than the total amount';
        //     showToast('Allocated amount cannot be greater than the total amount', "error");
        //     hasError = true;
        // }



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
            'AllocDate': selectedAllocationDate,
        });
    }, [selectedAllocationDate]);

    // Calculate total allocated amount from detailData
    useEffect(() => {
        const totalAllocated = detailData.reduce((sum, bill) => sum + (Number(bill.alloc_amount)), 0);
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
            CreateAllocation();
        }
    };
    useEffect(() => {
        getAccounts();
        if (id) {
            loadInvoiceDetails(id);
 
        } else {
            getCode(); 
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    const getCode = async () => {
        const { lastNo, IsEditable } = await getLastNumber('ALLOC');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            AllocNo: lastNo
        }));
    };



    // For Customer Dialog
    const [open, setOpen] = useState(false);
    // const [selectedValue, setSelectedValue] = useState("Customer Name");



    const CreateAllocation = async () => {
        Confirm(`Do you want to ${isEditMode || id ? 'update' : 'save'}?`).then(async () => {
            try {
                setLoadingFull(true);

                const base64Data = btoa(JSON.stringify({
                    "key": "ALLOC_CRUD",
                    "TYPE": isEditMode || id ? "UPDATE" : "INSERT",
                    "DOC_NO": id || '',
                    "headerData": {
                        ...headerData,
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
                        actrn_srno: item.actrn_srno
                    }))
                }));

                const { Success, Message, Data } = await GetSingleResult({
                    "json": base64Data
                });

                if (Success) {
                    setIsEditMode(false);
                    setIsEditable(false);
                    navigate(`/allocation-entry/${Data.id}`, { replace: true });
                    showToast(id ? "Allocation Updated Successfully" : "Allocation Saved Successfully", 'success');
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
                "key": "ALLOC_CRUD",
                "TYPE": "GET",
                "DOC_NO": invoiceId
            });

            if (Success) {
                // Data[0] contains header data, Data[1] contains items
                const headData = Data[0][0]; // First array's first element
                const itemsData = Data[1]; // Second array contains all items

                setheaderData({
                    ...headData,
                    AllocNo: headData?.AllocNo,
                    // AllocDate: new Date(headData?.AllocDate),
                    account: headData?.account || '',
                    fromDocBalAmount: headData?.fromDocBalAmount || 0,
                    fromDocCode: headData?.fromDocCode || '',
                    fromDocSrNo: headData?.fromDocSrNo || '',
                    // fromDocDate: new Date(headData?.fromDocDate) || null,
                    fromDocAmount: headData?.fromDocAmount || 0,
                    Amount: headData?.Amount,
                    Remarks: headData?.Remarks
                });
                setSelectedAllocationDate(new Date(headData?.AllocDate));
                setDetailData(itemsData || []);
                if (headData?.account) {
                    fetchPendingBills(headData?.account);
                    setSelectedBills(itemsData?.map(item => ({
                        ...item,
                        allocatedAmount: item.alloc_amount,
                        amount_type: item.amount_type,
                        actrn_srno: item.actrn_srno
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
            AllocNo: '',
            AllocDate: new Date(),
            account: '',
            fromDocCode: '',
            fromDocSrNo: '',
            fromDocDate: '',
            fromDocAmount: 0,
            fromDocBalAmount: 0,
            Amount: 0,
            Remarks: ''
        });
        setDetailData([]);
        setSelectedBills([]);
        setSelectedAllocationDate(new Date());
        setTotalAllocatedAmount(0);
        setIsNew(true);
        setIsEditMode(false);
        setShowPendingBillsDialog(false);
        setErrors({});
        setIsEditable(true);
        setIsEditMode(false);
        getCode(); // Get new invoice number
        navigate('/allocation-entry');
    };





    const fetchPendingBills = async (account) => {
        if (!account) {
            showToast("Please select an account first", "error");
            return;
        }
        console.log("Account", account);
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "ALLOC_CRUD",
                "TYPE": "GET_OUTSTANDING",
                "ac_code": account,
                // "DOC_NO": id || ''
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


    const handleConfirmBillSelection = () => {
        // Format the selected bills into detailData format
        const formattedBills = selectedBills.map((bill, index) => ({
            srno: index + 1,
            account: headerData.account,
            doc_code: bill.doc_code,
            doc_date: bill.doc_date,
            doc_amount: bill.doc_amount,
            doc_bal_amount: bill.doc_bal_amount,
            alloc_amount: Number(bill.allocatedAmount) || 0,
            amount_type: bill.amount_type,
            actrn_srno: bill.actrn_srno
        }));

        // Create journal entries
        const totalAlloc = formattedBills.reduce((sum, bill) => sum + bill.alloc_amount, 0);

        setDetailData(formattedBills);

        setShowPendingBillsDialog(false);

        // Update total amount
        setTotalAllocatedAmount(totalAlloc);
        setheaderData(prev => ({
            ...prev,
            Amount: totalAlloc
        }));
    };

    const handleAccountChange = (newValue) => {
        if (detailData.length > 0) {
            setPendingDocumentChange(newValue);
            setShowConfirmDialog(true);
        } else {
            setheaderData(prev => ({
                ...prev,
                account: newValue?.AC_CODE || '',
                fromDocCode: '',

                fromDocSrNo: '',
                fromDocDate: '',
                fromDocAmount: 0,
                fromDocBalAmount: 0,
                amount_type:  '',
            }));
            setSelectedBills([]);
            setDetailData([]);
              fetchPendingBills(newValue?.AC_CODE || '');
        }
    };
    const handleDocumentChange = (newValue) => {
        if (detailData.length > 0) {
            setPendingDocumentChange(newValue);
            setShowConfirmDialog(true);
        } else {
            setheaderData(prev => ({
                ...prev,
                DocumentNo: newValue?.AC_CODE || '',
                DocumentName: newValue?.AC_DESC || '',
                DocumentPendingAmount: newValue?.PendingAmount || 0,
            }));
            fetchPendingBills(newValue?.AC_CODE || '');
        }
    };

    const handleConfirmDocumentChange = () => {
        if (pendingDocumentChange) {
            setheaderData(prev => ({
                ...prev,
                fromDocCode:"",
                fromDocSrNo: '',
                fromDocDate: '',
                fromDocAmount: 0,
                fromDocBalAmount: 0,
                amount_type:  '',
                account: pendingDocumentChange?.AC_CODE || '',
                Amount: 0,
            }));
            setDetailData([]);
            setSelectedBills([]);

            fetchPendingBills(pendingDocumentChange?.AC_CODE || '');
        }
        setShowConfirmDialog(false);
        setPendingDocumentChange(null);
    };

    const HandleDelete = () => {
        Confirm("Are you sure you want to delete this allocation?").then(async () => {
            try {
                setLoadingFull(true);
                const { Success, Message } = await GetSingleResult({
                    "key": "ALLOC_CRUD",
                    "TYPE": "DELETE",
                    "DOC_NO": id
                });
                if (Success) {
                    showToast("Allocation deleted successfully", 'success');
                    navigate('/allocation');
                } else {
                    showToast(Message, 'error');
                }
            } catch (error) {
                showToast("Error deleting allocation", 'error');
            } finally {
                setLoadingFull(false);
            }
        });
    }
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
            "fromDocCode": value.fromDocCode,
            "fromDocSrNo": value.fromDocSrNo,
            "fromDocDate": value.fromDocDate,
            "fromDocAmount": value.fromDocAmount,
            "fromDocBalAmount": value.fromDocBalAmount,
            "amount_type": value.amount_type,
            "Amount": value.Amount,

        });
        fetchPendingBills(headerData.account);
        setTotalAllocatedAmount(0);
        setDetailData([]); // Reset detail data when a new document is selected
        setSelectedBills([]); // Reset selected bills when a new document is selected
        // setSelectedValue(value.name);
    };
    const handleAutoAllocate = () => {
        if (!headerData.fromDocBalAmount || !pendingBills.length) {
            showToast("No amount or pending bills available for allocation", "error");
            return;
        }

        // Sort pending bills by date (FIFO)
        const sortedBills = [...pendingBills].sort((a, b) => 
            new Date(a.doc_date) - new Date(b.doc_date)
        );

        // Calculate current sum of allocated amounts
        const previouslyAllocatedSum = selectedBills.reduce((sum, bill) => 
            sum + Number(bill.allocatedAmount || 0), 0
        );

        // Get remaining amount that can be allocated
        let remainingAmount = headerData.fromDocBalAmount - previouslyAllocatedSum;

        // If nothing can be allocated
        if (remainingAmount <= 0) {
            showToast("No remaining amount available for allocation", "info");
            return;
        }

        // Allocate amounts to bills using reduce
        const allocatedBills = sortedBills.map(bill => {
            // Skip if bill is already in selectedBills
            const existingBill = selectedBills.find(selected => 
                selected.doc_code === bill.doc_code && selected.srno === bill.srno
            );
            if (existingBill) {
                return existingBill;
            }

            // For new bills, calculate allocation
            if (remainingAmount <= 0) {
                return null;
            }

            const allocAmount = Math.min(bill.doc_bal_amount, remainingAmount);
            remainingAmount -= allocAmount;

            return {
                ...bill,
                allocatedAmount: allocAmount
            };
        }).filter(Boolean); // Remove null entries

        // Combine with existing selected bills
        const combinedBills = [...selectedBills, ...allocatedBills.filter(newBill => 
            !selectedBills.some(selected => 
                selected.doc_code === newBill.doc_code && selected.srno === newBill.srno
            )
        )];

        if (combinedBills.length === selectedBills.length) {
            showToast("No additional bills could be allocated", "info");
            return;
        }

        // Update selected bills
        setSelectedBills(combinedBills);

        // Format and update detail data
        const formattedBills = combinedBills.map((bill, index) => ({
            srno: index + 1,
            account: headerData.account,
            doc_code: bill.doc_code,
            doc_date: bill.doc_date,
            doc_amount: bill.doc_amount,
            doc_bal_amount: bill.doc_bal_amount,
            alloc_amount: Number(bill.allocatedAmount),
            amount_type: bill.amount_type,
            actrn_srno: bill.actrn_srno
        }));

        // Update detail data and total amount
        setDetailData(formattedBills);
        const totalAlloc = formattedBills.reduce((sum, bill) => sum + bill.alloc_amount, 0);
        setTotalAllocatedAmount(totalAlloc);
        setheaderData(prev => ({
            ...prev,
            Amount: totalAlloc
        }));

        showToast(`Auto-allocated ${allocatedBills.length} new bills for amount ${totalAlloc.toFixed(2)}`, "success");
    };
    return (
        <>
            <Helmet>
                <title>Allocation | Exapp</title>
            </Helmet>

            <PageHeader
                title={isEditMode ? 'Edit Allocation' : 'New Allocation'}
                actions={[
                    {
                        label: 'Print',
                        icon: 'eva:printer-fill',
                        variant: 'outlined',
                        onClick: handlePrint,
                        show: !isNew,
                        showInActions: false,
                    },
                    {
                        label: 'Delete',
                        icon: 'eva:trash-2-outline',
                        variant: 'contained',
                        color: 'primary',
                        type: 'Delete',
                        onClick: HandleDelete,
                        show: !isNew,
                        showInActions: false,
                    },
                    {
                        label: 'New Allocation',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: handleNewInvoice,
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Card>
                <Stack maxwidth={'md'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                    <Grid container spacing={3} mt={1} maxwidth={'md'}  >


                        <Grid item xs={6} md={3}  >
                            <FormControl fullWidth>
                                <TextField
                                    id="allocation-no"
                                    label="Allocation#"
                                    size="small"
                                    name="AllocNo"
                                    value={headerData?.AllocNo}
                                    onChange={handleInputChange}
                                    inputProps={{
                                        readOnly: true
                                    }}
                                    disabled={!isNew}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={3}>

                            <FormControl fullWidth error={Boolean(errors.account)}>
                                <Autocomplete
                                    size="small"
                                    disabled={!isNew}
                                    options={accounts || []}
                                    getOptionLabel={(option) =>
                                        option ? `${option.AC_DESC} ` : ''
                                    }
                                    value={accounts?.find(p => p.AC_CODE === headerData.account) || null}
                                    loading={documentLoading}
                                    onChange={(_, newValue) => handleAccountChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Account"
                                            name="account"
                                            size="small"
                                            required
                                            error={Boolean(errors.account)}
                                            helperText={errors.account}
                                        />
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={6} md={3}  >
                            {headerData.account ? (
                                <FormControl fullWidth error={Boolean(errors.fromDocCode)}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Typography
                                            variant="caption"
                                            component="label"
                                            sx={{
                                                position: 'absolute',
                                                backgroundColor: '#e8f0fa',
                                                px: 0.5,
                                                top: -8,
                                                left: 8,
                                                zIndex: 1,
                                                color: isNew ? 'text.secondary' : 'text.disabled',
                                            }}
                                        >
                                            Document *
                                        </Typography>
                                        <Box
                                            onClick={isNew ? handleClickOpen : undefined}
                                            sx={{
                                                p: 1,
                                                border: 1,
                                                borderColor: isNew ? 'grey.400' : 'action.disabled',
                                                borderRadius: 1,
                                                cursor: isNew ? 'pointer' : 'not-allowed',
                                                backgroundColor: isNew ? '#e8f0fa' : 'action.disabledBackground',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                minHeight: '40px',
                                                width: '100%',
                                                '&:hover': isNew ? { borderColor: 'black', backgroundColor: 'action.hover' } : {},
                                                color: isNew ? 'text.primary' : 'text.disabled',
                                            }}
                                        >
                                            {headerData.fromDocCode ? (
                                                <Typography variant="body1" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                                                    {`${headerData.fromDocCode} / ${headerData.fromDocSrNo}`}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" sx={{ flexGrow: 1, color: isNew ? 'text.secondary' : 'text.disabled' }}>
                                                    Select Document
                                                </Typography>
                                            )}
                                            {isNew && <Iconify icon="eva:arrow-ios-downward-fill" sx={{ ml: 1, color: 'text.secondary' }} />}
                                        </Box>
                                    </Box>
                                </FormControl>
                            ) : (
                                <FormControl fullWidth>
                                    <Box sx={{ position: 'relative' }}>
                                        <Typography
                                            variant="caption"
                                            component="label"
                                            sx={{
                                                position: 'absolute',
                                                backgroundColor: '#e8f0fa',
                                                px: 1,
                                                top: -8,
                                                left: 8,
                                                zIndex: 1,
                                                color: 'text.disabled',
                                            }}
                                        >
                                            Document
                                        </Typography>
                                        <Box sx={{ p: 1, border: 1, borderColor: 'action.disabled', borderRadius: 1, minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e8f0fa', width: '100%' }}>
                                            <Typography variant="body2" color="text.disabled">
                                                Select Account First
                                            </Typography>
                                        </Box>
                                    </Box>
                                </FormControl>
                            )}
                            <DocumentDialog
                                open={open}
                                account={headerData.account}
                                onClose={handleClose}
                                onSelect={handleSelect}
                            />
                        </Grid>

                        <Grid item xs={6} md={3} >
                            <FormControl fullWidth error={Boolean(errors.AllocDate)}>
                                <DateSelector
                                    label="Allocation Date"
                                    disableFuture={disableFutureDate}
                                    value={headerData?.AllocDate}
                                    size="small"
                                    onChange={setSelectedAllocationDate}
                                    disable={!isNew}
                                    error={Boolean(errors.AllocDate)}
                                    helperText={errors.AllocDate}
                                    required
                                />
                            </FormControl>
                        </Grid>


                        {/* <Grid item xs={12} md={12}>
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
                                            disabled={!isNew}
                                            placeholder="Enter any additional notes or remarks "
                                        />
                                    </FormControl>
                                </Grid> */}


                    </Grid>
                </Stack >
                <Stack m={2.5} maxwidth={'lg'}>
                    <Box sx={{
                        border: `1px solid ${theme.palette.primary.lighter}`,
                        borderRadius: 1,
                        overflow: 'hidden',
                        mb: 2
                    }}>
                        <Grid container sx={{
                            bgcolor: theme.palette.primary.lighter,
                            borderBottom: `1px solid ${theme.palette.primary.lighter}`,
                            py: 1.5
                        }}>
                            <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Code</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Sr No</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Date</Typography>
                            </Grid>

                            <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Amount</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Bal Amount</Typography>
                            </Grid>

                            <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Amount</Typography>
                            </Grid>


                        </Grid>

                        <Grid
                            container

                            sx={{
                                borderBottom: `1px solid ${theme.palette.primary.lighter}`,
                                // '&:hover': {
                                //     bgcolor: theme.palette.primary.light
                                // },
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{headerData?.fromDocCode}</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{headerData?.fromDocSrNo}</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}> {headerData?.fromDocDate}</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{headerData?.fromDocAmount?.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{headerData?.fromDocBalAmount?.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ fontWeight: 600, px: 2, py: 1.5 }}>{headerData?.Amount?.toFixed(2)}</Typography>
                            </Grid>

                        </Grid>

                    </Box>


                    <>
                        <Box display="flex" justifyContent="flex-start" alignItems="center" mb={1} gap={1}>

                                <Button
                                    variant="contained"
                                    size="small"
                                    disabled={!headerData.account || !headerData.fromDocCode}
                                    startIcon={<Iconify icon="eva:file-add-outline" />}
                                    onClick={() => setShowPendingBillsDialog(true)}
                                >
                                    View Allocations
                                </Button>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    ml={1}
                                    disabled={!headerData.account || !headerData.fromDocCode}
                                    startIcon={<Iconify icon="eva:refresh-fill" />}
                                    onClick={() => handleAutoAllocate()}
                                >
                                    Auto Allocate Bills
                                </Button>
                            </Box>

                        <PendingBillsTable detailData={detailData} />
                    </>


                    <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                        {!id && (
                            <Button variant="contained" color={'success'} size='large' onClick={handleSave}>
                                Create Allocation
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Card >


            {/* Print Dialog */}
            < PrintDialog
                open={printDialogOpen}
                onClose={() => setPrintDialogOpen(false)
                }
                title="Allocation Print Preview"
                printRef={printRef}
                documentTitle={`Allocation Voucher-${headerData.RpNo}`}
            >
                <AllocationPrint
                    ref={printRef}
                    headerData={headerData}
                    accounts={accounts}
                    detailData={detailData}
                />
            </PrintDialog >

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
                maxAllowedAllocation={headerData.fromDocBalAmount}
            />

            <Dialog
                open={showConfirmDialog}
                onClose={() => {
                    setShowConfirmDialog(false);
                    setPendingDocumentChange(null);
                }}
            >
                <DialogTitle>Confirm Document Change</DialogTitle>
                <DialogContent>
                    <Typography>
                        Changing the document will remove all selected bills. Do you want to continue?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowConfirmDialog(false);
                        setPendingDocumentChange(null);
                    }}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDocumentChange} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
}
