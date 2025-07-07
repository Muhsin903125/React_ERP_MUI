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

const BalanceSheetPrint = ({ 
    data = [], 
    title = "Balance Sheet", 
    asOfDate, 
    reportFormat, 
    summary = {},
    columns = []
}) => {
    const theme = useTheme();

    // Helper function to format amount with proper styling
    const formatAmount = (value, isHeader = false, accountType = null) => {
        if (isHeader && (!value || value === 0)) return '-';
        if (value === 0 || value === null || value === undefined) return '0.00';
        
        const absValue = Math.abs(value).toFixed(2);
        const isPositive = value > 0;
        
        return (
            <Typography 
                variant="body2" 
                sx={{ 
                    fontWeight: isHeader ? 600 : 400,
                    color: accountType === 'Summary' ? '#000' : '#333',
                    fontSize: '11px'
                }}
            >
                {absValue}
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
        currentRatio: summary.currentLiabilities > 0 ? summary.currentAssets / summary.currentLiabilities : 0,
        debtToEquityRatio: summary.totalEquity > 0 ? summary.totalLiabilities / summary.totalEquity : 0,
        equityRatio: summary.totalAssets > 0 ? (summary.totalEquity / summary.totalAssets) * 100 : 0,
        debtRatio: summary.totalAssets > 0 ? (summary.totalLiabilities / summary.totalAssets) * 100 : 0
    };

    // Check if Balance Sheet balances
    const isBalanced = Math.abs(summary.totalAssets - (summary.totalLiabilities + summary.totalEquity)) < 0.01;

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
                    As of: {asOfDate}
                </Typography>
                <Typography variant="body2" sx={{ 
                    fontSize: '10px',
                    color: '#666'
                }}>
                    Report Format: {reportFormat} | Generated on: {moment().format('DD-MM-YYYY HH:mm')}
                </Typography>
            </Box>

            <Divider sx={{ mb: 2, borderColor: '#000' }} />

            {/* Balance Check Alert */}
            <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Paper sx={{ 
                    p: 1, 
                    bgcolor: isBalanced ? '#e8f5e8' : '#fde7e7', 
                    border: `1px solid ${isBalanced ? '#4caf50' : '#f44336'}`,
                    display: 'inline-block'
                }}>
                    <Typography variant="body2" sx={{ 
                        fontSize: '10px', 
                        fontWeight: 600,
                        color: isBalanced ? '#2e7d32' : '#d32f2f'
                    }}>
                        Balance Check: {isBalanced ? '✓ BALANCED' : '✗ NOT BALANCED'}
                    </Typography>
                </Paper>
            </Box>

            {/* Summary Section */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ 
                    fontSize: '14px', 
                    fontWeight: 600, 
                    mb: 1.5,
                    color: '#000'
                }}>
                    Financial Position Summary
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                            <Typography variant="caption" sx={{ fontSize: '9px', color: '#1976d2' }}>
                                Total Assets
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600 }}>
                                {summary?.totalAssets?.toFixed(2) || '0.00'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
                            <Typography variant="caption" sx={{ fontSize: '9px', color: '#d32f2f' }}>
                                Total Liabilities
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600 }}>
                                {summary?.totalLiabilities?.toFixed(2) || '0.00'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper sx={{ p: 1.5, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                            <Typography variant="caption" sx={{ fontSize: '9px', color: '#2e7d32' }}>
                                Total Equity
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '11px', fontWeight: 600 }}>
                                {summary?.totalEquity?.toFixed(2) || '0.00'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={3}>
                        <Paper sx={{ 
                            p: 1.5, 
                            bgcolor: summary?.workingCapital >= 0 ? '#e8f5e8' : '#fff3e0', 
                            border: `1px solid ${summary?.workingCapital >= 0 ? '#4caf50' : '#ff9800'}`
                        }}>
                            <Typography variant="caption" sx={{ fontSize: '9px', color: '#666' }}>
                                Working Capital
                            </Typography>
                            <Typography variant="subtitle2" sx={{ 
                                fontSize: '11px', 
                                fontWeight: 600,
                                color: summary?.workingCapital >= 0 ? '#2e7d32' : '#f57c00'
                            }}>
                                {summary?.workingCapital?.toFixed(2) || '0.00'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            <Divider sx={{ mb: 2, borderColor: '#ddd' }} />

            {/* Main Balance Sheet Table */}
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
                                        : row.account_type === 'Assets'
                                        ? alpha('#2196f3', 0.05)
                                        : row.account_type === 'Liabilities'
                                        ? alpha('#f44336', 0.05)
                                        : alpha('#ff9800', 0.05), // Equity
                                }),
                                ...(row.level === 0 && {
                                    bgcolor: row.account_type === 'Summary' 
                                        ? alpha('#4caf50', 0.15)
                                        : row.account_type === 'Assets'
                                        ? alpha('#2196f3', 0.08)
                                        : row.account_type === 'Liabilities'
                                        ? alpha('#f44336', 0.08)
                                        : alpha('#ff9800', 0.08), // Equity
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
                                                : row.account_type === 'Assets'
                                                ? '1px solid #2196f3'
                                                : row.account_type === 'Liabilities'
                                                ? '1px solid #f44336'
                                                : '1px solid #ff9800', // Equity
                                        }),
                                        ...(row.level === 0 && {
                                            borderBottom: `2px solid ${row.account_type === 'Summary' ? '#4caf50' : 
                                                row.account_type === 'Assets' ? '#2196f3' :
                                                row.account_type === 'Liabilities' ? '#f44336' :
                                                '#ff9800'}`, // Equity
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
                                        if (['current_balance', 'previous_balance', 'current_year', 'previous_year'].includes(column.accessorKey)) {
                                            return formatAmount(cellValue, row.is_header, row.account_type);
                                        }
                                        
                                        // Handle variance column
                                        if (column.accessorKey === 'variance') {
                                            const current = row.current_balance || 0;
                                            const previous = row.previous_balance || 0;
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
                            Current Ratio: {ratios.currentRatio.toFixed(2)}<br />
                            Debt-to-Equity Ratio: {ratios.debtToEquityRatio.toFixed(2)}<br />
                            Equity Ratio: {ratios.equityRatio.toFixed(2)}%<br />
                            Debt Ratio: {ratios.debtRatio.toFixed(2)}%
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontSize: '10px', color: '#666', textAlign: 'right' }}>
                            Balance Sheet Status: {isBalanced ? 'BALANCED ✓' : 'UNBALANCED ✗'}<br />
                            Report generated on: {moment().format('DD/MM/YYYY HH:mm:ss')}<br />
                            Page 1 of 1<br />
                            ERP System - Finance Module
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Accounting Equation Verification */}
            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
                    <strong>Accounting Equation Verification:</strong><br />
                    Assets ({summary?.totalAssets?.toFixed(2)}) = Liabilities ({summary?.totalLiabilities?.toFixed(2)}) + Equity ({summary?.totalEquity?.toFixed(2)})
                    <br />
                    <span style={{ color: isBalanced ? '#2e7d32' : '#d32f2f', fontWeight: 600 }}>
                        {isBalanced ? 'EQUATION BALANCED ✓' : 'EQUATION NOT BALANCED ✗'}
                    </span>
                </Typography>
            </Box>


        </Box>
    );
};

export default BalanceSheetPrint;
