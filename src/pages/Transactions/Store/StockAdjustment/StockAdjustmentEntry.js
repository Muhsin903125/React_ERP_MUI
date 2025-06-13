import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Edit as EditIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MaterialReactTable from 'material-react-table';
 
 import { GetSingleListResult  ,GetSingleResult  } from '../../../../hooks/Api';
import PageHeader from '../../../../components/PageHeader'; 
import Loader from '../../../../components/Loader';
import { useToast } from '../../../../hooks/Common';

const StockAdjustmentEntry = () => {
  const theme = useTheme();
    const showToast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
//   const { user } = useAuth(); 

  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [adjustmentItems, setAdjustmentItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const isNewRecord = id === 'new';
  const isEditMode = !isNewRecord && !viewMode;

  // Form validation schema
  const validationSchema = Yup.object({
    documentNo: Yup.string().required('Document number is required'),
    documentDate: Yup.date().required('Document date is required'),
    locationId: Yup.string().required('Location is required'),
    adjustmentType: Yup.string().required('Adjustment type is required'),
    remarks: Yup.string().max(500, 'Remarks cannot exceed 500 characters'),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      id: null,
      documentNo: '',
      documentDate: new Date(),
      referenceNo: '',
      locationId: '',
      adjustmentType: 'Manual',
      reason: '',
      remarks: '',
      status: 'Draft',
      totalValue: 0, 
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
      loadStockAdjustment();
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
          currentStock: 25,
          unitCost: 850.00
        },
        {
          id: 2,
          code: 'PROD002',
          name: 'Office Chair',
          uom: 'PCS',
          currentStock: 40,
          unitCost: 120.50
        },
        {
          id: 3,
          code: 'PROD003',
          name: 'Printer Paper A4',
          uom: 'BOX',
          currentStock: 150,
          unitCost: 15.75
        },
        {
          id: 4,
          code: 'PROD004',
          name: 'USB Cable',
          uom: 'PCS',
          currentStock: 80,
          unitCost: 8.25
        },
        {
          id: 5,
          code: 'PROD005',
          name: 'Monitor 24 inch',
          uom: 'PCS',
          currentStock: 15,
          unitCost: 285.00
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
  const loadStockAdjustment = async () => {
    try {
      setLoading(true);
      
      // Dummy data based on ID for testing
      const dummyStockAdjustments = {
        1: {
          id: 1,
          documentNo: 'SA-2024-001',
          documentDate: '2024-06-10T00:00:00Z',
          referenceNo: 'REF-001',
          locationId: 1,
          adjustmentType: 'Physical Count',
          reason: 'Annual inventory count',
          remarks: 'Stock adjustment after physical count',
          status: 'Posted',
          totalValue: 1250.75,
          items: [
            {
              id: 1,
              productId: 1,
              productCode: 'PROD001',
              productName: 'Laptop Computer',
              uom: 'PCS',
              currentStock: 25,
              adjustedStock: 27,
              adjustmentQty: 2,
              unitCost: 850.00,
              adjustmentValue: 1700.00,
              reason: 'Found additional units'
            },
            {
              id: 2,
              productId: 2,
              productCode: 'PROD002',
              productName: 'Office Chair',
              uom: 'PCS',
              currentStock: 40,
              adjustedStock: 36,
              adjustmentQty: -4,
              unitCost: 120.50,
              adjustmentValue: -482.00,
              reason: 'Missing from storage'
            }
          ]
        },
        2: {
          id: 2,
          documentNo: 'SA-2024-002',
          documentDate: '2024-06-11T00:00:00Z',
          referenceNo: 'REF-002',
          locationId: 2,
          adjustmentType: 'Damage',
          reason: 'Water damage',
          remarks: 'Damaged goods adjustment',
          status: 'Draft',
          totalValue: -850.50,
          items: [
            {
              id: 1,
              productId: 3,
              productCode: 'PROD003',
              productName: 'Printer Paper A4',
              uom: 'BOX',
              currentStock: 150,
              adjustedStock: 100,
              adjustmentQty: -50,
              unitCost: 15.75,
              adjustmentValue: -787.50,
              reason: 'Water damaged'
            }
          ]
        }
      };

      const stockAdjustment = dummyStockAdjustments[id];
      
      if (stockAdjustment) {
        formik.setValues({
          ...stockAdjustment,
          documentDate: new Date(stockAdjustment.documentDate),
        });
        setAdjustmentItems(stockAdjustment.items || []);
      }

      // Uncomment below to use real API when backend is ready
      // const result = await GetSingleResult('StockAdjustment', id);
      // if (result?.data) {
      //   const data = result.data;
      //   formik.setValues({
      //     ...data,
      //     documentDate: new Date(data.documentDate),
      //   });
      //   setAdjustmentItems(data.items || []);
      // }
    } catch (error) {
      console.error('Error loading stock adjustment:', error);
      showToast.error('Failed to load stock adjustment');
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
      const documentNo = `SA-${year}-${nextNumber}`;
      
      formik.setFieldValue('documentNo', documentNo);

      // Uncomment below to use real API when backend is ready
      // const result = await GetSingleResult('StockAdjustment', 'GetNextDocumentNumber');
      // if (result?.data) {
      //   formik.setFieldValue('documentNo', result.data);
      // }
    } catch (error) {
      console.error('Error generating document number:', error);
    }
  };

  const handleSave = async (values) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        items: adjustmentItems,
        totalValue: calculateTotalValue(),
      };

      let result;
      if (isNewRecord) {
        result = await GetSingleResult('StockAdjustment', payload);
        showToast.success('Stock adjustment created successfully');
      } else {
        result = await GetSingleResult('StockAdjustment', id, payload);
        showToast.success('Stock adjustment updated successfully');
      }      if (result?.data) {
        navigate('/stock-adjustment');
      }
    } catch (error) {
      console.error('Error saving stock adjustment:', error);
      showToast.error('Failed to save stock adjustment');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalValue = () => {
    return adjustmentItems.reduce((total, item) => {
      return total + (item.adjustmentValue || 0);
    }, 0);
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      showToast.error('Please select a product');
      return;
    }

    const newItem = {
      id: Date.now(),
      productId: selectedProduct.id,
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      uom: selectedProduct.uom,
      currentStock: selectedProduct.currentStock || 0,
      adjustedStock: 0,
      adjustmentQty: 0,
      unitCost: selectedProduct.unitCost || 0,
      adjustmentValue: 0,
      reason: '',
    };

    setAdjustmentItems([...adjustmentItems, newItem]);
    setSelectedProduct(null);
  };

  const handleRemoveItem = (itemId) => {
    setAdjustmentItems(adjustmentItems.filter(item => item.id !== itemId));
  };

  const handleItemChange = (itemId, field, value) => {
    setAdjustmentItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate based on field changes
        if (field === 'adjustedStock') {
          updatedItem.adjustmentQty = value - updatedItem.currentStock;
          updatedItem.adjustmentValue = updatedItem.adjustmentQty * updatedItem.unitCost;
        } else if (field === 'adjustmentQty') {
          updatedItem.adjustedStock = updatedItem.currentStock + value;
          updatedItem.adjustmentValue = value * updatedItem.unitCost;
        } else if (field === 'unitCost') {
          updatedItem.adjustmentValue = updatedItem.adjustmentQty * value;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Table columns for adjustment items
  const itemColumns = [
    {
      accessorKey: 'productCode',
      header: 'Product Code',
      size: 120,
    },
    {
      accessorKey: 'productName',
      header: 'Product Name',
      size: 200,
    },
    {
      accessorKey: 'uom',
      header: 'UOM',
      size: 80,
    },
    {
      accessorKey: 'currentStock',
      header: 'Current Stock',
      size: 120,
      Cell: ({ cell }) => (
        <Typography variant="body2" align="right">
          {cell.getValue()?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      accessorKey: 'adjustedStock',
      header: 'Adjusted Stock',
      size: 120,
      Cell: ({ cell, row }) => (
        <TextField
          size="small"
          type="number"
          value={cell.getValue() || 0}
          onChange={(e) => handleItemChange(row.original.id, 'adjustedStock', parseFloat(e.target.value) || 0)}
          disabled={viewMode}
          sx={{ width: '100%' }}
          inputProps={{ style: { textAlign: 'right' } }}
        />
      ),
    },
    {
      accessorKey: 'adjustmentQty',
      header: 'Adjustment Qty',
      size: 120,
      Cell: ({ cell, row }) => (
        <Typography 
          variant="body2" 
          align="right"
          color={cell.getValue() >= 0 ? 'success.main' : 'error.main'}
          fontWeight={600}
        >
          {cell.getValue()?.toLocaleString() || '0'}
        </Typography>
      ),
    },
    {
      accessorKey: 'unitCost',
      header: 'Unit Cost',
      size: 100,
      Cell: ({ cell, row }) => (
        <TextField
          size="small"
          type="number"
          value={cell.getValue() || 0}
          onChange={(e) => handleItemChange(row.original.id, 'unitCost', parseFloat(e.target.value) || 0)}
          disabled={viewMode}
          sx={{ width: '100%' }}
          inputProps={{ style: { textAlign: 'right' }, step: 0.01 }}
        />
      ),
    },
    {
      accessorKey: 'adjustmentValue',
      header: 'Adjustment Value',
      size: 120,
      Cell: ({ cell }) => (
        <Typography 
          variant="body2" 
          align="right"
          color={cell.getValue() >= 0 ? 'success.main' : 'error.main'}
          fontWeight={600}
        >
          AED {cell.getValue()?.toFixed(2) || '0.00'}
        </Typography>
      ),
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
      size: 150,
      Cell: ({ cell, row }) => (
        <TextField
          size="small"
          value={cell.getValue() || ''}
          onChange={(e) => handleItemChange(row.original.id, 'reason', e.target.value)}
          disabled={viewMode}
          sx={{ width: '100%' }}
          placeholder="Enter reason"
        />
      ),
    },  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <PageHeader
          title={`Stock Adjustment ${isNewRecord ? 'Entry' : 'Details'}`}
          subtitle={isNewRecord ? 'Create new stock adjustment' : `Document No: ${formik.values.documentNo}`}          breadcrumbs={[
            { title: 'Transactions', path: '/transactions' },
            { title: 'Store', path: '/transactions/store' },
            { title: 'Stock Adjustments', path: '/stock-adjustment' },
            { title: isNewRecord ? 'New Entry' : 'Edit Entry' }
          ]}
          action={
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/transactions/store/stockadjustment')}
              >
                Back to List
              </Button>
              {!isNewRecord && viewMode && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setViewMode(false)}
                >
                  Edit
                </Button>
              )}
              {!viewMode && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={() => navigate('/transactions/store/stockadjustment')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={formik.handleSubmit}
                    disabled={loading}
                  >
                    Save
                  </Button>
                </>
              )}
            </Stack>
          }
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
                    label="Reference No"
                    name="referenceNo"
                    value={formik.values.referenceNo}
                    onChange={formik.handleChange}
                    disabled={viewMode}
                    size="small"
                  />
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
                    <MenuItem value="Posted">Posted</MenuItem>
                    <MenuItem value="Cancelled">Cancelled</MenuItem>
                  </TextField>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={locations}
                    getOptionLabel={(option) => `${option.code} - ${option.name}`}
                    value={locations.find(loc => loc.id === formik.values.locationId) || null}
                    onChange={(event, newValue) => formik.setFieldValue('locationId', newValue?.id || '')}
                    disabled={viewMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Location"
                        size="small"
                        error={formik.touched.locationId && Boolean(formik.errors.locationId)}
                        helperText={formik.touched.locationId && formik.errors.locationId}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Adjustment Type"
                    name="adjustmentType"
                    value={formik.values.adjustmentType}
                    onChange={formik.handleChange}
                    error={formik.touched.adjustmentType && Boolean(formik.errors.adjustmentType)}
                    helperText={formik.touched.adjustmentType && formik.errors.adjustmentType}
                    disabled={viewMode}
                    size="small"
                  >
                    <MenuItem value="Manual">Manual</MenuItem>
                    <MenuItem value="System">System</MenuItem>
                    <MenuItem value="Physical Count">Physical Count</MenuItem>
                    <MenuItem value="Damage">Damage</MenuItem>
                    <MenuItem value="Expiry">Expiry</MenuItem>
                  </TextField>
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

          {/* Product Selection */}
          {!viewMode && (
            <Card sx={{ mt: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                  Add Product
                </Typography>
                <Divider sx={{ mb: 3 }} />
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={10}>
                    <Autocomplete
                      options={products}
                      getOptionLabel={(option) => `${option.code} - ${option.name}`}
                      value={selectedProduct}
                      onChange={(event, newValue) => setSelectedProduct(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Select Product"
                          size="small"
                          placeholder="Search by product code or name"
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAddItem}
                      disabled={!selectedProduct}
                    >
                      Add Item
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Adjustment Items */}
          <Card sx={{ mt: 3, borderRadius: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="primary" fontWeight={600}>
                  Adjustment Items
                </Typography>
                <Paper
                  elevation={1}
                  sx={{
                    px: 2,
                    py: 1,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Total Value: AED {calculateTotalValue().toFixed(2)}
                  </Typography>
                </Paper>
              </Box>
              <Divider sx={{ mb: 2 }} />
                {adjustmentItems.length > 0 ? (
                <MaterialReactTable
                  columns={itemColumns}
                  data={adjustmentItems}
                  enableColumnActions={false}
                  enableColumnFilters={false}
                  enablePagination={false}
                  enableSorting={false}
                  enableTopToolbar={false}
                  enableBottomToolbar={false}
                  muiTableHeadCellProps={{
                    sx: {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      fontWeight: 600,
                    },
                  }}
                  enableRowActions={!viewMode}
                  renderRowActions={({ row }) => (
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(row.original.id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                />
              ) : (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 8,
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    No items added yet
                  </Typography>
                  <Typography variant="body2">
                    Add products to create stock adjustments
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default StockAdjustmentEntry;
