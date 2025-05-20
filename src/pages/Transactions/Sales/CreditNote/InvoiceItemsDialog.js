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
    Typography,
    Box
} from '@mui/material';
import Iconify from '../../../../components/iconify';

export default function InvoiceItemsDialog({ open, onClose, items, selectedItems, onItemSelect, onConfirm }) {
    const handleToggleItem = (item) => {
        onItemSelect(item);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth >
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">Select Items from Invoice</Typography>
                    <Typography variant="subtitle2" color="text.secondary">
                        {selectedItems.length} items selected
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        checked={items.length > 0 && selectedItems.length === items.length}
                                        indeterminate={selectedItems.length > 0 && selectedItems.length < items.length}
                                        onChange={() => {
                                            if (selectedItems.length === items.length) {
                                                onItemSelect([]);
                                            } else {
                                                onItemSelect(items);
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>Item Name</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Discount</TableCell>
                                <TableCell align="right">Invoice Rate</TableCell>
                                <TableCell align="right">Price</TableCell>
                                <TableCell align="right">Total</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    onClick={() => handleToggleItem(item)}
                                    role="checkbox"
                                    selected={selectedItems.some(selected => selected.name === item.name)}
                                >
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={selectedItems.some(selected => selected.name === item.name)}
                                        />
                                    </TableCell>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell>{item.desc}</TableCell>
                                    <TableCell align="right">{item.qty}</TableCell>
                                    <TableCell align="right">{item.discount}</TableCell>
                                    <TableCell align="right">{item.inv_rate}</TableCell>
                                    <TableCell align="right">{item.price}</TableCell>
                                    <TableCell align="right">{item.qty * item.price}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions sx={{padding:2}}>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    variant="contained" 
                    onClick={onConfirm}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                    disabled={selectedItems.length === 0}
                >
                    Add Selected Items
                </Button>
            </DialogActions>
        </Dialog>
    );
} 