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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import InventoryIcon from '@mui/icons-material/Inventory';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BarChartIcon from '@mui/icons-material/BarChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import TimelineIcon from '@mui/icons-material/Timeline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import PurchaseAnalysisPrint from './PurchaseAnalysisPrint';

dayjs.extend(isBetween);

// Demo data generator
const generatePurchaseAnalysisData = (count = 50) => {
    const suppliers = [
        'ABC Electronics Ltd', 'Global Tech Solutions', 'Prime Components Co', 'TechnoMart International',
        'Digital Systems Inc', 'Smart Electronics Corp', 'Advanced Tech Ltd', 'ElectroMax Solutions',
        'TechHub Suppliers', 'Innovation Components', 'NextGen Electronics', 'ProTech Systems'
    ];
    
    const categories = [
        'Electronics', 'Computer Hardware', 'Software', 'Office Supplies', 'Networking Equipment',
        'Mobile Devices', 'Audio/Video', 'Accessories', 'Tools & Equipment', 'Furniture'
    ];
    
    const products = [
        'Laptop Dell XPS 13', 'iPhone 14 Pro', 'Samsung Galaxy S23', 'HP LaserJet Printer',
        'Wireless Mouse', 'Bluetooth Headphones', 'USB-C Cable', 'Monitor 27inch 4K',
        'Keyboard Mechanical', 'Router WiFi 6', 'External HDD 2TB', 'Webcam HD 1080p',
        'Office Chair Executive', 'Desk Lamp LED', 'Power Bank 20000mAh', 'Tablet iPad Air'
    ];
    
    const data = [];
    
    for (let i = 0; i < count; i += 1) {
        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        
        const quantity = Math.floor(Math.random() * 100) + 1;
        const unitCost = Math.floor(Math.random() * 1000) + 50;
        const totalCost = quantity * unitCost;
        
        const purchaseDate = dayjs().subtract(Math.floor(Math.random() * 90), 'day');
        const deliveryDate = purchaseDate.add(Math.floor(Math.random() * 14) + 1, 'day');
        
        const leadTime = deliveryDate.diff(purchaseDate, 'day');
        const onTimeDelivery = leadTime <= 7;
        
        data.push({
            id: `PA${String(i + 1).padStart(4, '0')}`,
            supplier,
            category,
            product,
            quantity,
            unitCost,
            totalCost,
            purchaseDate: purchaseDate.format('YYYY-MM-DD'),
            deliveryDate: deliveryDate.format('YYYY-MM-DD'),
            leadTime,
            onTimeDelivery,
            discount: Math.floor(Math.random() * 15),
            finalCost: totalCost * (1 - Math.floor(Math.random() * 15) / 100),
            status: Math.random() > 0.1 ? 'Completed' : Math.random() > 0.5 ? 'Pending' : 'Cancelled',
            priority: Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low',
            paymentTerms: Math.random() > 0.5 ? 'Net 30' : Math.random() > 0.3 ? 'Net 15' : 'COD'
        });
    }
    
    return data.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
};

const quickFilters = [
    { label: 'Last 7 Days', value: 7, icon: '📅' },
    { label: 'Last 30 Days', value: 30, icon: '📆' },
    { label: 'This Quarter', value: 90, icon: '📊' },
    { label: 'High Priority', value: 'high-priority', icon: '🔥' },
    { label: 'On-Time Delivery', value: 'on-time', icon: '✅' },
    { label: 'Late Delivery', value: 'late', icon: '⚠️' }
];

const PurchaseAnalysis = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
    const [endDate, setEndDate] = useState(dayjs());
    const [supplierFilter, setSupplierFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedQuickFilter, setSelectedQuickFilter] = useState(null);
    const [showPrint, setShowPrint] = useState(false);

    // Advanced filters
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [paymentTermsFilter, setPaymentTermsFilter] = useState('');

    useEffect(() => {
        const mockData = generatePurchaseAnalysisData(75);
        setData(mockData);
        setFilteredData(mockData);
    }, []);

    const handleQuickFilter = (filter) => {
        setSelectedQuickFilter(filter.value);
        let filtered = [...data];
        
        if (typeof filter.value === 'number') {
            const filterDate = dayjs().subtract(filter.value, 'day');
            filtered = filtered.filter(item => 
                dayjs(item.purchaseDate).isAfter(filterDate)
            );
        } else if (filter.value === 'high-priority') {
            filtered = filtered.filter(item => item.priority === 'High');
        } else if (filter.value === 'on-time') {
            filtered = filtered.filter(item => item.onTimeDelivery);
        } else if (filter.value === 'late') {
            filtered = filtered.filter(item => !item.onTimeDelivery);
        }
        
        setFilteredData(filtered);
    };

    const applyFilters = () => {
        setLoading(true);
        
        setTimeout(() => {
            const filtered = data.filter(item => {
                const itemDate = dayjs(item.purchaseDate);
                const dateInRange = itemDate.isBetween(startDate, endDate, null, '[]');
                const supplierMatch = !supplierFilter || item.supplier.toLowerCase().includes(supplierFilter.toLowerCase());
                const categoryMatch = !categoryFilter || item.category.toLowerCase().includes(categoryFilter.toLowerCase());
                const statusMatch = !statusFilter || item.status === statusFilter;
                const minAmountMatch = !minAmount || item.finalCost >= parseFloat(minAmount);
                const maxAmountMatch = !maxAmount || item.finalCost <= parseFloat(maxAmount);
                const priorityMatch = !priorityFilter || item.priority === priorityFilter;
                const paymentTermsMatch = !paymentTermsFilter || item.paymentTerms === paymentTermsFilter;
                
                return dateInRange && supplierMatch && categoryMatch && statusMatch && 
                       minAmountMatch && maxAmountMatch && priorityMatch && paymentTermsMatch;
            });
            
            setFilteredData(filtered);
            setLoading(false);
        }, 500);
    };

    const clearFilters = () => {
        setSupplierFilter('');
        setCategoryFilter('');
        setStatusFilter('');
        setMinAmount('');
        setMaxAmount('');
        setPriorityFilter('');
        setPaymentTermsFilter('');
        setSelectedQuickFilter(null);
        setFilteredData(data);
    };

    // Calculate summary statistics
    const totalPurchases = filteredData.length;
    const totalAmount = filteredData.reduce((sum, item) => sum + item.finalCost, 0);
    const avgOrderValue = totalAmount / (totalPurchases || 1);
    const onTimeDeliveryRate = filteredData.length > 0 
        ? (filteredData.filter(item => item.onTimeDelivery).length / filteredData.length) * 100 
        : 0;
    const topSupplier = filteredData.reduce((acc, item) => {
        acc[item.supplier] = (acc[item.supplier] || 0) + item.finalCost;
        return acc;
    }, {});
    const bestSupplier = Object.keys(topSupplier).reduce((a, b) => 
        topSupplier[a] > topSupplier[b] ? a : b, 'N/A'
    );

    // Get unique values for filters
    const uniqueSuppliers = [...new Set(data.map(item => item.supplier))].sort();
    const uniqueCategories = [...new Set(data.map(item => item.category))].sort();
    const uniqueStatuses = [...new Set(data.map(item => item.status))].sort();
    const uniquePriorities = [...new Set(data.map(item => item.priority))].sort();
    const uniquePaymentTerms = [...new Set(data.map(item => item.paymentTerms))].sort();

    const columns = [
        {
            field: 'id',
            headerName: 'Purchase ID',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'supplier',
            headerName: 'Supplier',
            width: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            )
        },
        {
            field: 'category',
            headerName: 'Category',
            width: 150,
            renderCell: (params) => (
                <Chip 
                    label={params.value} 
                    size="small" 
                    sx={{ 
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        fontWeight: 500
                    }} 
                />
            )
        },
        {
            field: 'product',
            headerName: 'Product',
            width: 180,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'quantity',
            headerName: 'Qty',
            width: 80,
            align: 'center',
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {params.value.toLocaleString()}
                </Typography>
            )
        },
        {
            field: 'finalCost',
            headerName: 'Final Cost',
            width: 120,
            align: 'right',
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                    ${params.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
            )
        },
        {
            field: 'purchaseDate',
            headerName: 'Purchase Date',
            width: 120,
            renderCell: (params) => (
                <Typography variant="body2">
                    {dayjs(params.value).format('MMM DD, YYYY')}
                </Typography>
            )
        },
        {
            field: 'leadTime',
            headerName: 'Lead Time',
            width: 100,
            align: 'center',
            renderCell: (params) => (
                <Chip 
                    label={`${params.value} days`}
                    size="small"
                    color={params.value <= 7 ? 'success' : params.value <= 14 ? 'warning' : 'error'}
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip 
                    label={params.value}
                    size="small"
                    color={
                        params.value === 'Completed' ? 'success' :
                        params.value === 'Pending' ? 'warning' : 'error'
                    }
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        {
            field: 'priority',
            headerName: 'Priority',
            width: 100,
            renderCell: (params) => (
                <Chip 
                    label={params.value}
                    size="small"
                    color={
                        params.value === 'High' ? 'error' :
                        params.value === 'Medium' ? 'warning' : 'default'
                    }
                    sx={{ fontWeight: 500 }}
                />
            )
        }
    ];

    if (showPrint) {
        return (
            <PurchaseAnalysisPrint
                data={filteredData}
                filters={{
                    startDate,
                    endDate,
                    supplier: supplierFilter,
                    category: categoryFilter,
                    status: statusFilter
                }}
                onClose={() => setShowPrint(false)}
            />
        );
    }

    return (
        <Container maxWidth="xl">
            <PageHeader 
                title="Purchase Analysis" 
                subtitle="Comprehensive analysis of purchase transactions and supplier performance"
                icon={<AssessmentIcon />}
                action={
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => {
                                    const newData = generatePurchaseAnalysisData(75);
                                    setData(newData);
                                    setFilteredData(newData);
                                    setLoading(false);
                                }, 1000);
                            }}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AssessmentIcon />}
                            onClick={() => setShowPrint(true)}
                        >
                            Print Report
                        </Button>
                    </Stack>
                }
            />

            {/* Quick Filter Chips */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {quickFilters.map((filter) => (
                        <Chip
                            key={filter.value}
                            label={`${filter.icon} ${filter.label}`}
                            onClick={() => handleQuickFilter(filter)}
                            color={selectedQuickFilter === filter.value ? "primary" : "default"}
                            variant={selectedQuickFilter === filter.value ? "filled" : "outlined"}
                            sx={{ fontWeight: 500 }}
                        />
                    ))}
                    {selectedQuickFilter && (
                        <Chip
                            label="Clear Filters"
                            onClick={clearFilters}
                            color="error"
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                        />
                    )}
                </Stack>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)` }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        Total Purchases
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                        {loading ? <Skeleton width={60} /> : totalPurchases.toLocaleString()}
                                    </Typography>
                                </Box>
                                <ShoppingCartIcon sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.7 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)` }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        Total Amount
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                        {loading ? <Skeleton width={100} /> : `$${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                                    </Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.7 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)` }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        Avg Order Value
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                                        {loading ? <Skeleton width={80} /> : `$${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                                    </Typography>
                                </Box>
                                <BarChartIcon sx={{ fontSize: 40, color: theme.palette.info.main, opacity: 0.7 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)` }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        On-Time Delivery
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                                        {loading ? <Skeleton width={60} /> : `${onTimeDeliveryRate.toFixed(1)}%`}
                                    </Typography>
                                </Box>
                                <TimelineIcon sx={{ fontSize: 40, color: theme.palette.warning.main, opacity: 0.7 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FilterListIcon /> Filters
                        </Typography>
                        <Stack direction="row" spacing={1}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={showAdvanced}
                                        onChange={(e) => setShowAdvanced(e.target.checked)}
                                        size="small"
                                    />
                                }
                                label="Advanced"
                            />
                            <IconButton
                                onClick={() => setShowFilters(!showFilters)}
                                sx={{
                                    transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s'
                                }}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        </Stack>
                    </Stack>

                    <Collapse in={showFilters}>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} md={3}>
                                <DateSelector
                                    label="Start Date"
                                    value={startDate}
                                    onChange={setStartDate}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <DateSelector
                                    label="End Date"
                                    value={endDate}
                                    onChange={setEndDate}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={uniqueSuppliers}
                                    value={supplierFilter}
                                    onChange={(event, newValue) => setSupplierFilter(newValue || '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Supplier"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={uniqueCategories}
                                    value={categoryFilter}
                                    onChange={(event, newValue) => setCategoryFilter(newValue || '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Category"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        {/* Advanced Filters */}
                        <Collapse in={showAdvanced}>
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        label="Min Amount"
                                        type="number"
                                        value={minAmount}
                                        onChange={(e) => setMinAmount(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <TextField
                                        label="Max Amount"
                                        type="number"
                                        value={maxAmount}
                                        onChange={(e) => setMaxAmount(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Autocomplete
                                        options={uniqueStatuses}
                                        value={statusFilter}
                                        onChange={(event, newValue) => setStatusFilter(newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Status"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Autocomplete
                                        options={uniquePriorities}
                                        value={priorityFilter}
                                        onChange={(event, newValue) => setPriorityFilter(newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Priority"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2}>
                                    <Autocomplete
                                        options={uniquePaymentTerms}
                                        value={paymentTermsFilter}
                                        onChange={(event, newValue) => setPaymentTermsFilter(newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Payment Terms"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                            </Grid>
                        </Collapse>

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                onClick={applyFilters}
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={16} /> : <FilterListIcon />}
                            >
                                Apply Filters
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={clearFilters}
                            >
                                Clear All
                            </Button>
                        </Stack>
                    </Collapse>
                </CardContent>
            </Card>

            {/* Data Table */}
            <Paper sx={{ height: 600, width: '100%' }}>
                <DataTable
                    rows={filteredData}
                    columns={columns}
                    loading={loading}
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-cell': {
                            borderColor: alpha(theme.palette.divider, 0.5),
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            borderColor: alpha(theme.palette.divider, 0.5),
                        },
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        }
                    }}
                />
            </Paper>

            {/* Additional Insights */}
            {filteredData.length > 0 && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <BusinessIcon /> Top Supplier
                                </Typography>
                                <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>
                                    {bestSupplier}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Total Purchase Value: ${topSupplier[bestSupplier]?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CompareArrowsIcon /> Performance Metrics
                                </Typography>
                                <Stack spacing={1}>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2">Average Lead Time:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {(filteredData.reduce((sum, item) => sum + item.leadTime, 0) / filteredData.length).toFixed(1)} days
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2">Completed Orders:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                            {((filteredData.filter(item => item.status === 'Completed').length / filteredData.length) * 100).toFixed(1)}%
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between">
                                        <Typography variant="body2">High Priority Orders:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                                            {filteredData.filter(item => item.priority === 'High').length}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default PurchaseAnalysis;
