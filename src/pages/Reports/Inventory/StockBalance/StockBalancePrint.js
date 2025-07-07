import React from 'react';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Stack,
    Divider,
    Grid,
    Card,
    CardContent,
    Chip
} from '@mui/material';
import moment from 'moment';

const StockBalancePrint = ({ 
    title = "Stock Balance Report", 
    asOfDate, 
    groupBy, 
    showZeroStock,
    showValues,
    columns = [], 
    data = [], 
    summary = {} 
}) => {
    // Format quantity values
    const formatQuantity = (value) => {
        if (!value || value === 0) return '0';
        return Math.abs(value).toFixed(0);
    };

    // Format currency values
    const formatCurrency = (value) => {
        if (!value || value === 0) return '0.00';
        return Math.abs(value).toFixed(2);
    };

    // Get cell value based on column accessor
    const getCellValue = (row, column) => {
        const value = row[column.accessorKey];
        
        // Handle different data types
        if (column.accessorKey.includes('quantity') || column.accessorKey === 'reorder_level') {
            return formatQuantity(value);
        }
        
        if (column.accessorKey.includes('cost') || column.accessorKey.includes('value')) {
            return formatCurrency(value);
        }
        
        if (column.accessorKey === 'status') {
            const quantity = row.quantity_on_hand || 0;
            const reorderLevel = row.reorder_level || 0;
            
            if (quantity <= 0) return 'Out of Stock';
            if (quantity <= reorderLevel) return 'Low Stock';
            return 'Normal';
        }
        
        return value || '';
    };

    // Filter out data rows (exclude total row for table, but include for summary)
    const tableData = data.filter(item => !item.is_header);
    const totalRow = data.find(item => item.is_header) || {};

    // Get stock status summary
    const getStockStatusSummary = () => {
        const lowStockItems = tableData.filter(item => 
            item.quantity_on_hand <= item.reorder_level
        ).length;
        
        const outOfStockItems = tableData.filter(item => 
            item.quantity_on_hand <= 0
        ).length;

        const normalStockItems = tableData.length - lowStockItems;

        return { lowStockItems, outOfStockItems, normalStockItems };
    };

    const stockStatus = getStockStatusSummary();

    return (
        <Box sx={{ p: 3, bgcolor: 'white', minHeight: '297mm', width: '210mm', margin: '0 auto' }}>
            {/* Print Header */}
            <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #1976d2', pb: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {groupBy}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    As of Date: {moment(asOfDate).format('DD-MM-YYYY')}
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                    <Chip 
                        label={`Zero Stock: ${showZeroStock}`} 
                        size="small" 
                        color="info" 
                        variant="outlined"
                    />
                    <Chip 
                        label={`Show Values: ${showValues}`} 
                        size="small" 
                        color="info" 
                        variant="outlined"
                    />
                </Stack>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                    Generated on: {moment().format('DD-MM-YYYY HH:mm:ss')}
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Total Items
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {summary.totalItems || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Total Quantity
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                {formatQuantity(summary.totalQuantity)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Available
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="info.main">
                                {formatQuantity(summary.totalAvailable)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Stock Health
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main">
                                {summary.stockHealthPercent?.toFixed(1) || '0.0'}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Stock Status Overview */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    Stock Status Overview
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.200' }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Typography variant="subtitle2" color="success.dark" gutterBottom>
                                    ✅ Normal Stock
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="success.main">
                                    {stockStatus.normalStockItems}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Items above reorder level
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card variant="outlined" sx={{ bgcolor: 'warning.50', borderColor: 'warning.200' }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                                    ⚠️ Low Stock Alert
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="warning.main">
                                    {stockStatus.lowStockItems}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Items need reordering
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={4}>
                        <Card variant="outlined" sx={{ bgcolor: 'error.50', borderColor: 'error.200' }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Typography variant="subtitle2" color="error.dark" gutterBottom>
                                    🚫 Out of Stock
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" color="error.main">
                                    {stockStatus.outOfStockItems}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Items with zero quantity
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Inventory Details Table */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    Inventory Stock Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Grouped {groupBy} | Total Value: {formatCurrency(summary.totalValue)}
                </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small" sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                            {columns.map((column, index) => (
                                <TableCell 
                                    key={index}
                                    align={column.headerProps?.align || 'left'}
                                    sx={{ 
                                        fontWeight: 'bold',
                                        color: 'text.primary',
                                        border: '1px solid',
                                        borderColor: 'grey.300',
                                        fontSize: '0.8rem',
                                        py: 1
                                    }}
                                >
                                    {column.header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row, index) => {
                            const isLowStock = row.quantity_on_hand <= row.reorder_level;
                            const isOutOfStock = row.quantity_on_hand <= 0;
                            
                            return (
                                <TableRow 
                                    key={index}
                                    sx={{ 
                                        '&:nth-of-type(odd)': { bgcolor: 'grey.25' },
                                        ...(isOutOfStock && { bgcolor: 'error.50' }),
                                        ...(isLowStock && !isOutOfStock && { bgcolor: 'warning.50' }),
                                        '&:hover': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    {columns.map((column, cellIndex) => (
                                        <TableCell 
                                            key={cellIndex}
                                            align={column.muiTableBodyCellProps?.align || 'left'}
                                            sx={{ 
                                                border: '1px solid',
                                                borderColor: 'grey.200',
                                                fontSize: '0.75rem',
                                                py: 0.5,
                                                px: 1
                                            }}
                                        >
                                            {getCellValue(row, column)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            );
                        })}
                        
                        {/* Total Row */}
                        {Object.keys(totalRow).length > 0 && (
                            <TableRow sx={{ bgcolor: 'primary.50', fontWeight: 'bold' }}>
                                {columns.map((column, cellIndex) => (
                                    <TableCell 
                                        key={cellIndex}
                                        align={column.muiTableBodyCellProps?.align || 'left'}
                                        sx={{ 
                                            border: '2px solid',
                                            borderColor: 'primary.main',
                                            fontWeight: 'bold',
                                            fontSize: '0.8rem',
                                            py: 1,
                                            px: 1,
                                            color: 'primary.dark'
                                        }}
                                    >
                                        {getCellValue(totalRow, column)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Inventory Analysis */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    Inventory Analysis
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Stock Allocation
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Allocated Quantity: {formatQuantity(summary.totalAllocated)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Allocation Rate: {summary.totalQuantity > 0 ? 
                                    ((summary.totalAllocated / summary.totalQuantity) * 100).toFixed(1) : '0.0'}%
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Stock Turnover
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Average Stock Value: {formatCurrency(summary.totalValue / (summary.totalItems || 1))}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Items Requiring Attention: {stockStatus.lowStockItems + stockStatus.outOfStockItems}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Performance Metrics
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Stock Coverage: {summary.stockHealthPercent?.toFixed(1) || '0.0'}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Avg Quantity per Item: {formatQuantity(summary.totalQuantity / (summary.totalItems || 1))}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* Reorder Recommendations */}
            {(stockStatus.lowStockItems > 0 || stockStatus.outOfStockItems > 0) && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
                    <Typography variant="subtitle1" fontWeight="bold" color="warning.dark" gutterBottom>
                        📋 Reorder Recommendations
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • {stockStatus.outOfStockItems} items are completely out of stock and require immediate restocking
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • {stockStatus.lowStockItems} items are below reorder level and should be reordered soon
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • Review supplier lead times and adjust reorder levels accordingly
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • Consider safety stock for critical items to avoid stockouts
                    </Typography>
                </Box>
            )}

            {/* Footer */}
            <Box sx={{ 
                mt: 'auto', 
                pt: 2, 
                borderTop: '1px solid',
                borderColor: 'grey.300',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.75rem'
            }}>
                <Typography variant="caption" color="text.secondary">
                    Stock Balance Report - {groupBy}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Page 1 of 1
                </Typography>
            </Box>
        </Box>
    );
};

export default StockBalancePrint;
