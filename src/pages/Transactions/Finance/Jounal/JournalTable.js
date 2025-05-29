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
    TextField,
    Autocomplete,
    Box,
    FormControl,
} from '@mui/material';
import Iconify from '../../../../components/iconify';

export default function JournalTable({ journal, accounts, onJournalChange, isEditable, id = null }) {
    const theme = useTheme();
    const [editingIndex, setEditingIndex] = useState(null);
    const [newEntry, setNewEntry] = useState(() => {
        const total = journal.reduce((sum, entry) => sum + (entry.type === 'Credit' ? -entry.amount : entry.amount), 0);
        return {
            account: '',
            type: total >= 0 ? 'Credit' : 'Debit',
            amount: Math.abs(total),
            narration: ''
        };
    });

    const getAccountName = (accountCode) => {
        const account = accounts?.find(acc => acc.AC_CODE === accountCode);
        return account ? ` ${account.AC_DESC}` : accountCode;
    };

    const getTypeColor = (type) => {
        return type === 'Debit' ? theme.palette.error.main : theme.palette.success.main;
    };

    const calculateBalance = () => {
        return journal.reduce((sum, entry) => sum + (entry.type === 'Credit' ? -entry.amount : entry.amount), 0);
    };

    const handleAddEntry = () => {
        if (!newEntry.account || !newEntry.amount) return;
        const parsedAmount = Number(newEntry.amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

        const updatedJournal = [...journal, {
            srno: journal.length + 1,
            account: newEntry.account,
            type: newEntry.type,
            amount: parsedAmount,
            isManual: 1,
            narration: newEntry.narration
        }];

        // Calculate new total to determine next entry type
        const newTotal = updatedJournal.reduce((sum, entry) => 
            sum + (entry.type === 'Credit' ? -entry.amount : entry.amount), 0);

        onJournalChange(updatedJournal);
        setNewEntry({
            account: '',
            type: newTotal >= 0 ? 'Credit' : 'Debit',
            amount: Math.abs(newTotal),
            narration: ''
        });
    };

    const handleEditEntry = (index) => {
        const entry = journal[index];
        setNewEntry({
            account: entry.account,
            type: entry.type,
            amount: entry.amount,
            narration: entry.narration
        });
        setEditingIndex(index);
    };

    const handleSaveEdit = () => {
        if (!newEntry.account || !newEntry.amount) return;
        const parsedAmount = Number(newEntry.amount);
        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

        const updatedJournal = journal.map((entry, idx) =>
            idx === editingIndex
                ? { ...entry, account: newEntry.account, type: newEntry.type, amount: parsedAmount, narration: newEntry.narration }
                : entry
        );

        // Calculate new total to determine next entry type
        const newTotal = updatedJournal.reduce((sum, entry) => 
            sum + (entry.type === 'Credit' ? -entry.amount : entry.amount), 0);

        onJournalChange(updatedJournal);
        setEditingIndex(null);
        setNewEntry({
            account: '',
            type: newTotal >= 0 ? 'Credit' : 'Debit',
            amount: Math.abs(newTotal),
            narration: ''
        });
    };

    const handleDeleteEntry = (index) => {
        const updatedJournal = journal.filter((_, i) => i !== index).map((entry, i) => ({
            ...entry,
            srno: i + 1
        }));
        onJournalChange(updatedJournal);
    };

    // Add effect to update amount when type changes
    React.useEffect(() => {
        const balance = calculateBalance();
        if (balance !== 0) {
            setNewEntry(prev => ({
                ...prev,
                type: balance >= 0 ? 'Credit' : 'Debit',
                amount: Math.abs(balance)
            }));
        }
    }, [journal]);

    return (
        <>
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
                            <TableCell sx={{ minWidth: '50px' }}>Sr. No</TableCell>
                            <TableCell sx={{ minWidth: '200px' }}>Account</TableCell>
                            <TableCell sx={{ minWidth: '200px' }}>Narration</TableCell>
                            <TableCell sx={{ minWidth: '100px' }}>Type</TableCell>
                            <TableCell sx={{ minWidth: '100px' }} align="right">Amount</TableCell>
                            <TableCell sx={{ minWidth: '100px' }} align="center">Actions</TableCell>
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
                                <TableCell>
                                    {editingIndex === index ? (
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
                                                    size="small"
                                                    required
                                                />
                                            )}
                                        />
                                    ) : (
                                        getAccountName(entry.account)
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingIndex === index ? (
                                        <TextField
                                            size="small"
                                            value={newEntry.narration}
                                            onChange={(e) => setNewEntry(prev => ({
                                                ...prev,
                                                narration: e.target.value
                                            }))}
                                            fullWidth
                                        />
                                    ) : (
                                        entry.narration
                                    )}
                                </TableCell>
                                <TableCell sx={{ width: '200px' }}>
                                    {editingIndex === index ? (
                                        <Autocomplete
                                            size="small"
                                            options={[
                                                { value: 'Debit', label: 'Debit' },
                                                { value: 'Credit', label: 'Credit' }
                                            ]}
                                            getOptionLabel={(option) => option.label || ''}
                                            value={{ value: newEntry.type, label: newEntry.type }}
                                            onChange={(_, newValue) => {
                                                const balance = calculateBalance();
                                                setNewEntry(prev => ({
                                                    ...prev,
                                                    type: newValue ? newValue.value : 'Debit',
                                                    amount: Math.abs(balance)
                                                }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    required
                                                />
                                            )}
                                        />
                                    ) : (
                                        <Typography
                                            sx={{
                                                color: getTypeColor(entry.type),
                                                fontWeight: 500,
                                                fontSize: '0.875rem'
                                            }}
                                        >
                                            {entry.type}
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell align="right" sx={{ width: '200px' }}>
                                    {editingIndex === index ? (
                                        <TextField
                                            size="small"
                                            type="number" 
                                            value={newEntry.amount}
                                            onChange={(e) => setNewEntry(prev => ({
                                                ...prev,
                                                amount: e.target.value
                                            }))}
                                            required
                                            inputProps={{ min: 0, step: 'any' }}
                                        />
                                    ) : (
                                        Number(entry.amount).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    {editingIndex === index ? (
                                        <>
                                            <IconButton
                                                size="small"
                                                color="success"
                                                onClick={handleSaveEdit}
                                                sx={{ mr: 1 }}
                                            >
                                                <Iconify icon="eva:checkmark-outline" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    setEditingIndex(null);
                                                    setNewEntry({
                                                        account: '',
                                                        type: 'Debit',
                                                        amount: '',
                                                        narration: ''
                                                    });
                                                }}
                                            >
                                                <Iconify icon="eva:close-outline" />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <>
                                              
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    disabled={!isEditable}
                                                    onClick={() => handleEditEntry(index)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    <Iconify icon="eva:edit-2-outline" />
                                                </IconButton>
                                             
                                            <IconButton
                                                size="small"
                                                color="error"
                                                disabled={!isEditable}
                                                onClick={() => handleDeleteEntry(index)}
                                            >
                                                <Iconify icon="eva:trash-2-outline" />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                      {isEditable && <TableRow>
                            <TableCell>{journal.length + 1}</TableCell>
                            <TableCell>
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
                                            size="small"
                                            required
                                        />
                                    )}
                                />
                            </TableCell>
                            <TableCell>
                                <TextField
                                    size="small"
                                    value={newEntry.narration}
                                    onChange={(e) => setNewEntry(prev => ({
                                        ...prev,
                                        narration: e.target.value
                                    }))}
                                    fullWidth
                                />
                            </TableCell>
                            <TableCell>
                                <Autocomplete
                                    size="small"
                                    options={[
                                        { value: 'Debit', label: 'Debit' },
                                        { value: 'Credit', label: 'Credit' }
                                    ]}
                                    getOptionLabel={(option) => option.label || ''}
                                    value={{ value: newEntry.type, label: newEntry.type }}
                                    onChange={(_, newValue) => {
                                        const balance = calculateBalance();
                                        setNewEntry(prev => ({
                                            ...prev,
                                            type: newValue ? newValue.value : 'Debit',
                                            amount: Math.abs(balance)
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            required
                                        />
                                    )}
                                />
                            </TableCell>
                            <TableCell align="right">
                                <TextField
                                    size="small"
                                    type="number"
                                    value={newEntry.amount}
                                    onChange={(e) => setNewEntry(prev => ({
                                        ...prev,
                                        amount: e.target.value
                                    }))}
                                    required
                                    inputProps={{ min: 0, step: 'any' }}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <IconButton
                                    size="small"
                                    color="success"
                                    onClick={handleAddEntry}
                                    disabled={!newEntry.account || !newEntry.amount || !isEditable}
                                >
                                    <Iconify icon="eva:plus-fill" />
                                </IconButton>
                            </TableCell>
                        </TableRow>}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Totals Section */}
            <Box sx={{ 
                mt: 2,
                p: 2,
                backgroundColor: theme.palette.grey[50],
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ 
                            color: theme.palette.error.main,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}>
                            Debit:
                        </Typography>
                        <Typography sx={{ 
                            color: theme.palette.error.main,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}>
                            {journal
                                .filter(entry => entry.type === 'Debit')
                                .reduce((sum, entry) => sum + Number(entry.amount), 0)
                                .toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ 
                            color: theme.palette.success.main,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}>
                            Credit:
                        </Typography>
                        <Typography sx={{ 
                            color: theme.palette.success.main,
                            fontWeight: 600,
                            fontSize: '0.875rem'
                        }}>
                            {journal
                                .filter(entry => entry.type === 'Credit')
                                .reduce((sum, entry) => sum + Number(entry.amount), 0)
                                .toLocaleString('en-US', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                        </Typography>
                    </Box>
                    {(() => {
                        const totalDebit = journal
                            .filter(entry => entry.type === 'Debit')
                            .reduce((sum, entry) => sum + Number(entry.amount), 0);
                        const totalCredit = journal
                            .filter(entry => entry.type === 'Credit')
                            .reduce((sum, entry) => sum + Number(entry.amount), 0);
                        const difference = totalDebit - totalCredit;
                        
                        if (difference !== 0) {
                            return (
                                <Box sx={{ 
                                      
                                    pl: 2, 
                                    borderLeft: `1px solid ${theme.palette.divider}`,
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
                                        color: difference > 0 ? theme.palette.error.main : theme.palette.success.main,
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
        </>
    );
}