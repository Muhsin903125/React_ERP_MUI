import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom';

// @mui
import {
    Stack,
    Button,
    Typography,
    Tooltip,
    IconButton,
    Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; 
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import DeleteIcon from '@mui/icons-material/Delete';
import Iconify from '../../components/iconify/Iconify'; 
import { AuthContext } from '../../App';
import { GetSingleListResult, PostCommonSp } from '../../hooks/Api';
import { useToast } from '../../hooks/Common';
import DataTable from '../../components/DataTable';
import Confirm from '../../components/Confirm';

export default function UserList() {
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        fetchList();
    }, []);

    async function fetchList() {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetSingleListResult({
                key: "USR_CRUD", 
                TYPE: "GET_ALL",
            });
            if (Success) {
                setData(Data);
            }
            else {
                showToast(Message, "error");
            }
        }
        finally {
            setLoadingFull(false);
        }
    }

    async function handleDelete(user) {
        Confirm('Are you sure you want to delete this user?').then(async () => {
            try {
                setLoadingFull(true);
                const { Success, Message } = await GetSingleListResult({
                    key: "USR_CRUD", 
                    TYPE: "DELETE",
                    USR_CODE: user.USR_CODE 
                });
                
                if (Success) {
                    showToast('User deleted successfully' , 'success');
                    fetchList();
                } else {
                    showToast(Message || 'Failed to delete user', "error");
                }
            } catch (error) {
                showToast('An error occurred while deleting the user', "error");
            } finally {
                setLoadingFull(false);
            }
        });
    }

    function handleEdit(user) { 
        navigate('/registeruser', { 
            state: { 
                user: {
                    id: user.USR_CODE,
                    firstName: user.USR_FNAME,
                    lastName: user.USR_LNAME,
                    email: user.USR_EMAIL,
                    mobileNumber: user.USR_MOBILE,
                    isActive: user.USR_IS_ACTIVE
                } 
            } 
        });
    }

    const columns = [
        {
            accessorKey: 'USR_FNAME',
            header: 'First Name',
        },
        {
            accessorKey: 'USR_LNAME',
            header: 'Last Name',
        },
        {
            accessorKey: 'USR_EMAIL',
            header: 'Email',
        }, 
        {
            accessorKey: 'USR_MOBILE',
            header: 'Mobile',
        },
        {
            header: 'Status',
            Cell: ({ row }) => (
                row.original.USR_IS_ACTIVE ?  
                <div>
                    <Tooltip title="Active">
                        <Chip icon={<CheckIcon />} color="success" size='small' label="Active" />
                    </Tooltip> 
                </div>
                :
                <div>
                    <Tooltip title="Blocked">
                        <Chip icon={<BlockIcon />} color="error" size='small' label="Blocked" />
                    </Tooltip> 
                </div>
            ),
        },
        {
            header: 'Actions',
            Cell: ({ row }) => (
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(row.original)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(row.original)} color="error">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ];

    return (
        <>
            <Helmet>
                <title> Users List </title>
            </Helmet>

            <Stack m={5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Users List
                    </Typography>
                    <Link to="/registeruser" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
                            New User
                        </Button>
                    </Link>
                </Stack>

                {data && <DataTable
                    columns={columns}
                    data={data}
                    enableExport={false}
                />}
            </Stack>
        </>
    );
}
