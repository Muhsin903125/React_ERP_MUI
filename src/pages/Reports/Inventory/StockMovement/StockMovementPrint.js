import React from 'react';
import dayjs from 'dayjs';
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
    Grid,
    Card,
    CardContent,
    Chip,
    Stack,
    Divider,
    Button,
    useTheme,
    alpha
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import TimelineIcon from '@mui/icons-material/Timeline';

const StockMovementPrint = ({ data, filters, onClose }) => {
    const theme = useTheme();

    const handlePrint = () => {
        const printContent = document.getElementById('stock-movement-print-content');
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
        
        winPrint.document.write(`
            <html>
                <head>
                    <title>Stock Movement Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1976d2; padding-bottom: 20px; }
                        .company-name { font-size: 24px; font-weight: bold; color: #1976d2; margin-bottom: 5px; }
                        .report-title { font-size: 20px; font-weight: 600; margin-bottom: 10px; }
                        .report-date { font-size: 14px; color: #666; }
                        .filters { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
                        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
                        .summary-card { background: #fff; border: 1px solid #ddd; padding: 15px; border-radius: 5px; text-align: center; }
                        .summary-value { font-size: 24px; font-weight: bold; color: #1976d2; }
                        .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .direction-in { color: #2e7d32; font-weight: bold; }
                        .direction-out { color: #d32f2f; font-weight: bold; }
                        .status-completed { color: #2e7d32; font-weight: bold; }
                        .status-pending { color: #ed6c02; font-weight: bold; }
                        .status-cancelled { color: #d32f2f; font-weight: bold; }
                        .analysis { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
                        .insight-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0; }
                        .insight-item { background: #fff; padding: 10px; border-radius: 5px; border-left: 4px solid #1976d2; }
                        .movement-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 15px 0; }
                        .movement-item { background: #fff; padding: 8px; border-radius: 3px; text-align: center; border: 1px solid #ddd; }
                        @media print {
                            body { margin: 0; }
                            .no-print { display: none; }
                            table { page-break-inside: auto; }
                            tr { page-break-inside: avoid; page-break-after: auto; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);
        
        winPrint.document.close();
        winPrint.focus();
        winPrint.print();
        winPrint.close();
    };

    // Calculate summary statistics
    const totalMovements = data.length;
    const inwardMovements = data.filter(item => item.direction === 'In').length;
    const outwardMovements = data.filter(item => item.direction === 'Out').length;
    const totalInwardValue = data
        .filter(item => item.direction === 'In')
        .reduce((sum, item) => sum + Math.abs(item.totalValue), 0);
    const totalOutwardValue = data
        .filter(item => item.direction === 'Out')
        .reduce((sum, item) => sum + Math.abs(item.totalValue), 0);
    const netValue = totalInwardValue - totalOutwardValue;

    // Movement type analysis
    const movementTypeAnalysis = data.reduce((acc, item) => {
        if (!acc[item.movementType]) {
            acc[item.movementType] = {
                count: 0,
                totalValue: 0,
                inward: 0,
                outward: 0
            };
        }
        acc[item.movementType].count += 1;
        acc[item.movementType].totalValue += Math.abs(item.totalValue);
        if (item.direction === 'In') {
            acc[item.movementType].inward += 1;
        } else {
            acc[item.movementType].outward += 1;
        }
        return acc;
    }, {});

    // Location analysis
    const locationAnalysis = data.reduce((acc, item) => {
        if (!acc[item.location]) {
            acc[item.location] = {
                count: 0,
                totalValue: 0,
                inward: 0,
                outward: 0,
                netValue: 0
            };
        }
        acc[item.location].count += 1;
        acc[item.location].totalValue += Math.abs(item.totalValue);
        if (item.direction === 'In') {
            acc[item.location].inward += 1;
            acc[item.location].netValue += item.totalValue;
        } else {
            acc[item.location].outward += 1;
            acc[item.location].netValue += item.totalValue; // Already negative
        }
        return acc;
    }, {});

    // Top movement types by count
    const topMovementTypes = Object.entries(movementTypeAnalysis)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5);

    // Top locations by activity
    const topLocations = Object.entries(locationAnalysis)
        .sort(([,a], [,b]) => b.count - a.count)
        .slice(0, 5);

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', minHeight: '100vh' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }} className="no-print">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Stock Movement Report
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                        >
                            Print Report
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<CloseIcon />}
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </Stack>
                </Stack>
            </Box>

            <Box id="stock-movement-print-content" sx={{ p: 4 }}>
                {/* Header */}
                <Box className="header" sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: 2, borderColor: 'primary.main' }}>
                    <Typography className="company-name" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                        ERP System
                    </Typography>
                    <Typography className="report-title" variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Stock Movement Report
                    </Typography>
                    <Typography className="report-date" variant="body2" color="textSecondary">
                        Generated on {dayjs().format('MMMM DD, YYYY [at] HH:mm')}
                    </Typography>
                </Box>

                {/* Filters Applied */}
                <Box className="filters" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 1, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Filters Applied:</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2"><strong>Date Range:</strong></Typography>
                            <Typography variant="body2">
                                {filters.startDate.format('MMM DD, YYYY')} - {filters.endDate.format('MMM DD, YYYY')}
                            </Typography>
                        </Grid>
                        {filters.product && (
                            <Grid item xs={6} md={3}>
                                <Typography variant="body2"><strong>Product:</strong></Typography>
                                <Typography variant="body2">{filters.product}</Typography>
                            </Grid>
                        )}
                        {filters.location && (
                            <Grid item xs={6} md={3}>
                                <Typography variant="body2"><strong>Location:</strong></Typography>
                                <Typography variant="body2">{filters.location}</Typography>
                            </Grid>
                        )}
                        {filters.movementType && (
                            <Grid item xs={6} md={3}>
                                <Typography variant="body2"><strong>Movement Type:</strong></Typography>
                                <Typography variant="body2">{filters.movementType}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>

                {/* Summary Statistics */}
                <Box className="summary-grid" sx={{ mb: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {totalMovements.toLocaleString()}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Total Movements
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    {inwardMovements.toLocaleString()}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Inward Movements
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                    {outwardMovements.toLocaleString()}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Outward Movements
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography 
                                    className="summary-value" 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        color: netValue >= 0 ? 'success.main' : 'error.main' 
                                    }}
                                >
                                    ${Math.abs(netValue).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Net Value Change
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Movement Analysis */}
                <Box className="analysis" sx={{ mb: 4, p: 3, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Movement Analysis</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Box className="insight-item" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, borderLeft: 4, borderColor: 'primary.main' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Value Summary</Typography>
                                <Typography variant="body2">Total Inward Value: <strong>${totalInwardValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></Typography>
                                <Typography variant="body2">Total Outward Value: <strong>${totalOutwardValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></Typography>
                                <Typography variant="body2">Net Change: <strong style={{ color: netValue >= 0 ? '#2e7d32' : '#d32f2f' }}>${Math.abs(netValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box className="insight-item" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, borderLeft: 4, borderColor: 'success.main' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Movement Insights</Typography>
                                <Typography variant="body2">Average Transaction Value: <strong>${((totalInwardValue + totalOutwardValue) / totalMovements).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></Typography>
                                <Typography variant="body2">Inward/Outward Ratio: <strong>{(inwardMovements / (outwardMovements || 1)).toFixed(2)}:1</strong></Typography>
                                <Typography variant="body2">Completed Transactions: <strong>{data.filter(item => item.status === 'Completed').length}</strong></Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Movement Type Breakdown */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Movement Type Analysis</Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Movement Type</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Count</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Value</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Inward</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Outward</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>% of Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topMovementTypes.map(([type, analysis]) => (
                                    <TableRow key={type}>
                                        <TableCell>{type}</TableCell>
                                        <TableCell align="right">{analysis.count}</TableCell>
                                        <TableCell align="right">
                                            ${analysis.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="right">{analysis.inward}</TableCell>
                                        <TableCell align="right">{analysis.outward}</TableCell>
                                        <TableCell align="right">
                                            {((analysis.count / totalMovements) * 100).toFixed(1)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Location Analysis */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Location Activity Analysis</Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Movements</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Inward</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Outward</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Net Value</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Activity %</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topLocations.map(([location, analysis]) => (
                                    <TableRow key={location}>
                                        <TableCell>{location}</TableCell>
                                        <TableCell align="right">{analysis.count}</TableCell>
                                        <TableCell align="right">{analysis.inward}</TableCell>
                                        <TableCell align="right">{analysis.outward}</TableCell>
                                        <TableCell align="right" style={{ color: analysis.netValue >= 0 ? '#2e7d32' : '#d32f2f' }}>
                                            ${Math.abs(analysis.netValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="right">
                                            {((analysis.count / totalMovements) * 100).toFixed(1)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Detailed Movement Data */}
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Movement Details</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Movement ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Direction</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Value</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Reference</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.slice(0, 50).map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{dayjs(row.movementDate).format('MMM DD, YYYY')}</TableCell>
                                        <TableCell>{row.product}</TableCell>
                                        <TableCell>{row.location}</TableCell>
                                        <TableCell>{row.movementType}</TableCell>
                                        <TableCell>
                                            <span className={`direction-${row.direction.toLowerCase()}`}>
                                                {row.direction}
                                            </span>
                                        </TableCell>
                                        <TableCell align="right">
                                            <span className={`direction-${row.direction.toLowerCase()}`}>
                                                {row.quantity > 0 ? '+' : ''}{row.quantity.toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell align="right">
                                            <span className={`direction-${row.direction.toLowerCase()}`}>
                                                ${Math.abs(row.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell>{row.referenceNo}</TableCell>
                                        <TableCell>
                                            <span className={`status-${row.status.toLowerCase()}`}>
                                                {row.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    {data.length > 50 && (
                        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                            Showing first 50 records out of {data.length} total records
                        </Typography>
                    )}
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                        This report was generated by ERP System on {dayjs().format('MMMM DD, YYYY [at] HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Total movements analyzed: {data.length}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default StockMovementPrint;
