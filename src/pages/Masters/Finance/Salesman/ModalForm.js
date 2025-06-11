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
  IconButton,
  Divider,
  Chip,
  useTheme,
  alpha,
  Paper,
  useMediaQuery,
  Slide
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import Iconify from '../../../../components/iconify';
import { GetSingleResult, PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { getLastNumber } from '../../../../utils/CommonServices';

const ModalForm = ({ open, onClose, initialValues }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [code, setCode] = useState(null);
  const [codeEditable, setCodeEditable] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
      getCode();
    }
  }, [initialValues, open]);
  const validationSchema = yup.object().shape({
    docNo: yup.string().required('Salesman code is required'),
    desc: yup.string().required('Salesman name is required').min(2, 'Name must be at least 2 characters'),
    email: yup.string().email('Please enter a valid email address'),
    mobile: yup.string().matches(/^[0-9+\-\s()]*$/, 'Please enter a valid mobile number'),
  });

  const HandleData = async (data, type) => {
    setLoading(true);
    try {
      const { Success, Message } = await GetSingleResult({
        "key": "SMAN_CRUD",
        "TYPE": type,
        "SMAN_DOCNO": data.docNo,
        "SMAN_DESC": data.desc,
        "SMAN_EMAIL": data.email,
        "SMAN_MOB": (data.mobile).toString(),
      });

      if (Success) {
        showToast(
          type === "ADD" 
            ? '✅ Salesman created successfully!' 
            : '✅ Salesman updated successfully!', 
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

  const getCode = async () => {
    const { lastNo, IsEditable } = await getLastNumber('SMAN');
    setCode(lastNo);
    setCodeEditable(IsEditable);
  };
  return (
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
            width: { xs: '100%', sm: '95%', md: '720px', lg: '800px' },
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
          >            {/* Mobile-Friendly Header */}
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
                  <PersonIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
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
                    {isNew ? "Create New Salesman" : "Update Salesman"}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={isNew ? "NEW" : "EDIT"}
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
                        ID: {initialValues.SMAN_DOCNO}
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
            </Box>            {/* Form Content */}
            <Box sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto', flex: 1 }}>
              <Formik
                initialValues={{
                  docNo: initialValues?.SMAN_DOCNO || code || '',
                  desc: initialValues?.SMAN_DESC || '',
                  email: initialValues?.SMAN_EMAIL || '',
                  mobile: initialValues?.SMAN_MOB || '',
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
                {({ values, errors, touched, handleChange, isSubmitting }) => (
                  <Form>
                    <Grid container spacing={{ xs: 2 }}>
                      {/* Salesman Code & Name */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          <BusinessIcon color="primary" fontSize="small" />
                          Basic Information
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Salesman Code"
                          disabled={isNew ? !codeEditable : true}
                          name="docNo"
                          value={values.docNo}
                          onChange={handleChange}
                          error={Boolean(touched.docNo && errors.docNo)}
                          helperText={touched.docNo && errors.docNo}
                          InputProps={{
                            startAdornment: (
                              <Box sx={{ mr: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                                #
                              </Box>
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Salesman Name"
                          name="desc"
                          value={values.desc}
                          onChange={handleChange}
                          error={Boolean(touched.desc && errors.desc)}
                          helperText={touched.desc && errors.desc}
                          placeholder="Enter salesman name"
                        />
                      </Grid>

                      {/* Contact Information */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: { xs: 1 } }} />
                        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          <EmailIcon color="primary" fontSize="small" />
                          Contact Information
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          type='email'
                          label="Email Address"
                          name="email"
                          value={values.email}
                          onChange={handleChange}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                          placeholder="salesman@example.com"
                          InputProps={{
                            startAdornment: (
                              <EmailIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem' }} />
                            ),
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Mobile Number"
                          name="mobile"
                          value={values.mobile}
                          onChange={handleChange}
                          error={Boolean(touched.mobile && errors.mobile)}
                          helperText={touched.mobile && errors.mobile}
                          placeholder="+971 XX XXX XXXX"
                          InputProps={{
                            startAdornment: (
                              <PhoneIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '1.125rem' }} />
                            ),
                          }}
                        />
                      </Grid>

                      {/* Form Actions */}
                      <Grid item xs={12}>
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
                            sx={{ minWidth: { xs: '100%', sm: 140 } }}
                          >
                            {loading ? 'Saving...' : `${isNew ? "Create" : "Update"} Salesman`}
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Box>          </Paper>
        </Box> 
      </Slide>
    </Modal>
  );
};

export default ModalForm;
