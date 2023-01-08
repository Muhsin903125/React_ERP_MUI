import { useState } from 'react';

import {
    Button,
    Grid,
    TextField,
    FormControl,
    Box,
    ListItem,
} from '@mui/material';
import Iconify from '../../components/iconify';

export default function InvoiceItem({key,nameRef, priceRef,qtyRef,onChange, removeItem}) {

    // const [itemName, setName] = useState(name);
    // const [itemPrice, setPrice] = useState(price);
    // const [itemQty, setQty] = useState(quantity); 

    return (
        <ListItem key={key} mb={2}  >
            <Grid container spacing={2} >
                <Grid item xs={12} md={4} >
                    <TextField size="small" 
                   // value={itemName} 
                    inputRef={nameRef}
                    onChange={onChange}
                    fullWidth label="Name" name="itemName" />
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
                <Grid item xs={6} sm={3} md={2} >
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
        </ListItem>
    );
}
