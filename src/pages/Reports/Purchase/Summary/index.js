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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import PurchaseSummaryPrint from './PurchaseSummaryPrint';

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

// Common cell renderers
const SupplierCodeCell = ({ cell, row }) => {
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

const EntityNameCell = ({ cell, row }) => {
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
                label={`${showSign && isPositive ? '+' : ''}${absValue}`}
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
            {showSign && isPositive ? '+' : ''}{absValue}
        </Typography>
    );
};

const QuantityCell = ({ cell, row }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0</Typography>;
    }
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={500}
            color="info.main"
        >
            {value?.toFixed(0)}
        </Typography>
    );
};

const PercentageCell = ({ cell, row }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0.0%</Typography>;
    }
    
    const isPositive = value > 0;
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={500}
            color={isPositive ? 'success.main' : 'error.main'}
        >
            {isPositive ? '+' : ''}{value.toFixed(1)}%
        </Typography>
    );
};

// Column configurations for different grouping types
const getColumns = (groupBy, reportFormat) => {
    const baseColumns = [];
    
    // Dynamic columns based on grouping
    if (groupBy === 'supplier') {
        baseColumns.push({
            accessorKey: 'supplier_name',
            header: 'Supplier Name',
            size: 250,
            Cell: EntityNameCell,
        });
        baseColumns.push({
            accessorKey: 'supplier_code',
            header: 'Supplier Code', 
            size: 120,
            Cell: SupplierCodeCell,
        });
    } else if (groupBy === 'product') {
        baseColumns.push({
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 250,
            Cell: EntityNameCell,
        });
        baseColumns.push({
            accessorKey: 'product_code',
            header: 'Product Code', 
            size: 120,
            Cell: SupplierCodeCell,
        });
    } else if (groupBy === 'category') {
        baseColumns.push({
            accessorKey: 'category_name',
            header: 'Category Name',
            size: 250,
            Cell: EntityNameCell,
        });
    } else if (groupBy === 'period') {
        baseColumns.push({
            accessorKey: 'period',
            header: reportFormat === 'monthly' ? 'Month' : reportFormat === 'quarterly' ? 'Quarter' : 'Period',
            size: 200,
            Cell: EntityNameCell,
        });
    }

    // Core purchase columns
    const coreColumns = [
        {
            accessorKey: 'purchase_amount',
            header: 'Purchase Amount',
            size: 130,
            Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false, chipStyle: true }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'quantity_purchased',
            header: 'Quantity',
            size: 100,
            Cell: QuantityCell,
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'po_count',
            header: 'PO Count',
            size: 100,
            Cell: QuantityCell,
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'avg_unit_cost',
            header: 'Avg Unit Cost',
            size: 120,
            Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'discount_amount',
            header: 'Total Discount',
            size: 120,
            Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'variance_percent',
            header: 'Variance %',
            size: 100,
            Cell: PercentageCell,
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        }
    ];

    return [...baseColumns, ...coreColumns];
};

// Grouping options
const groupByOptions = [
    { value: 'supplier', label: 'By Supplier', icon: BusinessIcon },
    { value: 'product', label: 'By Product', icon: InventoryIcon },
    { value: 'category', label: 'By Category', icon: AssessmentIcon },
    { value: 'period', label: 'By Period', icon: TrendingUpIcon }
];

// Report format options  
const reportFormatOptions = [
    { value: 'summary', label: 'Summary View' },
    { value: 'detailed', label: 'Detailed View' },
    { value: 'monthly', label: 'Monthly Breakdown' },
    { value: 'quarterly', label: 'Quarterly Breakdown' }
];

// Demo data generator for Purchase Summary
const generateDemoData = (groupBy, reportFormat) => {
    const baseData = [];
    
    if (groupBy === 'supplier') {
        return [
            {
                supplier_code: 'SUP001',
                supplier_name: 'Global Tech Suppliers Ltd.',
                is_header: false,
                level: 0,
                purchase_amount: 185000.00,
                quantity_purchased: 1250,
                po_count: 15,
                avg_unit_cost: 148.00,
                discount_amount: 9250.00,
                variance_percent: 12.5
            },
            {
                supplier_code: 'SUP002',
                supplier_name: 'Prime Electronics Trading',
                is_header: false,
                level: 0,
                purchase_amount: 156000.00,
                quantity_purchased: 890,
                po_count: 12,
                avg_unit_cost: 175.28,
                discount_amount: 7800.00,
                variance_percent: -8.3
            },
            {
                supplier_code: 'SUP003',
                supplier_name: 'Advanced Components Corp.',
                is_header: false,
                level: 0,
                purchase_amount: 142000.00,
                quantity_purchased: 675,
                po_count: 18,
                avg_unit_cost: 210.37,
                discount_amount: 5680.00,
                variance_percent: 15.7
            },
            {
                supplier_code: 'SUP004',
                supplier_name: 'Industrial Supply Partners',
                is_header: false,
                level: 0,
                purchase_amount: 98000.00,
                quantity_purchased: 420,
                po_count: 8,
                avg_unit_cost: 233.33,
                discount_amount: 2940.00,
                variance_percent: -5.2
            },
            {
                supplier_code: 'SUP005',
                supplier_name: 'Quality Materials Inc.',
                is_header: false,
                level: 0,
                purchase_amount: 76000.00,
                quantity_purchased: 310,
                po_count: 6,
                avg_unit_cost: 245.16,
                discount_amount: 1520.00,
                variance_percent: 8.9
            },
            {
                supplier_code: 'TOTAL',
                supplier_name: 'TOTAL PURCHASES',
                is_header: true,
                level: 0,
                purchase_amount: 657000.00,
                quantity_purchased: 3545,
                po_count: 59,
                avg_unit_cost: 185.23,
                discount_amount: 27190.00,
                variance_percent: 4.7
            }
        ];
    }
    
    if (groupBy === 'product') {
        return [
            {
                product_code: 'PRD001',
                product_name: 'Laptop Computers - Enterprise Series',
                is_header: false,
                level: 0,
                purchase_amount: 125000.00,
                quantity_purchased: 85,
                po_count: 8,
                avg_unit_cost: 1470.59,
                discount_amount: 6250.00,
                variance_percent: 18.2
            },
            {
                product_code: 'PRD002',
                product_name: 'Office Furniture - Premium Line',
                is_header: false,
                level: 0,
                purchase_amount: 89000.00,
                quantity_purchased: 445,
                po_count: 12,
                avg_unit_cost: 200.00,
                discount_amount: 4450.00,
                variance_percent: -12.4
            },
            {
                product_code: 'PRD003',
                product_name: 'Network Equipment & Accessories',
                is_header: false,
                level: 0,
                purchase_amount: 156000.00,
                quantity_purchased: 320,
                po_count: 15,
                avg_unit_cost: 487.50,
                discount_amount: 7800.00,
                variance_percent: 25.6
            },
            {
                product_code: 'PRD004',
                product_name: 'Office Supplies & Stationery',
                is_header: false,
                level: 0,
                purchase_amount: 43000.00,
                quantity_purchased: 2150,
                po_count: 18,
                avg_unit_cost: 20.00,
                discount_amount: 2150.00,
                variance_percent: -6.8
            },
            {
                product_code: 'PRD005',
                product_name: 'Software Licenses & Tools',
                is_header: false,
                level: 0,
                purchase_amount: 98000.00,
                quantity_purchased: 125,
                po_count: 6,
                avg_unit_cost: 784.00,
                discount_amount: 4900.00,
                variance_percent: 14.3
            },
            {
                product_code: 'TOTAL',
                product_name: 'TOTAL PURCHASES',
                is_header: true,
                level: 0,
                purchase_amount: 511000.00,
                quantity_purchased: 3125,
                po_count: 59,
                avg_unit_cost: 163.52,
                discount_amount: 25550.00,
                variance_percent: 7.8
            }
        ];
    }
    
    if (groupBy === 'category') {
        return [
            {
                category_name: 'Information Technology',
                is_header: false,
                level: 0,
                purchase_amount: 285000.00,
                quantity_purchased: 520,
                po_count: 25,
                avg_unit_cost: 548.08,
                discount_amount: 14250.00,
                variance_percent: 22.1
            },
            {
                category_name: 'Office Equipment & Furniture',
                is_header: false,
                level: 0,
                purchase_amount: 134000.00,
                quantity_purchased: 670,
                po_count: 18,
                avg_unit_cost: 200.00,
                discount_amount: 6700.00,
                variance_percent: -8.5
            },
            {
                category_name: 'Consumables & Supplies',
                is_header: false,
                level: 0,
                purchase_amount: 67000.00,
                quantity_purchased: 3350,
                po_count: 22,
                avg_unit_cost: 20.00,
                discount_amount: 3350.00,
                variance_percent: -4.2
            },
            {
                category_name: 'Maintenance & Services',
                is_header: false,
                level: 0,
                purchase_amount: 45000.00,
                quantity_purchased: 150,
                po_count: 8,
                avg_unit_cost: 300.00,
                discount_amount: 2250.00,
                variance_percent: 15.8
            },
            {
                category_name: 'TOTAL PURCHASES',
                is_header: true,
                level: 0,
                purchase_amount: 531000.00,
                quantity_purchased: 4690,
                po_count: 73,
                avg_unit_cost: 113.22,
                discount_amount: 26550.00,
                variance_percent: 6.3
            }
        ];
    }
    
    if (groupBy === 'period') {
        const periods = reportFormat === 'monthly' ? [
            'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025'
        ] : reportFormat === 'quarterly' ? [
            'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'
        ] : [
            'Week 1', 'Week 2', 'Week 3', 'Week 4'
        ];
        
        return periods.map((period, index) => ({
            period,
            is_header: false,
            level: 0,
            purchase_amount: 80000 + (Math.random() * 60000),
            quantity_purchased: 400 + Math.floor(Math.random() * 300),
            po_count: 8 + Math.floor(Math.random() * 12),
            avg_unit_cost: 150 + (Math.random() * 100),
            discount_amount: 2000 + (Math.random() * 3000),
            variance_percent: -15 + (Math.random() * 35)
        })).concat([{
            period: 'TOTAL',
            is_header: true,
            level: 0,
            purchase_amount: periods.length * 110000,
            quantity_purchased: periods.length * 550,
            po_count: periods.length * 14,
            avg_unit_cost: 200.00,
            discount_amount: periods.length * 3500,
            variance_percent: 8.5
        }]);
    }
    
    return [];
};

const PurchaseSummary = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [groupBy, setGroupBy] = useState(groupByOptions[0].value); // Default to supplier
    const [reportFormat, setReportFormat] = useState(reportFormatOptions[0].value); // Default to summary
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState({
        groupBy: '',
        reportFormat: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const isFormValid = fromDate && toDate && groupBy && reportFormat;

    // Get dynamic columns based on grouping and format
    const columns = getColumns(groupBy, reportFormat);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const demoData = generateDemoData(groupBy, reportFormat);
            showToast(`${groupByOptions.find(g => g.value === groupBy)?.label} generated successfully`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading Purchase Summary data", "error");
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

    // Update data when grouping or format changes
    useEffect(() => {
        if (hasInitialLoad) {
            const demoData = generateDemoData(groupBy, reportFormat);
            setData(demoData);
        }
    }, [groupBy, reportFormat, hasInitialLoad]);

    // Calculate Purchase Summary statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const totalRow = data.find(item => item.is_header) || {};
        const dataRows = data.filter(item => !item.is_header);
        
        return {
            totalPurchases: totalRow.purchase_amount || 0,
            totalQuantity: totalRow.quantity_purchased || 0,
            totalPOs: totalRow.po_count || 0,
            avgUnitCost: totalRow.avg_unit_cost || 0,
            totalDiscount: totalRow.discount_amount || 0,
            variancePercent: totalRow.variance_percent || 0,
            supplierCount: dataRows.length,
            topSupplier: dataRows.length > 0 ? dataRows[0] : null
        };
    })() : {
        totalPurchases: 0,
        totalQuantity: 0,
        totalPOs: 0,
        avgUnitCost: 0,
        totalDiscount: 0,
        variancePercent: 0,
        supplierCount: 0,
        topSupplier: null
    };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            groupBy: !groupBy ? 'Group By is required' : '',
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
        setGroupBy(groupByOptions[0].value); // Reset to supplier
        setReportFormat(reportFormatOptions[0].value); // Reset to summary
        setErrors({
            groupBy: '',
            reportFormat: ''
        });
        setTouched(false);
        setData(generateDemoData(groupByOptions[0].value, reportFormatOptions[0].value));
        setHasInitialLoad(true);
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Purchase Summary Report"
                subtitle="Comprehensive purchase performance analysis and supplier insights"
            />

            {/* Summary Cards - Purchase Focused */}
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
                                    <ShoppingCartIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Purchases
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalPurchases?.toFixed(2) || '0.00'}`
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
                                    <LocalShippingIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Purchase Orders
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={30} height={16} />
                                        ) : (
                                            `${summary?.totalPOs || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        Avg: ${summary?.avgUnitCost?.toFixed(2) || '0.00'}
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
                            background: `linear-gradient(135deg, ${summary?.variancePercent >= 0 ? theme.palette.info.light : theme.palette.warning.light} 0%, ${summary?.variancePercent >= 0 ? theme.palette.info.main : theme.palette.warning.main} 100%)`,
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
                                    {summary?.variancePercent >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Cost Variance
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.variancePercent >= 0 ? '+' : ''}${summary?.variancePercent?.toFixed(1) || '0.0'}%`
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
                                    <AssessmentIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Savings
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2, fontSize: '0.8rem' }}>
                                        {loader ? (
                                            <Skeleton width={60} height={16} />
                                        ) : (
                                            `${summary?.totalDiscount?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.supplierCount || 0} suppliers
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
                            Purchase Report Configuration
                        </Typography>
                        {Array.isArray(data) && data?.length > 0 && (
                            <Chip
                                label={`${Array.isArray(data) ? data.filter(item => !item.is_header).length : 0} records`}
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
                        <Grid item xs={12} sm={6} md={3}>
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
                            <FormControl fullWidth>
                                <Autocomplete
                                    size="small"
                                    options={reportFormatOptions}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={reportFormatOptions.find(r => r.value === reportFormat) || null}
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
                        <Grid item xs={12} md={1.5}>
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
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Quick Filters
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip 
                                        label="Top Suppliers" 
                                        size="small" 
                                        onClick={() => setGroupBy('supplier')}
                                        color={groupBy === 'supplier' ? 'primary' : 'default'}
                                        variant={groupBy === 'supplier' ? 'filled' : 'outlined'}
                                    />
                                    <Chip 
                                        label="Cost Analysis" 
                                        size="small" 
                                        onClick={() => setReportFormat('detailed')}
                                        color={reportFormat === 'detailed' ? 'primary' : 'default'}
                                        variant={reportFormat === 'detailed' ? 'filled' : 'outlined'}
                                    />
                                    <Chip 
                                        label="Monthly Trend" 
                                        size="small" 
                                        onClick={() => {
                                            setGroupBy('period');
                                            setReportFormat('monthly');
                                        }}
                                        color={groupBy === 'period' && reportFormat === 'monthly' ? 'primary' : 'default'}
                                        variant={groupBy === 'period' && reportFormat === 'monthly' ? 'filled' : 'outlined'}
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
                                    <Skeleton variant="text" width={250} height={20} />
                                    <Skeleton variant="text" width={120} height={20} />
                                    <Skeleton variant="text" width={130} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={130} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                ) : !hasInitialLoad ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Purchase Summary
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your report parameters and click generate to view purchase insights
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
                            No Purchase Data Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No purchase data found for the selected criteria. Try adjusting your filters.
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
                        fileTitle={`Purchase Summary - ${groupByOptions.find(g => g.value === groupBy)?.label} - ${reportFormatOptions.find(r => r.value === reportFormat)?.label}`}
                        printPreviewProps={{
                            title: `Purchase Summary Report`,
                            dateRange: `${moment(fromDate).format('DD-MM-YYYY')} - ${moment(toDate).format('DD-MM-YYYY')}`,
                            groupBy: groupByOptions.find(g => g.value === groupBy)?.label || 'By Supplier',
                            reportFormat: reportFormatOptions.find(r => r.value === reportFormat)?.label || 'Summary View',
                            columns,
                            fromDate,
                            toDate,
                            summary,
                        }}
                        PrintPreviewComponent={PurchaseSummaryPrint}
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
                                    bgcolor: alpha(theme.palette.success.main, 0.12),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.success.main, 0.16),
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: `3px solid ${theme.palette.success.main}`,
                                        py: 2.5,
                                        px: 2,
                                        verticalAlign: 'middle',
                                        minHeight: '64px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        backgroundColor: alpha(theme.palette.success.main, 0.08),
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

export default PurchaseSummary;
