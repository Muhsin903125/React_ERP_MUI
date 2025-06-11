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
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getLastNumber, getLocationList, getUnitList } from '../../../../utils/CommonServices';
import Confirm from '../../../../components/Confirm';
import Iconify from '../../../../components/iconify';
import DateSelector from '../../../../components/DateSelector'; 
import AlertDialog from '../../../../components/AlertDialog';
import CustomerDialog from '../../../../components/CustomerDialog';
import { GetSingleResult, GetSingleListResult, GetMultipleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import TransactionItem from '../../../../components/TransactionItem';
import PrintComponent from '../../../../components/PrintComponent'; 
import JournalTable from './JournalTable'; 
import PrintDialog from '../../../../components/PrintDialog';
import JournalPrint from './JournalPrint';
import PageHeader from '../../../../components/PageHeader'; 
// import { head } from 'lodash';

// ----------------------------------------------------------------------

const PaymentModeOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'TT', label: 'TT' },
    { value: 'OTHER', label: 'Others' },
];

export default function JournalEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    const [selectedJournalDate, setSelectedJournalDate] = useState(new Date());
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
        JvNo: code,
        JvDate: selectedJournalDate,
        RefNo: '',
        RefDate: new Date(),
        Remarks: ''
    });

    const [journal, setJournal] = useState([]);
    const [selectedRefDate, setselectedRefDate] = useState(new Date());
 
    const [accounts, setAccounts] = useState([]);

    const printRef = useRef(null);


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


        // Journal date validation
        if (!headerData.JvDate) {
            errors.JvDate = 'Journal date is required';
            showToast('Journal date is required', "error");
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


        setErrors(errors);
        return !hasError;
    };



    useEffect(() => {

        setheaderData({
            ...headerData,
            'JvDate': selectedJournalDate,
            'RefDate': selectedRefDate
        });
    }, [selectedJournalDate, selectedRefDate]);



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
            CreateJournalVoucher();
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
        const { lastNo, IsEditable } = await getLastNumber('JV');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            JvNo: lastNo
        }));
    };




    const CreateJournalVoucher = async () => {
        Confirm(`Do you want to ${isEditMode || id ? 'update' : 'save'}?`).then(async () => {
            try {
                setLoadingFull(true);
                console.log(headerData, 'headerData');
                const base64Data = btoa(JSON.stringify({
                    "key": "JV_CRUD",
                    "TYPE": isEditMode || id ? "UPDATE" : "INSERT",
                    "DOC_NO": id || '',
                    "headerData": {
                        ...headerData,

                        JvNo: headerData.JvNo,
                        JvDate: headerData.JvDate,
                        RefNo: headerData.RefNo,
                        RefDate: headerData.RefDate,
                        Remarks: headerData.Remarks
                    },

                    "journal": journal.map((item, index) => ({
                        ...item,
                        srno: index + 1,
                        account: item.account,
                        narration: item.narration,
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
                    navigate(`/journal-entry/${Data.id}`, { replace: true });
                    showToast(id ? "Journal Voucher Updated ! " : "Journal Voucher Saved Successfully", 'success');
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
                "key": "JV_CRUD",
                "TYPE": "GET",
                "DOC_NO": invoiceId
            });

            if (Success) {
                // Data[0] contains header data, Data[1] contains items
                const headData = Data[0][0]; // First array's first element 
                const journalData = Data[1]; // Third array contains all journal

                setheaderData({
                    ...headData,
                    JvNo: headData?.JvNo,
                    JvDate: new Date(headData?.JvDate),
                    RefNo: headData?.RefNo,
                    RefDate: new Date(headData?.RefDate),
                    Remarks: headData?.Remarks
                });
                setSelectedJournalDate(new Date(headData?.JvDate));
                setselectedRefDate(new Date(headData?.RefDate));
                setJournal(journalData?.map(item => ({
                    ...item,
                    type: item.type === 1 ? 'Debit' : 'Credit'
                })));

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
            JvNo: '',
            JvDate: selectedJournalDate,
            RefNo: '',
            RefDate: new Date(),
            Remarks: ''
        });
        setJournal([]);
        setErrors({});
        setIsEditable(true);
        setIsEditMode(false);
        getCode(); // Get new invoice number
        navigate('/journal-entry');
    };



    

      const handleEditConfirm = async (messages = []) => {
            if (id) {
                loadInvoiceDetails(id);
            }
            if (messages && messages.length > 0) {
                const { Success, Message } = await GetSingleResult({
                    "key": "JV_CRUD",
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
                <title>Journal Voucher | Exapp</title>
            </Helmet>

            <PageHeader
                title={isEditMode ? 'Edit Journal Voucher' : 'New Journal Voucher'}
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
                        label: 'New Journal',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: handleNewInvoice,
                        show: true,
                        showInActions: true,
                    },
                ]}
                onEditConfirm={handleEditConfirm}
                editCheckApiKey="JV_CRUD"
                editCheckApiType="EDIT_VALIDATE"
                editCheckDocNo={id}
            />

            <Card>
                <Stack maxwidth={'md'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                    <Grid container spacing={3} mt={1} maxwidth={'md'}  >
                        <Grid item xs={6} md={6}  >
                            <FormControl fullWidth>
                                <TextField
                                    id="journal-no"
                                    label="Journal#"
                                    size="small"
                                    name="JvNo"
                                    value={headerData?.JvNo}
                                    onChange={handleInputChange}
                                    inputProps={{
                                        readOnly: true
                                    }}
                                    disabled={!isEditable}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={6} md={6} >
                            <FormControl fullWidth error={Boolean(errors.JvDate)}>
                                <DateSelector
                                    label="Journal Date"
                                    disableFuture={disableFutureDate}
                                    value={headerData?.JvDate}
                                    size="small"
                                    onChange={setSelectedJournalDate}
                                    disable={!isEditable}
                                    error={Boolean(errors.JvDate)}
                                    helperText={errors.JvDate}
                                    required
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


                    <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                        {isEditable && (
                            <Button variant="contained" color={isEditMode || id ? 'warning' : 'success'} size='large' onClick={handleSave}>
                                {isEditMode || id ? 'Update Journal' : 'Create Journal'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Card >


            {/* Print Dialog */}
            <PrintDialog
                open={printDialogOpen}
                onClose={() => setPrintDialogOpen(false)}
                title="Journal Print Preview"
                printRef={printRef}
                documentTitle={`Journal Voucher-${headerData.JvNo}`}
            >
                <JournalPrint
                    headerData={headerData}
                    journal={journal}
                    accounts={accounts}
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
        </>
    );
}
