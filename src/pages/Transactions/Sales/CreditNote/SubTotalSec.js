import { Grid, Button, TextField, FormControl } from '@mui/material';
import Iconify from '../../../../components/iconify';

export default function SubTotalSec({ addItem, calculateTotal, discount, tax, handleInputChange, isEditable }) {
    const taxAmount = ((calculateTotal - discount) * tax) / 100;
    const netAmount = (calculateTotal - discount) + taxAmount;

    return (
        <>
            <Grid container spacing={2} mt={1}>
                {isEditable && (
                    <Grid item xs={12} md={12}>
                        <Button
                            variant="outlined"
                            startIcon={<Iconify icon="eva:plus-fill" />}
                            onClick={addItem}
                        >
                            Add Item
                        </Button>
                    </Grid>
                )}

                <Grid item xs={12} sm={4} md={4} />
                <Grid item xs={12} sm={8} md={8}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Gross Amount"
                                    type="number"
                                    size="small"
                                    value={calculateTotal.toFixed(2)}
                                    inputProps={{
                                        readOnly: true,
                                        style: { textAlign: 'right' }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Discount"
                                    name="Discount"
                                    type="number"
                                    size="small"
                                    value={discount}
                                    onChange={handleInputChange}
                                    disabled={!isEditable}
                                    inputProps={{
                                        min: "0",
                                        style: { textAlign: 'right' }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Tax %"
                                    name="Tax"
                                    type="number"
                                    size="small"
                                    value={tax}
                                    onChange={handleInputChange}
                                    disabled={!isEditable}
                                    inputProps={{
                                        min: "0",
                                        max: "100",
                                        style: { textAlign: 'right' }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={6}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Tax Amount"
                                    type="number"
                                    size="small"
                                    value={taxAmount.toFixed(2)}
                                    inputProps={{
                                        readOnly: true,
                                        style: { textAlign: 'right' }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={12}>
                            <FormControl fullWidth>
                                <TextField
                                    label="Net Amount"
                                    type="number"
                                    size="small"
                                    value={netAmount.toFixed(2)}
                                    inputProps={{
                                        readOnly: true,
                                        style: { textAlign: 'right' }
                                    }}
                                />
                            </FormControl>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
} 