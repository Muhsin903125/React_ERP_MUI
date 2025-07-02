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


export default function SalesInvoice() {
    const navigate = useNavigate();
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [SalesInvoice, setSalesInvoice] = useState([]);
    const [validationErrors, setValidationErrors] = useState({}); 

    useEffect(() => {

        async function fetchList() {

            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetSingleListResult({
                    "key": "SALE_INV_CRUD",
                    "TYPE": "GET_ALL",
                })
                if (Success) {
                    setSalesInvoice(Data)
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


    // for edit Save
    const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
        if (!Object.keys(validationErrors).length) {
            SalesInvoice[row.index] = values;
            // send/receive api updates here, then refetch or update local table data for re-render
            const response = await PostCommonSp({
                "json": values,
                "key": "CUSTOMER_EDIT"
            })
            if (response.Success) {
                setSalesInvoice([...SalesInvoice]);
                exitEditingMode(); // required to exit editing mode and close modal
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
        navigate(`/sales-entry/${rowData.InvNo}`);
    };

    return (
        <>
            <Helmet>
                <title>Sale Invoice </title>
            </Helmet>

            <PageHeader
                title="Sale Invoice List"
                actions={[
                    {
                        label: 'New Sales Invoice Entry',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: () => navigate('/sales-entry'),
                        show: true,
                        showInActions: false,
                    },
                ]}
            />

            <Box component="main"  >
                <MaterialReactTable
                    columns={columns}
                    data={SalesInvoice}
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
