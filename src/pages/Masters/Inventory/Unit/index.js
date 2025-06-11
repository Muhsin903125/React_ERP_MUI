
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
  Container, Card,
  CircularProgress
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Iconify from '../../../../components/iconify/Iconify';
import {  GetSingleListResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
import PageHeader from '../../../../components/PageHeader';
import ModalForm from './ModalForm';

export default function Unit() {
  const columns = [

    {
      accessorKey: 'LK_KEY', //  access nested data with dot notation
      header: 'Key',
      size: "100"
    },
    {
      accessorKey: 'LK_VALUE',
      header: 'Value',
    },
    // {
    //   header: 'Acitons',
    //   Cell: ({ row }) => (
    //     <div>
    //       <Tooltip title="Edit">
    //         <IconButton onClick={() => handleEdit(row.original)}>
    //           <EditIcon />
    //         </IconButton>
    //       </Tooltip>
    //       <Tooltip title="Delete">
    //         <IconButton onClick={() => handleDelete(row.original.LK_CODE)}>
    //           <DeleteIcon />
    //         </IconButton>
    //       </Tooltip>

    //     </div>
    //   ),
    //   //  size:200
    // },
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
        key: 'LOOKUP',
        TYPE: 'UNITS',
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
      <title> Unit </title>
    </Helmet>
    <Card>
      <Stack m={5} >
        <PageHeader 
          title="Unit"
          actions={[
            {
              label: 'New Unit',
              icon: 'eva:plus-fill',
              variant: 'contained',
              color: 'primary',
              onClick: handleNew,
              show: true
            }
          ]}
        />

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
