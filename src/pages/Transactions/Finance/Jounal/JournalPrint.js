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
} from '@mui/material';
import { format } from 'date-fns';
import useAuth from '../../../../hooks/useAuth';

export default function JournalPrint({ headerData, journal, accounts }) {
    const { companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN } = useAuth();

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
                        <Typography variant="h3" color='black' fontWeight={400} gutterBottom>JOURNAL VOUCHER</Typography>
                        <Typography variant="body1" fontWeight={600}>#{headerData.JvNo}</Typography>
                        <Typography variant="body1" fontWeight={600}>Date: {formatDate(headerData.JvDate)}</Typography>
                        {headerData.RefNo && (
                            <Typography variant="body1" fontWeight={600}> Ref. No: {headerData.RefNo}</Typography>
                        )}
                        {headerData.RefDate && (
                            <Typography variant="body1" fontWeight={600}> Ref. Date: {formatDate(headerData.RefDate)}</Typography>
                        )}
                    </Box>
                </Grid>
            </Grid>
 

            {/* Journal Entries */}
            <Box sx={{ mb: 4 }}> 
                <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                                <TableCell>Sr. No</TableCell>
                                <TableCell>Account</TableCell>
                                <TableCell>Narration</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell align="right">Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {journal && journal.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell>{entry.srno}</TableCell>
                                    <TableCell>{getAccountName(entry.account)}</TableCell>
                                    <TableCell>{entry.narration}</TableCell>
                                    <TableCell>
                                        <Typography
                                            sx={{
                                                color: entry.type === 'Debit' ? 'error.main' : 'success.main',
                                                fontWeight: 500
                                            }}
                                        >
                                            {entry.type}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {formatAmount(entry.amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {journal && journal.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No journal entries found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

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

                    
        </Box>
    );
} 