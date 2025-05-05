import { useState, useEffect } from 'react';

import {
    Grid,
    TextField,
    Box,
    IconButton,
    Autocomplete,
    createFilterOptions,
        FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { GetSingleListResult, PostCommonSp, PostMultiSp } from '../../../../hooks/Api';

const ITEM_TYPES = [
    { value: 'inventory', label: 'Inventory' },
    { value: 'account', label: 'Account' }
];

export default function CreditNoteItem({ 
    Propkey, 
    code, 
    products, 
    desc, 
    qty, 
    price, 
    unit, 
    tax,
    discountPercent, 
    removeItem, 
    setItems, 
    items, 
    errors, 
    isEditable,
    accounts 
}) {
    const [itemType, setItemType] = useState(items[Propkey]?.type || 'inventory');
 
    function calculateSubTotal() {
        return qty * price;
    }

    function calculateTaxAmount() {
        const subtotal = calculateSubTotal();
        return (subtotal*discountPercent * (tax || 0)) / 100;
    }

    function calculateItemTotal() {
        return (calculateSubTotal() * discountPercent) + calculateTaxAmount();
    }

    const [hasErrors, setHasErrors] = useState(false);

    useEffect(() => {
        setHasErrors(errors !== undefined && errors !== null && Object.keys(errors).length > 0);
    }, [errors]);

    const handleItemCodeChange = (event, newValue) => {
        const newItems = [...items];
        newItems[Propkey].name = newValue.code;
        newItems[Propkey].desc = newValue.desc;
        newItems[Propkey].unit = newValue.unit;
        newItems[Propkey].price = newValue.price;
        newItems[Propkey].qty = 1;
        setItems(newItems);
    };

    const handleAccountChange = (event, newValue) => {
        const newItems = [...items];
        newItems[Propkey].name = newValue?.AC_CODE || '';
        newItems[Propkey].desc = newValue?.AC_DESC || '';
        newItems[Propkey].type = 'account';
        newItems[Propkey].unit = 'Unit';
        setItems(newItems);
    };

    const filterOptions = createFilterOptions({
        stringify: (option) => option.desc + option.code,
    });

    const handleTypeChange = (event) => {
        const newType = event.target.value;
        setItemType(newType);
        
        const newItems = [...items];
        newItems[Propkey] = {
            ...newItems[Propkey],
            type: newType,
            name: '',
            desc: '',
            unit: 'Unit',
            price: 0,
            qty: 1,
            account: '',
            discountPercent: 0,
            tax: 0,
            discount: 0,
            total: 0
        };
        setItems(newItems);
    };

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
        else if (event.target.name === `ItemTax_${Propkey}`) {
            newItems[Propkey].tax = event.target.value;
        }
        setItems(newItems);
    }

    return (
        <Grid key={Propkey} container spacing={1} mb={1} >
            <Grid item xs={12} md={1.5}>
                <FormControl fullWidth size="small">
                    <Select
                        value={itemType}
                        onChange={handleTypeChange}
                        disabled={!isEditable}
                    >
                        {ITEM_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                                {type.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
                {itemType === 'inventory' && products.length > 0 && (
                    <Autocomplete
                        disablePortal
                        options={products}
                        fullWidth
                        autoSelect
                        filterOptions={filterOptions}
                        onChange={handleItemCodeChange}
                        getOptionLabel={() => code}
                        value={items[Propkey].name}
                        disabled={!isEditable}
                        renderOption={(props, option) => (
                            <Box component="li" sx={{ borderBottom: '1px solid blue' }} {...props}>
                                <Grid container >
                                    <Grid item xs={12} md={12} fontSize={10}>
                                        {option.label}
                                    </Grid>
                                    <Grid item xs={12} md={12} fontSize={12} fontStyle={'italic'}>
                                        {option.desc}
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        renderInput={(params) =>
                            <TextField {...params} size="small"
                                error={hasErrors && (items[Propkey].name == null || Object.keys(items[Propkey].name).length === 0)}
                                helperText={(items[Propkey].name == null || Object.keys(items[Propkey].name).length === 0) ? errors : ''}
                                onChange={handleItemCodeChange} 
                                name={`ItemCode_${Propkey}`} 
                                label="Code" 
                            />
                        }
                    />
                )}
                {itemType === 'account' && (
                    <Autocomplete
                        disablePortal
                        options={accounts || []}
                        fullWidth
                        autoSelect
                        onChange={handleAccountChange}
                        getOptionLabel={(option) => `${option?.AC_CODE} - ${option?.AC_DESC}` || ''}
                        value={accounts?.find(acc => acc.AC_CODE === items[Propkey].name) || null}
                        disabled={!isEditable}
                        renderOption={(props, option) => (
                            <Box component="li" {...props}>
                                <Grid container>
                                    <Grid item xs={12} md={12} fontSize={10}>
                                        {option.AC_CODE}
                                    </Grid>
                                    <Grid item xs={12} md={12} fontSize={12} fontStyle={'italic'}>
                                        {option.AC_DESC}
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        renderInput={(params) =>
                            <TextField {...params} 
                                size="small"
                                error={hasErrors && !items[Propkey].name}
                                helperText={!items[Propkey].name ? errors : ''}
                                label="Account" 
                            />
                        }
                    />
                )}
            </Grid>
            <Grid item xs={12} md={itemType === 'account' ? 3.5 : 2.5}>
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
            {itemType === 'inventory' && (
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
            )}
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    fullWidth
                    name={`ItemPrice_${Propkey}`}
                    type={'number'}
                    inputProps={{ min: "0", style: { textAlign: 'right' } }}
                    size="small" 
                    label="Price"
                    value={price}
                    onChange={handleChange}
                    disabled={!isEditable}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    type={'number'}
                    fullWidth
                    name={`ItemQty_${Propkey}`}
                    inputProps={{ min: "1" }}
                    size="small" 
                    label="Quantity"
                    onChange={handleChange}
                    value={qty}
                    disabled={!isEditable}
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    type={'number'}
                    inputProps={{ style: { textAlign: 'right' } }}
                    disabled
                    fullWidth
                    size="small"
                    value={calculateSubTotal().toFixed(2)}
                    label="Subtotal"
                    name="itemSubtotal" 
                />
            </Grid>
            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    type={'number'}
                    inputProps={{ style: { textAlign: 'right' } }}
                    disabled
                    fullWidth
                    size="small"
                    value={calculateTaxAmount().toFixed(2)}
                    label={`Tax (${tax || 0}%)`}
                    name="itemTaxAmount" 
                />
            </Grid>
            <Grid item xs={6} sm={3} md={0.5}>
                <IconButton aria-label="delete" onClick={removeItem} disabled={!isEditable}>
                    <Delete color="error" />
                </IconButton>
            </Grid>
        </Grid>
    );
}
