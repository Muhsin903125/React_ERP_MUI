
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

export default function UserRoleList() {
  const columns = [

    {
      accessorKey: 'R_CODE', //  access nested data with dot notation
      header: 'Id',
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
            <IconButton onClick={() => handleDelete(row.original.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>

        </div>
      ),
      //  size:200
    },
  ];

  const navigate = useNavigate();
  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast();
  const [data, setData] = useState(null)
  useEffect(() => {

    fetchList();

  }, [])

  async function fetchList() {
    setLoadingFull(true);
    try {
      setLoadingFull(false);
      const { Success, Data, Message } =   await PostCommonSp({
        "key": "ROLE_LIST",  
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
        const { Success, Data, Message } = await deleteRole(id)
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
    navigate('/userrole', { state: { user: users } })
  }

  return <>
    <Helmet>
      <title> User Role List </title>
    </Helmet>

    <Stack m={5} >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Roles List
        </Typography>
        <Link to={{ pathname: '/userrole', state: { user: null, handleDelete } }} style={{ textDecoration: 'none' }}>
          {/* <Link to={{ pathname: '/userrole',   }} style={{ textDecoration: 'none' }}>  */}
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Role
          </Button>
        </Link>
      </Stack>

      {data && <DataTable
        columns={columns}
        data={data}
        // enableRowSelection 
        // enableGrouping
        enableExport={false}

      />}
    </Stack>

  </>

}
