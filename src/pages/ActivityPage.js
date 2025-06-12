import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  TableHead,
  TableSortLabel,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  Divider,
  Grid,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// hooks
import { useToast } from '../hooks/Common';
import { fDateTime } from '../utils/formatTime';

// ----------------------------------------------------------------------

// ----------------------------------------------------------------------

function ActivityListHead({
  order,
  orderBy,
  rowCount,
  headLabel,
  numSelected,
  onRequestSort,
  onSelectAllClick,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignRight ? 'right' : 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

const TABLE_HEAD = [
  { id: 'type', label: 'Type', alignRight: false },
  { id: 'activity', label: 'Activity', alignRight: false },
  { id: 'user', label: 'User', alignRight: false },
  { id: 'timestamp', label: 'Timestamp', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: 'details', label: 'Details', alignRight: false },
  { id: '', label: '', alignRight: true },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return array.filter((_activity) => 
      _activity.title.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _activity.description.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _activity.user.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function ActivityPage() {
  const theme = useTheme();
  const { showToast } = useToast();

  const [open, setOpen] = useState(null);
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('timestamp');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock activity data - replace with API call
  const [activities, setActivities] = useState([
    {
      id: '1',
      type: 'sale',
      title: 'Sales Invoice Created',
      description: 'Sales Invoice #SI-2024-001 created for ABC Corporation',
      user: 'John Doe',
      userAvatar: null,
      timestamp: new Date('2024-06-12T10:30:00'),
      status: 'completed',
      amount: 'AED 15,500',
      reference: 'SI-2024-001',
      module: 'Sales',
    },
    {
      id: '2',
      type: 'purchase',
      title: 'Purchase Order Approved',
      description: 'Purchase Order #PO-2024-045 approved for XYZ Suppliers',
      user: 'Jane Smith',
      userAvatar: null,
      timestamp: new Date('2024-06-12T09:45:00'),
      status: 'completed',
      amount: 'AED 8,750',
      reference: 'PO-2024-045',
      module: 'Purchasing',
    },
    {
      id: '3',
      type: 'payment',
      title: 'Payment Received',
      description: 'Payment received from DEF Industries via Bank Transfer',
      user: 'Mike Johnson',
      userAvatar: null,
      timestamp: new Date('2024-06-12T08:15:00'),
      status: 'completed',
      amount: 'AED 12,300',
      reference: 'PMT-2024-078',
      module: 'Finance',
    },
    {
      id: '4',
      type: 'invoice',
      title: 'Invoice Generated',
      description: 'Invoice #INV-2024-189 generated and sent to customer',
      user: 'Sarah Wilson',
      userAvatar: null,
      timestamp: new Date('2024-06-12T07:30:00'),
      status: 'pending',
      amount: 'AED 5,900',
      reference: 'INV-2024-189',
      module: 'Sales',
    },
    {
      id: '5',
      type: 'user',
      title: 'User Login',
      description: 'User logged into the system',
      user: 'Admin User',
      userAvatar: null,
      timestamp: new Date('2024-06-12T07:00:00'),
      status: 'completed',
      amount: null,
      reference: null,
      module: 'System',
    },
    {
      id: '6',
      type: 'inventory',
      title: 'Inventory Updated',
      description: 'Stock levels updated for 15 products',
      user: 'Inventory Manager',
      userAvatar: null,
      timestamp: new Date('2024-06-11T18:45:00'),
      status: 'completed',
      amount: null,
      reference: 'INV-UPDATE-001',
      module: 'Inventory',
    },
    {
      id: '7',
      type: 'quote',
      title: 'Quotation Sent',
      description: 'Quotation #QT-2024-067 sent to potential client',
      user: 'Sales Rep',
      userAvatar: null,
      timestamp: new Date('2024-06-11T16:20:00'),
      status: 'pending',
      amount: 'AED 25,000',
      reference: 'QT-2024-067',
      module: 'Sales',
    },
    {
      id: '8',
      type: 'system',
      title: 'System Backup',
      description: 'Automated daily backup completed successfully',
      user: 'System',
      userAvatar: null,
      timestamp: new Date('2024-06-11T02:00:00'),
      status: 'completed',
      amount: null,
      reference: 'BACKUP-2024-06-11',
      module: 'System',
    },
  ]);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = activities.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
    // Filter by activity type based on tab
    const tabFilters = ['all', 'sale', 'purchase', 'payment', 'system'];
    setFilterType(tabFilters[newValue]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'sale': return 'mdi:cash-multiple';
      case 'purchase': return 'mdi:cart-arrow-down';
      case 'payment': return 'mdi:credit-card';
      case 'invoice': return 'mdi:file-document';
      case 'user': return 'mdi:account';
      case 'inventory': return 'mdi:package-variant';
      case 'quote': return 'mdi:file-chart';
      case 'system': return 'mdi:cog';
      default: return 'mdi:information';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'sale': return theme.palette.success.main;
      case 'purchase': return theme.palette.info.main;
      case 'payment': return theme.palette.warning.main;
      case 'invoice': return theme.palette.error.main;
      case 'user': return theme.palette.primary.main;
      case 'inventory': return theme.palette.secondary.main;
      case 'quote': return theme.palette.purple?.main || theme.palette.primary.main;
      case 'system': return theme.palette.grey[600];
      default: return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  // Filter activities
  let filteredActivities = activities;
  
  // Filter by type
  if (filterType !== 'all') {
    filteredActivities = filteredActivities.filter(activity => activity.type === filterType);
  }
  
  // Filter by status
  if (filterStatus !== 'all') {
    filteredActivities = filteredActivities.filter(activity => activity.status === filterStatus);
  }
  
  // Apply search and sort
  filteredActivities = applySortFilter(filteredActivities, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredActivities.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Activity History | Exapp ERP </title>
      </Helmet>

      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Activity History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track all system activities and user actions
          </Typography>
        </Box>

        {/* Filters and Tabs */}
        <Card sx={{ mb: 3 }}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search activities..."
                  value={filterName}
                  onChange={handleFilterByName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="failed">Failed</MenuItem>
                    <MenuItem value="cancelled">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:download-fill" />}
                  onClick={() => showToast('Export functionality will be implemented', 'info')}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </Box>
          
          <Divider />
          
          <Box sx={{ px: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab 
                label="All Activities" 
                icon={<Iconify icon="mdi:format-list-bulleted" />} 
                iconPosition="start"
              />
              <Tab 
                label="Sales" 
                icon={<Iconify icon="mdi:cash-multiple" />} 
                iconPosition="start"
              />
              <Tab 
                label="Purchases" 
                icon={<Iconify icon="mdi:cart-arrow-down" />} 
                iconPosition="start"
              />
              <Tab 
                label="Payments" 
                icon={<Iconify icon="mdi:credit-card" />} 
                iconPosition="start"
              />
              <Tab 
                label="System" 
                icon={<Iconify icon="mdi:cog" />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </Card>

        {/* Activity Table */}
        <Card>
          <Scrollbar>            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ActivityListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={filteredActivities.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredActivities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, type, title, description, user, userAvatar, timestamp, status, amount, reference, module } = row;
                    const selectedActivity = selected.indexOf(id) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedActivity}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedActivity} onChange={(event) => handleClick(event, id)} />
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: alpha(getActivityColor(type), 0.1),
                                color: getActivityColor(type),
                              }}
                            >
                              <Iconify icon={getActivityIcon(type)} width={18} />
                            </Avatar>
                            <Typography variant="subtitle2" noWrap>
                              {module}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Activity */}
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" noWrap>
                              {title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {description}
                            </Typography>
                            {reference && (
                              <Chip 
                                label={reference} 
                                size="small" 
                                variant="outlined" 
                                sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </TableCell>

                        {/* User */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar src={userAvatar} sx={{ width: 24, height: 24 }}>
                              {user.charAt(0)}
                            </Avatar>
                            <Typography variant="body2">
                              {user}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Timestamp */}
                        <TableCell>
                          <Typography variant="body2">
                            {fDateTime(timestamp)}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Chip 
                            label={status} 
                            color={getStatusColor(status)} 
                            size="small" 
                          />
                        </TableCell>

                        {/* Details */}
                        <TableCell>
                          {amount && (
                            <Typography variant="body2" fontWeight="600" color="success.main">
                              {amount}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={handleOpenMenu}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {isNotFound && (
                    <TableRow>
                      <TableCell align="center" colSpan={8} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredActivities.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem>
          <Iconify icon={'eva:eye-fill'} sx={{ mr: 2 }} />
          View Details
        </MenuItem>

        <MenuItem>
          <Iconify icon={'eva:download-fill'} sx={{ mr: 2 }} />
          Export
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}
