import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import {
    Box,
    Grid,
    TextField,
    Paper,
    CircularProgress,
    Typography,
    Card,
    CardContent,
    Collapse,
    IconButton,
    Stack,
    Divider,
    useTheme,
    Autocomplete,
    FormControl,
} from '@mui/material';
import moment from 'moment';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ReportHeader from '../../../../components/ReportHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import StatementOfAccountPrint from './StatementOfAccountPrint';

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);
// docdate	
// doc_code
// ref_no	
// duedate	
// od_days	
// debit	
// credit	
// balance	
// salesman
// narration
const columns = [ 
    {
        accessorKey: 'docdate',
        header: 'Date',
        width: 50,
     
    },
    { accessorKey: 'doc_code', header: 'Code'  ,width: 50,},
    { accessorKey: 'duedate', header: 'Due Date'        
    },
    { accessorKey: 'od_days', header: 'Overdue Days' },
    { accessorKey: 'debit', header: 'Debit', muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' } },
    { accessorKey: 'credit', header: 'Credit', muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' } },
    { accessorKey: 'balance', header: 'Balance', muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' } },
    // { accessorKey: 'salesman', header: 'Salesman' },    
    // { accessorKey: 'ref_no', header: 'Ref No' },
    // { accessorKey: 'narration', header: 'Narration' },
];
const statementTypes = ["Ledger", "Outstanding"];


const StatementOfAccount = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [searchKey, setSearchKey] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [account, setAccount] = useState(null);
    const [data, setData] = useState([]);
    const [statementType, setStatementType] = useState();
    const [errors, setErrors] = useState({
        account: '',
        statementType: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [showFilters, setShowFilters] = useState(true);

    const isFormValid = fromDate && toDate && account && statementType;
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
    useEffect(() => {
        getAccounts();
    }, []);

    const getreportData = async () => {
        setLoader(true);
        const { Success, Data, Message } = await GetSingleListResult({
            "key": "GET_R_SOA",
            "fromDate": fromDate,
            "toDate": toDate,
            "AC_CODE": account,
            "statementTypes": statementType,
        });
        if (Success) {
            setData(Data);
        }
        else {
            showToast(Message, "error");
        }
        setLoader(false);
    };
    useEffect(() => {
        if (isFormValid) {
            getreportData();
        }
    }, [fromDate, toDate, account, statementType, isFormValid]);
    // Calculate summary statistics
    const summary = data.reduce((acc, curr) => {
        acc.totalDebit += parseFloat(curr.debit || 0);
        acc.totalCredit += parseFloat(curr.credit || 0);
        acc.currentBalance = parseFloat(curr.balance || 0);
        return acc;
    }, { totalDebit: 0, totalCredit: 0, currentBalance: 0 });

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            account: !account ? 'Account is required' : '',
            statementType: !statementType ? 'Statement Type is required' : ''
        };
        setErrors(newErrors);

        if (isFormValid) {
            setLoader(true);
            getreportData();
            // const filteredData = Data?.filter(item => {
            //     try {
            //         const isInDateRange = dayjs(item.docdate).isBetween(fromDate, toDate, 'day', '[]');
            //         const searchKeyMatch = !searchKey ||
            //             Object.values(item).some(prop =>
            //                 prop && prop.toString().toLowerCase().includes(searchKey.toLowerCase())
            //             );
            //         return searchKeyMatch && isInDateRange;
            //     } catch (error) {
            //         console.error('Date comparison error:', error);
            //         return false;
            //     }
            // });

            // setData(filteredData);
        }
        setLoader(false);
    };
    const handleAccountChange = (newValue) => {
        console.log('Selected account:', newValue);
        if (newValue) {
            setAccount(newValue.AC_CODE);
            setErrors(prev => ({
                ...prev,
                account: ''
            }));
        } else {
            setAccount(null);
        }
    };
    const handleReset = () => {
        setFromDate(dayjs().startOf('month').format('YYYY-MM-DD'));
        setToDate(dayjs().format('YYYY-MM-DD')); 
        setAccount(null);
        setErrors({
            account: '',
            statementType: ''
        });
        setStatementType(null);
        getreportData();
        setTouched(false);
    };

    return (
        <Box p={{ xs: 2, md: 2 }} sx={{ maxWidth: '100%' }}>
            <ReportHeader
                title="Statement of Account"
                onSearch={handleSearch}
                onReset={handleReset}
            // searchDisabled={!isFormValid}
            >
                <Box sx={{ width: '100%', }}>
                    {/* <Grid container spacing={2} mb={2}>
                        <Grid item xs={12} md={4}>
                            <Card sx={{ p: 1, height: '100%', minHeight: 80, bgcolor: theme.palette.primary.lighter, boxShadow: 'none' }}>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <AccountBalanceWalletIcon color="primary" fontSize="small" />
                                        <Typography variant="caption" color="text.secondary">
                                            Balance
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h6" sx={{ mt: 1, mb: 0 }}>
                                        {summary.currentBalance.toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ p: 1, height: '100%', minHeight: 80, bgcolor: theme.palette.success.lighter, boxShadow: 'none' }}>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <TrendingUpIcon color="success" fontSize="small" />
                                        <Typography variant="caption" color="text.secondary">
                                            Debits
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h6" sx={{ mt: 1, mb: 0 }}>
                                        {summary.totalDebit.toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <Card sx={{ p: 1, height: '100%', minHeight: 80, bgcolor: theme.palette.error.lighter, boxShadow: 'none' }}>
                                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <TrendingDownIcon color="error" fontSize="small" />
                                        <Typography variant="caption" color="text.secondary">
                                            Credits
                                        </Typography>
                                    </Stack>
                                    <Typography variant="h6" sx={{ mt: 1, mb: 0 }}>
                                        {summary.totalCredit.toFixed(2)}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid> */}
                    <Paper
                        sx={{
                            p: 2,
                            mb: 0,
                            bgcolor: theme.palette.background.neutral,
                            borderRadius: '16px 16px 0 0',
                            borderBottom: 'none'
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                            onClick={() => setShowFilters(!showFilters)}
                            sx={{
                                cursor: 'pointer',
                                mb: 2,
                                pl: 1,
                                py: 1,
                                borderRadius: 1,
                                '&:hover': {
                                    bgcolor: 'rgba(145, 158, 171, 0.08)'
                                }
                            }}
                        >
                            <FilterListIcon />
                            <Typography variant="subtitle1">Filters</Typography>
                            <IconButton size="small">
                                {showFilters ? '−' : '+'}
                            </IconButton>
                        </Stack>

                        <Collapse in={showFilters}>
                            <Grid container spacing={2} alignItems="center">
                                {/* <Grid item xs={12} md={3}>
                                    <TextField
                                        label="Search Text"
                                        value={searchKey}
                                        onChange={e => setSearchKey(e.target.value)}
                                        fullWidth
                                        size="small"
                                        error={touched && !searchKey}
                                        helperText={touched && !searchKey ? 'Search Text is required' : ''}
                                    />
                                </Grid> */}
                                <Grid item xs={12} md={3}>                                    <FormControl fullWidth error={Boolean(errors.account)}>
                                    <Autocomplete
                                        size="small"
                                        options={accounts || []}
                                        getOptionLabel={(option) =>
                                            option ? `${option.AC_DESC}` : ''
                                        }
                                        isOptionEqualToValue={(option, value) =>
                                            option.AC_CODE === value?.AC_CODE
                                        }
                                        value={accounts?.find(p => p.AC_CODE === account) || null}
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
                                <Grid item xs={12} md={3}>                                    <FormControl fullWidth error={Boolean(errors.statementType)}>
                                    <Autocomplete
                                        size="small"
                                        options={statementTypes}
                                        getOptionLabel={(option) => option || ''}
                                        value={statementType || null}
                                        onChange={(_, newValue) => {
                                            setStatementType(newValue);
                                            setErrors(prev => ({
                                                ...prev,
                                                statementType: ''
                                            }));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Select Statement Type"
                                                name="statementType"
                                                size="small"
                                                required
                                                error={Boolean(errors.statementType)}
                                                helperText={errors.statementType}
                                            />
                                        )}
                                    />
                                </FormControl>

                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <DateSelector
                                        label="From Date"
                                        size="small"
                                        value={fromDate}
                                        onChange={setFromDate}
                                        error={touched && !fromDate}
                                        helperText={touched && !fromDate ? 'From Date is required' : ''}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <DateSelector
                                        label="To Date"
                                        size="small"
                                        value={toDate}
                                        onChange={setToDate}
                                        error={touched && !toDate}
                                        helperText={touched && !toDate ? 'To Date is required' : ''}
                                    />
                                </Grid>
                            </Grid>
                        </Collapse>
                    </Paper>
                </Box>
            </ReportHeader>

            <Paper
                elevation={1}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    bgcolor: theme.palette.background.paper
                }}
            >
                {!loader ? (
                    <DataTable
                        columns={columns}
                        data={data}
                        enableRowSelection
                        enableGrouping
                        enableExport

                        fileTitle={`Statement of Account - ${account || 'All Accounts'}`}
                        printPreviewProps={{
                            title: `Statement of Account `,
                            dateRange: `${moment(fromDate).format('DD-MM-YYYY')} - ${moment(toDate).format('DD-MM-YYYY')}`,
                            statementType: statementType || 'All Types',
                            toAccount: account ? `${accounts.find(acc => acc.AC_CODE === account)?.AC_DESC} - ${account}` || 'All Accounts' : 'All Accounts',
                        }}
                        PrintPreviewComponent={StatementOfAccountPrint} // Use custom print preview
                    />
                ) : (
                    <Box display="flex" justifyContent="center" p={3}>
                        <CircularProgress />
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default StatementOfAccount;