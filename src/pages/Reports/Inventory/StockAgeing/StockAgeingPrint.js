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
    Chip,
    LinearProgress
} from '@mui/material';
import moment from 'moment';

const StockAgeingPrint = ({ 
    title = "Stock Ageing Analysis Report", 
    asOfDate,
    groupBy,
    ageBreakdown,
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
        if (column.accessorKey.includes('quantity') || column.accessorKey.includes('age_')) {
            return formatQuantity(value);
        }
        
        if (column.accessorKey.includes('cost') || column.accessorKey.includes('value') || column.accessorKey.includes('amount')) {
            return formatCurrency(value);
        }
        
        if (column.accessorKey === 'average_age' && value) {
            return `${Math.round(value)} days`;
        }
        
        if (column.accessorKey === 'ageing_status' && value) {
            return value;
        }
        
        return value || '-';
    };

    // Get age group color
    const getAgeGroupColor = (columnId, value) => {
        if (!value || value === 0) return '#757575';
        
        if (columnId?.includes('120') || columnId?.includes('180') || columnId?.includes('365')) {
            return '#d32f2f'; // Red for critical
        }
        if (columnId?.includes('90') || columnId?.includes('60')) {
            return '#f57c00'; // Orange for warning
        }
        if (columnId?.includes('30')) {
            return '#2e7d32'; // Green for fresh
        }
        return '#1976d2'; // Blue for moderate
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'critical':
                return { color: '#d32f2f', bgColor: '#ffebee' };
            case 'warning':
                return { color: '#f57c00', bgColor: '#fff3e0' };
            case 'moderate':
                return { color: '#1976d2', bgColor: '#e3f2fd' };
            case 'fresh':
                return { color: '#2e7d32', bgColor: '#e8f5e8' };
            default:
                return { color: '#424242', bgColor: '#f5f5f5' };
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
                        As of: {asOfDate || 'N/A'}
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
                            Analysis Configuration
                        </Typography>
                        <Stack spacing={1}>
                            <Typography variant="body2">
                                <strong>Group By:</strong> {groupBy || 'By Product'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Age Breakdown:</strong> {ageBreakdown || 'Summary'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Show Values:</strong> {showValues || 'No'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>As of Date:</strong> {asOfDate || 'N/A'}
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
                                    <strong>Total Items:</strong> {summary?.totalItems || 0}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Total Quantity:</strong> {formatQuantity(summary?.totalQuantity)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Average Age:</strong> {Math.round(summary?.averageAge || 0)} days
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2">
                                    <strong>Total Value:</strong> {formatCurrency(summary?.totalValue)} AED
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Critical Stock:</strong> {formatQuantity(summary?.criticalStock)}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Fresh Stock:</strong> {formatQuantity(summary?.freshStock)}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            {/* Stock Health Dashboard */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                        <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 700 }}>
                            {formatQuantity(summary?.freshStock)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Fresh Stock
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                            {summary?.healthyPercentage?.toFixed(1) || 0}%
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                        <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700 }}>
                            {formatQuantity(summary?.moderateStock)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Moderate Age
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 600 }}>
                            30-120 days
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#ffebee', border: '1px solid #f44336' }}>
                        <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 700 }}>
                            {formatQuantity(summary?.criticalStock)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Critical Age
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                            {summary?.criticalPercentage?.toFixed(1) || 0}%
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                        <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 700 }}>
                            {Math.round(summary?.averageAge || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Avg Age (Days)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600 }}>
                            Overall
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Health Score Indicator */}
            <Box sx={{ mb: 3 }}>
                <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Inventory Health Score
                    </Typography>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={8}>
                            <Stack spacing={1}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="success.main">Fresh (0-30 days)</Typography>
                                    <Typography variant="body2" fontWeight={600}>{summary?.healthyPercentage?.toFixed(1) || 0}%</Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={summary?.healthyPercentage || 0} 
                                    color="success"
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="error.main">Critical (120+ days)</Typography>
                                    <Typography variant="body2" fontWeight={600}>{summary?.criticalPercentage?.toFixed(1) || 0}%</Typography>
                                </Box>
                                <LinearProgress 
                                    variant="determinate" 
                                    value={summary?.criticalPercentage || 0} 
                                    color="error"
                                    sx={{ height: 8, borderRadius: 4 }}
                                />
                            </Stack>
                        </Grid>
                        <Grid item xs={4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h4" sx={{ 
                                    color: summary?.healthyPercentage > 60 ? '#2e7d32' : 
                                           summary?.criticalPercentage > 20 ? '#d32f2f' : '#f57c00',
                                    fontWeight: 700
                                }}>
                                    {summary?.healthyPercentage > 60 ? 'A' : 
                                     summary?.criticalPercentage > 20 ? 'D' : 
                                     summary?.healthyPercentage > 40 ? 'B' : 'C'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Health Grade
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

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
                                                      column.accessorKey.includes('age') ? 'center' : 'left',
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
                                const ageingStatus = row.ageing_status || 'normal';
                                const statusStyle = getStatusColor(ageingStatus);
                                
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
                                            ...(!isHeader && ageingStatus === 'critical' && {
                                                bgcolor: '#ffebee'
                                            }),
                                            ...(!isHeader && ageingStatus === 'warning' && {
                                                bgcolor: '#fff3e0'
                                            })
                                        }}
                                    >
                                        {columns.map((column) => {
                                            const cellValue = getCellValue(row, column);
                                            const isQuantityColumn = column.accessorKey.includes('quantity') || column.accessorKey.includes('age_');
                                            const isValueColumn = column.accessorKey.includes('cost') || column.accessorKey.includes('value');
                                            const isStatusColumn = column.accessorKey === 'ageing_status';
                                            const isAgeColumn = column.accessorKey === 'average_age';
                                            
                                            return (
                                                <TableCell 
                                                    key={column.accessorKey}
                                                    sx={{ 
                                                        fontSize: '0.813rem',
                                                        py: 1,
                                                        px: 1.5,
                                                        textAlign: (isQuantityColumn || isValueColumn || isAgeColumn) ? 'center' : 'left',
                                                        borderRight: '1px solid #e0e0e0',
                                                        ...(isHeader && {
                                                            fontWeight: 700,
                                                            textTransform: 'uppercase',
                                                            color: '#1976d2'
                                                        }),
                                                        ...(isQuantityColumn && !isHeader && {
                                                            color: getAgeGroupColor(column.accessorKey, row[column.accessorKey]),
                                                            fontWeight: 600
                                                        }),
                                                        ...(isStatusColumn && !isHeader && {
                                                            color: statusStyle.color,
                                                            fontWeight: 600,
                                                            bgcolor: statusStyle.bgColor
                                                        }),
                                                        ...(isAgeColumn && !isHeader && {
                                                            color: row.average_age > 90 ? '#d32f2f' : 
                                                                   row.average_age > 60 ? '#f57c00' : 
                                                                   row.average_age > 30 ? '#1976d2' : '#2e7d32',
                                                            fontWeight: 600
                                                        })
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
                        No Stock Ageing Data Available
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        No stock ageing analysis data found for the selected criteria.
                    </Typography>
                </Paper>
            )}

            {/* Age Distribution Analysis */}
            {Array.isArray(data) && data.length > 0 && (
                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                        Age Distribution Analysis
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, border: '1px solid #e0e0e0' }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                                    Stock Distribution by Age
                                </Typography>
                                <Stack spacing={1}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Fresh Stock (0-30 days):</Typography>
                                        <Typography variant="body2" fontWeight={600} color="success.main">
                                            {formatQuantity(summary?.freshStock)} units ({summary?.healthyPercentage?.toFixed(1) || 0}%)
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Moderate Age (30-120 days):</Typography>
                                        <Typography variant="body2" fontWeight={600} color="warning.main">
                                            {formatQuantity(summary?.moderateStock)} units
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Critical Age (120+ days):</Typography>
                                        <Typography variant="body2" fontWeight={600} color="error.main">
                                            {formatQuantity(summary?.criticalStock)} units ({summary?.criticalPercentage?.toFixed(1) || 0}%)
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
                                        <Typography variant="body2">Total Inventory Value:</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatCurrency(summary?.totalValue)} AED
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Average Value per Item:</Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {formatCurrency((summary?.totalValue || 0) / (summary?.totalItems || 1))} AED
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2">Aging Risk Assessment:</Typography>
                                        <Typography variant="body2" fontWeight={600} color={
                                            summary?.criticalPercentage > 20 ? 'error.main' : 
                                            summary?.criticalPercentage > 10 ? 'warning.main' : 'success.main'
                                        }>
                                            {summary?.criticalPercentage > 20 ? 'High Risk' : 
                                             summary?.criticalPercentage > 10 ? 'Medium Risk' : 'Low Risk'}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {/* Recommendations */}
            {Array.isArray(data) && data.length > 0 && summary?.criticalPercentage > 10 && (
                <Box sx={{ mt: 3 }}>
                    <Paper sx={{ p: 2, bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                        <Typography variant="subtitle2" gutterBottom fontWeight={600} color="warning.main">
                            Recommended Actions
                        </Typography>
                        <Stack spacing={1}>
                            {summary?.criticalPercentage > 20 && (
                                <Typography variant="body2">
                                    • <strong>Urgent:</strong> Review items with 120+ days aging for clearance or disposal
                                </Typography>
                            )}
                            {summary?.criticalPercentage > 10 && (
                                <Typography variant="body2">
                                    • <strong>Priority:</strong> Implement discount strategies for slow-moving items
                                </Typography>
                            )}
                            <Typography variant="body2">
                                • <strong>Monitor:</strong> Set up automated alerts for items approaching 90 days
                            </Typography>
                            <Typography variant="body2">
                                • <strong>Review:</strong> Adjust reorder points and quantities based on aging patterns
                            </Typography>
                        </Stack>
                    </Paper>
                </Box>
            )}

            {/* Report Footer */}
            <Box sx={{ mt: 6, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                        Stock Ageing Analysis - Generated by ERP System
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Page 1 of 1
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
};

export default StockAgeingPrint;
