import { Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow, Box, Divider } from '@mui/material';

export default function CreditNotePrint({ headerData, items }) {
    const calculateSubTotal = () => {
        return items.reduce((total, item) => total + (item.qty * item.price), 0);
    };

    const calculateTaxAmount = () => {
        return ((calculateSubTotal() - headerData.Discount) * headerData.Tax) / 100;
    };

    const calculateNetAmount = () => {
        return (calculateSubTotal() - headerData.Discount) + calculateTaxAmount();
    };

    return (
        <Box sx={{ p: 3, backgroundColor: 'white' }}>
            {/* Header */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                    <Typography variant="h5" gutterBottom>
                        CREDIT NOTE
                    </Typography>
                </Grid>
                <Grid item xs={6} textAlign="right">
                    <Typography variant="h6">
                        {headerData.CNNo}
                    </Typography>
                    <Typography variant="body2">
                        Date: {new Date(headerData.CNDate).toLocaleDateString()}
                    </Typography>
                </Grid>
            </Grid>

            {/* Customer Details */}
            <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        Customer Details:
                    </Typography>
                    <Typography variant="body2">{headerData.Customer}</Typography>
                    <Typography variant="body2">{headerData.Address}</Typography>
                    <Typography variant="body2">TRN: {headerData.TRN}</Typography>
                    <Typography variant="body2">Tel: {headerData.ContactNo}</Typography>
                    <Typography variant="body2">Email: {headerData.Email}</Typography>
                </Grid>
                <Grid item xs={6}>
                    <Typography variant="subtitle1" gutterBottom>
                        Credit Note Details:
                    </Typography>
                    <Typography variant="body2">Original Invoice: {headerData.InvoiceNo}</Typography>
                    <Typography variant="body2">Return Reason: {headerData.ReturnReason}</Typography>
                    <Typography variant="body2">Status: {headerData.Status}</Typography>
                </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Items Table */}
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>No.</TableCell>
                        <TableCell>Item</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Price</TableCell>
                        <TableCell align="right">Amount</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={index}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.desc}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell align="right">{item.qty}</TableCell>
                            <TableCell align="right">{item.price.toFixed(2)}</TableCell>
                            <TableCell align="right">{(item.qty * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Totals */}
            <Grid container justifyContent="flex-end" mt={2}>
                <Grid item xs={4}>
                    <Grid container spacing={1}>
                        <Grid item xs={6}>
                            <Typography variant="body2">Gross Amount:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                            <Typography variant="body2">{calculateSubTotal().toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">Discount:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                            <Typography variant="body2">{headerData.Discount.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="body2">Tax ({headerData.Tax}%):</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                            <Typography variant="body2">{calculateTaxAmount().toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant="subtitle1">Net Amount:</Typography>
                        </Grid>
                        <Grid item xs={6} textAlign="right">
                            <Typography variant="subtitle1">{calculateNetAmount().toFixed(2)}</Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            {/* Remarks */}
            {headerData.Remarks && (
                <Box mt={3}>
                    <Typography variant="subtitle1" gutterBottom>
                        Remarks:
                    </Typography>
                    <Typography variant="body2">
                        {headerData.Remarks}
                    </Typography>
                </Box>
            )}

            {/* Footer */}
            <Box mt={5} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    This is a computer generated document
                </Typography>
            </Box>
        </Box>
    );
} 