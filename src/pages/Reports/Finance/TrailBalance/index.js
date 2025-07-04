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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReportHeader from '../../../../components/ReportHeader';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import TrailBalancePrint from './TrailBalancePrint';
 
// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

// Common cell renderers
const AccountCodeCell = ({ cell, row }) => {
    const isHeader = row.original?.is_header || false;
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={isHeader ? 700 : 500} 
            color={isHeader ? "text.primary" : "primary.main"}
            sx={{ 
                textTransform: isHeader ? 'uppercase' : 'none',
                letterSpacing: isHeader ? '0.5px' : 'normal'
            }}
        >
            {cell.getValue()}
        </Typography>
    );
};

const AccountDescCell = ({ cell, row }) => {
    const level = row.original?.level || 0;
    const isHeader = row.original?.is_header || false;
    const marginLeft = level * 20; // 20px per level
    
    return (
        <Box sx={{ ml: `${marginLeft}px` }}>
            <Typography 
                variant="body2" 
                fontWeight={isHeader ? 700 : 400}
                color={isHeader ? "text.primary" : "text.secondary"}
                sx={{ 
                    wordBreak: 'break-word',
                    textTransform: isHeader ? 'uppercase' : 'none',
                    letterSpacing: isHeader ? '0.5px' : 'normal'
                }}
            >
                {cell.getValue()}
            </Typography>
        </Box>
    );
};

const AmountCell = ({ cell, row, showSign = false, chipStyle = false }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0.00</Typography>;
    }
    
    const absValue = Math.abs(value)?.toFixed(2);
    const isCredit = value < 0;
    
    if (chipStyle) {
        return (
            <Chip
                label={showSign ? (isCredit ? `${absValue} CR` : `${absValue} DR`) : absValue}
                size="small"
                color={isCredit ? 'error' : 'success'}
                variant="outlined"
                sx={{ fontWeight: 600, minWidth: 80 }}
            />
        );
    }
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={500}
            color={isCredit ? 'error.main' : 'success.main'}
        >
            {showSign ? (isCredit ? `${absValue} CR` : `${absValue} DR`) : absValue}
        </Typography>
    );
};

const DebitOnlyCell = ({ cell, row }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    return (
        <Typography variant="body2" fontWeight={500} color="success.main">
            {value?.toFixed(2)}
        </Typography>
    );
};

const CreditOnlyCell = ({ cell, row }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    return (
        <Typography variant="body2" fontWeight={500} color="error.main">
            {Math.abs(value)?.toFixed(2)}
        </Typography>
    );
};

// Column configurations for different report formats
const getColumns = (reportFormat, fromDate, toDate) => {
    const baseColumns = [
        {
            accessorKey: 'ac_desc',
            header: 'Account Details',
            size: 300,
            Cell: AccountDescCell,
        },
        {
            accessorKey: 'ac_code',
            header: ' Code', 
            size: 120,
            Cell: AccountCodeCell,
        }
    ];

    switch (reportFormat) {
        case '6_column':
            return [
                ...baseColumns,
                {
                    header: `Opening Balance ${moment(fromDate).subtract(1, 'day').format('DD-MM-YYYY')}`,
                    columns: [
                        {
                            accessorKey: 'opening_balance_debit',
                            header: 'Debit',
                            size: 120,
                            Cell: ({ cell, row }) => {
                                const openingBalance = row.original?.opening_balance || 0;
                                const debitValue = openingBalance > 0 ? openingBalance : 0;
                                return DebitOnlyCell({ cell: { getValue: () => debitValue }, row });
                            },
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        },
                        {
                            accessorKey: 'opening_balance_credit',
                            header: 'Credit',
                            size: 120,
                            Cell: ({ cell, row }) => {
                                const openingBalance = row.original?.opening_balance || 0;
                                const creditValue = openingBalance < 0 ? Math.abs(openingBalance) : 0;
                                return CreditOnlyCell({ cell: { getValue: () => creditValue }, row });
                            },
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        }
                    ]
                },
                {
                    header: `Transaction  Between Dates `,
                    columns: [
                        {
                            accessorKey: 'debit',
                            header: 'Debit',
                            size: 120,
                            Cell: DebitOnlyCell,
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        },
                        {
                            accessorKey: 'credit',
                            header: 'Credit',
                            size: 120,
                            Cell: CreditOnlyCell,
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        }
                    ]
                },
                {
                    header: `Closing Balance ${moment(toDate).format('DD MMM YYYY')}`,
                    columns: [
                        {
                            accessorKey: 'closing_balance_debit',
                            header: 'Debit',
                            size: 120,
                            Cell: ({ cell, row }) => {
                                const closingBalance = row.original?.closing_balance || 0;
                                const debitValue = closingBalance > 0 ? closingBalance : 0;
                                return DebitOnlyCell({ cell: { getValue: () => debitValue }, row });
                            },
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        },
                        {
                            accessorKey: 'closing_balance_credit',
                            header: 'Credit',
                            size: 120,
                            Cell: ({ cell, row }) => {
                                const closingBalance = row.original?.closing_balance || 0;
                                const creditValue = closingBalance < 0 ? Math.abs(closingBalance) : 0;
                                return CreditOnlyCell({ cell: { getValue: () => creditValue }, row });
                            },
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        }
                    ]
                }
            ];

        case '5_column':
            return [
                {
                    accessorKey: 'ac_desc',
                    header: 'Account Details',
                    size: 300,
                    Cell: AccountDescCell,
                },
                {
                    accessorKey: 'ac_code',
                    header: ' Code', 
                    size: 120,
                    Cell: AccountCodeCell,
                },
                {
                    accessorKey: 'opening_balance',
                    header: `Opening Balance ${moment(fromDate).subtract(1, 'day').format('DD MMM YYYY')}`,
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: true }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                // {
                //     header: 'Transaction Between Dates',
                //     columns: [
                       
                //     ]
                // },
                 {
                            accessorKey: 'debit',
                            header: 'Debit',
                            size: 100,
                            Cell: DebitOnlyCell,
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        },
                        {
                            accessorKey: 'credit',
                            header: 'Credit',
                            size: 100,
                            Cell: CreditOnlyCell,
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        },
                        {
                            accessorKey: 'transaction_net',
                            header: 'Net',
                            size: 100,
                            Cell: ({ cell, row }) => {
                                const debit = row.original?.debit || 0;
                                const credit = row.original?.credit || 0;
                                const netValue = debit - credit;
                                return AmountCell({ cell: { getValue: () => netValue }, row, showSign: true });
                            },
                            muiTableBodyCellProps: { align: 'right' }, 
                            headerProps: { align: 'right' }
                        },
                        {
                            accessorKey: 'closing_balance',
                            header: `Closing Balance ${moment(toDate).format('DD MMM YYYY')}`,
                            size: 150,
                            Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: true, chipStyle: true }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];

        case '2_column':
            return [
                ...baseColumns,
                {
                    accessorKey: 'debit',
                    header: 'Debit',
                    size: 150,
                    Cell: DebitOnlyCell,
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'credit',
                    header: 'Credit',
                    size: 150,
                    Cell: CreditOnlyCell,
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];

        default:
            return baseColumns;
    }
};

const accountTypes = ["All", "Assets", "Liabilities", "Income", "Expense", "Equity"];

// Report format types
const reportFormats = [
    { value: '6_column', label: '6 Column Standard Format' },
    { value: '5_column', label: '5 Column Standard Format' },
    { value: '2_column', label: '2 Column Standard Format' }
];

// Demo data for testing - Enhanced with account types and levels
const demoData = [
    // Assets Group
    {
        ac_code: 'ASSETS',
        ac_desc: 'ASSETS',
        account_type: 'Assets',
        is_header: true,
        level: 0,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '1000',
        ac_desc: 'Current Assets',
        account_type: 'Assets',
        is_header: true,
        level: 1,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '1001',
        ac_desc: 'Cash in Hand',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        opening_balance: 15000.00,
        debit: 25000.00,
        credit: 18000.00,
        closing_balance: 22000.00
    },
    {
        ac_code: '1002',
        ac_desc: 'Bank Account - Current',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        opening_balance: 50000.00,
        debit: 45000.00,
        credit: 30000.00,
        closing_balance: 65000.00
    },
    {
        ac_code: '1100',
        ac_desc: 'Receivables',
        account_type: 'Assets',
        is_header: true,
        level: 1,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '1101',
        ac_desc: 'Accounts Receivable',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        opening_balance: 35000.00,
        debit: 20000.00,
        credit: 15000.00,
        closing_balance: 40000.00
    },
    {
        ac_code: '1200',
        ac_desc: 'Inventory',
        account_type: 'Assets',
        is_header: true,
        level: 1,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '1201',
        ac_desc: 'Inventory - Raw Materials',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        opening_balance: 28000.00,
        debit: 12000.00,
        credit: 8000.00,
        closing_balance: 32000.00
    },
    {
        ac_code: '1300',
        ac_desc: 'Fixed Assets',
        account_type: 'Assets',
        is_header: true,
        level: 1,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '1301',
        ac_desc: 'Office Equipment',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        opening_balance: 25000.00,
        debit: 5000.00,
        credit: 0.00,
        closing_balance: 30000.00
    },
    
    // Liabilities Group
    {
        ac_code: 'LIABILITIES',
        ac_desc: 'LIABILITIES',
        account_type: 'Liabilities',
        is_header: true,
        level: 0,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '2000',
        ac_desc: 'Current Liabilities',
        account_type: 'Liabilities',
        is_header: true,
        level: 1,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '2001',
        ac_desc: 'Accounts Payable',
        account_type: 'Liabilities',
        is_header: false,
        level: 2,
        opening_balance: -20000.00,
        debit: 8000.00,
        credit: 12000.00,
        closing_balance: -24000.00
    },
    {
        ac_code: '2100',
        ac_desc: 'Long Term Liabilities',
        account_type: 'Liabilities',
        is_header: true,
        level: 1,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '2101',
        ac_desc: 'Short Term Loan',
        account_type: 'Liabilities',
        is_header: false,
        level: 2,
        opening_balance: -15000.00,
        debit: 2000.00,
        credit: 5000.00,
        closing_balance: -18000.00
    },
    
    // Equity Group
    {
        ac_code: 'EQUITY',
        ac_desc: 'EQUITY',
        account_type: 'Equity',
        is_header: true,
        level: 0,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '3001',
        ac_desc: 'Share Capital',
        account_type: 'Equity',
        is_header: false,
        level: 1,
        opening_balance: -100000.00,
        debit: 0.00,
        credit: 0.00,
        closing_balance: -100000.00
    },
    
    // Income Group
    {
        ac_code: 'INCOME',
        ac_desc: 'INCOME',
        account_type: 'Income',
        is_header: true,
        level: 0,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '4001',
        ac_desc: 'Sales Revenue',
        account_type: 'Income',
        is_header: false,
        level: 1,
        opening_balance: 0.00,
        debit: 5000.00,
        credit: 85000.00,
        closing_balance: -80000.00
    },
    {
        ac_code: '4002',
        ac_desc: 'Service Income',
        account_type: 'Income',
        is_header: false,
        level: 1,
        opening_balance: 0.00,
        debit: 0.00,
        credit: 15000.00,
        closing_balance: -15000.00
    },
    
    // Expense Group
    {
        ac_code: 'EXPENSE',
        ac_desc: 'EXPENSES',
        account_type: 'Expense',
        is_header: true,
        level: 0,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '5000',
        ac_desc: 'Cost of Sales',
        account_type: 'Expense',
        is_header: true,
        level: 1,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '5001',
        ac_desc: 'Cost of Goods Sold',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        opening_balance: 0.00,
        debit: 45000.00,
        credit: 0.00,
        closing_balance: 45000.00
    },
    {
        ac_code: '5100',
        ac_desc: 'Operating Expenses',
        account_type: 'Expense',
        is_header: true,
        level: 1,
        opening_balance: 0,
        debit: 0,
        credit: 0,
        closing_balance: 0
    },
    {
        ac_code: '5002',
        ac_desc: 'Office Rent',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        opening_balance: 0.00,
        debit: 12000.00,
        credit: 0.00,
        closing_balance: 12000.00
    },
    {
        ac_code: '5003',
        ac_desc: 'Utilities Expense',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        opening_balance: 0.00,
        debit: 3500.00,
        credit: 0.00,
        closing_balance: 3500.00
    },
    {
        ac_code: '5004',
        ac_desc: 'Salary Expense',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        opening_balance: 0.00,
        debit: 25000.00,
        credit: 0.00,
        closing_balance: 25000.00
    },
    {
        ac_code: '5005',
        ac_desc: 'Marketing Expense',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        opening_balance: 0.00,
        debit: 8000.00,
        credit: 2000.00,
        closing_balance: 6000.00
    }
];

const TrailBalance = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [fromDate, setFromDate] = useState(dayjs().startOf('year').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [accountType, setAccountType] = useState(accountTypes[0]); // Default to "All"
    const [reportFormat, setReportFormat] = useState(reportFormats[0].value); // Default to 6 column
    const [data, setData] = useState(demoData); // Always initialize as empty array
    const [errors, setErrors] = useState({
        accountType: '',
        reportFormat: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);

    const isFormValid = fromDate && toDate && accountType && reportFormat;

    // Get dynamic columns based on report format
    const columns = getColumns(reportFormat, fromDate, toDate);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Filter demo data based on account type selection
            let filteredData = demoData;
            if (accountType && accountType !== 'All') {
                filteredData = demoData.filter(item => 
                    item.account_type === accountType || item.is_header
                ).filter((item, index, arr) => {
                    // Include headers only if there are child accounts
                    if (item.is_header) {
                        return arr.some(child => 
                            child.account_type === item.account_type && 
                            !child.is_header &&
                            child.account_type === accountType
                        );
                    }
                    return true;
                });
            }
            
            showToast(`Loaded ${filteredData.filter(item => !item.is_header).length} accounts for ${accountType} in ${reportFormats.find(f => f.value === reportFormat)?.label}`, "success");
            setData(filteredData);
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
        // Always load demo data on initial mount for testing
        if (!hasInitialLoad) {
            getReportData();
        }
    }, [hasInitialLoad]);

    // Calculate summary statistics with null safety and array check (excluding header rows)
    const summary = Array.isArray(data) && data.length > 0 ? data
        .filter(item => !item.is_header) // Exclude header rows from calculations
        .reduce((acc, curr) => {
            const openingBalance = parseFloat(curr?.opening_balance || 0);
            const debit = parseFloat(curr?.debit || 0);
            const credit = parseFloat(curr?.credit || 0);
            const closingBalance = parseFloat(curr?.closing_balance || 0);

            acc.totalOpeningDebit += openingBalance > 0 ? openingBalance : 0;
            acc.totalOpeningCredit += openingBalance < 0 ? Math.abs(openingBalance) : 0;
            acc.totalDebit += debit;
            acc.totalCredit += credit;
            acc.totalClosingDebit += closingBalance > 0 ? closingBalance : 0;
            acc.totalClosingCredit += closingBalance < 0 ? Math.abs(closingBalance) : 0;
            return acc;
        }, { 
            totalOpeningDebit: 0, 
            totalOpeningCredit: 0, 
            totalDebit: 0, 
            totalCredit: 0, 
            totalClosingDebit: 0, 
            totalClosingCredit: 0 
        }) : { 
            totalOpeningDebit: 0, 
            totalOpeningCredit: 0, 
            totalDebit: 0, 
            totalCredit: 0, 
            totalClosingDebit: 0, 
            totalClosingCredit: 0 
        };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            accountType: !accountType ? 'Account Type is required' : '',
            reportFormat: !reportFormat ? 'Report Format is required' : ''
        };
        setErrors(newErrors);

        if (isFormValid) {
            getReportData();
        }
    };

    const handleReset = () => {
        setFromDate(dayjs().startOf('year').format('YYYY-MM-DD'));
        setToDate(dayjs().format('YYYY-MM-DD'));
        setAccountType(accountTypes[0]); // Reset to "All"
        setReportFormat(reportFormats[0].value); // Reset to 6 column
        setErrors({
            accountType: '',
            reportFormat: ''
        });
        setTouched(false);
        setData(demoData); // Reset to demo data
        setHasInitialLoad(true); // Mark as loaded
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Trail Balance Report"
                subtitle="Account balances and financial position summary"
            />

            {/* Summary Cards - Ultra Compact Design (excluding status) */}
            <Grid container spacing={2} mb={2}>
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

                <Grid item xs={12} sm={6} md={4}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${theme.palette.info.light} 0%, ${theme.palette.info.main} 100%)`,
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
                                    <AccountBalanceIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Difference
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${Math.abs(summary?.totalDebit - summary?.totalCredit).toFixed(2) || '0.00'}`
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
                      {Array.isArray(data) && data?.length > 0 && (
                          <Chip
                              label={`${Array.isArray(data) ? data.length : 0} accounts`}
                              size="small"
                              color="primary"
                              variant="outlined"
                          />
                      )}
                    </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                    {/* Filter Controls Row - Full Width */}
                    <Grid container spacing={3} mb={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    size="small"
                                    options={accountTypes}
                                    getOptionLabel={(option) => option || ''}
                                    value={accountType || null}
                                    onChange={(_, newValue) => {
                                        setAccountType(newValue);
                                        setErrors(prev => ({ ...prev, accountType: '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Account Type"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.accountType)}
                                            helperText={errors.accountType}
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
                            <FormControl fullWidth>
                                <Autocomplete
                                    size="small"
                                    options={reportFormats}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={reportFormats.find(f => f.value === reportFormat) || null}
                                    onChange={(_, newValue) => {
                                        setReportFormat(newValue?.value || '');
                                        setErrors(prev => ({ ...prev, reportFormat: '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Report Format"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.reportFormat)}
                                            helperText={errors.reportFormat}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props} sx={{ borderRadius: 1 }}>
                                            {option.label}
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
                        <AccountTreeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Trail Balance Report
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your filters and click refresh to generate the report
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={handleSearch}
                            sx={{ borderRadius: 2 }}
                        >
                            Generate Report
                        </Button>
                    </Box>
                ) : Array.isArray(data) && data.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Data Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No accounts found for the selected criteria. Try adjusting your filters.
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
                        data={Array.isArray(data) ? data : []} // Ensure data is always an array
                        enableRowSelection
                        enableGrouping
                        enableExport
                        enablePageExport={false}
                        enableSorting
                        enablePagination={false}
                        fileTitle={`Trail Balance - ${accountType || 'All Types'} - ${reportFormats.find(f => f.value === reportFormat)?.label || 'Standard Format'}`}
                        printPreviewProps={{
                            title: `Trail Balance Report`,
                            dateRange: `${moment(fromDate).format('DD-MM-YYYY')} - ${moment(toDate).format('DD-MM-YYYY')}`,
                            accountType: accountType || 'All Types',
                            reportFormat: reportFormats.find(f => f.value === reportFormat)?.label || 'Standard Format',
                            columns, // Pass the dynamic columns
                           fromDate,
                            toDate,
                            summary,
                        }}
                        PrintPreviewComponent={TrailBalancePrint}
                        muiTableProps={{
                            sx: {
                                '& .MuiTableHead-root': {
                                    '& .MuiTableRow-root': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        height: '56px', // Set consistent height for header rows
                                        '& .MuiTableCell-root': {
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                            py: 1.5, // Match body row padding
                                            height: '56px', // Set consistent height for header cells
                                            lineHeight: '1.2', // Improve text alignment
                                            verticalAlign: 'middle', // Center align vertically
                                        },
                                        // Specific styles for grouped header rows
                                        '&:first-of-type': {
                                            '& .MuiTableCell-root': {
                                                borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                                            },
                                        },
                                        '&:last-of-type': {
                                            '& .MuiTableCell-root': {
                                                borderBottom: `2px solid ${theme.palette.primary.main}`,
                                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                            },
                                        },
                                    },
                                },
                                '& .MuiTableBody-root': {
                                    '& .MuiTableRow-root': {
                                        height: '56px', // Set consistent height for all body rows
                                        '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                        },
                                        '&:nth-of-type(even)': {
                                            bgcolor: alpha(theme.palette.grey[500], 0.02),
                                        },
                                        '& .MuiTableCell-root': {
                                            py: 1.5, // Default padding for all body cells
                                            height: '56px',
                                            verticalAlign: 'middle',
                                        },
                                    },
                                },
                            },
                        }}
                        muiTableBodyRowProps={({ row }) => ({
                            sx: {
                                minHeight: '56px', // Set consistent minimum height for all body rows
                                ...(row.original?.is_header && {
                                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        py: 1.5,
                                        height: '56px',
                                        verticalAlign: 'middle',
                                    },
                                }),
                                ...(row.original?.level === 0 && {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                        py: 1.5, // Changed from py: 2 to match header rows
                                        height: '56px',
                                        verticalAlign: 'middle',
                                    },
                                }),
                                ...(row.original?.level === 1 && {
                                    bgcolor: alpha(theme.palette.secondary.main, 0.04),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.secondary.main, 0.08),
                                    },
                                    '& .MuiTableCell-root': {
                                        py: 1.5,
                                        height: '56px',
                                        verticalAlign: 'middle',
                                    },
                                }),
                                // Default styles for regular rows (level 2 and above)
                                ...(!row.original?.is_header && row.original?.level > 1 && {
                                    '& .MuiTableCell-root': {
                                        py: 1.5,
                                        height: '56px',
                                        verticalAlign: 'middle',
                                    },
                                }),
                            },
                        })}
                    />
                )}
            </Paper>
        </Container>
    );
};

export default TrailBalance;
