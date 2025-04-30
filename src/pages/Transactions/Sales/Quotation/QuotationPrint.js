import React from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Divider } from '@mui/material';
 
// Helper to add days to a date
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + Number(days));
    return result;
}

// A4 size constants (in mm converted to px at 96 DPI)
const MM_TO_PX = 3.7795275591; // 1mm = 3.7795275591px at 96 DPI
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const PAGE_WIDTH = Math.floor(A4_WIDTH_MM * MM_TO_PX); // ~794px
const PAGE_HEIGHT = Math.floor(A4_HEIGHT_MM * MM_TO_PX); // ~1123px
const MARGIN_MM = 5;
const MARGIN = Math.floor(MARGIN_MM * MM_TO_PX); // ~57px
const HEADER_HEIGHT = 180;
const ITEMS_PER_PAGE = 15; // Fixed number of items per page

// Split items into pages of 10 items each
function paginateItems(items) {
    const pages = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
        pages.push(items.slice(i, Math.min(i + ITEMS_PER_PAGE, items.length)));
    }
    return pages;
}

const PrintHeader = ({ headerData }) => (
    <Box className="print-header">
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Stack spacing={1}>
                    <Box>
                        <img src="../../../assets/logo.png" alt="Logo" style={{ height: 60, marginBottom: 8 }} />
                        <Typography variant="subtitle1" fontWeight={700}>Your Company Name</Typography>
                        <Typography variant="body2">123 Business Street</Typography>
                        <Typography variant="body2">City, Country</Typography>
                        <Typography variant="body2">Phone: +1234567890</Typography>
                    </Box>
                </Stack>
            </Grid>
            <Grid item xs={6}>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h5" color="primary" fontWeight={700} gutterBottom>QUOTATION</Typography>
                    <Typography variant="body2">Quotation #: {headerData.QuotNo}</Typography>
                    <Typography variant="body2">Date: {new Date(headerData.QuotDate).toLocaleDateString()}</Typography>
                    <Typography variant="body2">
                        Valid Until: {new Date(headerData.ValidityDate).toLocaleDateString()}
                    </Typography>
                    {headerData.LPONo && <Typography variant="body2">LPO: {headerData.LPONo}</Typography>}
                    {headerData.RefNo && <Typography variant="body2">Reference: {headerData.RefNo}</Typography>}
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ 
                    background: '#f0f7ff', 
                    p: 1.5, 
                    borderRadius: 1, 
                    mt: 1,
                    textAlign: 'right',
                    border: '1px solid #e3f2fd'
                }}>
                    <Typography variant="subtitle2" fontWeight={700}>Bill To:</Typography>
                    <Typography variant="body2">{headerData.Customer}</Typography>
                    <Typography variant="body2">{headerData.Address}</Typography>
                    <Typography variant="body2">TRN: {headerData.TRN}</Typography>
                    <Typography variant="body2">Phone: {headerData.ContactNo}</Typography>
                    <Typography variant="body2">Email: {headerData.Email}</Typography>
                </Box>
            </Grid>
        </Grid>
    </Box>
);

export default function QuotationPrint({ headerData, items }) {
    // Split items into pages
    const pages = paginateItems(items);

    return (
        <Box className="print-container">
            {pages.map((pageItems, pageIndex) => (
                <Box key={pageIndex} className="print-page">
                    <PrintHeader headerData={headerData} />
                    
                    <Box className="content-section">
                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="50px">No.</TableCell>
                                        <TableCell width="10%">Code</TableCell>
                                        <TableCell width="40%">Description</TableCell>
                                        <TableCell width="50px" align="right">Qty</TableCell>
                                        <TableCell width="10%">Unit</TableCell>
                                        <TableCell width="12.5%" align="right">Price</TableCell>
                                        <TableCell width="12.5%" align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pageItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{idx + 1 + (pageIndex * ITEMS_PER_PAGE)}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.desc}</TableCell>
                                            <TableCell align="right">{item.qty}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                                            <TableCell align="right">{(item.qty * item.price).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {pageIndex === pages.length - 1 && (
                            <>
                                <Box className="summary-section">
                                    <Box sx={{ 
                                        width: 250, 
                                        ml: 'auto', 
                                        mt: 2,
                                        p: 2,
                                        backgroundColor: '#f0f7ff',
                                        borderRadius: 1,
                                        border: '1px solid #e3f2fd'
                                    }}>
                                        <Stack spacing={1}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Gross Amount:</Typography>
                                                <Typography variant="body2">{headerData.GrossAmount.toFixed(2)}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Discount:</Typography>
                                                <Typography variant="body2">{headerData.Discount.toFixed(2)}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Tax ({headerData.Tax}%):</Typography>
                                                <Typography variant="body2">{headerData.TaxAmount.toFixed(2)}</Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="subtitle2" fontWeight={700}>Net Amount:</Typography>
                                                <Typography variant="subtitle2" fontWeight={700}>{headerData.NetAmount.toFixed(2)}</Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Box>

                                {headerData.Remarks && (
                                    <Box className="remarks-section" sx={{ 
                                        mt: 3, 
                                        p: 1.5, 
                                        backgroundColor: '#fff8e1', 
                                        borderRadius: 1,
                                        border: '1px solid #ffecb3'
                                    }}>
                                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>Remarks:</Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {headerData.Remarks}
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </Box>
                    
                    {/* Page Number Footer */}
                    <Box className="page-footer" sx={{ 
                        position: 'absolute', 
                        bottom: 10, 
                        left: 0, 
                        right: 0, 
                        textAlign: 'center',
                        borderTop: '1px solid #e3f2fd',
                        paddingTop: 5,
                        marginTop: 20
                    }}>
                        <Typography variant="caption" color="text.secondary">
                            Page {pageIndex + 1} of {pages.length}
                        </Typography>
                    </Box>
                </Box>
            ))}

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }

                    html, body {
                        width: 210mm;
                        height: auto !important;
                        margin: 0;
                        padding: 0;
                        overflow: visible !important;
                        position: static !important;
                    }

                    .print-container {
                        width: 210mm !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }

                    .print-page {
                        width: 210mm;
                        height: auto !important;
                        padding: 20px;
                        margin: 0 auto;
                        position: relative;
                        background: white;
                        box-shadow: none;
                        break-after: avoid !important;
                        page-break-after: avoid !important;
                        overflow: visible !important;
                        min-height: 297mm;
                    }

                    /* Essential fix for Chrome (breaks trailing blank page) */
                    .print-page:last-child {
                        page-break-after: avoid !important; 
                        break-after: avoid !important;
                        height: auto !important;
                        position: relative !important;
                    }

                    .print-page:last-child::after {
                        content: "";
                        display: block;
                        height: 0;
                        clear: both;
                    }

                    .print-header {
                        position: relative;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        border-bottom: 1px solid #e3f2fd;
                        background-color: #fafafa;
                        padding: 20px;
                        border-radius: 4px;
                    }

                    .content-section {
                        position: relative;
                        padding-top: 10px;
                        margin-bottom: 40px; /* Add space for footer */
                    }

                    .page-footer {
                        position: absolute;
                        bottom: 10px;
                        left: 0;
                        right: 0;
                        text-align: center;
                        border-top: 1px solid #e3f2fd;
                        padding-top: 5px;
                    }

                    .summary-section {
                        margin-top: 20px;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        background-color: #f0f7ff !important;
                        border: 1px solid #e3f2fd !important;
                        border-radius: 4px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .remarks-section {
                        margin-top: 20px;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        background-color: #fff8e1 !important;
                        border: 1px solid #ffecb3 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                        margin-bottom: 0;
                        background-color: white;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tr {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    tr:nth-child(even) {
                        background-color: #fafafa !important;
                    }

                    th {
                        background-color: #e3f2fd !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-weight: 600;
                        padding: 5px;
                        border: 1px solid #bbdefb;
                        font-size: 11px;
                        color: #1976d2;
                    }

                    td {
                        padding: 5px;
                        border: 1px solid #e3f2fd;
                        font-size: 10px;
                        vertical-align: top;
                    }

                    img {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Critical fix for Chrome */
                    @media print and (-webkit-min-device-pixel-ratio:0) {
                        html, body {
                            width: 100% !important;
                            height: auto !important;
                            overflow: visible !important;
                            position: static !important;
                        }
                        
                        .print-container {
                            width: 100% !important;
                            height: auto !important;
                            break-after: avoid !important;
                            page-break-after: avoid !important;
                            overflow: visible !important;
                        }
                        
                        .print-page {
                            break-after: avoid !important;
                            page-break-after: avoid !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }
                        
                        .print-page:last-child {
                            page-break-after: auto !important;
                        }
                        
                        body::after {
                            content: "";
                            display: block;
                            height: 0;
                            page-break-after: avoid;
                            margin-bottom: -100px;
                        }
                    }

                    /* Enhanced fix for Safari */
                    @media not all and (min-resolution:.001dpcm) {
                        @supports (-webkit-appearance:none) {
                            body {
                                height: auto !important;
                            }
                            .print-page:last-child {
                                margin-bottom: -1px !important;
                                border-bottom: none !important;
                            }
                            
                            /* Force minimum height for single items */
                            .print-container {
                                min-height: 0 !important;
                                height: auto !important;
                            }
                        }
                    }

                    /* Fix for Firefox */
                    @-moz-document url-prefix() {
                        body {
                            size: auto;
                            margin: 0mm;
                        }
                        
                        /* Specific Fix for Firefox blank page */
                        html, body {
                            height: auto !important;
                        }
                        
                        .print-container, .print-page {
                            height: auto !important;
                            position: static !important;
                        }
                        
                        .print-page:last-child {
                            page-break-after: avoid !important;
                            break-after: avoid !important;
                        }
                    }
                }

                /* Preview styling (non-print) */
                .print-container {
                    background: white;
                    min-height: auto;
                    width: 210mm;
                    margin: 20px auto;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }

                .print-page {
                    padding: 20px;
                    background: white;
                    position: relative;
                    min-height: 297mm;
                }
            `}</style>
        </Box>
    );
}