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
import PageHeader from '../../../../components/PageHeader';



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
        header: 'Paid To',
    }, 
    {
        accessorKey: 'Account2Name',
        header: 'Paid From',
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


export default function Payment() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [payment, setPayment] = useState([]);
    const [validationErrors, setValidationErrors] = useState({}); 

    useEffect(() => {
        async function fetchList() {
            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetSingleListResult({
                    "key": "PV_CRUD",
                    "TYPE": "GET_ALL",
                })
                if (Success) {
                    setPayment(Data);
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
        navigate(`/payment-entry/${rowData.RpNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Payment</title>
            </Helmet>

            <PageHeader
                title="Payment List"
                actions={[
                    {
                        label: 'New Payment Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/payment-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main"  >
                <MaterialReactTable
                    columns={columns}
                    data={payment}
                    initialState={{
                        density: 'compact',
                        expanded: true,
                    }}
                    enableColumnOrdering
                    enableGrouping 
                    enableRowActions
                    renderRowActions={({ row }) => (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="text"
                                onClick={() => handleView(row.original)}
                                color="primary"
                                title="View/Edit Payment"
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
