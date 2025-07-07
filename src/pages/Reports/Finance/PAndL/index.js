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
import ReportHeader from '../../../../components/ReportHeader';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import PAndLPrint from './PAndLPrint';
 
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
    const isPositive = value > 0;
    
    if (chipStyle) {
        return (
            <Chip
                label={showSign ? (isPositive ? `${absValue}` : `(${absValue})`) : absValue}
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
            {showSign ? (isPositive ? `${absValue}` : `(${absValue})`) : absValue}
        </Typography>
    );
};

// Column configurations for different report formats
const getColumns = (reportFormat, fromDate, toDate) => {
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
                    accessorKey: 'current_period',
                    header: `Current Period ${moment(fromDate).format('MMM YYYY')} - ${moment(toDate).format('MMM YYYY')}`,
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'previous_period',
                    header: `Previous Period`,
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'variance',
                    header: 'Variance',
                    size: 120,
                    Cell: ({ cell, row }) => {
                        const current = row.original?.current_period || 0;
                        const previous = row.original?.previous_period || 0;
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
                    accessorKey: 'current_period',
                    header: `Amount ${moment(fromDate).format('MMM YYYY')} - ${moment(toDate).format('MMM YYYY')}`,
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
                    header: `Current Year ${moment(toDate).format('YYYY')}`,
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'previous_year',
                    header: `Previous Year ${moment(toDate).subtract(1, 'year').format('YYYY')}`,
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'variance_percent',
                    header: 'Variance %',
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

// Report format types for P&L
const reportFormats = [
    { value: 'summary', label: 'Summary Format' },
    { value: 'detailed', label: 'Detailed Format' },
    { value: 'comparative', label: 'Comparative Format' }
];

// Demo data for P&L testing - Only Income and Expense accounts
const demoData = [
    // Revenue/Income Section
    {
        ac_code: 'REVENUE',
        ac_desc: 'REVENUE',
        account_type: 'Income',
        is_header: true,
        level: 0,
        current_period: 0,
        previous_period: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '4001',
        ac_desc: 'Sales Revenue',
        account_type: 'Income',
        is_header: false,
        level: 1,
        current_period: 150000.00,
        previous_period: 135000.00,
        current_year: 1800000.00,
        previous_year: 1620000.00
    },
    {
        ac_code: '4002',
        ac_desc: 'Service Income',
        account_type: 'Income',
        is_header: false,
        level: 1,
        current_period: 25000.00,
        previous_period: 22000.00,
        current_year: 300000.00,
        previous_year: 264000.00
    },
    {
        ac_code: '4003',
        ac_desc: 'Other Income',
        account_type: 'Income',
        is_header: false,
        level: 1,
        current_period: 5000.00,
        previous_period: 3000.00,
        current_year: 60000.00,
        previous_year: 36000.00
    },
    {
        ac_code: 'TOTAL_REVENUE',
        ac_desc: 'TOTAL REVENUE',
        account_type: 'Income',
        is_header: true,
        level: 0,
        current_period: 180000.00,
        previous_period: 160000.00,
        current_year: 2160000.00,
        previous_year: 1920000.00
    },
    
    // Cost of Sales Section
    {
        ac_code: 'COGS',
        ac_desc: 'COST OF GOODS SOLD',
        account_type: 'Expense',
        is_header: true,
        level: 0,
        current_period: 0,
        previous_period: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '5001',
        ac_desc: 'Cost of Goods Sold',
        account_type: 'Expense',
        is_header: false,
        level: 1,
        current_period: 90000.00,
        previous_period: 81000.00,
        current_year: 1080000.00,
        previous_year: 972000.00
    },
    {
        ac_code: '5002',
        ac_desc: 'Direct Labor',
        account_type: 'Expense',
        is_header: false,
        level: 1,
        current_period: 20000.00,
        previous_period: 18000.00,
        current_year: 240000.00,
        previous_year: 216000.00
    },
    {
        ac_code: 'TOTAL_COGS',
        ac_desc: 'TOTAL COST OF GOODS SOLD',
        account_type: 'Expense',
        is_header: true,
        level: 0,
        current_period: 110000.00,
        previous_period: 99000.00,
        current_year: 1320000.00,
        previous_year: 1188000.00
    },
    {
        ac_code: 'GROSS_PROFIT',
        ac_desc: 'GROSS PROFIT',
        account_type: 'Summary',
        is_header: true,
        level: 0,
        current_period: 70000.00,
        previous_period: 61000.00,
        current_year: 840000.00,
        previous_year: 732000.00
    },
    
    // Operating Expenses Section
    {
        ac_code: 'OPEX',
        ac_desc: 'OPERATING EXPENSES',
        account_type: 'Expense',
        is_header: true,
        level: 0,
        current_period: 0,
        previous_period: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '5100',
        ac_desc: 'Administrative Expenses',
        account_type: 'Expense',
        is_header: true,
        level: 1,
        current_period: 0,
        previous_period: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '5101',
        ac_desc: 'Office Rent',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        current_period: 12000.00,
        previous_period: 12000.00,
        current_year: 144000.00,
        previous_year: 144000.00
    },
    {
        ac_code: '5102',
        ac_desc: 'Salary Expense',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        current_period: 25000.00,
        previous_period: 23000.00,
        current_year: 300000.00,
        previous_year: 276000.00
    },
    {
        ac_code: '5103',
        ac_desc: 'Utilities Expense',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        current_period: 3500.00,
        previous_period: 3200.00,
        current_year: 42000.00,
        previous_year: 38400.00
    },
    {
        ac_code: '5200',
        ac_desc: 'Selling Expenses',
        account_type: 'Expense',
        is_header: true,
        level: 1,
        current_period: 0,
        previous_period: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '5201',
        ac_desc: 'Marketing Expense',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        current_period: 8000.00,
        previous_period: 7000.00,
        current_year: 96000.00,
        previous_year: 84000.00
    },
    {
        ac_code: '5202',
        ac_desc: 'Sales Commission',
        account_type: 'Expense',
        is_header: false,
        level: 2,
        current_period: 6000.00,
        previous_period: 5500.00,
        current_year: 72000.00,
        previous_year: 66000.00
    },
    {
        ac_code: 'TOTAL_OPEX',
        ac_desc: 'TOTAL OPERATING EXPENSES',
        account_type: 'Expense',
        is_header: true,
        level: 0,
        current_period: 54500.00,
        previous_period: 50700.00,
        current_year: 654000.00,
        previous_year: 608400.00
    },
    {
        ac_code: 'OPERATING_PROFIT',
        ac_desc: 'OPERATING PROFIT',
        account_type: 'Summary',
        is_header: true,
        level: 0,
        current_period: 15500.00,
        previous_period: 10300.00,
        current_year: 186000.00,
        previous_year: 123600.00
    },
    
    // Other Income/Expenses
    {
        ac_code: 'OTHER',
        ac_desc: 'OTHER INCOME/(EXPENSES)',
        account_type: 'Other',
        is_header: true,
        level: 0,
        current_period: 0,
        previous_period: 0,
        current_year: 0,
        previous_year: 0
    },
    {
        ac_code: '6001',
        ac_desc: 'Interest Income',
        account_type: 'Income',
        is_header: false,
        level: 1,
        current_period: 1200.00,
        previous_period: 1000.00,
        current_year: 14400.00,
        previous_year: 12000.00
    },
    {
        ac_code: '6002',
        ac_desc: 'Interest Expense',
        account_type: 'Expense',
        is_header: false,
        level: 1,
        current_period: 2000.00,
        previous_period: 1800.00,
        current_year: 24000.00,
        previous_year: 21600.00
    },
    {
        ac_code: 'NET_OTHER',
        ac_desc: 'NET OTHER INCOME/(EXPENSES)',
        account_type: 'Summary',
        is_header: true,
        level: 0,
        current_period: -800.00,
        previous_period: -800.00,
        current_year: -9600.00,
        previous_year: -9600.00
    },
    {
        ac_code: 'NET_PROFIT',
        ac_desc: 'NET PROFIT/(LOSS)',
        account_type: 'Summary',
        is_header: true,
        level: 0,
        current_period: 14700.00,
        previous_period: 9500.00,
        current_year: 176400.00,
        previous_year: 114000.00
    }
];

const PAndL = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [reportFormat, setReportFormat] = useState(reportFormats[0].value); // Default to summary
    const [data, setData] = useState(demoData);
    const [errors, setErrors] = useState({
        reportFormat: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);

    const isFormValid = fromDate && toDate && reportFormat;

    // Get dynamic columns based on report format
    const columns = getColumns(reportFormat, fromDate, toDate);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            showToast(`P&L Report generated successfully in ${reportFormats.find(f => f.value === reportFormat)?.label}`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading P&L data", "error");
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

    // Calculate P&L summary statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const totalRevenue = data.find(item => item.ac_code === 'TOTAL_REVENUE')?.current_period || 0;
        const totalCOGS = data.find(item => item.ac_code === 'TOTAL_COGS')?.current_period || 0;
        const grossProfit = data.find(item => item.ac_code === 'GROSS_PROFIT')?.current_period || 0;
        const totalOpex = data.find(item => item.ac_code === 'TOTAL_OPEX')?.current_period || 0;
        const operatingProfit = data.find(item => item.ac_code === 'OPERATING_PROFIT')?.current_period || 0;
        const netProfit = data.find(item => item.ac_code === 'NET_PROFIT')?.current_period || 0;
        
        return {
            totalRevenue,
            totalCOGS,
            grossProfit,
            totalOpex,
            operatingProfit,
            netProfit,
            grossMargin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0,
            operatingMargin: totalRevenue > 0 ? (operatingProfit / totalRevenue) * 100 : 0,
            netMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
        };
    })() : {
        totalRevenue: 0,
        totalCOGS: 0,
        grossProfit: 0,
        totalOpex: 0,
        operatingProfit: 0,
        netProfit: 0,
        grossMargin: 0,
        operatingMargin: 0,
        netMargin: 0
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
        setFromDate(dayjs().startOf('month').format('YYYY-MM-DD'));
        setToDate(dayjs().format('YYYY-MM-DD'));
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
                title="Profit & Loss Statement"
                subtitle="Income and expense summary for the selected period"
            />

            {/* Summary Cards - P&L Focused */}
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
                                    <TrendingUpIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Revenue
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalRevenue?.toFixed(2) || '0.00'}`
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
                            background: `linear-gradient(135deg, ${theme.palette.warning.light} 0%, ${theme.palette.warning.main} 100%)`,
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
                                        Gross Profit
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.grossProfit?.toFixed(2) || '0.00'}`
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
                                    <AssessmentIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Operating Profit
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.operatingProfit?.toFixed(2) || '0.00'}`
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
                            background: `linear-gradient(135deg, ${summary?.netProfit >= 0 ? theme.palette.success.light : theme.palette.error.light} 0%, ${summary?.netProfit >= 0 ? theme.palette.success.main : theme.palette.error.main} 100%)`,
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
                                        Net Profit
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.netProfit?.toFixed(2) || '0.00'}`
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
                        <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Profit & Loss Report
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your filters and click generate to create the P&L statement
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
                            No financial data found for the selected period. Try adjusting your date range.
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
                        fileTitle={`Profit and Loss Statement - ${reportFormats.find(f => f.value === reportFormat)?.label || 'Standard Format'}`}
                        printPreviewProps={{
                            title: `Profit & Loss Statement`,
                            dateRange: `${moment(fromDate).format('DD-MM-YYYY')} - ${moment(toDate).format('DD-MM-YYYY')}`,
                            reportFormat: reportFormats.find(f => f.value === reportFormat)?.label || 'Standard Format',
                            columns, // Pass the dynamic columns
                            fromDate,
                            toDate,
                            summary,
                        }}
                        PrintPreviewComponent={PAndLPrint}
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
                                        : alpha(theme.palette.primary.main, 0.06),
                                    '&:hover': {
                                        bgcolor: row.original?.account_type === 'Summary' 
                                            ? alpha(theme.palette.success.main, 0.16)
                                            : alpha(theme.palette.primary.main, 0.1),
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
                                        : alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': {
                                        bgcolor: row.original?.account_type === 'Summary' 
                                            ? alpha(theme.palette.success.main, 0.2)
                                            : alpha(theme.palette.primary.main, 0.15),
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: `2px solid ${row.original?.account_type === 'Summary' ? theme.palette.success.main : alpha(theme.palette.primary.main, 0.3)}`,
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

export default PAndL;
