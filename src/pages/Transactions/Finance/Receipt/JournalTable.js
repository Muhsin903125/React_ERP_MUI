import React, { useState } from 'react';
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
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Autocomplete,
    Box,
    FormControl,
} from '@mui/material';
import Iconify from '../../../../components/iconify';

export default function JournalTable({ journal, accounts, onJournalChange, isEditable }) {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [newEntry, setNewEntry] = useState(() => {
        const total = journal.reduce((sum, entry) => sum + (entry.type === 'Credit' ? -entry.amount : entry.amount), 0);
        return {
            account: '',
            type: total >= 0 ? 'Credit' : 'Debit',
            amount: Math.abs(total)
        };
    });

    const getAccountName = (accountCode) => {
        const account = accounts?.find(acc => acc.AC_CODE === accountCode);
        return account ? ` ${account.AC_DESC}` : accountCode;
    };

    const getTypeColor = (type) => {
        return type === 'Debit' ? theme.palette.error.main : theme.palette.success.main;
    };

    const handleAddEntry = () => {
        if (!newEntry.account || !newEntry.amount) return;

        const parsedAmount = Number(newEntry.amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) return;

        const updatedJournal = [...journal, {
            srno: journal.length + 1,
            account: newEntry.account,
            type: newEntry.type,
            amount: parsedAmount,
            isManual: 1 // Mark as manually added entry
        }];

        // Calculate total amount and determine default type
        const totalAmount = updatedJournal.reduce((sum, entry) => {
            const amt = Number(entry.amount) || 0;
            return sum + (entry.type === 'Credit' ? -amt : amt);
        }, 0);

        onJournalChange(updatedJournal);
        setNewEntry({
            account: '',
            type: totalAmount >= 0 ? 'Credit' : 'Debit',
            amount: Math.abs(totalAmount)
        });
        setOpen(false);
    };

    const handleDeleteEntry = (index) => {
        const updatedJournal = journal.filter((_, i) => i !== index).map((entry, i) => ({
            ...entry,
            srno: i + 1
        }));
        onJournalChange(updatedJournal);
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    onClick={() => setOpen(true)}
                    size="small"
                    disabled={!isEditable}
                >
                    Add new entry
                </Button>
            </Box>
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
                            <TableCell align="center">Actions</TableCell>
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
                                    {Number(entry.amount).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </TableCell>
                                <TableCell align="center">
                                    {entry.isManual === 1 && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDeleteEntry(index)}
                                        >
                                            <Iconify icon="eva:trash-2-outline" />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                        {journal.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        No journal entries found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Journal Entry</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <Autocomplete
                                size="small"
                                options={accounts || []}
                                getOptionLabel={(option) =>
                                    option ? `${option.AC_DESC} (${option.AC_CODE})` : ''
                                }
                                value={accounts?.find(p => p.AC_CODE === newEntry.account) || null}
                                onChange={(_, newValue) => {
                                    setNewEntry(prev => ({
                                        ...prev,
                                        account: newValue?.AC_CODE || ''
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Account"
                                        required
                                    />
                                )}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <Autocomplete
                                size="small"
                                options={[
                                    { value: 'Debit', label: 'Debit' },
                                    { value: 'Credit', label: 'Credit' }
                                ]}
                                getOptionLabel={(option) => option.label || ''}
                                value={{ value: newEntry.type, label: newEntry.type }}
                                onChange={(_, newValue) => {
                                    setNewEntry(prev => ({
                                        ...prev,
                                        type: newValue ? newValue.value : 'Debit'
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Type"
                                        required
                                    />
                                )}
                            />
                        </FormControl>
                        <TextField
                            size="small"
                            label="Amount"
                            type="number"
                            value={newEntry.amount}
                            onChange={(e) => setNewEntry(prev => ({
                                ...prev,
                                amount: e.target.value
                            }))}
                            required
                            fullWidth
                            inputProps={{ min: 0, step: 'any' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddEntry}
                        disabled={!newEntry.account || !newEntry.amount}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}