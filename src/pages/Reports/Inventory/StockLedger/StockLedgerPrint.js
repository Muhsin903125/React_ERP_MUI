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

const StockLedgerPrint = ({ 
    title = "Stock Ledger Report", 
    dateRange,
    groupBy,
    productFilter,
    locationFilter,
    showValues,
    includeBalances,
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
        if (column.accessorKey.includes('quantity') || column.accessorKey === 'reorder_level' || column.accessorKey === 'balance') {
            return formatQuantity(value);
        }
        
        if (column.accessorKey.includes('cost') || column.accessorKey.includes('value') || column.accessorKey.includes('amount')) {
            return formatCurrency(value);
        }
        
        if (column.accessorKey === 'transaction_date' && value) {
            return moment(value).format('DD-MM-YYYY HH:mm');
        }
        
        return value || '-';
    };

    // Get transaction type style
    const getTransactionTypeStyle = (type) => {
        switch (type?.toLowerCase()) {
            case 'receipt':
            case 'purchase':
            case 'production':
                return { color: '#2e7d32', fontWeight: 600 };
            case 'issue':
            case 'sales':
            case 'consumption':
                return { color: '#d32f2f', fontWeight: 600 };
            case 'transfer':
            case 'adjustment':
                return { color: '#1976d2', fontWeight: 600 };
            default:
                return { color: '#424242', fontWeight: 400 };
        }
    };

    return (
        <Box sx={{ p: 4, bgcolor: 'white', color: 'black', minHeight: '100vh' }}>
            {/* Header Section */}
            <Box sx={{ mb: 4, borderBottom: '2px solid #1976d2', pb: 2 }}>
                <Typography 
                    variant="h4" 
                    sx={{ 
                        fontWeight: 700, 
                        color: '#1976d2',
                        textAlign: 'center',
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                >
                    {title}
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Period: {dateRange || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Generated on: {moment().format('DD-MM-YYYY HH:mm')}
                    </Typography>
                </Stack>
            </Box>

            {/* Report Configuration */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Report Configuration
                        </Typography>
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                <strong>Group By:</strong> {groupBy || 'By Product'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Product Filter:</strong> {productFilter || 'All Products'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Location Filter:</strong> {locationFilter || 'All Locations'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Show Values:</strong> {showValues || 'No'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Include Balances:</strong> {includeBalances || 'No'}
                            </Typography>
                        </Stack>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                            Summary Statistics
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    <strong>Total Transactions:</strong> {summary?.totalTransactions || 0}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Total In Quantity:</strong> {formatQuantity(summary?.totalInQuantity)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Total Out Quantity:</strong> {formatQuantity(summary?.totalOutQuantity)}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    <strong>Unique Products:</strong> {summary?.uniqueProducts || 0}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Total Value:</strong> {formatCurrency(summary?.totalValue)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Current Balance:</strong> {formatQuantity(summary?.latestBalance)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Transaction Statistics */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                        <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                            {summary?.receipts || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Receipts
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee', border: '1px solid #f44336' }}>
                        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                            {summary?.issues || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Issues
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                            {formatQuantity(summary?.totalInQuantity)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total In
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                        <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700 }}>
                            {formatQuantity(summary?.totalOutQuantity)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Out
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Data Table */}
            {Array.isArray(data) && data.length > 0 ? (
                <TableContainer component={Paper} sx={{ border: '1px solid #e0e0e0' }}>
                    <Table size="small" sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#1976d2' }}>
                                {columns.map((column) => (
                                    <TableCell 
                                        key={column.accessorKey}
                                        sx={{ 
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            textAlign: column.accessorKey.includes('quantity') || 
                                                      column.accessorKey.includes('cost') || 
                                                      column.accessorKey.includes('value') || 
                                                      column.accessorKey.includes('balance') ? 'right' : 'left',
                                            minWidth: column.size || 'auto',
                                            borderRight: '1px solid rgba(255, 255, 255, 0.2)'
                                        }}
                                    >
                                        {column.header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, index) => {
                                const isHeader = row.is_header || false;
                                const isTransferOut = row.transaction_type === 'Sales' || row.transaction_type === 'Issue';
                                const isTransferIn = row.transaction_type === 'Receipt' || row.transaction_type === 'Purchase';
                                
                                return (
                                    <TableRow 
                                        key={index}
                                        sx={{ 
                                            '&:nth-of-type(even)': { 
                                                bgcolor: isHeader ? '#e3f2fd' : '#fafafa' 
                                            },
                                            ...(isHeader && {
                                                bgcolor: '#e3f2fd',
                                                '& td': {
                                                    fontWeight: 700,
                                                    borderBottom: '2px solid #1976d2'
                                                }
                                            }),
                                            ...(isTransferIn && !isHeader && {
                                                bgcolor: '#e8f5e8'
                                            }),
                                            ...(isTransferOut && !isHeader && {
                                                bgcolor: '#ffebee'
                                            })
                                        }}
                                    >
                                        {columns.map((column) => {
                                            const cellValue = getCellValue(row, column);
                                            const isQuantityColumn = column.accessorKey.includes('quantity') || column.accessorKey.includes('balance');
                                            const isValueColumn = column.accessorKey.includes('cost') || column.accessorKey.includes('value');
                                            const isTransactionType = column.accessorKey === 'transaction_type';
                                            
                                            return (
                                                <TableCell 
                                                    key={column.accessorKey}
                                                    sx={{ 
                                                        fontSize: '0.813rem',
                                                        py: 1,
                                                        px: 1.5,
                                                        textAlign: (isQuantityColumn || isValueColumn) ? 'right' : 'left',
                                                        borderRight: '1px solid #e0e0e0',
                                                        ...(isHeader && {
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                            color: '#1976d2'
                                                        }),
                                                        ...(isTransactionType && !isHeader && getTransactionTypeStyle(cellValue))
                                                    }}
                                                >
                                                    {cellValue}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Transaction Data Available
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        No stock ledger transactions found for the selected criteria.
                    </Typography>
                </Paper>
            )}

            {/* Movement Analysis */}
            {Array.isArray(data) && data.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                        Movement Analysis
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                    Transaction Distribution
                                </Typography>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Receipts:</Typography>
                                        <Typography variant="body2" fontWeight={600} color="success.main">
                                            {summary?.receipts || 0} transactions
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Issues:</Typography>
                                        <Typography variant="body2" fontWeight={600} color="error.main">
                                            {summary?.issues || 0} transactions
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Net Movement:</Typography>
                                        <Typography variant="body2" fontWeight={600} color="info.main">
                                            {formatQuantity((summary?.totalInQuantity || 0) - (summary?.totalOutQuantity || 0))} units
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                    Value Analysis
                                </Typography>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Total Value:</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatCurrency(summary?.totalValue)} AED
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Average per Transaction:</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatCurrency((summary?.totalValue || 0) / (summary?.totalTransactions || 1))} AED
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Current Balance Value:</Typography>
                                        <Typography variant="body2" fontWeight={600} color="primary.main">
                                            {formatCurrency((summary?.latestBalance || 0) * 150)} AED
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Report Footer */}
            <Box sx={{ mt: 6, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Stock Ledger Report - Generated by ERP System
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Page 1 of 1
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
};

export default StockLedgerPrint;
