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

const AgeingPrint = ({ 
    data = [], 
    title = "Ageing Analysis Report", 
    asOfDate, 
    reportFormat, 
    reportType,
    summary = {},
    columns = []
}) => {
    const theme = useTheme();

    // Helper function to format amount with proper styling
    const formatAmount = (value, isHeader = false, ageingBucket = null) => {
        if (isHeader && (!value || value === 0)) return '-';
        if (value === 0 || value === null || value === undefined) return '-';
        
        const absValue = Math.abs(value).toFixed(2);
        
        // Color coding based on aging bucket
        let color = '#333';
        if (ageingBucket) {
            if (ageingBucket.includes('120+') || ageingBucket.includes('Over')) {
                color = '#d32f2f';
            } else if (ageingBucket.includes('61-90') || ageingBucket.includes('91-120')) {
                color = '#f57c00';
            } else if (ageingBucket.includes('31-60')) {
                color = '#1976d2';
            } else {
                color = '#2e7d32';
            }
        }
        
        return (
            <Typography 
                variant="body2" 
                sx={{ 
                    fontWeight: isHeader ? 600 : 400,
                    color,
                    fontSize: '11px'
                }}
            >
                {absValue}
            </Typography>
        );
    };

    // Helper function to get customer/supplier name with proper indentation
    const formatCustomerName = (item) => {
        const level = item?.level || 0;
        const isHeader = item?.is_header || false;
        const marginLeft = level * 10; // Reduced margin for print
        
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
                    {item?.customer_name || ''}
                </Typography>
            </Box>
        );
    };

    // Calculate aging distribution percentages
    const totalRow = data.find(item => item.customer_type === 'summary');
    const agingDistribution = totalRow ? {
        current: totalRow.total_outstanding > 0 ? (totalRow.current / totalRow.total_outstanding) * 100 : 0,
        days31_60: totalRow.total_outstanding > 0 ? (totalRow.days_31_60 / totalRow.total_outstanding) * 100 : 0,
        days61_90: totalRow.total_outstanding > 0 ? (totalRow.days_61_90 / totalRow.total_outstanding) * 100 : 0,
        days91_120: totalRow.total_outstanding > 0 ? (totalRow.days_91_120 / totalRow.total_outstanding) * 100 : 0,
        days120Plus: totalRow.total_outstanding > 0 ? (totalRow.days_120_plus / totalRow.total_outstanding) * 100 : 0
    } : {
        current: 0, days31_60: 0, days61_90: 0, days91_120: 0, days120Plus: 0
    };

    // Get aging insights
    const getAgingInsights = () => {
        if (!totalRow) return 'No data available';
        
        const overduePercentage = totalRow.total_outstanding > 0 ? 
            (totalRow.overdue_amount / totalRow.total_outstanding) * 100 : 0;
        
        if (overduePercentage > 50) return 'HIGH RISK - Over 50% overdue';
        if (overduePercentage > 30) return 'MEDIUM RISK - 30-50% overdue';
        if (overduePercentage > 10) return 'LOW RISK - 10-30% overdue';
        return 'GOOD - Less than 10% overdue';
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
                    As of: {asOfDate}
                </Typography>
                <Typography variant="body2" sx={{ 
                    fontSize: '10px',
                    color: '#666'
                }}>
                    Report Type: {reportType} | Format: {reportFormat} | Generated: {moment().format('DD-MM-YYYY HH:mm')}
                </Typography>
            </Box>

            <Divider sx={{ mb: 2, borderColor: '#000' }} />

            {/* Aging Risk Assessment */}
            <Box sx={{ mb: 2, textAlign: 'center' }}>
                <Paper sx={{ 
                    p: 1, 
                    bgcolor: summary?.overduePercentage > 30 ? '#fde7e7' : 
                            summary?.overduePercentage > 10 ? '#fff3e0' : '#e8f5e8', 
                    border: `1px solid ${summary?.overduePercentage > 30 ? '#f44336' : 
                                       summary?.overduePercentage > 10 ? '#ff9800' : '#4caf50'}`,
                    display: 'inline-block'
                }}>
                    <Typography variant="body2" sx={{ 
                        fontSize: '10px', 
                        fontWeight: 600,
                        color: summary?.overduePercentage > 30 ? '#d32f2f' : 
                               summary?.overduePercentage > 10 ? '#f57c00' : '#2e7d32'
                    }}>
                        Risk Assessment: {getAgingInsights()}
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
                    Aging Summary
                </Typography>
                <Grid container spacing={1.5}>
                    <Grid item xs={2.4}>
                        <Paper sx={{ p: 1, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                            <Typography variant="caption" sx={{ fontSize: '8px', color: '#2e7d32' }}>
                                Total Outstanding
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '10px', fontWeight: 600 }}>
                                {summary?.totalOutstanding?.toFixed(2) || '0.00'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={2.4}>
                        <Paper sx={{ p: 1, bgcolor: '#e3f2fd', border: '1px solid #2196f3' }}>
                            <Typography variant="caption" sx={{ fontSize: '8px', color: '#1976d2' }}>
                                Current (0-30)
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '10px', fontWeight: 600 }}>
                                {summary?.currentAmount?.toFixed(2) || '0.00'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '7px', color: '#666' }}>
                                ({agingDistribution.current.toFixed(1)}%)
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={2.4}>
                        <Paper sx={{ p: 1, bgcolor: '#fff3e0', border: '1px solid #ff9800' }}>
                            <Typography variant="caption" sx={{ fontSize: '8px', color: '#f57c00' }}>
                                Overdue Amount
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '10px', fontWeight: 600 }}>
                                {summary?.overdueAmount?.toFixed(2) || '0.00'}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '7px', color: '#666' }}>
                                ({summary?.overduePercentage?.toFixed(1) || '0.0'}%)
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={2.4}>
                        <Paper sx={{ p: 1, bgcolor: '#f3e5f5', border: '1px solid #9c27b0' }}>
                            <Typography variant="caption" sx={{ fontSize: '8px', color: '#7b1fa2' }}>
                                Accounts Count
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '10px', fontWeight: 600 }}>
                                {summary?.customersCount || 0}
                            </Typography>
                            <Typography variant="caption" sx={{ fontSize: '7px', color: '#666' }}>
                                ({summary?.overdueCustomersCount || 0} overdue)
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={2.4}>
                        <Paper sx={{ p: 1, bgcolor: '#fce4ec', border: '1px solid #e91e63' }}>
                            <Typography variant="caption" sx={{ fontSize: '8px', color: '#c2185b' }}>
                                Avg Days Overdue
                            </Typography>
                            <Typography variant="subtitle2" sx={{ fontSize: '10px', fontWeight: 600 }}>
                                {summary?.avgDaysOverdue || 0} days
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Aging Distribution Chart (Text-based) */}
            {reportFormat === 'detailed' && totalRow && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        mb: 1,
                        color: '#000'
                    }}>
                        Aging Distribution
                    </Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={2.4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontSize: '8px' }}>Current</Typography>
                                <Box sx={{ height: 20, bgcolor: '#4caf50', mb: 0.5, borderRadius: 1 }} />
                                <Typography variant="caption" sx={{ fontSize: '7px' }}>
                                    {agingDistribution.current.toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={2.4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontSize: '8px' }}>31-60 days</Typography>
                                <Box sx={{ height: 20, bgcolor: '#2196f3', mb: 0.5, borderRadius: 1 }} />
                                <Typography variant="caption" sx={{ fontSize: '7px' }}>
                                    {agingDistribution.days31_60.toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={2.4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontSize: '8px' }}>61-90 days</Typography>
                                <Box sx={{ height: 20, bgcolor: '#ff9800', mb: 0.5, borderRadius: 1 }} />
                                <Typography variant="caption" sx={{ fontSize: '7px' }}>
                                    {agingDistribution.days61_90.toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={2.4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontSize: '8px' }}>91-120 days</Typography>
                                <Box sx={{ height: 20, bgcolor: '#f44336', mb: 0.5, borderRadius: 1 }} />
                                <Typography variant="caption" sx={{ fontSize: '7px' }}>
                                    {agingDistribution.days91_120.toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={2.4}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" sx={{ fontSize: '8px' }}>120+ days</Typography>
                                <Box sx={{ height: 20, bgcolor: '#9c27b0', mb: 0.5, borderRadius: 1 }} />
                                <Typography variant="caption" sx={{ fontSize: '7px' }}>
                                    {agingDistribution.days120Plus.toFixed(1)}%
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            )}

            <Divider sx={{ mb: 2, borderColor: '#ddd' }} />

            {/* Main Ageing Table */}
            <Table size="small" sx={{ 
                '& .MuiTableCell-root': { 
                    fontSize: '10px',
                    border: '1px solid #ddd',
                    py: 0.3,
                    px: 0.8
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
                                    fontSize: '9px',
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
                                    bgcolor: row.customer_type === 'summary' 
                                        ? alpha('#2196f3', 0.1)
                                        : alpha('#9c27b0', 0.05),
                                }),
                                // Color coding based on overdue status
                                ...(!row.is_header && row.days_overdue > 120 && {
                                    bgcolor: alpha('#f44336', 0.08),
                                }),
                                ...(!row.is_header && row.days_overdue > 60 && row.days_overdue <= 120 && {
                                    bgcolor: alpha('#ff9800', 0.08),
                                }),
                                ...(!row.is_header && row.days_overdue > 30 && row.days_overdue <= 60 && {
                                    bgcolor: alpha('#2196f3', 0.08),
                                }),
                            }}
                        >
                            {columns.map((column, colIndex) => (
                                <TableCell 
                                    key={colIndex}
                                    align={column.muiTableBodyCellProps?.align || 'left'}
                                    sx={{
                                        ...(row.is_header && {
                                            borderBottom: row.customer_type === 'summary' 
                                                ? '2px solid #2196f3'
                                                : '1px solid #9c27b0',
                                        }),
                                    }}
                                >
                                    {(() => {
                                        const cellValue = row[column.accessorKey];
                                        
                                        // Handle customer/supplier name with indentation
                                        if (column.accessorKey === 'customer_name') {
                                            return formatCustomerName(row);
                                        }
                                        
                                        // Handle customer/supplier code
                                        if (column.accessorKey === 'customer_code') {
                                            return (
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontWeight: row.is_header ? 600 : 400,
                                                        fontSize: '9px',
                                                        fontFamily: 'monospace'
                                                    }}
                                                >
                                                    {cellValue || ''}
                                                </Typography>
                                            );
                                        }
                                        
                                        // Handle aging bucket amounts
                                        if (['current', 'days_31_60', 'days_61_90', 'days_91_120', 'days_120_plus', 'total_outstanding', 'overdue_amount'].includes(column.accessorKey)) {
                                            const bucketMap = {
                                                'current': 'Current',
                                                'days_31_60': '31-60',
                                                'days_61_90': '61-90',
                                                'days_91_120': '91-120',
                                                'days_120_plus': '120+',
                                                'overdue_amount': 'Over'
                                            };
                                            return formatAmount(cellValue, row.is_header, bucketMap[column.accessorKey]);
                                        }
                                        
                                        // Handle days overdue
                                        if (column.accessorKey === 'days_overdue') {
                                            if (!cellValue || cellValue === 0) {
                                                return <Typography variant="body2" sx={{ fontSize: '9px', color: '#666' }}>-</Typography>;
                                            }
                                            
                                            let color = '#2e7d32';
                                            if (cellValue > 120) color = '#d32f2f';
                                            else if (cellValue > 60) color = '#f57c00';
                                            else if (cellValue > 30) color = '#1976d2';
                                            
                                            return (
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ 
                                                        fontSize: '9px',
                                                        fontWeight: 500,
                                                        color
                                                    }}
                                                >
                                                    {cellValue} days
                                                </Typography>
                                            );
                                        }
                                        
                                        // Handle last payment date
                                        if (column.accessorKey === 'last_payment_date') {
                                            if (!cellValue) {
                                                return <Typography variant="body2" sx={{ fontSize: '9px', color: '#666' }}>-</Typography>;
                                            }
                                            return (
                                                <Typography variant="body2" sx={{ fontSize: '9px' }}>
                                                    {moment(cellValue).format('DD-MM-YYYY')}
                                                </Typography>
                                            );
                                        }
                                        
                                        // Default text display
                                        return (
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontSize: '9px',
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
                        <Typography variant="body2" sx={{ fontSize: '9px', color: '#666' }}>
                            <strong>Collection Insights:</strong><br />
                            • Priority follow-up required for amounts over 90 days<br />
                            • Consider credit limit review for high-risk accounts<br />
                            • Implement payment reminders for 30+ day amounts<br />
                            • Review payment terms for frequently overdue accounts
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" sx={{ fontSize: '9px', color: '#666', textAlign: 'right' }}>
                            <strong>Aging Legend:</strong><br />
                            <span style={{ color: '#2e7d32' }}>● Current (0-30 days)</span><br />
                            <span style={{ color: '#1976d2' }}>● 31-60 days</span><br />
                            <span style={{ color: '#f57c00' }}>● 61-90 days</span><br />
                            <span style={{ color: '#d32f2f' }}>● 91+ days (High Risk)</span><br /><br />
                            Report generated: {moment().format('DD/MM/YYYY HH:mm:ss')}<br />
                            ERP System - Finance Module
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Risk Assessment Summary */}
            <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f5f5f5', border: '1px solid #ddd', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '9px', color: '#666', textAlign: 'center' }}>
                    <strong>Risk Assessment Summary:</strong> {getAgingInsights()} | 
                    Overdue Percentage: {summary?.overduePercentage?.toFixed(1) || '0.0'}% | 
                    Average Days Overdue: {summary?.avgDaysOverdue || 0} days |
                    Accounts Requiring Immediate Attention: {data.filter(item => !item.is_header && item.days_overdue > 90).length}
                </Typography>
            </Box>
        </Box>
    );
};

export default AgeingPrint;
