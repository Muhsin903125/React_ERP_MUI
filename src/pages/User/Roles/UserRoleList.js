
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
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Iconify from '../../../components/iconify/Iconify';
import { AuthContext } from '../../../App';
import { deleteRole, GetRoleList, PostCommonSp, saveRole } from '../../../hooks/Api';
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

  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast();
  const [data, setData] = useState(null)
  const [editData, setEditData] = useState(null)

  const [showModal, SetShowModal] = useState(false)
  useEffect(() => {

    fetchList();

  }, [])

  async function fetchList() {
    setLoadingFull(true);
    try {
      setLoadingFull(false);
      const { Success, Data, Message } = await PostCommonSp({
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
      setLoadingFull(false);
    }
  }

  const handleDelete = async (id) => {
    Confirm('Are you sure to Delete?').then(async () => {
      try {
        setLoadingFull(true);
        const { Success, Data, Message } = await PostCommonSp({
          "key": "ROLE_CRUD",
          "TYPE": "DELETE",
          "R_CODE": id
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
        setLoadingFull(false);
      }
    });
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

      {data && <DataTable
        columns={columns}
        data={data}
        // enableRowSelection 
        // enableGrouping
        enableExport={false}

      />}
      <ModalForm open={showModal} initialValues={editData} onClose={() => SetShowModal(false)} />
    </Stack>

  </>

}
