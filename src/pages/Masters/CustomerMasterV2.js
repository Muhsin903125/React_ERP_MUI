import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'

import { Link } from 'react-router-dom';

// @mui
import {

  Stack,
  Button,
  Container,
  Typography,
} from '@mui/material';
import MaterialReactTable from 'material-react-table';
import { PostCommonSp, PostMultiSp } from '../../hooks/Api';
import Iconify from '../../components/iconify/Iconify';
import { useToast } from '../../hooks/Common';
import { AuthContext } from '../../App';



const columns = [
  {
    accessorKey: 'CUS_DOCNO',
    header: 'Code',
    enableEditing: false,
    size: 0
  },
  {
    accessorKey: 'CUS_DESC',
    header: 'Customer',
  },
  {
    accessorKey: 'CUS_ADDRESS', //  normal accessorKey
    header: 'Address',
  },
  {
    accessorKey: 'CUS_TRN',
    header: 'TRN No',
  },
  {
    accessorKey: 'CUS_MOB',
    header: 'Phone',
  },
  {
    accessorKey: 'CUS_CREATED_BY',
    header: 'Created By',
    enableEditing: false,
  },
  {

    accessorKey: 'CUS_CREATED_TS',
    header: 'Created TS',
    enableEditing: false,
  },
];


export default function CustomerMasterV2() {
  const { setLoadingFull } = useContext(AuthContext);
  const { showToast } = useToast();
  const [customerMaster, setcustomerMaster] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});



  useEffect(() => {

    async function fetchCustomerList() {

      try {
        setLoadingFull(false);
        const { Success, Data, Message } = await PostMultiSp({
          "key": "string",
          "userId": "string",
          "json": JSON.stringify({
            "json": [],
            "key": "CUSTOMER_LIST"
          }),
          "controller": "string"
        })
        if (Success) {
          setcustomerMaster(Data[0])
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

    fetchCustomerList();

    },[])
  

  // for edit Save
  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    if (!Object.keys(validationErrors).length) {
      customerMaster[row.index] = values;
      // send/receive api updates here, then refetch or update local table data for re-render
      const response = await PostCommonSp({
        "key": "string",
        "userId": "string",
        "json": JSON.stringify({
          "json": values,
          "key": "CUSTOMER_EDIT"
        }),
        "controller": "string"
      })
      if (response.Success) {
        setcustomerMaster([...customerMaster]);
        exitEditingMode(); // required to exit editing mode and close modal
      }
      else {
        showToast(response.Message, "error");
      }
    }
  };

  // for cancel edit
  const handleCancelRowEdits = () => {
    setValidationErrors({});
  };

  return (
    <>
      <Helmet>
        <title> Customer Master List </title>
      </Helmet>

      <Container maxWidth={"xl"}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Customer List
          </Typography>
          <Link to="/customermaster" style={{ textDecoration: 'none' }}>
            <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
              New Customer
            </Button>
          </Link>
        </Stack>
        <MaterialReactTable
          columns={columns}
          data={customerMaster}
          initialState={{ density: 'compact' }}
          editingMode="modal" //  default
          enableColumnOrdering
          enableEditing
          onEditingRowSave={handleSaveRowEdits}
          onEditingRowCancel={handleCancelRowEdits}
        />
      </Container>
    </>
  )
} 
