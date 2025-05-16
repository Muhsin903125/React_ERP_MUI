import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Stack,
    Button,
    Typography,
    IconButton,
    Tooltip,
    Box,
    Card,
    CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Iconify from '../../../../components/iconify/Iconify';
import { AuthContext } from '../../../../App';
import { GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
import ModalForm from './ModalForm';

export default function Documents() {
    const { showToast } = useToast();
    const [data, setData] = useState(null);
    const [editData, setEditData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loader, setLoader] = useState(true);

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
                } else {
                    showToast(Message, "error");
                }
            } catch (error) {
                showToast(error.message, "error");
            }
        });
    };

    const handleEdit = (data) => {
        setShowModal(true);
        setEditData(data);
    };

    const columns = [
        {
            accessorKey: 'DM_CODE',
            header: 'Doc type',
        },
        {
            accessorKey: 'DM_DESC',
            header: 'Description',
        },
        {
            accessorKey: 'DM_ACCOUNT_IMPACT',
            header: 'Account Impact',
            Cell: ({ row }) => (
                <div>{row.original.DM_ACCOUNT_IMPACT === 1 ? 'Yes' : 'No'}</div>
            ),
        },
        {
            accessorKey: 'DM_STOCK_IMPACT',
            header: 'Stock Impact',
            Cell: ({ row }) => (
                <div>{row.original.DM_STOCK_IMPACT === 1 ? 'Yes' : 'No'}</div>
            ),
        },
        {
            accessorKey: 'DM_TAX_TREATMENT',
            header: 'Tax Treatment',
            Cell: ({ row }) => (
                <div>{row.original.DM_TAX_TREATMENT === 1 ? 'Debit' : 'Credit'}</div>
            ),
        },
        {
            header: 'Actions',
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

    useEffect(() => {
        fetchList();
    }, []);

    const fetchList = async () => {
        try {
            setLoader(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "DOC_CRUD",
                "TYPE": "GET_ALL",
            });

            if (Success) {
                setData(Data);
            } else {
                showToast(Message, "error");
            }
        } finally {
            setLoader(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditData(null);
        fetchList();
    };

    const handleNew = () => {
        setEditData(null);
        setShowModal(true);
    };

    return (
        <>
            <Helmet>
                <title>Documents</title>
            </Helmet>
            <Card>
                <Stack m={5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                        <Typography variant="h4" gutterBottom>
                            Documents
                        </Typography>
                        <Button 
                            variant="contained"
                            onClick={handleNew}
                            startIcon={<Iconify icon="eva:plus-fill" />}
                        >
                            New
                        </Button>
                    </Stack>

                    {(!loader && data) ? (
                        <DataTable
                            columns={columns}
                            data={data}
                            enableExport={false}
                        />
                    ) : (
                        <CircularProgress color="inherit" />
                    )}
                    
                    <ModalForm 
                        open={showModal} 
                        initialValues={editData} 
                        onClose={closeModal} 
                    />
                </Stack>
            </Card>
        </>
    );
}
