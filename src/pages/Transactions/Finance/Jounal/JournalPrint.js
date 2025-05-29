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
                                    <TableCell>Type</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {journal.map((entry, index) => (
                                    <TableRow key={index} className='itemrow'>
                                        <TableCell>{entry.srno}</TableCell>
                                        <TableCell>{getAccountName(entry.account)}</TableCell>
                                        <TableCell>{entry.narration}</TableCell>
                                        <TableCell>
                                            <Typography
                                                sx={{
                                                    color: entry.type === 'Debit' ? 'error.main' : 'success.main',
                                                    fontWeight: 500,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                {entry.type}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            {Number(entry.amount).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })}
                                        </TableCell>
                                    </TableRow>
                                ))}

                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Totals Section */}
                    <Box sx={{
                        mt: 2,
                        p: 2,
                        // backgroundColor: 'rgb(226, 226, 226)', 
                        borderTop: '1px solid rgb(211, 211, 211)',
                        borderBottom: '1px solid rgb(211, 211, 211)',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                    }}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{
                                    color: 'rgb(139, 0, 0)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    Debit:
                                </Typography>
                                <Typography sx={{
                                    color: 'rgb(139, 0, 0)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    {totalDebit.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography sx={{
                                    color: 'rgb(0, 100, 0)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    Credit:
                                </Typography>
                                <Typography sx={{
                                    color: 'rgb(0, 100, 0)',
                                    fontWeight: 600,
                                    fontSize: '0.875rem'
                                }}>
                                    {totalCredit.toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </Typography>
                            </Box>
                            {(() => {
                                const difference = totalDebit - totalCredit;
                                if (difference !== 0) {
                                    return (
                                        <Box sx={{
                                            // ml: 1, 
                                            pl: 2,
                                            borderLeft: '1px solid rgb(211, 211, 211)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1
                                        }}>
                                            <Typography sx={{
                                                color: 'text.secondary',
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}>
                                                Difference:
                                            </Typography>
                                            <Typography sx={{
                                                color: difference > 0 ? 'rgb(139, 0, 0)' : 'rgb(0, 100, 0)',
                                                fontWeight: 600,
                                                fontSize: '0.875rem'
                                            }}>
                                                {Math.abs(difference).toLocaleString('en-US', {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                })}
                                                {' '}
                                                ({difference > 0 ? 'Debit' : 'Credit'})
                                            </Typography>
                                        </Box>
                                    );
                                }
                                return null;
                            })()}
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
                        Computer generated document, hence sign not required.
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