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
        accessorKey: 'CnNo',
        header: 'Code',
        enableEditing: false,
        size: 0
    },
    {
        accessorKey: 'CnDate',
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
        accessorKey: 'CustomerDisplay',
        header: 'Customer',
    },
    {
        accessorKey: 'InvNo',
        header: 'Invoice No',
    }, 
    {
        accessorKey: 'PaymentMode',
        header: 'Payment Mode',
    }, 
    {

        accessorKey: 'GrossAmount',
        header: 'Gross Amount',
        enableEditing: false,
    },
    {
        accessorKey: 'NetAmount',
        header: 'Net Amount',
        enableEditing: false,
    },
];


export default function CreditNote() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [CreditNote, setCreditNote] = useState([]);
    const [validationErrors, setValidationErrors] = useState({}); 

    useEffect(() => {

        async function fetchList() {

            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetSingleListResult({
                    "key": "CN_CRUD",
                    "TYPE": "GET_ALL",
                })
                if (Success) {
                    setCreditNote(Data)
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
        navigate(`/creditnote-entry/${rowData.CnNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Credit Note </title>
            </Helmet>

            <PageHeader
                title="Credit Note List"
                actions={[
                    {
                        label: 'New Credit Note Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/creditnote-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main"  >
                <MaterialReactTable
                    columns={columns}
                    data={CreditNote}
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
                                title="View/Edit Credit Note"
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
