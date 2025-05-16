import React from 'react';
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
} from '@mui/material';

export default function PendingBillsDialog({
    open,
    onClose,
    bills,
    selectedBills,
    onBillSelect,
    onConfirm,
    onAllocatedAmountChange
}) {
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
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedBills.length > 0 && selectedBills.length < bills.length}
                                        checked={bills.length > 0 && selectedBills.length === bills.length}
                                        onChange={(event) => {
                                            if (event.target.checked) {
                                                onBillSelect(bills);
                                            } else {
                                                onBillSelect([]);
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>Bill No</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell align="right">Balance Amount</TableCell>
                                <TableCell align="right">Allocated Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bills.map((bill) => {
                                const isSelected = selectedBills.some(selected => selected.billNo === bill.billNo);
                                return (
                                    <TableRow key={bill.billNo}>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected}
                                                onChange={() => {
                                                    if (isSelected) {
                                                        onBillSelect(selectedBills.filter(selected => selected.billNo !== bill.billNo));
                                                    } else {
                                                        onBillSelect([...selectedBills, { ...bill, allocatedAmount: bill.balanceAmount }]);
                                                    }
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>{bill.billNo}</TableCell>
                                        <TableCell>{new Date(bill.date).toLocaleDateString()}</TableCell>
                                        <TableCell align="right">{bill.amount.toFixed(2)}</TableCell>
                                        <TableCell align="right">{bill.balanceAmount.toFixed(2)}</TableCell>
                                        <TableCell align="right">
                                            {isSelected && (
                                                <TextField
                                                    type="number"
                                                    value={selectedBills.find(selected => selected.billNo === bill.billNo)?.allocatedAmount || 0}
                                                    onChange={(e) => onAllocatedAmountChange(bill.billNo, parseFloat(e.target.value) || 0)}
                                                    inputProps={{
                                                        min: 0,
                                                        max: bill.balanceAmount,
                                                        step: 0.01
                                                    }}
                                                    size="small"
                                                />
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
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