import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions, Stack,
    Button,
    Typography,
    Box,
} from '@mui/material';
 
import MaterialReactTable from 'material-react-table';
import moment from 'moment';
import { GetSingleListResult, PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import Iconify from '../../../../components/iconify'
import ModalForm from './ModalForm';

const columns = [
    {
        accessorKey: 'LK_CODE',
        header: 'Code',
        enableEditing: false,

        size: 80
    },
    {
        accessorKey: 'LK_KEY',
        header: 'Key',
        size: 120
    },
    {
        accessorKey: 'LK_VALUE',
        header: 'Value',
        size: 200
    },
    {
        accessorKey: 'LK_TYPE',
        header: 'Type',
        size: 120
    },
    {
        accessorKey: 'LK_CR_DT',
        header: 'Created Date',
        cell: ({ row }) => {
            const rawDate = row.original?.LK_CR_DT;
            if (!rawDate) return '';
            return moment(rawDate).format('DD-MMM-YYYY hh:mm A');
        },
        enableEditing: false,
        size: 150
    },
    {
        accessorKey: 'LK_IS_ACTIVE',
        header: 'Active',
        type: 'boolean',
        size: 80
    },
];

export default function Lookups() {
    const { setLoadingFull } = useContext(AuthContext);
    const { showToast } = useToast();
    const [lookupData, setLookupData] = useState([]);
    const [validationErrors, setValidationErrors] = useState({});
    const [createModalOpen, setCreateModalOpen] = useState(false);

    useEffect(() => {
        fetchList();
    }, []);

    const handleCreateModalOpen = () => {
        setCreateModalOpen(true);
    }

    const handleCreateSuccess = (newData) => {
        setLookupData(prev => [...prev, newData]);
        fetchList(); // Refresh the list
    }

    async function fetchList() {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetSingleListResult({
                key: "LOOKUP_CRUD",
                TYPE: "GET_ALL",
            });
            if (Success) {
                setLookupData(Data);
            } else {
                showToast(Message, "error");
            }
        } finally {
            setLoadingFull(false);
        }
    }

    const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
        if (!Object.keys(validationErrors).length) {
            const response = await PostCommonSp({
                ...values, TYPE: "UPDATE" ,
                key: "LOOKUP_CRUD"

            });
            if (response.Success) {
                lookupData[row.index] = values;
                setLookupData([...lookupData]);
                exitEditingMode();
                showToast("Updated successfully", "success");
            } else {
                showToast(response.Message, "error");
            }
        }
    };

    const handleCreateRow = async ({ values, exitEditingMode }) => {
        const response = await PostCommonSp({
            ...values, TYPE: "ADD" ,
            key: "LOOKUP_CRUD"
        });
        if (response.Success) {
            setLookupData([...lookupData, response.Data]);
            exitEditingMode();
            showToast("Created successfully", "success");
        } else {
            showToast(response.Message, "error");
        }
    };

    const handleCancelRowEdits = () => {
        setValidationErrors({});
    };

    return (
        <>
            <Helmet>
                <title>Lookup Management</title>
            </Helmet>
            <Box component="main"  >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4" gutterBottom>
                        Lookup Management
                    </Typography>
                </Stack>

                <MaterialReactTable
                    columns={columns}
                    data={lookupData}
                    initialState={{
                        density: 'compact',
                        pagination: { pageSize: 20, pageIndex: 0 },
                    }}
                    enableColumnOrdering
                    enableRowActions
                    positionActionsColumn="last"
                    muiTableProps={{
                        sx: {
                            tableLayout: 'fixed'
                        }
                    }}
                    onEditingRowSave={handleSaveRowEdits}
                    onCreatingRowSave={handleCreateRow}
                    onEditingRowCancel={handleCancelRowEdits}
                    enableTopToolbar
                    enableBottomToolbar
                    enablePagination
                    enableDensityToggle={false}
                    enableFullScreenToggle={false}
                    enableHiding={false}
                    enableColumnFilters={false}
                    enableGlobalFilter
                    enableEditing
                    enableColumnResizing 
                    renderDetailPanel={({ row }) => (
                        <Box
                            sx={{
                                display: 'grid',
                                margin: 'auto',
                                gridTemplateColumns: '1fr 1fr',
                                width: '100%',
                            }}
                        >
                            <Typography>Created: {row.original.LK_CR_DT}</Typography>
                        </Box>
                    )}
                    renderTopToolbarCustomActions={({ table }) => {
                        return (
                            <Button
                                color="primary"
                                onClick={() => handleCreateModalOpen()}
                                variant="contained"
                                startIcon={<Iconify icon="eva:plus-fill" />}
                            >
                                Create New Lookup
                            </Button>
                        );
                    }}
                />
                <ModalForm 
                    open={createModalOpen} 
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={handleCreateSuccess}
                />
            </Box>
        </>
    );  
} 