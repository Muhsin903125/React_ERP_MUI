import { useState } from 'react';

import {
    Button,
    Grid,
    TextField,
    FormControl,
    Box, Stack,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Autocomplete,
    createFilterOptions,
    Divider
} from '@mui/material';
import { CheckCircle, Delete, Save, SignalCellularNull } from '@mui/icons-material';
import Iconify from '../../components/iconify';

export default function InvoiceItem({ Propkey, code, desc, qty, price, unit, removeItem, setItems, items }) {
 
    const [itemTotal, setItemtotal] = useState(qty*price);
    const products = [
        { label: "Mango", price: 194, unit: "kg", desc: "Kerala mango" },
        { label: 'Apple', price: 250, unit: "kg", desc: "Kashmir Apple" },
        { label: 'Banana', price: 80, unit: "kg", desc: "Banana from Tamil Nadu" },
        { label: 'Pineapple', price: 150, unit: "kg", desc: "Pineapple from Himachal Pradesh" },
        { label: 'Guava', price: 60, unit: "kg", desc: "Guava from Uttar Pradesh" },
        { label: 'Grapes', price: 200, unit: "kg", desc: "Grapes from Maharashtra" },
        { label: 'Lemon', price: 80, unit: "kg", desc: "Lemon from Andhra Pradesh" },
        { label: 'Watermelon', price: 40, unit: "nos", desc: "Watermelon from Rajasthan" },
        { label: 'Peach', price: 150, unit: "kg", desc: "Peach from Himachal Pradesh" },
        { label: 'Plum', price: 180, unit: "kg", desc: "from Maharashtra" }
    ] 
    const handleItemCodeChange = (event, newValue) => {
 
        const newItems = [...items];
        newItems[Propkey].name = newValue.label;
        newItems[Propkey].desc = newValue.desc;
        newItems[Propkey].unit = newValue.unit;
        newItems[Propkey].price = newValue.price;
        newItems[Propkey].qty = 1;
        setItemtotal(newValue.price);
        setItems(newItems); 
    }; 
    const filterOptions = createFilterOptions({
        stringify: (option) => option.desc + option.label,
    });

    const handleChange = (event) => { 
        const newItems = [...items];

        if (event.target.name === `ItemDesc_${Propkey}`) {
            newItems[Propkey].desc = event.target.value; 
        }
        else if (event.target.name === `ItemPrice_${Propkey}`) {
            newItems[Propkey].price = event.target.value;
            setItemtotal(newItems[Propkey].price*newItems[Propkey].qty);
        }
        else if (event.target.name === `ItemCode_${Propkey}`) {
            newItems[Propkey].name = event.target.value;
        }
        else if (event.target.name === `ItemQty_${Propkey}`) {
            newItems[Propkey].qty = event.target.value;
            setItemtotal(newItems[Propkey].price*newItems[Propkey].qty);
        }
        else if (event.target.name === `ItemUnit_${Propkey}`) {
            newItems[Propkey].unit = event.target.value;
        }
        setItems(newItems); 
    } 
    return (
        <Grid key={Propkey} container spacing={2} mb={2}>
            <Grid item xs={12} md={2}>
                <Autocomplete
                    disablePortal
                    options={products}
                    filterOptions={filterOptions}
                    onChange={handleItemCodeChange}
                    getOptionLabel={() => code}
                    renderOption={(props, option) => (
                        <Box component="li" sx={{ borderBottom: '1px solid blue' }} {...props}>
                            <Grid container >
                                <Grid item xs={12} md={12} fontSize={12}>
                                    {option.label}
                                </Grid>
                                <Grid item xs={12} md={12} fontSize={10} fontStyle={'italic'}>
                                    {option.desc}
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                    renderInput={(params) => <TextField {...params} size="small"
                        onChange={handleItemCodeChange} name={`ItemCode_${Propkey}`} label="Code" />}
                />

            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    name={`ItemDesc_${Propkey}`}
                    size="small"
                    value={desc}
                    // inputRef={descRef}
                    fullWidth label="Description"
                    onChange={handleChange}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    fullWidth
                    name={`ItemUnit_${Propkey}`}
                    disabled
                    value={unit}
                    size="small" label="Unit"
                    onChange={handleChange}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
                <TextField
                    fullWidth
                    //  inputRef={priceRef}
                    name={`ItemPrice_${Propkey}`}
                    type={'number'}
                    inputProps={{ min: "0", style: { textAlign: 'right' } }}
                    size="small" label="Price"
                    value={price}
                    onChange={handleChange}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    type={'number'}
                    fullWidth
                    name={`ItemQty_${Propkey}`}
                    inputProps={{ min: "1" }}
                    size="small" label="Quantity"
                    onChange={handleChange}
                    value={qty}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
                <TextField disabled fullWidth  size="small" value={itemTotal} label="Total" name="itemTotal" />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <IconButton aria-label="delete" onClick={removeItem}>
                    <Delete color="error" />
                </IconButton>
            </Grid>
        </Grid>


    );
}
