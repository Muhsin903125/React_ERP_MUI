import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Grid,
    Divider,
    Paper,
    useTheme,
    alpha,
    Stack
} from '@mui/material';
import moment from 'moment';

const PAndLPrint = ({ 
    data = [], 
    title = "Profit & Loss Statement", 
    dateRange, 
    reportFormat, 
    summary = {},
    fromDate,
    toDate,
    columns = []
}) => {
    const theme = useTheme();

    // Helper function to format amount with proper styling
    const formatAmount = (value, isHeader = false, accountType = null) => {
        if (isHeader && !value) return '-';
        if (value === 0 || value === null || value === undefined) return '0.00';
        
        const absValue = Math.abs(value).toFixed(2);
        const isPositive = value > 0;
        
        return (
            <Typography 
                variant="body2" 
                sx={{ 
                    fontWeight: isHeader ? 600 : 400,
                    color: accountType === 'Summary' ? '#000' : (isPositive ? '#2e7d32' : '#d32f2f'),
                    fontSize: '11px'
                }}
            >
                {isPositive ? absValue : `(${absValue})`}
            </Typography>
        );
    };

    // Helper function to get account description with proper indentation
    const formatAccountDesc = (item) => {
        const level = item?.level || 0;
        const isHeader = item?.is_header || false;
        const marginLeft = level * 15; // Reduced margin for print
        
        return (
            <Box sx={{ ml: `${marginLeft}px` }}>
                <Typography 
                    variant="body2" 
                    sx={{ 
                        fontWeight: isHeader ? 600 : 400,
                        fontSize: '11px',
                        textTransform: isHeader ? 'uppercase' : 'none',
                        letterSpacing: isHeader ? '0.3px' : 'normal'
                    }}
                >
                    {item?.ac_desc || ''}
                </Typography>
            </Box>
        );
    };

    // Calculate financial ratios
    const ratios = {
        grossMargin: summary.totalRevenue > 0 ? (summary.grossProfit / summary.totalRevenue) * 100 : 0,
        operatingMargin: summary.totalRevenue > 0 ? (summary.operatingProfit / summary.totalRevenue) * 100 : 0,
        netMargin: summary.totalRevenue > 0 ? (summary.netProfit / summary.totalRevenue) * 100 : 0
    };

    return (
        <Box sx={{ 
            p: 3, 
            bgcolor: 'white', 
            color: 'black',
            minHeight: '297mm', // A4 height
            width: '210mm', // A4 width
            fontFamily: 'Arial, sans-serif',
            fontSize: '12px',
            '@media print': {
                p: 2,
                fontSize: '10px'
            }
        }}>
            {/* Header Section */}
            <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    fontSize: '18px',
                    mb: 1,
                    color: '#000'
                }}>
                    {title}
                </Typography>
                <Typography variant="subtitle1" sx={{ 
                    fontSize: '12px',
                    color: '#666',
                    mb: 0.5
                }}>
                    For the period: {dateRange}
                </Typography>
                <Typography variant="body2" sx={{ 
                    fontSize: '10px',
                    color: '#666'
                }}>
                    Report Format: {reportFormat} | Generated on: {moment().format('DD-MM-YYYY HH:mm')}
                </Typography>
            </Box>

            <Divider sx={{ mb: 2, borderColor: '#000' }} />

            {/* Summary Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    mb: 1.5,
                    color: '#000'
                }}>
                    Financial Summary
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', border: '1px solid #ddd' }}>
                            <Typography variant="caption" sx={{ fontSize: '9px', color: '#666' }}>
                                Total Revenue
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600 }}>
                                {summary?.totalRevenue?.toFixed(2) || '0.00'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', border: '1px solid #ddd' }}>
                            <Typography variant="caption" sx={{ fontSize: '9px', color: '#666' }}>
                                Gross Profit
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600 }}>
                                {summary?.grossProfit?.toFixed(2) || '0.00'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '8px', color: '#666' }}>
                                ({ratios.grossMargin.toFixed(1)}%)
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#f5f5f5', border: '1px solid #ddd' }}>
                            <Typography variant="caption" sx={{ fontSize: '9px', color: '#666' }}>
                                Operating Profit
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600 }}>
                                {summary?.operatingProfit?.toFixed(2) || '0.00'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '8px', color: '#666' }}>
                                ({ratios.operatingMargin.toFixed(1)}%)
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper sx={{ 
                            p: 1.5, 
                            bgcolor: summary?.netProfit >= 0 ? '#e8f5e8' : '#fde7e7', 
                            border: `1px solid ${summary?.netProfit >= 0 ? '#4caf50' : '#f44336'}`
                        }}>
                            <Typography variant="caption" sx={{ fontSize: '9px', color: '#666' }}>
                                Net Profit
                            </Typography>
                            <Typography variant="subtitle2" sx={{ 
                                fontSize: '11px', 
                                fontWeight: 600,
                                color: summary?.netProfit >= 0 ? '#2e7d32' : '#d32f2f'
                            }}>
                                {summary?.netProfit?.toFixed(2) || '0.00'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '8px', color: '#666' }}>
                                ({ratios.netMargin.toFixed(1)}%)
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ mb: 2, borderColor: '#ddd' }} />

            {/* Main P&L Table */}
            <Table size="small" sx={{ 
                '& .MuiTableCell-root': { 
                    fontSize: '11px',
                    border: '1px solid #ddd',
                    py: 0.5,
                    px: 1
                }
            }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: '#f0f0f0' }}>
                        {columns.map((column, index) => (
                            <TableCell 
                                key={index}
                                align={column.headerProps?.align || 'left'}
                                sx={{ 
                                    fontWeight: 600,
                                    fontSize: '10px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    bgcolor: '#e0e0e0',
                                    color: '#000'
                                }}
                            >
                                {column.header}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, rowIndex) => (
                        <TableRow 
                            key={rowIndex}
                            sx={{
                                ...(row.is_header && {
                                    bgcolor: row.account_type === 'Summary' 
                                        ? alpha('#4caf50', 0.1)
                                        : alpha('#1976d2', 0.05),
                                }),
                                ...(row.level === 0 && {
                                    bgcolor: row.account_type === 'Summary' 
                                        ? alpha('#4caf50', 0.15)
                                        : alpha('#1976d2', 0.08),
                                }),
                                ...(row.level === 1 && {
                                    bgcolor: alpha('#9c27b0', 0.03),
                                }),
                            }}
                        >
                            {columns.map((column, colIndex) => (
                                <TableCell 
                                    key={colIndex}
                                    align={column.muiTableBodyCellProps?.align || 'left'}
                                    sx={{
                                        ...(row.is_header && {
                                            borderBottom: row.account_type === 'Summary' 
                                                ? '2px solid #4caf50'
                                                : '1px solid #1976d2',
                                        }),
                                        ...(row.level === 0 && {
                                            borderBottom: `2px solid ${row.account_type === 'Summary' ? '#4caf50' : '#1976d2'}`,
                                        }),
                                    }}
                                >
                                    {(() => {
                                        const cellValue = row[column.accessorKey];
                                        
                                        // Handle account description with indentation
                                        if (column.accessorKey === 'ac_desc') {
                                            return formatAccountDesc(row);
                                        }
                                        
                                        // Handle account code
                                        if (column.accessorKey === 'ac_code') {
                                            return (
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontWeight: row.is_header ? 600 : 400,
                                                        fontSize: '10px',
                                                        fontFamily: 'monospace'
                                                    }}
                                                >
                                                    {cellValue || ''}
                                                </Typography>
                                            );
                                        }
                                        
                                        // Handle amount columns
                                        if (['current_period', 'previous_period', 'current_year', 'previous_year'].includes(column.accessorKey)) {
                                            return formatAmount(cellValue, row.is_header, row.account_type);
                                        }
                                        
                                        // Handle variance column
                                        if (column.accessorKey === 'variance') {
                                            const current = row.current_period || 0;
                                            const previous = row.previous_period || 0;
                                            const variance = current - previous;
                                            return formatAmount(variance, row.is_header, row.account_type);
                                        }
                                        
                                        // Handle variance percentage
                                        if (column.accessorKey === 'variance_percent') {
                                            const current = row.current_year || 0;
                                            const previous = row.previous_year || 0;
                                            const variancePercent = previous !== 0 ? ((current - previous) / Math.abs(previous)) * 100 : 0;
                                            return (
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontSize: '11px',
                                                        fontWeight: row.is_header ? 600 : 400,
                                                        color: variancePercent > 0 ? '#2e7d32' : '#d32f2f'
                                                    }}
                                                >
                                                    {variancePercent.toFixed(1)}%
                                                </Typography>
                                            );
                                        }
                                        
                                        // Default text display
                                        return (
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontSize: '11px',
                                                    fontWeight: row.is_header ? 600 : 400
                                                }}
                                            >
                                                {cellValue || ''}
                                            </Typography>
                                        );
                                    })()}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Footer Section */}
            <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #ddd' }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontSize: '10px', color: '#666' }}>
                            <strong>Key Financial Ratios:</strong><br />
                            Gross Margin: {ratios.grossMargin.toFixed(2)}%<br />
                            Operating Margin: {ratios.operatingMargin.toFixed(2)}%<br />
                            Net Margin: {ratios.netMargin.toFixed(2)}%
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontSize: '10px', color: '#666', textAlign: 'right' }}>
                            Report generated on: {moment().format('DD/MM/YYYY HH:mm:ss')}<br />
                            Page 1 of 1<br />
                            ERP System - Finance Module
                        </Typography>
                    </Grid>
                </Grid>
            </Box>


        </Box>
    );
};

export default PAndLPrint;
