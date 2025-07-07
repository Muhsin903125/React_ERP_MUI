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
    CardContent
} from '@mui/material';
import moment from 'moment';

const PurchaseSummaryPrint = ({ 
    title = "Purchase Summary Report", 
    dateRange, 
    groupBy, 
    reportFormat,
    columns = [], 
    data = [], 
    fromDate, 
    toDate, 
    summary = {} 
}) => {
    // Format currency values
    const formatCurrency = (value) => {
        if (!value || value === 0) return '0.00';
        return Math.abs(value).toFixed(2);
    };

    // Format quantity values
    const formatQuantity = (value) => {
        if (!value || value === 0) return '0';
        return Math.abs(value).toFixed(0);
    };

    // Format percentage values
    const formatPercent = (value) => {
        if (!value || value === 0) return '0.0%';
        return `${value.toFixed(1)}%`;
    };

    // Get cell value based on column accessor
    const getCellValue = (row, column) => {
        const value = row[column.accessorKey];
        
        // Handle different data types
        if (column.accessorKey === 'po_count' || column.accessorKey === 'quantity_purchased') {
            return formatQuantity(value);
        }
        
        if (column.accessorKey === 'variance_percent') {
            return formatPercent(value);
        }
        
        if (column.accessorKey.includes('amount') || column.accessorKey.includes('cost') || 
           column.accessorKey.includes('discount')) {
            return formatCurrency(value);
        }
        
        return value || '';
    };

    // Filter out data rows (exclude total row for table, but include for summary)
    const tableData = data.filter(item => !item.is_header);
    const totalRow = data.find(item => item.is_header) || {};

    return (
        <Box sx={{ p: 3, bgcolor: 'white', minHeight: '297mm', width: '210mm', margin: '0 auto' }}>
            {/* Print Header */}
            <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #1976d2', pb: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {groupBy} - {reportFormat}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Period: {moment(fromDate).format('DD-MM-YYYY')} to {moment(toDate).format('DD-MM-YYYY')}
                </Typography>
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
                                Total Purchases
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {formatCurrency(summary.totalPurchases)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Purchase Orders
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                {formatQuantity(summary.totalPOs)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Avg Unit Cost
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="info.main">
                                {formatCurrency(summary.avgUnitCost)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Total Savings
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main">
                                {formatCurrency(summary.totalDiscount)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Key Insights */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    Key Purchase Insights
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Card variant="outlined" sx={{ bgcolor: 'primary.50', borderColor: 'primary.200' }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Typography variant="subtitle2" color="primary.dark" gutterBottom>
                                    📊 Cost Variance
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.variancePercent >= 0 ? '+' : ''}{formatPercent(summary.variancePercent)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    vs Previous Period
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={6}>
                        <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.200' }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Typography variant="subtitle2" color="success.dark" gutterBottom>
                                    🏢 Active Suppliers
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {summary.supplierCount || 0}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Total Quantity: {formatQuantity(summary.totalQuantity)}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Purchase Details Table */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    Purchase Summary Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Grouped {groupBy} | Format: {reportFormat}
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
                        {tableData.map((row, index) => (
                            <TableRow 
                                key={index}
                                sx={{ 
                                    '&:nth-of-type(odd)': { bgcolor: 'grey.25' },
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
                        ))}
                        
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

            {/* Additional Purchase Metrics */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    Purchase Performance Metrics
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Cost Efficiency
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Average Purchase Value: {formatCurrency(summary.totalPurchases / (summary.totalPOs || 1))}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Discount Rate: {formatPercent((summary.totalDiscount / summary.totalPurchases) * 100 || 0)}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Volume Analysis
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Units: {formatQuantity(summary.totalQuantity)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Avg Order Size: {formatQuantity(summary.totalQuantity / (summary.totalPOs || 1))}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                Supplier Performance
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Active Suppliers: {summary.supplierCount || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Avg per Supplier: {formatCurrency(summary.totalPurchases / (summary.supplierCount || 1))}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

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
                    Purchase Summary Report - {groupBy}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Page 1 of 1
                </Typography>
            </Box>
        </Box>
    );
};

export default PurchaseSummaryPrint;
