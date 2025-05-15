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

const ITEM_TYPES = [
    { value: 'inventory', label: 'Inventory' },
    { value: 'account', label: 'Account' }
];

export default function TransactionItem({
    Propkey,
    code,
    products = [],
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
    showTaxField = true,
    onItemChange,
    unitList,
    accounts,
    type = null // 'credit' or 'debit'
}) {
    const [hasErrors, setHasErrors] = useState(false);
    const [availUnit, setAvailUnit] = useState([]);
    const [itemType, setItemType] = useState(items[Propkey]?.type || 'inventory');

    useEffect(() => { 
        if (items && unitList) {

            const currentItem = items[Propkey];
            console.log("currentItem", currentItem);
            if (currentItem?.type !== 'account' ) {
                const product = products.find(p => p.code === currentItem.name);
                console.log("Found product:", product);
                if (product?.avail_unit_code) {
                    const unitPricePairs = product.avail_unit_code.split(',');
                    const availUnits = unitList.filter(u => 
                        unitPricePairs.some(unitPrice => {
                            const [unit] = unitPrice.split('#');
                            return unit === u.LK_KEY;
                        })
                    );
                    setAvailUnit(availUnits);
                } else {
                    setAvailUnit([]);
                }
            }
               
        }
    }, [items, unitList, products, Propkey]);

    const handleItemCodeChange = (event, newValue) => {
        if (!newValue) return;
        
        if (itemType === 'inventory') {
            const unitPricePairs = newValue.avail_unit_code?.split(',') || [];
            const availUnits = unitList ? unitList.filter(u => 
                unitPricePairs.some(unitPrice => {
                    const [unit] = unitPrice.split('#');
                    return unit === u.LK_KEY;
                })
            ) : [];
            
            const firstUnitPrice = unitPricePairs[0]?.split('#') || ['', '0'];
            const defaultUnit = firstUnitPrice[0];
            const defaultPrice = parseFloat(firstUnitPrice[1]) || 0;

            const newItems = [...items];
            newItems[Propkey] = {
                ...newItems[Propkey],
                name: newValue.code,
                desc: newValue.desc,
                unit: defaultUnit,
                price: defaultPrice,
                qty: 1,
                tax: newValue.tax || 0,
                previous_docno: newValue.previous_docno,
                previous_docsrno: newValue.previous_docsrno,
                avail_unit_code: newValue.avail_unit_code,
                type: 'inventory'
            };
            setItems(newItems);
            setAvailUnit(availUnits);
        } 
        
        if (onItemChange) {
            onItemChange(items[Propkey]);
        }
    };

    const handleAccountChange = (event, newValue) => {
        if (!newValue) return;
        
        const newItems = [...items];
        newItems[Propkey] = {
            ...newItems[Propkey],
            // name: newValue.AC_CODE || '',
            desc: newValue.AC_DESC || '',
            type: 'account', 
            account: newValue.AC_CODE || '',
        };
        setItems(newItems);
        
        if (onItemChange) {
            onItemChange(newItems[Propkey]);
        }
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
            unit: 'Unit',
            price: 0,
            qty: 1,
            tax: 0
         };
        setItems(newItems);

        if (onItemChange) {
            onItemChange(newItems[Propkey]);
        }
    };

    const handleChange = (event) => {
        const newItems = [...items];
        const { name, value } = event.target;

        if (name === `ItemUnit_${Propkey}` && itemType === 'inventory') {
            const currentItem = items[Propkey];
            const product = products.find(p => p.code === currentItem.name);
            const unitPricePairs = product?.avail_unit_code?.split(',') || [];

            const selectedUnitPrice = unitPricePairs.find(up => {
                const [unit] = up.split('#');
                return unit === value;
            });

            const newPrice = selectedUnitPrice ? parseFloat(selectedUnitPrice.split('#')[1]) : 0;

            newItems[Propkey] = {
                ...newItems[Propkey],
                unit: value,
                type: 'inventory',
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
        <Grid key={Propkey} container spacing={1.5} mb={1}>
            {type === 'credit' && (
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
            )}

            <Grid item xs={12} md={1.5}>
                {((type === 'credit' && itemType === 'inventory') || type === null) && (
                    <Autocomplete
                        disablePortal
                        options={products}
                        fullWidth
                        autoSelect
                        filterOptions={filterOptions}
                        onChange={handleItemCodeChange}
                        getOptionLabel={(option) => option?.code || ''}
                        value={products.find(p => p.code === items[Propkey]?.name) || null}
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
                                error={hasErrors && (items[Propkey]?.name == null || Object.keys(items[Propkey]?.name || {}).length === 0)}
                                helperText={(items[Propkey]?.name == null || Object.keys(items[Propkey]?.name || {}).length === 0) ? errors : ''}
                                name={`ItemCode_${Propkey}`}
                                label="Code"
                            />
                        )}
                    />
                )}
                {type === 'credit' && itemType === 'account' && (
                    <Autocomplete
                        disablePortal
                        options={accounts || []}
                        fullWidth
                        autoSelect
                        onChange={handleAccountChange}
                        getOptionLabel={(option) => `${option?.AC_CODE} - ${option?.AC_DESC}` || ''}
                        value={accounts?.find(acc => acc.AC_CODE === items[Propkey]?.account) || null}
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
                                error={hasErrors && !items[Propkey]?.name}
                                helperText={!items[Propkey]?.name ? errors : ''}
                                label="Account" 
                            />
                        }
                    />
                )}
            </Grid>

            <Grid item xs={12} md={itemType === 'account' ? 4.5 : (type === 'credit' ? 2.5 : 3.5)}>
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

            {(itemType !== 'account') && (
                <Grid item xs={6} sm={3} md={1}>
                    <Select
                        fullWidth
                        size="small"
                        value={items[Propkey].unit || ''}
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
            )}

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
                    value={price}
                    onChange={handleChange}
                    disabled={!isEditable}
                />
            </Grid>
 {(itemType !== 'account') && (
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
                    value={qty}
                    disabled={!isEditable}
                />
            </Grid>
 )}

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
                    type="number"
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
                    type="number"
                    inputProps={{ style: { textAlign: 'right' } }}
                    disabled
                    fullWidth
                    size="small"
                    value={calculateTaxAmount().toFixed(2)}
                    label={`Tax (${tax || 0}%)`}
                    name="itemTaxAmount"
                />
            </Grid>

            <Grid item xs={6} sm={3} md={type === 'credit' ? 1 : 1.5}>
                <TextField
                    type="number"
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