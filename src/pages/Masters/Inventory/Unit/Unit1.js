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

import { AuthContext } from '../../../../App';
import { deleteRole, saveRole, UpdateRole } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import Confirm from '../../../../components/Confirm';
import MyContainer from '../../../../components/MyContainer';


const Unit1 = () => {

    const location = useLocation();
    const   unit  = location.state?.unit;
    const [code, setCode] = useState(unit && unit.UM_CODE || '');
    const [desc, setDesc] = useState(unit && unit.UM_DESC || '');
    const [deci, setDeci] = useState(unit && unit.UM_DECIMAL || '');

    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();


    const isEditing = Boolean(unit && unit.UM_CODE);

    const validate = () => {
        const errors = {};

        if (validator.isEmpty(code)) {
            errors.code = 'Code is required';
        }
        if (validator.isEmpty(desc)) {
            errors.desc = 'Description is required';
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
                    navigate('/unitlist')
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
                Deci: deci,
                id: unit?.id,
                isActive: true
            });
        }
    };
    const handleDelete = async () => {
        Confirm('Are you sure to Delete?').then(async () => {
            try {
                setLoadingFull(true);

                const { Success, Data, Message } = await deleteRole(unit?.id)
                if (Success) {
                    navigate('/unitlist')
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
                <title>Unit </title>
            </Helmet>

           
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                    <Typography variant="h4" gutterBottom>
                        {isEditing ? 'Edit Unit' : 'New Unit'}
                    </Typography>
                </Stack>
                <MyContainer    >

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
                        <Grid item xs={12} md={6} >
                            <TextField
                                label="No of Decimals"
                                variant="outlined"
                                fullWidth
                                size='small'
                                type='number'
                                margin="normal"
                                value={deci}
                                onChange={(e) => setDeci(e.target.value)}
                                inputProps={{ maxLength: 10 }}
                                error={errors.deci !== undefined}
                                helperText={errors.deci}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                    </Grid>



                    <Grid container spacing={1} p={3}
                        direction="row"
                        justifyContent="start"
                        alignItems="flex-end"
                    >
                        <Grid item md={2}  >
                            <LoadingButton size="medium" variant="contained" startIcon={<SaveIcon />} color="primary" fullWidth onClick={handleSave}>
                                {isEditing ? 'UPDATE' : 'SAVE'}
                            </LoadingButton>
                        </Grid>
                        <Grid item md={2}  >
                            {isEditing && (
                                <LoadingButton size="medium" variant="outlined" startIcon={<DeleteIcon />} color="error" fullWidth onClick={handleDelete}>
                                    DELETE
                                </LoadingButton>
                            )}
                        </Grid>
                    </ Grid>
            </MyContainer> 

        </>
    );
};

export default Unit1;    