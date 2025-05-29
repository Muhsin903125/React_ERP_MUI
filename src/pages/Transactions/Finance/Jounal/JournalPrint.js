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

const formatDate = (date) => {
    return date ? format(new Date(date), 'dd/MM/yyyy') : '';
};
const PrintHeader = ({ headerData, companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN }) => (
    <Box className="print-header">
        <Grid container spacing={2}>
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
            </Grid></Grid>


    </Box>
);

export default function JournalPrint({ headerData, journal, accounts }) {
    const { companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN } = useAuth();

    const getAccountName = (accountCode) => {
        const account = accounts?.find(acc => acc.AC_CODE === accountCode);
        return account ? `${account.AC_DESC} (${account.AC_CODE})` : accountCode;
    };

    const totalDebit = journal
        .filter(entry => entry.type === 'Debit')
        .reduce((sum, entry) => sum + Number(entry.amount), 0);

    const totalCredit = journal
        .filter(entry => entry.type === 'Credit')
        .reduce((sum, entry) => sum + Number(entry.amount), 0);

    return (
        <Box className="print-container">
            <Box className="print-page">
                <PrintHeader
                    headerData={headerData}
                    companyName={companyName}
                    companyAddress={companyAddress}
                    companyPhone={companyPhone}
                    companyEmail={companyEmail}
                    companyLogoUrl={companyLogoUrl}
                    companyTRN={companyTRN}
                />

                <Box className="content-section" sx={{ marginTop: 2 }}>
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell width="50px">No.</TableCell>
                                    <TableCell>Account</TableCell>
                                    <TableCell>Narration</TableCell>
                                    <TableCell align="right">Debit</TableCell>
                                    <TableCell align="right">Credit</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {journal.map((entry, index) => (
                                    <TableRow key={index} className='itemrow'>
                                        <TableCell>{entry.srno}</TableCell>
                                        <TableCell>{getAccountName(entry.account)}</TableCell>
                                        <TableCell>{entry.narration}</TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                sx={{
                                                    
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {entry.type === 'Debit' ?
                                                    Number(entry.amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }) : null}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography
                                                sx={{
                                                    
                                                    fontWeight: 500,
                                                    fontSize: '0.95rem'
                                                }}
                                            >
                                                {entry.type === 'Credit' ?
                                                    Number(entry.amount).toLocaleString('en-US', {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2
                                                    }) : null}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                <TableRow   className='itemrow'>

                                    <TableCell colSpan={4} align="right">
                                        <Typography
                                            sx={{ 
                                                fontWeight: 800,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {totalDebit.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography
                                            sx={{ 
                                                fontWeight: 800,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {totalCredit.toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </Typography>
                                    </TableCell>
                                </TableRow>


                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Totals Section */}
                

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
                </Box>

                {/* Footer */}
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
                        mt: 3,
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
        </Box>
    );
}