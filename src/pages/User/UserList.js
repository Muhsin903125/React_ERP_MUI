
import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom';

// @mui
import {
    Stack,
    Button,
    Typography,
    Tooltip,
    IconButton,
    Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; 
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import Iconify from '../../components/iconify/Iconify'; 
import { AuthContext } from '../../App';
import { GetUserList } from '../../hooks/Api';
import { useToast } from '../../hooks/Common';
import DataTable from '../../components/DataTable';
import Confirm from '../../components/Confirm';


export default function UserList() {
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate =useNavigate();
    const [data, setData] = useState(null)
    useEffect(() => {

       
        fetchList();

    }, [])

 async function fetchList() {
            try {
                setLoadingFull(false);
                const { Success, Data, Message } = await GetUserList()
                if (Success) {
                    console.log("sss", Data);
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

    

const columns = [
    {
        accessorKey: 'firstName', //  access nested data with dot notation
        header: 'First Name',
        // size:500
    },
    {
        accessorKey: 'lastName',
        header: 'Last Name',
    },
    {
        accessorKey: 'email', //  normal accessorKey
        header: 'Email',
    }, 
     {
        // accessorKey: '', //  normal accessorKey
        header: 'Status',
        Cell: ({ row }) => (

             row.original.isActive ?  
            <div>
              <Tooltip title="Active">
              <Chip icon={<CheckIcon />}  color="success" size='small' label="Active" />
              </Tooltip> 
            </div>
            :
            <div>
              <Tooltip title="Blocked">
              <Chip icon={<BlockIcon />}  color="error" size='small' label="Blocked" />
              </Tooltip> 
            </div>
          ),
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
          </div>
        ),
        //  size:200
      },
];
 
function handleEdit(users) { 
    navigate('/registeruser', { state: { user: users } })
  }
    return <>
        <Helmet>
            <title> Users List </title>
        </Helmet>

        <Stack m={5} >
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                <Typography variant="h4" gutterBottom>
                    Users List
                </Typography>
                <Link to="/registeruser" style={{ textDecoration: 'none' }}>
                    <Button variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
                        New User
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
