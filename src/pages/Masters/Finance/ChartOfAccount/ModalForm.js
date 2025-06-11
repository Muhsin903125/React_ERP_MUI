import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  Button, 
  Modal, 
  Grid, 
  TextField, 
  Stack, 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Checkbox, 
  Paper,
  Divider,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Slide,
  IconButton,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import BusinessIcon from '@mui/icons-material/Business';
import ReceiptIcon from '@mui/icons-material/Receipt';
import Iconify from '../../../../components/iconify';
import { GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`account-tabpanel-${index}`}
      aria-labelledby={`account-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ModalForm = ({ open, onClose, initialValues, parentId, grpCode, IsAllowToCreateGH, IsAllowToCreateGL }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [codeEditable, setCodeEditable] = useState(false);
  const [parents, setParents] = useState([]);
  const [accountType, setAccountType] = useState([]);
  const [taxTreat, setTaxTreat] = useState([]);  const [defaultBalance, setDefaultBalance] = useState([]);
  const [accountCode, setAccountCode] = useState(null);
  const [accountCodeEditable, setAccountCodeEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);  useEffect(() => {
    if (open) {
      setActiveTab(0); // Reset to first tab when opening
      if (initialValues !== null) {
        setIsNew(false);
      } else {
        setIsNew(true);
        getCOACode();
        getParents();
        getAccountType();
        getTaxTreat();
        getAccountCode();
      }
      console.log(grpCode, "grpCode");
    }
  }, [initialValues, open]);
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const validationSchema = yup.object().shape({
  code: yup.string().required('Code is required'),
  desc: yup.string().required('Description is required'),
  parent: yup.string().nullable(),
  isGroup: yup.boolean(),

  accNo: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Account Number is required'),
    otherwise: schema => schema.nullable(),
  }),

  defaultBalance: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Default Balance is required'),
    otherwise: schema => schema.nullable(),
  }),

  tax: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Tax is required'),
    otherwise: schema => schema.nullable(),
  }),

  accCode: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Account Code is required'),
    otherwise: schema => schema.nullable(),
  }),

  accDesc: yup.string().when('isGroup', {
    is: false,
    then: schema => schema.required('Name is required'),
    otherwise: schema => schema.nullable(),
  }),

  enableAccount: yup.boolean(),
  remark: yup.string().nullable(),
});
  const getTaxTreat = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        key: 'LOOKUP',
        TYPE: 'TAX_TREAT',
      });

      if (Success) {
        setTaxTreat(Data);
      } else {
        showToast(Message, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };  const HandleData = async (data, type) => {
    setLoading(true);
    try {
      const { Success, Message } = await GetSingleResult({
        "key": "COA_CRUD",
        "TYPE": type,
        "ACMAIN_CODE": data.code,
        "ACMAIN_DESC": data.desc,
        "ACMAIN_PARENT": data.parent,
        "ACMAIN_ACTYPE_DOCNO": data.isGroup ? "GH" : "GL",
        "ACMAIN_DEFAULT_BALANCE_SIGN": data.defaultBalance,
        "ACMAIN_ACCNO": data.accNo,
        "ACMAIN_ACCOUNT_TAX": data.tax,
        "ACMAIN_ACCOUNT_ON_STOP": !data.enableAccount ? 0 : 1,
        "ACMAIN_ACC_CODE": data.accCode,
        "ACMAIN_ACCOUNT_REMARK": data.remark,
        "ACMAIN_ACCOUNT_DESC": data.accDesc,
      });      if (Success) {
        showToast(
          type === "ADD" 
            ? '✅ Chart of Account created successfully!' 
            : '✅ Chart of Account updated successfully!', 
          'success'
        );
        onClose();
      } else {
        showToast(Message || 'Operation failed', "error");
      }
    } catch (error) {
      showToast('Network error - please try again', "error");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };
  const getParents = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "COA_CRUD",
        "TYPE": "GET_ALL_GH",
      });
      if (Success) {
        setParents(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  }
  const getAccountType = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "LOOKUP",
        "TYPE": "CAO_ACTYPE",
      });
      if (Success) {
        // setAccountType(Data);
        setDefaultBalance(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  }
  const getCOACode = async () => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        "key": "LAST_NO",
        "TYPE": "COA",
      });

      if (Success) {
        setCode(Data.LAST_NO);
        setCodeEditable(Data.IS_EDITABLE);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  };
  const getAccountCode = async () => {
    try {
      const { Success, Data, Message } = await GetSingleResult({
        "key": "LAST_NO",
        "TYPE": "ACC",
      });

      if (Success) {
        setAccountCode(Data?.LAST_NO);
        setAccountCodeEditable(Data?.IS_EDITABLE);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  };  return (
    <Modal
      open={open}
      onClose={!loading ? onClose : undefined}
      closeAfterTransition
      sx={{
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
      }}
    >
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          sx={{
            width: { xs: '100%', sm: '95%', md: '800px', lg: '900px' },
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '95vh' },
            display: 'flex',
            flexDirection: 'column',
            ...(isMobile && {
              borderRadius: '16px 16px 0 0',
            })
          }}
        >
          <Paper
            elevation={24}
            sx={{
              borderRadius: isMobile ? '16px 16px 0 0' : 3,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Professional Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: { xs: 1.5, sm: 2 },
                position: 'relative',
                flexShrink: 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
                <Box
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    borderRadius: 2,
                    backgroundColor: alpha('#fff', 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <AccountTreeIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant={isSmallMobile ? "subtitle1" : "h6"}
                    sx={{
                      fontWeight: 600,
                      mb: 0.25,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isNew ? "Create Chart of Account" : "Update Chart of Account"}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={isNew ? "NEW ACCOUNT" : "EDIT MODE"}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#fff', 0.2),
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        height: 20
                      }}
                    />
                    {!isNew && initialValues && !isSmallMobile && (
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Code: {initialValues.ACMAIN_CODE}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              <IconButton
                onClick={onClose}
                disabled={loading}
                sx={{
                  position: 'absolute',
                  right: { xs: 6, sm: 12 },
                  top: { xs: 6, sm: 12 },
                  color: 'white',
                  backgroundColor: alpha('#fff', 0.1),
                  width: { xs: 32, sm: 36 },
                  height: { xs: 32, sm: 36 },
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.2),
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Form Content */}
            <Box sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto', flex: 1 }}>
              <Formik
                initialValues={{
                  code: initialValues?.ACMAIN_CODE || code || '',
                  desc: initialValues?.ACMAIN_DESC || '',
                  parent: initialValues?.ACMAIN_PARENT || parentId || '',
                  accNo: initialValues?.ACMAIN_ACCNO || '',
                  isGroup: initialValues?.ACMAIN_ACTYPE_DOCNO === "GH" || IsAllowToCreateGH,
                  defaultBalance: initialValues?.ACMAIN_DEFAULT_BALANCE_SIGN || '',
                  tax: initialValues?.ACMAIN_ACCOUNT_TAX || '',
                  accCode: initialValues?.ACMAIN_ACC_CODE || accountCode || '',
                  enableAccount: initialValues?.ACMAIN_ACCOUNT_ON_STOP === 0 || true,
                  remark: initialValues?.ACMAIN_ACCOUNT_REMARK || '',
                  accDesc: initialValues?.ACMAIN_ACCOUNT_DESC || ''
                }}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={(values) => {
                  if (isNew) {
                    HandleData(values, 'ADD');
                  } else {
                    HandleData(values, 'UPDATE');
                  }
                }}
              >
                {({ values, errors, touched, handleChange, setFieldValue }) => (
                  <Form>
                    {/* Tabs Navigation */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        aria-label="account form tabs"
                        variant={isMobile ? "fullWidth" : "standard"}
                        sx={{
                          '& .MuiTabs-indicator': {
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                          },
                          '& .MuiTab-root': {
                            textTransform: 'none',
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            fontWeight: 600,
                            minHeight: { xs: 44, sm: 48 }
                          }
                        }}
                      >
                        <Tab 
                          icon={<BusinessIcon fontSize="small" />}
                          iconPosition="start"
                          label="Basic Information" 
                          id="account-tab-0"
                          aria-controls="account-tabpanel-0"
                        />
                        <Tab 
                          icon={<ReceiptIcon fontSize="small" />}
                          iconPosition="start"
                          label="Account Details" 
                          id="account-tab-1"
                          aria-controls="account-tabpanel-1"
                          disabled={grpCode === "GH" && values.isGroup}
                        />
                      </Tabs>
                    </Box>

                    {/* Tab Content */}
                    <TabPanel value={activeTab} index={0}>
                      <Grid container spacing={{ xs: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Account Code"
                            disabled={isNew ? !codeEditable : true}
                            name="code"
                            value={values.code || ''}
                            onChange={handleChange}
                            error={Boolean(touched.code && errors.code)}
                            helperText={touched.code && errors.code}
                            InputProps={{
                              startAdornment: (
                                <Box sx={{ mr: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                  #
                                </Box>
                              ),
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Description"
                            name="desc"
                            value={values.desc || ''}
                            onChange={handleChange}
                            error={Boolean(touched.desc && errors.desc)}
                            helperText={touched.desc && errors.desc}
                            placeholder="Enter account description"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth size="small" error={Boolean(touched.parent && errors.parent)}>
                            <InputLabel>Parent Account</InputLabel>
                            <Field
                              as={Select}
                              label="Parent Account"
                              name="parent"
                              value={values.parent || ''}
                              onChange={handleChange}
                            >
                              <MenuItem value="">
                                <em>None (Root Level)</em>
                              </MenuItem>
                              {parents.map((item) => (
                                <MenuItem key={item.ACMAIN_CODE} value={item.ACMAIN_CODE}>
                                  {item.ACMAIN_DESC}
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.parent && errors.parent && (
                              <Typography color="error" variant="caption">
                                {errors.parent}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>

                        {grpCode === "GH" && (
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  disabled={(!IsAllowToCreateGH && !IsAllowToCreateGL) || !IsAllowToCreateGL}
                                  checked={values.isGroup}
                                  onChange={(e) => setFieldValue('isGroup', e.target.checked)}
                                  size="small"
                                />
                              }
                              label="Create as Group Account"
                            />
                          </Grid>
                        )}
                      </Grid>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                      <Grid container spacing={{ xs: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Account Number"
                            name="accNo"
                            value={values.accNo || ''}
                            onChange={handleChange}
                            error={Boolean(touched.accNo && errors.accNo)}
                            helperText={touched.accNo && errors.accNo}
                            placeholder="Enter account number"
                          />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Account Name"
                            name="accDesc"
                            value={values.accDesc || ''}
                            onChange={handleChange}
                            error={Boolean(touched.accDesc && errors.accDesc)}
                            helperText={touched.accDesc && errors.accDesc}
                            placeholder="Enter account name"
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Account Code"
                            disabled={isNew ? !accountCodeEditable : true}
                            name="accCode"
                            value={values.accCode || ''}
                            onChange={handleChange}
                            error={Boolean(touched.accCode && errors.accCode)}
                            helperText={touched.accCode && errors.accCode}
                          />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small" error={Boolean(touched.tax && errors.tax)}>
                            <InputLabel>Tax Treatment</InputLabel>
                            <Field
                              as={Select}
                              label="Tax Treatment"
                              name="tax"
                              value={values.tax || ''}
                              onChange={handleChange}
                            >
                              {taxTreat.map((item) => (
                                <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                                  {item.LK_VALUE}
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.tax && errors.tax && (
                              <Typography color="error" variant="caption">
                                {errors.tax}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small" error={Boolean(touched.defaultBalance && errors.defaultBalance)}>
                            <InputLabel>Default Balance</InputLabel>
                            <Field
                              as={Select}
                              label="Default Balance"
                              name="defaultBalance"
                              value={values.defaultBalance || ''}
                              onChange={handleChange}
                            >
                              {defaultBalance.map((item) => (
                                <MenuItem key={item.LK_KEY} value={item.LK_KEY}>
                                  {item.LK_VALUE}
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.defaultBalance && errors.defaultBalance && (
                              <Typography color="error" variant="caption">
                                {errors.defaultBalance}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Remarks"
                            name="remark"
                            multiline
                            rows={3}
                            value={values.remark || ''}
                            onChange={handleChange}
                            error={Boolean(touched.remark && errors.remark)}
                            helperText={touched.remark && errors.remark}
                            placeholder="Enter any additional remarks"
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={values.enableAccount}
                                onChange={(e) => setFieldValue('enableAccount', e.target.checked)}
                              />
                            }
                            label="Enable Account for Transactions"
                          />
                        </Grid>
                      </Grid>
                    </TabPanel>

                    {/* Form Actions */}
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ my: { xs: 1, sm: 2 } }} />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          color="inherit"
                          startIcon={<CloseIcon />}
                          onClick={onClose}
                          disabled={loading}
                          size="small"
                          sx={{ minWidth: { xs: '100%', sm: 120 } }}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color={isNew ? "success" : "warning"}
                          startIcon={
                            loading ? (
                              <Box
                                component="div"
                                sx={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: '50%',
                                  border: '2px solid',
                                  borderColor: 'currentColor',
                                  borderTopColor: 'transparent',
                                  animation: 'spin 1s linear infinite',
                                  '@keyframes spin': {
                                    '0%': { transform: 'rotate(0deg)' },
                                    '100%': { transform: 'rotate(360deg)' },
                                  },
                                }}
                              />
                            ) : (
                              <Iconify icon="basil:save-outline" />
                            )
                          }
                          disabled={loading}
                          size="small"
                          sx={{ minWidth: { xs: '100%', sm: 160 } }}
                        >
                          {loading ? 'Saving...' : `${isNew ? "Create" : "Update"} Account`}
                        </Button>
                      </Stack>
                    </Box>
                  </Form>
                )}
              </Formik>
            </Box>
          </Paper>
        </Box>
      </Slide>
    </Modal>
  );
};

export default ModalForm;
