import React, { useContext, useState, useEffect } from 'react';
import MaterialReactTable from 'material-react-table';
import {
    Box, Button, IconButton, Tooltip, Select, MenuItem, InputLabel, FormControl,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Delete, Edit, Tune } from '@mui/icons-material';
import { useToast } from '../hooks/Common';
import { deleteRole, saveRole, UpdateRole, PostMultiSp, PostCommonSp } from '../hooks/Api';

export default function GridEntryAdd({ open, columns, onClose, onSubmit }) {

    const [values, setValues] = useState(() =>
        columns.reduce((acc, column) => {
            acc[column.accessorKey ?? ''] = '';
            return acc;
        }, {}),
    );

    const handleSubmit = () => {
        // put your validation logic here
        onSubmit(values);
        onClose();
    };

    return (
        <Dialog open={open}>
            <DialogTitle textAlign="center">Add</DialogTitle>
            <DialogContent>
                <form onSubmit={(e) => e.preventDefault()}>
                    <Stack
                        sx={{
                            width: '100%',
                            minWidth: { xs: '300px', sm: '360px', md: '400px' },
                            gap: '1.5rem',
                        }}
                    >
                        {columns.map((column) => (
                            <TextField
                                key={column.accessorKey}
                                label={column.header}
                                name={column.accessorKey}
                                onChange={(e) =>
                                    setValues({ ...values, [e.target.name]: e.target.value })
                                }
                            />
                        ))}
                    </Stack>
                </form>
            </DialogContent>
            <DialogActions sx={{ p: '1.25rem' }}>
                <Button onClick={onClose}>Cancel</Button>
                <Button color="secondary" onClick={handleSubmit} variant="contained">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
};