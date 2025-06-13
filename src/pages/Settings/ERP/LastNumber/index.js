
import React from 'react';
import { Chip, Tooltip } from '@mui/material';
import { Grid3x3 } from '@mui/icons-material';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block';
import MasterListing from '../../../../components/MasterListing';
import ModalForm from './ModalForm';

/**
 * Last Number Management Page
 * Manages document numbering sequences using the MasterListing component
 */
export default function LastNumber() {
    // Define columns for the last numbers table
    const columns = [
        {
            accessorKey: 'LASTNO_DOCTYPE',
            header: 'Doc Type',
            size: 150,
        },
        {
            accessorKey: 'LASTNO_LASTNO',
            header: 'Last No',
            size: 120,
        },
        {
            accessorKey: 'LASTNO_PREFIX',
            header: 'Prefix',
            size: 120,
        },
        {
            accessorKey: 'LASTNO_LENGTH',
            header: 'Length',
            size: 100,
        },
        {
            header: 'Field Editable',
            size: 150,
            Cell: ({ row }) => (
                row.original.LASTNO_IS_EDITABLE ? (
                    <Tooltip title="Active">
                        <Chip 
                            icon={<CheckIcon />} 
                            color="success" 
                            size="small" 
                            label="Active"
                            variant="outlined"
                        />
                    </Tooltip>
                ) : (
                    <Tooltip title="Blocked">
                        <Chip 
                            icon={<BlockIcon />} 
                            color="error" 
                            size="small" 
                            label="Blocked"
                            variant="outlined"
                        />
                    </Tooltip>
                )
            ),
        }
    ];

    return (
        <MasterListing
            title="Last Numbers"
            apiKey="LAST_NO_CRUD"
            columns={columns}
            deleteIdField="LASTNO_DOCTYPE"
            ModalForm={ModalForm}
            newButtonLabel="New Last Number"
            deleteSuccessMessage="Last number deleted successfully"
            enableRefresh
            enableExport={false}
            icon={<Grid3x3 />}
            emptyMessage="No last numbers found. Create your first document numbering sequence to get started."
        />
    );
}
