
import React from 'react';
import MasterListing from '../../../../components/MasterListing';
import ModalForm from './ModalForm';

export default function Salesman() {
  const columns = [
    {
      accessorKey: 'SMAN_DOCNO',
      header: 'Code',
    },
    {
      accessorKey: 'SMAN_DESC',
      header: 'Desc',
    },
    {
      accessorKey: 'SMAN_EMAIL',
      header: 'Email',
    },
    {
      accessorKey: 'SMAN_MOB',
      header: 'Mobile',
    },
  ];

  return (
    <MasterListing
      title="Salesman"
      apiKey="SMAN_CRUD"
      columns={columns}
      deleteIdField="SMAN_DOCNO"
      ModalForm={ModalForm}
      newButtonLabel="New Salesman"
      deleteSuccessMessage="Salesman deleted!"
    />
  );
}
