
import React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MasterListing from '../../../../components/MasterListing';
import ModalForm from './ModalForm';

export default function Location() {
  const columns = [
    {
      accessorKey: 'LM_LOCATION_CODE',
      header: 'Code',
      size: "100"
    },
    {
      accessorKey: 'LM_LOCATION_NAME',
      header: 'Name',
    },
    {
      accessorKey: 'LM_DESCRIPTION',
      header: 'Description',
    },
    {
      accessorKey: 'LM_ADDRESS',
      header: 'Address',
    },
    {
      accessorKey: 'LM_CITY',
      header: 'City',
    },
    {
      accessorKey: 'LM_STATE',
      header: 'State',
    },
    {
      accessorKey: 'LM_COUNTRY',
      header: 'Country',
    },
  ];
  return (
    <MasterListing
      title="Locations"
      apiKey="LOCATION_CRUD"
      columns={columns}
      deleteIdField="LM_LOCATION_CODE"
      ModalForm={ModalForm}
      newButtonLabel="New Location"
      deleteSuccessMessage="Location deleted!"
      icon={<LocationOnIcon />}
      emptyMessage="No locations found. Start by adding your first location to manage your inventory storage."
    />
  );
}
