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
import Confirm from '../../../../components/Confirm';

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
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  const [adjustmentItems, setAdjustmentItems] = useState([{
    srno: 1,
    name: '',
    desc: '',
    stockQty: 0,
    qty: 0,
    price: 0,
    unit: '',
    reason: '',
  }]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isEditMode, setIsEditMode] = useState(true);
  const isNewRecord = (id === null || id === 'new' || id === undefined || id === '0');

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
    if (isNewRecord) {
      generateDocumentNumber();
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



      const { Data, Success } = await GetSingleResult({
        "key": "SA_CRUD",
        "TYPE": "GET",
        "DOC_NO": id || '',
      });
      if (Success) {
        formik.setValues({
          ...Data.headerData,
          SADate: new Date(Data.headerData.SADate),
          SANo: Data.headerData.SANo,
          Location: Data.headerData.Location,
          RefNo: Data.headerData.RefNo || '',
          AdjType: Data.headerData.AdjType || 'Manual',
          remarks: Data.headerData.remarks || '',
          totalValue: Data.headerData.totalValue || 0,
        });
        // Transform items to match our inline structure
        const transformedItems = Data.detailData.map((item, index) => ({
          srno: index + 1,
          id: item.id || Date.now(), // Use existing ID or generate a new one
          name: item.name || item.IM_CODE || '',
          desc: item.desc || item.IM_DESC || '',
          unit: item.unit || item.IM_UNIT_CODE || '',
          currentStock: item.stockQty || item.IM_CLSQTY || 0,
          qty: item.qty || 0,
          price: item.price || item.IM_COST || 0,
          reason: item.reason || ''
        }));

        setAdjustmentItems(transformedItems);
      }

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
    const validItems = adjustmentItems.filter(item => item.name);

    if (validItems.length === 0) {
      errors.push('At least one product must be added');
    }

    validItems.forEach((item, index) => {
      if (!item.name) {
        errors.push(`Row ${index + 1}: Product is required`);
      }
      if (item.qty === 0) {
        errors.push(`Row ${index + 1}: Adjustment quantity cannot be zero`);
      }
      if (item.price < 0) {
        errors.push(`Row ${index + 1}: Price cannot be negative`);
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

      Confirm(`Do you want to ${isEditMode || id ? 'update' : 'save'}?`).then(async () => {
        try {
          setLoading(false);

          const encodeJsonToBase64 = (json) => {
            // Step 1: Convert the string to Base64
            const base64Encoded = btoa(json);
            return base64Encoded;
          };

          const base64Data = encodeJsonToBase64(JSON.stringify({
            "key": "SA_CRUD",
            "TYPE": isEditMode || id ? "UPDATE" : "INSERT",
            "DOC_NO": id || '',

            "headerData": {
              "SANo": formik.values.SANo,
              "SADate": format(formik.values.SADate, 'yyyy-MM-dd'),
              "RefNo": formik.values.RefNo || '',
              "Location": formik.values.Location || '',
              "AdjType": formik.values.AdjType || 'Manual',
              "remarks": formik.values.remarks || '',
            },
            "detailData": adjustmentItems.map((item, index) => {
              return {
                ...item,
                srno: index + 1
              };
            })
          }));

          const { Success, Message, Data } = await GetSingleResult({
            "json": base64Data
          });

          if (Success) {
            // setIsEditMode(false);
            // setIsEditable(false);
            navigate(`/stock-adjustment-entry/${Data.id}`, { replace: true });
            showToast(Data.Message, 'success');
          }
          else {
            showToast(Message, "error");
          }
        }
        finally {
          setLoading(false);
        }
      });
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
      srno: adjustmentItems.length + 1,
      name: '',
      desc: '',
      stockQty: 0,
      qty: 0,
      price: 0,
      unit: '',
      reason: '',
    }]);
  };

  const removeItem = (index) => {
    if(adjustmentItems.length === 1) {
      showToast('At least one item must be present', 'error');
      return;
    }
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
      srno: index + 1,
      name: selectedProduct.IM_CODE || selectedProduct.code,
      desc: selectedProduct.IM_DESC || selectedProduct.desc,
      stockQty: selectedProduct.IM_CLSQTY || selectedProduct.currentStock || 0,
      unit: selectedProduct.IM_UNIT_CODE || selectedProduct.uom,
      price: selectedProduct.IM_COST || selectedProduct.unitCost || 0,
      qty: selectedProduct.IM_CLSQTY || selectedProduct.currentStock || 0,
      reason: selectedProduct.reason || '',
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


  const handleNewStockAdjustment = () => {
    formik.resetForm();
    setAdjustmentItems([{
      srno: 1,
      name: '',
      desc: '',
      stockQty: 0,
      qty: 0,
      price: 0,
      unit: '',
      reason: '',
    }]);
    setIsEditMode(true);
    navigate('/stock-adjustment-entry', { replace: true });
  };
  const toggleEditMode = () => {
    if (id) {
      loadStockAdjustment(id);
    }
    if (adjustmentItems.length === 0)
      handleNewStockAdjustment();


    setIsEditMode(!isEditMode);

  };
  const handleRemoveItem = (itemId) => {
    setAdjustmentItems(adjustmentItems.filter(item => item.srno !== itemId));
  };
  // Inline Product Row Component
  const InlineProductRow = ({ item, index, onProductChange, onItemChange, onRemove, products, isEditMode }) => (
    <Paper
      elevation={2}
      sx={{
        mb: 2,
        p: { xs: 2, md: 2 },
        borderRadius: 3,
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.04)',
        background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
        width: '100%'
      }}
    >
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 16%' }, minWidth: 180 }}>
        <Autocomplete
          options={products || []}
          getOptionLabel={(option) => `${option.IM_CODE} - ${option.IM_DESC}`}
          value={products.find(p => p.IM_CODE === item.productCode) || null}
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
        />
      </Box>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 22%' }, minWidth: 200 }}>
        <TextField
          fullWidth
          label="Description"
          value={item.desc}
          size="small"
          disabled
          multiline
          rows={1}
          variant="filled"
          InputProps={{ disableUnderline: true, sx: { bgcolor: 'transparent' } }}
        />
      </Box>
      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 10%' }, minWidth: 100 }}>
        <TextField
          fullWidth
          label="Current Stock"
          value={item.currentQty}
          size="small"
          disabled
          inputProps={{ style: { textAlign: 'right' } }}
          variant="filled"
          InputProps={{ disableUnderline: true, sx: { bgcolor: 'transparent' } }}
        />
      </Box>
      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 10%' }, minWidth: 100 }}>
        <TextField
          fullWidth
          label="Adjusted Stock"
          type="number"
          value={item.adjustedStock}
          onChange={(e) => onItemChange(index, 'qty', parseFloat(e.target.value) || 0)}
          disabled={!isEditMode}
          size="small"
          inputProps={{ style: { textAlign: 'right' } }}
          variant="outlined"
        />
      </Box>
 
      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 10%' }, minWidth: 100 }}>
        <TextField
          fullWidth
          label="Unit Cost"
          type="number"
          value={item.unitCost}
          onChange={(e) => onItemChange(index, 'unitCost', parseFloat(e.target.value) || 0)}
          disabled={!isEditMode}
          size="small"
          inputProps={{ style: { textAlign: 'right' }, step: 0.01 }}
          variant="outlined"
        />
      </Box>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 16%' }, minWidth: 160 }}>
        <TextField
          fullWidth
          label="Reason"
          value={item.reason}
          onChange={(e) => onItemChange(index, 'reason', e.target.value)}
          disabled={!isEditMode}
          size="small"
          placeholder="Enter reason"
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
                disabled={adjustmentItems.length === 1}
                sx={{ bgcolor: 'error.lighter', '&:hover': { bgcolor: 'error.light' } }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    </Paper>
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
          disabled={!isEditMode}
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
          disabled={!isEditMode}
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
          disabled={!isEditMode}
          sx={{ width: '100%' }}
          placeholder="Enter reason"
        />
      ),
    },
  ];

  if (loading) {
    return <Loader />;
  }
  const handleEditConfirm = async (messages = []) => {
    if (id) {
      loadStockAdjustment(id);
    }
    if (messages && messages.length > 0) {
      const { Success, Message } = await GetSingleResult({
        "key": "SA_CRUD",
        "TYPE": "EDIT_CONFIRM",
        "DOC_NO": id,
        "message_types": messages
      });
      if (!Success) {
        setIsEditMode(false);
        showToast(Message, "error");
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <PageHeader
          title={`Stock Adjustment ${isNewRecord ? 'Entry' : 'Details'}`}
          subtitle={isNewRecord ? 'Create new stock adjustment' : `Document No: ${formik.values.SANo || formik.values.documentNo}`}
          breadcrumbs={[
            { title: 'Transactions', path: '/transactions' },
            { title: 'Store', path: '/transactions/store' },
            { title: 'Stock Adjustments', path: '/stock-adjustment' },
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
              label: 'New stock adjustment',
              icon: 'eva:plus-fill',
              variant: 'contained',
              onClick: handleNewStockAdjustment,
              show: true,
              showInActions: true,
            },
          ]}
          onEditConfirm={handleEditConfirm}
          editCheckApiKey="SA_CRUD"
          editCheckApiType="EDIT_VALIDATE"
          editCheckDocNo={id || ''}
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
                    disabled={!isNewRecord}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={2}>
                  <DatePicker
                    label="Document Date"
                    value={formik.values.SADate}
                    onChange={(date) => formik.setFieldValue('SADate', date)}
                    disabled={!isEditMode}
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
                    disabled={!isEditMode}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} md={2.5}>
                  <Autocomplete

                    options={locations || []}
                    getOptionLabel={(option) => `${option.LM_LOCATION_CODE} - ${option.LM_LOCATION_NAME}`}
                    value={locations.find(l => l.LM_LOCATION_CODE === formik.values.Location) || null}
                    onChange={(event, newValue) => formik.setFieldValue('Location', newValue?.LM_LOCATION_CODE || '')}
                    disabled={!isEditMode}
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
                    disabled={!isEditMode}
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
                    disabled={!isEditMode}
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
                    isEditMode={isEditMode}
                  />
                ))}

                {/* Add Item Button */}
                {isEditMode && (
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
