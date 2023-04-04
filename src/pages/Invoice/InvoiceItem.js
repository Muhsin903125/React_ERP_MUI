// import { useState } from 'react';

import {
    Grid,
    TextField,
    Box,
    IconButton,
    Autocomplete,
    createFilterOptions,
} from '@mui/material';
import {  Delete } from '@mui/icons-material';
import useLookupData from '../../datas/useLookupData';



export default function InvoiceItem({ Propkey, code, desc, qty, price, unit, removeItem, setItems,items }) {
 
    function calculateItemTotal() {
        return qty * price;
    }

    const products = useLookupData("PRODUCT");
    // [
    //     { label: "Mango", price: 194, unit: "KG", desc: "Kerala mango" },
    //     { label: 'Apple', price: 250, unit: "KG", desc: "Kashmir Apple" },
    //     { label: 'Banana', price: 80, unit: "KG", desc: "Banana from Tamil Nadu" },
    //     { label: 'Pineapple', price: 150, unit: "KG", desc: "Pineapple from Himachal Pradesh" },
    //     { label: 'Guava', price: 60, unit: "KG", desc: "Guava from Uttar Pradesh" },
    //     { label: 'Grapes', price: 200, unit: "KG", desc: "Grapes from Maharashtra" },
    //     { label: 'Lemon', price: 80, unit: "KG", desc: "Lemon from Andhra Pradesh" },
    //     { label: 'Watermelon', price: 40, unit: "NOS", desc: "Watermelon from Rajasthan" },
    //     { label: 'Peach', price: 150, unit: "KG", desc: "Peach from Himachal Pradesh" },
    //     { label: 'Plum', price: 180, unit: "KG", desc: "from Maharashtra" }
    // ] 



    const handleItemCodeChange = (event, newValue) => {
 
        const newItems = [...items];
        newItems[Propkey].name = newValue.label;
        newItems[Propkey].desc = newValue.desc;
        newItems[Propkey].unit = newValue.unit;
        newItems[Propkey].price = newValue.price;
        newItems[Propkey].qty = 1;
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
        }
        else if (event.target.name === `ItemCode_${Propkey}`) {
            newItems[Propkey].name = event.target.value;
        }
        else if (event.target.name === `ItemQty_${Propkey}`) {
            newItems[Propkey].qty = event.target.value;
        }
        else if (event.target.name === `ItemUnit_${Propkey}`) {
            newItems[Propkey].unit = event.target.value;
        }
        setItems(newItems); 
    } 
    return (
        <Grid key={Propkey} container spacing={1} mb={1}>
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
                    multiline
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
                <TextField 
                    type={'number'}
                    inputProps={{ min: "0", style: { textAlign: 'right' } }}
                    disabled 
                    fullWidth  
                    size="small" 
                    value={calculateItemTotal()} 
                    label="Total" 
                    name="itemTotal" />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <IconButton aria-label="delete" onClick={removeItem}>
                    <Delete color="error" />
                </IconButton>
            </Grid>
        </Grid>


    );
}
