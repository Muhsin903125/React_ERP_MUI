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
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import TimelineIcon from '@mui/icons-material/Timeline';
import WarningIcon from '@mui/icons-material/Warning';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import StockLedgerPrint from './StockLedgerPrint';

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

// Common cell renderers
const ProductCodeCell = ({ cell, row }) => {
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

const ProductNameCell = ({ cell, row }) => {
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

const TransactionTypeCell = ({ cell, row }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader) {
        return (
            <Typography variant="body2" fontWeight={700} color="text.primary">
                {value}
            </Typography>
        );
    }
    
    const getTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'receipt':
            case 'purchase':
            case 'production':
                return 'success';
            case 'issue':
            case 'sales':
            case 'consumption':
                return 'error';
            case 'transfer':
            case 'adjustment':
                return 'info';
            default:
                return 'default';
        }
    };
    
    return (
        <Chip
            label={value}
            size="small"
            color={getTypeColor(value)}
            variant="outlined"
            sx={{ fontWeight: 600, minWidth: 80 }}
        />
    );
};

const QuantityCell = ({ cell, row, transactionType = null }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0</Typography>;
    }
    
    // Determine color based on transaction type or sign
    let color = 'info';
    if (transactionType) {
        const txType = row.original?.transaction_type?.toLowerCase();
        if (txType === 'receipt' || txType === 'purchase' || txType === 'production') {
            color = 'success';
        } else if (txType === 'issue' || txType === 'sales' || txType === 'consumption') {
            color = 'error';
        }
    } else {
        color = value > 0 ? 'success' : value < 0 ? 'error' : 'info';
    }
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={500}
            color={`${color}.main`}
        >
            {Math.abs(value).toFixed(0)}
        </Typography>
    );
};

const BalanceCell = ({ cell, row }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0</Typography>;
    }
    
    const isLowStock = value <= (row.original?.reorder_level || 10);
    
    return (
        <Chip
            label={value?.toFixed(0)}
            size="small"
            color={isLowStock ? 'warning' : value > 100 ? 'success' : 'info'}
            variant={isLowStock ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, minWidth: 60 }}
            icon={isLowStock ? <WarningIcon fontSize="small" /> : null}
        />
    );
};

const ValueCell = ({ cell, row, showSign = false }) => {
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
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={500}
            color={isPositive ? 'success.main' : 'error.main'}
        >
            {showSign && isPositive ? '+' : ''}{absValue}
        </Typography>
    );
};

const DateTimeCell = ({ cell, row }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader || !value) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    return (
        <Stack spacing={0.5}>
            <Typography variant="body2" fontWeight={500}>
                {moment(value).format('DD-MM-YYYY')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {moment(value).format('HH:mm')}
            </Typography>
        </Stack>
    );
};

// Column configurations for different grouping types
const getColumns = (groupBy, showValues, includeBalances) => {
    const baseColumns = [];
    
    // Dynamic columns based on grouping
    if (groupBy === 'product') {
        baseColumns.push({
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 200,
            Cell: ProductNameCell,
        });
        baseColumns.push({
            accessorKey: 'product_code',
            header: 'Product Code', 
            size: 120,
            Cell: ProductCodeCell,
        });
    } else if (groupBy === 'location') {
        baseColumns.push({
            accessorKey: 'location_name',
            header: 'Location',
            size: 150,
            Cell: ProductNameCell,
        });
        baseColumns.push({
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 200,
            Cell: ProductNameCell,
        });
    } else if (groupBy === 'transaction') {
        baseColumns.push({
            accessorKey: 'transaction_date',
            header: 'Date & Time',
            size: 120,
            Cell: DateTimeCell,
        });
        baseColumns.push({
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 180,
            Cell: ProductNameCell,
        });
    }

    // Core ledger columns
    const coreColumns = [
        {
            accessorKey: 'transaction_type',
            header: 'Transaction Type',
            size: 130,
            Cell: TransactionTypeCell,
        },
        {
            accessorKey: 'reference_no',
            header: 'Reference',
            size: 120,
            Cell: ({ cell, row }) => (
                <Typography variant="body2" color="primary.main" fontWeight={500}>
                    {cell.getValue() || '-'}
                </Typography>
            ),
        },
        {
            accessorKey: 'in_quantity',
            header: 'In Qty',
            size: 80,
            Cell: ({ cell, row }) => QuantityCell({ cell, row, transactionType: 'in' }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'out_quantity',
            header: 'Out Qty',
            size: 80,
            Cell: ({ cell, row }) => QuantityCell({ cell, row, transactionType: 'out' }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        }
    ];

    // Add balance column if enabled
    if (includeBalances) {
        coreColumns.push({
            accessorKey: 'balance_quantity',
            header: 'Balance',
            size: 100,
            Cell: BalanceCell,
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        });
    }

    // Add value columns if enabled
    if (showValues) {
        coreColumns.push({
            accessorKey: 'unit_cost',
            header: 'Unit Cost',
            size: 100,
            Cell: ({ cell, row }) => ValueCell({ cell, row, showSign: false }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        });
        coreColumns.push({
            accessorKey: 'total_value',
            header: 'Total Value',
            size: 120,
            Cell: ({ cell, row }) => ValueCell({ cell, row, showSign: false }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        });
    }

    return [...baseColumns, ...coreColumns];
};

// Grouping options
const groupByOptions = [
    { value: 'product', label: 'By Product', icon: InventoryIcon },
    { value: 'location', label: 'By Location', icon: BusinessIcon },
    { value: 'transaction', label: 'By Transaction Date', icon: TimelineIcon }
];

// Product filter options (for demo)
const productOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'PRD001', label: 'Laptop Computer - Dell Inspiron' },
    { value: 'PRD002', label: 'Office Chair - Ergonomic Premium' },
    { value: 'PRD003', label: 'Printer - HP LaserJet Enterprise' },
    { value: 'PRD004', label: 'Desktop Computer - HP Elite' },
    { value: 'PRD005', label: 'Monitor - 24" LED Display' }
];

// Location filter options
const locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'WH001', label: 'Main Warehouse' },
    { value: 'WH002', label: 'Secondary Warehouse' },
    { value: 'ST001', label: 'Retail Store - Dubai' },
    { value: 'ST002', label: 'Retail Store - Abu Dhabi' }
];

// Demo data generator for Stock Ledger
const generateDemoData = (groupBy, productFilter, locationFilter, showValues, includeBalances) => {
    const baseData = [];
    
    if (groupBy === 'product') {
        const products = productFilter === 'all' ? [
            'Laptop Computer - Dell Inspiron',
            'Office Chair - Ergonomic Premium',
            'Printer - HP LaserJet Enterprise'
        ] : [productOptions.find(p => p.value === productFilter)?.label || 'Selected Product'];
        
        return products.flatMap((product, productIndex) => {
            const transactions = [
                {
                    product_name: product,
                    product_code: `PRD00${productIndex + 1}`,
                    is_header: false,
                    level: 0,
                    transaction_type: 'Receipt',
                    reference_no: `PO-2025-${1001 + productIndex}`,
                    transaction_date: '2025-07-01T09:30:00',
                    in_quantity: 100,
                    out_quantity: 0,
                    balance_quantity: 100,
                    unit_cost: 150.00 + (productIndex * 50),
                    total_value: (150.00 + (productIndex * 50)) * 100
                },
                {
                    product_name: product,
                    product_code: `PRD00${productIndex + 1}`,
                    is_header: false,
                    level: 0,
                    transaction_type: 'Sales',
                    reference_no: `SO-2025-${2001 + productIndex}`,
                    transaction_date: '2025-07-02T14:15:00',
                    in_quantity: 0,
                    out_quantity: 25,
                    balance_quantity: 75,
                    unit_cost: 150.00 + (productIndex * 50),
                    total_value: (150.00 + (productIndex * 50)) * 25
                },
                {
                    product_name: product,
                    product_code: `PRD00${productIndex + 1}`,
                    is_header: false,
                    level: 0,
                    transaction_type: 'Transfer',
                    reference_no: `TR-2025-${3001 + productIndex}`,
                    transaction_date: '2025-07-03T11:45:00',
                    in_quantity: 0,
                    out_quantity: 15,
                    balance_quantity: 60,
                    unit_cost: 150.00 + (productIndex * 50),
                    total_value: (150.00 + (productIndex * 50)) * 15
                },
                {
                    product_name: product,
                    product_code: `PRD00${productIndex + 1}`,
                    is_header: false,
                    level: 0,
                    transaction_type: 'Adjustment',
                    reference_no: `ADJ-2025-${4001 + productIndex}`,
                    transaction_date: '2025-07-05T16:20:00',
                    in_quantity: 5,
                    out_quantity: 0,
                    balance_quantity: 65,
                    unit_cost: 150.00 + (productIndex * 50),
                    total_value: (150.00 + (productIndex * 50)) * 5
                }
            ];
            
            // Add product summary row
            const totalIn = transactions.reduce((sum, t) => sum + t.in_quantity, 0);
            const totalOut = transactions.reduce((sum, t) => sum + t.out_quantity, 0);
            const finalBalance = transactions[transactions.length - 1].balance_quantity;
            
            transactions.push({
                product_name: `TOTAL - ${product}`,
                product_code: `PRD00${productIndex + 1}`,
                is_header: true,
                level: 0,
                transaction_type: 'SUMMARY',
                reference_no: '',
                transaction_date: null,
                in_quantity: totalIn,
                out_quantity: totalOut,
                balance_quantity: finalBalance,
                unit_cost: 150.00 + (productIndex * 50),
                total_value: (150.00 + (productIndex * 50)) * finalBalance
            });
            
            return transactions;
        });
    }
    
    if (groupBy === 'location') {
        const locations = locationFilter === 'all' ? [
            'Main Warehouse',
            'Secondary Warehouse',
            'Retail Store - Dubai'
        ] : [locationOptions.find(l => l.value === locationFilter)?.label || 'Selected Location'];
        
        return locations.flatMap((location, locationIndex) => [
            {
                location_name: location,
                product_name: 'Laptop Computer - Dell Inspiron',
                product_code: 'PRD001',
                is_header: false,
                level: 0,
                transaction_type: 'Receipt',
                reference_no: `PO-2025-${5001 + locationIndex}`,
                transaction_date: '2025-07-01T10:00:00',
                in_quantity: 50 + (locationIndex * 10),
                out_quantity: 0,
                balance_quantity: 50 + (locationIndex * 10),
                unit_cost: 1500.00,
                total_value: 1500.00 * (50 + (locationIndex * 10))
            },
            {
                location_name: location,
                product_name: 'Office Chair - Ergonomic Premium',
                product_code: 'PRD002',
                is_header: false,
                level: 0,
                transaction_type: 'Sales',
                reference_no: `SO-2025-${6001 + locationIndex}`,
                transaction_date: '2025-07-02T15:30:00',
                in_quantity: 0,
                out_quantity: 20 + (locationIndex * 5),
                balance_quantity: 30 + (locationIndex * 5),
                unit_cost: 200.00,
                total_value: 200.00 * (20 + (locationIndex * 5))
            }
        ]);
    }
    
    if (groupBy === 'transaction') {
        return [
            {
                transaction_date: '2025-07-01T09:30:00',
                product_name: 'Laptop Computer - Dell Inspiron',
                product_code: 'PRD001',
                is_header: false,
                level: 0,
                transaction_type: 'Receipt',
                reference_no: 'PO-2025-1001',
                in_quantity: 100,
                out_quantity: 0,
                balance_quantity: 100,
                unit_cost: 1500.00,
                total_value: 150000.00
            },
            {
                transaction_date: '2025-07-01T10:15:00',
                product_name: 'Office Chair - Ergonomic Premium',
                product_code: 'PRD002',
                is_header: false,
                level: 0,
                transaction_type: 'Receipt',
                reference_no: 'PO-2025-1002',
                in_quantity: 200,
                out_quantity: 0,
                balance_quantity: 200,
                unit_cost: 200.00,
                total_value: 40000.00
            },
            {
                transaction_date: '2025-07-02T14:15:00',
                product_name: 'Laptop Computer - Dell Inspiron',
                product_code: 'PRD001',
                is_header: false,
                level: 0,
                transaction_type: 'Sales',
                reference_no: 'SO-2025-2001',
                in_quantity: 0,
                out_quantity: 25,
                balance_quantity: 75,
                unit_cost: 1500.00,
                total_value: 37500.00
            },
            {
                transaction_date: '2025-07-02T15:30:00',
                product_name: 'Office Chair - Ergonomic Premium',
                product_code: 'PRD002',
                is_header: false,
                level: 0,
                transaction_type: 'Sales',
                reference_no: 'SO-2025-2002',
                in_quantity: 0,
                out_quantity: 50,
                balance_quantity: 150,
                unit_cost: 200.00,
                total_value: 10000.00
            },
            {
                transaction_date: '2025-07-03T11:45:00',
                product_name: 'Printer - HP LaserJet Enterprise',
                product_code: 'PRD003',
                is_header: false,
                level: 0,
                transaction_type: 'Transfer',
                reference_no: 'TR-2025-3001',
                in_quantity: 0,
                out_quantity: 10,
                balance_quantity: 40,
                unit_cost: 800.00,
                total_value: 8000.00
            },
            {
                transaction_date: '2025-07-05T16:20:00',
                product_name: 'Monitor - 24" LED Display',
                product_code: 'PRD005',
                is_header: false,
                level: 0,
                transaction_type: 'Adjustment',
                reference_no: 'ADJ-2025-4001',
                in_quantity: 15,
                out_quantity: 0,
                balance_quantity: 115,
                unit_cost: 300.00,
                total_value: 4500.00
            }
        ];
    }
    
    return [];
};

const StockLedger = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [groupBy, setGroupBy] = useState(groupByOptions[0].value); // Default to product
    const [productFilter, setProductFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [showValues, setShowValues] = useState(true);
    const [includeBalances, setIncludeBalances] = useState(true);
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState({
        groupBy: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const isFormValid = fromDate && toDate && groupBy;

    // Get dynamic columns based on grouping and options
    const columns = getColumns(groupBy, showValues, includeBalances);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const demoData = generateDemoData(groupBy, productFilter, locationFilter, showValues, includeBalances);
            showToast(`${groupByOptions.find(g => g.value === groupBy)?.label} ledger generated successfully`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading Stock Ledger data", "error");
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

    // Update data when grouping or filters change
    useEffect(() => {
        if (hasInitialLoad) {
            const demoData = generateDemoData(groupBy, productFilter, locationFilter, showValues, includeBalances);
            setData(demoData);
        }
    }, [groupBy, productFilter, locationFilter, showValues, includeBalances, hasInitialLoad]);

    // Calculate Stock Ledger statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const dataRows = data.filter(item => !item.is_header);
        
        return {
            totalTransactions: dataRows.length,
            totalInQuantity: dataRows.reduce((sum, item) => sum + (item.in_quantity || 0), 0),
            totalOutQuantity: dataRows.reduce((sum, item) => sum + (item.out_quantity || 0), 0),
            totalValue: dataRows.reduce((sum, item) => sum + (item.total_value || 0), 0),
            uniqueProducts: [...new Set(dataRows.map(item => item.product_code))].length,
            latestBalance: dataRows.length > 0 ? dataRows[dataRows.length - 1].balance_quantity || 0 : 0,
            receipts: dataRows.filter(item => item.transaction_type === 'Receipt').length,
            issues: dataRows.filter(item => item.transaction_type === 'Sales' || item.transaction_type === 'Issue').length
        };
    })() : {
        totalTransactions: 0,
        totalInQuantity: 0,
        totalOutQuantity: 0,
        totalValue: 0,
        uniqueProducts: 0,
        latestBalance: 0,
        receipts: 0,
        issues: 0
    };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            groupBy: !groupBy ? 'Group By is required' : ''
        };
        setErrors(newErrors);

        if (isFormValid) {
            getReportData();
        }
    };

    const handleReset = () => {
        setFromDate(dayjs().startOf('month').format('YYYY-MM-DD'));
        setToDate(dayjs().format('YYYY-MM-DD'));
        setGroupBy(groupByOptions[0].value); // Reset to product
        setProductFilter('all');
        setLocationFilter('all');
        setShowValues(true);
        setIncludeBalances(true);
        setErrors({
            groupBy: ''
        });
        setTouched(false);
        setData(generateDemoData(groupByOptions[0].value, 'all', 'all', true, true));
        setHasInitialLoad(true);
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Stock Ledger Report"
                subtitle="Complete inventory transaction history and movement tracking"
            />

            {/* Summary Cards - Inventory Movement Focused */}
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
                                    <ReceiptIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Transactions
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={40} height={16} />
                                        ) : (
                                            `${summary?.totalTransactions || 0}`
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
                                        Stock In
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalInQuantity || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.receipts || 0} receipts
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
                                    <TrendingDownIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Stock Out
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalOutQuantity || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.issues || 0} issues
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
                                    <InventoryIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Value
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2, fontSize: '0.8rem' }}>
                                        {loader ? (
                                            <Skeleton width={60} height={16} />
                                        ) : (
                                            `${summary?.totalValue?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.uniqueProducts || 0} products
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter Section */}
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
                            Stock Ledger Configuration
                        </Typography>
                        {Array.isArray(data) && data?.length > 0 && (
                            <Chip
                                label={`${Array.isArray(data) ? data.filter(item => !item.is_header).length : 0} transactions`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                        <Box sx={{ flexGrow: 1 }} />
                        <IconButton 
                            size="small" 
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            sx={{ 
                                transform: showAdvancedFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s'
                            }}
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                    </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                    {/* Main Filter Controls */}
                    <Grid container spacing={3} mb={3}>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    size="small"
                                    options={groupByOptions}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={groupByOptions.find(g => g.value === groupBy) || null}
                                    onChange={(_, newValue) => {
                                        setGroupBy(newValue?.value || '');
                                        setErrors(prev => ({ ...prev, groupBy: '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Group By"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.groupBy)}
                                            helperText={errors.groupBy}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props} sx={{ borderRadius: 1 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <option.icon fontSize="small" color="primary" />
                                                <Typography>{option.label}</Typography>
                                            </Stack>
                                        </Box>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <DateSelector
                                label="From Date"
                                size="small"
                                value={fromDate}
                                onChange={setFromDate}
                                error={touched && !fromDate}
                                helperText={touched && !fromDate ? 'From Date is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <DateSelector
                                label="To Date"
                                size="small"
                                value={toDate}
                                onChange={setToDate}
                                error={touched && !toDate}
                                helperText={touched && !toDate ? 'To Date is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    size="small"
                                    options={productOptions}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={productOptions.find(p => p.value === productFilter) || null}
                                    onChange={(_, newValue) => {
                                        setProductFilter(newValue?.value || 'all');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Product Filter"
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                        />
                                    )}
                                />
                            </FormControl>
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

                    {/* Advanced Filters */}
                    <Collapse in={showAdvancedFilters}>
                        <Divider sx={{ mb: 3 }} />
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth>
                                    <Autocomplete
                                        size="small"
                                        options={locationOptions}
                                        getOptionLabel={(option) => option.label || ''}
                                        value={locationOptions.find(l => l.value === locationFilter) || null}
                                        onChange={(_, newValue) => {
                                            setLocationFilter(newValue?.value || 'all');
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Location Filter"
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Display Options
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip 
                                        label="Show Values" 
                                        size="small" 
                                        onClick={() => setShowValues(!showValues)}
                                        color={showValues ? 'primary' : 'default'}
                                        variant={showValues ? 'filled' : 'outlined'}
                                    />
                                    <Chip 
                                        label="Include Balances" 
                                        size="small" 
                                        onClick={() => setIncludeBalances(!includeBalances)}
                                        color={includeBalances ? 'primary' : 'default'}
                                        variant={includeBalances ? 'filled' : 'outlined'}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Quick Filters
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip 
                                        label="Today's Transactions" 
                                        size="small" 
                                        onClick={() => {
                                            setFromDate(dayjs().format('YYYY-MM-DD'));
                                            setToDate(dayjs().format('YYYY-MM-DD'));
                                            setGroupBy('transaction');
                                        }}
                                        color="info"
                                        variant="outlined"
                                    />
                                    <Chip 
                                        label="Product Movement" 
                                        size="small" 
                                        onClick={() => {
                                            setGroupBy('product');
                                            setIncludeBalances(true);
                                        }}
                                        color="success"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Grid>
                        </Grid>
                    </Collapse>
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
                                    <Skeleton variant="text" width={180} height={20} />
                                    <Skeleton variant="text" width={120} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={80} height={20} />
                                    <Skeleton variant="text" width={80} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                ) : !hasInitialLoad ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <SwapVertIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Stock Ledger
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your report parameters and click generate to view transaction history
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
                        <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Transaction Data Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No stock transactions found for the selected criteria. Try adjusting your filters.
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleSearch}
                            sx={{ borderRadius: 2 }}
                        >
                            Refresh Report
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
                        enableSorting
                        enablePagination={false}
                        fileTitle={`Stock Ledger - ${groupByOptions.find(g => g.value === groupBy)?.label} - ${moment(fromDate).format('DD-MM-YYYY')} to ${moment(toDate).format('DD-MM-YYYY')}`}
                        printPreviewProps={{
                            title: `Stock Ledger Report`,
                            dateRange: `${moment(fromDate).format('DD-MM-YYYY')} - ${moment(toDate).format('DD-MM-YYYY')}`,
                            groupBy: groupByOptions.find(g => g.value === groupBy)?.label || 'By Product',
                            productFilter: productOptions.find(p => p.value === productFilter)?.label || 'All Products',
                            locationFilter: locationOptions.find(l => l.value === locationFilter)?.label || 'All Locations',
                            showValues: showValues ? 'Yes' : 'No',
                            includeBalances: includeBalances ? 'Yes' : 'No',
                            columns,
                            fromDate,
                            toDate,
                            summary,
                        }}
                        PrintPreviewComponent={StockLedgerPrint}
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
                                            py: 1.5,
                                            px: 2,
                                            verticalAlign: 'middle',
                                            minHeight: '48px',
                                            fontSize: '0.875rem',
                                        },
                                    },
                                },
                            },
                        }}
                        muiTableBodyRowProps={({ row }) => ({
                            sx: {
                                ...(row.original?.is_header && {
                                    bgcolor: alpha(theme.palette.info.main, 0.12),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.info.main, 0.16),
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: `3px solid ${theme.palette.info.main}`,
                                        py: 2.5,
                                        px: 2,
                                        verticalAlign: 'middle',
                                        minHeight: '56px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        backgroundColor: alpha(theme.palette.info.main, 0.08),
                                    },
                                }),
                                // Transaction type based highlighting
                                ...(!row.original?.is_header && row.original?.transaction_type === 'Receipt' && {
                                    bgcolor: alpha(theme.palette.success.main, 0.03),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.success.main, 0.08),
                                    },
                                }),
                                ...(!row.original?.is_header && (row.original?.transaction_type === 'Sales' || row.original?.transaction_type === 'Issue') && {
                                    bgcolor: alpha(theme.palette.error.main, 0.03),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
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

export default StockLedger;
