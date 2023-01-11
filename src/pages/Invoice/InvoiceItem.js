import { useState } from 'react';

import {
    Button,
    Grid,
    TextField,
    FormControl,
    Box, Stack,
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
        <Grid key={key} container spacing={2} mb={2}>
            <Grid item xs={12} md={2}>
                <TextField size="small"
                    inputRef={codeRef}
                    fullWidth label="Code" name="ItemCode"
                    onChange={onChange}
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField size="small"
                    inputRef={descRef}
                    fullWidth label="Description" name="ItemDesc"
                    onChange={onChange}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
                <TextField
                    fullWidth
                    inputRef={priceRef}
                    type={'number'}
                    inputProps={{ min: "0" }}
                    size="small" label="Price" name="itemPrice"
                    onChange={onChange}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    type={'number'}
                    fullWidth
                    inputRef={unitRef}
                    inputProps={{ min: "0" }}
                    size="small" label="Unit" name="ItemUnit"
                    onChange={onChange}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    type={'number'}
                    fullWidth
                    inputRef={qtyRef}
                    inputProps={{ min: "0" }}
                    size="small" label="Quantity" name="itemQty"
                    onChange={onChange}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
                <TextField disabled fullWidth value={0.00} size="small" label="Total" name="itemTotal" />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <IconButton aria-label="delete" onClick={removeItem}>
                    <Delete color="error" />
                </IconButton>
            </Grid>
        </Grid>


    );
}
