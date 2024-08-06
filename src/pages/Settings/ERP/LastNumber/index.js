
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
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Iconify from '../../../../components/iconify/Iconify';
import { AuthContext } from '../../../../App';
import { deleteRole, GetRoleList, PostCommonSp, saveRole } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
import ModalForm from './ModalForm';

export default function LastNumber() {
    const columns = [

        {
            accessorKey: 'LASTNO_DOCTYPE', //  access nested data with dot notation
            header: 'Doc type',
            // size:"300"
        },
        {
            accessorKey: 'LASTNO_LASTNO',
            header: 'Last No',
        },
        {
            accessorKey: 'LASTNO_PREFIX',
            header: 'Prefix',
        },
        {
            accessorKey: 'LASTNO_LENGTH',
            header: 'Length',
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
                    {/* <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(row.original.R_CODE)}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip> */}

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

    async function fetchList() {
        try {
            setLoader(true);
            const { Success, Data, Message } = await PostCommonSp({
                "key": "LAST_NO_CRUD",
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
            <title> Last Numbers </title>
        </Helmet>
        <Card>
            <Stack m={5} >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Last Numbers
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
