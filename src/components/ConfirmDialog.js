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

export default function ConfirmDialog({
    open,
    onClose,
    title,
    message,
    onConfirm,
    loading = false,
    confirmText = 'Agree',
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
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
} 