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
import { CheckCircle, Delete, Save } from '@mui/icons-material';
import Iconify from '../../components/iconify';

export default function InvoiceItem({ key, codeRef, descRef, unitRef, priceRef, qtyRef, onChange, removeItem }) {

    // const [itemName, setName] = useState(name);
    // const [itemPrice, setPrice] = useState(price);
     const [itemQty, setQty] = useState(null); 
    const products = [
        { label: 'Mango', price: 194,unit:"kg",desc:"Kerala mango" },
        { label: 'Apple', price: 250,unit:"kg",desc:"Kashmir Apple" },
        { label: 'Banana', price: 80,unit:"kg",desc:"Banana from Tamil Nadu" },
        { label: 'Pineapple', price: 150,unit:"kg",desc:"Pineapple from Himachal Pradesh" },
        { label: 'Guava', price: 60,unit:"kg",desc:"Guava from Uttar Pradesh" },
        { label: 'Grapes', price: 200,unit:"kg",desc:"Grapes from Maharashtra" },
        { label: 'Lemon', price: 80,unit:"kg",desc:"Lemon from Andhra Pradesh" },
        { label: 'Watermelon', price: 40,unit:"kg",desc:"Watermelon from Rajasthan" },
        { label: 'Peach', price: 150,unit:"kg",desc:"Peach from Himachal Pradesh" },
        { label: 'Plum', price: 180,unit:"kg",desc:"from Maharashtra"}
      ]
      const [ItemDesc, setItemDesc] = useState('');
      const [Unit, setUnit] = useState('');
      
      const handleItemCodeChange = (event, newValue) => {
        setItemDesc(newValue.desc);
        setUnit(newValue.unit)
      };
      
      const filterOptions = createFilterOptions({
        stringify: (option) => option.desc + option.label,
      });

    
    return (
        <Grid key={key} container spacing={2} mb={2}>
            <Grid item xs={12} md={2}>
                <Autocomplete
                    disablePortal                   
                    options={products}
                    
                    filterOptions={filterOptions}
                    onChange={handleItemCodeChange}
                    getOptionLabel={(option) => option.label} 
                    renderOption={(props, option) => (
                        <Box component="li" sx={{borderBottom: '1px solid blue'}} {...props}>
                            <Grid  container >
                                <Grid item xs={12} md={12} fontSize={12}>
                                    {option.label}
                                </Grid>
                                <Grid item xs={12} md={12} fontSize={10} fontStyle={'italic'}>
                                    {option.desc}
                                </Grid>
                            </Grid>
                        </Box>
                     )}
                    renderInput={(params) => <TextField {...params} size="small"   inputRef={codeRef} label="Code" name="ItemCode" />}
                />
               
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField 
                    name="ItemDesc"
                    size="small"
                    value={ItemDesc}
                    inputRef={descRef}
                    fullWidth label="Description" 
                    onChange={(e) => {setItemDesc(e.target.value)}}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    fullWidth
                    inputRef={unitRef}
                    disabled
                    value={Unit}
                    size="small" label="Unit" name="ItemUnit"
                    // onChange={onChange}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
                <TextField
                    fullWidth
                    inputRef={priceRef}
                    type={'number'}
                    inputProps={{ min: "0", style: { textAlign: 'right' } }}
                    size="small" label="Price" name="itemPrice"
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
