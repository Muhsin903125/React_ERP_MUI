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
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReportHeader from '../../../../components/ReportHeader';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import BalanceSheetPrint from './BalanceSheetPrint';
 
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
    
    if (isHeader && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0.00</Typography>;
    }
    
    const absValue = Math.abs(value)?.toFixed(2);
    const isPositive = value > 0;
    
    if (chipStyle) {
        return (
            <Chip
                label={absValue}
                size="small"
                color={isPositive ? 'success' : 'error'}
                variant="outlined"
                sx={{ fontWeight: 600, minWidth: 80 }}
            />
        );
    }
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={500}
            color={isPositive ? 'success.main' : 'error.main'}
        >
            {absValue}
        </Typography>
    );
};

// Column configurations for different report formats
const getColumns = (reportFormat, asOfDate) => {
    const baseColumns = [
        {
            accessorKey: 'ac_desc',
            header: 'Account Details',
            size: 400,
            Cell: AccountDescCell,
        }
    ];

    switch (reportFormat) {
        case 'detailed':
            return [
                ...baseColumns,
                {
                    accessorKey: 'ac_code',
                    header: 'Code', 
                    size: 120,
                    Cell: AccountCodeCell,
                },
                {
                    accessorKey: 'current_balance',
                    header: `Balance as of ${moment(asOfDate).format('DD MMM YYYY')}`,
                    size: 180,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'previous_balance',
                    header: `Previous Year Balance`,
                    size: 180,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'variance',
                    header: 'Change',
                    size: 120,
                    Cell: ({ cell, row }) => {
                        const current = row.original?.current_balance || 0;
                        const previous = row.original?.previous_balance || 0;
                        const variance = current - previous;
                        return AmountCell({ cell: { getValue: () => variance }, row, showSign: true });
                    },
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];

        case 'summary':
            return [
                ...baseColumns,
                {
                    accessorKey: 'current_balance',
                    header: `Amount as of ${moment(asOfDate).format('DD MMM YYYY')}`,
                    size: 200,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false, chipStyle: true }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];

        case 'comparative':
            return [
                ...baseColumns,
                {
                    accessorKey: 'current_year',
                    header: `${moment(asOfDate).format('YYYY')}`,
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'previous_year',
                    header: `${moment(asOfDate).subtract(1, 'year').format('YYYY')}`,
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'variance_percent',
                    header: 'Change %',
                    size: 120,
                    Cell: ({ cell, row }) => {
                        const current = row.original?.current_year || 0;
                        const previous = row.original?.previous_year || 0;
                        const variancePercent = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0;
                        return (
                            <Typography 
                                variant="body2" 
                                fontWeight={500}
                                color={variancePercent > 0 ? 'success.main' : 'error.main'}
                            >
                                {variancePercent.toFixed(1)}%
                            </Typography>
                        );
                    },
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];

        default:
            return baseColumns;
    }
};

// Report format types for Balance Sheet
const reportFormats = [
    { value: 'summary', label: 'Summary Format' },
    { value: 'detailed', label: 'Detailed Format' },
    { value: 'comparative', label: 'Comparative Format' }
];

// Demo data for Balance Sheet testing - Assets, Liabilities, and Equity
const demoData = [
    // ASSETS SECTION
    {
        ac_code: 'ASSETS',
        ac_desc: 'ASSETS',
        account_type: 'Assets',
        is_header: true,
        level: 0,
        current_balance: 0,
        previous_balance: 0,
        current_year: 0,
        previous_year: 0
    },
    
    // Current Assets
    {
        ac_code: 'CURRENT_ASSETS',
        ac_desc: 'CURRENT ASSETS',
        account_type: 'Assets',
        is_header: true,
        level: 1,
        current_balance: 0,
        previous_balance: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '1001',
        ac_desc: 'Cash and Cash Equivalents',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        current_balance: 125000.00,
        previous_balance: 95000.00,
        current_year: 125000.00,
        previous_year: 95000.00
    },
    {
        ac_code: '1002',
        ac_desc: 'Accounts Receivable',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        current_balance: 85000.00,
        previous_balance: 72000.00,
        current_year: 85000.00,
        previous_year: 72000.00
    },
    {
        ac_code: '1003',
        ac_desc: 'Inventory',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        current_balance: 150000.00,
        previous_balance: 135000.00,
        current_year: 150000.00,
        previous_year: 135000.00
    },
    {
        ac_code: '1004',
        ac_desc: 'Prepaid Expenses',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        current_balance: 15000.00,
        previous_balance: 12000.00,
        current_year: 15000.00,
        previous_year: 12000.00
    },
    {
        ac_code: 'TOTAL_CURRENT_ASSETS',
        ac_desc: 'TOTAL CURRENT ASSETS',
        account_type: 'Assets',
        is_header: true,
        level: 1,
        current_balance: 375000.00,
        previous_balance: 314000.00,
        current_year: 375000.00,
        previous_year: 314000.00
    },
    
    // Non-Current Assets
    {
        ac_code: 'NON_CURRENT_ASSETS',
        ac_desc: 'NON-CURRENT ASSETS',
        account_type: 'Assets',
        is_header: true,
        level: 1,
        current_balance: 0,
        previous_balance: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '1101',
        ac_desc: 'Property, Plant & Equipment',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        current_balance: 450000.00,
        previous_balance: 380000.00,
        current_year: 450000.00,
        previous_year: 380000.00
    },
    {
        ac_code: '1102',
        ac_desc: 'Less: Accumulated Depreciation',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        current_balance: -85000.00,
        previous_balance: -62000.00,
        current_year: -85000.00,
        previous_year: -62000.00
    },
    {
        ac_code: '1103',
        ac_desc: 'Intangible Assets',
        account_type: 'Assets',
        is_header: false,
        level: 2,
        current_balance: 25000.00,
        previous_balance: 30000.00,
        current_year: 25000.00,
        previous_year: 30000.00
    },
    {
        ac_code: 'TOTAL_NON_CURRENT_ASSETS',
        ac_desc: 'TOTAL NON-CURRENT ASSETS',
        account_type: 'Assets',
        is_header: true,
        level: 1,
        current_balance: 390000.00,
        previous_balance: 348000.00,
        current_year: 390000.00,
        previous_year: 348000.00
    },
    {
        ac_code: 'TOTAL_ASSETS',
        ac_desc: 'TOTAL ASSETS',
        account_type: 'Summary',
        is_header: true,
        level: 0,
        current_balance: 765000.00,
        previous_balance: 662000.00,
        current_year: 765000.00,
        previous_year: 662000.00
    },
    
    // LIABILITIES AND EQUITY SECTION
    {
        ac_code: 'LIABILITIES_EQUITY',
        ac_desc: 'LIABILITIES AND EQUITY',
        account_type: 'Liabilities',
        is_header: true,
        level: 0,
        current_balance: 0,
        previous_balance: 0,
        current_year: 0,
        previous_year: 0
    },
    
    // Current Liabilities
    {
        ac_code: 'CURRENT_LIABILITIES',
        ac_desc: 'CURRENT LIABILITIES',
        account_type: 'Liabilities',
        is_header: true,
        level: 1,
        current_balance: 0,
        previous_balance: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '2001',
        ac_desc: 'Accounts Payable',
        account_type: 'Liabilities',
        is_header: false,
        level: 2,
        current_balance: 65000.00,
        previous_balance: 58000.00,
        current_year: 65000.00,
        previous_year: 58000.00
    },
    {
        ac_code: '2002',
        ac_desc: 'Short-term Loans',
        account_type: 'Liabilities',
        is_header: false,
        level: 2,
        current_balance: 40000.00,
        previous_balance: 35000.00,
        current_year: 40000.00,
        previous_year: 35000.00
    },
    {
        ac_code: '2003',
        ac_desc: 'Accrued Expenses',
        account_type: 'Liabilities',
        is_header: false,
        level: 2,
        current_balance: 22000.00,
        previous_balance: 18000.00,
        current_year: 22000.00,
        previous_year: 18000.00
    },
    {
        ac_code: 'TOTAL_CURRENT_LIABILITIES',
        ac_desc: 'TOTAL CURRENT LIABILITIES',
        account_type: 'Liabilities',
        is_header: true,
        level: 1,
        current_balance: 127000.00,
        previous_balance: 111000.00,
        current_year: 127000.00,
        previous_year: 111000.00
    },
    
    // Non-Current Liabilities
    {
        ac_code: 'NON_CURRENT_LIABILITIES',
        ac_desc: 'NON-CURRENT LIABILITIES',
        account_type: 'Liabilities',
        is_header: true,
        level: 1,
        current_balance: 0,
        previous_balance: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '2101',
        ac_desc: 'Long-term Debt',
        account_type: 'Liabilities',
        is_header: false,
        level: 2,
        current_balance: 180000.00,
        previous_balance: 200000.00,
        current_year: 180000.00,
        previous_year: 200000.00
    },
    {
        ac_code: '2102',
        ac_desc: 'Deferred Tax Liabilities',
        account_type: 'Liabilities',
        is_header: false,
        level: 2,
        current_balance: 15000.00,
        previous_balance: 12000.00,
        current_year: 15000.00,
        previous_year: 12000.00
    },
    {
        ac_code: 'TOTAL_NON_CURRENT_LIABILITIES',
        ac_desc: 'TOTAL NON-CURRENT LIABILITIES',
        account_type: 'Liabilities',
        is_header: true,
        level: 1,
        current_balance: 195000.00,
        previous_balance: 212000.00,
        current_year: 195000.00,
        previous_year: 212000.00
    },
    {
        ac_code: 'TOTAL_LIABILITIES',
        ac_desc: 'TOTAL LIABILITIES',
        account_type: 'Summary',
        is_header: true,
        level: 0,
        current_balance: 322000.00,
        previous_balance: 323000.00,
        current_year: 322000.00,
        previous_year: 323000.00
    },
    
    // EQUITY SECTION
    {
        ac_code: 'EQUITY',
        ac_desc: 'EQUITY',
        account_type: 'Equity',
        is_header: true,
        level: 1,
        current_balance: 0,
        previous_balance: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '3001',
        ac_desc: 'Share Capital',
        account_type: 'Equity',
        is_header: false,
        level: 2,
        current_balance: 300000.00,
        previous_balance: 250000.00,
        current_year: 300000.00,
        previous_year: 250000.00
    },
    {
        ac_code: '3002',
        ac_desc: 'Retained Earnings',
        account_type: 'Equity',
        is_header: false,
        level: 2,
        current_balance: 143000.00,
        previous_balance: 89000.00,
        current_year: 143000.00,
        previous_year: 89000.00
    },
    {
        ac_code: 'TOTAL_EQUITY',
        ac_desc: 'TOTAL EQUITY',
        account_type: 'Summary',
        is_header: true,
        level: 0,
        current_balance: 443000.00,
        previous_balance: 339000.00,
        current_year: 443000.00,
        previous_year: 339000.00
    },
    {
        ac_code: 'TOTAL_LIABILITIES_EQUITY',
        ac_desc: 'TOTAL LIABILITIES AND EQUITY',
        account_type: 'Summary',
        is_header: true,
        level: 0,
        current_balance: 765000.00,
        previous_balance: 662000.00,
        current_year: 765000.00,
        previous_year: 662000.00
    }
];

const BalanceSheet = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [asOfDate, setAsOfDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [reportFormat, setReportFormat] = useState(reportFormats[0].value); // Default to summary
    const [data, setData] = useState(demoData);
    const [errors, setErrors] = useState({
        reportFormat: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);

    const isFormValid = asOfDate && reportFormat;

    // Get dynamic columns based on report format
    const columns = getColumns(reportFormat, asOfDate);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showToast(`Balance Sheet generated successfully in ${reportFormats.find(f => f.value === reportFormat)?.label}`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading Balance Sheet data", "error");
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

    // Calculate Balance Sheet summary statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const totalAssets = data.find(item => item.ac_code === 'TOTAL_ASSETS')?.current_balance || 0;
        const totalLiabilities = data.find(item => item.ac_code === 'TOTAL_LIABILITIES')?.current_balance || 0;
        const totalEquity = data.find(item => item.ac_code === 'TOTAL_EQUITY')?.current_balance || 0;
        const currentAssets = data.find(item => item.ac_code === 'TOTAL_CURRENT_ASSETS')?.current_balance || 0;
        const currentLiabilities = data.find(item => item.ac_code === 'TOTAL_CURRENT_LIABILITIES')?.current_balance || 0;
        
        return {
            totalAssets,
            totalLiabilities,
            totalEquity,
            currentAssets,
            currentLiabilities,
            workingCapital: currentAssets - currentLiabilities,
            currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
            debtToEquityRatio: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
            equityRatio: totalAssets > 0 ? (totalEquity / totalAssets) * 100 : 0
        };
    })() : {
        totalAssets: 0,
        totalLiabilities: 0,
        totalEquity: 0,
        currentAssets: 0,
        currentLiabilities: 0,
        workingCapital: 0,
        currentRatio: 0,
        debtToEquityRatio: 0,
        equityRatio: 0
    };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            reportFormat: !reportFormat ? 'Report Format is required' : ''
        };
        setErrors(newErrors);

        if (isFormValid) {
            getReportData();
        }
    };

    const handleReset = () => {
        setAsOfDate(dayjs().format('YYYY-MM-DD'));
        setReportFormat(reportFormats[0].value); // Reset to summary
        setErrors({
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
                title="Balance Sheet"
                subtitle="Financial position and assets, liabilities, equity summary"
            />

            {/* Summary Cards - Balance Sheet Focused */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6} md={3}>
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
                                    <BusinessIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Assets
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalAssets?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
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
                                    <CreditCardIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Liabilities
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalLiabilities?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
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
                                        Total Equity
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalEquity?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${summary?.workingCapital >= 0 ? theme.palette.success.light : theme.palette.warning.light} 0%, ${summary?.workingCapital >= 0 ? theme.palette.success.main : theme.palette.warning.main} 100%)`,
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
                                        Working Capital
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.workingCapital?.toFixed(2) || '0.00'}`
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
                                label={`${Array.isArray(data) ? data.length : 0} line items`}
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
                        <Grid item xs={12} sm={6} md={4}>
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
                        <Grid item xs={12} sm={6} md={4}>
                            <DateSelector
                                label="As Of Date"
                                size="small"
                                value={asOfDate}
                                onChange={setAsOfDate}
                                error={touched && !asOfDate}
                                helperText={touched && !asOfDate ? 'As Of Date is required' : ''}
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
                                    {loader ? 'Loading...' : 'Generate'}
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
                                    <Skeleton variant="text" width={400} height={20} />
                                    <Skeleton variant="text" width={150} height={20} />
                                    <Skeleton variant="text" width={150} height={20} />
                                    <Skeleton variant="text" width={120} height={20} />
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                ) : !hasInitialLoad ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <BusinessIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Balance Sheet Report
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your filters and click generate to create the Balance Sheet
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
                            No financial data found for the selected date. Try adjusting your as-of date.
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
                        fileTitle={`Balance Sheet - ${reportFormats.find(f => f.value === reportFormat)?.label || 'Standard Format'}`}
                        printPreviewProps={{
                            title: `Balance Sheet`,
                            asOfDate: moment(asOfDate).format('DD-MM-YYYY'),
                            reportFormat: reportFormats.find(f => f.value === reportFormat)?.label || 'Standard Format',
                            columns, // Pass the dynamic columns
                            summary,
                        }}
                        PrintPreviewComponent={BalanceSheetPrint}
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
                                    bgcolor: row.original?.account_type === 'Summary' 
                                        ? alpha(theme.palette.success.main, 0.12)
                                        : row.original?.account_type === 'Assets'
                                        ? alpha(theme.palette.primary.main, 0.06)
                                        : row.original?.account_type === 'Liabilities'
                                        ? alpha(theme.palette.error.main, 0.06)
                                        : alpha(theme.palette.info.main, 0.06), // Equity
                                    '&:hover': {
                                        bgcolor: row.original?.account_type === 'Summary' 
                                            ? alpha(theme.palette.success.main, 0.16)
                                            : row.original?.account_type === 'Assets'
                                            ? alpha(theme.palette.primary.main, 0.1)
                                            : row.original?.account_type === 'Liabilities'
                                            ? alpha(theme.palette.error.main, 0.1)
                                            : alpha(theme.palette.info.main, 0.1), // Equity
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: row.original?.account_type === 'Summary' 
                                            ? `2px solid ${theme.palette.success.main}`
                                            : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                        py: 1.5,
                                        height: '56px',
                                        verticalAlign: 'middle',
                                    },
                                }),
                                ...(row.original?.level === 0 && {
                                    bgcolor: row.original?.account_type === 'Summary' 
                                        ? alpha(theme.palette.success.main, 0.15)
                                        : row.original?.account_type === 'Assets'
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : row.original?.account_type === 'Liabilities'
                                        ? alpha(theme.palette.error.main, 0.1)
                                        : alpha(theme.palette.info.main, 0.1), // Equity
                                    '&:hover': {
                                        bgcolor: row.original?.account_type === 'Summary' 
                                            ? alpha(theme.palette.success.main, 0.2)
                                            : row.original?.account_type === 'Assets'
                                            ? alpha(theme.palette.primary.main, 0.15)
                                            : row.original?.account_type === 'Liabilities'
                                            ? alpha(theme.palette.error.main, 0.15)
                                            : alpha(theme.palette.info.main, 0.15), // Equity
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: `2px solid ${row.original?.account_type === 'Summary' ? theme.palette.success.main : 
                                            row.original?.account_type === 'Assets' ? theme.palette.primary.main :
                                            row.original?.account_type === 'Liabilities' ? theme.palette.error.main :
                                            theme.palette.info.main}`,
                                        py: 1.5,
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

export default BalanceSheet;
