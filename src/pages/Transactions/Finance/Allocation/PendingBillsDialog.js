import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    TextField,
    Box,
    Typography,
    Alert,
} from '@mui/material';

export default function PendingBillsDialog({
    open,
    onClose,
    bills,
    selectedBills,
    onBillSelect,
    onConfirm,
    onAllocatedAmountChange,
    maxAllowedAllocation
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    const filteredBills = useMemo(() => {
        return bills.filter(bill => 
            bill.doc_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.srno.toString().includes(searchTerm)
        );
    }, [bills, searchTerm]);

    const totalAllocated = useMemo(() => {
        return selectedBills.reduce((sum, bill) => sum + (Number(bill.allocatedAmount) || 0), 0);
    }, [selectedBills]);

    const handleBillSelection = (bill, isSelected) => {
        if (isSelected) {
            // Remove bill from selection
            onBillSelect(selectedBills.filter(selected => selected.srno !== bill.srno));
            setError('');
        } else {
            // Add bill with default allocation
            const newBill = { ...bill, allocatedAmount: bill.doc_bal_amount };
            const newTotal = totalAllocated + Number(bill.doc_bal_amount);
            
            if (maxAllowedAllocation && newTotal > maxAllowedAllocation) {
                // If adding this bill would exceed max allocation, allocate remaining amount
                const remainingAmount = maxAllowedAllocation - totalAllocated;
                if (remainingAmount > 0) {
                    newBill.allocatedAmount = remainingAmount;
                    onBillSelect([...selectedBills, newBill]);
                } else {
                    setError('Maximum allocation amount reached');
                }
            } else {
                onBillSelect([...selectedBills, newBill]);
            }
        }
    };

    const handleAmountChange = (srno, value) => {
        const bill = bills.find(b => b.srno === srno);
        const maxAmount = Math.min(
            bill.doc_bal_amount,
            maxAllowedAllocation ? maxAllowedAllocation - (totalAllocated - (selectedBills.find(b => b.srno === srno)?.allocatedAmount || 0)) : bill.doc_bal_amount
        );
        
        const finalValue = Math.min(Math.max(0, value), maxAmount);
        onAllocatedAmountChange(srno, finalValue);
        setError('');
    };

    const handleConfirm = () => {
        if (maxAllowedAllocation && totalAllocated > maxAllowedAllocation) {
            setError(`Total allocation cannot exceed ${maxAllowedAllocation}`);
            return;
        }
        onConfirm();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '60vh',
                    maxHeight: '80vh',
                }
            }}
        >
            <DialogTitle>Pending Bills</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2, mt: 2 }}>
                    <TextField
                        fullWidth
                        label="Search by Doc Code or Sr No"
                        variant="outlined"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                    />
                </Box>
                {error && (
                    <Box sx={{ mb: 2 }}>
                        <Alert severity="error">{error}</Alert>
                    </Box>
                )}
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedBills.length > 0 && selectedBills.length < filteredBills.length}
                                        checked={filteredBills.length > 0 && selectedBills.length === filteredBills.length}
                                        onChange={(event) => {
                                            if (event.target.checked && (!maxAllowedAllocation || totalAllocated <= maxAllowedAllocation)) {
                                                onBillSelect(filteredBills.map(bill => ({ 
                                                    ...bill, 
                                                    allocatedAmount: bill.doc_bal_amount 
                                                })));
                                            } else {
                                                onBillSelect([]);
                                            }
                                            setError('');
                                        }}
                                    />
                                </TableCell>
                                <TableCell>Sr No</TableCell>
                                <TableCell>Doc Code</TableCell>
                                <TableCell>Doc Date</TableCell>
                                <TableCell align="right">Doc Amount</TableCell>
                                <TableCell align="right">Doc Balance Amount</TableCell>
                                <TableCell align="right">Allocated Amount</TableCell>
                                <TableCell>Amount Type</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBills.map((bill) => {
                                const isSelected = selectedBills.some(selected => selected.srno === bill.srno);
                                const selectedBill = selectedBills.find(selected => selected.srno === bill.srno);
                                return (
                                    <TableRow key={bill.srno}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => handleBillSelection(bill, isSelected)}
                                            />
                                        </TableCell>
                                        <TableCell>{bill.srno}</TableCell>
                                        <TableCell>{bill.doc_code}</TableCell>
                                        <TableCell>{new Date(bill.doc_date).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">{bill.doc_amount.toFixed(2)}</TableCell>
                                        <TableCell align="right">{bill.doc_bal_amount.toFixed(2)}</TableCell>
                                        <TableCell align="right">
                                            <TextField
                                                type="number"
                                                disabled={!isSelected}
                                                value={selectedBill?.allocatedAmount?.toFixed(3) || 0}
                                                onChange={(e) => handleAmountChange(bill.srno, Number(e.target.value))}
                                                inputProps={{
                                                    min: 0,
                                                    max: bill.doc_bal_amount,
                                                    step: 0.01
                                                }}
                                                style={{ width: '100px' }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{bill.amount_type === -1 ? "Credit" : "Debit"}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                        {maxAllowedAllocation 
                            ? `Maximum allowed: ${maxAllowedAllocation.toFixed(2)}`
                            : 'No allocation limit'
                        }
                    </Typography>
                    <Typography variant="h6">
                        Total Allocated: {totalAllocated.toFixed(2)}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleConfirm} 
                    color="primary" 
                    variant="contained"
                    disabled={selectedBills.length === 0 || Boolean(error)}
                >
                    Confirm
                </Button>
            </DialogActions>
        </Dialog>
    );
}