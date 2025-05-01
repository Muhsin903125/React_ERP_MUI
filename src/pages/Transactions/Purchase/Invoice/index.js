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
import { GetSingleListResult, PostCommonSp, PostMultiSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import Iconify from '../../../../components/iconify';

const columns = [
    {
        accessorKey: 'InvNo',
        header: 'Code',
        enableEditing: false,
        size: 0
    },
    {
        accessorKey: 'InvDate',
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
        accessorKey: 'LPONo',
        header: 'LPO No',
    },
    {
        accessorKey: 'TRN',
        header: 'TRN',
    },
    {
        accessorKey: 'PaymentMode',
        header: 'Payment Mode',
    },
    {
        accessorKey: 'Status',
        header: 'Status',
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

export default function PurchaseInvoice() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [PurchaseInvoice, setPurchaseInvoice] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        async function fetchList() {
            try {
                setLoadingFull(true);
                const { Success, Data, Message } = await GetSingleListResult({
                    key: "PURCHASE_INV_CRUD",
                    TYPE: "GET_ALL",
                })
                if (Success) {
                    setPurchaseInvoice(Data)
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

    // for edit Save
    const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
        if (!Object.keys(validationErrors).length) {
            PurchaseInvoice[row.index] = values;
            const response = await PostCommonSp({
                json: values,
                key: "PURCHASE_INV_EDIT"
            })
            if (response.Success) {
                setPurchaseInvoice([...PurchaseInvoice]);
                exitEditingMode();
            }
            else {
                showToast(response.Message, "error");
            }
        }
    };

    // for cancel edit
    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    const handleView = (rowData) => {
        navigate(`/purchase-entry/${rowData.InvNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Purchase Invoice</title>
            </Helmet>
            <Box component="main" sx={{ m: 1, p: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Purchase Invoice List
                    </Typography>
                    <Link to="/purchase-entry" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
                            New Purchase Invoice Entry
                        </Button>
                    </Link>
                </Stack>

                <MaterialReactTable
                    columns={columns}
                    data={PurchaseInvoice}
                    initialState={{
                        density: 'compact',
                        expanded: true,
                    }}
                    enableColumnOrdering
                    enableGrouping
                    onEditingRowSave={handleSaveRowEdits}
                    onEditingRowCancel={handleCancelRowEdits}
                    enableRowActions
                    renderRowActions={({ row }) => (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="text"
                                onClick={() => handleView(row.original)}
                                color="primary"
                                title="View/Edit Invoice"
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
