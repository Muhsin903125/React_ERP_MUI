import { TextSnippet } from '@mui/icons-material';
import React from 'react';
import MasterListing from '../../../../components/MasterListing';
import ModalForm from './ModalForm';

/**
 * Documents Management Page
 * Manages document types and their settings using the MasterListing component
 */
export default function Documents() {
    // Define columns for the documents table
    const columns = [
        {
            accessorKey: 'DM_CODE',
            header: 'Doc Type',
            size: 120,
        },
        {
            accessorKey: 'DM_DESC',
            header: 'Description',
            size: 200,
        },
        {
            accessorKey: 'DM_ACCOUNT_IMPACT',
            header: 'Account Impact',
            size: 130,
            Cell: ({ row }) => (
                <span style={{ 
                    color: row.original.DM_ACCOUNT_IMPACT === 1 ? '#4caf50' : '#f44336',
                    fontWeight: 500
                }}>
                    {row.original.DM_ACCOUNT_IMPACT === 1 ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            accessorKey: 'DM_STOCK_IMPACT',
            header: 'Stock Impact',
            size: 120,
            Cell: ({ row }) => (
                <span style={{ 
                    color: row.original.DM_STOCK_IMPACT === 1 ? '#4caf50' : '#f44336',
                    fontWeight: 500
                }}>
                    {row.original.DM_STOCK_IMPACT === 1 ? 'Yes' : 'No'}
                </span>
            ),
        },
        {
            accessorKey: 'DM_TAX_TREATMENT',
            header: 'Tax Treatment',
            size: 130,
            Cell: ({ row }) => (
                <span style={{ 
                    color: row.original.DM_TAX_TREATMENT === 1 ? '#2196f3' : '#ff9800',
                    fontWeight: 500,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: row.original.DM_TAX_TREATMENT === 1 ? '#e3f2fd' : '#fff3e0'
                }}>
                    {row.original.DM_TAX_TREATMENT === 1 ? 'Debit' : 'Credit'}
                </span>
            ),
        }
    ];

    return (
        <MasterListing
            title="Documents"
            apiKey="DOC_CRUD"
            columns={columns}
            deleteIdField="DM_CODE"
            ModalForm={ModalForm}
            newButtonLabel="New Document"
            deleteSuccessMessage="Document deleted !"
            enableRefresh
            enableExport={false}
            icon={<TextSnippet />}
            emptyMessage="No documents found. Create your first document type to get started."
        />
    );
}
