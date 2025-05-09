import { useState, useEffect } from 'react';
import {
    Grid,
    TextField,
    Box,
    IconButton,
    Autocomplete,
    createFilterOptions,
    Select,
    MenuItem,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

export default function TransactionItem({
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
    showTaxField = true, // Optional prop to control tax field visibility
    onItemChange, // Optional callback for custom item change handling
    unitList,
}) {
    const [hasErrors, setHasErrors] = useState(false);
    const [availUnit, setAvailUnit] = useState([]);

    useEffect(() => {
        setHasErrors(errors !== undefined && errors !== null && Object.keys(errors).length > 0);
    }, [errors]);

    useEffect(() => {
        console.log("useEffect triggered", { items, unitList, Propkey });
        if (items && unitList) {
            const currentItem = items[Propkey];
            console.log("Current item:", currentItem);
            const product = products.find(p => p.code === currentItem.name);
            console.log("Product:", product);
            if (product?.avail_unit_code) {
                const unitPricePairs = product.avail_unit_code.split(',');
                console.log("Unit price pairs:", unitPricePairs);
                
                const availUnits = unitList.filter(u => 
                    unitPricePairs.some(unitPrice => {
                        const [unit] = unitPrice.split('#');
                        return unit === u.LK_KEY;
                    })
                );
                console.log("Available units:", availUnits);
                setAvailUnit(availUnits);
            } else {
                setAvailUnit([]);
            }
        }
    }, [  unitList,products]);

    const handleItemCodeChange = (event, newValue) => {
        if (!newValue) return;
        console.log("Item selected:", newValue);
        
        const unitPricePairs = newValue.avail_unit_code.split(',');
        console.log("Unit price pairs:", unitPricePairs);
        
        const availUnits = unitList.filter(u => 
            unitPricePairs.some(unitPrice => {
                const [unit] = unitPrice.split('#');
                return unit === u.LK_KEY;
            })
        );
        console.log("Available units:", availUnits);
        
        // Get the first unit-price pair
        const firstUnitPrice = unitPricePairs[0]?.split('#') || ['', '0'];
        const defaultUnit = firstUnitPrice[0];
        const defaultPrice = parseFloat(firstUnitPrice[1]) || 0;
        console.log("Default unit and price:", { defaultUnit, defaultPrice });

        const newItems = [...items];
        newItems[Propkey] = {
            ...newItems[Propkey],
            name: newValue.code,
            desc: newValue.desc,
            unit: defaultUnit,
            price: defaultPrice,
            qty: 1,
            tax: newValue.tax || 0,
            avail_unit_code: newValue.avail_unit_code
        };
        console.log("Updated items:", newItems);
        setItems(newItems);
        setAvailUnit(availUnits);
        if (onItemChange) {
            onItemChange(newItems[Propkey]);
        }
    };

    const filterOptions = createFilterOptions({
        stringify: (option) => option.desc + option.code,
    });

    const handleChange = (event) => {
        const newItems = [...items];
        const { name, value } = event.target;
        console.log("Field changed:", { name, value });

        if (name === `ItemUnit_${Propkey}`) {
            // When unit changes, update price based on the selected unit
            const currentItem = items[Propkey];
            const product = products.find(p => p.code === currentItem.name);
            const unitPricePairs = product?.avail_unit_code?.split(',') || [];
            console.log("Unit price pairs for price update:", unitPricePairs);
            
            const selectedUnitPrice = unitPricePairs.find(up => {
                const [unit] = up.split('#');
                return unit === value;
            });
            console.log("Selected unit price pair:", selectedUnitPrice);
            
            const newPrice = selectedUnitPrice ? parseFloat(selectedUnitPrice.split('#')[1]) : 0;
            console.log("New price:", newPrice);

            newItems[Propkey] = {
                ...newItems[Propkey],
                unit: value,
                price: newPrice
            };
        } else if (name === `ItemDesc_${Propkey}`) {
            newItems[Propkey].desc = value;
        } else if (name === `ItemPrice_${Propkey}`) {
            newItems[Propkey].price = value;
        } else if (name === `ItemCode_${Propkey}`) {
            newItems[Propkey].name = value;
        } else if (name === `ItemQty_${Propkey}`) {
            newItems[Propkey].qty = value;
        } else if (name === `ItemTax_${Propkey}`) {
            newItems[Propkey].tax = value;
        }
        
        setItems(newItems);
        if (onItemChange) {
            onItemChange(newItems[Propkey]);
        }
    };

    const calculateSubTotal = () => {
        return qty * price;
    };

    const calculateTaxAmount = () => {
        const subtotal = calculateSubTotal();
        return (subtotal * discountPercent * (tax || 0)) / 100;
    };

    const calculateItemTotal = () => {
        return (calculateSubTotal() * discountPercent) + calculateTaxAmount();
    };

    return (
        <Grid key={Propkey} container spacing={1.5} mb={1.5}>
            <Grid item xs={12} md={2}>
                {products.length > 0 && (
                    <Autocomplete
                        disablePortal
                        options={products}
                        fullWidth
                        autoSelect
                        filterOptions={filterOptions}
                        onChange={handleItemCodeChange}
                        getOptionLabel={(option) => option?.code || ''}
                        value={products.find(p => p.code === items[Propkey].name) || null}
                        disabled={!isEditable}
                        renderOption={(props, option) => (
                            <Box component="li" sx={{ borderBottom: '1px solid blue' }} {...props}>
                                <Grid container>
                                    <Grid item xs={12} md={12} fontSize={10}>
                                        {option.label}
                                    </Grid>
                                    <Grid item xs={12} md={12} fontSize={12} fontStyle={'italic'}>
                                        {option.desc}
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                error={hasErrors && (items[Propkey].name == null || Object.keys(items[Propkey].name).length === 0)}
                                helperText={(items[Propkey].name == null || Object.keys(items[Propkey].name).length === 0) ? errors : ''}
                                name={`ItemCode_${Propkey}`}
                                label="Code"
                            />
                        )}
                    />
                )}
            </Grid>

            <Grid item xs={12} md={3}>
                <TextField
                    name={`ItemDesc_${Propkey}`}
                    size="small"
                    value={items[Propkey].desc || ''}
                    multiline
                    fullWidth
                    label="Description"
                    onChange={handleChange}
                    disabled={!isEditable}
                />
            </Grid>

            <Grid item xs={6} sm={3} md={1}>
                <Select
                    fullWidth
                    size="small"
                    value={items[Propkey].unit}
                    onChange={(event) => handleChange({ target: { name: `ItemUnit_${Propkey}`, value: event.target.value } })}
                    disabled={!isEditable}
                >
                    {availUnit && availUnit.length > 0 ? (
                        availUnit.map((option) => (
                            <MenuItem key={option.LK_KEY} value={option.LK_KEY}>
                                {option.LK_VALUE}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem value="">Select Unit</MenuItem>
                    )}
                </Select>
            </Grid>

            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    fullWidth
                    name={`ItemPrice_${Propkey}`}
                    type="number"
                    inputProps={{
                        min: "0",
                        step: "0.01",
                        style: { textAlign: 'right' }
                    }}
                    size="small"
                    label="Price"
                    value={items[Propkey].price || ''}
                    onChange={handleChange}
                    disabled={!isEditable}
                />
            </Grid>

            <Grid item xs={6} sm={3} md={1}>
                <TextField
                    type="number"
                    fullWidth
                    name={`ItemQty_${Propkey}`}
                    inputProps={{
                        min: "1",
                        step: "1",
                        style: { textAlign: 'right' }
                    }}
                    size="small"
                    label="Quantity"
                    onChange={handleChange}
                    value={items[Propkey].qty || ''}
                    disabled={!isEditable}
                />
            </Grid>

            {/* {showTaxField && (
                <Grid item xs={6} sm={3} md={1}>
                    <TextField
                        type={'number'}
                        fullWidth
                        name={`ItemTax_${Propkey}`}
                        inputProps={{ min: "0", max: "100", style: { textAlign: 'right' } }}
                        size="small"
                        label="Tax %"
                        onChange={handleChange}
                        value={tax || 0}
                        disabled={!isEditable}
                    />
                </Grid>
            )} */}

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

            <Grid item xs={6} sm={3} md={1.5}>
                <TextField
                    type={'number'}
                    inputProps={{ style: { textAlign: 'right' } }}
                    disabled
                    fullWidth
                    size="small"
                    value={calculateItemTotal().toFixed(2)}
                    label="Total"
                    name="itemTotal"
                />
            </Grid>

            <Grid item xs={6} sm={3} md={0.5}>
                <IconButton
                    aria-label="delete"
                    onClick={removeItem}
                    disabled={!isEditable}
                >
                    <Delete color="error" />
                </IconButton>
            </Grid>
        </Grid>
    );
} 