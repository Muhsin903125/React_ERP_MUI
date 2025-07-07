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

const SalesAnalysisPrint = ({ 
    title = "Sales Analysis Report", 
    analysisType = "Customer Analysis",
    timeframe = "Monthly", 
    dateRange,
    comparison = false,
    chartType = "Bar Chart",
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

    // Get analysis type label for display
    const getAnalysisTypeLabel = () => {
        switch (analysisType.toLowerCase()) {
            case 'customer': return 'Customer Analysis';
            case 'product': return 'Product Analysis'; 
            case 'salesman': return 'Salesman Performance';
            case 'territory': return 'Territory Analysis';
            case 'trend': return 'Trend Analysis';
            default: return analysisType;
        }
    };

    // Get entity header name based on analysis type
    const getEntityHeader = () => {
        switch (analysisType.toLowerCase()) {
            case 'customer': return 'Customer';
            case 'product': return 'Product';
            case 'salesman': return 'Salesman';
            case 'territory': return 'Territory';
            case 'trend': return 'Period';
            default: return 'Entity';
        }
    };

    // Get cell value based on column accessor
    const getCellValue = (row, column) => {
        const value = row[column.accessorKey];
        
        // Handle different data types
        if (column.accessorKey === 'quantity_sold') {
            return formatQuantity(value);
        }
        
        if (column.accessorKey === 'margin_percent' || column.accessorKey === 'growth_percent') {
            return formatPercent(value);
        }
        
        if (column.accessorKey.includes('amount') || column.accessorKey.includes('sales') || 
           column.accessorKey.includes('profit') || column.accessorKey.includes('cost')) {
            return formatCurrency(value);
        }
        
        if (column.accessorKey === 'rank') {
            return value ? `#${value}` : '-';
        }
        
        return value || '';
    };

    // Filter out data rows (exclude total row for table, but include for summary)
    const tableData = data.filter(item => !item.is_header);
    const totalRow = data.find(item => item.is_header) || {};

    // Get printable columns (exclude rank column for cleaner print layout)
    const printColumns = columns.filter(col => 
        col.accessorKey !== 'rank' && 
        !col.accessorKey.includes('market_share') &&
        col.header
    );

    return (
        <Box sx={{ p: 3, bgcolor: 'white', minHeight: '297mm', width: '210mm', margin: '0 auto' }}>
            {/* Print Header */}
            <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '2px solid #1976d2', pb: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {getAnalysisTypeLabel()} - {timeframe}
                </Typography>
                {comparison && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <Chip 
                            label="With Period Comparison" 
                            size="small" 
                            color="info" 
                            variant="outlined"
                        />
                    </Typography>
                )}
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
                                Total Quantity
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
                            <Typography variant="h6" fontWeight="bold" color="primary.main">
                                {formatCurrency(summary.totalProfit)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={3}>
                    <Card variant="outlined" sx={{ borderRadius: 1 }}>
                        <CardContent sx={{ p: 1.5, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" display="block">
                                Avg Margin
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main">
                                {formatPercent(summary.avgMargin)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Key Insights */}
            {(summary.topPerformer || summary.bestGrowth) && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                        Key Insights
                    </Typography>
                    <Grid container spacing={2}>
                        {summary.topPerformer && (
                            <Grid item xs={6}>
                                <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.200' }}>
                                    <CardContent sx={{ p: 1.5 }}>
                                        <Typography variant="subtitle2" color="success.dark" gutterBottom>
                                            🏆 Top Performer
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {summary.topPerformer.customer_name || 
                                             summary.topPerformer.product_name || 
                                             summary.topPerformer.salesman_name || 
                                             summary.topPerformer.territory_name ||
                                             summary.topPerformer.period}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Sales: {formatCurrency(summary.topPerformer.sales_amount)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                        {summary.bestGrowth && comparison && (
                            <Grid item xs={6}>
                                <Card variant="outlined" sx={{ bgcolor: 'info.50', borderColor: 'info.200' }}>
                                    <CardContent sx={{ p: 1.5 }}>
                                        <Typography variant="subtitle2" color="info.dark" gutterBottom>
                                            📈 Best Growth
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            {summary.bestGrowth.customer_name || 
                                             summary.bestGrowth.product_name || 
                                             summary.bestGrowth.salesman_name || 
                                             summary.bestGrowth.territory_name ||
                                             summary.bestGrowth.period}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Growth: {formatPercent(summary.bestGrowth.growth_percent)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Analysis Details Table */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom color="text.primary">
                    {getAnalysisTypeLabel()} Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Total {getEntityHeader()}s Analyzed: {summary.entityCount || tableData.length}
                </Typography>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                <Table size="small" sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: 'grey.50' }}>
                            {printColumns.map((column, index) => (
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
                                {printColumns.map((column, cellIndex) => (
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
                                {printColumns.map((column, cellIndex) => (
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
                    Sales Analysis Report - {getAnalysisTypeLabel()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Page 1 of 1
                </Typography>
            </Box>
        </Box>
    );
};

export default SalesAnalysisPrint;
