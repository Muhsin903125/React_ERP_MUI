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

const SalesSummaryPrint = ({ 
    title = "Sales Summary Report", 
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
        if (column.accessorKey === 'invoice_count' || column.accessorKey === 'quantity_sold') {
            return formatQuantity(value);
        }
        
        if (column.accessorKey === 'margin_percent' || column.accessorKey === 'variance_percent') {
            return formatPercent(value);
        }
        if (column.accessorKey.includes('amount') || column.accessorKey.includes('sales') || 
           column.accessorKey.includes('profit') || column.accessorKey.includes('cost')) {
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
                                Total Sales
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main">
                                {formatCurrency(summary.totalSales)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Quantity Sold
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="info.main">
                                {formatQuantity(summary.totalQuantity)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Gross Profit
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main">
                                {formatCurrency(summary.totalProfit)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Growth Rate
                            </Typography>
                            <Typography 
                                variant="h6" 
                                fontWeight="bold" 
                                color={summary.growthPercent >= 0 ? "success.main" : "error.main"}
                            >
                                {formatPercent(summary.growthPercent)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Data Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small" sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                            {columns.map((column, index) => (
                                <TableCell 
                                    key={`header-${index}`}
                                    sx={{ 
                                        color: 'white', 
                                        fontWeight: 'bold',
                                        textAlign: column.muiTableBodyCellProps?.align || 'left',
                                        fontSize: '0.75rem',
                                        py: 1
                                    }}
                                >
                                    {column.header}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row, rowIndex) => (
                            <TableRow 
                                key={`row-${rowIndex}`}
                                sx={{ 
                                    '&:nth-of-type(even)': { bgcolor: 'grey.50' },
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                {columns.map((column, colIndex) => (
                                    <TableCell 
                                        key={`cell-${rowIndex}-${colIndex}`}
                                        sx={{ 
                                            textAlign: column.muiTableBodyCellProps?.align || 'left',
                                            fontSize: '0.75rem',
                                            py: 0.5,
                                            pl: row.level ? `${(row.level * 20) + 8}px` : 1
                                        }}
                                    >
                                        {getCellValue(row, column)}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        
                        {/* Total Row */}
                        {Object.keys(totalRow).length > 0 && (
                            <TableRow sx={{ bgcolor: 'success.light', borderTop: '2px solid', borderColor: 'success.main' }}>
                                {columns.map((column, colIndex) => (
                                    <TableCell 
                                        key={`total-${colIndex}`}
                                        sx={{ 
                                            fontWeight: 'bold',
                                            textAlign: column.muiTableBodyCellProps?.align || 'left',
                                            fontSize: '0.75rem',
                                            py: 1,
                                            color: 'success.dark'
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

            {/* Footer */}
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary">
                            Report Parameters:
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Group By: {groupBy} | Format: {reportFormat}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Records: {tableData.length} | Period: {dateRange}
                        </Typography>
                    </Stack>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                            Sales Summary Report
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Page 1 of 1
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* Key Metrics Summary */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Key Performance Indicators
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                                Total Invoices: {formatQuantity(summary.totalInvoices)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Average Margin: {formatPercent(summary.avgMargin)}
                            </Typography>
                        </Stack>
                    </Grid>
                    <Grid item xs={6}>
                        <Stack spacing={0.5}>
                            <Typography variant="caption" color="text.secondary">
                                Sales Growth: {formatPercent(summary.growthPercent)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Profit Ratio: {summary.totalSales ? formatPercent((summary.totalProfit / summary.totalSales) * 100) : '0.0%'}
                            </Typography>
                        </Stack>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default SalesSummaryPrint;
