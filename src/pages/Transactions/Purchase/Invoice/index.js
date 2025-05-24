import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import moment from 'moment';

// @mui
import {
    Stack,
    Button,
    Typography,
    Container,
    Box,
} from '@mui/material';
import MaterialReactTable from 'material-react-table';
import { GetSingleListResult, PostCommonSp, PostMultiSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import Iconify from '../../../../components/iconify';
import PageHeader from '../../../../components/PageHeader';

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
        cell: ({ row }) => {
            console.log("Row data:", row.original);
            const rawDate = row.original?.InvDate;
            console.log("Raw date:", rawDate);
            if (!rawDate) return '';
            const formattedDate = moment(rawDate).format('DD-MMM-YYYY hh:mm A');
            console.log("Formatted date:", formattedDate);
            return formattedDate;
        },
        enableEditing: false,
    },
    {
        accessorKey: 'SupplierDisplay',
        header: 'Supplier',
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
                    key: "PURCH_INV_CRUD",
                    TYPE: "GET_ALL",
                })
                if (Success) {
                    console.log("Purchase Invoice Data:", Data);
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
                key: "PURCH_INV_EDIT"
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

            <PageHeader
                title="Purchase Invoice List"
                actions={[
                    {
                        label: 'New Purchase Invoice Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/purchase-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main" sx={{ m: 1, p: 1 }}>
                <MaterialReactTable
                    columns={columns}
                    data={PurchaseInvoice}
                    initialState={{
                        density: 'compact',
                        expanded: true,
                        pagination: { pageSize: 20, pageIndex: 0 },
                    }}
                    enableColumnOrdering
                    enableGrouping
                    enablePagination
                    muiTableProps={{
                        sx: {
                            tableLayout: 'fixed'
                        }
                    }}
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
