import React from 'react';
import { Box, Grid, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Divider } from '@mui/material';
import useAuth from '../../../../hooks/useAuth';
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

const PrintHeader = ({ headerData, companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN }) => (
    <Box className="print-header">
        <Grid container spacing={2}>
            <Grid item xs={6}>
                <Stack spacing={1}>
                    <Box  >
                        <img src={companyLogoUrl} alt="Logo" style={{ height: 40, marginBottom: 8, marginLeft: -5 }} />
                        <Typography variant="body2" fontWeight={700} >{companyName}</Typography>
                        <Typography variant="body2"   fontWeight={300} width={180} fontSize={12} py={0.15} >{companyAddress}</Typography>
                        <Typography variant="body2"   fontWeight={300} fontSize={12} py={0.15}  >TRN:{companyTRN}</Typography>
                        <Typography variant="body2"   fontWeight={300} fontSize={12} py={0.15}  >{companyPhone}</Typography>
                        <Typography variant="body2"   fontWeight={300} fontSize={12} py={0.15}  >{companyEmail}</Typography>
                    </Box>
                </Stack>
            </Grid>
            <Grid item xs={6}>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h3" color='black' fontWeight={400} gutterBottom>TAX INVOICE</Typography>
                    <Typography variant="body1" fontWeight={600}  > #{headerData.InvNo}</Typography>
                </Box>
            </Grid>

            <Grid item xs={6}>
                <Box sx={{                     
                    // p: 1.5,
                    borderRadius: 1,
                    mb: 1,
                    textAlign: 'left', 
                }}>
                    <Typography variant="body2" fontWeight={700} py={0.15}>Bill To:</Typography>
                    <Typography variant="body2"  fontWeight={300} fontSize={12} py={0.15} >{headerData.Customer}</Typography>
                    {headerData.Address && <Typography variant="body2"   fontWeight={300} fontSize={12} py={0.15} >{headerData.Address}</Typography>}
                    {headerData.TRN && <Typography variant="body2"   fontWeight={300} fontSize={12} py={0.15}  >TRN: {headerData.TRN}</Typography>}
                    {headerData.ContactNo && <Typography variant="body2"  fontWeight={300} fontSize={12} py={0.15} >Phone: {headerData.ContactNo}</Typography>}
                    {headerData.Email && <Typography variant="body2"  fontWeight={300} fontSize={12} py={0.15} >Email: {headerData.Email}</Typography>}
                </Box>
            </Grid>
            <Grid item xs={6}>
                <Box sx={{ textAlign: 'right' }}>
                   
                    <Table size="small" sx={{ width: 'auto', ml: 'auto' }}>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ border: 'none', py: 0.15 }}>Date:</TableCell>
                                <TableCell sx={{ border: 'none', py: 0.15 }}>{headerData.InvDate.toLocaleString()}</TableCell>
                            </TableRow>
                            {headerData.PaymentMode && (
                                <TableRow>
                                    <TableCell sx={{ border: 'none', py: 0.15 }}>Payment Mode:</TableCell>
                                    <TableCell sx={{ border: 'none', py: 0.15 }}>{headerData.PaymentMode}</TableCell>
                                </TableRow>
                            )}
                            <TableRow>
                                <TableCell sx={{ border: 'none', py: 0.15 }}>Due Date:</TableCell>
                                <TableCell sx={{ border: 'none', py: 0.15 }}>
                                    {addDays(headerData.InvDate, headerData.CrDays).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                            {headerData.LPONo && (
                                <TableRow>
                                    <TableCell sx={{ border: 'none', py: 0.15 }}>LPO:</TableCell>
                                    <TableCell sx={{ border: 'none', py: 0.15 }}>{headerData.LPONo}</TableCell>
                                </TableRow>
                            )}
                            {headerData.RefNo && (
                                <TableRow>
                                    <TableCell sx={{ border: 'none', py: 0.15 }}>Reference:</TableCell>
                                    <TableCell sx={{ border: 'none', py: 0.15 }}>{headerData.RefNo}</TableCell>
                                </TableRow>
                            )}
                          
                            {headerData.SalesmanName && (
                                <TableRow>
                                    <TableCell sx={{ border: 'none', py: 0.15 }}>Sales Person:</TableCell>
                                    <TableCell sx={{ border: 'none', py: 0.15 }}>{headerData.SalesmanName}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Grid>

        </Grid>
    </Box>
);

export default function InvoicePrint({ headerData, items }) {

    const { companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN } = useAuth();
    // Split items into pages of 10 items each
    const pages = paginateItems(items);

    return (
        <Box className="print-container">
            {pages.map((pageItems, pageIndex) => (
                <Box key={pageIndex} className="print-page">
                    <PrintHeader headerData={headerData}
                        companyName={companyName}
                        companyAddress={companyAddress} companyPhone={companyPhone} companyEmail={companyEmail} companyLogoUrl={companyLogoUrl}
                        companyTRN={companyTRN} />

                    <Box className="content-section" sx={{
                        marginTop: 2
                    }}>
                        <TableContainer component={Paper} elevation={0}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell width="50px">No.</TableCell>
                                        <TableCell width="10%">Code</TableCell>
                                        <TableCell width="35%">Description</TableCell>
                                        <TableCell width="50px" align="right">Qty</TableCell>
                                        <TableCell width="8%">Unit</TableCell>
                                        <TableCell width="13%" align="right">Price</TableCell>
                                        <TableCell width="12%" align="right">Tax({headerData.Tax}%)</TableCell>
                                        <TableCell width="13%" align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pageItems.map((item, idx) => {
                                        const discountPercent = 1 - (headerData.Discount / headerData.GrossAmount);
                                        const subtotal = item.qty * item.price;
                                        const taxAmount = (subtotal * discountPercent * (headerData.Tax || 0)) / 100;
                                        const total = (subtotal * discountPercent) + taxAmount;

                                        return (
                                            <TableRow key={idx} className='itemrow' sx={{
                                                borderBottom: '1px solid rgb(226, 226, 226)'
                                            }}>
                                                <TableCell>{idx + 1 + (pageIndex * ITEMS_PER_PAGE)}</TableCell>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell>{item.desc}</TableCell>
                                                <TableCell align="right">{item.qty}</TableCell>
                                                <TableCell>{item.unit}</TableCell>
                                                <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                                                <TableCell align="right">{taxAmount.toFixed(2)}</TableCell>
                                                <TableCell align="right">{total.toFixed(2)}</TableCell>
                                            </TableRow>
                                        );
                                    })}

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
                                        borderRadius: 1,
                                        borderBottom: '1px solid rgb(224, 224, 224)'
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
                                        backgroundColor: 'rgb(255, 255, 255)',
                                        borderRadius: 1,
                                        border: '1px solid rgb(211, 211, 211)'
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
                        borderTop: '1px solid rgb(224, 224, 224)',
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
                        padding: 0px;
                        margin-bottom: 10px;  
                        border-radius: 4px;
                    }

                    .content-section {
                        position: relative;
                        padding-top: 10px;
                        margin-bottom: 20px; /* Add space for footer */
                    }

                    .page-footer {
                        position: absolute;
                        bottom: 10px;
                        left: 0;
                        right: 0;
                        text-align: center;
                        border-top: 1px solid rgb(206, 206, 206);
                        padding-top: 5px;
                    }

                    .summary-section {
                        margin-top: 20px;
                        break-inside: avoid;
                        page-break-inside: avoid; 
                        border-radius: 4px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .remarks-section {
                        margin-top: 20px;
                        break-inside: avoid;
                        page-break-inside: avoid; 
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
.itemrow{
    border-bottom: 1px solid rgb(0, 0, 0);
}
                    tr:nth-child(even) {
                        background-color:rgb(255, 255, 255) !important;
                    }

                    th {
                        background-color:rgb(226, 226, 226) !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-weight: 600;
                        padding: 5px;
                        border: 1px solidrgb(0, 0, 0);
                        font-size: 11px;
                        color:rgb(0, 0, 0);
                    }

                    td {
                        padding: 5px;
                         border: 1px solidrgb(0, 0, 0);
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