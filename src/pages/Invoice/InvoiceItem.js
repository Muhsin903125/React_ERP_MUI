
import {
    Button,
    Grid,
    TextField,
    FormControl,
    Box,
} from '@mui/material';
import Iconify from '../../components/iconify';

export default function InvoiceItem({removeItem}) {


    return (
        <Box  mb={2}  >
            <Grid container spacing={2} >
                <Grid item xs={12} md={4} >
                    <TextField size="small" fullWidth label="Name" name="itemName" />
                </Grid>
                <Grid item xs={6} sm={3} md={2} >
                    <TextField
                        fullWidth
                        type={'number'}
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        size="small" label="Price" name="itemPrice" />
                </Grid>
                <Grid item xs={6} sm={3} md={2} >
                    <TextField
                        type={'number'}
                        fullWidth
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} size="small" label="Quantity" name="itemQty" />
                </Grid>
                <Grid item xs={6} sm={3} md={2} >
                    <TextField disabled fullWidth value={0.00} size="small" label="Total" name="itemTotal" />
                </Grid>
                <Grid item xs={6} sm={3} md={2} >
                    <FormControl fullWidth>
                        <Button variant="outlined" color='error' 
                        onClick={removeItem}
                        endIcon={<Iconify icon="ic:round-delete-forever" size="large" />} >
                            Remove
                        </Button>
                    </FormControl>
                </Grid>
            </Grid>
        </Box>
    );
}
