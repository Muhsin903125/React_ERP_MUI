import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Typography,
  Divider,
  Stack,
  Alert,
  Autocomplete,
  MenuItem,
  Select,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Print as PrintIcon,
  Edit as EditIcon,
  SwapHoriz as TransferIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
 
import { GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import PageHeader from '../../../../components/PageHeader'; 
import Loader from '../../../../components/Loader';
import { useToast } from '../../../../hooks/Common';
import Confirm from '../../../../components/Confirm';

// Inline Transfer Item Row Component
const InlineTransferItemRow = ({ 
  item, 
  index, 
  onProductChange, 
  onItemChange, 
  onRemove, 
  products, 
  isEditMode, 
  transferItemsLength,
  fromLocationId,
  getAvailableStock 
}) => {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        mb: 0.5,
        p: { xs: 1, md: 1 },
        borderRadius: 3,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1,
        width: '100%'
      }}
    >
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 20%' }, minWidth: 200 }}>
        <Autocomplete
          options={products || []}
          getOptionLabel={(option) => `${option.code} - ${option.name}`}
          value={products?.find(p => p.id === item.productId) || null}
          onChange={(event, newValue) => onProductChange(index, newValue)}
          disabled={!isEditMode}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product"
              size="small"
              placeholder="Search product..."
              fullWidth
              variant="outlined"
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  {option.code} - {option.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Available: {getAvailableStock(option.id, fromLocationId)} {option.uom}
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 25%' }, minWidth: 200 }}>
        <TextField
          fullWidth
          label="Product Name"
          name={`ItemName_${index}`}
          value={item.productName || ''}
          size="small"
          disabled 
          variant="outlined"
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 8%' }, minWidth: 80 }}>
        <TextField
          fullWidth
          label="UOM"
          name={`ItemUOM_${index}`}
          value={item.uom || ''}
          size="small"
          disabled
          variant="outlined"
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 10%' }, minWidth: 100 }}>
        <TextField
          fullWidth
          label="Available"
          name={`ItemAvailable_${index}`}
          value={item.availableStock || '0'}
          size="small"
          disabled
          inputProps={{ style: { textAlign: 'right' } }}
          variant="outlined"
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 10%' }, minWidth: 100 }}>
        <TextField
          fullWidth
          label="Transfer Qty"
          name={`ItemQty_${index}`}
          type="number"
          value={item.transferQty || ''}
          onChange={onItemChange}
          disabled={!isEditMode}
          size="small"
          inputProps={{ 
            style: { textAlign: 'right' },
            min: 0,
            max: item.availableStock || 0
          }}
          variant="outlined"
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 10%' }, minWidth: 100 }}>
        <TextField
          fullWidth
          label="Unit Cost"
          name={`ItemCost_${index}`}
          type="number"
          value={item.unitCost || ''}
          onChange={onItemChange}
          disabled={!isEditMode}
          size="small"
          inputProps={{ style: { textAlign: 'right' }, step: 0.01, min: 0 }}
          variant="outlined"
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 12%' }, minWidth: 120 }}>
        <TextField
          fullWidth
          label="Total Value"
          name={`ItemTotal_${index}`}
          value={`AED ${(item.totalValue || 0).toFixed(2)}`}
          size="small"
          disabled
          inputProps={{ style: { textAlign: 'right', fontWeight: 600 } }}
          variant="outlined"
          sx={{
            '& .MuiInputBase-input': {
              color: theme.palette.success.main,
              fontWeight: 600
            }
          }}
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 15%' }, minWidth: 150 }}>
        <TextField
          fullWidth
          label="Remarks"
          name={`ItemRemarks_${index}`}
          value={item.remarks || ''}
          onChange={onItemChange}
          disabled={!isEditMode}
          size="small"
          placeholder="Enter remarks"
          variant="outlined"
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 100%', md: '0 0 40px' }, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 40 }}>
        {isEditMode && (
          <Tooltip title="Remove Item">
            <span>
              <IconButton
                size="small"
                onClick={() => onRemove(index)}
                color="error"
                disabled={transferItemsLength === 1}
                sx={{ bgcolor: 'error.lighter', '&:hover': { bgcolor: 'error.light' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    </Paper>
  );
};

const TransferEntry = () => {
  const theme = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(searchParams.get('mode') === 'view');
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [transferItems, setTransferItems] = useState([{
    id: `item_${Date.now()}`,
    srno: 1,
    productId: '',
    productCode: '',
    productName: '',
    uom: '',
    availableStock: 0,
    transferQty: 0,
    unitCost: 0,
    totalValue: 0,
    remarks: '',
  }]);

  const isNewRecord = id === 'new';
  const [isEditMode, setIsEditMode] = useState(isNewRecord || !viewMode);

  // Form validation schema
  const validationSchema = Yup.object({
    documentNo: Yup.string().required('Document number is required'),
    documentDate: Yup.date().required('Document date is required'),
    fromLocationId: Yup.string().required('From location is required'),
    toLocationId: Yup.string().required('To location is required'),
    transferType: Yup.string().required('Transfer type is required'),
    remarks: Yup.string().max(500, 'Remarks cannot exceed 500 characters'),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      id: null,
      documentNo: '',
      documentDate: new Date(),
      fromLocationId: '',
      toLocationId: '',
      transferType: 'Location Transfer',
      remarks: '',
      status: 'Draft',
      totalValue: 0,
      totalQty: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSave(values);
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
    if (!isNewRecord) {
      loadTransfer();
    } else {
      generateDocumentNumber();
    }
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Dummy data for testing
      const dummyProducts = [
        {
          id: 1,
          code: 'PROD001',
          name: 'Laptop Computer',
          uom: 'PCS',
          unitCost: 850.00,
          locations: [
            { locationId: 1, stock: 25 },
            { locationId: 2, stock: 15 },
            { locationId: 3, stock: 8 }
          ]
        },
        {
          id: 2,
          code: 'PROD002',
          name: 'Office Chair',
          uom: 'PCS',
          unitCost: 120.50,
          locations: [
            { locationId: 1, stock: 40 },
            { locationId: 2, stock: 20 },
            { locationId: 3, stock: 12 }
          ]
        },
        {
          id: 3,
          code: 'PROD003',
          name: 'Printer Paper A4',
          uom: 'BOX',
          unitCost: 15.75,
          locations: [
            { locationId: 1, stock: 150 },
            { locationId: 2, stock: 80 },
            { locationId: 3, stock: 45 }
          ]
        },
        {
          id: 4,
          code: 'PROD004',
          name: 'USB Cable',
          uom: 'PCS',
          unitCost: 8.25,
          locations: [
            { locationId: 1, stock: 80 },
            { locationId: 2, stock: 35 },
            { locationId: 3, stock: 20 }
          ]
        },
        {
          id: 5,
          code: 'PROD005',
          name: 'Monitor 24 inch',
          uom: 'PCS',
          unitCost: 285.00,
          locations: [
            { locationId: 1, stock: 15 },
            { locationId: 2, stock: 8 },
            { locationId: 3, stock: 5 }
          ]
        }
      ];

      const dummyLocations = [
        {
          id: 1,
          code: 'MW001',
          name: 'Main Warehouse'
        },
        {
          id: 2,
          code: 'SS002',
          name: 'Secondary Store'
        },
        {
          id: 3,
          code: 'BS003',
          name: 'Branch Store'
        },
        {
          id: 4,
          code: 'RT004',
          name: 'Retail Outlet'
        }
      ];

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setProducts(dummyProducts);
      setLocations(dummyLocations);

      // Uncomment below to use real API when backend is ready
      // const [productsResult, locationsResult] = await Promise.all([
      //   GetSingleListResult('Product', 'GetProductList'),
      //   GetSingleListResult('Location', 'GetLocationList'),
      // ]);
      // if (productsResult?.data) setProducts(productsResult.data);
      // if (locationsResult?.data) setLocations(locationsResult.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const loadTransfer = async () => {
    try {
      setLoading(true);
      
      // Dummy data based on ID for testing
      const dummyTransfers = {
        1: {
          id: 1,
          documentNo: 'ST-2024-001',
          documentDate: '2024-06-10T00:00:00Z',
          fromLocationId: 1,
          toLocationId: 2,
          transferType: 'Location Transfer',
          remarks: 'Regular stock transfer between locations',
          status: 'Completed',
          totalValue: 2150.75,
          totalQty: 45,
          items: [
            {
              id: 1,
              productId: 1,
              productCode: 'PROD001',
              productName: 'Laptop Computer',
              uom: 'PCS',
              availableStock: 25,
              transferQty: 3,
              unitCost: 850.00,
              totalValue: 2550.00,
              remarks: 'High demand item'
            },
            {
              id: 2,
              productId: 2,
              productCode: 'PROD002',
              productName: 'Office Chair',
              uom: 'PCS',
              availableStock: 40,
              transferQty: 5,
              unitCost: 120.50,
              totalValue: 602.50,
              remarks: 'Regular transfer'
            }
          ]
        },
        2: {
          id: 2,
          documentNo: 'ST-2024-002',
          documentDate: '2024-06-11T00:00:00Z',
          fromLocationId: 2,
          toLocationId: 3,
          transferType: 'Urgent Transfer',
          remarks: 'Urgent transfer for stock shortage',
          status: 'In Transit',
          totalValue: 890.50,
          totalQty: 15,
          items: [
            {
              id: 1,
              productId: 3,
              productCode: 'PROD003',
              productName: 'Printer Paper A4',
              uom: 'BOX',
              availableStock: 80,
              transferQty: 20,
              unitCost: 15.75,
              totalValue: 315.00,
              remarks: 'Urgent requirement'
            }
          ]
        }
      };

      const transfer = dummyTransfers[id];
      
      if (transfer) {
        formik.setValues({
          ...transfer,
          documentDate: new Date(transfer.documentDate),
        });
        setTransferItems(transfer.items || []);
      }

      // Uncomment below to use real API when backend is ready
      // const result = await GetSingleResult('Transfer', id);
      // if (result?.data) {
      //   const data = result.data;
      //   formik.setValues({
      //     ...data,
      //     documentDate: new Date(data.documentDate),
      //   });
      //   setTransferItems(data.items || []);
      // }
    } catch (error) {
      console.error('Error loading transfer:', error);
      showToast.error('Failed to load transfer');
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentNumber = async () => {
    try {
      // Generate dummy document number for testing
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const nextNumber = String(Math.floor(Math.random() * 900) + 100).padStart(3, '0');
      const documentNo = `ST-${year}-${nextNumber}`;
      
      formik.setFieldValue('documentNo', documentNo);

      // Uncomment below to use real API when backend is ready
      // const result = await GetSingleResult('Transfer', 'GetNextDocumentNumber');
      // if (result?.data) {
      //   formik.setFieldValue('documentNo', result.data);
      // }
    } catch (error) {
      console.error('Error generating document number:', error);
    }
  };

  const handleSave = async (values) => {
    try {
      // Validate items first
      const itemErrors = validateItems();
      if (itemErrors.length > 0) {
        itemErrors.forEach(error => showToast(error, 'error'));
        return;
      }

      setLoading(true);

      Confirm(`Do you want to ${isNewRecord ? 'create' : 'update'} this transfer?`).then(async () => {
        try {
          const payload = {
            ...values,
            items: transferItems.filter(item => item.productId), // Only include items with products
            totalValue: calculateTotalValue(),
            totalQty: calculateTotalQty(),
          };

          // Simulate API call for testing
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (isNewRecord) {
            showToast('Transfer created successfully', 'success');
          } else {
            showToast('Transfer updated successfully', 'success');
          }
          
          navigate('/transfer');

        } catch (error) {
          console.error('Error saving transfer:', error);
          showToast('Failed to save transfer', 'error');
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error saving transfer:', error);
      showToast('Failed to save transfer', 'error');
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return transferItems.reduce((total, item) => {
      return total + (item.totalValue || 0);
    }, 0);
  };

  const calculateTotalQty = () => {
    return transferItems.reduce((total, item) => {
      return total + (item.transferQty || 0);
    }, 0);
  };

  const getAvailableStock = (productId, locationId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const locationStock = product.locations?.find(l => l.locationId === locationId);
    return locationStock?.stock || 0;
  };

  const addItem = () => {
    setTransferItems(prevItems => [
      ...prevItems,
      {
        id: `item_${Date.now()}_${prevItems.length}`,
        srno: prevItems.length + 1,
        productId: '',
        productCode: '',
        productName: '',
        uom: '',
        availableStock: 0,
        transferQty: 0,
        unitCost: 0,
        totalValue: 0,
        remarks: '',
      }
    ]);
  };

  const removeItem = (index) => {
    if (transferItems.length === 1) {
      showToast('At least one item must be present', 'error');
      return;
    }

    setTransferItems(prevItems => {
      const newItems = [...prevItems];
      newItems.splice(index, 1);
      return newItems;
    });
  };

  const handleProductChange = (index, selectedProduct) => {
    if (!selectedProduct) return;

    if (!formik.values.fromLocationId) {
      showToast('Please select from location first', 'error');
      return;
    }

    // Check if product already exists in transfer items
    const existingItemIndex = transferItems.findIndex((item, idx) => 
      idx !== index && item.productId === selectedProduct.id
    );
    
    if (existingItemIndex !== -1) {
      showToast('Product already added to transfer', 'error');
      return;
    }

    const availableStock = getAvailableStock(selectedProduct.id, formik.values.fromLocationId);

    setTransferItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = {
        ...newItems[index],
        srno: index + 1,
        productId: selectedProduct.id,
        productCode: selectedProduct.code,
        productName: selectedProduct.name,
        uom: selectedProduct.uom,
        availableStock: availableStock || 0,
        transferQty: 0,
        unitCost: selectedProduct.unitCost || 0,
        totalValue: 0,
        remarks: '',
      };
      return newItems;
    });
  };

  const handleItemChange = useCallback((event) => {
    const { name, value } = event.target;

    // Extract index and field from name (e.g., "ItemQty_0", "ItemCost_1")
    const [fieldName, index] = name.split('_');
    const itemIndex = parseInt(index, 10);

    setTransferItems(prevItems => {
      const newItems = [...prevItems];

      if (fieldName === 'ItemQty') {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
        
        // Validate against available stock
        if (numValue > newItems[itemIndex].availableStock) {
          showToast('Transfer quantity cannot exceed available stock', 'error');
          return prevItems;
        }

        newItems[itemIndex] = {
          ...newItems[itemIndex],
          transferQty: numValue,
          totalValue: numValue * (newItems[itemIndex].unitCost || 0)
        };
      } else if (fieldName === 'ItemCost') {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          unitCost: numValue,
          totalValue: (newItems[itemIndex].transferQty || 0) * numValue
        };
      } else if (fieldName === 'ItemRemarks') {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          remarks: value
        };
      }

      return newItems;
    });
  }, []);

  const validateItems = () => {
    const errors = [];
    const validItems = transferItems.filter(item => item.productId);

    if (validItems.length === 0) {
      errors.push('At least one product must be added');
    }

    validItems.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Row ${index + 1}: Product is required`);
      }
      if (item.transferQty === 0) {
        errors.push(`Row ${index + 1}: Transfer quantity cannot be zero`);
      }
      if (item.transferQty > item.availableStock) {
        errors.push(`Row ${index + 1}: Transfer quantity cannot exceed available stock`);
      }
      if (item.unitCost < 0) {
        errors.push(`Row ${index + 1}: Unit cost cannot be negative`);
      }
    });

    return errors;
  };

  // Update available stock when from location changes
  useEffect(() => {
    if (formik.values.fromLocationId) {
      setTransferItems(prev => prev.map(item => ({
        ...item,
        availableStock: getAvailableStock(item.productId, formik.values.fromLocationId)
      })));
    }
  }, [formik.values.fromLocationId, products]);

  const handleNewTransfer = () => {
    formik.resetForm();
    setTransferItems([{
      id: `item_${Date.now()}`,
      srno: 1,
      productId: '',
      productCode: '',
      productName: '',
      uom: '',
      availableStock: 0,
      transferQty: 0,
      unitCost: 0,
      totalValue: 0,
      remarks: '',
    }]);
    setIsEditMode(true);
    navigate('/transfer-entry/new', { replace: true });
  };

  const toggleEditMode = () => {
    if (id && id !== 'new') {
      loadTransfer();
    }
    if (transferItems.length === 0)
      handleNewTransfer();

    setIsEditMode(!isEditMode);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 0 }}>
        <PageHeader
          title={`Stock Transfer ${isNewRecord ? 'Entry' : 'Details'}`}
          subtitle={isNewRecord ? 'Create new stock transfer' : `Document No: ${formik.values.documentNo}`}
          breadcrumbs={[
            { title: 'Transactions', path: '/transactions' },
            { title: 'Store', path: '/transactions/store' },
            { title: 'Stock Transfers', path: '/transfer' },
            { title: isNewRecord ? 'New Entry' : (isEditMode ? 'Edit' : 'View') }
          ]}
          actions={[
            {
              label: 'Enable Edit',
              icon: 'eva:edit-fill',
              variant: 'contained',
              color: 'primary',
              type: 'enableEdit',
              show: !isEditMode,
              showInActions: false,
            },
            {
              label: 'Cancel Edit',
              icon: 'eva:close-fill',
              variant: 'contained',
              color: 'secondary',
              onClick: toggleEditMode,
              show: isEditMode,
              showInActions: false,
            },
            {
              label: 'New Transfer',
              icon: 'eva:plus-fill',
              variant: 'contained',
              onClick: handleNewTransfer,
              show: true,
              showInActions: true,
            },
          ]}
        />

        <form onSubmit={formik.handleSubmit}>
          {/* Header Information */}
          <Card sx={{ mt: 3, borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                Document Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={3}>
                  <TextField
                    fullWidth
                    label="Document No"
                    name="documentNo"
                    value={formik.values.documentNo}
                    onChange={formik.handleChange}
                    error={formik.touched.documentNo && Boolean(formik.errors.documentNo)}
                    helperText={formik.touched.documentNo && formik.errors.documentNo}
                    disabled={!isNewRecord || viewMode}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <DatePicker
                    label="Document Date"
                    value={formik.values.documentDate}
                    onChange={(date) => formik.setFieldValue('documentDate', date)}
                    disabled={viewMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        size="small"
                        error={formik.touched.documentDate && Boolean(formik.errors.documentDate)}
                        helperText={formik.touched.documentDate && formik.errors.documentDate}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <TextField
                    fullWidth
                    select
                    label="Transfer Type"
                    name="transferType"
                    value={formik.values.transferType}
                    onChange={formik.handleChange}
                    error={formik.touched.transferType && Boolean(formik.errors.transferType)}
                    helperText={formik.touched.transferType && formik.errors.transferType}
                    disabled={viewMode}
                    size="small"
                  >
                    <MenuItem value="Location Transfer">Location Transfer</MenuItem>
                    <MenuItem value="Urgent Transfer">Urgent Transfer</MenuItem>
                    <MenuItem value="Return Transfer">Return Transfer</MenuItem>
                    <MenuItem value="Bulk Transfer">Bulk Transfer</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={6} lg={3}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    disabled={viewMode}
                    size="small"
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                    <MenuItem value="In Transit">In Transit</MenuItem>
                    <MenuItem value="Completed">Completed</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={locations}
                    getOptionLabel={(option) => `${option.code} - ${option.name}`}
                    value={locations.find(loc => loc.id === formik.values.fromLocationId) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('fromLocationId', newValue?.id || '');
                      // Clear to location if same as from location
                      if (newValue?.id === formik.values.toLocationId) {
                        formik.setFieldValue('toLocationId', '');
                      }
                    }}
                    disabled={viewMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="From Location"
                        size="small"
                        error={formik.touched.fromLocationId && Boolean(formik.errors.fromLocationId)}
                        helperText={formik.touched.fromLocationId && formik.errors.fromLocationId}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <TransferIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={locations.filter(loc => loc.id !== formik.values.fromLocationId)}
                    getOptionLabel={(option) => `${option.code} - ${option.name}`}
                    value={locations.find(loc => loc.id === formik.values.toLocationId) || null}
                    onChange={(event, newValue) => formik.setFieldValue('toLocationId', newValue?.id || '')}
                    disabled={viewMode || !formik.values.fromLocationId}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="To Location"
                        size="small"
                        error={formik.touched.toLocationId && Boolean(formik.errors.toLocationId)}
                        helperText={formik.touched.toLocationId && formik.errors.toLocationId}
                        placeholder={!formik.values.fromLocationId ? "Select from location first" : "Select destination"}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    name="remarks"
                    value={formik.values.remarks}
                    onChange={formik.handleChange}
                    multiline
                    rows={3}
                    disabled={viewMode}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Transfer Items */}
          <Card sx={{ mt: 3, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  Transfer Items
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Paper
                    elevation={1}
                    sx={{
                      px: 2,
                      py: 1,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Total Qty: {calculateTotalQty()}
                    </Typography>
                  </Paper>
                  <Paper
                    elevation={1}
                    sx={{
                      px: 2,
                      py: 1,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      Total Value: AED {calculateTotalValue().toFixed(2)}
                    </Typography>
                  </Paper>
                </Stack>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Inline Transfer Items */}
              <Box>
                {transferItems.map((item, index) => (
                  <InlineTransferItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    onProductChange={handleProductChange}
                    onItemChange={handleItemChange}
                    onRemove={removeItem}
                    products={products}
                    isEditMode={isEditMode}
                    transferItemsLength={transferItems.length}
                    fromLocationId={formik.values.fromLocationId}
                    getAvailableStock={getAvailableStock}
                  />
                ))}

                {/* Add Item Button */}
                {isEditMode && (
                  <Box sx={{ mt: 1.5, ml: 1, textAlign: 'left' }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addItem}
                      sx={{
                        '&:hover': {
                          borderStyle: 'solid',
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        }
                      }}
                    >
                      Add Item
                    </Button>
                  </Box>
                )}

                {transferItems.length === 0 && (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      color: 'text.secondary',
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      No items added yet
                    </Typography>
                    <Typography variant="body2">
                      Add products to create stock transfer
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Action Buttons */}
              {isEditMode && (
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    sx={{ minWidth: 120 }}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (isNewRecord ? 'Create' : 'Update')}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default TransferEntry;
