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
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import moment from 'moment';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import TimelineIcon from '@mui/icons-material/Timeline';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import { useToast } from '../../../../hooks/Common';
import { GetSingleListResult } from '../../../../hooks/Api';
import SalesAnalysisPrint from './SalesAnalysisPrint';
 
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

const AmountCell = ({ cell, row, showSign = false, chipStyle = false, trend = null }) => {
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
    
    // Color coding based on trend
    let color = isPositive ? 'success.main' : 'error.main';
    if (trend) {
        if (trend === 'up') color = 'success.main';
        else if (trend === 'down') color = 'error.main';
        else if (trend === 'stable') color = 'info.main';
    }
    
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
            color={color}
        >
            {showSign && isPositive ? '+' : ''}{absValue}
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

// Column configurations for different analysis types
const getColumns = (analysisType, timeframe, comparison) => {
    const baseColumns = [];
    
    // Dynamic columns based on analysis type
    if (analysisType === 'customer') {
        baseColumns.push({
            accessorKey: 'customer_name',
            header: 'Customer Name',
            size: 250,
            Cell: EntityNameCell,
        });
        baseColumns.push({
            accessorKey: 'customer_code',
            header: 'Code', 
            size: 120,
            Cell: CustomerCodeCell,
        });
    } else if (analysisType === 'product') {
        baseColumns.push({
            accessorKey: 'product_name',
            header: 'Product Name',
            size: 250,
            Cell: EntityNameCell,
        });
        baseColumns.push({
            accessorKey: 'product_code',
            header: 'Code', 
            size: 120,
            Cell: CustomerCodeCell,
        });
    } else if (analysisType === 'salesman') {
        baseColumns.push({
            accessorKey: 'salesman_name',
            header: 'Salesman Name',
            size: 250,
            Cell: EntityNameCell,
        });
        baseColumns.push({
            accessorKey: 'salesman_code',
            header: 'Code', 
            size: 120,
            Cell: CustomerCodeCell,
        });
    } else if (analysisType === 'territory') {
        baseColumns.push({
            accessorKey: 'territory_name',
            header: 'Territory/Region',
            size: 250,
            Cell: EntityNameCell,
        });
        baseColumns.push({
            accessorKey: 'territory_code',
            header: 'Code', 
            size: 120,
            Cell: CustomerCodeCell,
        });
    } else if (analysisType === 'trend') {
        baseColumns.push({
            accessorKey: 'period',
            header: `Period (${timeframe})`,
            size: 200,
            Cell: EntityNameCell,
        });
    }

    // Core analysis columns
    const coreColumns = [
        {
            accessorKey: 'sales_amount',
            header: 'Sales Amount',
            size: 130,
            Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false, chipStyle: true }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'quantity_sold',
            header: 'Quantity',
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
        },
        {
            accessorKey: 'margin_percent',
            header: 'Margin %',
            size: 100,
            Cell: PercentageCell,
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        }
    ];

    // Add comparison columns if enabled
    const comparisonColumns = comparison ? [
        {
            accessorKey: 'previous_sales',
            header: 'Previous Period',
            size: 130,
            Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: false }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'growth_amount',
            header: 'Growth',
            size: 120,
            Cell: ({ cell, row }) => AmountCell({ cell, row, showSign: true }),
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        },
        {
            accessorKey: 'growth_percent',
            header: 'Growth %',
            size: 100,
            Cell: PercentageCell,
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        }
    ] : [];

    // Add market share for customer/product analysis
    const marketShareColumns = (analysisType === 'customer' || analysisType === 'product') ? [
        {
            accessorKey: 'market_share',
            header: 'Market Share %',
            size: 120,
            Cell: ({ cell, row }) => {
                const value = cell.getValue();
                if (!value || value === 0) return <Typography variant="body2" color="text.secondary">0.0%</Typography>;
                
                return (
                    <Chip
                        label={`${value.toFixed(1)}%`}
                        size="small"
                        color={value > 15 ? 'success' : value > 5 ? 'warning' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                    />
                );
            },
            muiTableBodyCellProps: { align: 'right' }, 
            headerProps: { align: 'right' }
        }
    ] : [];

    return [...baseColumns, ...coreColumns, ...comparisonColumns, ...marketShareColumns];
};

// Analysis types
const analysisTypes = [
    { value: 'customer', label: 'Customer Analysis', icon: PeopleIcon },
    { value: 'product', label: 'Product Analysis', icon: InventoryIcon },
    { value: 'salesman', label: 'Salesman Performance', icon: BusinessIcon },
    { value: 'territory', label: 'Territory Analysis', icon: AssessmentIcon },
    { value: 'trend', label: 'Trend Analysis', icon: TimelineIcon }
];

// Timeframe options
const timeframeOptions = [
    { value: 'daily', label: 'Daily Analysis' },
    { value: 'weekly', label: 'Weekly Analysis' },
    { value: 'monthly', label: 'Monthly Analysis' },
    { value: 'quarterly', label: 'Quarterly Analysis' },
    { value: 'yearly', label: 'Yearly Analysis' }
];

// Chart types for visualization
const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: BarChartIcon },
    { value: 'line', label: 'Line Chart', icon: ShowChartIcon },
    { value: 'pie', label: 'Pie Chart', icon: PieChartIcon }
];

// Demo data generator for Sales Analysis
const generateDemoData = (analysisType, timeframe, comparison) => {
    const baseData = [];
    
    if (analysisType === 'customer') {
        return [
            {
                customer_code: 'C001',
                customer_name: 'ABC Corporation Ltd.',
                is_header: false,
                level: 0,
                sales_amount: 245000.00,
                quantity_sold: 1250,
                gross_profit: 92000.00,
                margin_percent: 37.6,
                previous_sales: 198000.00,
                growth_amount: 47000.00,
                growth_percent: 23.7,
                market_share: 18.5,
                rank: 1
            },
            {
                customer_code: 'C002',
                customer_name: 'XYZ Trading Company',
                is_header: false,
                level: 0,
                sales_amount: 189000.00,
                quantity_sold: 945,
                gross_profit: 71000.00,
                margin_percent: 37.6,
                previous_sales: 172000.00,
                growth_amount: 17000.00,
                growth_percent: 9.9,
                market_share: 14.3,
                rank: 2
            },
            {
                customer_code: 'C003',
                customer_name: 'Global Industries Inc.',
                is_header: false,
                level: 0,
                sales_amount: 156000.00,
                quantity_sold: 780,
                gross_profit: 58500.00,
                margin_percent: 37.5,
                previous_sales: 145000.00,
                growth_amount: 11000.00,
                growth_percent: 7.6,
                market_share: 11.8,
                rank: 3
            },
            {
                customer_code: 'C004',
                customer_name: 'Tech Solutions Pvt Ltd',
                is_header: false,
                level: 0,
                sales_amount: 134000.00,
                quantity_sold: 670,
                gross_profit: 50250.00,
                margin_percent: 37.5,
                previous_sales: 156000.00,
                growth_amount: -22000.00,
                growth_percent: -14.1,
                market_share: 10.1,
                rank: 4
            },
            {
                customer_code: 'C005',
                customer_name: 'Prime Retail Group',
                is_header: false,
                level: 0,
                sales_amount: 98000.00,
                quantity_sold: 490,
                gross_profit: 36750.00,
                margin_percent: 37.5,
                previous_sales: 89000.00,
                growth_amount: 9000.00,
                growth_percent: 10.1,
                market_share: 7.4,
                rank: 5
            },
            {
                customer_code: 'TOTAL',
                customer_name: 'TOTAL SALES',
                is_header: true,
                level: 0,
                sales_amount: 822000.00,
                quantity_sold: 4135,
                gross_profit: 308500.00,
                margin_percent: 37.5,
                previous_sales: 760000.00,
                growth_amount: 62000.00,
                growth_percent: 8.2,
                market_share: 100.0,
                rank: null
            }
        ];
    }
    
    if (analysisType === 'product') {
        return [
            {
                product_code: 'P001',
                product_name: 'Laptop Computer - Dell Inspiron Series',
                is_header: false,
                level: 0,
                sales_amount: 185000.00,
                quantity_sold: 125,
                gross_profit: 69250.00,
                margin_percent: 37.4,
                previous_sales: 156000.00,
                growth_amount: 29000.00,
                growth_percent: 18.6,
                market_share: 22.5,
                rank: 1
            },
            {
                product_code: 'P002',
                product_name: 'Office Chair - Ergonomic Premium',
                is_header: false,
                level: 0,
                sales_amount: 142000.00,
                quantity_sold: 710,
                gross_profit: 53250.00,
                margin_percent: 37.5,
                previous_sales: 134000.00,
                growth_amount: 8000.00,
                growth_percent: 6.0,
                market_share: 17.3,
                rank: 2
            },
            {
                product_code: 'P003',
                product_name: 'Printer - HP LaserJet Enterprise',
                is_header: false,
                level: 0,
                sales_amount: 128000.00,
                quantity_sold: 320,
                gross_profit: 48000.00,
                margin_percent: 37.5,
                previous_sales: 145000.00,
                growth_amount: -17000.00,
                growth_percent: -11.7,
                market_share: 15.6,
                rank: 3
            },
            {
                product_code: 'P004',
                product_name: 'Desktop Computer - HP Elite Series',
                is_header: false,
                level: 0,
                sales_amount: 98000.00,
                quantity_sold: 98,
                gross_profit: 36750.00,
                margin_percent: 37.5,
                previous_sales: 89000.00,
                growth_amount: 9000.00,
                growth_percent: 10.1,
                market_share: 11.9,
                rank: 4
            },
            {
                product_code: 'P005',
                product_name: 'Monitor - 24" LED Display',
                is_header: false,
                level: 0,
                sales_amount: 76000.00,
                quantity_sold: 380,
                gross_profit: 28500.00,
                margin_percent: 37.5,
                previous_sales: 72000.00,
                growth_amount: 4000.00,
                growth_percent: 5.6,
                market_share: 9.2,
                rank: 5
            },
            {
                product_code: 'TOTAL',
                product_name: 'TOTAL SALES',
                is_header: true,
                level: 0,
                sales_amount: 629000.00,
                quantity_sold: 1633,
                gross_profit: 235750.00,
                margin_percent: 37.5,
                previous_sales: 596000.00,
                growth_amount: 33000.00,
                growth_percent: 5.5,
                market_share: 100.0,
                rank: null
            }
        ];
    }
    
    if (analysisType === 'salesman') {
        return [
            {
                salesman_code: 'S001',
                salesman_name: 'Ahmed Ali - Senior Sales Manager',
                is_header: false,
                level: 0,
                sales_amount: 285000.00,
                quantity_sold: 1425,
                gross_profit: 106875.00,
                margin_percent: 37.5,
                previous_sales: 245000.00,
                growth_amount: 40000.00,
                growth_percent: 16.3,
                target_achievement: 114.0,
                rank: 1
            },
            {
                salesman_code: 'S002',
                salesman_name: 'Sarah Johnson - Sales Executive',
                is_header: false,
                level: 0,
                sales_amount: 234000.00,
                quantity_sold: 1170,
                gross_profit: 87750.00,
                margin_percent: 37.5,
                previous_sales: 198000.00,
                growth_amount: 36000.00,
                growth_percent: 18.2,
                target_achievement: 117.0,
                rank: 2
            },
            {
                salesman_code: 'S003',
                salesman_name: 'Mohammed Hassan - Territory Manager',
                is_header: false,
                level: 0,
                sales_amount: 189000.00,
                quantity_sold: 945,
                gross_profit: 70875.00,
                margin_percent: 37.5,
                previous_sales: 167000.00,
                growth_amount: 22000.00,
                growth_percent: 13.2,
                target_achievement: 105.0,
                rank: 3
            },
            {
                salesman_code: 'TOTAL',
                salesman_name: 'TOTAL SALES',
                is_header: true,
                level: 0,
                sales_amount: 708000.00,
                quantity_sold: 3540,
                gross_profit: 265500.00,
                margin_percent: 37.5,
                previous_sales: 610000.00,
                growth_amount: 98000.00,
                growth_percent: 16.1,
                target_achievement: 112.0,
                rank: null
            }
        ];
    }
    
    if (analysisType === 'territory') {
        return [
            {
                territory_code: 'T001',
                territory_name: 'Dubai - Central Business District',
                is_header: false,
                level: 0,
                sales_amount: 345000.00,
                quantity_sold: 1725,
                gross_profit: 129375.00,
                margin_percent: 37.5,
                previous_sales: 298000.00,
                growth_amount: 47000.00,
                growth_percent: 15.8,
                market_share: 32.1,
                rank: 1
            },
            {
                territory_code: 'T002',
                territory_name: 'Abu Dhabi - Government Sector',
                is_header: false,
                level: 0,
                sales_amount: 267000.00,
                quantity_sold: 1335,
                gross_profit: 100125.00,
                margin_percent: 37.5,
                previous_sales: 234000.00,
                growth_amount: 33000.00,
                growth_percent: 14.1,
                market_share: 24.9,
                rank: 2
            },
            {
                territory_code: 'T003',
                territory_name: 'Sharjah - Industrial Zone',
                is_header: false,
                level: 0,
                sales_amount: 198000.00,
                quantity_sold: 990,
                gross_profit: 74250.00,
                margin_percent: 37.5,
                previous_sales: 189000.00,
                growth_amount: 9000.00,
                growth_percent: 4.8,
                market_share: 18.4,
                rank: 3
            },
            {
                territory_code: 'T004',
                territory_name: 'Northern Emirates - Retail',
                is_header: false,
                level: 0,
                sales_amount: 164000.00,
                quantity_sold: 820,
                gross_profit: 61500.00,
                margin_percent: 37.5,
                previous_sales: 156000.00,
                growth_amount: 8000.00,
                growth_percent: 5.1,
                market_share: 15.3,
                rank: 4
            },
            {
                territory_code: 'TOTAL',
                territory_name: 'TOTAL SALES',
                is_header: true,
                level: 0,
                sales_amount: 974000.00,
                quantity_sold: 4870,
                gross_profit: 365250.00,
                margin_percent: 37.5,
                previous_sales: 877000.00,
                growth_amount: 97000.00,
                growth_percent: 11.1,
                market_share: 100.0,
                rank: null
            }
        ];
    }
    
    if (analysisType === 'trend') {
        const periods = timeframe === 'monthly' ? [
            'January 2025', 'February 2025', 'March 2025', 'April 2025', 'May 2025', 'June 2025'
        ] : timeframe === 'quarterly' ? [
            'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'
        ] : [
            '2021', '2022', '2023', '2024', '2025 YTD'
        ];
        
        return periods.map((period, index) => ({
            period,
            is_header: false,
            level: 0,
            sales_amount: 150000 + (Math.random() * 100000),
            quantity_sold: 750 + Math.floor(Math.random() * 500),
            gross_profit: (150000 + (Math.random() * 100000)) * 0.375,
            margin_percent: 37.0 + (Math.random() * 3),
            previous_sales: index > 0 ? 140000 + (Math.random() * 90000) : 0,
            growth_amount: index > 0 ? -10000 + (Math.random() * 40000) : 0,
            growth_percent: index > 0 ? -5 + (Math.random() * 25) : 0,
            trend_direction: Math.random() > 0.5 ? 'up' : 'down'
        }));
    }
    
    return [];
};

const SalesAnalysis = () => {
    const theme = useTheme();
    const { showToast } = useToast();
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [analysisType, setAnalysisType] = useState(analysisTypes[0].value); // Default to customer
    const [timeframe, setTimeframe] = useState(timeframeOptions[2].value); // Default to monthly
    const [comparison, setComparison] = useState(true); // Enable comparison by default
    const [chartType, setChartType] = useState(chartTypes[0].value); // Default to bar chart
    const [data, setData] = useState([]);
    const [errors, setErrors] = useState({
        analysisType: '',
        timeframe: ''
    });
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    const isFormValid = fromDate && toDate && analysisType && timeframe;

    // Get dynamic columns based on analysis type and settings
    const columns = getColumns(analysisType, timeframe, comparison);

    const getReportData = async () => {
        setLoader(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const demoData = generateDemoData(analysisType, timeframe, comparison);
            showToast(`${analysisTypes.find(a => a.value === analysisType)?.label} generated successfully`, "success");
            setData(demoData);
        } catch (error) {
            showToast("Error loading Sales Analysis data", "error");
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

    // Update data when analysis type or settings change
    useEffect(() => {
        if (hasInitialLoad) {
            const demoData = generateDemoData(analysisType, timeframe, comparison);
            setData(demoData);
        }
    }, [analysisType, timeframe, comparison, hasInitialLoad]);

    // Calculate Sales Analysis summary statistics
    const summary = Array.isArray(data) && data.length > 0 ? (() => {
        const totalRow = data.find(item => item.is_header) || {};
        const dataRows = data.filter(item => !item.is_header);
        
        return {
            totalSales: totalRow.sales_amount || 0,
            totalQuantity: totalRow.quantity_sold || 0,
            totalProfit: totalRow.gross_profit || 0,
            avgMargin: totalRow.margin_percent || 0,
            growthPercent: totalRow.growth_percent || 0,
            topPerformer: dataRows.length > 0 ? dataRows[0] : null,
            entityCount: dataRows.length,
            bestGrowth: dataRows.reduce((best, current) => 
                (current.growth_percent > (best?.growth_percent || -Infinity)) ? current : best, null
            )
        };
    })() : {
        totalSales: 0,
        totalQuantity: 0,
        totalProfit: 0,
        avgMargin: 0,
        growthPercent: 0,
        topPerformer: null,
        entityCount: 0,
        bestGrowth: null
    };

    const handleSearch = () => {
        setTouched(true);
        const newErrors = {
            analysisType: !analysisType ? 'Analysis Type is required' : '',
            timeframe: !timeframe ? 'Timeframe is required' : ''
        };
        setErrors(newErrors);

        if (isFormValid) {
            getReportData();
        }
    };

    const handleReset = () => {
        setFromDate(dayjs().startOf('month').format('YYYY-MM-DD'));
        setToDate(dayjs().format('YYYY-MM-DD'));
        setAnalysisType(analysisTypes[0].value); // Reset to customer
        setTimeframe(timeframeOptions[2].value); // Reset to monthly
        setComparison(true);
        setChartType(chartTypes[0].value);
        setErrors({
            analysisType: '',
            timeframe: ''
        });
        setTouched(false);
        setData(generateDemoData(analysisTypes[0].value, timeframeOptions[2].value, true));
        setHasInitialLoad(true);
        showToast("Filters reset successfully", "success");
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Page Header */}
            <PageHeader 
                title="Sales Analysis Report"
                subtitle="Comprehensive sales performance analysis and insights"
            />

            {/* Summary Cards - Analysis Focused */}
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
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        ({summary?.avgMargin?.toFixed(1) || '0.0'}% margin)
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
                            background: `linear-gradient(135deg, ${summary?.growthPercent >= 0 ? theme.palette.info.light : theme.palette.warning.light} 0%, ${summary?.growthPercent >= 0 ? theme.palette.info.main : theme.palette.warning.main} 100%)`,
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
                                    {summary?.growthPercent >= 0 ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Growth Rate
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2 }}>
                                        {loader ? (
                                            <Skeleton width={50} height={16} />
                                        ) : (
                                            `${summary?.growthPercent >= 0 ? '+' : ''}${summary?.growthPercent?.toFixed(1) || '0.0'}%`
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
                                    <InventoryIcon fontSize="small" />
                                </Box>
                                <Box flex={1}>
                                    <Typography variant="caption" sx={{ opacity: 0.8, mb: 0.1, display: 'block', fontSize: '0.7rem' }}>
                                        Top Performer
                                    </Typography>
                                    <Typography variant="subtitle2" fontWeight={600} sx={{ lineHeight: 1.2, fontSize: '0.8rem' }}>
                                        {loader ? (
                                            <Skeleton width={60} height={16} />
                                        ) : (
                                            summary?.topPerformer ? 
                                            `${summary.topPerformer[`${analysisType}_name`]?.substring(0, 15)}...` : 
                                            'N/A'
                                        )}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.8, fontSize: '0.65rem' }}>
                                        {summary?.entityCount || 0} total entities
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
                            Analysis Configuration
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
                                    options={analysisTypes}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={analysisTypes.find(a => a.value === analysisType) || null}
                                    onChange={(_, newValue) => {
                                        setAnalysisType(newValue?.value || '');
                                        setErrors(prev => ({ ...prev, analysisType: '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Analysis Type"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.analysisType)}
                                            helperText={errors.analysisType}
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
                                    options={timeframeOptions}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={timeframeOptions.find(t => t.value === timeframe) || null}
                                    onChange={(_, newValue) => {
                                        setTimeframe(newValue?.value || '');
                                        setErrors(prev => ({ ...prev, timeframe: '' }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Timeframe"
                                            variant="outlined"
                                            size="small"
                                            error={Boolean(errors.timeframe)}
                                            helperText={errors.timeframe}
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
                                <Stack spacing={2}>
                                    <Typography variant="subtitle2" fontWeight={600}>Comparison Settings</Typography>
                                    <ToggleButtonGroup
                                        value={comparison}
                                        exclusive
                                        onChange={(_, newValue) => setComparison(newValue)}
                                        size="small"
                                        sx={{ '& .MuiToggleButton-root': { borderRadius: 2 } }}
                                    >
                                        <ToggleButton value >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <TrendingUpIcon fontSize="small" />
                                                <Typography variant="body2">Enable Comparison</Typography>
                                            </Stack>
                                        </ToggleButton>
                                        <ToggleButton value={false}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body2">Simple View</Typography>
                                            </Stack>
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <Stack spacing={2}>
                                    <Typography variant="subtitle2" fontWeight={600}>Visualization Type</Typography>
                                    <ToggleButtonGroup
                                        value={chartType}
                                        exclusive
                                        onChange={(_, newValue) => newValue && setChartType(newValue)}
                                        size="small"
                                        sx={{ '& .MuiToggleButton-root': { borderRadius: 2 } }}
                                    >
                                        {chartTypes.map(type => (
                                            <ToggleButton key={type.value} value={type.value}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <type.icon fontSize="small" />
                                                    <Typography variant="body2">{type.label}</Typography>
                                                </Stack>
                                            </ToggleButton>
                                        ))}
                                    </ToggleButtonGroup>
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
                        <TimelineIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Welcome to Sales Analysis
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            Configure your analysis parameters and click analyze to generate insights
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
                            No Analysis Data Found
                        </Typography>
                        <Typography variant="body2" color="text.disabled" mb={3}>
                            No sales data found for the selected criteria. Try adjusting your parameters.
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
                        fileTitle={`Sales Analysis - ${analysisTypes.find(a => a.value === analysisType)?.label} - ${timeframeOptions.find(t => t.value === timeframe)?.label}`}
                        printPreviewProps={{
                            title: `Sales Analysis Report`,
                            dateRange: `${moment(fromDate).format('DD-MM-YYYY')} - ${moment(toDate).format('DD-MM-YYYY')}`,
                            analysisType: analysisTypes.find(a => a.value === analysisType)?.label || 'Customer Analysis',
                            timeframe: timeframeOptions.find(t => t.value === timeframe)?.label || 'Monthly',
                            comparison: comparison ? 'Enabled' : 'Disabled',
                            chartType: chartTypes.find(c => c.value === chartType)?.label || 'Bar Chart',
                            columns,
                            fromDate,
                            toDate,
                            summary,
                        }}
                        PrintPreviewComponent={SalesAnalysisPrint}
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
                                // Ranking-based color coding
                                ...(!row.original?.is_header && row.original?.rank === 1 && {
                                    bgcolor: alpha(theme.palette.success.main, 0.05),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                    },
                                    '& .MuiTableCell-root': {
                                        py: 2,
                                        px: 2,
                                        minHeight: '56px',
                                    },
                                }),
                                ...(!row.original?.is_header && row.original?.rank === 2 && {
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
                                ...(!row.original?.is_header && row.original?.rank === 3 && {
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
                                // Default row styling for normal rows
                                ...(!row.original?.is_header && (!row.original?.rank || row.original?.rank > 3) && {
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

export default SalesAnalysis;
