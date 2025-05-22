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

                                <TableCell>Sr No</TableCell>
                                <TableCell>Doc Code</TableCell>
                                <TableCell>Doc Date</TableCell>
                                <TableCell align="right">Doc Amount</TableCell>
                                <TableCell align="right">Doc Balance Amount</TableCell>
                                <TableCell align="right">Allocated Amount</TableCell>

                                <TableCell>Amount Type</TableCell>
                                <TableCell>Actrn Srno</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bills.map((bill) => {
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
                                                        onBillSelect([...selectedBills, { ...bill, allocatedAmount: bill.doc_bal_amount }]);
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
                                        <TableCell>{bill.actrn_srno}</TableCell>
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