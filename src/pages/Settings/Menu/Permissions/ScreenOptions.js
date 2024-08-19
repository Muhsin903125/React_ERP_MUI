import React, { useState,useEffect } from 'react';
import {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Typography,
    Checkbox,
} from '@mui/material'; 

const permissionsOptions = [
    { screen: 'Screen 1', isDelete: false, isUpdate: false, isCreate: false, isView: false },
    { screen: 'Screen 2', isDelete: true, isUpdate: false, isCreate: false, isView: true },
    { screen: 'Screen 3', isDelete: false, isUpdate: true, isCreate: false, isView: false },
];

const ScreenOptions = ({permissions,setPermissions}) => {
    // const [permissions, setPermissions] = useState([]);

    // useEffect(() => { 
    //     const fetchPermissions = () => { 
    //         return permissionsOptions;
    //     };

    //     const initialPermissions = fetchPermissions();
    //     setPermissions(initialPermissions);
    // }, []);

    const handleChange = (screen, permission) => {
        setPermissions((prev) =>
            prev.map((item) =>
                item.screen === screen
                    ? { ...item, [permission]: !item[permission] }
                    : item
            )
        );
        console.log("res---",permissions);
    };

    return (
        <TableContainer component={Paper}>
            <Typography variant="h5" align="center" gutterBottom>
                Set Permissions
            </Typography>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Screen</TableCell>
                        <TableCell align="center">View</TableCell>
                        <TableCell align="center">Create</TableCell>
                        <TableCell align="center">Update</TableCell>
                        <TableCell align="center">Delete</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {permissions.map((permission) => (
                        <TableRow key={permission.screen}>
                            <TableCell component="th" scope="row">
                                {permission.screen}
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    checked={permission.isView}
                                    onChange={() => handleChange(permission.screen, 'isView')}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    checked={permission.isCreate}
                                    onChange={() => handleChange(permission.screen, 'isCreate')}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    checked={permission.isUpdate}
                                    onChange={() => handleChange(permission.screen, 'isUpdate')}
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Checkbox
                                    checked={permission.isDelete}
                                    onChange={() => handleChange(permission.screen, 'isDelete')}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default ScreenOptions;
