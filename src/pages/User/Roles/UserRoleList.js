
import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'

import { Link } from 'react-router-dom';

// @mui
import {
  Stack,
  Button,
  Typography,
} from '@mui/material';

import Iconify from '../../../components/iconify/Iconify';
import { AuthContext } from '../../../App';
import { deleteRole, GetRoleList, saveRole } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';
import DataTable from '../../../components/DataTable';


const columns = [
  {
    accessorKey: 'name', //  access nested data with dot notation
    header: 'Name',
    // size:500
  },
  {
    accessorKey: 'normalizedName',
    header: 'Description',
  }
];



export default function UserRoleList() {
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
        console.log("rrr", Data);
        setData(Data)
        //  showToast(Message, 'success');
      }
      else {
        showToast(Message, "error");
      }
    }
    finally {
      setLoadingFull(false);
    }
  }
  
  async function onDelete(id) {
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
  
  return <>
    <Helmet>
      <title> User Role List </title>
    </Helmet>

    <Stack m={5} >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Roles List
        </Typography>
        <Link to={{ pathname: '/userrole', props: { user: null,  onDelete } }} style={{ textDecoration: 'none' }}>
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
