import { useState } from 'react';

import {
    Button,
    Grid,
    TextField,
    FormControl,
    Box,Stack,
    ListItem,
    IconButton,
} from '@mui/material';
import { CheckCircle, Delete, Save } from '@mui/icons-material';
import Iconify from '../../components/iconify';

export default function InvoiceItem({ key, codeRef, descRef, unitRef, priceRef, qtyRef, onChange, removeItem }) {

    // const [itemName, setName] = useState(name);
    // const [itemPrice, setPrice] = useState(price);
    // const [itemQty, setQty] = useState(quantity); 

    return (

        <Grid container spacing={2} mb={2} >
            <Grid item xs={12} md={2} >
                <TextField size="small"
                    // value={itemName} 
                    inputRef={codeRef}
                    onChange={onChange}
                    fullWidth label="Code" name="ItemCode" />
            </Grid>
            <Grid item xs={12} md={3} >
                <TextField size="small"
                    // value={itemName} 
                    inputRef={descRef}
                    onChange={onChange}
                    fullWidth label="Description" name="ItemDesc" />
            </Grid>
            <Grid item xs={6} sm={3} md={2} >
                <TextField
                    fullWidth
                    inputRef={priceRef}
                    //  value={itemPrice} 
                    type={'number'}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                    size="small" label="Price" name="itemPrice" />
            </Grid>
            <Grid item xs={6} sm={3} md={1} >
                <TextField
                    type={'number'}
                    fullWidth
                    inputRef={unitRef}
                    //   value={itemQty} 
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} size="small" label="Unit" name="ItemUnit" />
            </Grid>
            <Grid item xs={6} sm={3} md={1} >
                <TextField
                    type={'number'}
                    fullWidth
                    inputRef={qtyRef}
                    //   value={itemQty} 
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }} size="small" label="Quantity" name="itemQty" />
            </Grid>
            <Grid item xs={6} sm={3} md={2} >
                <TextField disabled fullWidth value={0.00} size="small" label="Total" name="itemTotal" />
            </Grid>
            <Grid item xs={6} sm={3} md={1} >
                <FormControl fullWidth>
                <Stack direction="row" spacing={1}>
                    {/* <IconButton aria-label="delete">
                        <CheckCircle color="primary"/>
                    </IconButton>  */}
                    <IconButton aria-label="delete" onClick={removeItem}>
                        <Delete color="error"/>
                    </IconButton>
                    </Stack>
                    {/* <Button variant="outlined" color='error'                         onClick={removeItem}
                       
                        endIcon={<Iconify icon="ic:round-delete-forever" size="large" />} >
                            
                        </Button> */}
                </FormControl>
            </Grid>
        </Grid>

    );
}
