import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    useTheme,
} from '@mui/material';

export default function JournalTable({ journal, accounts }) {
    const theme = useTheme(); 
    const getAccountName = (accountCode) => {
        const account = accounts?.find(acc => acc.AC_CODE === accountCode);
        return account ? ` ${account.AC_DESC}` : accountCode;
    };

    const getTypeColor = (type) => {
        return type === 'Debit' ? theme.palette.error.main : theme.palette.success.main;
    };

    return (
        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: `1px solid ${theme.palette.divider}` }}>
            <Table size="small" sx={{
                '& .MuiTableCell-root': {
                    py: 1,
                    px: 2,
                    fontSize: '0.875rem'
                },
                '& .MuiTableHead-root': {
                    padding: 0
                }
            }}>
                <TableHead>
                    <TableRow sx={{ 
                        bgcolor: theme.palette.grey[50],
                        '& th': {
                            fontWeight: 600,
                            borderBottom: `1px solid ${theme.palette.divider}`,
                            color: theme.palette.text.primary,
                            fontSize: '0.875rem'
                        }
                    }}>
                        <TableCell>Sr. No</TableCell>
                        <TableCell>Account</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {journal.map((entry, index) => (
                        <TableRow 
                            key={index}
                            sx={{
                                '&:hover': {
                                    backgroundColor: theme.palette.action.hover
                                },
                                '&:last-child td': {
                                    borderBottom: 0
                                }
                            }}
                        >
                            <TableCell>{entry.srno}</TableCell>
                            <TableCell>{getAccountName(entry.account)}</TableCell>
                            <TableCell>
                                <Typography 
                                    sx={{ 
                                        color: getTypeColor(entry.type),
                                        fontWeight: 500,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {entry.type}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">
                                {entry.amount.toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                            </TableCell>
                        </TableRow>
                    ))}
                    {journal.length === 0 && (
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
    );
} 