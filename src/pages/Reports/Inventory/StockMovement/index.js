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
    Avatar,
} from '@mui/material';
import moment from 'moment';
import FilterListIcon from '@mui/icons-material/FilterList';
import InventoryIcon from '@mui/icons-material/Inventory';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RefreshIcon from '@mui/icons-material/Refresh';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import TimelineIcon from '@mui/icons-material/Timeline';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PageHeader from '../../../../components/PageHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';
import StockMovementPrint from './StockMovementPrint';

dayjs.extend(isBetween);

// Demo data generator
const generateStockMovementData = (count = 100) => {
    const products = [
        'Laptop Dell XPS 13', 'iPhone 14 Pro', 'Samsung Galaxy S23', 'HP LaserJet Printer',
        'Wireless Mouse', 'Bluetooth Headphones', 'USB-C Cable', 'Monitor 27inch 4K',
        'Keyboard Mechanical', 'Router WiFi 6', 'External HDD 2TB', 'Webcam HD 1080p',
        'Office Chair Executive', 'Desk Lamp LED', 'Power Bank 20000mAh', 'Tablet iPad Air'
    ];
    
    const categories = [
        'Electronics', 'Computer Hardware', 'Software', 'Office Supplies', 'Networking Equipment',
        'Mobile Devices', 'Audio/Video', 'Accessories', 'Tools & Equipment', 'Furniture'
    ];
    
    const locations = [
        'Main Warehouse', 'Store A', 'Store B', 'Store C', 'Online Warehouse', 'Return Center'
    ];
    
    const movementTypes = [
        'Purchase Receipt', 'Sales Issue', 'Transfer In', 'Transfer Out', 'Adjustment In', 
        'Adjustment Out', 'Return In', 'Return Out', 'Production Receipt', 'Production Issue'
    ];
    
    const data = [];
    
    for (let i = 0; i < count; i += 1) {
        const product = products[Math.floor(Math.random() * products.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const movementType = movementTypes[Math.floor(Math.random() * movementTypes.length)];
        
        const isInward = ['Purchase Receipt', 'Transfer In', 'Adjustment In', 'Return In', 'Production Receipt'].includes(movementType);
        const quantity = Math.floor(Math.random() * 100) + 1;
        const unitCost = Math.floor(Math.random() * 1000) + 50;
        const totalValue = quantity * unitCost;
        
        const movementDate = dayjs().subtract(Math.floor(Math.random() * 90), 'day');
        
        data.push({
            id: `SM${String(i + 1).padStart(5, '0')}`,
            movementDate: movementDate.format('YYYY-MM-DD'),
            product,
            category,
            location,
            movementType,
            direction: isInward ? 'In' : 'Out',
            quantity: isInward ? quantity : -quantity,
            unitCost,
            totalValue: isInward ? totalValue : -totalValue,
            referenceNo: `REF${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
            batch: `BATCH${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
            serialNo: Math.random() > 0.5 ? `SN${String(Math.floor(Math.random() * 100000)).padStart(5, '0')}` : null,
            vendor: Math.random() > 0.4 ? `Vendor ${Math.floor(Math.random() * 10) + 1}` : null,
            notes: Math.random() > 0.7 ? 'Urgent delivery required' : Math.random() > 0.5 ? 'Quality checked' : null,
            createdBy: `User${Math.floor(Math.random() * 5) + 1}`,
            status: Math.random() > 0.1 ? 'Completed' : Math.random() > 0.5 ? 'Pending' : 'Cancelled'
        });
    }
    
    return data.sort((a, b) => new Date(b.movementDate) - new Date(a.movementDate));
};

const quickFilters = [
    { label: 'Today', value: 0, icon: '📅' },
    { label: 'Last 7 Days', value: 7, icon: '📆' },
    { label: 'Last 30 Days', value: 30, icon: '📊' },
    { label: 'Inward Only', value: 'inward', icon: '📈' },
    { label: 'Outward Only', value: 'outward', icon: '📉' },
    { label: 'Adjustments', value: 'adjustments', icon: '⚖️' }
];

const StockMovement = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
    const [endDate, setEndDate] = useState(dayjs());
    const [productFilter, setProductFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [movementTypeFilter, setMovementTypeFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [selectedQuickFilter, setSelectedQuickFilter] = useState(null);
    const [showPrint, setShowPrint] = useState(false);

    // Advanced filters
    const [categoryFilter, setCategoryFilter] = useState('');
    const [directionFilter, setDirectionFilter] = useState('');
    const [vendorFilter, setVendorFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        const mockData = generateStockMovementData(150);
        setData(mockData);
        setFilteredData(mockData);
    }, []);

    // Ensure data is always an array to prevent errors
    const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];
    const safeData = Array.isArray(data) ? data : [];

    const handleQuickFilter = (filter) => {
        setSelectedQuickFilter(filter.value);
        let filtered = [...safeData];
        
        if (typeof filter.value === 'number') {
            const filterDate = dayjs().subtract(filter.value, 'day');
            filtered = filtered.filter(item => 
                dayjs(item.movementDate).isAfter(filterDate)
            );
        } else if (filter.value === 'inward') {
            filtered = filtered.filter(item => item.direction === 'In');
        } else if (filter.value === 'outward') {
            filtered = filtered.filter(item => item.direction === 'Out');
        } else if (filter.value === 'adjustments') {
            filtered = filtered.filter(item => 
                item.movementType.includes('Adjustment')
            );
        }
        
        setFilteredData(filtered);
    };

    const applyFilters = () => {
        setLoading(true);
        
        setTimeout(() => {
            const filtered = safeData.filter(item => {
                const itemDate = dayjs(item.movementDate);
                const dateInRange = itemDate.isBetween(startDate, endDate, null, '[]');
                const productMatch = !productFilter || item.product.toLowerCase().includes(productFilter.toLowerCase());
                const locationMatch = !locationFilter || item.location === locationFilter;
                const movementTypeMatch = !movementTypeFilter || item.movementType === movementTypeFilter;
                const categoryMatch = !categoryFilter || item.category === categoryFilter;
                const directionMatch = !directionFilter || item.direction === directionFilter;
                const vendorMatch = !vendorFilter || (item.vendor && item.vendor.toLowerCase().includes(vendorFilter.toLowerCase()));
                const statusMatch = !statusFilter || item.status === statusFilter;
                
                return dateInRange && productMatch && locationMatch && movementTypeMatch && 
                       categoryMatch && directionMatch && vendorMatch && statusMatch;
            });
            
            setFilteredData(filtered);
            setLoading(false);
        }, 500);
    };

    const clearFilters = () => {
        setProductFilter('');
        setLocationFilter('');
        setMovementTypeFilter('');
        setCategoryFilter('');
        setDirectionFilter('');
        setVendorFilter('');
        setStatusFilter('');
        setSelectedQuickFilter(null);
        setFilteredData(safeData);
    };

    // Calculate summary statistics
    const totalMovements = safeFilteredData.length;
    const inwardMovements = safeFilteredData.filter(item => item.direction === 'In').length;
    const outwardMovements = safeFilteredData.filter(item => item.direction === 'Out').length;
    const totalInwardValue = safeFilteredData
        .filter(item => item.direction === 'In')
        .reduce((sum, item) => sum + Math.abs(item.totalValue), 0);
    const totalOutwardValue = safeFilteredData
        .filter(item => item.direction === 'Out')
        .reduce((sum, item) => sum + Math.abs(item.totalValue), 0);
    const netValue = totalInwardValue - totalOutwardValue;

    // Get unique values for filters
    const uniqueProducts = [...new Set(safeData.map(item => item.product))].sort();
    const uniqueLocations = [...new Set(safeData.map(item => item.location))].sort();
    const uniqueMovementTypes = [...new Set(safeData.map(item => item.movementType))].sort();
    const uniqueCategories = [...new Set(safeData.map(item => item.category))].sort();
    const uniqueDirections = ['In', 'Out'];
    const uniqueVendors = [...new Set(safeData.map(item => item.vendor).filter(Boolean))].sort();
    const uniqueStatuses = [...new Set(safeData.map(item => item.status))].sort();

    const columns = [
        {
            accessorKey: 'id',
            header: 'Movement ID',
            size: 130,
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    {cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: 'movementDate',
            header: 'Date',
            size: 120,
            Cell: ({ cell }) => (
                <Typography variant="body2">
                    {dayjs(cell.getValue()).format('MMM DD, YYYY')}
                </Typography>
            )
        },
        {
            accessorKey: 'product',
            header: 'Product',
            size: 180,
            Cell: ({ cell }) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InventoryIcon sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {cell.getValue()}
                    </Typography>
                </Box>
            )
        },
        {
            accessorKey: 'location',
            header: 'Location',
            size: 140,
            Cell: ({ cell }) => (
                <Chip 
                    label={cell.getValue()} 
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
            accessorKey: 'movementType',
            header: 'Movement Type',
            size: 150,
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: 'direction',
            header: 'Direction',
            size: 100,
            muiTableBodyCellProps: { align: 'center' },
            Cell: ({ cell }) => (
                <Chip 
                    label={cell.getValue()}
                    size="small"
                    color={cell.getValue() === 'In' ? 'success' : 'error'}
                    icon={cell.getValue() === 'In' ? <AddIcon /> : <RemoveIcon />}
                    sx={{ fontWeight: 500 }}
                />
            )
        },
        {
            accessorKey: 'quantity',
            header: 'Quantity',
            size: 100,
            muiTableBodyCellProps: { align: 'right' },
            Cell: ({ cell }) => (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontWeight: 600,
                        color: cell.getValue() > 0 ? theme.palette.success.main : theme.palette.error.main
                    }}
                >
                    {cell.getValue() > 0 ? '+' : ''}{cell.getValue().toLocaleString()}
                </Typography>
            )
        },
        {
            accessorKey: 'unitCost',
            header: 'Unit Cost',
            size: 110,
            muiTableBodyCellProps: { align: 'right' },
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    ${cell.getValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
            )
        },
        {
            accessorKey: 'totalValue',
            header: 'Total Value',
            size: 120,
            muiTableBodyCellProps: { align: 'right' },
            Cell: ({ cell }) => (
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontWeight: 600,
                        color: cell.getValue() > 0 ? theme.palette.success.main : theme.palette.error.main
                    }}
                >
                    ${Math.abs(cell.getValue()).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
            )
        },
        {
            accessorKey: 'referenceNo',
            header: 'Reference',
            size: 120,
            Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {cell.getValue()}
                </Typography>
            )
        },
        {
            accessorKey: 'status',
            header: 'Status',
            size: 100,
            Cell: ({ cell }) => (
                <Chip 
                    label={cell.getValue()}
                    size="small"
                    color={
                        cell.getValue() === 'Completed' ? 'success' :
                        cell.getValue() === 'Pending' ? 'warning' : 'error'
                    }
                    sx={{ fontWeight: 500 }}
                />
            )
        }
    ];

    if (showPrint) {
        return (
            <StockMovementPrint
                data={safeFilteredData}
                filters={{
                    startDate,
                    endDate,
                    product: productFilter,
                    location: locationFilter,
                    movementType: movementTypeFilter
                }}
                onClose={() => setShowPrint(false)}
            />
        );
    }

    return (
        <Container maxWidth="xl">
            <PageHeader 
                title="Stock Movement" 
                subtitle="Track all inventory movements across locations and time periods"
                icon={<SwapHorizIcon />}
                action={
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => {
                                    const newData = generateStockMovementData(150);
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
                                        Total Movements
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                                        {loading ? <Skeleton width={60} /> : totalMovements.toLocaleString()}
                                    </Typography>
                                </Box>
                                <SwapHorizIcon sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.7 }} />
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
                                        Inward Movements
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                                        {loading ? <Skeleton width={60} /> : inwardMovements.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        ${totalInwardValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: theme.palette.success.main, opacity: 0.7 }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.1)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)` }}>
                        <CardContent>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="textSecondary" gutterBottom variant="body2">
                                        Outward Movements
                                    </Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                                        {loading ? <Skeleton width={60} /> : outwardMovements.toLocaleString()}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        ${totalOutwardValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </Typography>
                                </Box>
                                <TrendingDownIcon sx={{ fontSize: 40, color: theme.palette.error.main, opacity: 0.7 }} />
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
                                        Net Value Change
                                    </Typography>
                                    <Typography 
                                        variant="h4" 
                                        sx={{ 
                                            fontWeight: 700, 
                                            color: netValue >= 0 ? theme.palette.success.main : theme.palette.error.main 
                                        }}
                                    >
                                        {loading ? <Skeleton width={80} /> : `${netValue >= 0 ? '+' : ''}$${netValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                                    </Typography>
                                </Box>
                                <TimelineIcon sx={{ fontSize: 40, color: theme.palette.info.main, opacity: 0.7 }} />
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
                                    options={uniqueProducts}
                                    value={productFilter}
                                    onChange={(event, newValue) => setProductFilter(newValue || '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Product"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Autocomplete
                                    options={uniqueLocations}
                                    value={locationFilter}
                                    onChange={(event, newValue) => setLocationFilter(newValue || '')}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Location"
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
                                <Grid item xs={12} md={2.4}>
                                    <Autocomplete
                                        options={uniqueMovementTypes}
                                        value={movementTypeFilter}
                                        onChange={(event, newValue) => setMovementTypeFilter(newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Movement Type"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2.4}>
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
                                <Grid item xs={12} md={2.4}>
                                    <Autocomplete
                                        options={uniqueDirections}
                                        value={directionFilter}
                                        onChange={(event, newValue) => setDirectionFilter(newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Direction"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2.4}>
                                    <Autocomplete
                                        options={uniqueVendors}
                                        value={vendorFilter}
                                        onChange={(event, newValue) => setVendorFilter(newValue || '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Vendor"
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={12} md={2.4}>
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
                    data={safeFilteredData}
                    columns={columns}
                    enablePagination
                    enableSorting
                    enableColumnHiding
                    enableExport={false}
                    fileTitle="Stock Movement Report"
                    getRowId={(row) => row.id}
                    muiTablePaperProps={{
                        sx: {
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                        },
                    }}
                    muiTableProps={{
                        sx: {
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
                        }
                    }}
                />
            </Paper>

            {/* Movement Analysis */}
            {safeFilteredData.length > 0 && (
                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarehouseIcon /> Movement Breakdown
                                </Typography>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">Purchase Receipts:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                            {safeFilteredData.filter(item => item.movementType === 'Purchase Receipt').length}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">Sales Issues:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                                            {safeFilteredData.filter(item => item.movementType === 'Sales Issue').length}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">Transfers:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                                            {safeFilteredData.filter(item => item.movementType.includes('Transfer')).length}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">Adjustments:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                                            {safeFilteredData.filter(item => item.movementType.includes('Adjustment')).length}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CompareArrowsIcon /> Value Analysis
                                </Typography>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">Total Inward Value:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                                            ${totalInwardValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">Total Outward Value:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                                            ${totalOutwardValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                    </Stack>
                                    <Divider />
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Net Change:</Typography>
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontWeight: 600, 
                                                color: netValue >= 0 ? theme.palette.success.main : theme.palette.error.main 
                                            }}
                                        >
                                            ${Math.abs(netValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2">Avg Transaction Value:</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                                            ${((totalInwardValue + totalOutwardValue) / totalMovements).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

export default StockMovement;
