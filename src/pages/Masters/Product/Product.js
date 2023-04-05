import React, { useContext, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    TextField,
    Typography,
    Container,
    Stack,
    Grid,
    Card,
    FormControl,
    MenuItem,
    InputLabel,
    Select,
    Box,
    Tab,
} from '@mui/material';
import { LoadingButton, TabContext, TabList, TabPanel } from '@mui/lab';
import validator from 'validator';
import SpeedIcon from '@mui/icons-material/Speed';
import CategoryIcon from '@mui/icons-material/Category';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

import { AuthContext } from '../../../App';
import { deleteRole, saveRole, UpdateRole } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';
import Confirm from '../../../components/Confirm';
import MyContainer from '../../../components/MyContainer';


const Product = () => {

    const location = useLocation();
    const product = location.state?.product;
    const [code, setCode] = useState(product && product.IM_CODE || '');
    const [desc, setDesc] = useState(product && product.IM_DESC || '');
    const [unit, setunit] = useState(product && product.IM_UNIT_CODE || '');
    const [price, setPrice] = useState(product && product.IM_PRICE || '');

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();


    const isEditing = Boolean(product && product.IM_CODE);

    const validate = () => {
        const errors = {};

        if (validator.isEmpty(code)) {
            errors.code = 'Code is required';
        }
        if (validator.isEmpty(desc)) {
            errors.desc = 'Description is required';
        }
        if (validator.isEmpty(unit)) {
            errors.unit = 'Unit is required';
        }
        if (validator.isEmpty(price)) {
            errors.price = 'Price is required';
        } else if (!validator.isNumeric(price)) {
            errors.price = 'Price should be numberic';
        }
        setErrors(errors);

        return Object.keys(errors).length === 0;
    };
    const onSave = async (data) => {
        Confirm('Are you sure?').then(async () => {
            try {
                setLoadingFull(true);
                const { Success, Data, Message } = !isEditing ? await saveRole(data) : await UpdateRole(data);
                if (Success) {
                    showToast(Message, 'success');
                    navigate('/productlist')
                } else {
                    showToast(Message, 'error');
                }
            } finally {
                setLoadingFull(false);
            }
        });
    };

    const handleSave = () => {
        if (validate()) {
            onSave({
                Code: code,
                Desc: desc,
                Price: price,
                Unit: unit,
                id: product?.id,
                isActive: true
            });
        }
    };
    const handleDelete = async () => {
        Confirm('Are you sure to Delete?').then(async () => {
            try {
                setLoadingFull(true);

                const { Success, Data, Message } = await deleteRole(product?.id)
                if (Success) {
                    navigate('/productlist')
                    showToast(Message, 'success');
                }
                else {
                    showToast(Message, "error");
                }
            }
            finally {
                setLoadingFull(false);
            }
        });
    }


    const [tabValue, setTabValue] = useState("Product");
    const TabhandleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <>
            <Helmet>
                <title>Product </title>
            </Helmet>

           
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        {isEditing ? 'Edit Product' : 'New Product'}
                    </Typography>
                </Stack>
                <MyContainer>
                    <TabContext value={tabValue}
                        aria-label="scrollable secondary   tabs example"
                        textColor="secondary"
                        indicatorColor="secondary"

                    >
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList onChange={TabhandleChange} aria-label="lab API tabs example">
                                <Tab icon={<CategoryIcon />} iconPosition="start" label="PRODUCT" value="Product" />
                                <Tab icon={<SpeedIcon />} iconPosition="start" label="UNIT" value="Unit" />
                            </TabList>
                        </Box>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 250 }} >
                            <TabPanel value="Product"  >
                                <Grid container pl={2} pr={2} pt={1} pb={1} spacing={1.5} >
                                    <Grid item xs={12} md={6} >
                                        <TextField
                                            label="Code"
                                            variant="outlined"
                                            fullWidth
                                            margin="normal"
                                            size='small'
                                            value={code}
                                            onChange={(e) => setCode(e.target.value)}
                                            error={errors.code !== undefined}
                                            helperText={errors.code}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6} >
                                        <TextField
                                            label="Price"
                                            variant="outlined"
                                            fullWidth
                                            size='small'
                                            margin="normal"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            error={errors.price !== undefined}
                                            helperText={errors.price}
                                            inputProps={{ maxLength: 10 }}
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6} >
                                        <TextField
                                            label="Description"
                                            variant="outlined"
                                            fullWidth
                                            margin="normal"
                                            size='small'
                                            value={desc}
                                            onChange={(e) => setDesc(e.target.value)}
                                            error={errors.desc !== undefined}
                                            helperText={errors.desc}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}  >
                                        <FormControl variant="outlined" fullWidth margin="normal">
                                            <InputLabel id="Unit-label">Unit</InputLabel>
                                            <Select
                                                labelId="Unit-label"
                                                label="Unit"
                                                value={unit}
                                                size='small'
                                                onChange={(e) => setunit(e.target.value)}
                                                error={errors.gender !== undefined}
                                            >
                                                <MenuItem value="kg">KG</MenuItem>
                                                <MenuItem value="CTN">CTN</MenuItem>
                                                <MenuItem value="ml">ML</MenuItem>
                                                <MenuItem value="mtr">Meter</MenuItem>
                                                <MenuItem value="nos">NOS</MenuItem>
                                            </Select>
                                            {errors.unit && (
                                                <Typography size='small' variant="caption" color="error">
                                                    {errors.unit}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    </Grid>
                                </Grid>


                            </TabPanel>
                            <TabPanel value="Unit">Item Two UnitUnitUnitUnit UnitUnitUnit</TabPanel>
                        </Box>
                    </TabContext>


                    <Grid container   spacing={1} p={3} 
                        direction="row"
                        justifyContent="start"
                        alignItems="flex-end" 
                        >
                        <Grid item md={2}  >
                            <LoadingButton size="medium" variant="contained"   startIcon={<SaveIcon />} color="primary" fullWidth onClick={handleSave}>
                                {isEditing ? 'UPDATE' : 'SAVE'}
                            </LoadingButton>
                        </Grid>
                        <Grid item md={2}  >
                            {isEditing && (
                                <LoadingButton  size="medium" variant="outlined"   startIcon={<DeleteIcon />}color="error" fullWidth onClick={handleDelete}>
                                    DELETE
                                </LoadingButton>
                            )}
                        </Grid>
                    </ Grid>
                    </MyContainer>
        </>
    );
};

export default Product;    