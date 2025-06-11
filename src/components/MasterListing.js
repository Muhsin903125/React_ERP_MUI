import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Stack,
  Card,
  CircularProgress,
  IconButton,
  Tooltip,
  Box,
  Fade,
  Skeleton,
  Alert,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Container
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import { GetSingleListResult, GetSingleResult } from '../hooks/Api';
import { useToast } from '../hooks/Common';
import DataTable from './DataTable';
import Confirm from './Confirm';
import PageHeader from './PageHeader';

/**
 * Modern Master Listing Component with Enhanced UX
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
 * @param {boolean} props.enableRefresh - Enable refresh functionality
 * @param {string} props.emptyMessage - Custom empty state message
 * @param {string} props.icon - Page icon
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
  additionalActions = [],
  enableRefresh = true,
  emptyMessage,
  icon
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loader, setLoader] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  // Enhanced actions column with modern styling
  const finalColumns = columns.some(col => col.header === 'Actions' || col.header === 'Acitons') 
    ? columns 
    : [
        ...columns,
        {
          header: 'Actions',
          Cell: ({ row }) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Edit" arrow>
                <IconButton 
                  onClick={() => handleEdit(row.original)}
                  size="small"
                  sx={{
                    color: 'primary.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete" arrow>
                <IconButton 
                  onClick={() => handleDelete(row.original[deleteIdField])}
                  size="small"
                  sx={{
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          ),
          size: 120,
        },
      ];

  useEffect(() => {
    fetchList();
  }, []);
  const fetchList = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoader(true);
    }
    setError(null);

    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: apiKey,
        TYPE: "GET_ALL",
        ...additionalApiParams,
      });
      
      if (Success) {
        setData(Data);
        if (isRefresh) {
          showToast('Data refreshed successfully', 'success');
        }
      } else {
        setError(Message || 'Failed to fetch data');
        showToast(Message || 'Failed to fetch data', "error");
      }
    } catch (error) {
      const errorMessage = "Network error - please check your connection";
      setError(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoader(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchList(true);
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
  // Enhanced header actions with refresh functionality
  const headerActions = [
    ...(enableRefresh ? [{
      label: 'Refresh',
      icon: 'eva:refresh-fill',
      variant: 'outlined',
      onClick: handleRefresh,
      show: true,
      disabled: refreshing,
      showInActions: false,
    }] : []),
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

  const renderContent = () => {
    if (loader) {
      return (
        <Box sx={{ p: 3 }}>
          {[...Array(5)].map((_, index) => (
            <Skeleton
              key={index}
              variant="rectangular"
              height={60}
              sx={{ mb: 1, borderRadius: 1 }}
            />
          ))}
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error" 
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => fetchList()}
              >
                <RefreshIcon />
              </IconButton>
            }
          >
            {error}
          </Alert>
        </Box>
      );
    }

    if (!data || data.length === 0) {
      return (
        <Box 
          sx={{ 
            p: 6, 
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          <Box
            component="img"
            src="/assets/illustrations/illustration_empty_content.svg"
            sx={{ height: 240, mx: 'auto', my: { xs: 5, sm: 10 } }}
          />
          <Alert severity="info" sx={{ mt: 3 }}>
            {emptyMessage || `No ${title.toLowerCase()} records found. Click "New ${title}" to add your first record.`}
          </Alert>
        </Box>
      );
    }

    return (
      <Fade in={!loader}>
        <Box>
          <DataTable
            columns={finalColumns}
            data={data}
            enableExport={enableExport}
            fileTitle={title}
          />
        </Box>
      </Fade>
    );
  };
  return (
    <>
      <Helmet>
        <title>{title} | ERP System</title>
      </Helmet>
      
      <Card 
        sx={{ 
          boxShadow: theme.customShadows?.z1,
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
            borderBottom: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
          }}
        >
          <Stack sx={{ p: { xs: 2, md: 3 } }}>
            <PageHeader 
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {icon && (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {icon}
                    </Box>
                  )}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {title}
                      {data && (
                        <Chip 
                          label={data.length} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              }
              actions={headerActions}
            />
          </Stack>
        </Box>

        {renderContent()}
        
        {ModalForm && (
          <ModalForm 
            open={showModal} 
            initialValues={editData} 
            onClose={closeModal} 
          />
        )}
      </Card>
    </>
  );
}
