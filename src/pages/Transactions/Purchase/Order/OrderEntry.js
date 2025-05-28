import { Helmet } from 'react-helmet-async';
import { useContext, useState, useEffect, useRef } from 'react';
// @mui
import {
    Card,
    Stack,
    Button,
    Typography,
    Grid,
    TextField,
    FormControl,
    Box,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    Autocomplete,
} from '@mui/material';
import validator from 'validator';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getLastNumber, getLocationList, getUnitList } from '../../../../utils/CommonServices';
import Confirm from '../../../../components/Confirm';
import Iconify from '../../../../components/iconify';
import DateSelector from '../../../../components/DateSelector';
import Dropdownlist from '../../../../components/DropdownList';  
import AlertDialog from '../../../../components/AlertDialog';
import { GetSingleResult, GetSingleListResult, GetMultipleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';  
import SupplierDialog from '../../../../components/SupplierDialog';
import PrintComponent from '../../../../components/PrintComponent';
import TransactionItem from '../../../../components/TransactionItem';
import SubTotalSec from '../../../../components/SubTotalSec';
import PrintDialog from '../../../../components/PrintDialog';
import PageHeader from '../../../../components/PageHeader';
// import { head } from 'lodash';

// ----------------------------------------------------------------------

const InvoiceStatusOptions = [
    { value: 'paid', label: 'Paid' },
    { value: 'unpaid', label: 'Unpaid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'draft', label: 'Draft' },
];

const PaymentModeOptions = [
    { value: 'CASH', label: 'Cash' },
    { value: 'CHEQUE', label: 'Cheque' },
    { value: 'TT', label: 'TT' },
    { value: 'OTHER', label: 'Others' },
];


export default function OrderEntry() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [code, setCode] = useState('');
    // const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedValidityDate, setselectedValidityDate] = useState(new Date());
    const [selectedOrderDate, setselectedOrderDate] = useState(new Date());
    const [IsAlertDialog, setAlertDialog] = useState(false);
    const [disableFutureDate] = useState(true);
    // const [status, setStatus] = useState('draft');
    const [errors, setErrors] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [isEditable, setIsEditable] = useState(true);
    const [showPrintView, setShowPrintView] = useState(false);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [salesmenList, setSalesmenList] = useState([]);
    const [salesmanLoading, setSalesmanLoading] = useState(false);
    const [locations, setLocations] = useState([]);
    const printRef = useRef(null);


    const [headerData, setheaderData] = useState(
        {
            OrderNo: code,
            OrderDate: selectedOrderDate,
            OrderValidity: selectedValidityDate,
            Status: 'PAID',
            SupplierCode: '',
            Supplier: 'Supplier Name',
            Location: '',
            Address: '',
            TRN: '',
            ContactNo: '',
            Email: '',
            RefNo: '',
            CrDays: 0,
            Discount: 0,
            Tax: 5,
            GrossAmount: 0,
            TaxAmount: 0,
            NetAmount: 0,
            SManCode: '',
            Remarks: ''
        })

    const [items, setItems] = useState([{
        name: "",
        price: 0,
        desc: "",
        qty: 0,
        unit: "Unit"
    }]);
    const validate = () => {
        const errors = {};
        let hasError = false;

        // Customer validation
        if (validator.isEmpty(headerData.SupplierCode)) {
            errors.SupplierCode = 'Supplier is required';
            showToast('Supplier is required', "error");
            hasError = true;
        }

        // Salesman validation
        if (!headerData.SManCode) {
            errors.SManCode = 'Salesman is required';
            showToast('Salesman is required', "error");
            hasError = true;
        }

        // Invoice date validation
        if (!selectedOrderDate) {
            errors.OrderDate = 'Order date is required';
            showToast('Order date is required', "error");
            hasError = true;
        }
        if (!selectedOrderDate) {
            errors.OrderValidity = 'Order validity is required';
            showToast('Order validity is required', "error");
            hasError = true;
        }


        // Email validation (if provided)
        if (headerData.Email && !validator.isEmail(headerData.Email)) {
            errors.Email = 'Invalid email address';
            showToast('Invalid email address', "error");
            hasError = true;
        }

        // Contact number validation (if provided)
        if (headerData.ContactNo && !validator.isMobilePhone(headerData.ContactNo)) {
            errors.ContactNo = 'Invalid contact number';
            showToast('Invalid contact number', "error");
            hasError = true;
        }

        // Items validation
        if (items.length === 0) {
            errors.items = 'At least one item is required';
            showToast('At least one item is required', "error");
            hasError = true;
        }

        // Validate each item
        const itemErrors = items.map((item, index) => {
            const itemError = {};
            if (!item.name) {
                itemError.name = 'Item name is required';
                hasError = true;
            }
            if (!item.qty || item.qty <= 0) {
                itemError.qty = 'Valid quantity is required';
                hasError = true;
            }
            if (!item.price || item.price <= 0) {
                itemError.price = 'Valid price is required';
                hasError = true;
            }
            return Object.keys(itemError).length > 0 ? itemError : null;
        }).filter(Boolean);

        if (itemErrors.length > 0) {
            errors.items = itemErrors;
            showToast('Please check all item details', "error");
        }



        setErrors(errors);
        return !hasError;
    };

    useEffect(() => {
        if (selectedOrderDate > selectedValidityDate) {
            setselectedValidityDate(selectedOrderDate);
        }
        setheaderData({
            ...headerData,
            'OrderValidity': selectedValidityDate,
            'OrderDate': selectedOrderDate
        });
    }, [selectedOrderDate, selectedValidityDate]);
    useEffect(() => {
        getProducts();
    }, []);
    const handleInputChange = event => {
        const { type, name, value } = event.target;
        if (type === 'number' && Object.keys(value).length > 1)
            setheaderData({
                ...headerData,
                [name]: value.replace(/^0+/, '')
            });
        else
            if (name === 'CrDays' && value === '')
                setheaderData({
                    ...headerData,
                    [name]: 0
                });
            else
                setheaderData({
                    ...headerData,
                    [name]: value
                });
    };


    const handleSave = () => {
        if (validate()) {
            CreateInvoice();
        }
    };
    useEffect(() => {
        if (id) {
            loadOrderDetails(id);
            setIsEditMode(true);
            setIsEditable(false);
        } else {
            getCode();
            setIsEditMode(false);
            setIsEditable(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);
    const getCode = async () => {
        const { lastNo, IsEditable } = await getLastNumber('PO');
        setCode(lastNo);
        setheaderData(prev => ({
            ...prev,
            OrderNo: lastNo
        }));
    };



    const addItem = (event) => {
        if (validate()) {
            event.preventDefault();
            // console.log(ItemNewLength);
            setItems([...items, {
                name: "",
                price: 0,
                desc: "",
                qty: 0,
                unit: ""
            }]);
        }
    };


    // const editItem = (index, event) => {
    //   event.preventDefault();
    //   const newItems = [...items];
    //   newItems[index] = { name: event.target.itemName.value, price: event.target.itemPrice.value };
    //   setItems(newItems);
    // };

    const removeItem = (index) => {
        const newItems = [...items];
        console.log(index);
        newItems.splice(index, 1);
        setItems(newItems);
        console.log(newItems);
    };


    function calculateTotal(items) {
        return items.reduce((total, item) => total + item.price * item.qty, 0);
    }

    // For Customer Dialog
    const [open, setOpen] = useState(false);
    // const [selectedValue, setSelectedValue] = useState("Customer Name");

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSelect = (value) => {
        setOpen(false);
        setheaderData({
            ...headerData,
            "Supplier": value.SUP_DESC,
            "Address": value.SUP_ADDRESS,
            "TRN": value.SUP_TRN,
            "SupplierCode": value.SUP_DOCNO,
            "ContactNo": value.SUP_MOB,
            "Email": value.SUP_EMAIL

        });
        // setSelectedValue(value.name);
    };
    const [unitList, setUnitList] = useState([]);
    const getunits = async () => {
        const Data = await getUnitList();
        setUnitList(Data);
        
    }

    const getLocations = async () => {
        const Data = await getLocationList();
        setLocations(Data);
        console.log("locationList", locations);
    };
    useEffect(() => {
        getLocations();
        getunits();
    }, []);

    const CreateInvoice = async () => {
        Confirm(`Do you want to ${isEditMode || id ? 'update' : 'save'}?`).then(async () => {
            try {
                setLoadingFull(false);

                const encodeJsonToBase64 = (json) => {
                    // Step 1: Convert the string to Base64
                    const base64Encoded = btoa(json);
                    return base64Encoded;
                };

                const base64Data = encodeJsonToBase64(JSON.stringify({
                    "key": "PURCH_ORD_CRUD",
                    "TYPE": isEditMode || id ? "UPDATE" : "INSERT",
                    "DOC_NO": id || '',
                    "headerData": {
                        ...headerData,
                        "GrossAmount": calculateTotal(items),
                        "TaxAmount": (calculateTotal(items) - headerData.Discount) * headerData.Tax / 100.00,
                        "NetAmount": (calculateTotal(items) - headerData.Discount) * (1 + headerData.Tax / 100.00),
                        "Remarks": headerData.Remarks || ''
                    },
                    "detailData": items.map((item, index) => {
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
                    setIsEditMode(false);
                    setIsEditable(false);
                    navigate(`/purchase-order-entry/${Data.id}`, { replace: true });
                    showToast(Data.Message, 'success');
                }
                else {
                    showToast(Message, "error");
                }
            }
            finally {
                setLoadingFull(false);
            }
        });
    };
    const [products, setProducts] = useState([]);
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
    const loadOrderDetails = async (orderId) => {
        try {
            setLoadingFull(true);
            const { Success, Data, Message } = await GetMultipleResult({
                "key": "PURCH_ORD_CRUD",
                "TYPE": "GET",
                "DOC_NO": orderId
            });

            if (Success) {
                // Data[0] contains header data, Data[1] contains items
                const headerData = Data[0][0]; // First array's first element
                const itemsData = Data[1]; // Second array contains all items
                console.log("asdas--", itemsData, Data);

                setheaderData({
                    ...headerData,
                    OrderNo: headerData?.OrderNo,
                    // Status: headerData?.Status,
                    SupplierCode: headerData?.SupplierCode,
                    OrderDate: new Date(headerData.OrderDate)
                });
                setselectedOrderDate(new Date(headerData.OrderDate));
                setselectedValidityDate(new Date(headerData.OrderValidity));
                setItems(itemsData || []);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            showToast("Error loading invoice details", "error");
        } finally {
            setLoadingFull(false);
        }
    };

    const handlePrint = () => {
        setPrintDialogOpen(true);
    };

    const toggleEditMode = () => {
        setIsEditable(!isEditable);
    };

    const handleNewInvoice = () => {
        // Reset all data
        setheaderData({
            OrderNo: '',
            OrderDate: selectedOrderDate,
            OrderValidity: selectedValidityDate,
            Status: 'PAID',
            SupplierCode: '',
            Supplier: 'Supplier Name',
            Address: '',
            Location: '',
            TRN: '',
            ContactNo: '',
            Email: '',
            RefNo: '',
            Discount: 0,
            Tax: 5,
            GrossAmount: 0,
            TaxAmount: 0,
            NetAmount: 0,
            SManCode: '',
            Remarks: ''
        });
        setItems([{
            name: "",
            price: 0,
            desc: "",
            qty: 0,
            unit: "Unit"
        }]);
        setErrors({});
        setIsEditable(true);
        setIsEditMode(false);
        getCode(); // Get new invoice number
        navigate('/purchase-order-entry');
    };
    const handleConvertToPurchase = async () => {
        Confirm('Do you want to convert this purchase order to purchase invoice?').then(async () => {
            try {
                setLoadingFull(true);


                const { Success, Message, Data } = await GetMultipleResult({
                    "key": "PURCH_ORD_CRUD",
                    "TYPE": "CONVERT_TO_PURCHASE",
                    "DOC_NO": id
                });

                if (Success) {
                    showToast('converted to purchase invoice', 'success');
                    // Redirect to sales entry page with the new invoice ID
                    const headerData = Data[0][0]; // First array's first element
                    const itemsData = Data[1];
                    const invoiceData = {
                        ...headerData,
                        items: itemsData
                    };
                    navigate(`/purchase-entry`, { state: { invoiceData }, replace: true });
                } else {
                    showToast(Message || 'Failed to convert purchase order', "error");
                }
            } catch (error) {
                console.error('Error converting purchase order:', error);
                showToast('Error converting purchase order to purchase invoice', "error");
            } finally {
                setLoadingFull(false);
            }
        });
    };
    const fetchSalesmen = async () => {
        try {
            setSalesmanLoading(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "SMAN_CRUD",
                "TYPE": "GET_ALL"
            });
            if (Success) {
                setSalesmenList(Data);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            showToast("Error fetching salesmen", "error");
            console.error('Error fetching salesmen:', error);
        } finally {
            setSalesmanLoading(false);
        }
    };

    useEffect(() => {
        fetchSalesmen();
    }, []);

    const handleEditConfirm = () => {
        if (id) {
            loadOrderDetails(id);
        }       
        setIsEditable(!isEditable);
    }
    return (
        <>
            <Helmet>
                <title> Purchase Order </title>
            </Helmet>

            <PageHeader
                title={isEditMode ? 'Edit Purchase Order' : 'New Purchase Order'}
                actions={[
                    {
                        label: 'Print',
                        icon: 'eva:printer-fill',
                        variant: 'outlined',
                        onClick: handlePrint,
                        show: !isEditable && id,
                        showInActions: true,
                    },
                    {
                        label: 'Convert to Purchase',
                        icon: 'eva:swap-fill',
                        variant: 'contained',
                        color: 'primary',
                        onClick: handleConvertToPurchase,
                        show: !isEditable && id,
                        showInActions: true,
                    },
                    {
                        label: 'Enable Edit',
                        icon: 'eva:edit-fill',
                        variant: 'contained',
                        color: 'primary',
                        type: 'enableEdit',
                        show: !isEditable,
                        showInActions: false,
                    },
                    {
                        label: 'Cancel Edit',
                        icon: 'eva:close-fill',
                        variant: 'contained',
                        color: 'secondary',
                        onClick: toggleEditMode,
                        show: isEditable,
                        showInActions: false,
                    },
                    {
                        label: 'New Order',
                        icon: 'eva:plus-fill',
                        variant: 'contained',
                        onClick: handleNewInvoice,
                        show: true,
                        showInActions: true,
                    },
                ]}
                onEditConfirm={handleEditConfirm}
            />

            <Card>
                <Stack maxwidth={'lg'} padding={2.5} style={{ backgroundColor: '#e8f0fa', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>
                    <Grid container spacing={2} mt={1}  >
                        <Grid item xs={12} md={5}>
                            <Grid container spacing={2} mt={1}>
                                <Grid item xs={8} md={8}>
                                    <Typography variant="subtitle1" ml={2} mb={1} style={{ color: "gray" }} >
                                        Supplier :   {headerData.SupplierCode}
                                    </Typography>
                                </Grid>
                                <Grid item xs={4} md={4} align='right'>
                                    {isEditable && (
                                        <Button size="small" startIcon={<Iconify icon={headerData?.SupplierCode ? "eva:edit-fill" : "eva:person-add-fill"} />} onClick={handleClickOpen}>
                                            {headerData?.SupplierCode ? 'change' : 'Add'}
                                        </Button>
                                    )}
                                    <SupplierDialog
                                        open={open}
                                        onClose={handleClose}
                                        onSelect={handleSelect}
                                    />
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Typography variant="body2" ml={2} style={{ color: "black" }} >
                                        {headerData.Supplier}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <Typography variant="body2" ml={2} style={{ color: "gray" }} >
                                        {headerData.TRN}
                                    </Typography>
                                    <Typography variant="body2" ml={2} mb={2} style={{ color: "gray" }} >
                                        {headerData.Address}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <Grid container spacing={1}>
                                <Grid item xs={6} md={2}  >
                                    <FormControl fullWidth>
                                        <TextField
                                            id="order-no"
                                            label="Order#"
                                            name="OrderNo"
                                            value={headerData.OrderNo}
                                            onChange={handleInputChange}
                                            size="small"
                                            inputProps={{
                                                readOnly: true
                                            }}
                                            disabled={!isEditable}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={5} >
                                    <FormControl fullWidth error={Boolean(errors.OrderDate)}>
                                        <DateSelector
                                            label="Date"
                                            size="small"
                                            disableFuture={disableFutureDate}
                                            value={headerData.OrderDate}
                                            onChange={setselectedOrderDate}
                                            disable={!isEditable}
                                            error={Boolean(errors.OrderDate)}
                                            helperText={errors.OrderDate}
                                            required
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6} md={5} >
                                    <FormControl fullWidth>
                                        <DateSelector
                                            size="small"
                                            label="Validity"
                                            value={selectedValidityDate}
                                            disable={!!true}
                                            disableFuture={false}
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                            <Grid container spacing={1} mt={1}>
                                <Grid item xs={6} md={4}  >
                                    <FormControl fullWidth>
                                        <TextField
                                            id="mob-no"
                                            label="Mobile#"
                                            name="ContactNo"
                                            size="small"
                                            type="tel"
                                            value={headerData.ContactNo}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            error={Boolean(errors.ContactNo)}
                                            helperText={errors.ContactNo}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={4} >
                                    <FormControl fullWidth>
                                        <TextField
                                            id="email"
                                            label="Email Id"
                                            name="Email"
                                            size="small"
                                            type="email"
                                            value={headerData.Email}
                                            onChange={handleInputChange}
                                            error={Boolean(errors.Email)}
                                            helperText={errors.Email}
                                            disabled={!isEditable}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6} md={4} b >
                                    <FormControl fullWidth>
                                        <TextField
                                            id="ref-no"
                                            label="Ref.No"
                                            name="RefNo"
                                            size="small"
                                            value={headerData.RefNo}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={6} md={6} mt={1} >
                                    <FormControl fullWidth error={Boolean(errors.SManCode)}>
                                        <Autocomplete
                                            disabled={!isEditable}
                                            options={salesmenList}
                                            value={salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode) || null}
                                            getOptionLabel={(option) =>
                                                option ? `${option.SMAN_DESC} (${option.SMAN_DOCNO})` : ''
                                            }
                                            loading={salesmanLoading}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Sales Person"
                                                    size="small"
                                                    error={Boolean(errors.SManCode)}
                                                    helperText={errors.SManCode}
                                                    required
                                                />
                                            )}
                                            onChange={(event, value) => {
                                                setheaderData({
                                                    ...headerData,
                                                    SManCode: value?.SMAN_DOCNO || ''
                                                });
                                            }}
                                        />
                                    </FormControl>
                                </Grid>

                                <Grid item xs={6} md={6} mt={1}    >
                                    <FormControl size='small' fullWidth error={Boolean(errors.Location)}>
                                        <Autocomplete
                                            size='small'
                                            disabled={!isEditable}
                                            options={locations}
                                            getOptionLabel={(option) => `${option.LM_LOCATION_CODE} - ${option.LM_LOCATION_NAME}`}
                                            value={locations.find(l => l.LM_LOCATION_CODE === headerData.Location) || null}
                                            onChange={(_, newValue) => {
                                                setheaderData(prev => ({
                                                    ...prev,
                                                    Location: newValue?.LM_LOCATION_CODE || ''
                                                }));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Location"
                                                    required
                                                    error={Boolean(errors.Location)}
                                                    helperText={errors.Location}
                                                />
                                            )}
                                        />
                                    </FormControl>
                                </Grid>

                            </Grid>
                            <Grid container spacing={1} mt={1}>
                                <Grid item xs={12} md={12}>
                                    <FormControl fullWidth>
                                        <TextField
                                            id="remarks"
                                            label="Remarks"
                                            name="Remarks"
                                            size="small"
                                            multiline
                                            rows={2}
                                            value={headerData.Remarks}
                                            onChange={handleInputChange}
                                            disabled={!isEditable}
                                            placeholder="Enter any additional notes or remarks "
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Stack>
                <Stack m={2.5} maxwidth={'lg'}  >

                    <Typography variant="h6" mb={2} >
                        Item Details
                    </Typography>
                    {items.map((field, index) => (
                        <TransactionItem
                            key={index}
                            Propkey={index}
                            unitList={unitList}
                            discountPercent={1-(headerData.Discount / calculateTotal(items))}
                            tax={headerData.Tax}
                            products={products}
                            code={items[index].name}
                            desc={items[index].desc}
                            qty={items[index].qty}
                            price={items[index].price}
                            unit={items[index].unit}
                            items={items}
                            setItems={setItems}
                            removeItem={() => removeItem(index)}
                            errors={errors.item}
                            isEditable={isEditable}
                        />
                    ))}



                    <SubTotalSec
                        addItem={addItem}
                        calculateTotal={calculateTotal(items)}
                        discount={headerData.Discount}
                        tax={headerData.Tax}
                        handleInputChange={(e) => handleInputChange(e)}
                        isEditable={isEditable}
                    />
                    <Stack direction="row" justifyContent="flex-end" mb={2} mt={2}>
                        {isEditable && (
                            <Button variant="contained" color={isEditMode || id ? 'warning' : 'success'} size='large' onClick={handleSave}>
                                {isEditMode || id ? 'Update Order' : 'Create Order'}
                            </Button>
                        )}
                    </Stack>
                </Stack>
            </Card>

            {/* Replace the old Dialog with PrintDialog */}
            <PrintDialog
                open={printDialogOpen}
                onClose={() => setPrintDialogOpen(false)}
                title="Purchase Order Print Preview"
                documentTitle={`Purchase Order-${headerData.OrderNo}`}
                printRef={printRef}
            >
                <PrintComponent
                    headerData={{
                        ...headerData,
                        SalesmanName: salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode)?.SMAN_DESC ?
                            `${salesmenList.find(s => s.SMAN_DOCNO === headerData.SManCode).SMAN_DESC} (${headerData.SManCode})` :
                            headerData.SManCode || ''
                    }}
                    items={items}
                    documentType="PURCHASE ORDER"
                />
            </PrintDialog>

            {IsAlertDialog && (
                <AlertDialog
                    Message="Are you sure you want to proceed?"
                    OnSuccess={setAlertDialog}
                />
            )}
        </>
    );
}
