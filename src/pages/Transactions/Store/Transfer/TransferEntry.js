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
 
import { GetMultipleResult, GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import PageHeader from '../../../../components/PageHeader'; 
import Loader from '../../../../components/Loader';
import { useToast } from '../../../../hooks/Common';
import { getLastNumber, getLocationList, getUnitList } from '../../../../utils/CommonServices';
import Confirm from '../../../../components/Confirm';

// Inline Transfer Item Row Component
const InlineTransferItemRow = ({ 
  item, 
  index, 
  onProductChange, 
  onItemChange, 
  onRemove, 
  products, 
  unitList,
  isEditMode, 
  transferItemsLength,
  fromLocationId,
  getAvailableStock 
}) => {
  const theme = useTheme();

  // Get available units for the current product
  const getAvailableUnits = () => {
    if (!item.avail_unit_code || !unitList) return [];

    const unitPricePairs = item.avail_unit_code.split(',');
    const availableUnits = unitList.filter(u =>
      unitPricePairs.some(unitPrice => {
        const [unit] = unitPrice.split('#');
        return unit === u.LK_KEY;
      })
    );
    
    // Debug log
    console.log('Available units for product:', item.name, availableUnits);
    
    return availableUnits;
  };

  const availableUnits = getAvailableUnits();

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
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 18%' }, minWidth: 200 }}>
        <Autocomplete
          options={products || []}
          getOptionLabel={(option) => `${option.IM_CODE} - ${option.IM_DESC}`}
          value={products?.find(p => p.IM_CODE === item.name) || null}
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
                  {option.IM_CODE} - {option.IM_DESC}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Available: {getAvailableStock(option.IM_CODE, fromLocationId)} {option.IM_UNIT_CODE}
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 22%' }, minWidth: 200 }}>
        <TextField
          fullWidth
          label="Description"
          name={`ItemDesc_${index}`}
          value={item.desc || ''}
          onChange={onItemChange}
          size="small"
          disabled={!isEditMode}
          variant="outlined"
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 10%' }, minWidth: 100 }}>
        <TextField
          fullWidth
          label="Transfer Qty"
          name={`ItemQty_${index}`}
          type="number"
          value={item.qty || ''}
          onChange={onItemChange}
          disabled={!isEditMode}
          size="small"
          inputProps={{ 
            style: { textAlign: 'right' },
            min: 0
          }}
          variant="outlined"
        />
      </Box>

      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 12%' }, minWidth: 120 }}>
        <TextField
          fullWidth
          select
          label="Unit"
          size="small"
          value={item.unit || ''}
          onChange={(event) => onItemChange({ target: { name: `ItemUnit_${index}`, value: event.target.value } })}
          disabled={!isEditMode}
          variant="outlined"
          placeholder="Select unit"
        >
          <MenuItem value="">
            <em>Select Unit</em>
          </MenuItem>
          {availableUnits && availableUnits.length > 0 ? (
            availableUnits.map((option) => (
              <MenuItem key={option.LK_KEY} value={option.LK_KEY}>
                {option.LK_VALUE}
              </MenuItem>
            ))
          ) : (
            unitList?.map((option) => (
              <MenuItem key={option.LK_KEY} value={option.LK_KEY}>
                {option.LK_VALUE}
              </MenuItem>
            ))
          )}
        </TextField>
      </Box>

      <Box sx={{ flex: { xs: '1 1 48%', md: '1 1 10%' }, minWidth: 100 }}>
        <TextField
          fullWidth
          label="Price"
          name={`ItemPrice_${index}`}
          type="number"
          value={item.price || ''}
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
          value={`AED ${((item.qty || 0) * (item.price || 0)).toFixed(2)}`}
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
    name: '',
    desc: '',
    qty: 0,
    price: 0,
    unit: '',
    avail_unit_code: '',
  }]);
  const [unitList, setUnitList] = useState([]);

  const isNewRecord = (id === null || id === 'new' || id === undefined || id === '0');
  const [isEditMode, setIsEditMode] = useState(isNewRecord );

  // Form validation schema
  const validationSchema = Yup.object({
    TSFNo: Yup.string().required('Document number is required'),
    TSFDate: Yup.date().required('Document date is required'),
    FromLocation: Yup.string().required('From location is required'),
    ToLocation: Yup.string().required('To location is required'),
    TsfType: Yup.string().required('Transfer type is required'),
    Remarks: Yup.string().max(500, 'Remarks cannot exceed 500 characters'),
  });

  // Formik form handling
  const formik = useFormik({
    initialValues: {
      id: null,
      TSFNo: '',
      TSFDate: new Date(),
      FromLocation: '',
      ToLocation: '',
      TsfType: 'Location Transfer',
      Remarks: '',
      Status: 'Draft',
      Amount: 0,
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleSave(values);
    },
  });

  const getLocations = async () => {
    const Data = await getLocationList();
    setLocations(Data);
  };

  const getProducts = async (location) => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "ITEM_CRUD",
        "TYPE": "GET_ALL",
      });
      if (Success) {
        console.log('Loaded products:', Data.slice(0, 2)); // Log first 2 products to see structure
        setProducts(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error loading products:", error);
      showToast('Failed to load products', 'error');
    }
  };

  const getunits = async () => {
    try {
      const Data = await getUnitList();
      console.log('Loaded units:', Data);
      setUnitList(Data);
    } catch (error) {
      console.error('Error loading units:', error);
      showToast('Failed to load units', 'error');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
    if (!isNewRecord) {
      loadTransfer();
    } else {
      generateDocumentNumber();
    }
  }, [id]);

  useEffect(() => {
    getProducts(formik.values.FromLocation);
  }, [formik.values.FromLocation]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      getLocations();
      getunits();
    } catch (error) {
      console.error('Error loading initial data:', error);
      showToast('Failed to load initial data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadTransfer = async () => {
    try {
      setLoading(true);
      
      const { Data, Success } = await GetMultipleResult({
        "key": "TSF_CRUD",
        "TYPE": "GET",
        "DOC_NO": id || '',
      });
      if (Success) {
        const headerData = Data[0][0] || {};
        const detailData = Data[1] || [];
        formik.setValues({
          TSFDate: new Date(headerData.TSFDate),
          TSFNo: headerData.TSFNo,
          FromLocation: headerData.FromLocation,
          ToLocation: headerData.ToLocation,
          TsfType: headerData.TsfType || 'Location Transfer',
          Remarks: headerData.Remarks || '',
          Status: headerData.Status || 'Draft',
          Amount: headerData.Amount || 0,
        });
        
        // Transform items to match our inline structure
        const transformedItems = detailData.map((item, index) => ({
          id: `item_${Date.now()}_${index}`,
          srno: index + 1,
          name: item.name || item.IM_CODE || '',
          desc: item.desc || item.IM_DESC || '',
          unit: item.unit || item.IM_UNIT_CODE || '',
          qty: item.qty || 0,
          price: item.price || item.IM_COST || 0,
          avail_unit_code: item.avail_unit_code,
        }));

        setTransferItems(transformedItems);
      }
    } catch (error) {
      console.error('Error loading transfer:', error);
      showToast('Failed to load transfer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateDocumentNumber = async () => {
    try {
      const { lastNo, IsEditable } = await getLastNumber('TSF');
      formik.setFieldValue('TSFNo', lastNo);
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
          const encodeJsonToBase64 = (json) => {
            const base64Encoded = btoa(json);
            return base64Encoded;
          };

          const payload = {
            "key": "TSF_CRUD",
            "TYPE": id ? "UPDATE" : "INSERT",
            "DOC_NO": id || '',
            "headerData": {
              "TSFNo": formik.values.TSFNo,
              "TSFDate": format(formik.values.TSFDate, 'yyyy-MM-dd'),
              "FromLocation": formik.values.FromLocation || '',
              "ToLocation": formik.values.ToLocation || '',
              "TsfType": formik.values.TsfType || 'Location Transfer',
              "Remarks": formik.values.Remarks || '',
              "Status": formik.values.Status || 'Draft',
              "Amount": calculateTotalValue(),
            },
            "detailData": transferItems.map((item, index) => {
              return {
                srno: index + 1,
                name: item.name || '',
                desc: item.desc || '',
                qty: item.qty || 0,
                price: item.price || 0,
                unit: item.unit || '',
              };
            })
          };

          console.log('Payload:', payload);
          const base64Data = encodeJsonToBase64(JSON.stringify(payload));

          const { Success, Message, Data } = await GetSingleResult({
            "json": base64Data
          });

          if (Success) {
            navigate(`/stock-transfer-entry/${Data.id}`, { replace: true });
            showToast(Message, 'success');
          } else {
            showToast(Message, "error");
          }
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
      return total + ((item.qty || 0) * (item.price || 0));
    }, 0);
  };

  const calculateTotalQty = () => {
    return transferItems.reduce((total, item) => {
      return total + (item.qty || 0);
    }, 0);
  };

  const getAvailableStock = (productCode, locationCode) => {
    // This would typically fetch from stock API based on product and location
    return Math.floor(Math.random() * 100); // Dummy value for now
  };

  const addItem = () => {
    setTransferItems(prevItems => [
      ...prevItems,
      {
        id: `item_${Date.now()}_${prevItems.length}`,
        srno: prevItems.length + 1,
        name: '',
        desc: '',
        qty: 0,
        price: 0,
        unit: '',
        avail_unit_code: '',
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

    // Check if product already exists in transfer items
    const existingItemIndex = transferItems.findIndex((item, idx) => 
      idx !== index && item.name === selectedProduct.IM_CODE
    );
    
    if (existingItemIndex !== -1) {
      showToast('Product already added to transfer', 'error');
      return;
    }

    setTransferItems(prevItems => {
      const newItems = [...prevItems];

      // Get available units and default price for the selected product
      const unitPricePairs = selectedProduct.avail_unit_code?.split(',') || [];
      const firstUnitPrice = unitPricePairs[0]?.split('#') || ['', '0'];
      const defaultUnit = firstUnitPrice[0] || selectedProduct.IM_UNIT_CODE;
      const defaultPrice = parseFloat(firstUnitPrice[1]) || selectedProduct.IM_COST || 0;

      newItems[index] = {
        ...newItems[index],
        srno: index + 1,
        name: selectedProduct.IM_CODE || '',
        desc: selectedProduct.IM_DESC || '',
        unit: defaultUnit,
        price: defaultPrice,
        qty: 0,
        avail_unit_code: selectedProduct.avail_unit_code || '',
      };

      return newItems;
    });
  };

  const handleItemChange = useCallback((event) => {
    const { name, value } = event.target;

    // Extract index and field from name (e.g., "ItemDesc_0", "ItemQty_1")
    const [fieldName, index] = name.split('_');
    const itemIndex = parseInt(index, 10);

    setTransferItems(prevItems => {
      const newItems = [...prevItems];

      if (fieldName === 'ItemUnit' && newItems[itemIndex].avail_unit_code) {
        const currentItem = newItems[itemIndex];
        if (currentItem.avail_unit_code) {
          const unitPricePairs = currentItem.avail_unit_code.split(',');
          const selectedUnitPrice = unitPricePairs.find(up => {
            const [unit] = up.split('#');
            return unit === value;
          });

          const newPrice = selectedUnitPrice ? parseFloat(selectedUnitPrice.split('#')[1]) : (currentItem.price || 0);
          
          console.log('Unit changed:', value, 'New price:', newPrice, 'Unit price pairs:', unitPricePairs);
          
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            unit: value,
            price: newPrice,
          };
        } else {
          newItems[itemIndex] = {
            ...newItems[itemIndex],
            unit: value
          };
        }
      } else if (fieldName === 'ItemQty') {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          qty: numValue,
        };
      } else if (fieldName === 'ItemPrice') {
        const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value || 0;
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          price: numValue,
        };
      } else if (fieldName === 'ItemDesc') {
        newItems[itemIndex] = {
          ...newItems[itemIndex],
          desc: value
        };
      }

      return newItems;
    });
  }, []);

  const validateItems = () => {
    const errors = [];
    const validItems = transferItems.filter(item => item.name);

    if (validItems.length === 0) {
      errors.push('At least one product must be added');
    }

    validItems.forEach((item, index) => {
      if (!item.name) {
        errors.push(`Row ${index + 1}: Product is required`);
      }
      if (item.qty === 0) {
        errors.push(`Row ${index + 1}: Transfer quantity cannot be zero`);
      }
      if (item.price < 0) {
        errors.push(`Row ${index + 1}: Price cannot be negative`);
      }
    });

    return errors;
  };

  // Update available stock when from location changes
  useEffect(() => {
    if (formik.values.FromLocation) {
      // Update stock information when location changes
      // This would typically fetch updated stock data
    }
  }, [formik.values.FromLocation, products]);

  const handleNewTransfer = () => {
    formik.resetForm();
    setTransferItems([{
      id: `item_${Date.now()}`,
      srno: 1,
      name: '',
      desc: '',
      qty: 0,
      price: 0,
      unit: '',
      avail_unit_code: '',
    }]);
    setIsEditMode(true);
    navigate('/stock-transfer-entry', { replace: true });
  };

  const toggleEditMode = () => {
    if (id && id !== 'new') {
      loadTransfer();
    }
    if (transferItems.length === 0)
      handleNewTransfer();

    setIsEditMode(!isEditMode);
  };
   const handleEditConfirm = async (messages = []) => {
    // if (id) {
    //   loadInitialData(id);
    // }
    if (messages && messages.length > 0) {
      const { Success, Message } = await GetSingleResult({
        "key": "TSF_CRUD",
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


  if (loading) {
    return <Loader />;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 0 }}>
        <PageHeader
          title={`Stock Transfer ${isNewRecord ? 'Entry' : 'Details'}`}
          subtitle={isNewRecord ? 'Create new stock transfer' : `Document No: ${formik.values.TSFNo}`}
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
           onEditConfirm={handleEditConfirm}
          editCheckApiKey="TSF_CRUD"
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
                <Grid item xs={12} md={6} lg={1.5}>
                  <TextField
                    fullWidth
                    label="Document No"
                    name="TSFNo"
                    value={formik.values.TSFNo}
                    onChange={formik.handleChange}
                    error={formik.touched.TSFNo && Boolean(formik.errors.TSFNo)}
                    helperText={formik.touched.TSFNo && formik.errors.TSFNo}
                    disabled={!isNewRecord}
                    size="small"
                  />
                </Grid>
                
                <Grid item xs={12} md={6} lg={2}>
                  <DatePicker
                    label="Document Date"
                    value={formik.values.TSFDate}
                    onChange={(date) => formik.setFieldValue('TSFDate', date)}
                    disabled={!isEditMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        size="small"
                        error={formik.touched.TSFDate && Boolean(formik.errors.TSFDate)}
                        helperText={formik.touched.TSFDate && formik.errors.TSFDate}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={6} lg={2.5}>
                  <TextField
                    fullWidth
                    select
                    label="Transfer Type"
                    name="TsfType"
                    value={formik.values.TsfType}
                    onChange={formik.handleChange}
                    error={formik.touched.TsfType && Boolean(formik.errors.TsfType)}
                    helperText={formik.touched.TsfType && formik.errors.TsfType}
                    disabled={!isEditMode}
                    size="small"
                  >
                    <MenuItem value="Location Transfer">Location Transfer</MenuItem>
                    <MenuItem value="Urgent Transfer">Urgent Transfer</MenuItem>
                    <MenuItem value="Return Transfer">Return Transfer</MenuItem>
                    <MenuItem value="Bulk Transfer">Bulk Transfer</MenuItem>
                  </TextField>
                </Grid>
                
              
                
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    options={locations || []}
                    getOptionLabel={(option) => `${option.LM_LOCATION_CODE} - ${option.LM_LOCATION_NAME}`}
                    value={locations.find(loc => loc.LM_LOCATION_CODE === formik.values.FromLocation) || null}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('FromLocation', newValue?.LM_LOCATION_CODE || '');
                      // Clear to location if same as from location
                      if (newValue?.LM_LOCATION_CODE === formik.values.ToLocation) {
                        formik.setFieldValue('ToLocation', '');
                      }
                    }}
                    disabled={!isEditMode}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="From Location"
                        size="small"
                        error={formik.touched.FromLocation && Boolean(formik.errors.FromLocation)}
                        helperText={formik.touched.FromLocation && formik.errors.FromLocation}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: <TransferIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12} md={3}>
                  <Autocomplete
                    options={locations.filter(loc => loc.LM_LOCATION_CODE !== formik.values.FromLocation) || []}
                    getOptionLabel={(option) => `${option.LM_LOCATION_CODE} - ${option.LM_LOCATION_NAME}`}
                    value={locations.find(loc => loc.LM_LOCATION_CODE === formik.values.ToLocation) || null}
                    onChange={(event, newValue) => formik.setFieldValue('ToLocation', newValue?.LM_LOCATION_CODE || '')}
                    disabled={!isEditMode || !formik.values.FromLocation}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="To Location"
                        size="small"
                        error={formik.touched.ToLocation && Boolean(formik.errors.ToLocation)}
                        helperText={formik.touched.ToLocation && formik.errors.ToLocation}
                        placeholder={!formik.values.FromLocation ? "Select from location first" : "Select destination"}
                      />
                    )}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remarks"
                    name="Remarks"
                    value={formik.values.Remarks}
                    onChange={formik.handleChange}
                    multiline
                    rows={3}
                    disabled={!isEditMode}
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
                    unitList={unitList}
                    isEditMode={isEditMode}
                    transferItemsLength={transferItems.length}
                    fromLocationId={formik.values.FromLocation}
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
