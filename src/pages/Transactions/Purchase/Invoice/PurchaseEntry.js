import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Stack,
    Button,
    Typography,
    Container,
    Box,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
} from '@mui/material';
import { GetSingleListResult, GetSingleResult, PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import Iconify from '../../../../components/iconify';

export default function PurchaseEntry() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [isNew, setIsNew] = useState(!id);
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({
        InvNo: '',
        InvDate: new Date().toISOString().split('T')[0],
        SupplierCode: '',
        LPONo: '',
        TRN: '',
        PaymentMode: '',
        Location: '',
        Items: [],
        GrossAmount: 0,
        Discount: 0,
        Tax: 0,
        TaxAmount: 0,
        NetAmount: 0,
        Remarks: '',
    });

    useEffect(() => {
        if (id) {
            fetchInvoiceDetails();
        }
        fetchSuppliers();
        fetchItems();
        fetchLocations();
    }, [id]);

    const fetchInvoiceDetails = async () => {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetSingleResult({
                key: "PURCHASE_INVOICE_CRUD",
                TYPE: "GET_SINGLE",
                InvNo: id
            });
            if (Success) {
                setFormData(Data);
            } else {
                showToast(Message, "error");
            }
        } finally {
            setLoadingFull(false);
        }
    };

    const fetchSuppliers = async () => {
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                key: "SUPPLIER_CRUD",
                TYPE: "GET_ALL"
            });
            if (Success) {
                setSuppliers(Data);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            console.error("Error fetching suppliers:", error);
        }
    };

    const fetchItems = async () => {
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                key: "ITEM_CRUD",
                TYPE: "GET_ALL"
            });
            if (Success) {
                setItems(Data);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    };

    const fetchLocations = async () => {
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                key: "LOCATION_CRUD",
                TYPE: "GET_ALL"
            });
            if (Success) {
                setLocations(Data);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoadingFull(true);
            const { Success, Message } = await PostCommonSp({
                key: "PURCHASE_INVOICE_CRUD",
                TYPE: isNew ? "ADD" : "UPDATE",
                ...formData
            });
            if (Success) {
                showToast(Message, "success");
                navigate('/purchase-invoice');
            } else {
                showToast(Message, "error");
            }
        } finally {
            setLoadingFull(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.Items];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Calculate line total
        if (field === 'Qty' || field === 'Price') {
            newItems[index].Total = newItems[index].Qty * newItems[index].Price;
        }
        
        setFormData(prev => ({
            ...prev,
            Items: newItems,
            GrossAmount: newItems.reduce((sum, item) => sum + (item.Total || 0), 0)
        }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            Items: [...prev.Items, {
                ItemCode: '',
                Qty: 0,
                Price: 0,
                Total: 0
            }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            Items: prev.Items.filter((_, i) => i !== index)
        }));
    };

    return (
        <>
            <Helmet>
                <title>{isNew ? 'New Purchase Invoice' : 'Edit Purchase Invoice'}</title>
            </Helmet>
            <Box component="main" sx={{ m: 1, p: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        {isNew ? 'New Purchase Invoice' : 'Edit Purchase Invoice'}
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<Iconify icon="mdi:cancel" />}
                        onClick={() => navigate('/purchase-invoice')}
                    >
                        Cancel
                    </Button>
                </Stack>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Invoice Number"
                                value={formData.InvNo}
                                onChange={(e) => setFormData(prev => ({ ...prev, InvNo: e.target.value }))}
                                disabled={!isNew}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={formData.InvDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, InvDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={suppliers}
                                getOptionLabel={(option) => `${option.Code} - ${option.Name}`}
                                value={suppliers.find(s => s.Code === formData.SupplierCode) || null}
                                onChange={(_, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        SupplierCode: newValue?.Code || '',
                                        TRN: newValue?.TRN || ''
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Supplier"
                                        required
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="LPO Number"
                                value={formData.LPONo}
                                onChange={(e) => setFormData(prev => ({ ...prev, LPONo: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="TRN"
                                value={formData.TRN}
                                onChange={(e) => setFormData(prev => ({ ...prev, TRN: e.target.value }))}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Payment Mode</InputLabel>
                                <Select
                                    value={formData.PaymentMode}
                                    label="Payment Mode"
                                    onChange={(e) => setFormData(prev => ({ ...prev, PaymentMode: e.target.value }))}
                                >
                                    <MenuItem value="Cash">Cash</MenuItem>
                                    <MenuItem value="Credit">Credit</MenuItem>
                                    <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Autocomplete
                                options={locations}
                                getOptionLabel={(option) => `${option.LM_LOCATION_CODE} - ${option.LM_LOCATION_NAME}`}
                                value={locations.find(l => l.LM_LOCATION_CODE === formData.Location) || null}
                                onChange={(_, newValue) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        Location: newValue?.LM_LOCATION_CODE || ''
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Location"
                                        required
                                    />
                                )}
                            />
                        </Grid>

                        {/* Items Section */}
                        <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom>
                                Items
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<Iconify icon="eva:plus-fill" />}
                                onClick={addItem}
                                sx={{ mb: 2 }}
                            >
                                Add Item
                            </Button>
                            {formData.Items.map((item, index) => (
                                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                                    <Grid item xs={12} sm={3}>
                                        <Autocomplete
                                            options={items}
                                            getOptionLabel={(option) => `${option.Code} - ${option.Name}`}
                                            value={items.find(i => i.Code === item.ItemCode) || null}
                                            onChange={(_, newValue) => {
                                                handleItemChange(index, 'ItemCode', newValue?.Code || '');
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Item"
                                                    required
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            label="Quantity"
                                            type="number"
                                            value={item.Qty}
                                            onChange={(e) => handleItemChange(index, 'Qty', parseFloat(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            label="Price"
                                            type="number"
                                            value={item.Price}
                                            onChange={(e) => handleItemChange(index, 'Price', parseFloat(e.target.value))}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <TextField
                                            fullWidth
                                            label="Total"
                                            value={item.Total || 0}
                                            disabled
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={2}>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => removeItem(index)}
                                            startIcon={<Iconify icon="mdi:delete" />}
                                        >
                                            Remove
                                        </Button>
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Summary Section */}
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Gross Amount"
                                        value={formData.GrossAmount}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Discount"
                                        type="number"
                                        value={formData.Discount}
                                        onChange={(e) => setFormData(prev => ({
                                            ...prev,
                                            Discount: parseFloat(e.target.value),
                                            NetAmount: prev.GrossAmount - parseFloat(e.target.value) + prev.TaxAmount
                                        }))}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Tax %"
                                        type="number"
                                        value={formData.Tax}
                                        onChange={(e) => {
                                            const tax = parseFloat(e.target.value);
                                            const taxAmount = (formData.GrossAmount - formData.Discount) * (tax / 100);
                                            setFormData(prev => ({
                                                ...prev,
                                                Tax: tax,
                                                TaxAmount: taxAmount,
                                                NetAmount: prev.GrossAmount - prev.Discount + taxAmount
                                            }));
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        fullWidth
                                        label="Net Amount"
                                        value={formData.NetAmount}
                                        disabled
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Remarks"
                                multiline
                                rows={4}
                                value={formData.Remarks}
                                onChange={(e) => setFormData(prev => ({ ...prev, Remarks: e.target.value }))}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Iconify icon="mdi:content-save" />}
                                >
                                    {isNew ? 'Save' : 'Update'}
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </>
    );
} 