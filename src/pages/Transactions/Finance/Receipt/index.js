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


export default function Receipt() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [receipt, setReceipt] = useState([]);
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
                    setReceipt(Data)
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
                <title>Receipt</title>
            </Helmet>

            <PageHeader
                title="Receipt List"
                actions={[
                    {
                        label: 'New Receipt Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/receipt-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main"  >
                <MaterialReactTable
                    columns={columns}
                    data={receipt}
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
                                title="View/Edit Receipt"
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
