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
import { GetSingleListResult } from '../hooks/Api'; 

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
  { id: 'doc_type', label: 'Type', alignRight: false },
  { id: 'activity1', label: 'Activity', alignRight: false },
  { id: 'activity2', label: 'Details', alignRight: false },
  { id: 'activity3', label: 'Reference', alignRight: false },
  { id: 'username', label: 'User', alignRight: false },
  { id: 'actiondate', label: 'Date', alignRight: false },
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
      _activity.activity1.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _activity.activity2.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _activity.username.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      _activity.activity3.toLowerCase().indexOf(query.toLowerCase()) !== -1
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
  const [orderBy, setOrderBy] = useState('actiondate');
  const [filterName, setFilterName] = useState('');  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState('all');

  // Activity data - will be populated from API
  const [activities, setActivities] = useState([]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };
const getActivity = async () => {
    try {
    const { Success, Data, Message } = await GetSingleListResult({
       "key": "ACTION_LOG" ,
       "TYPE": "GET_ALL",
     });
      if (!Success) {
        showToast(Message, 'error');
      } else {
        setActivities(Data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

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
useEffect(() => {
    getActivity();
  }, []);
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
    const tabFilters = ['all', 'Sales', 'Purchase'];
    setFilterType(tabFilters[newValue]);
  };
  const getActivityIcon = (docType) => {
    switch (docType?.toLowerCase()) {
      case 'sales': return 'mdi:cash-multiple';
      case 'purchase': return 'mdi:cart-arrow-down';
      case 'payment': return 'mdi:credit-card';
      case 'receipt': return 'mdi:receipt';
      case 'invoice': return 'mdi:file-document';
      case 'credit': return 'mdi:credit-card-refund';
      case 'debit': return 'mdi:credit-card-minus';
      case 'debit note': return 'mdi:note-text-outline';
      case 'journal': return 'mdi:book-open-variant';
      case 'user': return 'mdi:account';
      case 'system': return 'mdi:cog';
      default: return 'mdi:file-document-outline';
    }
  };
  const getActivityColor = (docType) => {
    switch (docType?.toLowerCase()) {
      case 'sales': return '#00C851'; // Vibrant green
      case 'purchase': return '#2196F3'; // Bright blue
      case 'debit': return '#E91E63'; // Pink
      case 'journal': return '#607D8B'; // Blue grey
      default: return '#607D8B'; // Blue grey
    }
  };

  const getActivityGradient = (docType) => {
    switch (docType?.toLowerCase()) {
      case 'sales': return 'linear-gradient(135deg, #00C851 0%, #00E676 100%)';
      case 'purchase': return 'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)';
      case 'payment': return 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
      case 'receipt': return 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)';
      case 'invoice': return 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)';
      case 'credit': return 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)';
      case 'debit': return 'linear-gradient(135deg, #E91E63 0%, #F06292 100%)';
      case 'journal': return 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)';
      default: return 'linear-gradient(135deg, #607D8B 0%, #90A4AE 100%)';
    }
  };

  const extractAmount = (activity2) => {
    const match = activity2?.match(/Amt:([\d,]+\.?\d*)/);
    return match ? `AED ${match[1]}` : null;
  };

  const extractCustomerName = (activity2) => {
    const parts = activity2?.split('-');
    return parts && parts.length > 1 ? parts[1] : activity2;
  };
  // Filter activities
  let filteredActivities = activities;
  
  // Filter by type
  if (filterType !== 'all') {
    filteredActivities = filteredActivities.filter(activity => activity.doc_type === filterType);
  }
  
  // Apply search and sort
  filteredActivities = applySortFilter(filteredActivities, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredActivities.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> Activity History | Exapp ERP </title>
      </Helmet>      <Container maxWidth="xl" sx={{ py: 1.5 }}>
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, fontSize: '1.3rem' }}>
            Activity History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Track all system activities and user actions
          </Typography>
        </Box>        {/* Filters and Tabs */}
        <Card sx={{ mb: 2.5 }}>
          <Box sx={{ p: 1.5 }}>
            <Grid container spacing={2} alignItems="center"><Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search activities..."
                  value={filterName}
                  onChange={handleFilterByName}
                  sx={{ fontSize: '0.85rem' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 18, height: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:download-fill" />}
                  onClick={() => showToast('Export functionality will be implemented', 'info')}
                  size="small"
                  sx={{ fontSize: '0.8rem' }}
                >
                  Export
                </Button>
              </Grid>
            </Grid>
          </Box>
            <Divider />
          
          <Box sx={{ px: 1.5 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { fontSize: '0.85rem', py: 1.5 } }}>
              <Tab 
                label="All Activities" 
                icon={<Iconify icon="mdi:format-list-bulleted" sx={{ fontSize: '1rem' }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Sales" 
                icon={<Iconify icon="mdi:cash-multiple" sx={{ fontSize: '1rem' }} />} 
                iconPosition="start"
              />
              <Tab 
                label="Purchases" 
                icon={<Iconify icon="mdi:cart-arrow-down" sx={{ fontSize: '1rem' }} />} 
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
                />                <TableBody>
                  {filteredActivities.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                    const { doc_type: docType, activity1, activity2, activity3, username, actiondate } = row;
                    const selectedActivity = selected.indexOf(index) !== -1;

                    return (
                      <TableRow hover key={index} tabIndex={-1} role="checkbox" selected={selectedActivity}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedActivity} onChange={(event) => handleClick(event, index)} />
                        </TableCell>

                        {/* Type */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: alpha(getActivityColor(docType), 0.1),
                                color: getActivityColor(docType),
                              }}
                            >
                              <Iconify icon={getActivityIcon(docType)} width={16} />
                            </Avatar>
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                              {docType}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Activity */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {activity1}
                          </Typography>
                        </TableCell>

                        {/* Details */}
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {extractCustomerName(activity2)}
                            </Typography>
                            {extractAmount(activity2) && (
                              <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'success.main', fontWeight: 600 }}>
                                {extractAmount(activity2)}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Reference */}
                        <TableCell>
                          <Chip 
                            label={activity3} 
                            size="small" 
                            variant="outlined" 
                            sx={{ height: 22, fontSize: '0.75rem' }}
                          />
                        </TableCell>

                        {/* User */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 22, height: 22, fontSize: '0.75rem' }}>
                              {username.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                              {username}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                            {fDateTime(new Date(actiondate))}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <IconButton size="small" color="inherit" onClick={handleOpenMenu}>
                            <Iconify icon={'eva:more-vertical-fill'} width={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}                  {isNotFound && (
                    <TableRow>
                      <TableCell align="center" colSpan={7} sx={{ py: 2 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                            p: 2,
                          }}
                        >
                          <Typography variant="h6" paragraph sx={{ fontSize: '1rem' }}>
                            Not found
                          </Typography>

                          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
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
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}        PaperProps={{
          sx: {
            p: 1,
            width: 120,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
              fontSize: '0.8rem',
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
