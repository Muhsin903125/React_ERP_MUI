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
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import validator from 'validator';
import { AuthContext } from '../../../App';
import { deleteRole, saveRole, UpdateRole } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';
import Confirm from '../../../components/Confirm';


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


    const isEditing = Boolean(product && product.id);

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

    return (
        <>
            <Helmet>
                <title>Product </title>
            </Helmet>

            <Container  >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        {isEditing ? 'Edit Product' : 'New Product'}
                    </Typography>
                </Stack>
                <Card >
                    <Grid container p={3}  spacing={1} >
                        <Grid item xs={12} md={6} >
                            <TextField
                                label="Code"
                                variant="outlined"
                                fullWidth
                                margin="normal"
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
                                    <Typography variant="caption" color="error">
                                        {errors.unit}
                                    </Typography>
                                )}
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Grid container md={12} spacing={1} pl={3} pb={3}>
                        <Grid item xs={12} md={6}  >

                            <LoadingButton variant="contained" color="primary" fullWidth size="large" onClick={handleSave}>
                                {isEditing ? 'Update' : 'Save'}
                            </LoadingButton>
                        </Grid>
                        <Grid item xs={12} md={6}  >
                            {isEditing && (
                                <LoadingButton variant="contained" color="error" fullWidth size="large" onClick={handleDelete}>
                                    Delete
                                </LoadingButton>
                            )}
                        </Grid>
                    </ Grid>
                </Card>

            </ Container>
        </>
    );
};

export default Product;    