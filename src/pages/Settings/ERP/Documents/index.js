
import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom';

// @mui
import {
    Stack,
    Button,
    Typography,
    IconButton,
    Tooltip,
    Box,
    Card,
    CircularProgress,
    Chip,
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Iconify from '../../../../components/iconify/Iconify';
import { AuthContext } from '../../../../App';
import { deleteRole, GetRoleList, GetSingleListResult, GetSingleResult, PostCommonSp, saveRole } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
import ModalForm from './ModalForm';

export default function Documents() {
    //     DM_CODE,
    // DM_DESC,
    // DM_ACCOUNT_IMPACT,
    // DM_STOCK_IMPACT,
    // DM_DEBIT_ACCOUNT,
    // DM_CREDIT_ACCOUNT,
    // DM_TAX_TREATMENT these are the fields
    const columns = [

        {
            accessorKey: 'DM_CODE', //  access nested data with dot notation
            header: 'Doc type',
            // size:"300"
        },
        {
            accessorKey: 'DM_DESC',
            header: 'Description',
        },
        {
            accessorKey: 'DM_ACCOUNT_IMPACT',
            header: 'Account Impact',
            Cell: ({ row }) => (
                <div>
                    {row.original.DM_ACCOUNT_IMPACT === 1 ? 'Yes' : 'No'}
                </div>
            ),
        },
        {
            accessorKey: 'DM_STOCK_IMPACT',
            header: 'Stock Impact',
            Cell: ({ row }) => (
                <div>
                    {row.original.DM_STOCK_IMPACT === 1 ? 'Yes' : 'No'}
                </div>
            ),
        },

        {
            accessorKey: 'DM_TAX_TREATMENT',
            header: 'Tax Treatment',
            Cell: ({ row }) => (
                <div>
                    {row.original.DM_TAX_TREATMENT === 1 ? 'Debit' : 'Credit'}
                </div>
            ),
        },



        {
            header: 'Acitons',
            Cell: ({ row }) => (
                <div>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(row.original)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(row.original.DM_CODE)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>

                </div>
            ),
            size: 100
        }
    ];


    const { showToast } = useToast();
    const [data, setData] = useState(null);
    const [editData, setEditData] = useState(null);
    const [showModal, SetShowModal] = useState(false);
    const [loader, setLoader] = useState(true);
    useEffect(() => {
        fetchList();
    }, [])

    const handleDelete = async (code) => {
        Confirm('Are you sure you want to delete this document?').then(async () => {
            try {
                const { Success, Message } = await GetSingleResult({
                    key: "DOC_CRUD",
                    TYPE: "DELETE",
                    DM_CODE: code
                });

                if (Success) {
                    showToast("Document deleted successfully", "success");
                    fetchList();
                }
                else {
                    showToast(Message, "error");
                }
            }
            catch (error) {
                showToast(error.message, "error");
            }
        });
    }

    async function fetchList() {
        try {
            setLoader(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "DOC_CRUD",
                "TYPE": "GET_ALL",
            })

            if (Success) {
                setData(Data)
            }
            else {
                showToast(Message, "error");
            }
        }
        finally {
            setLoader(false);
        }
        console.log("looder", loader);
        console.log("dataaa--", data);
    }


    function handleEdit(data) {
        SetShowModal(true);
        setEditData(data)
    }
    function closeModal() {
        SetShowModal(false);
        setEditData(null);
        fetchList();
    }

    function handleNew() {
        setEditData(null);
        SetShowModal(true);
    }

    return <>
        <Helmet>
            <title> Documents </title>
        </Helmet>
        <Card>
            <Stack m={5} >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Documents
                    </Typography>

                    <Button variant="contained"
                        onClick={() => handleNew()}
                        startIcon={<Iconify icon="eva:plus-fill" />}>
                        New
                    </Button>
                </Stack>

                {
                    (!loader && data) ? <DataTable
                        columns={columns}
                        data={data}
                        // enableRowSelection 
                        // enableGrouping
                        enableExport={false}

                    /> : <CircularProgress color="inherit" />
                }
                <ModalForm open={showModal} initialValues={editData} onClose={() => { closeModal() }} />
            </Stack>
        </Card>
    </>

}
