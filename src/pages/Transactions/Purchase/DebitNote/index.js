import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Stack,
    Button,
    Typography,
    Box,
} from '@mui/material';
import MaterialReactTable from 'material-react-table';
import { GetSingleListResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import Iconify from '../../../../components/iconify';
import PageHeader from '../../../../components/PageHeader';

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
            return new Date(rawDate).toLocaleString();
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
    const [debitNote, setDebitNote] = useState([]);

    useEffect(() => {
        const fetchList = async () => {
            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetSingleListResult({
                    "key": "DN_CRUD",
                    "TYPE": "GET_ALL",
                });
                
                if (Success) {
                    setDebitNote(Data);
                } else {
                    showToast(Message, "error");
                }
            } finally {
                setLoadingFull(false);
            }
        };

        fetchList();
    }, []);

    const handleView = (rowData) => {
        navigate(`/debitnote-entry/${rowData.DnNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Purchase Debit Note</title>
            </Helmet>

            <PageHeader
                title="Debit Note List"
                actions={[
                    {
                        label: 'New Debit Note Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/debitnote-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main" sx={{ m: 1, p: 1 }}>
                <MaterialReactTable
                    columns={columns}
                    data={debitNote}
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
                                title="View/Edit Debit Note"
                            >
                                <Iconify icon="mdi:eye" />
                            </Button>
                        </Stack>
                    )}
                />
            </Box>
        </>
    );
} 
