
import React from 'react';
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
      title="Supplier"
      apiKey="SUP_CRUD"
      columns={columns}
      deleteIdField="SUP_DOCNO"
      ModalForm={ModalForm}
      newButtonLabel="New Supplier"
      deleteSuccessMessage="Supplier deleted!"
    />
  );
}
