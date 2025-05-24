import React, { useContext, useState, useEffect } from 'react';
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

import { AuthContext } from '../../../../App';
import { deleteRole, saveRole, UpdateRole, PostMultiSp, PostCommonSp, GetSingleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import Confirm from '../../../../components/Confirm';
import MyContainer from '../../../../components/MyContainer';
import GridEntry from '../../../../components/GridEntry';


export default function Product1() {

    const location = useLocation();
    // const product = location.state?.product;
    // const [code, setCode] = useState(product && product.IM_CODE || '');
    // const [desc, setDesc] = useState(product && product.IM_DESC || '');
    // const [unit, setunit] = useState(product && product.IM_UNIT_CODE || '');
    // const [price, setPrice] = useState(product && product.IM_PRICE || '');

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();

    const [isView, setView] = useState(false);    
    
    const [formData, setFormData] = useState(
        {
        code: '',
        desc: '',
        unit: '',
        price: 0
      });

    const [units, setUnits] = useState([]);

      useEffect(() => {

        async function fetchCustomerEntry() {
    
          try {
            setLoadingFull(false);
            const { Success, Data, Message } = await PostMultiSp({
              "key": "PRODUCT_ENTRY",
              "code":location.state?.product
            })
            if (Success) {
              console.log(Data[0][0]);
              setFormData(Data[0][0]);
              setUnits(Data[1]);
              console.log(Data[1]);
              console.log(Data);
            //  showToast(Message, 'success');
            }
            else {
              showToast(Data.message? Data.message : Message, 'error');
            }
          }
          finally {
            setLoadingFull(false);
          } 
        }
    
        fetchCustomerEntry();
    
        },[])

    const isEditing = Boolean(location.state?.product);

    const validate = () => {
        const errors = {};

        if (validator.isEmpty(formData.code)) {
            errors.code = 'Code is required';
        }
        if (validator.isEmpty(formData.desc)) {
            errors.desc = 'Description is required';
        }
        if (validator.isEmpty(formData.unit)) {
            errors.unit = 'Unit is required';
        }
        if (!validator.isNumeric(formData.price.toString())) {
            errors.price = 'Price should be numeric';
        }
        setErrors(errors);
        console.log(errors);
        return Object.keys(errors).length === 0;
    };
    const onSave = async (data) => {
        Confirm('Are you sure?').then(async () => {
            try {
                setLoadingFull(true);
                const { Success, Data, Message } =  await GetSingleResult({
                    "json": JSON.stringify({
                        "json": data,
                        "key": "PRODUCT_SAVE",
                        "isEditing": isEditing ? 1 : 0
                    })}); // !isEditing ? await saveRole(data) : await UpdateRole(data);
                if (Success) {
                    showToast(Message, 'success');
                    if (isEditing)
                        setView(true); 
                    else
                        navigate('/productlist');
                } else {
                    showToast(Message, 'error'); 
                }
            } finally {
                setLoadingFull(false);
            }
        });
    };

    const handleInputChange = event => {
        const { name, value } = event.target;
        setFormData({
          ...formData,
          [name]: value
        });
      };


    const handleSave = () => {
        if (validate()) {
            onSave(formData);
        }
    };
    const handleDelete = async () => {
        Confirm('Are you sure to Delete?').then(async () => {
            try {
                setLoadingFull(true);

                const { Success, Data, Message } = await deleteRole('')
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
                                            name="code"
                                            InputProps={{ readOnly: true }}
                                            value={formData.code}
                                            onChange={handleInputChange} // {(e) => setCode(e.target.value)}
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
                                            name="price"
                                            InputProps={{ readOnly: isView }}
                                            value={formData.price}
                                            onChange={handleInputChange} // {(e) => setPrice(e.target.value)}
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
                                            name="desc"
                                            InputProps={{ readOnly: isView }}
                                            value={formData.desc}
                                            onChange={handleInputChange} // {(e) => setDesc(e.target.value)}
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
                                                value={formData.unit}
                                                size='small'
                                                name="unit"
                                                InputProps={{ readOnly: isView }}
                                                onChange={handleInputChange}// {(e) => setunit(e.target.value)}
                                                error={errors.gender !== undefined}
                                            >
                                                <MenuItem value="KG"   disabled = {isView} >KG</MenuItem>
                                                <MenuItem value="CTN"  disabled = {isView} >CTN</MenuItem>
                                                <MenuItem value="ML"   disabled = {isView} >ML</MenuItem>
                                                <MenuItem value="MTR"  disabled = {isView} >Meter</MenuItem>
                                                <MenuItem value="NOS"  disabled = {isView} >NOS</MenuItem>
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
                            <TabPanel value="Unit"><GridEntry data={units} /></TabPanel>
                        </Box>
                    </TabContext>

                    {!isView &&                                    
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
                    </ Grid> }
                    </MyContainer>
        </>
    );
};
