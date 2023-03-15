import React, { useEffect, useState } from 'react'
 
import DataTable from '../../components/DataTable';
import {  PostMultiSp } from  '../../hooks/Api';
import useAuth from '../../hooks/useAuth';



const columns =   [
  {
    accessorKey: 'CUS_DOCNO', //  access nested data with dot notation
    header: 'Code',
    // size:500
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
  },
  {
    accessorKey: 'CUS_CREATED_TS',
    header: 'Created TS',
  },
]   ;
 

export default function CustomerMasterV2() {
    const {userToken} =useAuth()
    const [customerMaster, setcustomerMaster] = useState([]);

    const dataArray = [];

    useEffect(async () => {
        const response = await PostMultiSp({
            "key": "string",
            "userId": "string",
            "json": JSON.stringify({ "json": dataArray,
            "key":"CUSTOMER_LIST"
           }),
            "controller": "string"
          },userToken) //  JSON.stringify({ "json": items }));
        //   console.log(response)
        //   console.log(response.Data[0])
        //   console.log("Hi Test")
          setcustomerMaster(response.Data[0])

    },[])
  
    return <DataTable 
    columns={columns} 
    data={customerMaster}
    // enableRowSelection 
   // enableGrouping
    // enableExport
    />;
  
}
