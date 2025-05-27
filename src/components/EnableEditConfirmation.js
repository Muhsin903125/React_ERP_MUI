import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';

export default function EnableEditConfirmation({
    open,
    onClose,
    onConfirm,
    loading = false,
    title = 'Confirm Edit Mode',
    message = 'Are you sure you want to enable edit mode? This will allow you to modify the document.',
    confirmText = 'Enable Edit',
    cancelText = 'Cancel',
    confirmColor = 'primary'
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Typography>{message}</Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    {cancelText}
                </Button>
                <Button 
                    onClick={onConfirm} 
                    color={confirmColor} 
                    variant="contained" 
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 