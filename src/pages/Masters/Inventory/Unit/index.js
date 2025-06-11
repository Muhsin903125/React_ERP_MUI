
import React from 'react';
import MasterListing from '../../../../components/MasterListing';
import ModalForm from './ModalForm';

export default function Unit() {
  const columns = [
    {
      accessorKey: 'LK_KEY',
      header: 'Key',
      size: "100"
    },
    {
      accessorKey: 'LK_VALUE',
      header: 'Value',
    },
    // Disable actions for Units as they use LOOKUP API without delete support
    {
      header: 'Actions',
      Cell: ({ row }) => (
        <div>
          {/* Delete action disabled for lookup-based units */}
        </div>
      ),
    },
  ];

  return (
    <MasterListing
      title="Unit"
      apiKey="LOOKUP"
      columns={columns}
      deleteIdField="LK_KEY"
      ModalForm={ModalForm}
      newButtonLabel="New Unit"
      deleteSuccessMessage="Unit deleted!"
      additionalApiParams={{ TYPE: "UNITS" }}
    />
  );
}
