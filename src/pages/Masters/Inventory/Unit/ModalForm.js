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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Fade,
  IconButton,
  Divider,
  Alert,
  Chip,
  useTheme,
  alpha,
  Paper,
  useMediaQuery,
  Slide
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as yup from 'yup';
import CloseIcon from '@mui/icons-material/Close';
import StraightenIcon from '@mui/icons-material/Straighten';
import BusinessIcon from '@mui/icons-material/Business';
import Iconify from '../../../../components/iconify';
import { GetSingleResult, PostCommonSp } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';

const ModalForm = ({ open, onClose, initialValues }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showToast } = useToast();
  const [isNew, setIsNew] = useState(true);
  const [codeEditable, setCodeEditable] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (initialValues !== null) {
      setIsNew(false);
    } else {
      setIsNew(true);
    }
  }, [initialValues, open]);

  const validationSchema = yup.object().shape({
    Key: yup.string().required('Unit key is required').min(1, 'Key must be at least 1 character'),
    Value: yup.string().required('Unit value is required').min(1, 'Value must be at least 1 character'),
  });

  const HandleData = async (data, type) => {
    setLoading(true);
    try {
      const { Success, Message } = await GetSingleResult({
        key: 'UNITS_CRUD',
        TYPE: type,
        LK_KEY: data.Key,
        LK_VALUE: data.Value,
      });

      if (Success) {
        showToast(
          type === "CREATE"
            ? '✅ Unit created successfully!'
            : '✅ Unit updated successfully!',
          'success'
        );
        onClose();
      } else {
        showToast(Message || 'Operation failed', "error");
      }
    } catch (error) {
      showToast('Network error - please try again', "error");
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
          >
            {/* Mobile-Friendly Header */}
            <Box
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                p: { xs: 2, sm: 3 },
                position: 'relative',
                flexShrink: 0
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Box
                  sx={{
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                    borderRadius: 2,
                    backgroundColor: alpha('#fff', 0.2),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <StraightenIcon fontSize={isSmallMobile ? 'medium' : 'large'} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant={isSmallMobile ? "h6" : "h5"}
                    sx={{
                      fontWeight: 600,
                      mb: 0.5,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {isNew ? "Create New Unit" : "Update Unit"}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={isNew ? "NEW" : "EDIT"}
                      size="small"
                      sx={{
                        backgroundColor: alpha('#fff', 0.2),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                    {!isNew && initialValues && !isSmallMobile && (
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        ID: {initialValues.LK_KEY}
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
                  right: { xs: 8, sm: 16 },
                  top: { xs: 8, sm: 16 },
                  color: 'white',
                  backgroundColor: alpha('#fff', 0.1),
                  width: { xs: 36, sm: 44 },
                  height: { xs: 36, sm: 44 },
                  '&:hover': {
                    backgroundColor: alpha('#fff', 0.2),
                  }
                }}
              >
                <CloseIcon fontSize={isSmallMobile ? 'small' : 'medium'} />
              </IconButton>
            </Box>

            {/* Form Content */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Formik
                initialValues={{
                  Key: initialValues?.LK_KEY || '',
                  Value: initialValues?.LK_VALUE || '',
                }}
                validationSchema={validationSchema}
                enableReinitialize
                onSubmit={(values) => {
                  if (isNew) {
                    HandleData(values, 'CREATE');
                  } else {
                    HandleData(values, 'UPDATE');
                  }
                }}
              >
                {({ values, errors, touched, handleChange, isSubmitting }) => (
                  <Form>
                    <Grid container spacing={{ xs: 2 }}>
                      {/* Unit Information */}
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                          <BusinessIcon color="primary" fontSize="small" />
                          Unit Information
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Unit Key"
                          name="Key"
                          value={values.Key}
                          onChange={handleChange}
                          error={Boolean(touched.Key && errors.Key)}
                          helperText={touched.Key && errors.Key}
                          placeholder="Enter unit key (e.g., KG, PCS)"
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
                          label="Unit Value"
                          name="Value"
                          value={values.Value}
                          onChange={handleChange}
                          error={Boolean(touched.Value && errors.Value)}
                          helperText={touched.Value && errors.Value}
                          placeholder="Enter unit description (e.g., Kilogram, Pieces)"
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
                            {loading ? 'Saving...' : `${isNew ? "Create" : "Update"} Unit`}
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
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
