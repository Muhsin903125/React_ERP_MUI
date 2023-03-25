
import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'

import { Link } from 'react-router-dom';

// @mui
import {
    Stack,
    Button,
    Typography,
} from '@mui/material';

import Iconify from '../../components/iconify/Iconify';
import { AuthContext } from '../../App';
import { GetUserList } from '../../hooks/Api';
import { useToast } from '../../hooks/Common';
import DataTable from '../../components/DataTable';


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
    }
];



export default function UserList() {
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [data, setData] = useState(null)
    useEffect(() => {

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
        fetchList();

    }, [])

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
