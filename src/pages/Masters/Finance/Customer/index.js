
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
import { deleteRole, GetRoleList, PostCommonSp, saveRole } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
import ModalForm from './ModalForm'; 

export default function Customer() {
  const columns = [

    {
      accessorKey: 'CUS_DOCNO', //  access nested data with dot notation
      header: 'Code',
        size:"100"
    },
    {
      accessorKey: 'CUS_DESC',
      header: 'Desc',
    }, 
      {
      accessorKey: 'CUS_EMAIL',
      header: 'Email',
    }, 
    {
        accessorKey: 'CUS_TRN',
      header: 'TRN',
    }, 
     {
        accessorKey: 'CUS_MOB',
      header: 'Mobile',
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
            <IconButton onClick={() => handleDelete(row.original.CUS_DOCNO)}>
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
      const { Success, Data, Message } = await PostCommonSp({
        "key": "CUS_CRUD",
        "TYPE": "GET_ALL",
      })
      if (Success) {
        setData(Data[0])
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
        const { Success, Data, Message } = await PostCommonSp({
          "key": "CUS_CRUD",
          "TYPE": "DELETE",
          "CUS_DOCNO": id
        })
        // const { Success, Data, Message } = await deleteRole(id)
        if (Success) {
          fetchList();
          showToast(Message, 'success');
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
      <title> Customer </title>
    </Helmet> 
      <Card>
        <Stack m={5} >
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
            Customer
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
