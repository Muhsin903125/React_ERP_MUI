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
import ScheduleIcon from '@mui/icons-material/Schedule';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CategoryIcon from '@mui/icons-material/Category';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import StockAgeingPrint from './StockAgeingPrint';

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

// Common cell renderers
const ProductCodeCell = ({ cell, row }) => {
    const isHeader = row.original?.is_header || false;
    const ageingStatus = row.original?.ageing_status || 'normal';
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={isHeader ? 700 : 500} 
            color={isHeader ? "text.primary" : ageingStatus === 'critical' ? "error.main" : "primary.main"}
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
    const ageingStatus = row.original?.ageing_status || 'normal';
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
                {ageingStatus === 'critical' && !isHeader && (
                    <ErrorIcon fontSize="small" color="error" />
                )}
                {ageingStatus === 'warning' && !isHeader && (
                    <WarningIcon fontSize="small" color="warning" />
                )}
            </Stack>
        </Box>
    );
};

const AgeGroupCell = ({ cell, row, columnId }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader && (!value || value === 0)) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    if (value === 0 || value === null || value === undefined) {
        return <Typography variant="body2" color="text.secondary">0</Typography>;
    }
    
    // Determine color based on age group
    let color = 'info';
    if (columnId?.includes('120') || columnId?.includes('180') || columnId?.includes('365')) {
        color = 'error';
    } else if (columnId?.includes('90') || columnId?.includes('60')) {
        color = 'warning';
    } else if (columnId?.includes('30')) {
        color = 'success';
    }
    
    return (
        <Chip
            label={value?.toFixed(0)}
            size="small"
            color={color}
            variant={value > 50 ? 'filled' : 'outlined'}
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

const AgeingStatusCell = ({ cell, row }) => {
    const totalQuantity = row.original?.total_quantity || 0;
    const age120Plus = row.original?.age_120_plus || 0;
    const age90to120 = row.original?.age_90_to_120 || 0;
    const age60to90 = row.original?.age_60_to_90 || 0;
    
    if (row.original?.is_header) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    let status = 'Fresh';
    let color = 'success';
    let icon = null;
    
    const criticalStock = age120Plus + age90to120;
    const warningStock = age60to90;
    const criticalPercentage = (criticalStock / totalQuantity) * 100;
    const warningPercentage = (warningStock / totalQuantity) * 100;
    
    if (criticalPercentage > 30) {
        status = 'Critical';
        color = 'error';
        icon = <ErrorIcon fontSize="small" />;
    } else if (criticalPercentage > 10 || warningPercentage > 40) {
        status = 'Warning';
        color = 'warning';
        icon = <WarningIcon fontSize="small" />;
    } else if (warningPercentage > 20) {
        status = 'Moderate';
        color = 'info';
        icon = <ScheduleIcon fontSize="small" />;
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

const AverageAgeCell = ({ cell, row }) => {
    const value = cell.getValue();
    const isHeader = row.original?.is_header || false;
    
    if (isHeader || !value) {
        return <Typography variant="body2" color="text.disabled">-</Typography>;
    }
    
    let color = 'success.main';
    if (value > 90) {
        color = 'error.main';
    } else if (value > 60) {
        color = 'warning.main';
    } else if (value > 30) {
        color = 'info.main';
    }
    
    return (
        <Typography 
            variant="body2" 
            fontWeight={600}
            color={color}
        >
            {Math.round(value)} days
        </Typography>
    );
};

// Column configurations for different grouping types
const getColumns = (groupBy, showValues, ageBreakdown) => {
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
            size: 200,
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
            size: 200,
            Cell: ProductNameCell,
        });
    }

    // Core ageing columns
    const coreColumns = [
        {
            accessorKey: 'total_quantity',
            header: 'Total Qty',
            size: 100,
            Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'total' }),
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        }
    ];

    // Age breakdown columns
    if (ageBreakdown === 'detailed') {
        coreColumns.push(
            {
                accessorKey: 'age_0_to_30',
                header: '0-30 Days',
                size: 100,
                Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'age_0_to_30' }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            },
            {
                accessorKey: 'age_30_to_60',
                header: '30-60 Days',
                size: 100,
                Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'age_30_to_60' }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            },
            {
                accessorKey: 'age_60_to_90',
                header: '60-90 Days',
                size: 100,
                Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'age_60_to_90' }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            },
            {
                accessorKey: 'age_90_to_120',
                header: '90-120 Days',
                size: 110,
                Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'age_90_to_120' }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            },
            {
                accessorKey: 'age_120_plus',
                header: '120+ Days',
                size: 100,
                Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'age_120_plus' }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            }
        );
    } else {
        coreColumns.push(
            {
                accessorKey: 'age_0_to_60',
                header: '0-60 Days',
                size: 100,
                Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'age_0_to_60' }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            },
            {
                accessorKey: 'age_60_to_120',
                header: '60-120 Days',
                size: 110,
                Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'age_60_to_120' }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            },
            {
                accessorKey: 'age_120_plus',
                header: '120+ Days',
                size: 100,
                Cell: ({ cell, row }) => AgeGroupCell({ cell, row, columnId: 'age_120_plus' }),
                muiTableBodyCellProps: { align: 'center' }, 
                headerProps: { align: 'center' }
            }
        );
    }

    // Analysis columns
    coreColumns.push(
        {
            accessorKey: 'average_age',
            header: 'Avg Age',
            size: 100,
            Cell: AverageAgeCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        },
        {
            accessorKey: 'ageing_status',
            header: 'Status',
            size: 120,
            Cell: AgeingStatusCell,
            muiTableBodyCellProps: { align: 'center' }, 
            headerProps: { align: 'center' }
        }
    );

    // Add value columns if enabled
    if (showValues) {
        coreColumns.push(
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

    return [...baseColumns, ...coreColumns];
};

// Grouping options
const groupByOptions = [
    { value: 'product', label: 'By Product', icon: InventoryIcon },
    { value: 'category', label: 'By Category', icon: CategoryIcon },
    { value: 'location', label: 'By Location', icon: LocationOnIcon }
];

// Age breakdown options
const ageBreakdownOptions = [
    { value: 'summary', label: 'Summary (3 Groups)' },
    { value: 'detailed', label: 'Detailed (5 Groups)' }
];

// Demo data generator for Stock Ageing
const generateDemoData = (groupBy, showValues, ageBreakdown) => {
    const calculateAgeBreakdown = (totalQty) => {
        if (ageBreakdown === 'detailed') {
            const age0to30 = Math.floor(totalQty * 0.4);
            const age30to60 = Math.floor(totalQty * 0.25);
            const age60to90 = Math.floor(totalQty * 0.2);
            const age90to120 = Math.floor(totalQty * 0.1);
            const age120plus = totalQty - age0to30 - age30to60 - age60to90 - age90to120;
            
            return {
                age_0_to_30: age0to30,
                age_30_to_60: age30to60,
                age_60_to_90: age60to90,
                age_90_to_120: age90to120,
                age_120_plus: age120plus,
                average_age: (age0to30 * 15 + age30to60 * 45 + age60to90 * 75 + age90to120 * 105 + age120plus * 150) / totalQty
            };
        }
        
        const age0to60 = Math.floor(totalQty * 0.65);
        const age60to120 = Math.floor(totalQty * 0.25);
        const age120plus = totalQty - age0to60 - age60to120;
        
        return {
            age_0_to_60: age0to60,
            age_60_to_120: age60to120,
            age_120_plus: age120plus,
            average_age: (age0to60 * 30 + age60to120 * 90 + age120plus * 150) / totalQty
        };
    };
    
    if (groupBy === 'product') {
        const products = [
            {
                product_code: 'LAP001',
                product_name: 'Dell Inspiron 15 Laptop',
                category_name: 'Computers',
                location_name: 'Main Warehouse',
                total_quantity: 45,
                unit_cost: 1250.00,
                total_value: 56250.00
            },
            {
                product_code: 'CHR001',
                product_name: 'Ergonomic Office Chair',
                category_name: 'Furniture',
                location_name: 'Main Warehouse',
                total_quantity: 78,
                unit_cost: 285.50,
                total_value: 22269.00
            },
            {
                product_code: 'PRT001',
                product_name: 'HP LaserJet Pro Printer',
                category_name: 'Electronics',
                location_name: 'Electronics Store',
                total_quantity: 23,
                unit_cost: 425.00,
                total_value: 9775.00
            },
            {
                product_code: 'MON001',
                product_name: '24" LED Monitor',
                category_name: 'Electronics',
                location_name: 'Electronics Store',
                total_quantity: 156,
                unit_cost: 185.00,
                total_value: 28860.00
            },
            {
                product_code: 'STA001',
                product_name: 'Office Stationery Set',
                category_name: 'Supplies',
                location_name: 'Supply Room',
                total_quantity: 245,
                unit_cost: 12.50,
                total_value: 3062.50
            },
            {
                product_code: 'USB001',
                product_name: 'USB Flash Drive 32GB',
                category_name: 'Electronics',
                location_name: 'Electronics Store',
                total_quantity: 89,
                unit_cost: 25.00,
                total_value: 2225.00
            }
        ];
        
        return products.map(product => {
            const ageData = calculateAgeBreakdown(product.total_quantity);
            return {
                ...product,
                ...ageData,
                is_header: false,
                level: 0,
                ageing_status: ageData.average_age > 90 ? 'critical' : ageData.average_age > 60 ? 'warning' : 'normal'
            };
        });
    }
    
    if (groupBy === 'category') {
        const categories = [
            {
                category_name: 'Computers',
                products: [
                    { product_name: 'Dell Inspiron 15 Laptop', total_quantity: 45, unit_cost: 1250.00 },
                    { product_name: 'HP Elite Desktop', total_quantity: 32, unit_cost: 980.00 }
                ]
            },
            {
                category_name: 'Electronics',
                products: [
                    { product_name: 'HP LaserJet Pro Printer', total_quantity: 23, unit_cost: 425.00 },
                    { product_name: '24" LED Monitor', total_quantity: 156, unit_cost: 185.00 },
                    { product_name: 'USB Flash Drive 32GB', total_quantity: 89, unit_cost: 25.00 }
                ]
            },
            {
                category_name: 'Furniture',
                products: [
                    { product_name: 'Ergonomic Office Chair', total_quantity: 78, unit_cost: 285.50 },
                    { product_name: 'Executive Desk', total_quantity: 12, unit_cost: 650.00 }
                ]
            }
        ];
        
        return categories.flatMap(category => {
            const categoryData = category.products.map(product => {
                const ageData = calculateAgeBreakdown(product.total_quantity);
                return {
                    category_name: category.category_name,
                    product_name: product.product_name,
                    total_quantity: product.total_quantity,
                    unit_cost: product.unit_cost,
                    total_value: product.total_quantity * product.unit_cost,
                    ...ageData,
                    is_header: false,
                    level: 1,
                    ageing_status: ageData.average_age > 90 ? 'critical' : ageData.average_age > 60 ? 'warning' : 'normal'
                };
            });
            
            // Add category summary
            const totalQty = category.products.reduce((sum, p) => sum + p.total_quantity, 0);
            const totalValue = category.products.reduce((sum, p) => sum + (p.total_quantity * p.unit_cost), 0);
            const categoryAgeData = calculateAgeBreakdown(totalQty);
            
            categoryData.push({
                category_name: `${category.category_name} - TOTAL`,
                product_name: '',
                total_quantity: totalQty,
                unit_cost: totalValue / totalQty,
                total_value: totalValue,
                ...categoryAgeData,
                is_header: true,
                level: 0,
                ageing_status: 'normal'
            });
            
            return categoryData;
        });
    }
    
    if (groupBy === 'location') {
        const locations = [
            {
                location_name: 'Main Warehouse',
                products: [
                    { product_name: 'Dell Inspiron 15 Laptop', total_quantity: 45, unit_cost: 1250.00 },
                    { product_name: 'Ergonomic Office Chair', total_quantity: 78, unit_cost: 285.50 }
                ]
            },
            {
                location_name: 'Electronics Store',
                products: [
                    { product_name: 'HP LaserJet Pro Printer', total_quantity: 23, unit_cost: 425.00 },
                    { product_name: '24" LED Monitor', total_quantity: 156, unit_cost: 185.00 },
                    { product_name: 'USB Flash Drive 32GB', total_quantity: 89, unit_cost: 25.00 }
                ]
            },
            {
                location_name: 'Supply Room',
                products: [
                    { product_name: 'Office Stationery Set', total_quantity: 245, unit_cost: 12.50 }
                ]
            }
        ];
        
        return locations.flatMap(location => {
            return location.products.map(product => {
                const ageData = calculateAgeBreakdown(product.total_quantity);
                return {
                    location_name: location.location_name,
                    product_name: product.product_name,
                    total_quantity: product.total_quantity,
                    unit_cost: product.unit_cost,
                    total_value: product.total_quantity * product.unit_cost,
                    ...ageData,
                    is_header: false,
                    level: 0,
                    ageing_status: ageData.average_age > 90 ? 'critical' : ageData.average_age > 60 ? 'warning' : 'normal'
                };
            });
        });
    }
    
    return [];
};

const StockAgeing = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [asOfDate, setAsOfDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [groupBy, setGroupBy] = useState(groupByOptions[0].value); // Default to product
    const [ageBreakdown, setAgeBreakdown] = useState('summary');
    const [showValues, setShowValues] = useState(true);
    const [showZeroStock, setShowZeroStock] = useState(false);
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState({
        groupBy: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const isFormValid = asOfDate && groupBy;

    // Get dynamic columns based on grouping and options
    const columns = getColumns(groupBy, showValues, ageBreakdown);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const demoData = generateDemoData(groupBy, showValues, ageBreakdown);
            showToast(`${groupByOptions.find(g => g.value === groupBy)?.label} ageing analysis generated successfully`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading Stock Ageing data", "error");
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

    // Update data when grouping or options change
    useEffect(() => {
        if (hasInitialLoad) {
            const demoData = generateDemoData(groupBy, showValues, ageBreakdown);
            setData(demoData);
        }
    }, [groupBy, showValues, ageBreakdown, hasInitialLoad]);

    // Calculate Stock Ageing statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const dataRows = data.filter(item => !item.is_header);
        
        const totalQuantity = dataRows.reduce((sum, item) => sum + (item.total_quantity || 0), 0);
        const totalValue = dataRows.reduce((sum, item) => sum + (item.total_value || 0), 0);
        const avgAge = dataRows.reduce((sum, item) => sum + (item.average_age || 0), 0) / dataRows.length;
        
        // Calculate age group totals
        let fresh = 0;
        let moderate = 0;
        let old = 0;
        let critical = 0;
        
        if (ageBreakdown === 'detailed') {
            fresh = dataRows.reduce((sum, item) => sum + (item.age_0_to_30 || 0), 0);
            moderate = dataRows.reduce((sum, item) => sum + (item.age_30_to_60 || 0) + (item.age_60_to_90 || 0), 0);
            old = dataRows.reduce((sum, item) => sum + (item.age_90_to_120 || 0), 0);
            critical = dataRows.reduce((sum, item) => sum + (item.age_120_plus || 0), 0);
        } else {
            fresh = dataRows.reduce((sum, item) => sum + (item.age_0_to_60 || 0), 0);
            moderate = dataRows.reduce((sum, item) => sum + (item.age_60_to_120 || 0), 0);
            critical = dataRows.reduce((sum, item) => sum + (item.age_120_plus || 0), 0);
        }
        
        return {
            totalItems: dataRows.length,
            totalQuantity,
            totalValue,
            averageAge: avgAge,
            freshStock: fresh,
            moderateStock: moderate,
            oldStock: old,
            criticalStock: critical,
            criticalPercentage: (critical / totalQuantity) * 100,
            healthyPercentage: (fresh / totalQuantity) * 100
        };
    })() : {
        totalItems: 0,
        totalQuantity: 0,
        totalValue: 0,
        averageAge: 0,
        freshStock: 0,
        moderateStock: 0,
        oldStock: 0,
        criticalStock: 0,
        criticalPercentage: 0,
        healthyPercentage: 0
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
        setAgeBreakdown('summary');
        setShowValues(true);
        setShowZeroStock(false);
        setErrors({
            groupBy: ''
        });
        setTouched(false);
        setData(generateDemoData(groupByOptions[0].value, true, 'summary'));
        setHasInitialLoad(true);
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Stock Ageing Analysis"
                subtitle="Analyze inventory aging patterns and identify slow-moving stock"
            />

            {/* Summary Cards - Stock Health Focused */}
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
                                        Fresh Stock
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={40} height={16} />
                                        ) : (
                                            `${summary?.freshStock || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.healthyPercentage?.toFixed(1) || 0}% of total
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
                                    <ScheduleIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Moderate Age
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={40} height={16} />
                                        ) : (
                                            `${summary?.moderateStock || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        30-120 days old
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
                                    <ErrorIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Critical Age
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={40} height={16} />
                                        ) : (
                                            `${summary?.criticalStock || 0}`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.criticalPercentage?.toFixed(1) || 0}% of total
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
                                        Average Age
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${Math.round(summary?.averageAge || 0)} days`
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.totalItems || 0} items
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
                            Stock Ageing Configuration
                        </Typography>
                        {Array.isArray(data) && data?.length > 0 && (
                            <Chip
                                label={`${Array.isArray(data) ? data.filter(item => !item.is_header).length : 0} items analyzed`}
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
                                    size="small"
                                    options={ageBreakdownOptions}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={ageBreakdownOptions.find(a => a.value === ageBreakdown) || null}
                                    onChange={(_, newValue) => {
                                        setAgeBreakdown(newValue?.value || 'summary');
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Age Breakdown"
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
                        <Grid item xs={12} sm={6} md={2.5}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showValues}
                                        onChange={(e) => setShowValues(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Show Values"
                                sx={{ mt: 1 }}
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
                                    {loader ? 'Loading...' : 'Analyze'}
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
                                    Analysis Options
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
                                        label="Detailed Breakdown" 
                                        size="small" 
                                        onClick={() => setAgeBreakdown(ageBreakdown === 'detailed' ? 'summary' : 'detailed')}
                                        color={ageBreakdown === 'detailed' ? 'primary' : 'default'}
                                        variant={ageBreakdown === 'detailed' ? 'filled' : 'outlined'}
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Quick Analysis
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip 
                                        label="Critical Items Only" 
                                        size="small" 
                                        onClick={() => {
                                            // This would filter for critical items in a real implementation
                                            showToast("Critical items filter applied", "info");
                                        }}
                                        color="error"
                                        variant="outlined"
                                    />
                                    <Chip 
                                        label="By Category" 
                                        size="small" 
                                        onClick={() => setGroupBy('category')}
                                        color="info"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Export Options
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip 
                                        label="Include Summary" 
                                        size="small" 
                                        color="success"
                                        variant="outlined"
                                    />
                                    <Chip 
                                        label="Show Percentages" 
                                        size="small" 
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
                                    <Skeleton variant="text" width={80} height={20} />
                                    <Skeleton variant="text" width={80} height={20} />
                                    <Skeleton variant="text" width={80} height={20} />
                                    <Skeleton variant="text" width={100} height={20} />
                                </Stack>
                            ))}
                        </Stack>
                    </Box>
                ) : !hasInitialLoad ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <CalendarTodayIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Stock Ageing Analysis
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your analysis parameters and click analyze to view inventory aging patterns
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={handleSearch}
                            sx={{ borderRadius: 2 }}
                        >
                            Start Analysis
                        </Button>
                    </Box>
                ) : Array.isArray(data) && data.length === 0 ? (
                    <Box sx={{ p: 6, textAlign: 'center' }}>
                        <AssessmentIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Ageing Data Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No stock ageing data found for the selected criteria. Try adjusting your filters.
                        </Typography>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleSearch}
                            sx={{ borderRadius: 2 }}
                        >
                            Refresh Analysis
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
                        fileTitle={`Stock Ageing Analysis - ${groupByOptions.find(g => g.value === groupBy)?.label} - ${moment(asOfDate).format('DD-MM-YYYY')}`}
                        printPreviewProps={{
                            title: `Stock Ageing Analysis Report`,
                            asOfDate: moment(asOfDate).format('DD-MM-YYYY'),
                            groupBy: groupByOptions.find(g => g.value === groupBy)?.label || 'By Product',
                            ageBreakdown: ageBreakdownOptions.find(a => a.value === ageBreakdown)?.label || 'Summary',
                            showValues: showValues ? 'Yes' : 'No',
                            columns,
                            data,
                            summary,
                        }}
                        PrintPreviewComponent={StockAgeingPrint}
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
                                // Age-based highlighting
                                ...(!row.original?.is_header && row.original?.ageing_status === 'critical' && {
                                    bgcolor: alpha(theme.palette.error.main, 0.03),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                    },
                                }),
                                ...(!row.original?.is_header && row.original?.ageing_status === 'warning' && {
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

export default StockAgeing;
