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
import AllocationPrint from './AllocationPrint';
import PrintDialog from '../../../../components/PrintDialog';
import PageHeader from '../../../../components/PageHeader'; 
// import { head } from 'lodash';

// ----------------------------------------------------------------------
 

export default function AllocationEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    const [selectedAllocationDate, setSelectedAllocationDate] = useState(new Date());
    const [IsAlertDialog, setAlertDialog] = useState(false);
    const [disableFutureDate] = useState(true);
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [documents, setDocuments] = useState([]);
    const [showPrintView, setShowPrintView] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const { state } = useLocation();
    const { invoiceData } = state || {};

    const [pendingBills, setPendingBills] = useState([]);
    const [selectedBills, setSelectedBills] = useState([]);
    const [showPendingBillsDialog, setShowPendingBillsDialog] = useState(false);
    const [pendingDocumentChange, setPendingDocumentChange] = useState(null);

    const [headerData, setheaderData] = useState({
        AlNo: code,
        AlDate: selectedAllocationDate,
        DocumentNo: '',
        DocumentName: '',
        DocumentPendingAmount: 0,       
        Amount: 0,
        Remarks: ''
    });

    const [detailData, setDetailData] = useState([]);  
  
    const [totalAllocatedAmount, setTotalAllocatedAmount] = useState(0);
    const [documentLoading, setDocumentLoading] = useState(false);

    const printRef = useRef(null);

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const getDocuments = async () => {
        setDocumentLoading(true);
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                key: "ALLOC_CRUD",
                TYPE: "GET_DOCUMENTS",
                DOC_NO: id || '',
            });
            if (Success) {
                setDocuments(Data);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setDocumentLoading(false);
        }
    };

    const validate = () => {
        const errors = {};
        let hasError = false;

        // Payer validation
        if (validator.isEmpty(headerData.DocumentNo)) {
            errors.DocumentNo = 'Document is required';
            showToast('Document is required', "error");
            hasError = true;
        }

        // Allocation date validation
        if (!headerData.AlDate) {
            errors.AlDate = 'Allocation date is required';
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
            'AlDate': selectedAllocationDate,
        });
    }, [selectedAllocationDate]);

    // Calculate total allocated amount from detailData
    useEffect(() => {
        const totalAllocated = detailData.reduce((sum, bill) => sum + (Number(bill.alloc_amount)  ), 0);
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
        getDocuments();
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
        const { lastNo, IsEditable } = await getLastNumber('AL');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            AlNo: lastNo
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
                    AlNo: headData?.AlNo,
                    AlDate: new Date(headData?.AlDate),
                    DocumentNo: headData?.DocumentNo,
                    DocumentName: headData?.DocumentName,
                    DocumentPendingAmount: headData?.DocumentPendingAmount || 0,
                 
                    Amount: headData?.Amount,
                    Remarks: headData?.Remarks
                });
                setSelectedAllocationDate(new Date(headData?.AlDate)); 
                setDetailData(itemsData || []);
                if (headData?.DocumentNo) {
                    fetchPendingBills(headData?.DocumentNo);
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
            AlNo: '',
            AlDate: selectedAllocationDate,
            DocumentNo: '',
            DocumentName: '',
            DocumentPendingAmount: 0,
            Amount: 0,
            Remarks: ''
        });
        setDetailData([]);  
        setErrors({});
        setIsEditable(true);
        setIsEditMode(false);
        getCode(); // Get new invoice number
        navigate('/allocation-entry');
    };





    const fetchPendingBills = async (DocumentNo) => {
        if (!DocumentNo) {
            showToast("Please select a document first", "error");
            return;
        }
        console.log("DocumentNo", DocumentNo);
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "ALLOC_CRUD",
                "TYPE": "GET_OUTSTANDING",
                "ac_code": DocumentNo,
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

     
    const handleConfirmBillSelection = () => {
        // Format the selected bills into detailData format
        const formattedBills = selectedBills.map((bill, index) => ({
            srno: index + 1,
            account: headerData.DocumentNo,
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
                DocumentNo: pendingDocumentChange?.AC_CODE || '',
                Amount: 0,
            }));
            setDetailData([]); 
            setSelectedBills([]);
            fetchPendingBills(pendingDocumentChange?.AC_CODE || '');
        }
        setShowConfirmDialog(false);
        setPendingDocumentChange(null);
    };



    const handleEditConfirm = async (messages = []) => {
        if (id) {
            loadInvoiceDetails(id);
        }
        if (messages && messages.length > 0) {
            const { Success, Message } = await GetSingleResult({
                "key": "ALLOC_CRUD",
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
                        label: 'New Allocation',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: handleNewInvoice,
                        show: true,
                        showInActions: true,
                    },
                ]}
                onEditConfirm={handleEditConfirm}
                editCheckApiKey="ALLOC_CRUD"
                editCheckApiType="EDIT_VALIDATE"
                editCheckDocNo={id}
            />

            <Card>
                <Stack maxwidth={'md'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                    <Grid container spacing={3} mt={1} maxwidth={'md'}  >
                        <Grid item xs={6} md={6}  >
                            <FormControl fullWidth>
                                <TextField
                                    id="allocation-no"
                                    label="Allocation#"
                                    size="small"
                                    name="AlNo"
                                    value={headerData?.AlNo}
                                    onChange={handleInputChange}
                                    inputProps={{
                                        readOnly: true
                                    }}
                                    disabled={!isEditable}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={6} >
                            <FormControl fullWidth error={Boolean(errors.AlDate)}>
                                <DateSelector
                                    label="Allocation Date"
                                    disableFuture={disableFutureDate}
                                    value={headerData?.AlDate}
                                    size="small"
                                    onChange={setSelectedAllocationDate}
                                    disable={!isEditable}
                                    error={Boolean(errors.AlDate)}
                                    helperText={errors.AlDate}
                                    required
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>

                            <FormControl fullWidth error={Boolean(errors.DocumentNo)}>
                                <Autocomplete
                                    size="small"
                                    disabled={!isEditable}
                                    options={documents || []}
                                    getOptionLabel={(option) =>
                                        option ? `${option.AC_DESC} ` : ''
                                    }
                                    value={documents?.find(p => p.AC_CODE === headerData.DocumentNo) || null}
                                    loading={documentLoading}
                                    onChange={(_, newValue) => handleDocumentChange(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Document"
                                            size="small"
                                            required
                                            error={Boolean(errors.DocumentNo)}
                                            helperText={errors.DocumentNo}
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
                                        if (!headerData.DocumentNo  || headerData.DocumentNo === '') {
                                            showToast("Please select a document before changing amount", "error");
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
                    

                    <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                        {isEditable && (
                            <Button variant="contained" color={isEditMode || id ? 'warning' : 'success'} size='large' onClick={handleSave}>
                                {isEditMode || id ? 'Update Allocation' : 'Create Allocation'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Card >


            {/* Print Dialog */}
            <PrintDialog
                open={printDialogOpen}
                onClose={() => setPrintDialogOpen(false)}
                title="Allocation Print Preview"
                printRef={printRef}
                documentTitle={`Allocation Voucher-${headerData.RpNo}`}
            >
                <AllocationPrint
                    ref={printRef}
                    headerData={headerData}                    
                    documents={documents}
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
