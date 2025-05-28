// @mui
import { Stack, Typography, Button, useTheme, useMediaQuery, alpha, Menu, MenuItem, IconButton, Container } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
// components
import Iconify from './iconify';
import EnableEditConfirmation from './EnableEditConfirmation';
import { GetSingleListResult, GetSingleResult } from '../hooks/Api';
import { useToast } from '../hooks/Common';

// ----------------------------------------------------------------------

PageHeader.propTypes = {
  title: PropTypes.string,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      icon: PropTypes.string,
      variant: PropTypes.string,
      color: PropTypes.string,
      onClick: PropTypes.func,
      show: PropTypes.bool,
      showInActions: PropTypes.bool,
      type: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ),
  sx: PropTypes.object,
  onEditConfirm: PropTypes.func,
  editCheckApiKey: PropTypes.string,
  editCheckApiType: PropTypes.string,
  editCheckDocNo: PropTypes.string,
};

export default function PageHeader({ title, actions = [], onEditConfirm, editCheckApiKey, editCheckApiType = "EDIT_VALIDATE", editCheckDocNo, sx }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { showToast } = useToast();
  const [showEditConfirmDialog, setShowEditConfirmDialog] = useState(false);
  const [editCheckLoading, setEditCheckLoading] = useState(false);
  const [error, setError] = useState(false);
  const [message, setMessage] = useState();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  

  const checkEditPermission = async () => {
    // if (!editCheckApiKey || !editCheckApiType) {
    //   setShowEditConfirmDialog(true);
    //   return;
    // }

    try {
      setEditCheckLoading(true);
      const { Success, Data, Message } = await GetSingleListResult({
        "key": editCheckApiKey,
        "TYPE": editCheckApiType,
        "DOC_NO": editCheckDocNo
      });

      if (Success) {
        setMessage(Data);
        console.log("permission--",Data);
        setShowEditConfirmDialog(true);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      showToast("Error checking edit permission", "error");
    } finally {
      setEditCheckLoading(false);
    }
  };

  const handleEditConfirm = (error) => {
    if (onEditConfirm) {
      onEditConfirm(error ? editCheckDocNo : null);
    }
    setShowEditConfirmDialog(false);
  };

  const processAction = (action) => {
    if (action.type === 'enableEdit') {
      checkEditPermission();
    } else if (action.onClick) {
      action.onClick();
    }
  };

  const buttonStyles = {
    borderRadius: '8px',
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.875rem',
    padding: '6px 16px',
    '&:hover': {
      boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
    '& .MuiButton-startIcon': {
      marginRight: '8px',
      '& svg': {
        fontSize: '1.25rem',
      }
    }
  };

  const renderActionButton = (action, index) => (
    <Button
      key={index}
      variant={action.variant || "contained"}
      color={action.color || "primary"}
      startIcon={action.icon && <Iconify icon={action.icon} />}
      onClick={() => processAction(action)}
      disabled={action.disabled}
      sx={{
        ...buttonStyles,
        ...(action.variant === 'contained' && {
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          '&:hover': {
            ...buttonStyles['&:hover'],
            background: 'linear-gradient(45deg, #1976D2 30%, #1E88E5 90%)',
          }
        }),
        ...(action.variant === 'outlined' && {
          borderColor: theme.palette[action.color || 'primary'].main,
          color: theme.palette[action.color || 'primary'].main,
          '&:hover': {
            ...buttonStyles['&:hover'],
            borderColor: theme.palette[action.color || 'primary'].dark,
            backgroundColor: alpha(theme.palette[action.color || 'primary'].main, 0.08),
          }
        }),
      }}
    >
      {action.label}
    </Button>
  );

  const renderMobileActions = () => (
    <>
      <Button
        variant="outlined"
        aria-label="more"
        name="more"
        title="More Actions"
        onClick={handleClick}
        startIcon={<Iconify icon="eva:more-vertical-fill" />}
        sx={{
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '6px 16px',
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderColor: theme.palette.primary.dark,
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
          },
          '& .MuiButton-startIcon': {
            marginRight: '8px',
            '& svg': {
              fontSize: '1.25rem',
            }
          }
        }}
      >
        Actions
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 180,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            borderRadius: '12px',
          }
        }}
      >
        {actions.map((action, index) => (
          action.show !== false && action.showInActions && (
            <MenuItem
              key={index}
              onClick={() => {
                processAction(action);
                handleClose();
              }}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  bgcolor: alpha(theme.palette[action.color || 'primary'].main, 0.08),
                }
              }}
            >
              {action.icon && (
                <Iconify
                  icon={action.icon}
                  sx={{
                    mr: 2,
                    color: theme.palette[action.color || 'primary'].main,
                  }}
                />
              )}
              {action.label}
            </MenuItem>
          )
        ))}
      </Menu>
    </>
  );

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: 1,
          p: 1,
          borderRadius: '12px',
          background: isMobile ? 'linear-gradient(to right, rgba(255,255,255,0.9), rgba(255,255,255,0.7))' : 'none',
          boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.05)' : 'none',
          backdropFilter: 'blur(8px)',
          ...sx,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            width: { xs: '100%', sm: 'auto' },
            '& .MuiButton-root': {
              width: { xs: 'auto', sm: 'auto' },
              flex: { xs: 1, sm: 'none' },
            }
          }}
        >
          {actions.map((action, index) => (
            action.show && !action.showInActions && renderActionButton(action, index)
          ))}
          {actions.some(action => action.show !== false && action.showInActions) && renderMobileActions()}
        </Stack>
      </Stack>

      <EnableEditConfirmation
        open={showEditConfirmDialog}
        onClose={() => setShowEditConfirmDialog(false)}
        onConfirm={handleEditConfirm}
        loading={editCheckLoading}
        title="Enable Edit Mode"
        message="Are you sure you want to enable edit mode? This will allow you to modify the document."
        confirmText="Enable Edit"
        cancelText="Cancel"
        confirmColor="primary"
      />
    </>
  );
} 