import { Helmet } from 'react-helmet-async';
import React, { useEffect, useState } from 'react'

import MaterialReactTable from 'material-react-table';
import { PostCommonSp, PostMultiSp } from  '../../hooks/Api';
import useAuth from '../../hooks/useAuth';



const columns =   [
  {
    accessorKey: 'CUS_DOCNO', 
    header: 'Code',
    enableEditing: false,
    size:30
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
]   ;
 

export default function CustomerMasterV2() { 
    const [customerMaster, setcustomerMaster] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});

   

    useEffect(() => {

      async function  fetchCustomerList() {

      
        const response = await PostMultiSp({
            "key": "string",
            "userId": "string",
            "json": JSON.stringify({ "json": [],
            "key":"CUSTOMER_LIST"
           }),
            "controller": "string"
          } ) //  JSON.stringify({ "json": items }));
        //   console.log(response)
        //   console.log(response.Data[0])
        //   console.log("Hi Test")
          setcustomerMaster(response.Data[0])
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
          "json": JSON.stringify({ "json": values,
          "key":"CUSTOMER_EDIT"
         }),
          "controller": "string"
        }) 
        console.log("Testing Customer V2");
        setcustomerMaster([...customerMaster]);
        exitEditingMode(); // required to exit editing mode and close modal
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

      <MaterialReactTable 
      columns={columns} 
      data={customerMaster}
      initialState={{ density: 'compact' }}
      editingMode="modal" //  default
      enableColumnOrdering
      enableEditing
      onEditingRowSave={handleSaveRowEdits}
      onEditingRowCancel={handleCancelRowEdits}
      // enableRowSelection 
    // enableGrouping
      // enableExport
      />;
    </>
    )
} 
