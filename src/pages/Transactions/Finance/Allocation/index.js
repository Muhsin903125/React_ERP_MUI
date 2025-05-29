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
        accessorKey: 'AlNo',
        header: 'Code',
        enableEditing: false,
        size: 0
    },
    {
        accessorKey: 'AlDate',
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
        accessorKey: 'DocCode',
        header: 'Document Code',
    }, 
    {
        accessorKey: 'DocName',
        header: 'Document Name',
    },  
    {
        accessorKey: 'Amount',
        header: 'Amount',
        enableEditing: false,
    }
];


export default function Allocation() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [allocation, setAllocation] = useState([]);
    const [validationErrors, setValidationErrors] = useState({}); 

    useEffect(() => {
        async function fetchList() {
            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetSingleListResult({
                    "key": "ALLOC_CRUD",
                    "TYPE": "GET_ALL",
                })
                if (Success) {
                    setAllocation(Data)
                }
                else { 
                    showToast(Message, "error"  );
                }
            } 
            finally {
                setLoadingFull(false);
            }
        }
        fetchList();
    }, [])
 
    const handleView = (rowData) => {
        navigate(`/allocation-entry/${rowData.AlNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Allocation</title>
            </Helmet>

            <PageHeader
                title="Allocation List"
                actions={[
                    {
                        label: 'New Allocation Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/allocation-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main" sx={{ m: 1, p: 1 }}>
                <MaterialReactTable
                    columns={columns}
                    data={allocation}
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
                                title="View/Edit Allocation"
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
