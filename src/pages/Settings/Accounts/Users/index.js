
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
  CircularProgress
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Iconify from '../../../../components/iconify/Iconify'; 
import {   GetSingleListResult, GetSingleResult,  } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
import ModalForm from './ModalForm'; 

export default function Users() {
  const columns = [

    {
      accessorKey: 'USR_FNAME', //  access nested data with dot notation
      header: 'First Name',
        // size:"100"
    },
    {
      accessorKey: 'USR_FNAME',
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
      // accessorKey: '', //  normal accessorKey
      header: 'Status',
      Cell: ({ row }) => (

           row.original.USR_IS_ACTIVE ?  
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
            <IconButton onClick={() => handleDelete(row.original.USR_CODE)}>
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
        "key": "USR_CRUD",
        "TYPE": "GET_ALL",
      })
      if (Success) {
        setData(Data) // Updated to setData(Data) instead of setData(Data[0])
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
          "key": "USR_CRUD",
          "TYPE": "DELETE",
          "USR_CODE": id
        })
        // const { Success, Data, Message } = await deleteRole(id)
        if (Success) {
          fetchList();
          showToast('User deleted !', 'success');
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
      <title> Supplier </title>
    </Helmet> 
      <Card>
        <Stack m={5} >
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
            User
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
          <ModalForm open={showModal} initialValues={editData} onClose={() => closeModal()} />
        </Stack>
        </Card> 
  </>

}
