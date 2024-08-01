
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
import {   PostMultiSp } from '../../../hooks/Api';
import { useToast } from '../../../hooks/Common';
import DataTable from '../../../components/DataTable';
import Confirm from '../../../components/Confirm';

export default function UnitList() {
  const columns = [

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
      size: 0
    },

    {
      accessorKey: 'UM_CODE', //  access nested data with dot notation
      header: 'Code',
      size: 0
    },
    {
      accessorKey: 'UM_DESC',
      header: 'Descrption',
    },
    {
      accessorKey: 'UM_DECIMAL',
      header: 'Unit',
    },
    
    // {
    //   accessorKey: 'normalizedName',
    //   header: 'Description',
    // },

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
      const { Success, Data, Message } = await PostMultiSp({
       "key": "UNIT_LIST"
      })
      if (Success) {
        setData(Data[0])
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
        const { Success, Data, Message } = await PostMultiSp({
           "key": "CUSTOMER_LIST"
        })
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
  function handleEdit(units) {
    navigate('/unit', { state: { unit: units } })
  }

  return <>
    <Helmet>
      <title> Product List </title>
    </Helmet>

    <Stack m={5} >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Unit List
        </Typography>
        <Link to={{ pathname: '/unit', }} style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Unit
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
