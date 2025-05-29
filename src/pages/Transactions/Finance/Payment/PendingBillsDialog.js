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
} from '@mui/material';

export default function PendingBillsDialog({
    open,
    onClose,
    bills,
    selectedBills,
    onBillSelect,
    onConfirm,
    onAllocatedAmountChange,
    onDiscountChange
}) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBills = useMemo(() => {
        return bills.filter(bill => 
            bill.doc_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.srno.toString().includes(searchTerm)
        );
    }, [bills, searchTerm]);

    const totalAllocated = useMemo(() => {
        return selectedBills.reduce((sum, bill) => sum + (bill.allocatedAmount || 0), 0);
    }, [selectedBills]);

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
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedBills.length > 0 && selectedBills.length < filteredBills.length}
                                        checked={filteredBills.length > 0 && selectedBills.length === filteredBills.length}
                                        onChange={(event) => {
                                            if (event.target.checked) {
                                                onBillSelect(filteredBills);
                                            } else {
                                                onBillSelect([]);
                                            }
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
                                <TableCell>Discount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredBills.map((bill) => {
                                const isSelected = selectedBills.some(selected => selected.srno === bill.srno);
                                return (
                                    <TableRow key={bill.srno}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => {
                                                    if (isSelected) {
                                                        onBillSelect(selectedBills.filter(selected => selected.srno !== bill.srno));
                                                    } else {
                                                        onBillSelect([...selectedBills, { ...bill, allocatedAmount: bill.doc_bal_amount, discount: bill.discount }]);
                                                    }
                                                }}
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
                                                defaultValue={bill.allocatedAmount}
                                                value={selectedBills.find(selected => selected.srno === bill.srno)?.allocatedAmount || 0}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    const maxAmount = bill.doc_bal_amount;
                                                    const finalValue = Math.min(Math.max(0, value), maxAmount);
                                                    onAllocatedAmountChange(bill.srno, finalValue);
                                                }}
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
                                        <TableCell>  <TextField
                                                type="number"
                                                disabled={!isSelected}
                                                defaultValue={0}
                                                value={selectedBills.find(selected => selected.srno === bill.srno)?.discount || 0}
                                                onChange={(e) => {
                                                    const value = parseFloat(e.target.value) || 0;
                                                    onDiscountChange(bill.srno, value);
                                                }}
                                                inputProps={{
                                                    min: 0,
                                                    max: bill.doc_bal_amount,
                                                    step: 0.01
                                                }}
                                                style={{ width: '100px' }}
                                                size="small"
                                            /></TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Typography variant="h6">
                        Total Allocated: {totalAllocated.toFixed(2)}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={onConfirm} variant="contained" color="primary">
                    Confirm Selection
                </Button>
            </DialogActions>
        </Dialog>
    );
} 