import React from 'react';
import { Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow, Box, Divider, Paper, TableContainer, Stack } from '@mui/material';

// Constants for A4 printing
const ITEMS_PER_PAGE = 15;

// Split items into pages
function paginateItems(items) {
    const pages = [];
    for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
        pages.push(items.slice(i, Math.min(i + ITEMS_PER_PAGE, items.length)));
    }
    return pages;
}

const CreditNoteHeader = ({ headerData }) => (
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
                    <Typography variant="h5" color="error" fontWeight={700} gutterBottom>CREDIT NOTE</Typography>
                    <Typography variant="body2">Credit Note #: {headerData.CNNo}</Typography>
                    <Typography variant="body2">Date: {new Date(headerData.CNDate).toLocaleDateString()}</Typography>
                    <Typography variant="body2">Original Invoice: {headerData.InvoiceNo}</Typography>
                    <Typography variant="body2">Return Reason: {headerData.ReturnReason}</Typography>
                    <Typography variant="body2">Status: {headerData.Status}</Typography>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Box sx={{ 
                    background: '#fff8e8', 
                    p: 1.5, 
                    borderRadius: 1, 
                    mt: 1,
                    border: '1px solid #ffe0b2'
                }}>
                    <Typography variant="subtitle2" fontWeight={700}>Customer:</Typography>
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

export default function CreditNotePrint({ headerData, items }) {
    const pages = paginateItems(items);
    
    const calculateSubTotal = () => {
        return items.reduce((total, item) => total + (item.qty * item.price), 0);
    };

    const calculateTaxAmount = () => {
        return ((calculateSubTotal() - headerData.Discount) * headerData.Tax) / 100;
    };

    const calculateNetAmount = () => {
        return (calculateSubTotal() - headerData.Discount) + calculateTaxAmount();
    };

    const handleDirectPrint = () => {
        window.print();
    };

    return (
        <Box className="print-container">
            {pages.map((pageItems, pageIndex) => (
                <Box key={pageIndex} className="print-page">
                    <CreditNoteHeader headerData={headerData} />
                    
                    <Box className="content-section">
                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="50px">No.</TableCell>
                                        <TableCell width="10%">Item</TableCell>
                                        <TableCell width="40%">Description</TableCell>
                                        <TableCell width="10%">Unit</TableCell>
                                        <TableCell width="50px" align="right">Qty</TableCell>
                                        <TableCell width="12.5%" align="right">Price</TableCell>
                                        <TableCell width="12.5%" align="right">Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pageItems.map((item, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{idx + 1 + (pageIndex * ITEMS_PER_PAGE)}</TableCell>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.desc}</TableCell>
                                            <TableCell>{item.unit}</TableCell>
                                            <TableCell align="right">{item.qty}</TableCell>
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
                                        backgroundColor: '#fff8e8',
                                        borderRadius: 1,
                                        border: '1px solid #ffe0b2'
                                    }}>
                                        <Stack spacing={1}>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Gross Amount:</Typography>
                                                <Typography variant="body2">{calculateSubTotal().toFixed(2)}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Discount:</Typography>
                                                <Typography variant="body2">{headerData.Discount.toFixed(2)}</Typography>
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="body2">Tax ({headerData.Tax}%):</Typography>
                                                <Typography variant="body2">{calculateTaxAmount().toFixed(2)}</Typography>
                                            </Stack>
                                            <Divider />
                                            <Stack direction="row" justifyContent="space-between">
                                                <Typography variant="subtitle2" fontWeight={700}>Net Amount:</Typography>
                                                <Typography variant="subtitle2" fontWeight={700}>{calculateNetAmount().toFixed(2)}</Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Box>

                                {headerData.Remarks && (
                                    <Box className="remarks-section" sx={{ 
                                        mt: 3, 
                                        p: 1.5, 
                                        backgroundColor: '#f5f5f5', 
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0'
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
                    
                    <Box className="page-footer">
                        <Typography variant="body2" align="center" color="textSecondary">
                            Page {pageIndex + 1} of {pages.length}
                        </Typography>
                    </Box>
                </Box>
            ))}

            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .print-container {
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    .print-page {
                        width: 100%;
                        height: auto !important;
                        min-height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        page-break-after: always;
                        position: relative;
                        background: white;
                        box-shadow: none;
                    }

                    .print-page:last-child {
                        page-break-after: avoid;
                    }

                    .print-header {
                        position: relative;
                        padding-bottom: 10px;
                        margin-bottom: 10px;
                        border-bottom: 1px solid #ffe0b2;
                        background-color: #fafafa;
                        padding: 10px;
                        border-radius: 4px;
                    }

                    .content-section {
                        position: relative;
                        padding-top: 5px;
                        margin-bottom: 30px; /* Make room for footer */
                    }

                    .page-footer {
                        position: relative;
                        margin-top: 10px;
                        text-align: center;
                        padding: 5px;
                        font-size: 9px;
                    }

                    .summary-section {
                        margin-top: 10px;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        background-color: #fff8e8 !important;
                        border: 1px solid #ffe0b2 !important;
                        border-radius: 4px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .remarks-section {
                        margin-top: 10px;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        background-color: #f5f5f5 !important;
                        border: 1px solid #e0e0e0 !important;
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
                        background-color: #ffecb3 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-weight: 600;
                        padding: 5px;
                        border: 1px solid #ffe0b2;
                        font-size: 11px;
                        color: #e65100;
                    }

                    td {
                        padding: 5px;
                        border: 1px solid #ffe0b2;
                        font-size: 10px;
                        vertical-align: top;
                    }

                    img {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    /* Fix for Chrome margin issues */
                    html, body, div, span, applet, object, iframe, p, blockquote,
                    a, abbr, acronym, address, big, cite, code, del, dfn, em, font,
                    img, ins, kbd, q, s, samp, small, strike, strong, sub, sup,
                    tt, var, dl, dt, dd, ol, ul, li, fieldset, form, label, legend,
                    table, caption, tbody, tfoot, thead, tr, th, td {
                        page-break-inside: avoid;
                    }
                }

                /* Preview styling (non-print) */
                .print-container {
                    background: white;
                    width: 210mm;
                    margin: 20px auto;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }

                .print-page {
                    padding: 20px;
                    background: white;
                    position: relative;
                    height: auto;
                    margin-bottom: 20px;
                }
                
                .page-footer {
                    position: relative;
                    margin-top: 10px;
                    text-align: center;
                    padding: 5px;
                }
            `}</style>
        </Box>
    );
} 