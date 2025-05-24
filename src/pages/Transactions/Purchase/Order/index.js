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
        accessorKey: 'OrderNo',
        header: 'Code',
        enableEditing: false,
        size: 0
    },
    {
        accessorKey: 'OrderDate',
        header: 'Date',
        cell: ({ row }) => {
            console.log("Row data:", row.original);
            const rawDate = row.original?.OrderDate;
            console.log("Raw date:", rawDate);
            if (!rawDate) return '';
            // Parse SQL datetime and format
            try {
                const formattedDate = moment(rawDate).format('DD-MMM-YYYY hh:mm A');
                console.log("Formatted date:", formattedDate);
                return formattedDate;
            } catch (error) {
                console.error("Date parsing error:", error);
                return rawDate;
            }
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
        accessorKey: 'OrderValidity',
        header: 'Validity',
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

export default function PurchaseOrder() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [PurchaseOrder, setPurchaseOrder] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        async function fetchList() {
            try {
                setLoadingFull(true);
                const { Success, Data, Message } = await GetSingleListResult({
                    key: "PURCH_ORD_CRUD",
                    TYPE: "GET_ALL",
                })
                if (Success) { 
                    setPurchaseOrder(Data)
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
  
 

    const handleView = (rowData) => {
        navigate(`/purchase-order-entry/${rowData.OrderNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Purchase Order</title>
            </Helmet>

            <PageHeader
                title="Purchase Order List"
                actions={[
                    {
                        label: 'New Purchase Order Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/purchase-order-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main" sx={{ m: 1, p: 1 }}>
                <MaterialReactTable
                    columns={columns}
                    data={PurchaseOrder}
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
                    enableRowActions
                    renderRowActions={({ row }) => (
                        <Stack direction="row" spacing={1}>
                            <Button
                                variant="text"
                                onClick={() => handleView(row.original)}
                                color="primary"
                                title="View/Edit Order"
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
