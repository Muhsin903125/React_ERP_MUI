
import React from 'react';
import PersonIcon from '@mui/icons-material/Person';
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
      header: 'Customer Name',
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
      title="Customers"
      apiKey="CUS_CRUD"
      columns={columns}
      deleteIdField="CUS_DOCNO"
      ModalForm={ModalForm}
      newButtonLabel="New Customer"
      deleteSuccessMessage="Customer deleted!"
      icon={<PersonIcon />}
      emptyMessage="No customers found. Start by adding your first customer to build your client database."
    />
  );
}
