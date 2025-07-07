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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReportHeader from '../../../../components/ReportHeader';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import SalesSummaryPrint from './SalesSummaryPrint';
 
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

// Column configurations for different report formats
const getColumns = (reportFormat, groupBy, fromDate, toDate) => {
    const baseColumns = [];
    
    // Dynamic columns based on groupBy selection
    if (groupBy === 'customer') {
        baseColumns.push({
            accessorKey: 'customer_name',
            header: 'Customer Name',
            size: 250,
            Cell: CustomerNameCell,
        });
        baseColumns.push({
            accessorKey: 'customer_code',
            header: 'Code', 
            size: 120,
            Cell: CustomerCodeCell,
        });
    } else if (groupBy === 'product') {
        baseColumns.push({
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 250,
            Cell: ProductNameCell,
        });
        baseColumns.push({
            accessorKey: 'product_code',
            header: 'Code', 
            size: 120,
            Cell: CustomerCodeCell,
        });
    } else if (groupBy === 'salesman') {
        baseColumns.push({
            accessorKey: 'salesman_name',
            header: 'Salesman Name',
            size: 200,
            Cell: CustomerNameCell,
        });
        baseColumns.push({
            accessorKey: 'salesman_code',
            header: 'Code', 
            size: 120,
            Cell: CustomerCodeCell,
        });
    } else if (groupBy === 'period') {
        baseColumns.push({
            accessorKey: 'period',
            header: 'Period',
            size: 150,
            Cell: CustomerNameCell,
        });
    }

    switch (reportFormat) {
        case 'detailed':
            return [
                ...baseColumns,
                {
                    accessorKey: 'invoice_count',
                    header: 'Invoices',
                    size: 100,
                    Cell: QuantityCell,
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'quantity_sold',
                    header: 'Qty Sold',
                    size: 100,
                    Cell: QuantityCell,
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'gross_sales',
                    header: 'Gross Sales',
                    size: 130,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'discount_amount',
                    header: 'Discounts',
                    size: 110,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'net_sales',
                    header: 'Net Sales',
                    size: 130,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false, chipStyle: true }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'cost_of_sales',
                    header: 'Cost of Sales',
                    size: 130,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'gross_profit',
                    header: 'Gross Profit',
                    size: 130,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'margin_percent',
                    header: 'Margin %',
                    size: 100,
                    Cell: ({ cell, row }) => {
                        const value = cell.getValue();
                        if (!value || value === 0) return <Typography variant="body2" color="text.secondary">0%</Typography>;
                        return (
                            <Typography 
                                variant="body2" 
                                fontWeight={500}
                                color={value > 0 ? 'success.main' : 'error.main'}
                            >
                                {value.toFixed(1)}%
                            </Typography>
                        );
                    },
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];

        case 'summary':
            return [
                ...baseColumns,
                {
                    accessorKey: 'net_sales',
                    header: `Sales Amount`,
                    size: 150,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false, chipStyle: true }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'quantity_sold',
                    header: 'Qty Sold',
                    size: 100,
                    Cell: QuantityCell,
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'gross_profit',
                    header: 'Gross Profit',
                    size: 130,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                }
            ];

        case 'comparative':
            return [
                ...baseColumns,
                {
                    accessorKey: 'current_period_sales',
                    header: `Current Period`,
                    size: 140,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'previous_period_sales',
                    header: `Previous Period`,
                    size: 140,
                    Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'variance_amount',
                    header: 'Variance',
                    size: 120,
                    Cell: ({ cell, row }) => {
                        const current = row.original?.current_period_sales || 0;
                        const previous = row.original?.previous_period_sales || 0;
                        const variance = current - previous;
                        return AmountCell({ cell: { getValue: () => variance }, row, showSign: true });
                    },
                    muiTableBodyCellProps: { align: 'right' }, 
                    headerProps: { align: 'right' }
                },
                {
                    accessorKey: 'variance_percent',
                    header: 'Growth %',
                    size: 100,
                    Cell: ({ cell, row }) => {
                        const current = row.original?.current_period_sales || 0;
                        const previous = row.original?.previous_period_sales || 0;
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

// Report format types for Sales Summary
const reportFormats = [
    { value: 'summary', label: 'Summary Format' },
    { value: 'detailed', label: 'Detailed Format' },
    { value: 'comparative', label: 'Comparative Format' }
];

// Group by options
const groupByOptions = [
    { value: 'customer', label: 'By Customer' },
    { value: 'product', label: 'By Product' },
    { value: 'salesman', label: 'By Salesman' },
    { value: 'period', label: 'By Period (Month)' }
];

// Demo data for Sales Summary testing
const generateDemoData = (groupBy) => {
    const baseData = [];
    
    if (groupBy === 'customer') {
        return [
            {
                customer_code: 'C001',
                customer_name: 'ABC Corporation Ltd.',
                is_header: false,
                level: 0,
                invoice_count: 25,
                quantity_sold: 1250,
                gross_sales: 125000.00,
                discount_amount: 5000.00,
                net_sales: 120000.00,
                cost_of_sales: 75000.00,
                gross_profit: 45000.00,
                margin_percent: 37.5,
                current_period_sales: 120000.00,
                previous_period_sales: 95000.00
            },
            {
                customer_code: 'C002',
                customer_name: 'XYZ Trading Company',
                is_header: false,
                level: 0,
                invoice_count: 18,
                quantity_sold: 890,
                gross_sales: 89000.00,
                discount_amount: 2500.00,
                net_sales: 86500.00,
                cost_of_sales: 54000.00,
                gross_profit: 32500.00,
                margin_percent: 37.6,
                current_period_sales: 86500.00,
                previous_period_sales: 78000.00
            },
            {
                customer_code: 'C003',
                customer_name: 'Global Industries Inc.',
                is_header: false,
                level: 0,
                invoice_count: 32,
                quantity_sold: 1680,
                gross_sales: 168000.00,
                discount_amount: 8000.00,
                net_sales: 160000.00,
                cost_of_sales: 100000.00,
                gross_profit: 60000.00,
                margin_percent: 37.5,
                current_period_sales: 160000.00,
                previous_period_sales: 142000.00
            },
            {
                customer_code: 'C004',
                customer_name: 'Tech Solutions Pvt Ltd',
                is_header: false,
                level: 0,
                invoice_count: 15,
                quantity_sold: 750,
                gross_sales: 75000.00,
                discount_amount: 3000.00,
                net_sales: 72000.00,
                cost_of_sales: 45000.00,
                gross_profit: 27000.00,
                margin_percent: 37.5,
                current_period_sales: 72000.00,
                previous_period_sales: 68000.00
            },
            {
                customer_code: 'TOTAL',
                customer_name: 'TOTAL SALES',
                is_header: true,
                level: 0,
                invoice_count: 90,
                quantity_sold: 4570,
                gross_sales: 457000.00,
                discount_amount: 18500.00,
                net_sales: 438500.00,
                cost_of_sales: 274000.00,
                gross_profit: 164500.00,
                margin_percent: 37.5,
                current_period_sales: 438500.00,
                previous_period_sales: 383000.00
            }
        ];
    }
    
    if (groupBy === 'product') {
        return [
            {
                product_code: 'P001',
                product_name: 'Laptop Computer - Dell Inspiron',
                is_header: false,
                level: 0,
                invoice_count: 15,
                quantity_sold: 45,
                gross_sales: 67500.00,
                discount_amount: 2500.00,
                net_sales: 65000.00,
                cost_of_sales: 40000.00,
                gross_profit: 25000.00,
                margin_percent: 38.5,
                current_period_sales: 65000.00,
                previous_period_sales: 58000.00
            },
            {
                product_code: 'P002',
                product_name: 'Office Chair - Ergonomic',
                is_header: false,
                level: 0,
                invoice_count: 25,
                quantity_sold: 125,
                gross_sales: 37500.00,
                discount_amount: 1500.00,
                net_sales: 36000.00,
                cost_of_sales: 22000.00,
                gross_profit: 14000.00,
                margin_percent: 38.9,
                current_period_sales: 36000.00,
                previous_period_sales: 32000.00
            },
            {
                product_code: 'P003',
                product_name: 'Printer - HP LaserJet',
                is_header: false,
                level: 0,
                invoice_count: 20,
                quantity_sold: 80,
                gross_sales: 40000.00,
                discount_amount: 2000.00,
                net_sales: 38000.00,
                cost_of_sales: 24000.00,
                gross_profit: 14000.00,
                margin_percent: 36.8,
                current_period_sales: 38000.00,
                previous_period_sales: 35000.00
            },
            {
                product_code: 'TOTAL',
                product_name: 'TOTAL SALES',
                is_header: true,
                level: 0,
                invoice_count: 60,
                quantity_sold: 250,
                gross_sales: 145000.00,
                discount_amount: 6000.00,
                net_sales: 139000.00,
                cost_of_sales: 86000.00,
                gross_profit: 53000.00,
                margin_percent: 38.1,
                current_period_sales: 139000.00,
                previous_period_sales: 125000.00
            }
        ];
    }
    
    if (groupBy === 'salesman') {
        return [
            {
                salesman_code: 'S001',
                salesman_name: 'Ahmed Ali',
                is_header: false,
                level: 0,
                invoice_count: 35,
                quantity_sold: 1750,
                gross_sales: 175000.00,
                discount_amount: 7000.00,
                net_sales: 168000.00,
                cost_of_sales: 105000.00,
                gross_profit: 63000.00,
                margin_percent: 37.5,
                current_period_sales: 168000.00,
                previous_period_sales: 148000.00
            },
            {
                salesman_code: 'S002',
                salesman_name: 'Sarah Johnson',
                is_header: false,
                level: 0,
                invoice_count: 28,
                quantity_sold: 1400,
                gross_sales: 140000.00,
                discount_amount: 5500.00,
                net_sales: 134500.00,
                cost_of_sales: 84000.00,
                gross_profit: 50500.00,
                margin_percent: 37.5,
                current_period_sales: 134500.00,
                previous_period_sales: 125000.00
            },
            {
                salesman_code: 'S003',
                salesman_name: 'Mohammed Hassan',
                is_header: false,
                level: 0,
                invoice_count: 22,
                quantity_sold: 1100,
                gross_sales: 110000.00,
                discount_amount: 4500.00,
                net_sales: 105500.00,
                cost_of_sales: 66000.00,
                gross_profit: 39500.00,
                margin_percent: 37.4,
                current_period_sales: 105500.00,
                previous_period_sales: 98000.00
            },
            {
                salesman_code: 'TOTAL',
                salesman_name: 'TOTAL SALES',
                is_header: true,
                level: 0,
                invoice_count: 85,
                quantity_sold: 4250,
                gross_sales: 425000.00,
                discount_amount: 17000.00,
                net_sales: 408000.00,
                cost_of_sales: 255000.00,
                gross_profit: 153000.00,
                margin_percent: 37.5,
                current_period_sales: 408000.00,
                previous_period_sales: 371000.00
            }
        ];
    }
       if (groupBy === 'period') {
        return [
            {
                period: 'January 2025',
                is_header: false,
                level: 0,
                invoice_count: 45,
                quantity_sold: 2250,
                gross_sales: 225000.00,
                discount_amount: 9000.00,
                net_sales: 216000.00,
                cost_of_sales: 135000.00,
                gross_profit: 81000.00,
                margin_percent: 37.5,
                current_period_sales: 216000.00,
                previous_period_sales: 198000.00
            },
            {
                period: 'February 2025',
                is_header: false,
                level: 0,
                invoice_count: 38,
                quantity_sold: 1900,
                gross_sales: 190000.00,
                discount_amount: 7500.00,
                net_sales: 182500.00,
                cost_of_sales: 114000.00,
                gross_profit: 68500.00,
                margin_percent: 37.5,
                current_period_sales: 182500.00,
                previous_period_sales: 175000.00
            },
            {
                period: 'March 2025',
                is_header: false,
                level: 0,
                invoice_count: 42,
                quantity_sold: 2100,
                gross_sales: 210000.00,
                discount_amount: 8500.00,
                net_sales: 201500.00,
                cost_of_sales: 126000.00,
                gross_profit: 75500.00,
                margin_percent: 37.5,
                current_period_sales: 201500.00,
                previous_period_sales: 185000.00
            },
            {
                period: 'TOTAL',
                period_name: 'TOTAL SALES',
                is_header: true,
                level: 0,
                invoice_count: 125,
                quantity_sold: 6250,
                gross_sales: 625000.00,
                discount_amount: 25000.00,
                net_sales: 600000.00,
                cost_of_sales: 375000.00,
                gross_profit: 225000.00,
                margin_percent: 37.5,
                current_period_sales: 600000.00,
                previous_period_sales: 558000.00
            }
        ];
    }
    
    return [];
};

const SalesSummary = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [reportFormat, setReportFormat] = useState(reportFormats[0].value); // Default to summary
    const [groupBy, setGroupBy] = useState(groupByOptions[0].value); // Default to customer
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState({
        reportFormat: '',
        groupBy: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);

    const isFormValid = fromDate && toDate && reportFormat && groupBy;

    // Get dynamic columns based on report format and groupBy
    const columns = getColumns(reportFormat, groupBy, fromDate, toDate);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const demoData = generateDemoData(groupBy);
            showToast(`Sales Summary generated successfully - ${groupByOptions.find(g => g.value === groupBy)?.label} in ${reportFormats.find(f => f.value === reportFormat)?.label}`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading Sales Summary data", "error");
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

    // Calculate Sales Summary statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const totalRow = data.find(item => item.is_header) || {};
        
        return {
            totalSales: totalRow.net_sales || 0,
            totalQuantity: totalRow.quantity_sold || 0,
            totalInvoices: totalRow.invoice_count || 0,
            totalProfit: totalRow.gross_profit || 0,
            avgMargin: totalRow.margin_percent || 0,
            growthPercent: totalRow.current_period_sales && totalRow.previous_period_sales ? 
                ((totalRow.current_period_sales - totalRow.previous_period_sales) / totalRow.previous_period_sales) * 100 : 0
        };
    })() : {
        totalSales: 0,
        totalQuantity: 0,
        totalInvoices: 0,
        totalProfit: 0,
        avgMargin: 0,
        growthPercent: 0
    };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            reportFormat: !reportFormat ? 'Report Format is required' : '',
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
        setReportFormat(reportFormats[0].value); // Reset to summary
        setGroupBy(groupByOptions[0].value); // Reset to customer
        setErrors({
            reportFormat: '',
            groupBy: ''
        });
        setTouched(false);
        setData(generateDemoData(groupByOptions[0].value)); // Reset to demo data
        setHasInitialLoad(true); // Mark as loaded
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Sales Summary Report"
                subtitle="Comprehensive sales analysis and performance metrics"
            />

            {/* Summary Cards - Sales Focused */}
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
                                        Total Sales
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalSales?.toFixed(2) || '0.00'}`
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
                                    <InventoryIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Quantity Sold
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalQuantity?.toFixed(0) || '0'}`
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
                                    <AssessmentIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Gross Profit
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.totalProfit?.toFixed(2) || '0.00'}`
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
                            background: `linear-gradient(135deg, ${summary?.growthPercent >= 0 ? theme.palette.success.light : theme.palette.error.light} 0%, ${summary?.growthPercent >= 0 ? theme.palette.success.main : theme.palette.error.main} 100%)`,
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
                                        Growth Rate
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.growthPercent?.toFixed(1) || '0.0'}%`
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
                                label={`${Array.isArray(data) ? data.filter(item => !item.is_header).length : 0} records`}
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
                                            {option.label}
                                        </Box>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
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
                                            label="Format"
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
                                    <Skeleton variant="text" width={250} height={20} />
                                    <Skeleton variant="text" width={120} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={130} height={20} />
                                    <Skeleton variant="text" width={110} height={20} />
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                ) : !hasInitialLoad ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Sales Summary Report
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your filters and click generate to create the sales summary
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
                            No Sales Data Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No sales data found for the selected period. Try adjusting your date range.
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
                        fileTitle={`Sales Summary - ${groupByOptions.find(g => g.value === groupBy)?.label} - ${reportFormats.find(f => f.value === reportFormat)?.label}`}
                        printPreviewProps={{
                            title: `Sales Summary Report`,
                            dateRange: `${moment(fromDate).format('DD-MM-YYYY')} - ${moment(toDate).format('DD-MM-YYYY')}`,
                            groupBy: groupByOptions.find(g => g.value === groupBy)?.label || 'Customer',
                            reportFormat: reportFormats.find(f => f.value === reportFormat)?.label || 'Summary Format',
                            columns, // Pass the dynamic columns
                            fromDate,
                            toDate,
                            summary,
                        }}
                        PrintPreviewComponent={SalesSummaryPrint}
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
                                    bgcolor: alpha(theme.palette.success.main, 0.12),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.success.main, 0.16),
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: `2px solid ${theme.palette.success.main}`,
                                        py: 1.5,
                                        height: '56px',
                                        verticalAlign: 'middle',
                                    },
                                }),
                                ...(row.original?.level === 0 && !row.original?.is_header && {
                                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                                    },
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

export default SalesSummary;
