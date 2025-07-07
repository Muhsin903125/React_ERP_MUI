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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import BusinessIcon from '@mui/icons-material/Business';

const StockLocBalancePrint = ({ data, filters, viewType, summary, onClose }) => {
    const theme = useTheme();

    const handlePrint = () => {
        const printContent = document.getElementById('stock-loc-balance-print-content');
        const winPrint = window.open('', '', 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
        
        winPrint.document.write(`
            <html>
                <head>
                    <title>Stock Location Balance Report</title>
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
                        .status-critical { color: #d32f2f; font-weight: bold; }
                        .status-low { color: #ed6c02; font-weight: bold; }
                        .status-healthy { color: #2e7d32; font-weight: bold; }
                        .location-warehouse { color: #1976d2; }
                        .location-store { color: #0288d1; }
                        .location-office { color: #7b1fa2; }
                        .total-row { background-color: #e3f2fd; font-weight: bold; }
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

    const getViewTypeLabel = (type) => {
        switch (type) {
            case 'summary': return 'Location Summary';
            case 'by_location': return 'Cross Location View';
            case 'by_product': return 'Product Detail View';
            default: return 'Unknown View';
        }
    };

    const renderSummaryTable = () => {
        if (viewType !== 'summary') return null;

        return (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Items</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Quantity</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Value</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow 
                                key={index}
                                className={row.is_total ? 'total-row' : ''}
                                sx={row.is_total ? { bgcolor: alpha(theme.palette.primary.main, 0.1) } : {}}
                            >
                                <TableCell className={`location-${row.location_type}`}>
                                    {row.location_name}
                                </TableCell>
                                <TableCell align="right">{row.total_items || 0}</TableCell>
                                <TableCell align="right">{row.total_quantity?.toLocaleString() || 0}</TableCell>
                                <TableCell align="right">
                                    ${row.total_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderByLocationTable = () => {
        if (viewType !== 'by_location') return null;

        const locations = filters.selectedLocations || [];
        
        return (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Product Code</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                            {locations.map(loc => (
                                <TableCell key={loc.code} align="right" sx={{ fontWeight: 'bold' }}>
                                    {loc.name}
                                </TableCell>
                            ))}
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow 
                                key={index}
                                className={row.is_total ? 'total-row' : ''}
                                sx={row.is_total ? { bgcolor: alpha(theme.palette.primary.main, 0.1) } : {}}
                            >
                                <TableCell>{row.product_code}</TableCell>
                                <TableCell>{row.product_name}</TableCell>
                                {locations.map(loc => (
                                    <TableCell key={loc.code} align="right">
                                        {row[`qty_${loc.code}`]?.toLocaleString() || 0}
                                    </TableCell>
                                ))}
                                <TableCell align="right">{row.total_quantity?.toLocaleString() || 0}</TableCell>
                                <TableCell>
                                    <span className={`status-${row.stock_status}`}>
                                        {row.stock_status || 'Normal'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    const renderByProductTable = () => {
        if (viewType !== 'by_product') return null;

        return (
            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Product Code</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Product Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>On Hand</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Allocated</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Available</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Value</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.product_code}</TableCell>
                                <TableCell>{row.product_name}</TableCell>
                                <TableCell className={`location-${row.location_type}`}>
                                    {row.location_name}
                                </TableCell>
                                <TableCell align="right">{row.quantity_on_hand?.toLocaleString() || 0}</TableCell>
                                <TableCell align="right">{row.quantity_allocated?.toLocaleString() || 0}</TableCell>
                                <TableCell align="right">{row.quantity_available?.toLocaleString() || 0}</TableCell>
                                <TableCell align="right">
                                    ${row.total_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </TableCell>
                                <TableCell>
                                    <span className={`status-${row.stock_status}`}>
                                        {row.stock_status || 'Normal'}
                                    </span>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Box sx={{ width: '100%', bgcolor: 'background.paper', minHeight: '100vh' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }} className="no-print">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Stock Location Balance Report
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

            <Box id="stock-loc-balance-print-content" sx={{ p: 4 }}>
                {/* Header */}
                <Box className="header" sx={{ textAlign: 'center', mb: 4, pb: 2, borderBottom: 2, borderColor: 'primary.main' }}>
                    <Typography className="company-name" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                        ERP System
                    </Typography>
                    <Typography className="report-title" variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        Stock Location Balance Report
                    </Typography>
                    <Typography className="report-date" variant="body2" color="textSecondary">
                        Generated on {dayjs().format('MMMM DD, YYYY [at] HH:mm')}
                    </Typography>
                </Box>

                {/* Filters Applied */}
                <Box className="filters" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05), p: 2, borderRadius: 1, mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Report Parameters:</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2"><strong>As of Date:</strong></Typography>
                            <Typography variant="body2">
                                {filters.asOfDate ? dayjs(filters.asOfDate).format('MMM DD, YYYY') : 'N/A'}
                            </Typography>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2"><strong>View Type:</strong></Typography>
                            <Typography variant="body2">{getViewTypeLabel(viewType)}</Typography>
                        </Grid>
                        {filters.selectedLocations && (
                            <Grid item xs={6} md={3}>
                                <Typography variant="body2"><strong>Locations:</strong></Typography>
                                <Typography variant="body2">
                                    {filters.selectedLocations.map(loc => loc.name).join(', ')}
                                </Typography>
                            </Grid>
                        )}
                        <Grid item xs={6} md={3}>
                            <Typography variant="body2"><strong>Include Values:</strong></Typography>
                            <Typography variant="body2">{filters.showValues ? 'Yes' : 'No'}</Typography>
                        </Grid>
                    </Grid>
                </Box>

                {/* Summary Statistics */}
                <Box className="summary-grid" sx={{ mb: 4 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    {summary?.totalLocations || 0}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Total Locations
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    {summary?.totalItems || 0}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Total Items
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
                                    {summary?.totalQuantity?.toLocaleString() || 0}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Total Quantity
                                </Typography>
                            </Card>
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <Card className="summary-card" sx={{ textAlign: 'center', p: 2 }}>
                                <Typography className="summary-value" variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                                    ${summary?.totalValue?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || 0}
                                </Typography>
                                <Typography className="summary-label" variant="body2" color="textSecondary">
                                    Total Value
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Stock Status Breakdown */}
                {(summary?.criticalItems > 0 || summary?.lowStockItems > 0) && (
                    <Box sx={{ mb: 4, p: 3, bgcolor: alpha(theme.palette.background.paper, 0.5), borderRadius: 1 }}>
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Stock Status Analysis</Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">Critical Items:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                                        {summary?.criticalItems || 0}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">Low Stock Items:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                                        {summary?.lowStockItems || 0}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="body2">Healthy Items:</Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                                        {summary?.healthyItems || 0}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Data Tables */}
                <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {getViewTypeLabel(viewType)} - Detailed Data
                    </Typography>
                    {renderSummaryTable()}
                    {renderByLocationTable()}
                    {renderByProductTable()}
                </Box>

                {/* Footer */}
                <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                        This report was generated by ERP System on {dayjs().format('MMMM DD, YYYY [at] HH:mm')}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        View: {getViewTypeLabel(viewType)} | Total records: {data?.length || 0}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default StockLocBalancePrint;
