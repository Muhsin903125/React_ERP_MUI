import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

// @mui
import {
    Stack,
    Button,
    Typography,
    Container,
    Box,
} from '@mui/material';
import MaterialReactTable from 'material-react-table';
import moment from 'moment';
import { GetSingleListResult    } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import Iconify from '../../../../components/iconify';



const columns = [
    {
        accessorKey: 'RpNo',
        header: 'Code',
        enableEditing: false,
        size: 0
    },
    {
        accessorKey: 'RpDate',
        header: 'Date',
        cell: info => {
            const rawDate = info.getValue();
            if (!rawDate) return '';
            const date = new Date(rawDate);
            return date.toLocaleString();
        },
        enableEditing: false,
    },


    {
        accessorKey: 'Account1Name',
        header: 'Payer',
    }, 
    {
        accessorKey: 'Account2Name',
        header: 'Deposit To',
    }, 
    {
        accessorKey: 'PaymentMode',
        header: 'Payment Mode',
    }, 
    {
        accessorKey: 'Amount',
        header: 'Amount',
        enableEditing: false,
    }
];


export default function Reciept() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [Reciept, setReciept] = useState([]);
    const [validationErrors, setValidationErrors] = useState({}); 

    useEffect(() => {

        async function fetchList() {

            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetSingleListResult({
                    "key": "RV_CRUD",
                    "TYPE": "GET_ALL",
                })
                if (Success) {
                    setReciept(Data)
                    //  showToast(Message, 'success');
                }
                else {
                    showToast(Message, "error");
                }
            }
            finally {
                setLoadingFull(false);
            }
        }
        fetchList();

    }, [])

 
 
    const handleView = (rowData) => {
        navigate(`/receipt-entry/${rowData.RpNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Sale Invoice </title>
            </Helmet>
            <Box component="main" sx={{ m: 1, p: 1 }}>

                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Reciept List
                    </Typography> 
                    <Link to="/receipt-entry" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
                            New Reciept Entry 
                        </Button>
                    </Link>
                </Stack>

                <MaterialReactTable
                    columns={columns}
                    data={Reciept}
                    initialState={{
                        density: 'compact',
                        expanded: true,
                    }}
                    enableColumnOrdering
                    enableGrouping 
                    
                    enableRowActions
                    // 👇 Add this
                    renderRowActions={({ row }) => (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="text"
                                onClick={() => handleView(row.original)}
                                color="primary"
                                title="View/Edit Reciept"
                            >
                                <Iconify icon="mdi:eye" />
                            </Button>
                        </Stack>
                    )}
                />
            </Box>
        </>
    )
} 
