import {
    Button,
    Typography,
    Grid,
    TextField,
} from '@mui/material';

export default function SubTotalSec({
    addItem,
    calculateTotal,
    discount,
    tax,
    handleInputChange,
    isEditable,
    showAddButton = true, // Optional prop to control add button visibility
    direction = "row", // Optional prop to control grid direction
    type = null,
}) {
    function FormattedNumber(value) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value)
    }

    return (
        <>
            <Grid container spacing={3.5} direction={direction}>
                {showAddButton && (
                    <Grid item xs={12} md={4} justifyContent={"flex-start"}>
                        <Button onClick={addItem} disabled={!isEditable}>Add Item</Button>
                    </Grid>
                )}

                <Grid item container md={8} spacing={3.5} mt={1} justifyContent="flex-end">
                    <Grid item xs={6} md={4}>
                        {type !== 'credit' && (
                            <TextField
                                fullWidth
                                type="number"
                                inputProps={{ min: "0" }}
                                size="small"
                                label="Discount"
                                name="Discount"
                                value={discount}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            />
                        )}
                    </Grid>
                    <Grid item xs={6} md={4}>
                        <TextField
                            fullWidth
                            type="number"
                            inputProps={{ min: "0" }}
                            size="small"
                            label="Tax %"
                            name="Tax"
                            value={tax}
                            onChange={handleInputChange}
                            disabled={!isEditable}
                        />
                    </Grid>

                    <Grid container xs={12} md={6} spacing={1} mt={1} align='right' justifyContent="flex-end">
                        <Grid item md={8} xs={6}>
                            <Typography variant="subtitle2">
                                Gross Amount:
                            </Typography>
                        </Grid>
                        <Grid item md={4} xs={6}>
                            <Typography variant="subtitle2">
                                {FormattedNumber(calculateTotal)}
                            </Typography>
                        </Grid>
                        {type !== 'credit' && (
                            <>
                                <Grid item md={8} xs={6}>
                                    <Typography variant="subtitle2">
                                        Discount:
                                    </Typography>
                                </Grid>
                                <Grid item md={4} xs={6}>
                                    <Typography variant="subtitle2" style={{ color: "#FF5630" }}>
                                        {FormattedNumber(discount * -1)}
                                    </Typography>
                                </Grid>
                            </>
                        )}
                        <Grid item md={8} xs={6}>
                            <Typography variant="subtitle2">
                                Tax:
                            </Typography>
                        </Grid>
                        <Grid item md={4} xs={6}>
                            <Typography variant="subtitle2">
                                {FormattedNumber((calculateTotal - discount) * tax / 100.00)}
                            </Typography>
                        </Grid>
                        <Grid item md={8} xs={6}>
                            <Typography variant="h6">
                                Total Price:
                            </Typography>
                        </Grid>
                        <Grid item md={4} xs={6}>
                            <Typography variant="h6">
                                {FormattedNumber((calculateTotal - discount) * (1 + tax / 100.00))}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
} 