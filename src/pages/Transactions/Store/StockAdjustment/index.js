import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  alpha,
  useTheme
} from '@mui/material';
import MaterialReactTable from 'material-react-table';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { GetSingleListResult    } from '../../../../hooks/Api';
import PageHeader from '../../../../components/PageHeader'; 
import Loader from '../../../../components/Loader';

const StockAdjustmentListing = () => {
  const theme = useTheme();
  const navigate = useNavigate();  

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');

  // Fetch stock adjustments data
  useEffect(() => {
    fetchStockAdjustments();
  }, []);
  const fetchStockAdjustments = async () => {
    try {
      setLoading(true);
      
      // Dummy data for testing
      const dummyData = [
        {
          id: 1,
          documentNo: 'SA-2024-001',
          documentDate: '2024-06-10T00:00:00Z',
          referenceNo: 'REF-001',
          location: { id: 1, name: 'Main Warehouse', code: 'MW001' },
          adjustmentType: 'Physical Count',
          totalValue: 1250.75,
          status: 'Posted',
          createdBy: { id: 1, name: 'John Doe' },
          remarks: 'Stock adjustment after physical count'
        },
        {
          id: 2,
          documentNo: 'SA-2024-002',
          documentDate: '2024-06-11T00:00:00Z',
          referenceNo: 'REF-002',
          location: { id: 2, name: 'Secondary Store', code: 'SS002' },
          adjustmentType: 'Damage',
          totalValue: -850.50,
          status: 'Draft',
          createdBy: { id: 2, name: 'Jane Smith' },
          remarks: 'Damaged goods adjustment'
        },
        {
          id: 3,
          documentNo: 'SA-2024-003',
          documentDate: '2024-06-12T00:00:00Z',
          referenceNo: 'REF-003',
          location: { id: 1, name: 'Main Warehouse', code: 'MW001' },
          adjustmentType: 'Expiry',
          totalValue: -320.25,
          status: 'Posted',
          createdBy: { id: 1, name: 'John Doe' },
          remarks: 'Expired products write-off'
        },
        {
          id: 4,
          documentNo: 'SA-2024-004',
          documentDate: '2024-06-13T00:00:00Z',
          referenceNo: '',
          location: { id: 3, name: 'Branch Store', code: 'BS003' },
          adjustmentType: 'Manual',
          totalValue: 450.00,
          status: 'Draft',
          createdBy: { id: 3, name: 'Mike Johnson' },
          remarks: 'Manual stock correction'
        },
        {
          id: 5,
          documentNo: 'SA-2024-005',
          documentDate: '2024-06-13T00:00:00Z',
          referenceNo: 'REF-005',
          location: { id: 2, name: 'Secondary Store', code: 'SS002' },
          adjustmentType: 'System',
          totalValue: 0.00,
          status: 'Cancelled',
          createdBy: { id: 2, name: 'Jane Smith' },
          remarks: 'System adjustment - cancelled due to error'
        }
      ];

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData(dummyData);
      
      // Uncomment below to use real API when backend is ready
      // const result = await GetSingleListResult('StockAdjustment', 'GetStockAdjustmentList');
      // if (result?.data) {
      //   setData(result.data);
      // }
    } catch (error) {
      console.error('Error fetching stock adjustments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Status chip component
  const StatusChip = ({ status }) => {
    const getStatusColor = (status) => {
      switch (status?.toLowerCase()) {
        case 'draft':
          return { color: 'warning', label: 'Draft' };
        case 'posted':
          return { color: 'success', label: 'Posted' };
        case 'cancelled':
          return { color: 'error', label: 'Cancelled' };
        default:
          return { color: 'default', label: status || 'Unknown' };
      }
    };

    const { color, label } = getStatusColor(status);
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{
          fontWeight: 600,
          fontSize: '0.75rem',
          height: 24,
          '& .MuiChip-label': {
            px: 1.5
          }
        }}
      />
    );
  };

  // Table columns configuration
  const columns = useMemo(
    () => [
      {
        accessorKey: 'documentNo',
        header: 'Document No',
        size: 120,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: theme.palette.primary.main,
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={() => navigate(`/stock-adjustment/entry/${cell.row.original.id}`)}
          >
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        accessorKey: 'documentDate',
        header: 'Date',
        size: 100,
        Cell: ({ cell }) => (
          <Typography variant="body2">
            {cell.getValue() ? format(new Date(cell.getValue()), 'dd/MM/yyyy') : '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'referenceNo',
        header: 'Reference',
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="body2" color="text.secondary">
            {cell.getValue() || '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
        size: 150,
        Cell: ({ cell }) => (
          <Typography variant="body2">
            {cell.getValue()?.name || '-'}
          </Typography>
        ),
      },
      {
        accessorKey: 'adjustmentType',
        header: 'Type',
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() || 'Manual'}
            variant="outlined"
            size="small"
            color="info"
            sx={{ fontSize: '0.75rem' }}
          />
        ),
      },
      {
        accessorKey: 'totalValue',
        header: 'Total Value',
        size: 120,
        Cell: ({ cell }) => (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: cell.getValue() >= 0 ? theme.palette.success.main : theme.palette.error.main
            }}
          >
            AED {cell.getValue()?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
          </Typography>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        Cell: ({ cell }) => <StatusChip status={cell.getValue()} />,
      },
      {
        accessorKey: 'createdBy',
        header: 'Created By',
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="body2" color="text.secondary">
            {cell.getValue()?.name || '-'}
          </Typography>
        ),
      },
    ],
    [theme, navigate]
  );  const handlePrint = (id) => {
    console.log('Print stock adjustment:', id);
    // Implement print functionality
  };

  const handleExport = () => {
    console.log('Export stock adjustments');
    // Implement export functionality
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Stock Adjustments"
        subtitle="Manage inventory adjustments and stock corrections"
        breadcrumbs={[
          { title: 'Transactions', path: '/transactions' },
          { title: 'Store', path: '/transactions/store' },
          { title: 'Stock Adjustments' }
        ]}
      />

      <Card
        sx={{
          mt: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
          boxShadow: `0 8px 32px ${alpha(theme.palette.grey[500], 0.12)}`,
        }}
      >
        <CardContent sx={{ p: 0 }}>
          <MaterialReactTable
            columns={columns}
            data={data}
            enableColumnFilters 
            enableGlobalFilter 
            enableColumnActions 
            enableColumnDragging={false}
            enableSorting 
            enableTopToolbar 
            enableBottomToolbar 
            enablePagination 
            enableRowSelection={false}
            positionActionsColumn="last"
            muiTablePaperProps={{
              elevation: 0,
              sx: {
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              },
            }}
            muiTableHeadCellProps={{
              sx: {
                backgroundColor: alpha(theme.palette.grey[500], 0.04),
                fontWeight: 600,
                fontSize: '0.875rem',
                color: theme.palette.text.primary,
                border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`,
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
              },
            }}
            muiTopToolbarProps={{
              sx: {
                backgroundColor: 'transparent',
                '& .MuiBox-root': {
                  backgroundColor: 'transparent',
                },
              },
            }}
            muiTableContainerProps={{
              sx: {
                maxHeight: 'calc(100vh - 300px)',
              },
            }}
            state={{
              globalFilter,
            }}
            onGlobalFilterChange={setGlobalFilter}
            enableRowActions 
            renderRowActions={({ row }) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="View">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/stock-adjustment/entry/${row.original.id}?mode=view`)}
                    sx={{
                      color: theme.palette.info.main,
                      '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.1) }
                    }}
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/stock-adjustment/entry/${row.original.id}`)}
                    sx={{
                      color: theme.palette.warning.main,
                      '&:hover': { backgroundColor: alpha(theme.palette.warning.main, 0.1) }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Print">
                  <IconButton
                    size="small"
                    onClick={() => handlePrint(row.original.id)}
                    sx={{
                      color: theme.palette.secondary.main,
                      '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.1) }
                    }}
                  >
                    <PrintIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
            renderTopToolbarCustomActions={() => (
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/stock-adjustment/entry/new')}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }}
                >
                  New Adjustment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExport}
                  sx={{
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                    color: theme.palette.primary.main,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                >
                  Export
                </Button>
              </Stack>
            )}
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default StockAdjustmentListing;