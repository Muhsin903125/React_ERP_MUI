
import React from 'react';
import StraightenIcon from '@mui/icons-material/Straighten';
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
      title="Units"
      apiKey="LOOKUP"
      columns={columns}
      deleteIdField="LK_KEY"
      ModalForm={ModalForm}
      newButtonLabel="New Unit"
      deleteSuccessMessage="Unit deleted!"
      additionalApiParams={{ TYPE: "UNITS" }}
      icon={<StraightenIcon />}
      emptyMessage="No units found. Start by adding your first unit of measurement for your products."
    />
  );
}
