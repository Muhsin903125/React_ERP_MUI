import { useState, useEffect } from 'react';
import {
    Grid,
    TextField,
    Box,
    IconButton,
    Autocomplete,
    createFilterOptions,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function CreditNoteItem({ 
    Propkey, 
    code, 
    desc, 
    qty, 
    price, 
    unit, 
    removeItem, 
    setItems, 
    items, 
    errors, 
    isEditable 
}) {
    function calculateItemTotal() {
        return qty * price;
    }

    const [hasErrors, setHasErrors] = useState(false);

    useEffect(() => {
        setHasErrors(errors !== undefined && errors !== null && Object.keys(errors).length > 0);
    }, [errors]);

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
        <Grid container spacing={1} mb={1}>
            <Grid item xs={12} md={2}>
                <TextField
                    name={`ItemCode_${Propkey}`}
                    size="small"
                    value={code}
                    fullWidth
                    label="Code"
                    onChange={handleChange}
                    disabled={!isEditable}
                    error={hasErrors && !code}
                    helperText={hasErrors && !code ? 'Item code is required' : ''}
                    required
                />
            </Grid>
            <Grid item xs={12} md={3}>
                <TextField
                    name={`ItemDesc_${Propkey}`}
                    size="small"
                    value={desc}
                    multiline
                    fullWidth
                    label="Description"
                    onChange={handleChange}
                    disabled={!isEditable}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    fullWidth
                    name={`ItemUnit_${Propkey}`}
                    value={unit}
                    size="small"
                    label="Unit"
                    onChange={handleChange}
                    disabled={!isEditable}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
                <TextField
                    fullWidth
                    name={`ItemPrice_${Propkey}`}
                    type="number"
                    inputProps={{ min: "0", style: { textAlign: 'right' } }}
                    size="small"
                    label="Price"
                    value={price}
                    onChange={handleChange}
                    disabled={!isEditable}
                    error={hasErrors && (!price || price <= 0)}
                    helperText={hasErrors && (!price || price <= 0) ? 'Valid price is required' : ''}
                    required
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    type="number"
                    fullWidth
                    name={`ItemQty_${Propkey}`}
                    inputProps={{ min: "1" }}
                    size="small"
                    label="Quantity"
                    onChange={handleChange}
                    value={qty}
                    disabled={!isEditable}
                    error={hasErrors && (!qty || qty <= 0)}
                    helperText={hasErrors && (!qty || qty <= 0) ? 'Valid quantity is required' : ''}
                    required
                />
            </Grid>
            <Grid item xs={6} sm={3} md={2}>
                <TextField
                    type="number"
                    inputProps={{ min: "0", style: { textAlign: 'right' } }}
                    disabled
                    fullWidth
                    size="small"
                    value={calculateItemTotal()}
                    label="Total"
                    name="itemTotal"
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <IconButton aria-label="delete" onClick={removeItem} disabled={!isEditable}>
                    <Delete color="error" />
                </IconButton>
            </Grid>
        </Grid>
    );
} 