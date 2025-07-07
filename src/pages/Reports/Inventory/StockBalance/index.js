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
    Switch,
    FormControlLabel,
} from '@mui/material';
import moment from 'moment';
import FilterListIcon from '@mui/icons-material/FilterList';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningIcon from '@mui/icons-material/Warning';
import StorageIcon from '@mui/icons-material/Storage';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import StockBalancePrint from './StockBalancePrint';

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

// Common cell renderers
const ProductCodeCell = ({ cell, row }) => {
    const isHeader = row.original?.is_header || false;
    const isLowStock = row.original?.quantity_on_hand <= (row.original?.reorder_level || 0);
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={isHeader ? 700 : 500} 
            color={isHeader ? "text.primary" : isLowStock ? "error.main" : "primary.main"}
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
    const isLowStock = row.original?.quantity_on_hand <= (row.original?.reorder_level || 0);
    const marginLeft = level * 20; // 20px per level
    
    return (
        <Box sx={{ ml: `${marginLeft}px` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
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
                {isLowStock && !isHeader && (
                    <WarningIcon fontSize="small" color="warning" />
                )}
            </Stack>
        </Box>
    );
};

const QuantityCell = ({ cell, row, showLowStockAlert = false }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    const isLowStock = showLowStockAlert && value <= (row.original?.reorder_level || 0);
    
    if (isHeader && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0</Typography>;
    }
    
    return (
        <Chip
            label={value?.toFixed(0)}
            size="small"
            color={isLowStock ? 'error' : value > 100 ? 'success' : 'info'}
            variant={isLowStock ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, minWidth: 60 }}
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

const StatusCell = ({ cell, row }) => {
    const quantity = row.original?.quantity_on_hand || 0;
    const reorderLevel = row.original?.reorder_level || 0;
    const maxLevel = row.original?.max_level || 0;
    
    if (row.original?.is_header) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    let status = 'Normal';
    let color = 'success';
    
    if (quantity <= 0) {
        status = 'Out of Stock';
        color = 'error';
    } else if (quantity <= reorderLevel) {
        status = 'Low Stock';
        color = 'warning';
    } else if (quantity >= maxLevel && maxLevel > 0) {
        status = 'Overstock';
        color = 'info';
    }
    
    return (
        <Chip
            label={status}
            size="small"
            color={color}
            variant="outlined"
            sx={{ fontWeight: 600 }}
        />
    );
};

// Column configurations for different grouping types
const getColumns = (groupBy, showZeroStock, showValues) => {
    const baseColumns = [];
    
    // Dynamic columns based on grouping
    if (groupBy === 'product') {
        baseColumns.push({
            accessorKey: 'product_code',
            header: 'Product Code',
            size: 120,
            Cell: ProductCodeCell,
        });
        baseColumns.push({
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 250,
            Cell: ProductNameCell,
        });
    } else if (groupBy === 'category') {
        baseColumns.push({
            accessorKey: 'category_name',
            header: 'Category Name',
            size: 200,
            Cell: ProductNameCell,
        });
        baseColumns.push({
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 250,
            Cell: ProductNameCell,
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
            size: 250,
            Cell: ProductNameCell,
        });
    }

    // Core inventory columns
    const coreColumns = [
        {
            accessorKey: 'unit_of_measure',
            header: 'UOM',
            size: 80,
            Cell: ({ cell }) => (
                <Typography variant="body2" color="text.secondary">
                    {cell.getValue() || 'PCS'}
                </Typography>
            ),
        },
        {
            accessorKey: 'quantity_on_hand',
            header: 'On Hand',
            size: 100,
            Cell: ({ cell, row }) => QuantityCell({ cell, row, showLowStockAlert: true }),
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        },
        {
            accessorKey: 'quantity_allocated',
            header: 'Allocated',
            size: 100,
            Cell: QuantityCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        },
        {
            accessorKey: 'quantity_available',
            header: 'Available',
            size: 100,
            Cell: QuantityCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        },
        {
            accessorKey: 'reorder_level',
            header: 'Reorder Level',
            size: 110,
            Cell: QuantityCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 120,
            Cell: StatusCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        }
    ];

    // Add value columns if enabled
    const valueColumns = showValues ? [
        {
            accessorKey: 'unit_cost',
            header: 'Unit Cost',
            size: 100,
            Cell: ({ cell, row }) => ValueCell({ cell, row }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'total_value',
            header: 'Total Value',
            size: 120,
            Cell: ({ cell, row }) => ValueCell({ cell, row }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        }
    ] : [];

    return [...baseColumns, ...coreColumns, ...valueColumns];
};

// Grouping options
const groupByOptions = [
    { value: 'product', label: 'By Product', icon: InventoryIcon },
    { value: 'category', label: 'By Category', icon: CategoryIcon },
    { value: 'location', label: 'By Location', icon: LocationOnIcon }
];

// Demo data generator for Stock Balance
const generateDemoData = (groupBy, showZeroStock, showValues) => {
    const baseData = [];
    
    if (groupBy === 'product') {
        const products = [
            {
                product_code: 'LAP001',
                product_name: 'Dell Inspiron 15 Laptop',
                category_name: 'Computers',
                location_name: 'Main Warehouse',
                unit_of_measure: 'PCS',
                quantity_on_hand: 25,
                quantity_allocated: 5,
                quantity_available: 20,
                reorder_level: 10,
                max_level: 50,
                unit_cost: 1250.00,
                total_value: 31250.00
            },
            {
                product_code: 'CHR001',
                product_name: 'Ergonomic Office Chair',
                category_name: 'Furniture',
                location_name: 'Main Warehouse',
                unit_of_measure: 'PCS',
                quantity_on_hand: 8,
                quantity_allocated: 2,
                quantity_available: 6,
                reorder_level: 15,
                max_level: 30,
                unit_cost: 285.50,
                total_value: 2284.00
            },
            {
                product_code: 'PRT001',
                product_name: 'HP LaserJet Pro Printer',
                category_name: 'Electronics',
                location_name: 'Electronics Store',
                unit_of_measure: 'PCS',
                quantity_on_hand: 12,
                quantity_allocated: 1,
                quantity_available: 11,
                reorder_level: 5,
                max_level: 25,
                unit_cost: 425.00,
                total_value: 5100.00
            },
            {
                product_code: 'MON001',
                product_name: '24" LED Monitor',
                category_name: 'Electronics',
                location_name: 'Electronics Store',
                unit_of_measure: 'PCS',
                quantity_on_hand: 35,
                quantity_allocated: 8,
                quantity_available: 27,
                reorder_level: 20,
                max_level: 60,
                unit_cost: 185.00,
                total_value: 6475.00
            },
            {
                product_code: 'STA001',
                product_name: 'Office Stationery Set',
                category_name: 'Supplies',
                location_name: 'Supply Room',
                unit_of_measure: 'SET',
                quantity_on_hand: 120,
                quantity_allocated: 15,
                quantity_available: 105,
                reorder_level: 50,
                max_level: 200,
                unit_cost: 12.50,
                total_value: 1500.00
            },
            {
                product_code: 'USB001',
                product_name: 'USB Flash Drive 32GB',
                category_name: 'Electronics',
                location_name: 'Electronics Store',
                unit_of_measure: 'PCS',
                quantity_on_hand: 3,
                quantity_allocated: 0,
                quantity_available: 3,
                reorder_level: 25,
                max_level: 100,
                unit_cost: 15.75,
                total_value: 47.25
            }
        ];

        if (!showZeroStock) {
            // Filter out zero stock items if not showing them
            return products.concat([{
                product_code: 'TOTAL',
                product_name: 'TOTAL INVENTORY',
                is_header: true,
                level: 0,
                quantity_on_hand: products.reduce((sum, p) => sum + p.quantity_on_hand, 0),
                quantity_allocated: products.reduce((sum, p) => sum + p.quantity_allocated, 0),
                quantity_available: products.reduce((sum, p) => sum + p.quantity_available, 0),
                total_value: products.reduce((sum, p) => sum + p.total_value, 0)
            }]);
        }

        return products.concat([{
            product_code: 'TOTAL',
            product_name: 'TOTAL INVENTORY',
            is_header: true,
            level: 0,
            quantity_on_hand: products.reduce((sum, p) => sum + p.quantity_on_hand, 0),
            quantity_allocated: products.reduce((sum, p) => sum + p.quantity_allocated, 0),
            quantity_available: products.reduce((sum, p) => sum + p.quantity_available, 0),
            total_value: products.reduce((sum, p) => sum + p.total_value, 0)
        }]);
    }
    
    if (groupBy === 'category') {
        return [
            {
                category_name: 'Computers & Laptops',
                product_name: 'Dell Inspiron 15 Laptop',
                is_header: false,
                level: 0,
                unit_of_measure: 'PCS',
                quantity_on_hand: 25,
                quantity_allocated: 5,
                quantity_available: 20,
                reorder_level: 10,
                unit_cost: 1250.00,
                total_value: 31250.00
            },
            {
                category_name: 'Office Furniture',
                product_name: 'Ergonomic Office Chair',
                is_header: false,
                level: 0,
                unit_of_measure: 'PCS',
                quantity_on_hand: 8,
                quantity_allocated: 2,
                quantity_available: 6,
                reorder_level: 15,
                unit_cost: 285.50,
                total_value: 2284.00
            },
            {
                category_name: 'Electronics & Accessories',
                product_name: 'HP LaserJet Pro Printer',
                is_header: false,
                level: 0,
                unit_of_measure: 'PCS',
                quantity_on_hand: 12,
                quantity_allocated: 1,
                quantity_available: 11,
                reorder_level: 5,
                unit_cost: 425.00,
                total_value: 5100.00
            },
            {
                category_name: 'Electronics & Accessories',
                product_name: '24" LED Monitor',
                is_header: false,
                level: 0,
                unit_of_measure: 'PCS',
                quantity_on_hand: 35,
                quantity_allocated: 8,
                quantity_available: 27,
                reorder_level: 20,
                unit_cost: 185.00,
                total_value: 6475.00
            },
            {
                category_name: 'Office Supplies',
                product_name: 'Office Stationery Set',
                is_header: false,
                level: 0,
                unit_of_measure: 'SET',
                quantity_on_hand: 120,
                quantity_allocated: 15,
                quantity_available: 105,
                reorder_level: 50,
                unit_cost: 12.50,
                total_value: 1500.00
            },
            {
                category_name: 'TOTAL',
                product_name: 'TOTAL INVENTORY',
                is_header: true,
                level: 0,
                quantity_on_hand: 200,
                quantity_allocated: 31,
                quantity_available: 169,
                total_value: 46609.00
            }
        ];
    }
    
    if (groupBy === 'location') {
        return [
            {
                location_name: 'Main Warehouse',
                product_name: 'Dell Inspiron 15 Laptop',
                is_header: false,
                level: 0,
                unit_of_measure: 'PCS',
                quantity_on_hand: 25,
                quantity_allocated: 5,
                quantity_available: 20,
                reorder_level: 10,
                unit_cost: 1250.00,
                total_value: 31250.00
            },
            {
                location_name: 'Main Warehouse',
                product_name: 'Ergonomic Office Chair',
                is_header: false,
                level: 0,
                unit_of_measure: 'PCS',
                quantity_on_hand: 8,
                quantity_allocated: 2,
                quantity_available: 6,
                reorder_level: 15,
                unit_cost: 285.50,
                total_value: 2284.00
            },
            {
                location_name: 'Electronics Store',
                product_name: 'HP LaserJet Pro Printer',
                is_header: false,
                level: 0,
                unit_of_measure: 'PCS',
                quantity_on_hand: 12,
                quantity_allocated: 1,
                quantity_available: 11,
                reorder_level: 5,
                unit_cost: 425.00,
                total_value: 5100.00
            },
            {
                location_name: 'Electronics Store',
                product_name: '24" LED Monitor',
                is_header: false,
                level: 0,
                unit_of_measure: 'PCS',
                quantity_on_hand: 35,
                quantity_allocated: 8,
                quantity_available: 27,
                reorder_level: 20,
                unit_cost: 185.00,
                total_value: 6475.00
            },
            {
                location_name: 'Supply Room',
                product_name: 'Office Stationery Set',
                is_header: false,
                level: 0,
                unit_of_measure: 'SET',
                quantity_on_hand: 120,
                quantity_allocated: 15,
                quantity_available: 105,
                reorder_level: 50,
                unit_cost: 12.50,
                total_value: 1500.00
            },
            {
                location_name: 'TOTAL',
                product_name: 'TOTAL INVENTORY',
                is_header: true,
                level: 0,
                quantity_on_hand: 200,
                quantity_allocated: 31,
                quantity_available: 169,
                total_value: 46609.00
            }
        ];
    }
    
    return [];
};

const StockBalance = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [asOfDate, setAsOfDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [groupBy, setGroupBy] = useState(groupByOptions[0].value); // Default to product
    const [showZeroStock, setShowZeroStock] = useState(true);
    const [showValues, setShowValues] = useState(true);
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState({
        groupBy: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const isFormValid = asOfDate && groupBy;

    // Get dynamic columns based on grouping and settings
    const columns = getColumns(groupBy, showZeroStock, showValues);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const demoData = generateDemoData(groupBy, showZeroStock, showValues);
            showToast(`${groupByOptions.find(g => g.value === groupBy)?.label} generated successfully`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading Stock Balance data", "error");
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

    // Update data when settings change
    useEffect(() => {
        if (hasInitialLoad) {
            const demoData = generateDemoData(groupBy, showZeroStock, showValues);
            setData(demoData);
        }
    }, [groupBy, showZeroStock, showValues, hasInitialLoad]);

    // Calculate Stock Balance statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const totalRow = data.find(item => item.is_header) || {};
        const dataRows = data.filter(item => !item.is_header);
        
        const lowStockItems = dataRows.filter(item => 
            item.quantity_on_hand <= item.reorder_level
        ).length;
        
        const outOfStockItems = dataRows.filter(item => 
            item.quantity_on_hand <= 0
        ).length;
        
        return {
            totalItems: dataRows.length,
            totalQuantity: totalRow.quantity_on_hand || 0,
            totalAllocated: totalRow.quantity_allocated || 0,
            totalAvailable: totalRow.quantity_available || 0,
            totalValue: totalRow.total_value || 0,
            lowStockItems,
            outOfStockItems,
            stockHealthPercent: dataRows.length > 0 ? 
                ((dataRows.length - lowStockItems) / dataRows.length * 100) : 100
        };
    })() : {
        totalItems: 0,
        totalQuantity: 0,
        totalAllocated: 0,
        totalAvailable: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
        stockHealthPercent: 100
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
        setAsOfDate(dayjs().format('YYYY-MM-DD'));
        setGroupBy(groupByOptions[0].value); // Reset to product
        setShowZeroStock(true);
        setShowValues(true);
        setErrors({
            groupBy: ''
        });
        setTouched(false);
        setData(generateDemoData(groupByOptions[0].value, true, true));
        setHasInitialLoad(true);
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Stock Balance Report"
                subtitle="Real-time inventory levels, stock status, and warehouse insights"
            />

            {/* Summary Cards - Inventory Focused */}
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
                                    <InventoryIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Total Items
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={30} height={16} />
                                        ) : (
                                            `${summary?.totalItems || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.totalQuantity || 0} units
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
                                    <StorageIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Available Stock
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={40} height={16} />
                                        ) : (
                                            `${summary?.totalAvailable || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.totalAllocated || 0} allocated
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
                            background: `linear-gradient(135deg, ${summary?.stockHealthPercent >= 80 ? theme.palette.info.light : theme.palette.warning.light} 0%, ${summary?.stockHealthPercent >= 80 ? theme.palette.info.main : theme.palette.warning.main} 100%)`,
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
                                        Stock Health
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.stockHealthPercent?.toFixed(1) || '0.0'}%`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.lowStockItems || 0} low stock
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
                                    <MonetizationOnIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Stock Value
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2, fontSize: '0.8rem' }}>
                                        {loader ? (
                                            <Skeleton width={60} height={16} />
                                        ) : (
                                            `${summary?.totalValue?.toFixed(2) || '0.00'}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.outOfStockItems || 0} out of stock
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
                            Inventory Report Configuration
                        </Typography>
                        {Array.isArray(data) && data?.length > 0 && (
                            <Chip
                                label={`${Array.isArray(data) ? data.filter(item => !item.is_header).length : 0} items`}
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
                        <Grid item xs={12} sm={6} md={3}>
                            <DateSelector
                                label="As of Date"
                                size="small"
                                value={asOfDate}
                                onChange={setAsOfDate}
                                error={touched && !asOfDate}
                                helperText={touched && !asOfDate ? 'As of Date is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Stack spacing={1}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showZeroStock}
                                            onChange={(e) => setShowZeroStock(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            Show Zero Stock
                                        </Typography>
                                    }
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showValues}
                                            onChange={(e) => setShowValues(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            Show Values
                                        </Typography>
                                    }
                                />
                            </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
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
                                        label="Low Stock Alert" 
                                        size="small" 
                                        onClick={() => {
                                            setGroupBy('product');
                                            setShowZeroStock(true);
                                        }}
                                        color={groupBy === 'product' ? 'warning' : 'default'}
                                        variant={groupBy === 'product' ? 'filled' : 'outlined'}
                                        icon={<WarningIcon />}
                                    />
                                    <Chip 
                                        label="By Location" 
                                        size="small" 
                                        onClick={() => setGroupBy('location')}
                                        color={groupBy === 'location' ? 'primary' : 'default'}
                                        variant={groupBy === 'location' ? 'filled' : 'outlined'}
                                    />
                                    <Chip 
                                        label="Category View" 
                                        size="small" 
                                        onClick={() => setGroupBy('category')}
                                        color={groupBy === 'category' ? 'primary' : 'default'}
                                        variant={groupBy === 'category' ? 'filled' : 'outlined'}
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
                                    <Skeleton variant="text" width={120} height={20} />
                                    <Skeleton variant="text" width={250} height={20} />
                                    <Skeleton variant="text" width={80} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                    <Skeleton variant="text" width={120} height={20} />
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                ) : !hasInitialLoad ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <InventoryIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Stock Balance
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your inventory parameters and click generate to view stock levels
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
                            No Inventory Data Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No inventory data found for the selected criteria. Try adjusting your filters.
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
                        fileTitle={`Stock Balance - ${groupByOptions.find(g => g.value === groupBy)?.label} - ${moment(asOfDate).format('DD-MM-YYYY')}`}
                        printPreviewProps={{
                            title: `Stock Balance Report`,
                            asOfDate: moment(asOfDate).format('DD-MM-YYYY'),
                            groupBy: groupByOptions.find(g => g.value === groupBy)?.label || 'By Product',
                            showZeroStock: showZeroStock ? 'Yes' : 'No',
                            showValues: showValues ? 'Yes' : 'No',
                            columns,
                            summary,
                        }}
                        PrintPreviewComponent={StockBalancePrint}
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
                                // Low stock highlighting
                                ...(!row.original?.is_header && 
                                   row.original?.quantity_on_hand <= (row.original?.reorder_level || 0) && {
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
                                // Out of stock highlighting
                                ...(!row.original?.is_header && 
                                   row.original?.quantity_on_hand <= 0 && {
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
                            },
                        })}
                    />
                )}
            </Paper>
        </Container>
    );
};

export default StockBalance;
