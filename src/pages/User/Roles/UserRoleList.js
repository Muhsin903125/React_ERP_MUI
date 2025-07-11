
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
  Container,Card,
  CircularProgress,
  Chip
} from '@mui/material';

import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Iconify from '../../../components/iconify/Iconify';
import { AuthContext } from '../../../App';
import { deleteRole, GetRoleList, GetSingleListResult, GetSingleResult, PostCommonSp, saveRole } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';
import DataTable from '../../../components/DataTable';
import Confirm from '../../../components/Confirm';
import ModalForm from './ModalForm'; 

export default function UserRoleList() {
  const columns = [

    {
      accessorKey: 'R_CODE', //  access nested data with dot notation
      header: 'Code',
      // size:"300"
    },
    {
      accessorKey: 'R_NAME',
      header: 'Name',
    },
    {
      // accessorKey: '', //  normal accessorKey
      header: 'Status',
      Cell: ({ row }) => (

           row.original.R_IS_ACTIVE ?  
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
            <IconButton onClick={() => handleDelete(row.original.R_CODE)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>

        </div>
      ),
      //  size:200
    },
  ];
 
  const { showToast } = useToast();
  const [data, setData] = useState(null)
  const [editData, setEditData] = useState(null)
  const [loader, setLoader] = useState(true);
  const [showModal, SetShowModal] = useState(false)
  useEffect(() => {

    fetchList();

  }, [])

  async function fetchList() {
    setLoader(true);
    try { 
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "ROLE_CRUD",
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
  }

  const handleDelete = async (id) => {
    Confirm('Are you sure to Delete?').then(async () => {
      try {
        setLoader(true);
        const { Success, Data, Message } = await GetSingleResult({
          "key": "ROLE_CRUD",
          "TYPE": "DELETE",
          "R_CODE": id
        })
        // const { Success, Data, Message } = await deleteRole(id)
        if (Success) {
          fetchList();
          showToast('Role deleted !', 'success');
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
  function closeModal() {
    SetShowModal(false);
    setEditData(null);
    fetchList();
  }
  function handleEdit(users) {
    SetShowModal(true);
    setEditData(users)
  }

  function handleNew() {
    SetShowModal(true);
    setEditData(null)
  }

  return <>
    <Helmet>
      <title> User Roles </title>
    </Helmet> 
      <Card>
        <Stack m={5} >
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              User Roles
            </Typography>

            <Button variant="contained"
              onClick={() => handleNew()}
              startIcon={<Iconify icon="eva:plus-fill" />}>
              New Role
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
          <ModalForm open={showModal} initialValues={editData} onClose={() => closeModal()} />
        </Stack>
        </Card> 
  </>

}
