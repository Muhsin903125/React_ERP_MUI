
import React from 'react';
import MasterListing from '../../../../components/MasterListing';
import ModalForm from './ModalForm';

export default function Customer() {
  const columns = [
    {
      accessorKey: 'CUS_DOCNO',
      header: 'Code',
      size: "100"
    },
    {
      accessorKey: 'CUS_DESC',
      header: 'Desc',
    },
    {
      accessorKey: 'CUS_EMAIL',
      header: 'Email',
    },
    {
      accessorKey: 'CUS_TRN',
      header: 'TRN',
    },
    {
      accessorKey: 'CUS_MOB',
      header: 'Mobile',
    },
  ];

  return (
    <MasterListing
      title="Customer"
      apiKey="CUS_CRUD"
      columns={columns}
      deleteIdField="CUS_DOCNO"
      ModalForm={ModalForm}
      newButtonLabel="New Customer"
      deleteSuccessMessage="Customer deleted!"
    />
  );
}
