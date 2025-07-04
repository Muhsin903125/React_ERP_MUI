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
    Container,
    Chip,
    Button,
    Fade,
    alpha,
    Skeleton,
} from '@mui/material';
import moment from 'moment';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import StatementOfAccountPrint from './StatementOfAccountPrint';
import { extractDateOnly, formatDateForDisplay, formatDateCustom, isValidDate } from '../../../../utils/formatDate';
 
 
 

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

const columns = [{
    accessorKey: 'docdate',
    header: 'Date', 
    size: 180,
    Cell: ({ cell }) => {
       return formatDateCustom(cell.getValue(), 'DD-MMM-YYYY');
    }
},
{ accessorKey: 'doc_code', header: 'Code', size: 100, },
{ accessorKey: 'narration', header: 'Narration' ,size: 500,},
{
    accessorKey: 'debit', header: 'Debit',size: 150,
    Cell: ({ cell }) => {
        const value = cell.getValue();
        if (value === 0 || value === null || value === undefined) return '';
        return value === 0 ? '' : value?.toFixed(2);
    },
    muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right',width: 50 }
},
{
    accessorKey: 'credit', header: 'Credit', size: 150,
    Cell: ({ cell }) => {
        const value = cell.getValue();
        if (value === 0 || value === null || value === undefined) return '';
        return  Math.abs(value)?.toFixed(2);
    },
    muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' }
},
{
    accessorKey: 'balance', header: 'Balance', size: 150,
    Cell: ({ cell }) => {
        const value = cell.getValue();
        if (value === 0 || value === null || value === undefined) return '';
        
        const absValue = Math.abs(value)?.toFixed(2);
        return value < 0 ? `${absValue} CR` : `${absValue} DR`;
    },
    muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' }
},
{ accessorKey: 'od_days', filterVisible: false, header: 'Overdue Days', size: 150, hideByDefault: true, muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' }},
{
    accessorKey: 'duedate',
    header: 'Due Date', size: 100,
    hideByDefault: true,
    Cell: ({ cell }) => {
        return formatDateCustom(cell.getValue(), 'DD-MMM-YYYY');
    }
},
    // { accessorKey: 'salesman', header: 'Salesman' },    
    // { accessorKey: 'ref_no', header: 'Ref No' },
];
const statementTypes = ["Ledger", "Outstanding"];


const StatementOfAccount = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [fromDate, setFromDate] = useState(dayjs().startOf('year').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [searchKey, setSearchKey] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [account, setAccount] = useState(null);
    const [data, setData] = useState([]);
    const [statementType, setStatementType] = useState(statementTypes[1]); // Default to "Ledger"
    const [errors, setErrors] = useState({
        account: '',
        statementType: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);

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
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "GET_R_SOA",
                "fromDate": fromDate,
                "toDate": toDate,
                "AC_CODE": account,
                "statementTypes": statementType,
            });
            if (Success) {
                setData(Data);
                showToast(`Loaded ${Data.length} transactions for ${statementType}`, "success");
            }
            else {
                showToast(Message, "error");
                setData([]);
            }
        } catch (error) {
            showToast("Error loading data", "error");
            console.log('Error:', error);
            setData([]);
        } finally {
            setLoader(false);
            setHasInitialLoad(true);
        }
    };
    useEffect(() => {
        if (isFormValid && !hasInitialLoad) {
            getreportData();
        }
    }, [hasInitialLoad]);
    
    // Calculate summary statistics with null safety and array check
    const summary = Array.isArray(data) && data.length > 0 ? data.reduce((acc, curr) => {
        acc.totalDebit += parseFloat(curr.debit || 0);
        acc.totalCredit += parseFloat(curr.credit || 0);
        acc.currentBalance = parseFloat(curr.balance || 0);
        return acc;
    }, { totalDebit: 0, totalCredit: 0, currentBalance: 0 }) : { totalDebit: 0, totalCredit: 0, currentBalance: 0 };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            account: !account ? 'Account is required' : '',
            statementType: !statementType ? 'Statement Type is required' : ''
        };
        setErrors(newErrors);

        if (isFormValid) {
            getreportData();
        } else {
            showToast("Please select all required fields", "warning");
        }
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
        setFromDate(dayjs().startOf('year').format('YYYY-MM-DD'));
        setToDate(dayjs().format('YYYY-MM-DD'));
        setAccount(null);
        setErrors({
            account: '',
            statementType: ''
        });
        setStatementType(statementTypes[0]); // Reset to "Ledger"
        setTouched(false);
        setData([]);
        setHasInitialLoad(false);
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Statement of Account"
                subtitle="Detailed account transactions and balance history"
            />

            {/* Summary Cards - Ultra Compact Design */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                            color: 'white',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'translateY(-1px)' },
                        }}
                    >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 1,
                                        bgcolor: alpha('#fff', 0.2),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <AccountBalanceWalletIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Current Balance
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.currentBalance?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                            color: 'white',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'translateY(-1px)' },
                        }}
                    >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 1,
                                        bgcolor: alpha('#fff', 0.2),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <TrendingUpIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Debits
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalDebit?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.error.light} 0%, ${theme.palette.error.main} 100%)`,
                            color: 'white',
                            transition: 'transform 0.2s ease-in-out',
                            '&:hover': { transform: 'translateY(-1px)' },
                        }}
                    >
                        <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Box
                                    sx={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: 1,
                                        bgcolor: alpha('#fff', 0.2),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <TrendingDownIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Credits
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalCredit?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Section - Always Visible */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    mb: 3,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <FilterListIcon color="primary" />
                        <Typography variant="h6" fontWeight={600} color="primary.main">
                            Filter Options
                        </Typography>
                        <Chip
                            label={`${Array.isArray(data) ? data.length : 0} transactions`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                    {/* Filter Controls Row - Full Width */}
                    <Grid container spacing={3} mb={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth error={Boolean(errors.account)}>
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
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.account)}
                                            helperText={errors.account}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props} sx={{ borderRadius: 1 }}>
                                            {option.AC_DESC}
                                        </Box>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth error={Boolean(errors.statementType)}>
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
                                            label="Statement Type"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.statementType)}
                                            helperText={errors.statementType}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props} sx={{ borderRadius: 1 }}>
                                            {option}
                                        </Box>
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

                    {/* Action Buttons Row - Right Aligned */}
                    <Grid container>
                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleReset}
                                    disabled={loader}
                                    sx={{ 
                                        borderRadius: 2,
                                        minWidth: 80,
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleSearch}
                                    disabled={loader}
                                    sx={{ 
                                        borderRadius: 2,
                                        minWidth: 80,
                                    }}
                                >
                                    {loader ? 'Loading...' : 'Search'}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Modern Data Table */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: 'hidden',
                }}
            >
                {loader ? (
                    <Box sx={{ p: 4 }}>
                        <Stack spacing={2}>
                            {[...Array(8)].map((_, index) => (
                                <Stack key={index} direction="row" spacing={2} alignItems="center">
                                    <Skeleton variant="text" width={120} height={20} />
                                    <Skeleton variant="text" width={300} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={120} height={20} />
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                ) : !hasInitialLoad ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Statement of Account
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your filters and click search to generate the statement
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={handleSearch}
                            sx={{ borderRadius: 2 }}
                        >
                            Generate Statement
                        </Button>
                    </Box>
                ) : Array.isArray(data) && data.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Transactions Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No transactions found for the selected criteria. Try adjusting your filters.
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleSearch}
                            sx={{ borderRadius: 2 }}
                        >
                            Refresh Data
                        </Button>
                    </Box>
                ) : (
                    <DataTable
                        columns={columns}
                        data={Array.isArray(data) ? data : []}
                        enableRowSelection
                        enableGrouping
                        enableExport
                        enablePageExport={false}
                        enableSorting={false}
                        enablePagination={false}
                        fileTitle={`Statement of Account - ${account || 'All Accounts'}`}
                        printPreviewProps={{
                            title: `Statement of Account`,
                            dateRange: `${moment(fromDate).format('DD-MM-YYYY')} - ${moment(toDate).format('DD-MM-YYYY')}`,
                            statementType: statementType || 'All Types',
                            toAccount: account ? `${accounts.find(acc => acc.AC_CODE === account)?.AC_DESC} - ${account}` || 'All Accounts' : 'All Accounts',
                        }}
                        PrintPreviewComponent={StatementOfAccountPrint}
                        muiTableProps={{
                            sx: {
                                '& .MuiTableHead-root': {
                                    '& .MuiTableRow-root': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        '& .MuiTableCell-root': {
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                        },
                                    },
                                },
                                '& .MuiTableBody-root': {
                                    '& .MuiTableRow-root': {
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        },
                                        '&:nth-of-type(even)': {
                                            bgcolor: alpha(theme.palette.grey[500], 0.02),
                                        },
                                    },
                                },
                            },
                        }}
                    />
                )}
            </Paper>
        </Container>
    );
};

export default StatementOfAccount;