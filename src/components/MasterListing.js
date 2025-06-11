import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Stack,
  Card,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { GetSingleListResult, GetSingleResult } from '../hooks/Api';
import { useToast } from '../hooks/Common';
import DataTable from './DataTable';
import Confirm from './Confirm';
import PageHeader from './PageHeader';

/**
 * Common Master Listing Component
 * @param {Object} props - Component props
 * @param {string} props.title - Page title
 * @param {string} props.apiKey - API key for CRUD operations
 * @param {Array} props.columns - Table columns configuration
 * @param {string} props.deleteIdField - Field name for delete operation ID
 * @param {React.Component} props.ModalForm - Modal form component for add/edit
 * @param {Object} props.additionalApiParams - Additional API parameters
 * @param {boolean} props.enableExport - Enable export functionality
 * @param {string} props.newButtonLabel - Label for new button
 * @param {string} props.deleteSuccessMessage - Success message for delete
 * @param {Array} props.additionalActions - Additional header actions
 */
export default function MasterListing({
  title,
  apiKey,
  columns = [],
  deleteIdField,
  ModalForm,
  additionalApiParams = {},
  enableExport = false,
  newButtonLabel,
  deleteSuccessMessage,
  additionalActions = []
}) {
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loader, setLoader] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Add default actions column if not already present
  const finalColumns = columns.some(col => col.header === 'Actions' || col.header === 'Acitons') 
    ? columns 
    : [
        ...columns,
        {
          header: 'Actions',
          Cell: ({ row }) => (
            <div>
              <Tooltip title="Edit">
                <IconButton onClick={() => handleEdit(row.original)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton onClick={() => handleDelete(row.original[deleteIdField])}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </div>
          ),
        },
      ];

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoader(true);
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: apiKey,
        TYPE: "GET_ALL",
        ...additionalApiParams,
      });
      
      if (Success) {
        setData(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      showToast("Failed to fetch data", "error");
    } finally {
      setLoader(false);
    }
  };

  const handleDelete = async (id) => {
    Confirm('Are you sure to Delete?').then(async () => {
      try {
        setLoader(true);
        const { Success, Data, Message } = await GetSingleResult({
          key: apiKey,
          TYPE: "DELETE",
          [deleteIdField]: id,
        });
        
        if (Success) {
          fetchList();
          showToast(deleteSuccessMessage || `${title} deleted!`, 'success');
        } else {
          showToast(Message, "error");
        }
      } catch (error) {
        showToast("Failed to delete", "error");
      } finally {
        setLoader(false);
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditData(null);
    fetchList();
  };

  const handleEdit = (record) => {
    setShowModal(true);
    setEditData(record);
  };

  const handleNew = () => {
    setShowModal(true);
    setEditData(null);
  };

  // Prepare header actions
  const headerActions = [
    {
      label: newButtonLabel || `New ${title}`,
      icon: 'eva:plus-fill',
      variant: 'contained',
      color: 'primary',
      onClick: handleNew,
      show: true
    },
    ...additionalActions
  ];

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      
      <Card>
        <Stack m={5}>
          <PageHeader 
            title={title}
            actions={headerActions}
          />

          {(!loader && data) ? (
            <DataTable
              columns={finalColumns}
              data={data}
              enableExport={enableExport}
            />
          ) : (
            <CircularProgress color="inherit" />
          )}
          
          {ModalForm && (
            <ModalForm 
              open={showModal} 
              initialValues={editData} 
              onClose={closeModal} 
            />
          )}
        </Stack>
      </Card>
    </>
  );
}
