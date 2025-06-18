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

import { GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import PageHeader from '../../../../components/PageHeader';
import Loader from '../../../../components/Loader';
import { useToast } from '../../../../hooks/Common';
import { getLastNumber, getLocationList } from '../../../../utils/CommonServices';

const StockAdjustmentEntry = () => {
  const theme = useTheme();
  const showToast = useToast();
  const navigate = useNavigate();
  const { id } = useParams();
  //   const { user } = useAuth(); 
  // headerData (
  // SANo	
  // SADate	
  // Status	
  // RefNo	
  // Location
  // Amount	
  // AdjType	
  // Remarks	
  // )
  // detailData(
  //   srno	
  // name	
  // desc	
  // qty		
  // price	
  // unit	
  // )
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);  const [adjustmentItems, setAdjustmentItems] = useState([{
    id: Date.now(),
    productId: '',
    productCode: '',
    productName: '',
    uom: '',
    currentStock: 0,
    adjustedStock: 0,
    adjustmentQty: 0,
    unitCost: 0,
    adjustmentValue: 0,
    reason: '',
  }]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const isNewRecord = (id === 'new');
  const isEditMode = !isNewRecord && !viewMode;

  // Form validation schema
  const validationSchema = Yup.object({
    SANo: Yup.string().required('Document number is required'),
    SADate: Yup.date().required('Document date is required'),
    RefNo: Yup.string().max(50, 'Reference number cannot exceed 50 characters'),
    Location: Yup.string().required('Location is required'),
    AdjType: Yup.string().required('Adjustment type is required'),
    remarks: Yup.string().max(500, 'Remarks cannot exceed 500 characters'),
  });

  const getLocations = async () => {
    const Data = await getLocationList();
    console.log('Locations Data:', Data);
    setLocations(Data);
  };
  const getProducts = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "ITEM_CRUD",
        "TYPE": "GET_ALL",
      });
      if (Success) {
        setProducts(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  };

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      id: null,
      SANo: '',
      SADate: new Date(),
      RefNo: '',
      Location: '',
      AdjType: 'Manual',
      remarks: '',
      status: 'PAID',
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
    if (id !== 'new') {
      loadStockAdjustment();
    } else {
      generateDocumentNumber();
    }
  }, [id]);
  const loadInitialData = async () => {
    try {
      setLoading(true);
      getLocations();
      getProducts(); 

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

      const stockAdjustment = dummyStockAdjustments[id];      if (stockAdjustment) {
        formik.setValues({
          ...stockAdjustment,
          documentDate: new Date(stockAdjustment.documentDate),
        });
        
        // Transform items to match our inline structure
        const transformedItems = stockAdjustment.items?.map(item => ({
          id: item.id || Date.now() + Math.random(),
          productId: item.productId,
          productCode: item.productCode,
          productName: item.productName,
          uom: item.uom,
          currentStock: item.currentStock,
          adjustedStock: item.adjustedStock,
          adjustmentQty: item.adjustmentQty,
          unitCost: item.unitCost,
          adjustmentValue: item.adjustmentValue,
          reason: item.reason || '',
        })) || [{
          id: Date.now(),
          productId: '',
          productCode: '',
          productName: '',
          uom: '',
          currentStock: 0,
          adjustedStock: 0,
          adjustmentQty: 0,
          unitCost: 0,
          adjustmentValue: 0,
          reason: '',
        }];
        
        setAdjustmentItems(transformedItems);
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

      const { lastNo, IsEditable } = await getLastNumber('SA');
      formik.setFieldValue('SANo', lastNo);
    } catch (error) {
      console.error('Error generating document number:', error);
    }
  };
  const validateItems = () => {
    const errors = [];
    const validItems = adjustmentItems.filter(item => item.productCode);
    
    if (validItems.length === 0) {
      errors.push('At least one product must be added');
    }
    
    validItems.forEach((item, index) => {
      if (!item.productCode) {
        errors.push(`Row ${index + 1}: Product is required`);
      }
      if (item.adjustmentQty === 0) {
        errors.push(`Row ${index + 1}: Adjustment quantity cannot be zero`);
      }
      if (item.unitCost < 0) {
        errors.push(`Row ${index + 1}: Unit cost cannot be negative`);
      }
    });
    
    return errors;
  };

  const handleSave = async (values) => {
    try {
      // Validate items first
      const itemErrors = validateItems();
      if (itemErrors.length > 0) {
        itemErrors.forEach(error => showToast.error(error));
        return;
      }
      
      setLoading(true);
      const validItems = adjustmentItems.filter(item => item.productCode);
      const payload = {
        ...values,
        items: validItems,
        totalValue: calculateTotalValue(),
      };

      let result;
      if (isNewRecord) {
        result = await GetSingleResult('StockAdjustment', payload);
        showToast.success('Stock adjustment created successfully');
      } else {
        result = await GetSingleResult('StockAdjustment', id, payload);
        showToast.success('Stock adjustment updated successfully');
      }
      
      if (result?.data) {
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

  const addItem = () => {
    setAdjustmentItems([...adjustmentItems, {
      id: Date.now(),
      productId: '',
      productCode: '',
      productName: '',
      uom: '',
      currentStock: 0,
      adjustedStock: 0,
      adjustmentQty: 0,
      unitCost: 0,
      adjustmentValue: 0,
      reason: '',
    }]);
  };

  const removeItem = (index) => {
    if (adjustmentItems.length > 1) {
      const newItems = [...adjustmentItems];
      newItems.splice(index, 1);
      setAdjustmentItems(newItems);
    }
  };

  const handleProductChange = (index, selectedProduct) => {
    if (!selectedProduct) return;

    const newItems = [...adjustmentItems];
    newItems[index] = {
      ...newItems[index],
      productId: selectedProduct.IM_ID || selectedProduct.id,
      productCode: selectedProduct.IM_CODE || selectedProduct.code,
      productName: selectedProduct.IM_DESC || selectedProduct.desc,
      uom: selectedProduct.IM_UNIT_CODE || selectedProduct.uom,
      currentStock: selectedProduct.IM_CLSQTY || selectedProduct.currentStock || 0,
      unitCost: selectedProduct.IM_COST || selectedProduct.unitCost || 0,
      adjustedStock: selectedProduct.IM_CLSQTY || selectedProduct.currentStock || 0,
      adjustmentQty: 0,
      adjustmentValue: 0,
    };
    setAdjustmentItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...adjustmentItems];
    const item = { ...newItems[index] };
    
    item[field] = value;

    // Recalculate based on field changes
    if (field === 'adjustedStock') {
      item.adjustmentQty = value - item.currentStock;
      item.adjustmentValue = item.adjustmentQty * item.unitCost;
    } else if (field === 'adjustmentQty') {
      item.adjustedStock = item.currentStock + value;
      item.adjustmentValue = value * item.unitCost;
    } else if (field === 'unitCost') {
      item.adjustmentValue = item.adjustmentQty * value;
    }

    newItems[index] = item;
    setAdjustmentItems(newItems);
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
  // Inline Product Row Component
  const InlineProductRow = ({ item, index, onProductChange, onItemChange, onRemove, products, viewMode }) => (
    <Grid container spacing={2} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
      <Grid item xs={12} md={2}>
        <Autocomplete
          options={products || []}
          getOptionLabel={(option) => `${option.IM_CODE} - ${option.IM_DESC}`}
          value={products.find(p => p.IM_CODE === item.productCode) || null}
          onChange={(event, newValue) => onProductChange(index, newValue)}
          disabled={viewMode}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Product"
              size="small"
              placeholder="Search product..."
              fullWidth
            />
          )}
        />
      </Grid>
      
      <Grid item xs={12} md={2}>
        <TextField
          fullWidth
          label="Description"
          value={item.productName}
          size="small"
          disabled
          multiline
          rows={1}
        />
      </Grid>
      
      <Grid item xs={6} md={1}>
        <TextField
          fullWidth
          label="UOM"
          value={item.uom}
          size="small"
          disabled
        />
      </Grid>
      
      <Grid item xs={6} md={1}>
        <TextField
          fullWidth
          label="Current Stock"
          value={item.currentStock}
          size="small"
          disabled
          inputProps={{ style: { textAlign: 'right' } }}
        />
      </Grid>
      
      <Grid item xs={6} md={1}>
        <TextField
          fullWidth
          label="Adjusted Stock"
          type="number"
          value={item.adjustedStock}
          onChange={(e) => onItemChange(index, 'adjustedStock', parseFloat(e.target.value) || 0)}
          disabled={viewMode}
          size="small"
          inputProps={{ style: { textAlign: 'right' } }}
        />
      </Grid>
      
      <Grid item xs={6} md={1}>
        <TextField
          fullWidth
          label="Adj. Qty"
          value={item.adjustmentQty}
          size="small"
          disabled
          inputProps={{ 
            style: { 
              textAlign: 'right', 
              color: item.adjustmentQty >= 0 ? theme.palette.success.main : theme.palette.error.main 
            } 
          }}
        />
      </Grid>
      
      <Grid item xs={6} md={1}>
        <TextField
          fullWidth
          label="Unit Cost"
          type="number"
          value={item.unitCost}
          onChange={(e) => onItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
          disabled={viewMode}
          size="small"
          inputProps={{ style: { textAlign: 'right' }, step: 0.01 }}
        />
      </Grid>
      
      <Grid item xs={6} md={1}>
        <TextField
          fullWidth
          label="Adj. Value"
          value={`AED ${item.adjustmentValue?.toFixed(2) || '0.00'}`}
          size="small"
          disabled
          inputProps={{ 
            style: { 
              textAlign: 'right', 
              color: item.adjustmentValue >= 0 ? theme.palette.success.main : theme.palette.error.main 
            } 
          }}
        />
      </Grid>
        <Grid item xs={10} md={1.2}>
        <TextField
          fullWidth
          label="Reason"
          value={item.reason}
          onChange={(e) => onItemChange(index, 'reason', e.target.value)}
          disabled={viewMode}
          size="small"
          placeholder="Enter reason"
        />
      </Grid>
      
      <Grid item xs={2} md={0.8} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!viewMode && (
          <IconButton
            size="small"
            onClick={() => onRemove(index)}
            color="error"
            disabled={adjustmentItems.length === 1}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Grid>
    </Grid>
  );  // Table columns for adjustment items (kept for reference, but using inline components now)
  const itemColumns = [
    {
      accessorKey: 'IM_CODE',
      header: 'Code',
      size: 120,
    },
    {
      accessorKey: 'IM_DESC',
      header: 'Description',
      size: 200,
    },
    {
      accessorKey: 'IM_UNIT_CODE',
      header: 'UNIT',
      size: 80,
    },
    {
      accessorKey: 'IM_CLSQTY',
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
      accessorKey: 'price',
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
    },
  ];

  if (loading) {
    return <Loader />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <PageHeader
          title={`Stock Adjustment ${isNewRecord ? 'Entry' : 'Details'}`}
          subtitle={isNewRecord ? 'Create new stock adjustment' : `Document No: ${formik.values.documentNo}`} breadcrumbs={[
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
                <Grid item xs={12} md={6} lg={2}>
                  <TextField
                    fullWidth
                    label="Document No"
                    name="SANo"
                    value={formik.values.SANo}
                    onChange={formik.handleChange}
                    error={formik.touched.SANo && Boolean(formik.errors.SANo)}
                    helperText={formik.touched.SANo && formik.errors.SANo}
                    disabled={!isNewRecord || viewMode}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={2}>
                  <DatePicker
                    label="Document Date"
                    value={formik.values.SADate}
                    onChange={(date) => formik.setFieldValue('SADate', date)}
                    disabled={viewMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        size="small"
                        error={formik.touched.SADate && Boolean(formik.errors.SADate)}
                        helperText={formik.touched.SADate && formik.errors.SADate}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={6} lg={2.5}>
                  <TextField
                    fullWidth
                    label="Reference No"
                    name="RefNo"
                    value={formik.values.RefNo}
                    onChange={formik.handleChange}
                    disabled={viewMode}
                    size="small"
                  />
                </Grid>

                {/* <Grid item xs={12} md={6} lg={3}>
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
                </Grid> */}

                <Grid item xs={12} md={2.5}>
                  <Autocomplete

                    options={locations || []}
                    getOptionLabel={(option) => `${option.LM_LOCATION_CODE} - ${option.LM_LOCATION_NAME}`}
                    value={locations.find(l => l.LM_LOCATION_CODE === formik.values.Location) || null}
                    onChange={(event, newValue) => formik.setFieldValue('Location', newValue?.LM_LOCATION_CODE || '')}
                    disabled={viewMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Location"
                        size="small"
                        error={formik.touched.Location && Boolean(formik.errors.Location)}
                        helperText={formik.touched.Location && formik.errors.Location}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    select
                    label="Adjustment Type"
                    name="AdjType"
                    value={formik.values.AdjType}
                    onChange={formik.handleChange}
                    error={formik.touched.AdjType && Boolean(formik.errors.AdjType)}
                    helperText={formik.touched.AdjType && formik.errors.AdjType}
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
          </Card>          {/* Adjustment Items */}
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
              <Divider sx={{ mb: 3 }} />
              
              {/* Inline Product Items */}
              <Box>
                {adjustmentItems.map((item, index) => (
                  <InlineProductRow
                    key={item.id || index}
                    item={item}
                    index={index}
                    onProductChange={handleProductChange}
                    onItemChange={handleItemChange}
                    onRemove={removeItem}
                    products={products}
                    viewMode={viewMode}
                  />
                ))}
                
                {/* Add Item Button */}
                {!viewMode && (
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={addItem}
                      sx={{
                        borderStyle: 'dashed',
                        borderWidth: 2,
                        py: 1.5,
                        px: 3,
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
                
                {/* Summary Section */}
                {adjustmentItems.length > 0 && (
                  <Box sx={{ mt: 3, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={3}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                          <Typography variant="caption" color="text.secondary">
                            Total Items
                          </Typography>
                          <Typography variant="h6" color="primary.main" fontWeight={600}>
                            {adjustmentItems.filter(item => item.productCode).length}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                          <Typography variant="caption" color="text.secondary">
                            Positive Adjustments
                          </Typography>
                          <Typography variant="h6" color="success.main" fontWeight={600}>
                            {adjustmentItems.filter(item => item.adjustmentQty > 0).length}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                          <Typography variant="caption" color="text.secondary">
                            Negative Adjustments
                          </Typography>
                          <Typography variant="h6" color="error.main" fontWeight={600}>
                            {adjustmentItems.filter(item => item.adjustmentQty < 0).length}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Paper elevation={1} sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                          <Typography variant="caption" color="text.secondary">
                            Net Value
                          </Typography>
                          <Typography 
                            variant="h6" 
                            fontWeight={600}
                            color={calculateTotalValue() >= 0 ? 'success.main' : 'error.main'}
                          >
                            AED {calculateTotalValue().toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                {adjustmentItems.length === 0 && (
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
                      Add products to create stock adjustments
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </form>
      </Box>
    </LocalizationProvider>
  );
};

export default StockAdjustmentEntry;
