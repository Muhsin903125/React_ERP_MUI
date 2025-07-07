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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import ReportHeader from '../../../../components/ReportHeader';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import AgeingPrint from './AgeingPrint';
 
// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

// Common cell renderers
const CustomerCodeCell = ({ cell, row }) => {
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

const CustomerNameCell = ({ cell, row }) => {
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

const AmountCell = ({ cell, row, showSign = false, chipStyle = false, ageingBucket = null }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">-</Typography>;
    }
    
    const absValue = Math.abs(value)?.toFixed(2);
    
    // Color coding based on aging bucket
    let color = 'success.main';
    if (ageingBucket) {
        if (ageingBucket.includes('61-90') || ageingBucket.includes('91-120')) {
            color = 'warning.main';
        } else if (ageingBucket.includes('120+') || ageingBucket.includes('Over')) {
            color = 'error.main';
        } else if (ageingBucket.includes('31-60')) {
            color = 'info.main';
        }
    }
    
    if (chipStyle) {
        return (
            <Chip
                label={absValue}
                size="small"
                color={ageingBucket ? (
                    ageingBucket.includes('120+') ? 'error' : 
                    ageingBucket.includes('61-90') ? 'warning' : 
                    ageingBucket.includes('31-60') ? 'info' : 'success'
                ) : 'success'}
                variant="outlined"
                sx={{ fontWeight: 600, minWidth: 80 }}
            />
        );
    }
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={500}
            color={color}
        >
            {absValue}
        </Typography>
    );
};

// Column configurations for different report formats
const getColumns = (reportFormat, reportType, asOfDate, selectedPeriod = 'standard') => {
    const baseColumns = [
        {
            accessorKey: 'customer_name',
            header: reportType === 'customer' ? 'Customer Details' : 'Supplier Details',
            size: 300,
            Cell: CustomerNameCell,
        },
        {
            accessorKey: 'customer_code',
            header: 'Code', 
            size: 120,
            Cell: CustomerCodeCell,
        }
    ];

    // Get the selected period configuration
    const periodConfig = periodOptions.find(p => p.value === selectedPeriod) || periodOptions[0];

    switch (reportFormat) {
        case 'detailed': {
            // Generate dynamic columns based on selected period
            const dynamicColumns = periodConfig.buckets.map((bucket, index) => ({
                accessorKey: bucket.key,
                header: bucket.label,
                size: 130,
                Cell: ({ cell, row }) => AmountCell({ 
                    cell, 
                    row, 
                    ageingBucket: bucket.key === 'current' ? 'Current' : 
                                 index === periodConfig.buckets.length - 1 ? '120+' : 
                                 bucket.label.includes('60') || bucket.label.includes('90') ? '61-90' : 
                                 '31-60'
                }),
                muiTableBodyCellProps: { align: 'right' }, 
                headerProps: { align: 'right' }
            }));

            return [
                ...baseColumns,
                ...dynamicColumns,
                {
                    accessorKey: 'total_outstanding',
                    header: 'Total Outstanding',
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, chipStyle: true }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];
        }

        case 'summary':
            return [
                ...baseColumns,
                {
                    accessorKey: 'total_outstanding',
                    header: `Total Outstanding as of ${moment(asOfDate).format('DD MMM YYYY')}`,
                    size: 200,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, chipStyle: true }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'overdue_amount',
                    header: 'Overdue Amount',
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, ageingBucket: 'Over' }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'days_overdue',
                    header: 'Max Days Overdue',
                    size: 130,
                    Cell: ({ cell, row }) => {
                        const days = cell.getValue();
                        if (!days || days === 0) return <Typography variant="body2" color="text.secondary">-</Typography>;
                        
                        let color = 'success.main';
                        if (days > 120) color = 'error.main';
                        else if (days > 60) color = 'warning.main';
                        else if (days > 30) color = 'info.main';
                        
                        return (
                            <Typography variant="body2" fontWeight={500} color={color}>
                                {days} days
                            </Typography>
                        );
                    },
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];

        case 'overdue_only':
            return [
                ...baseColumns,
                {
                    accessorKey: 'overdue_amount',
                    header: 'Overdue Amount',
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, ageingBucket: 'Over', chipStyle: true }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'days_overdue',
                    header: 'Days Overdue',
                    size: 120,
                    Cell: ({ cell, row }) => {
                        const days = cell.getValue();
                        if (!days || days === 0) return <Typography variant="body2" color="text.secondary">-</Typography>;
                        
                        return (
                            <Chip
                                label={`${days} days`}
                                size="small"
                                color={days > 120 ? 'error' : days > 60 ? 'warning' : 'info'}
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                            />
                        );
                    },
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'last_payment_date',
                    header: 'Last Payment',
                    size: 130,
                    Cell: ({ cell, row }) => {
                        const date = cell.getValue();
                        if (!date) return <Typography variant="body2" color="text.secondary">-</Typography>;
                        
                        return (
                            <Typography variant="body2" fontWeight={400}>
                                {moment(date).format('DD-MM-YYYY')}
                            </Typography>
                        );
                    },
                    muiTableBodyCellProps: { align: 'center' }, 
                    headerProps: { align: 'center' }
                }
            ];

        default:
            return baseColumns;
    }
};

// Report format types for Ageing
const reportFormats = [
    { value: 'detailed', label: 'Detailed Aging Buckets' },
    { value: 'summary', label: 'Summary Format' },
    { value: 'overdue_only', label: 'Overdue Only' }
];

// Report types
const reportTypes = [
    { value: 'customer', label: 'Customer Aging (Receivables)' },
    { value: 'supplier', label: 'Supplier Aging (Payables)' }
];

// Period selection options for aging buckets
const periodOptions = [
    { 
        value: 'standard', 
        label: 'Standard (30-60-90-120+ days)',
        buckets: [
            { key: 'current', label: 'Current (0-30 days)', days: 30 },
            { key: 'days_31_60', label: '31-60 days', days: 60 },
            { key: 'days_61_90', label: '61-90 days', days: 90 },
            { key: 'days_91_120', label: '91-120 days', days: 120 },
            { key: 'days_120_plus', label: 'Over 120 days', days: 999 }
        ]
    },
    { 
        value: 'weekly', 
        label: 'Weekly (7-14-21-28+ days)',
        buckets: [
            { key: 'current', label: 'Current (0-7 days)', days: 7 },
            { key: 'days_8_14', label: '8-14 days', days: 14 },
            { key: 'days_15_21', label: '15-21 days', days: 21 },
            { key: 'days_22_28', label: '22-28 days', days: 28 },
            { key: 'days_28_plus', label: 'Over 28 days', days: 999 }
        ]
    },
    { 
        value: 'quarterly', 
        label: 'Quarterly (90-180-270-360+ days)',
        buckets: [
            { key: 'current', label: 'Current (0-90 days)', days: 90 },
            { key: 'days_91_180', label: '91-180 days', days: 180 },
            { key: 'days_181_270', label: '181-270 days', days: 270 },
            { key: 'days_271_360', label: '271-360 days', days: 360 },
            { key: 'days_360_plus', label: 'Over 360 days', days: 999 }
        ]
    },
    { 
        value: 'custom', 
        label: 'Custom (15-30-45-60+ days)',
        buckets: [
            { key: 'current', label: 'Current (0-15 days)', days: 15 },
            { key: 'days_16_30', label: '16-30 days', days: 30 },
            { key: 'days_31_45', label: '31-45 days', days: 45 },
            { key: 'days_46_60', label: '46-60 days', days: 60 },
            { key: 'days_60_plus', label: 'Over 60 days', days: 999 }
        ]
    }
];

// Demo data for Ageing testing
const generateDemoData = (reportType, selectedPeriod) => {
    const periodConfig = periodOptions.find(p => p.value === selectedPeriod) || periodOptions[0];
    
    if (reportType === 'customer') {
        // Generate customer demo data with dynamic period structure
        const baseCustomers = [
            {
                customer_code: 'CUST001',
                customer_name: 'ABC Trading LLC',
                customer_type: 'customer',
                is_header: false,
                level: 0,
                overdue_amount: 16000.00,
                days_overdue: 95,
                last_payment_date: '2024-10-15'
            },
            {
                customer_code: 'CUST002',
                customer_name: 'XYZ Corporation',
                customer_type: 'customer',
                is_header: false,
                level: 0,
                overdue_amount: 15000.00,
                days_overdue: 145,
                last_payment_date: '2024-09-20'
            },
            {
                customer_code: 'CUST003',
                customer_name: 'Global Enterprises',
                customer_type: 'customer',
                is_header: false,
                level: 0,
                overdue_amount: 11000.00,
                days_overdue: 85,
                last_payment_date: '2024-11-01'
            },
            {
                customer_code: 'CUST004',
                customer_name: 'Tech Solutions Inc',
                customer_type: 'customer',
                is_header: false,
                level: 0,
                overdue_amount: 5000.00,
                days_overdue: 45,
                last_payment_date: '2024-11-20'
            },
            {
                customer_code: 'CUST005',
                customer_name: 'Prime Retail Group',
                customer_type: 'customer',
                is_header: false,
                level: 0,
                overdue_amount: 20000.00,
                days_overdue: 165,
                last_payment_date: '2024-08-10'
            }
        ];

        // Add dynamic aging buckets based on selected period
        const customersWithAging = baseCustomers.map((customer, index) => {
            const aging = {};
            let total = 0;
            
            // Generate amounts for each bucket
            periodConfig.buckets.forEach((bucket, bucketIndex) => {
                let amount = 0;
                if (bucketIndex === 0) { // Current bucket
                    amount = Math.random() * 25000;
                } else if (bucketIndex === periodConfig.buckets.length - 1) { // Last bucket
                    amount = Math.random() * 15000;
                } else {
                    amount = Math.random() * 10000;
                }
                aging[bucket.key] = Math.round(amount * 100) / 100;
                total += aging[bucket.key];
            });
            
            aging.total_outstanding = Math.round(total * 100) / 100;
            
            return {
                ...customer,
                ...aging
            };
        });

        // Calculate totals
        const totals = periodConfig.buckets.reduce((acc, bucket) => {
            acc[bucket.key] = customersWithAging.reduce((sum, customer) => sum + customer[bucket.key], 0);
            return acc;
        }, {});
        
        totals.total_outstanding = customersWithAging.reduce((sum, customer) => sum + customer.total_outstanding, 0);
        totals.overdue_amount = customersWithAging.reduce((sum, customer) => sum + customer.overdue_amount, 0);

        // Add summary row
        const summaryRow = {
            customer_code: 'TOTAL',
            customer_name: 'TOTAL RECEIVABLES',
            customer_type: 'summary',
            is_header: true,
            level: 0,
            days_overdue: 165,
            last_payment_date: null,
            ...totals
        };

        return [...customersWithAging, summaryRow];
    }
    
    // Supplier data with similar structure
    const baseSuppliers = [
        {
            customer_code: 'SUPP001',
            customer_name: 'Office Supplies Co',
            customer_type: 'supplier',
            is_header: false,
            level: 0,
            overdue_amount: 11000.00,
            days_overdue: 125,
            last_payment_date: '2024-10-05'
        },
        {
            customer_code: 'SUPP002',
            customer_name: 'Manufacturing Parts Ltd',
            customer_type: 'supplier',
            is_header: false,
            level: 0,
            overdue_amount: 8000.00,
            days_overdue: 55,
            last_payment_date: '2024-11-15'
        }
    ];

    const suppliersWithAging = baseSuppliers.map((supplier, index) => {
        const aging = {};
        let total = 0;
        
        periodConfig.buckets.forEach((bucket, bucketIndex) => {
            let amount = 0;
            if (bucketIndex === 0) { // Current bucket
                amount = Math.random() * 20000;
            } else if (bucketIndex === periodConfig.buckets.length - 1) { // Last bucket
                amount = Math.random() * 5000;
            } else {
                amount = Math.random() * 8000;
            }
            aging[bucket.key] = Math.round(amount * 100) / 100;
            total += aging[bucket.key];
        });
        
        aging.total_outstanding = Math.round(total * 100) / 100;
        
        return {
            ...supplier,
            ...aging
        };
    });

    // Calculate supplier totals
    const supplierTotals = periodConfig.buckets.reduce((acc, bucket) => {
        acc[bucket.key] = suppliersWithAging.reduce((sum, supplier) => sum + supplier[bucket.key], 0);
        return acc;
    }, {});
    
    supplierTotals.total_outstanding = suppliersWithAging.reduce((sum, supplier) => sum + supplier.total_outstanding, 0);
    supplierTotals.overdue_amount = suppliersWithAging.reduce((sum, supplier) => sum + supplier.overdue_amount, 0);

    const supplierSummaryRow = {
        customer_code: 'TOTAL',
        customer_name: 'TOTAL PAYABLES',
        customer_type: 'summary',
        is_header: true,
        level: 0,
        days_overdue: 125,
        last_payment_date: null,
        ...supplierTotals
    };

    return [...suppliersWithAging, supplierSummaryRow];
};

// Legacy demo data for backward compatibility
const demoData = [
    // Customer Ageing - Receivables
    {
        customer_code: 'CUST001',
        customer_name: 'ABC Trading LLC',
        customer_type: 'customer',
        is_header: false,
        level: 0,
        current: 15000.00,
        days_31_60: 8000.00,
        days_61_90: 5000.00,
        days_91_120: 2000.00,
        days_120_plus: 1000.00,
        total_outstanding: 31000.00,
        overdue_amount: 16000.00,
        days_overdue: 95,
        last_payment_date: '2024-10-15'
    },
    {
        customer_code: 'CUST002',
        customer_name: 'XYZ Corporation',
        customer_type: 'customer',
        is_header: false,
        level: 0,
        current: 25000.00,
        days_31_60: 12000.00,
        days_61_90: 0.00,
        days_91_120: 0.00,
        days_120_plus: 3000.00,
        total_outstanding: 40000.00,
        overdue_amount: 15000.00,
        days_overdue: 145,
        last_payment_date: '2024-09-20'
    },
    {
        customer_code: 'CUST003',
        customer_name: 'Global Enterprises',
        customer_type: 'customer',
        is_header: false,
        level: 0,
        current: 18000.00,
        days_31_60: 0.00,
        days_61_90: 7000.00,
        days_91_120: 4000.00,
        days_120_plus: 0.00,
        total_outstanding: 29000.00,
        overdue_amount: 11000.00,
        days_overdue: 85,
        last_payment_date: '2024-11-01'
    },
    {
        customer_code: 'CUST004',
        customer_name: 'Tech Solutions Inc',
        customer_type: 'customer',
        is_header: false,
        level: 0,
        current: 22000.00,
        days_31_60: 5000.00,
        days_61_90: 0.00,
        days_91_120: 0.00,
        days_120_plus: 0.00,
        total_outstanding: 27000.00,
        overdue_amount: 5000.00,
        days_overdue: 45,
        last_payment_date: '2024-11-20'
    },
    {
        customer_code: 'CUST005',
        customer_name: 'Prime Retail Group',
        customer_type: 'customer',
        is_header: false,
        level: 0,
        current: 0.00,
        days_31_60: 0.00,
        days_61_90: 0.00,
        days_91_120: 8000.00,
        days_120_plus: 12000.00,
        total_outstanding: 20000.00,
        overdue_amount: 20000.00,
        days_overdue: 165,
        last_payment_date: '2024-08-10'
    },
    
    // Summary/Total Row
    {
        customer_code: 'TOTAL',
        customer_name: 'TOTAL RECEIVABLES',
        customer_type: 'summary',
        is_header: true,
        level: 0,
        current: 80000.00,
        days_31_60: 25000.00,
        days_61_90: 12000.00,
        days_91_120: 14000.00,
        days_120_plus: 16000.00,
        total_outstanding: 147000.00,
        overdue_amount: 67000.00,
        days_overdue: 165,
        last_payment_date: null
    }
];

// Demo supplier data
const supplierDemoData = [
    {
        customer_code: 'SUPP001',
        customer_name: 'Office Supplies Co',
        customer_type: 'supplier',
        is_header: false,
        level: 0,
        current: 12000.00,
        days_31_60: 6000.00,
        days_61_90: 3000.00,
        days_91_120: 0.00,
        days_120_plus: 2000.00,
        total_outstanding: 23000.00,
        overdue_amount: 11000.00,
        days_overdue: 125,
        last_payment_date: '2024-10-05'
    },
    {
        customer_code: 'SUPP002',
        customer_name: 'Manufacturing Parts Ltd',
        customer_type: 'supplier',
        is_header: false,
        level: 0,
        current: 35000.00,
        days_31_60: 8000.00,
        days_61_90: 0.00,
        days_91_120: 0.00,
        days_120_plus: 0.00,
        total_outstanding: 43000.00,
        overdue_amount: 8000.00,
        days_overdue: 55,
        last_payment_date: '2024-11-15'
    },
    {
        customer_code: 'TOTAL',
        customer_name: 'TOTAL PAYABLES',
        customer_type: 'summary',
        is_header: true,
        level: 0,
        current: 47000.00,
        days_31_60: 14000.00,
        days_61_90: 3000.00,
        days_91_120: 0.00,
        days_120_plus: 2000.00,
        total_outstanding: 66000.00,
        overdue_amount: 19000.00,
        days_overdue: 125,
        last_payment_date: null
    }
];

const Ageing = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [asOfDate, setAsOfDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [reportFormat, setReportFormat] = useState(reportFormats[0].value); // Default to detailed
    const [reportType, setReportType] = useState(reportTypes[0].value); // Default to customer
    const [selectedPeriod, setSelectedPeriod] = useState(periodOptions[0].value); // Default to standard
    const [data, setData] = useState(demoData);
    const [errors, setErrors] = useState({
        reportFormat: '',
        reportType: '',
        selectedPeriod: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);

    const isFormValid = asOfDate && reportFormat && reportType && selectedPeriod;

    // Get dynamic columns based on report format and selected period
    const columns = getColumns(reportFormat, reportType, asOfDate, selectedPeriod);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Generate demo data based on report type and selected period
            const reportData = generateDemoData(reportType, selectedPeriod);
            
            showToast(`${reportTypes.find(f => f.value === reportType)?.label} generated successfully with ${periodOptions.find(p => p.value === selectedPeriod)?.label}`, "success");
            setData(reportData);
        } catch (error) {
            showToast("Error loading Ageing data", "error");
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

    // Update data when report type or period changes
    useEffect(() => {
        if (hasInitialLoad) {
            const reportData = generateDemoData(reportType, selectedPeriod);
            setData(reportData);
        }
    }, [reportType, selectedPeriod, hasInitialLoad]);

    // Calculate Ageing summary statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const totalRow = data.find(item => item.customer_type === 'summary');
        if (!totalRow) return {
            totalOutstanding: 0,
            overdueAmount: 0,
            currentAmount: 0,
            overduePercentage: 0,
            customersCount: 0,
            overdueCustomersCount: 0
        };
        
        const overdueCustomersCount = data.filter(item => 
            item.customer_type !== 'summary' && 
            item.overdue_amount > 0
        ).length;
        
        const customersCount = data.filter(item => item.customer_type !== 'summary').length;
        
        return {
            totalOutstanding: totalRow.total_outstanding || 0,
            overdueAmount: totalRow.overdue_amount || 0,
            currentAmount: totalRow.current || 0,
            overduePercentage: totalRow.total_outstanding > 0 ? 
                (totalRow.overdue_amount / totalRow.total_outstanding) * 100 : 0,
            customersCount,
            overdueCustomersCount,
            avgDaysOverdue: Math.round(
                data.filter(item => item.customer_type !== 'summary' && item.days_overdue > 0)
                    .reduce((acc, item) => acc + item.days_overdue, 0) / 
                Math.max(overdueCustomersCount, 1)
            )
        };
    })() : {
        totalOutstanding: 0,
        overdueAmount: 0,
        currentAmount: 0,
        overduePercentage: 0,
        customersCount: 0,
        overdueCustomersCount: 0,
        avgDaysOverdue: 0
    };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            reportFormat: !reportFormat ? 'Report Format is required' : '',
            reportType: !reportType ? 'Report Type is required' : '',
            selectedPeriod: !selectedPeriod ? 'Period Selection is required' : ''
        };
        setErrors(newErrors);

        if (isFormValid) {
            getReportData();
        }
    };

    const handleReset = () => {
        setAsOfDate(dayjs().format('YYYY-MM-DD'));
        setReportFormat(reportFormats[0].value); // Reset to detailed
        setReportType(reportTypes[0].value); // Reset to customer
        setSelectedPeriod(periodOptions[0].value); // Reset to standard
        setErrors({
            reportFormat: '',
            reportType: '',
            selectedPeriod: ''
        });
        setTouched(false);
        setData(generateDemoData(reportTypes[0].value, periodOptions[0].value)); // Reset to demo data with default period
        setHasInitialLoad(true); // Mark as loaded
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Ageing Analysis Report"
                subtitle="Outstanding receivables and payables aging analysis"
            />

            {/* Summary Cards - Ageing Focused */}
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6} md={3}>
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
                                    <AccountBalanceIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Outstanding
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalOutstanding?.toFixed(2) || '0.00'}`
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
                                    <WarningIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Overdue Amount
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.overdueAmount?.toFixed(2) || '0.00'}` 
                                        )}
                                        <Typography variant="caption" sx={{ml: 0.5, opacity: 0.8, fontSize: '0.65rem' }}>
                                        ({summary?.overduePercentage?.toFixed(1) || '0.0'}%)
                                    </Typography>
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
                                        Current (0-30 days)
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.currentAmount?.toFixed(2) || '0.00'}`
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
                                    <PeopleIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Overdue Accounts
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.overdueCustomersCount || 0}/${summary?.customersCount || 0}`
                                        )}
                                        <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.8, fontSize: '0.65rem' }}>
                                            Avg: {summary?.avgDaysOverdue || 0} days
                                        </Typography>
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
                                label={`${Array.isArray(data) ? data.filter(item => item.customer_type !== 'summary').length : 0} accounts`}
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
                        <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    size="small"
                                    options={reportTypes}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={reportTypes.find(f => f.value === reportType) || null}
                                    onChange={(_, newValue) => {
                                        setReportType(newValue?.value || '');
                                        setErrors(prev => ({ ...prev, reportType: '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Report Type"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.reportType)}
                                            helperText={errors.reportType}
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
                        <Grid item xs={12} sm={6} md={2.5}>
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
                        <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    size="small"
                                    options={periodOptions}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={periodOptions.find(p => p.value === selectedPeriod) || null}
                                    onChange={(_, newValue) => {
                                        setSelectedPeriod(newValue?.value || '');
                                        setErrors(prev => ({ ...prev, selectedPeriod: '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Aging Periods"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.selectedPeriod)}
                                            helperText={errors.selectedPeriod}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props} sx={{ borderRadius: 1 }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={500}>
                                                    {option.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {option.buckets.map(b => b.label.split(' ')[0]).join(' • ')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <DateSelector
                                label="As Of Date"
                                size="small"
                                value={asOfDate}
                                onChange={setAsOfDate}
                                error={touched && !asOfDate}
                                helperText={touched && !asOfDate ? 'As Of Date is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Stack direction="row" spacing={1} sx={{ height: '100%', alignItems: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={handleReset}
                                    disabled={loader}
                                    sx={{ 
                                        borderRadius: 2,
                                        minWidth: 60,
                                        height: 40
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
                                        height: 40
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
                                    <Skeleton variant="text" width={300} height={20} />
                                    <Skeleton variant="text" width={120} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={150} height={20} />
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                ) : !hasInitialLoad ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <AccessTimeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Ageing Analysis
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your filters and click generate to create the ageing report
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
                            No outstanding amounts found for the selected criteria.
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
                        fileTitle={`${reportTypes.find(f => f.value === reportType)?.label} - ${reportFormats.find(f => f.value === reportFormat)?.label}`}
                        printPreviewProps={{
                            title: `${reportTypes.find(f => f.value === reportType)?.label}`,
                            asOfDate: moment(asOfDate).format('DD-MM-YYYY'),
                            reportFormat: reportFormats.find(f => f.value === reportFormat)?.label || 'Standard Format',
                            reportType: reportTypes.find(f => f.value === reportType)?.label || 'Customer Aging',
                            selectedPeriod: periodOptions.find(p => p.value === selectedPeriod)?.label || 'Standard Periods',
                            columns, // Pass the dynamic columns
                            summary,
                        }}
                        PrintPreviewComponent={AgeingPrint}
                        muiTableProps={{
                            sx: {
                                '& .MuiTableHead-root': {
                                    '& .MuiTableRow-root': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        '& .MuiTableCell-root': {
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                            borderBottom: `2px solid ${theme.palette.primary.main}`,
                                            py: 2,
                                            px: 2,
                                            fontSize: '0.875rem',
                                            lineHeight: 1.4,
                                            verticalAlign: 'middle',
                                            minHeight: '56px',
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
                                        '& .MuiTableCell-root': {
                                            py: 2,
                                            px: 2,
                                            verticalAlign: 'middle',
                                            minHeight: '56px',
                                            fontSize: '0.875rem',
                                        },
                                    },
                                },
                            },
                        }}
                        muiTableBodyRowProps={({ row }) => ({
                            sx: {
                                ...(row.original?.is_header && {
                                    bgcolor: row.original?.customer_type === 'summary' 
                                        ? alpha(theme.palette.info.main, 0.12)
                                        : alpha(theme.palette.primary.main, 0.06),
                                    '&:hover': {
                                        bgcolor: row.original?.customer_type === 'summary' 
                                            ? alpha(theme.palette.info.main, 0.16)
                                            : alpha(theme.palette.primary.main, 0.1),
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: row.original?.customer_type === 'summary' 
                                            ? `3px solid ${theme.palette.info.main}`
                                            : `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                                        py: 2.5,
                                        px: 2,
                                        verticalAlign: 'middle',
                                        minHeight: '64px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        backgroundColor: row.original?.customer_type === 'summary' 
                                            ? alpha(theme.palette.info.main, 0.08)
                                            : alpha(theme.palette.primary.main, 0.04),
                                    },
                                }),
                                // Color coding based on overdue status
                                ...(!row.original?.is_header && row.original?.days_overdue > 120 && {
                                    bgcolor: alpha(theme.palette.error.main, 0.05),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                    },
                                    '& .MuiTableCell-root': {
                                        py: 2,
                                        px: 2,
                                        minHeight: '56px',
                                    },
                                }),
                                ...(!row.original?.is_header && row.original?.days_overdue > 60 && row.original?.days_overdue <= 120 && {
                                    bgcolor: alpha(theme.palette.warning.main, 0.05),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    },
                                    '& .MuiTableCell-root': {
                                        py: 2,
                                        px: 2,
                                        minHeight: '56px',
                                    },
                                }),
                                ...(!row.original?.is_header && row.original?.days_overdue > 30 && row.original?.days_overdue <= 60 && {
                                    bgcolor: alpha(theme.palette.info.main, 0.05),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.info.main, 0.1),
                                    },
                                    '& .MuiTableCell-root': {
                                        py: 2,
                                        px: 2,
                                        minHeight: '56px',
                                    },
                                }),
                                // Default row styling for normal rows
                                ...(!row.original?.is_header && (!row.original?.days_overdue || row.original?.days_overdue <= 30) && {
                                    '& .MuiTableCell-root': {
                                        py: 2,
                                        px: 2,
                                        minHeight: '56px',
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

export default Ageing;
