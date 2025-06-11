
import React from 'react';
import MasterListing from '../../../../components/MasterListing';
import ModalForm from './ModalForm';

export default function Product() {
  const columns = [
    {
      accessorKey: 'IM_CODE',
      header: 'Code',
      size: "100"
    },
    {
      accessorKey: 'IM_DESC',
      header: 'Desc',
    },
    {
      accessorKey: 'IM_UNIT',
      header: 'Unit',
    },
    {
      accessorKey: 'IM_PRICE',
      header: 'Price',
    },
    {
      accessorKey: 'IM_CLSQTY',
      header: 'In Stock Qty',
    },
  ];

  return (
    <MasterListing
      title="Product"
      apiKey="ITEM_CRUD"
      columns={columns}
      deleteIdField="IM_CODE"
      ModalForm={ModalForm}
      newButtonLabel="New Product"
      deleteSuccessMessage="Product deleted!"
    />
  );
}
