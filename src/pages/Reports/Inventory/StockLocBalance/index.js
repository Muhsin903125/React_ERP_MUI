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
    Badge,
} from '@mui/material';
import moment from 'moment';
import FilterListIcon from '@mui/icons-material/FilterList';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import StorageIcon from '@mui/icons-material/Storage';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import StockLocBalancePrint from './StockLocBalancePrint';

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

// Common cell renderers
const LocationCell = ({ cell, row }) => {
    const isHeader = row.original?.is_header || false;
    const isTotal = row.original?.is_total || false;
    const locationType = row.original?.location_type || 'warehouse';
    
    const getLocationIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'warehouse':
                return <WarehouseIcon fontSize="small" color="primary" />;
            case 'store':
                return <StorageIcon fontSize="small" color="info" />;
            case 'office':
                return <BusinessIcon fontSize="small" color="secondary" />;
            default:
                return <LocationOnIcon fontSize="small" color="action" />;
        }
    };
    
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            {!isHeader && !isTotal && getLocationIcon(locationType)}
            <Typography 
                variant="body2" 
                fontWeight={isHeader || isTotal ? 700 : 500} 
                color={isHeader ? "primary.main" : isTotal ? "success.main" : "text.primary"}
                sx={{ 
                    textTransform: isHeader || isTotal ? 'uppercase' : 'none',
                    letterSpacing: isHeader || isTotal ? '0.5px' : 'normal'
                }}
            >
                {cell.getValue()}
            </Typography>
            {isTotal && (
                <Chip 
                    label="TOTAL" 
                    size="small" 
                    color="success" 
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                />
            )}
        </Stack>
    );
};

const ProductNameCell = ({ cell, row }) => {
    const level = row.original?.level || 0;
    const isHeader = row.original?.is_header || false;
    const isTotal = row.original?.is_total || false;
    const stockStatus = row.original?.stock_status || 'normal';
    const marginLeft = level * 20; // 20px per level
    
    return (
        <Box sx={{ ml: `${marginLeft}px` }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Typography 
                    variant="body2" 
                    fontWeight={isHeader || isTotal ? 700 : 400}
                    color={isHeader ? "primary.main" : isTotal ? "success.main" : "text.secondary"}
                    sx={{ 
                        wordBreak: 'break-word',
                        textTransform: isHeader || isTotal ? 'uppercase' : 'none',
                        letterSpacing: isHeader || isTotal ? '0.5px' : 'normal'
                    }}
                >
                    {cell.getValue()}
                </Typography>
                {stockStatus === 'critical' && !isHeader && !isTotal && (
                    <ErrorIcon fontSize="small" color="error" />
                )}
                {stockStatus === 'low' && !isHeader && !isTotal && (
                    <WarningIcon fontSize="small" color="warning" />
                )}
                {stockStatus === 'healthy' && !isHeader && !isTotal && (
                    <CheckCircleIcon fontSize="small" color="success" />
                )}
            </Stack>
        </Box>
    );
};

const QuantityCell = ({ cell, row, locationKey = null }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    const isTotal = row.original?.is_total || false;
    const reorderLevel = row.original?.reorder_level || 0;
    
    if ((isHeader || isTotal) && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0</Typography>;
    }
    
    // Determine color based on stock levels
    let color = 'info';
    let variant = 'outlined';
    
    if (!isHeader && !isTotal) {
        if (value <= 0) {
            color = 'error';
            variant = 'filled';
        } else if (value <= reorderLevel) {
            color = 'warning';
            variant = 'filled';
        } else if (value > 100) {
            color = 'success';
            variant = 'outlined';
        }
    } else if (isTotal) {
        color = 'primary';
        variant = 'filled';
    }
    
    return (
        <Chip
            label={Math.abs(value).toFixed(0)}
            size="small"
            color={color}
            variant={variant}
            sx={{ fontWeight: 600, minWidth: 60 }}
        />
    );
};

const ValueCell = ({ cell, row, showSign = false }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    const isTotal = row.original?.is_total || false;
    
    if ((isHeader || isTotal) && (!value || value === 0)) {
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
            fontWeight={isTotal ? 700 : 500}
            color={isTotal ? 'primary.main' : isPositive ? 'success.main' : 'error.main'}
        >
            {showSign && isPositive ? '+' : ''}{absValue}
        </Typography>
    );
};

const StatusCell = ({ cell, row }) => {
    const quantity = row.original?.total_quantity || 0;
    const reorderLevel = row.original?.reorder_level || 0;
    const maxLevel = row.original?.max_level || 0;
    
    if (row.original?.is_header || row.original?.is_total) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    let status = 'Normal';
    let color = 'success';
    let icon = <CheckCircleIcon fontSize="small" />;
    
    if (quantity <= 0) {
        status = 'Out of Stock';
        color = 'error';
        icon = <ErrorIcon fontSize="small" />;
    } else if (quantity <= reorderLevel) {
        status = 'Low Stock';
        color = 'warning';
        icon = <WarningIcon fontSize="small" />;
    } else if (quantity >= maxLevel && maxLevel > 0) {
        status = 'Overstock';
        color = 'info';
        icon = <TrendingUpIcon fontSize="small" />;
    }
    
    return (
        <Chip
            label={status}
            size="small"
            color={color}
            variant="outlined"
            icon={icon}
            sx={{ fontWeight: 600 }}
        />
    );
};

const TransferCell = ({ cell, row }) => {
    const isHeader = row.original?.is_header || false;
    const isTotal = row.original?.is_total || false;
    
    if (isHeader || isTotal) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    return (
        <Button
            variant="outlined"
            size="small"
            startIcon={<CompareArrowsIcon />}
            sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.75rem',
                minWidth: 80
            }}
            onClick={() => {
                // Handle transfer action
                console.log('Transfer initiated for:', row.original);
            }}
        >
            Transfer
        </Button>
    );
};

// Column configurations for different view types
const getColumns = (viewType, showValues, includeTransfers, selectedLocations) => {
    const baseColumns = [
        {
            accessorKey: 'product_code',
            header: 'Product Code',
            size: 120,
            Cell: ({ cell, row }) => (
                <Typography 
                    variant="body2" 
                    fontWeight={row.original?.is_header || row.original?.is_total ? 700 : 500} 
                    color={row.original?.is_header ? "primary.main" : row.original?.is_total ? "success.main" : "text.primary"}
                >
                    {cell.getValue()}
                </Typography>
            ),
        },
        {
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 200,
            Cell: ProductNameCell,
        }
    ];

    if (viewType === 'by_location') {
        // Add location-specific quantity columns
        selectedLocations.forEach(location => {
            baseColumns.push({
                accessorKey: `qty_${location.code}`,
                header: location.name,
                size: 100,
                Cell: ({ cell, row }) => QuantityCell({ cell, row, locationKey: location.code }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            });
        });
        
        baseColumns.push({
            accessorKey: 'total_quantity',
            header: 'Total Qty',
            size: 100,
            Cell: QuantityCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        });
    } else if (viewType === 'by_product') {
        baseColumns.push(
            {
                accessorKey: 'location_name',
                header: 'Location',
                size: 150,
                Cell: LocationCell,
            },
            {
                accessorKey: 'quantity_on_hand',
                header: 'On Hand',
                size: 100,
                Cell: QuantityCell,
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
            }
        );
    } else { // summary view
        baseColumns.push(
            {
                accessorKey: 'location_name',
                header: 'Location',
                size: 150,
                Cell: LocationCell,
            },
            {
                accessorKey: 'total_items',
                header: 'Items',
                size: 80,
                Cell: ({ cell, row }) => (
                    <Typography variant="body2" fontWeight={500} color="info.main">
                        {cell.getValue() || 0}
                    </Typography>
                ),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            },
            {
                accessorKey: 'total_quantity',
                header: 'Total Qty',
                size: 100,
                Cell: QuantityCell,
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            }
        );
    }

    // Add status column for product views
    if (viewType !== 'summary') {
        baseColumns.push({
            accessorKey: 'stock_status',
            header: 'Status',
            size: 120,
            Cell: StatusCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        });
    }

    // Add value columns if enabled
    if (showValues) {
        baseColumns.push(
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
        );
    }

    // Add transfer action column if enabled
    if (includeTransfers && viewType !== 'summary') {
        baseColumns.push({
            accessorKey: 'transfer_action',
            header: 'Actions',
            size: 100,
            Cell: TransferCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' },
            enableSorting: false
        });
    }

    return baseColumns;
};

// View type options
const viewTypeOptions = [
    { value: 'summary', label: 'Location Summary', icon: BusinessIcon },
    { value: 'by_location', label: 'Cross Location View', icon: CompareArrowsIcon },
    { value: 'by_product', label: 'Product Detail View', icon: InventoryIcon }
];

// Demo locations for selection
const availableLocations = [
    { code: 'WH001', name: 'Main Warehouse', type: 'warehouse' },
    { code: 'WH002', name: 'Secondary Warehouse', type: 'warehouse' },
    { code: 'ST001', name: 'Dubai Store', type: 'store' },
    { code: 'ST002', name: 'Abu Dhabi Store', type: 'store' },
    { code: 'OF001', name: 'Head Office', type: 'office' }
];

// Demo data generator for Stock Location Balance
const generateDemoData = (viewType, showValues, selectedLocations) => {
    if (viewType === 'summary') {
        return [
            {
                location_name: 'Main Warehouse',
                location_type: 'warehouse',
                total_items: 45,
                total_quantity: 1250,
                unit_cost: 180.50,
                total_value: 225625.00,
                is_header: false,
                is_total: false
            },
            {
                location_name: 'Secondary Warehouse',
                location_type: 'warehouse',
                total_items: 32,
                total_quantity: 890,
                unit_cost: 165.00,
                total_value: 146850.00,
                is_header: false,
                is_total: false
            },
            {
                location_name: 'Dubai Store',
                location_type: 'store',
                total_items: 28,
                total_quantity: 340,
                unit_cost: 220.00,
                total_value: 74800.00,
                is_header: false,
                is_total: false
            },
            {
                location_name: 'Abu Dhabi Store',
                location_type: 'store',
                total_items: 22,
                total_quantity: 285,
                unit_cost: 195.50,
                total_value: 55717.50,
                is_header: false,
                is_total: false
            },
            {
                location_name: 'Head Office',
                location_type: 'office',
                total_items: 8,
                total_quantity: 65,
                unit_cost: 125.00,
                total_value: 8125.00,
                is_header: false,
                is_total: false
            },
            {
                location_name: 'GRAND TOTAL',
                location_type: 'total',
                total_items: 135,
                total_quantity: 2830,
                unit_cost: 178.50,
                total_value: 511117.50,
                is_header: false,
                is_total: true
            }
        ];
    }
    
    if (viewType === 'by_location') {
        const products = [
            {
                product_code: 'LAP001',
                product_name: 'Dell Inspiron 15 Laptop',
                qty_WH001: 25,
                qty_WH002: 18,
                qty_ST001: 8,
                qty_ST002: 5,
                qty_OF001: 2,
                total_quantity: 58,
                unit_cost: 1250.00,
                total_value: 72500.00,
                reorder_level: 15,
                max_level: 100,
                stock_status: 'healthy'
            },
            {
                product_code: 'CHR001',
                product_name: 'Ergonomic Office Chair',
                qty_WH001: 45,
                qty_WH002: 32,
                qty_ST001: 12,
                qty_ST002: 8,
                qty_OF001: 3,
                total_quantity: 100,
                unit_cost: 285.50,
                total_value: 28550.00,
                reorder_level: 20,
                max_level: 150,
                stock_status: 'healthy'
            },
            {
                product_code: 'PRT001',
                product_name: 'HP LaserJet Pro Printer',
                qty_WH001: 8,
                qty_WH002: 5,
                qty_ST001: 3,
                qty_ST002: 2,
                qty_OF001: 1,
                total_quantity: 19,
                unit_cost: 425.00,
                total_value: 8075.00,
                reorder_level: 25,
                max_level: 50,
                stock_status: 'low'
            },
            {
                product_code: 'MON001',
                product_name: '24" LED Monitor',
                qty_WH001: 65,
                qty_WH002: 45,
                qty_ST001: 25,
                qty_ST002: 18,
                qty_OF001: 5,
                total_quantity: 158,
                unit_cost: 185.00,
                total_value: 29230.00,
                reorder_level: 30,
                max_level: 200,
                stock_status: 'healthy'
            },
            {
                product_code: 'USB001',
                product_name: 'USB Flash Drive 32GB',
                qty_WH001: 0,
                qty_WH002: 2,
                qty_ST001: 0,
                qty_ST002: 1,
                qty_OF001: 0,
                total_quantity: 3,
                unit_cost: 25.00,
                total_value: 75.00,
                reorder_level: 50,
                max_level: 200,
                stock_status: 'critical'
            }
        ];
        
        // Add totals row
        const totals = {
            product_code: 'TOTAL',
            product_name: 'ALL PRODUCTS',
            qty_WH001: products.reduce((sum, p) => sum + p.qty_WH001, 0),
            qty_WH002: products.reduce((sum, p) => sum + p.qty_WH002, 0),
            qty_ST001: products.reduce((sum, p) => sum + p.qty_ST001, 0),
            qty_ST002: products.reduce((sum, p) => sum + p.qty_ST002, 0),
            qty_OF001: products.reduce((sum, p) => sum + p.qty_OF001, 0),
            total_quantity: products.reduce((sum, p) => sum + p.total_quantity, 0),
            unit_cost: products.reduce((sum, p) => sum + p.total_value, 0) / products.reduce((sum, p) => sum + p.total_quantity, 0),
            total_value: products.reduce((sum, p) => sum + p.total_value, 0),
            is_header: false,
            is_total: true
        };
        
        return [...products, totals];
    }
    
    if (viewType === 'by_product') {
        return [
            {
                product_code: 'LAP001',
                product_name: 'Dell Inspiron 15 Laptop',
                location_name: 'Main Warehouse',
                location_type: 'warehouse',
                quantity_on_hand: 25,
                quantity_allocated: 5,
                quantity_available: 20,
                unit_cost: 1250.00,
                total_value: 31250.00,
                reorder_level: 15,
                stock_status: 'healthy'
            },
            {
                product_code: 'LAP001',
                product_name: 'Dell Inspiron 15 Laptop',
                location_name: 'Dubai Store',
                location_type: 'store',
                quantity_on_hand: 8,
                quantity_allocated: 2,
                quantity_available: 6,
                unit_cost: 1250.00,
                total_value: 10000.00,
                reorder_level: 5,
                stock_status: 'healthy'
            },
            {
                product_code: 'CHR001',
                product_name: 'Ergonomic Office Chair',
                location_name: 'Main Warehouse',
                location_type: 'warehouse',
                quantity_on_hand: 45,
                quantity_allocated: 8,
                quantity_available: 37,
                unit_cost: 285.50,
                total_value: 12847.50,
                reorder_level: 20,
                stock_status: 'healthy'
            },
            {
                product_code: 'CHR001',
                product_name: 'Ergonomic Office Chair',
                location_name: 'Secondary Warehouse',
                location_type: 'warehouse',
                quantity_on_hand: 32,
                quantity_allocated: 3,
                quantity_available: 29,
                unit_cost: 285.50,
                total_value: 9136.00,
                reorder_level: 15,
                stock_status: 'healthy'
            },
            {
                product_code: 'USB001',
                product_name: 'USB Flash Drive 32GB',
                location_name: 'Secondary Warehouse',
                location_type: 'warehouse',
                quantity_on_hand: 2,
                quantity_allocated: 0,
                quantity_available: 2,
                unit_cost: 25.00,
                total_value: 50.00,
                reorder_level: 50,
                stock_status: 'critical'
            },
            {
                product_code: 'USB001',
                product_name: 'USB Flash Drive 32GB',
                location_name: 'Abu Dhabi Store',
                location_type: 'store',
                quantity_on_hand: 1,
                quantity_allocated: 0,
                quantity_available: 1,
                unit_cost: 25.00,
                total_value: 25.00,
                reorder_level: 25,
                stock_status: 'critical'
            }
        ];
    }
    
    return [];
};

const StockLocBalance = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [asOfDate, setAsOfDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [viewType, setViewType] = useState(viewTypeOptions[0].value); // Default to summary
    const [selectedLocations, setSelectedLocations] = useState(availableLocations.slice(0, 3)); // Default first 3 locations
    const [showValues, setShowValues] = useState(true);
    const [includeTransfers, setIncludeTransfers] = useState(false);
    const [showZeroStock, setShowZeroStock] = useState(false);
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState({
        viewType: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const isFormValid = asOfDate && viewType;

    // Get dynamic columns based on view type and options
    const columns = getColumns(viewType, showValues, includeTransfers, selectedLocations);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const demoData = generateDemoData(viewType, showValues, selectedLocations);
            showToast(`${viewTypeOptions.find(v => v.value === viewType)?.label} generated successfully`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading Stock Location Balance data", "error");
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

    // Update data when view type or options change
    useEffect(() => {
        if (hasInitialLoad) {
            const demoData = generateDemoData(viewType, showValues, selectedLocations);
            setData(demoData);
        }
    }, [viewType, showValues, selectedLocations, hasInitialLoad]);

    // Calculate Stock Location Balance statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const dataRows = data.filter(item => !item.is_header && !item.is_total);
        
        if (viewType === 'summary') {
            const totalLocations = dataRows.length;
            const totalItems = dataRows.reduce((sum, item) => sum + (item.total_items || 0), 0);
            const totalQuantity = dataRows.reduce((sum, item) => sum + (item.total_quantity || 0), 0);
            const totalValue = dataRows.reduce((sum, item) => sum + (item.total_value || 0), 0);
            
            return {
                totalLocations,
                totalItems,
                totalQuantity,
                totalValue,
                averageItemsPerLocation: totalItems / totalLocations,
                averageValuePerLocation: totalValue / totalLocations,
                healthyLocations: dataRows.filter(item => (item.total_quantity || 0) > 100).length,
                lowStockLocations: dataRows.filter(item => (item.total_quantity || 0) <= 50).length
            };
        }
        
        const uniqueProducts = [...new Set(dataRows.map(item => item.product_code))].length;
        const uniqueLocations = [...new Set(dataRows.map(item => item.location_name))].length;
        const totalQuantity = dataRows.reduce((sum, item) => sum + (item.quantity_on_hand || item.total_quantity || 0), 0);
        const totalValue = dataRows.reduce((sum, item) => sum + (item.total_value || 0), 0);
        const criticalItems = dataRows.filter(item => item.stock_status === 'critical').length;
        const lowStockItems = dataRows.filter(item => item.stock_status === 'low').length;
        
        return {
            uniqueProducts,
            uniqueLocations,
            totalQuantity,
            totalValue,
            criticalItems,
            lowStockItems,
            healthyItems: dataRows.filter(item => item.stock_status === 'healthy').length,
            averageValuePerItem: totalValue / dataRows.length
        };
    })() : {
        totalLocations: 0,
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        uniqueProducts: 0,
        uniqueLocations: 0,
        criticalItems: 0,
        lowStockItems: 0,
        healthyItems: 0
    };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            viewType: !viewType ? 'View Type is required' : ''
        };
        setErrors(newErrors);

        if (isFormValid) {
            getReportData();
        }
    };

    const handleReset = () => {
        setAsOfDate(dayjs().format('YYYY-MM-DD'));
        setViewType(viewTypeOptions[0].value); // Reset to summary
        setSelectedLocations(availableLocations.slice(0, 3));
        setShowValues(true);
        setIncludeTransfers(false);
        setShowZeroStock(false);
        setErrors({
            viewType: ''
        });
        setTouched(false);
        setData(generateDemoData(viewTypeOptions[0].value, true, availableLocations.slice(0, 3)));
        setHasInitialLoad(true);
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Stock Location Balance Report"
                subtitle="Comprehensive inventory distribution across all locations with transfer capabilities"
            />

            {/* Summary Cards - Location Distribution Focused */}
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
                                    <LocationOnIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        {viewType === 'summary' ? 'Total Locations' : 'Unique Locations'}
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={40} height={16} />
                                        ) : (
                                            `${summary?.totalLocations || summary?.uniqueLocations || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        active locations
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
                                    <InventoryIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        {viewType === 'summary' ? 'Total Items' : 'Unique Products'}
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={40} height={16} />
                                        ) : (
                                            `${summary?.totalItems || summary?.uniqueProducts || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        inventory items
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
                                    <WarningIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Low Stock Items
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={40} height={16} />
                                        ) : (
                                            `${summary?.lowStockItems || summary?.lowStockLocations || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        need attention
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
                                        Total Value
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2, fontSize: '0.8rem' }}>
                                        {loader ? (
                                            <Skeleton width={60} height={16} />
                                        ) : (
                                            `${summary?.totalValue?.toFixed(0) || '0'}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        AED total value
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
                            Stock Location Balance Configuration
                        </Typography>
                        {Array.isArray(data) && data?.length > 0 && (
                            <Chip
                                label={`${Array.isArray(data) ? data.filter(item => !item.is_header && !item.is_total).length : 0} records`}
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
                                    options={viewTypeOptions}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={viewTypeOptions.find(v => v.value === viewType) || null}
                                    onChange={(_, newValue) => {
                                        setViewType(newValue?.value || '');
                                        setErrors(prev => ({ ...prev, viewType: '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="View Type"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.viewType)}
                                            helperText={errors.viewType}
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
                                label="As Of Date"
                                size="small"
                                value={asOfDate}
                                onChange={setAsOfDate}
                                error={touched && !asOfDate}
                                helperText={touched && !asOfDate ? 'As Of Date is required' : ''}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <FormControl fullWidth>
                                <Autocomplete
                                    multiple
                                    size="small"
                                    options={availableLocations}
                                    getOptionLabel={(option) => option.name || ''}
                                    value={selectedLocations}
                                    onChange={(_, newValue) => {
                                        setSelectedLocations(newValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Select Locations"
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                },
                                            }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                variant="outlined"
                                                label={option.name}
                                                size="small"
                                                {...getTagProps({ index })}
                                                key={option.code}
                                            />
                                        ))
                                    }
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <Stack spacing={1}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showValues}
                                            onChange={(e) => setShowValues(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label="Show Values"
                                    sx={{ fontSize: '0.875rem' }}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={includeTransfers}
                                            onChange={(e) => setIncludeTransfers(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label="Transfer Actions"
                                    sx={{ fontSize: '0.875rem' }}
                                />
                            </Stack>
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
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Display Options
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip 
                                        label="Include Zero Stock" 
                                        size="small" 
                                        onClick={() => setShowZeroStock(!showZeroStock)}
                                        color={showZeroStock ? 'primary' : 'default'}
                                        variant={showZeroStock ? 'filled' : 'outlined'}
                                    />
                                    <Chip 
                                        label="Show All Locations" 
                                        size="small" 
                                        onClick={() => setSelectedLocations(availableLocations)}
                                        color="info"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Quick Views
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip 
                                        label="Warehouse Only" 
                                        size="small" 
                                        onClick={() => {
                                            setSelectedLocations(availableLocations.filter(loc => loc.type === 'warehouse'));
                                            setViewType('by_location');
                                        }}
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip 
                                        label="Stores Only" 
                                        size="small" 
                                        onClick={() => {
                                            setSelectedLocations(availableLocations.filter(loc => loc.type === 'store'));
                                            setViewType('by_location');
                                        }}
                                        color="secondary"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Analysis Focus
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip 
                                        label="Location Summary" 
                                        size="small" 
                                        onClick={() => setViewType('summary')}
                                        color="success"
                                        variant="outlined"
                                    />
                                    <Chip 
                                        label="Product Details" 
                                        size="small" 
                                        onClick={() => setViewType('by_product')}
                                        color="info"
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
                                    <Skeleton variant="text" width={120} height={20} />
                                    <Skeleton variant="text" width={180} height={20} />
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
                        <LocationOnIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Stock Location Balance
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your report parameters and view inventory distribution across locations
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
                            No Location Data Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No stock location balance data found for the selected criteria. Try adjusting your filters.
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
                        fileTitle={`Stock Location Balance - ${viewTypeOptions.find(v => v.value === viewType)?.label} - ${moment(asOfDate).format('DD-MM-YYYY')}`}
                        printPreviewProps={{
                            title: `Stock Location Balance Report`,
                            asOfDate: moment(asOfDate).format('DD-MM-YYYY'),
                            viewType: viewTypeOptions.find(v => v.value === viewType)?.label || 'Location Summary',
                            selectedLocations: selectedLocations.map(loc => loc.name).join(', '),
                            showValues: showValues ? 'Yes' : 'No',
                            includeTransfers: includeTransfers ? 'Yes' : 'No',
                            columns,
                            summary,
                        }}
                        PrintPreviewComponent={StockLocBalancePrint}
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
                                ...(row.original?.is_total && {
                                    bgcolor: alpha(theme.palette.success.main, 0.12),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.success.main, 0.16),
                                    },
                                    '& .MuiTableCell-root': {
                                        borderBottom: `3px solid ${theme.palette.success.main}`,
                                        py: 2.5,
                                        px: 2,
                                        verticalAlign: 'middle',
                                        minHeight: '56px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        backgroundColor: alpha(theme.palette.success.main, 0.08),
                                    },
                                }),
                                // Stock status based highlighting
                                ...(!row.original?.is_total && row.original?.stock_status === 'critical' && {
                                    bgcolor: alpha(theme.palette.error.main, 0.03),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                    },
                                }),
                                ...(!row.original?.is_total && row.original?.stock_status === 'low' && {
                                    bgcolor: alpha(theme.palette.warning.main, 0.03),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.warning.main, 0.08),
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

export default StockLocBalance;
