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
        accessorKey: 'DnNo',
        header: 'Code',
        enableEditing: false,
        size: 0
    },
    {
        accessorKey: 'DnDate',
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
        accessorKey: 'SupplierDisplay',
        header: 'Supplier',
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


export default function DebitNote() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [DebitNote, setDebitNote] = useState([]);
    const [validationErrors, setValidationErrors] = useState({}); 

    useEffect(() => {

        async function fetchList() {

            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetSingleListResult({
                    "key": "DN_CRUD",
                    "TYPE": "GET_ALL",
                })
                if (Success) {
                    setDebitNote(Data)
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
        navigate(`/debitnote-entry/${rowData.DnNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Purchase Debit Note </title>
            </Helmet>
            <Box component="main" sx={{ m: 1, p: 1 }}>

                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Debit Note List
                    </Typography>
                    <Link to="/purchase" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
                            New Debit Note Entry
                        </Button>
                    </Link>
                </Stack>

                <MaterialReactTable
                    columns={columns}
                    data={DebitNote}
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
                                title="View/Edit Debit Note"
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
