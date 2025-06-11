
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
import { deleteRole, GetRoleList, GetSingleListResult, GetSingleResult, PostCommonSp, PostMultiSp, saveRole } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
// import ModalForm from './ModalForm';
import ScreenOptions from './ScreenOptions';

export default function Permissions() {
    const columns = [

        {
            accessorKey: 'MENU_NAME', //  access nested data with dot notation
            header: 'Menu Name',
           
        },
        {
            accessorKey: 'MENU_URL',
            header: 'url',  
        },
        {
            accessorKey: 'MENU_ACTION_TYPE',
            header: 'Type', 
        },
        {
            accessorKey: 'PARENT_NAME',
            header: 'Parent',
        },
       
        {
            // accessorKey: '', //  normal accessorKey
            header: 'Active',
            Cell: ({ row }) => (
      
                 row.original.MENU_IS_ACTIVE ?  
                <div>
                  <Tooltip title="Active">
                  <Chip icon={<CheckIcon />}  color="success" size='small' label="Active" />
                  </Tooltip> 
                </div>
                :
                <div>
                  <Tooltip title="Blocked">
                  <Chip icon={<BlockIcon />}  color="error" size='small' label="Blocked" />
                  </Tooltip> 
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
                        <IconButton onClick={() => handleDelete(row.original.MENU_CODE)}>
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

    const permissionsOptions = [
        { screen: 'Screen 1', isDelete: true, isUpdate: true, isCreate: true, isView: true },
        { screen: 'Screen 2', isDelete: true, isUpdate: false, isCreate: false, isView: true },
        { screen: 'Screen 3', isDelete: false, isUpdate: true, isCreate: false, isView: false },
    ];

    const [permissions, setPermissions] = useState([]);

    useEffect(() => {
        fetchList();
        const fetchPermissions = () => { 
            return permissionsOptions;
        };

        const initialPermissions = fetchPermissions();
        setPermissions(initialPermissions);
    }, [])
    async function fetchList() {
        try {
            setLoader(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "MENU_CRUD",
                "TYPE": "GET_ALL",
            })

            if (Success) {
                setData(Data) // Update to setData(Data) instead of setData(Data[0])
            }
            else {
                showToast(Message, "error");
            }
        }
        finally {
            setLoader(false);
        }
        console.log("looder", loader); 
    }


    const handleDelete = async (id) => {
        Confirm('Are you sure to Delete?').then(async () => {
          try {
            setLoader(true);
            const { Success, Data, Message } = await GetSingleResult({
              "key": "MENU_CRUD",
              "TYPE": "DELETE",
              "MENU_CODE": id
            })
            // const { Success, Data, Message } = await deleteRole(id)
            if (Success) {
              fetchList();
              showToast('Menu deleted !', 'success');
            }
            else {
              showToast(Message, "error");
            }
          }
          finally {
            setLoader(false);
          }
        });
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
            <title> Screens </title>
        </Helmet>
        <Card>
            <Stack m={5} >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Screens
                    </Typography>

                    <Button variant="contained"
                        onClick={() => handleNew()}
                        startIcon={<Iconify icon="eva:plus-fill" />}>
                        New
                    </Button>
                </Stack>

                {/* {
                    (!loader && data) ? <DataTable
                        columns={columns}
                        data={data}
                        // enableRowSelection 
                        // enableGrouping
                        enableExport={false}

                    /> : <CircularProgress color="inherit" />
                }
                <ModalForm open={showModal} initialValues={editData} onClose={() => { closeModal() }} /> */}
           <ScreenOptions permissions={permissions} setPermissions={setPermissions}/>
            </Stack>
        </Card>
    </>

}
