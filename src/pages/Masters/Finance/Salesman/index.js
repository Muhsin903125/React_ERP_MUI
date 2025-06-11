
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
import { deleteRole, GetRoleList, GetSingleListResult, GetSingleResult,  saveRole } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
import PageHeader from '../../../../components/PageHeader';
import ModalForm from './ModalForm';

export default function Salesman() {
  const columns = [

    {
      accessorKey: 'SMAN_DOCNO', //  access nested data with dot notation
      header: 'Code',
      // size:"300"
    },
    {
      accessorKey: 'SMAN_DESC',
      header: 'Desc',
    }, 
      {
      accessorKey: 'SMAN_EMAIL',
      header: 'Email',
    }, 
    {
        accessorKey: 'SMAN_MOB',
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
            <IconButton onClick={() => handleDelete(row.original.SMAN_DOCNO)}>
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
        "key": "SMAN_CRUD",
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
          "key": "SMAN_CRUD",
          "TYPE": "DELETE",
          "SMAN_DOCNO": id
        })
        // const { Success, Data, Message } = await deleteRole(id)
        if (Success) {
          fetchList();
          showToast('Salesman deleted !', 'success');
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
      <title> Salesman </title>
    </Helmet>      <Card>
        <Stack m={5} >
          <PageHeader 
            title="Salesman"
            actions={[
              {
                label: 'New Salesman',
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
