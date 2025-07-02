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
        accessorKey: 'JvNo',
        header: 'Code',
        enableEditing: false,
        size: 0
    },
    {
        accessorKey: 'JvDate',
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
        accessorKey: 'RefNo',
        header: 'Reference No',
    }, 
    {
        accessorKey: 'RefDate',
        header: 'Reference Date',
    } 
     
];


export default function Journal() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [journal, setJournal] = useState([]);
    const [validationErrors, setValidationErrors] = useState({}); 

    useEffect(() => {
        async function fetchList() {
            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetSingleListResult({
                    "key": "JV_CRUD",
                    "TYPE": "GET_ALL",
                })
                if (Success) {
                    setJournal(Data)
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
        navigate(`/journal-entry/${rowData.JvNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Journal</title>
            </Helmet>

            <PageHeader
                title="Journal List"
                actions={[
                    {
                        label: 'New Journal Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/journal-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main"  >
                <MaterialReactTable
                    columns={columns}
                    data={journal}
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
                                title="View/Edit Journal"
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
