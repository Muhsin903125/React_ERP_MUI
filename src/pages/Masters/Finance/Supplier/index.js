
import React from 'react';
import BusinessIcon from '@mui/icons-material/Business';
import MasterListing from '../../../../components/MasterListing';
import ModalForm from './ModalForm';

export default function Supplier() {
  const columns = [
    {
      accessorKey: 'SUP_DOCNO',
      header: 'Code',
      size: "100"
    },
    {
      accessorKey: 'SUP_DESC',
      header: 'Desc',
    },
    {
      accessorKey: 'SUP_EMAIL',
      header: 'Email',
    },
    {
      accessorKey: 'SUP_TRN',
      header: 'TRN',
    },
    {
      accessorKey: 'SUP_MOB',
      header: 'Mobile',
    },
  ];
  return (
    <MasterListing
      title="Suppliers"
      apiKey="SUP_CRUD"
      columns={columns}
      deleteIdField="SUP_DOCNO"
      ModalForm={ModalForm}
      newButtonLabel="New Supplier"
      deleteSuccessMessage="Supplier deleted!"
      icon={<BusinessIcon />}
      emptyMessage="No suppliers found. Start by adding your first supplier to build your vendor database."
    />
  );
}
