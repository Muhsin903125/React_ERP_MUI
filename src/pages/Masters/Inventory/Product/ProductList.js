
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
import Iconify from '../../../../components/iconify/Iconify';
import { AuthContext } from '../../../../App';
import { deleteRole, GetRoleList, GetSingleListResult, PostMultiSp, saveRole } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';

export default function ProductList() {
  const columns = [

    {
      header: 'Acitons',
      Cell: ({ row }) => (
        <div>
          <Tooltip title="Edit">
            <IconButton onClick={() => handleEdit(row.original.IM_CODE)}>
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
      size: 0,
      excelColumnDisable: true
    },

    {
      accessorKey: 'IM_CODE', //  access nested data with dot notation
      header: 'Code',
      size: 0
    },
    {
      accessorKey: 'IM_DESC',
      header: 'Descrption',
    },
    {
      accessorKey: 'IM_UNIT_CODE',
      header: 'Unit',
    },
    {
      accessorKey: 'IM_PRICE',
      header: 'Price',
    },
    {
      accessorKey: 'IM_CREATED_BY',
      header: 'Created By',
    },
    {
      accessorKey: 'IM_CREATED_TS',
      header: 'Created TS',
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
      const { Success, Data, Message } = await GetSingleListResult({
         "key": "PRODUCT_LIST"
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
        const { Success, Data, Message } = await GetSingleListResult({
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
  function handleEdit(products) {
    navigate('/product', { state: { product: products } })
  }

  return <>
    <Helmet>
      <title> Product List </title>
    </Helmet>

    <Stack m={5} >
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Product List
        </Typography>
        <Link to={{ pathname: '/product', }} style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Product
          </Button>
        </Link>
      </Stack>

      {data && <DataTable
        columns={columns}
        data={data}
        // enableRowSelection 
        // enableGrouping
        enableExport
        fileTitle="ProductList" // name of exl file
      />}
    </Stack>

  </>

}
