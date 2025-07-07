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
import BusinessIcon from '@mui/icons-material/Business';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TimelineIcon from '@mui/icons-material/Timeline';

const PurchaseAnalysisPrint = ({ data, filters, onClose }) => {
    const theme = useTheme();

    const handlePrint = () => {
        const printContent = document.getElementById('purchase-analysis-print-content');
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
        
        winPrint.document.write(`
            <html>
                <head>
                    <title>Purchase Analysis Report</title>
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
                        .status-completed { color: #2e7d32; font-weight: bold; }
                        .status-pending { color: #ed6c02; font-weight: bold; }
                        .status-cancelled { color: #d32f2f; font-weight: bold; }
                        .priority-high { color: #d32f2f; font-weight: bold; }
                        .priority-medium { color: #ed6c02; font-weight: bold; }
                        .priority-low { color: #2e7d32; font-weight: bold; }
                        .analysis { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
                        .insight-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 15px 0; }
                        .insight-item { background: #fff; padding: 10px; border-radius: 5px; border-left: 4px solid #1976d2; }
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
    const totalPurchases = data.length;
    const totalAmount = data.reduce((sum, item) => sum + item.finalCost, 0);
    const avgOrderValue = totalAmount / (totalPurchases || 1);
    const onTimeDeliveryRate = data.length > 0 
        ? (data.filter(item => item.onTimeDelivery).length / data.length) * 100 
        : 0;

    // Supplier analysis
    const supplierAnalysis = data.reduce((acc, item) => {
        if (!acc[item.supplier]) {
            acc[item.supplier] = {
                totalAmount: 0,
                orderCount: 0,
                onTimeDeliveries: 0,
                avgLeadTime: 0,
                leadTimes: []
            };
        }
        acc[item.supplier].totalAmount += item.finalCost;
        acc[item.supplier].orderCount += 1;
        if (item.onTimeDelivery) acc[item.supplier].onTimeDeliveries += 1;
        acc[item.supplier].leadTimes.push(item.leadTime);
        return acc;
    }, {});

    // Calculate average lead time for each supplier
    Object.keys(supplierAnalysis).forEach(supplier => {
        const leadTimes = supplierAnalysis[supplier].leadTimes;
        supplierAnalysis[supplier].avgLeadTime = leadTimes.reduce((sum, time) => sum + time, 0) / leadTimes.length;
        supplierAnalysis[supplier].onTimeRate = (supplierAnalysis[supplier].onTimeDeliveries / supplierAnalysis[supplier].orderCount) * 100;
    });

    // Top suppliers
    const topSuppliers = Object.entries(supplierAnalysis)
        .sort(([,a], [,b]) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

    // Category analysis
    const categoryAnalysis = data.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = { totalAmount: 0, orderCount: 0 };
        }
        acc[item.category].totalAmount += item.finalCost;
        acc[item.category].orderCount += 1;
        return acc;
    }, {});

    const topCategories = Object.entries(categoryAnalysis)
        .sort(([,a], [,b]) => b.totalAmount - a.totalAmount)
        .slice(0, 5);

    // Performance metrics
    const avgLeadTime = data.reduce((sum, item) => sum + item.leadTime, 0) / data.length;
    const completedOrders = data.filter(item => item.status === 'Completed').length;
    const completionRate = (completedOrders / data.length) * 100;
    const highPriorityOrders = data.filter(item => item.priority === 'High').length;

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', minHeight: '100vh' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }} className="no-print">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Purchase Analysis Report
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

            <Box id="purchase-analysis-print-content" sx={{ p: 4 }}>
                {/* Header */}
                <Box className="header" sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: 2, borderColor: 'primary.main' }}>
                    <Typography className="company-name" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                        ERP System
                    </Typography>
                    <Typography className="report-title" variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Purchase Analysis Report
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
                        {filters.supplier && (
                            <Grid item xs={6} md={3}>
                                <Typography variant="body2"><strong>Supplier:</strong></Typography>
                                <Typography variant="body2">{filters.supplier}</Typography>
                            </Grid>
                        )}
                        {filters.category && (
                            <Grid item xs={6} md={3}>
                                <Typography variant="body2"><strong>Category:</strong></Typography>
                                <Typography variant="body2">{filters.category}</Typography>
                            </Grid>
                        )}
                        {filters.status && (
                            <Grid item xs={6} md={3}>
                                <Typography variant="body2"><strong>Status:</strong></Typography>
                                <Typography variant="body2">{filters.status}</Typography>
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
                                    {totalPurchases.toLocaleString()}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Total Purchases
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Total Amount
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                                    ${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Avg Order Value
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                    {onTimeDeliveryRate.toFixed(1)}%
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    On-Time Delivery
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Performance Analysis */}
                <Box className="analysis" sx={{ mb: 4, p: 3, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 1 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Performance Analysis</Typography>
                    <Grid container spacing={3} className="insight-grid">
                        <Grid item xs={12} md={6}>
                            <Box className="insight-item" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, borderLeft: 4, borderColor: 'primary.main' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Delivery Performance</Typography>
                                <Typography variant="body2">Average Lead Time: <strong>{avgLeadTime.toFixed(1)} days</strong></Typography>
                                <Typography variant="body2">On-Time Delivery Rate: <strong>{onTimeDeliveryRate.toFixed(1)}%</strong></Typography>
                                <Typography variant="body2">Completed Orders: <strong>{completedOrders} ({completionRate.toFixed(1)}%)</strong></Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box className="insight-item" sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, borderLeft: 4, borderColor: 'success.main' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Order Insights</Typography>
                                <Typography variant="body2">High Priority Orders: <strong>{highPriorityOrders}</strong></Typography>
                                <Typography variant="body2">Average Order Value: <strong>${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></Typography>
                                <Typography variant="body2">Total Suppliers: <strong>{Object.keys(supplierAnalysis).length}</strong></Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Top Suppliers Analysis */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Top Suppliers by Purchase Value</Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Orders</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Avg Lead Time</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>On-Time Rate</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topSuppliers.map(([supplier, analysis]) => (
                                    <TableRow key={supplier}>
                                        <TableCell>{supplier}</TableCell>
                                        <TableCell align="right">
                                            ${analysis.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="right">{analysis.orderCount}</TableCell>
                                        <TableCell align="right">{analysis.avgLeadTime.toFixed(1)} days</TableCell>
                                        <TableCell align="right">{analysis.onTimeRate.toFixed(1)}%</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Top Categories */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Purchase by Category</Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Amount</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Orders</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Avg Order Value</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>% of Total</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {topCategories.map(([category, analysis]) => (
                                    <TableRow key={category}>
                                        <TableCell>{category}</TableCell>
                                        <TableCell align="right">
                                            ${analysis.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="right">{analysis.orderCount}</TableCell>
                                        <TableCell align="right">
                                            ${(analysis.totalAmount / analysis.orderCount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="right">
                                            {((analysis.totalAmount / totalAmount) * 100).toFixed(1)}%
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Detailed Purchase Data */}
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Purchase Details</Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Purchase ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Product</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Qty</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Final Cost</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Lead Time</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.slice(0, 50).map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{dayjs(row.purchaseDate).format('MMM DD, YYYY')}</TableCell>
                                        <TableCell>{row.supplier}</TableCell>
                                        <TableCell>{row.product}</TableCell>
                                        <TableCell align="right">{row.quantity.toLocaleString()}</TableCell>
                                        <TableCell align="right">
                                            ${row.finalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`status-${row.status.toLowerCase()}`}>
                                                {row.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`priority-${row.priority.toLowerCase()}`}>
                                                {row.priority}
                                            </span>
                                        </TableCell>
                                        <TableCell align="right">{row.leadTime} days</TableCell>
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
                        Total records analyzed: {data.length}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default PurchaseAnalysisPrint;
