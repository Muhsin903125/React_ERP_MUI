
import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'

import { Link } from 'react-router-dom';

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
import { deleteRole, GetRoleList, saveRole } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';
import DataTable from '../../../components/DataTable';
 
export default function UserRoleList() { 
  const columns = [
    {
      accessorKey: 'name', //  access nested data with dot notation
      header: 'Name',
       
      // size:500
    },
    {
      accessorKey: 'normalizedName',
      header: 'Description',
    },
    {
     // accessorKey: 'name', //  access nested data with dot notation
      header: 'Acitons',
      Cell: ({row}) => (
        <div>
           
          <button onClick={() => handleEdit(row)}>Edit</button>
          <button onClick={() => handleDelete(row.RoleId)}>Delete</button>
        </div>
      )
      // size:500
    },
    // {
    //   cellRenderer: ({ row }) => (
    //     <div>
    //       <button onClick={() => handleEdit(row)}>Edit</button>
    //       <button onClick={() => handleDelete(row)}>Delete</button>
    //     </div>
    //   ),
    //   header: 'Actions',
    // },
  ];

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
      const { Success, Data, Message } = await GetRoleList()
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

  async function handleDelete(id) {
    try {
      setLoadingFull(true);
      const { Success, Data, Message } = await deleteRole(id)
      if (Success) {
        console.log("rrr", Data);
        setData(Data)
        showToast(Message, 'success');
      }
      else {
        showToast(Message, "error");
      }
    }
    finally {
      setLoadingFull(false);
    }
  }
  function handleEdit(id, name) {
    // Navigate to edit page with the given id
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
        <Link to={{ pathname: '/userrole', props: { user: null, handleDelete } }} style={{ textDecoration: 'none' }}>
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
