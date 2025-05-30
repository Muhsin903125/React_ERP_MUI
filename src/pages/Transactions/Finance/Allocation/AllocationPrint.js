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
    Grid,
    Divider,
    Stack,
    useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import useAuth from '../../../../hooks/useAuth';

export default function AllocationPrint({ headerData,  accounts, detailData }) {
    const { companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN } = useAuth();
const theme = useTheme();
     const getAccountName = (accountCode) => {
        const account = accounts?.find(acc => acc.AC_CODE === accountCode);
        return account ? `${account.AC_DESC} (${account.AC_CODE})` : accountCode;
    };

    const formatDate = (date) => {
        return date ? format(new Date(date), 'dd/MM/yyyy') : '';
    };

    const formatAmount = (amount) => {
        return amount ? amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) : '';
    };

    return (
        <Box sx={{ p: 3, maxWidth: '210mm', margin: '0 auto' }}>
            {/* Company Header */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                    <Stack spacing={1}>
                        <Box>
                            <img src={companyLogoUrl} alt="Logo" style={{ height: 40, marginBottom: 8, marginLeft: -5 }} />
                            <Typography variant="body2" fontWeight={700}>{companyName}</Typography>
                            <Typography variant="body2" fontWeight={300} fontSize={12} py={0.15}>{companyAddress}</Typography>
                            <Typography variant="body2" fontWeight={300} fontSize={12} py={0.15}>TRN: {companyTRN}</Typography>
                            <Typography variant="body2" fontWeight={300} fontSize={12} py={0.15}>{companyPhone}</Typography>
                            <Typography variant="body2" fontWeight={300} fontSize={12} py={0.15}>{companyEmail}</Typography>
                        </Box>
                    </Stack>
                </Grid>
                <Grid item xs={6}>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h3" color='black' fontWeight={400} gutterBottom>ALLOCATION</Typography>
                        <Typography variant="body1" fontWeight={600}>#{headerData.AllocNo}</Typography>
                    </Box>
                </Grid>
            </Grid>

            {/* Allocation Details */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6}>
                   
                    {/* <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Document 
                        </Typography>
                        <Typography variant="body1">
                            {getAccountName(headerData.DocumentNo)}
                        </Typography>
                    </Box> */}
                   
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Account
                        </Typography>
                        <Typography variant="body1">
                            {getAccountName(headerData.account)}
                        </Typography>
                    </Box>
                    </Grid>
                <Grid item xs={12}>
   <Box sx={{
                        border: `1px solid ${theme.palette.primary.lighter}`,
                        borderRadius: 1,
                        overflow: 'hidden',
                        mb: 2
                    }}>
                        <Grid container sx={{
                            bgcolor: theme.palette.primary.lighter,
                            borderBottom: `1px solid ${theme.palette.primary.lighter}`,
                            py: 1.5
                        }}>
                            <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Code</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Sr No</Typography>
                            </Grid>
                            <Grid item xs={2} md={3}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Date</Typography>
                            </Grid>

                            <Grid item xs={2} md={2} align="right">
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Amount</Typography>
                            </Grid>
                            <Grid item xs={2} md={3} align="right">
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Bal Amount</Typography>
                            </Grid>

                            {/* <Grid item xs={2} md={2}>
                                <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Amount</Typography>
                            </Grid> */}


                        </Grid>

                        <Grid
                            container

                            sx={{
                                borderBottom: `1px solid ${theme.palette.primary.lighter}`,
                                // '&:hover': {
                                //     bgcolor: theme.palette.primary.light
                                // },
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{headerData?.fromDocCode}</Typography>
                            </Grid>
                            <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{headerData?.fromDocSrNo}</Typography>
                            </Grid>
                            <Grid item xs={2} md={3}>
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}> {headerData?.fromDocDate}</Typography>
                            </Grid>
                            <Grid item xs={2} md={2} align="right">
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{headerData?.fromDocAmount?.toFixed(2)}</Typography>
                            </Grid>
                            <Grid item xs={2} md={3} align="right">
                                <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{headerData?.fromDocBalAmount?.toFixed(2)}</Typography>
                            </Grid>
                            {/* <Grid item xs={2} md={2}>
                                <Typography variant="body2" sx={{ fontWeight: 600, px: 2, py: 1.5 }}>{headerData?.Amount?.toFixed(2)}</Typography>
                            </Grid> */}

                        </Grid>

                    </Box>
                </Grid>
                
            </Grid>

            {/* Amount Section */}
            <Box sx={{
                mb: 4,
                p: 2,
                bgcolor: 'primary.light',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'primary.main'
            }}>
                <Grid container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <Typography variant="h6" color="primary.dark">
                            Total Amount
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="h6" color="primary.dark" fontWeight="bold">
                            {formatAmount(headerData.Amount)}
                        </Typography>
                    </Grid>
                </Grid>
            </Box>

            {/* Allocations List */}
            {detailData && detailData.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Allocations
                    </Typography>
                    <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ bgcolor: 'grey.50' }}>
                                    <TableCell>Sr. No</TableCell>
                                    <TableCell>Document</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell align="right">Document Amount</TableCell>
                                    <TableCell align="right">Balance Amount</TableCell>
                                    <TableCell align="right">Allocated Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {detailData && detailData.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{item.srno}</TableCell>
                                        <TableCell>{item.doc_code}</TableCell>
                                        <TableCell>{formatDate(item.doc_date)}</TableCell>
                                        <TableCell align="right">{formatAmount(item.doc_amount)}</TableCell>
                                        <TableCell align="right">{formatAmount(item.doc_bal_amount)}</TableCell>
                                        <TableCell align="right">{formatAmount(item.alloc_amount)}</TableCell>
                                    </TableRow>
                                ))}

                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

           

            {/* Remarks */}
            {headerData.Remarks && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Remarks
                    </Typography>
                    <Typography variant="body1">
                        {headerData.Remarks}
                    </Typography>
                </Box>
            )}

            <Box
                sx={{
                    position: { xs: 'static', print: 'absolute' },
                    bottom: { print: 0 },
                    left: { print: 0 },
                    right: { print: 0 },
                    width: { xs: '100%', print: '100%' },
                    backgroundColor: 'white',
                    zIndex: 10,
                    py: 2,
                    mt: 4,
                    px: 3,
                    boxShadow: { xs: 'none', print: '0 -2px 8px rgba(0,0,0,0.04)' },
                    '@media print': {
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        pageBreakInside: 'avoid',
                        boxShadow: 'none',
                    },
                }}
            >
                <Typography variant="caption" align="center" sx={{ width: '100%', display: 'block', mb: 1, color: 'text.secondary' }}>
                    This is a computer generated document, hence does not require any signature.
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={4}>
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                            <Typography variant="body2" align="center">
                                Prepared By
                            </Typography>
                            <Typography variant="body2" align="center">
                                {headerData?.PreparedByName || ''}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                            <Typography variant="body2" align="center">
                                Checked By
                            </Typography>
                            <Typography variant="body2" align="center">
                                {headerData?.CheckedByName || ''}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                            <Typography variant="body2" align="center">
                                Authorized By
                            </Typography>
                            <Typography variant="body2" align="center">
                                {headerData?.AuthorizerName || ''}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
} 