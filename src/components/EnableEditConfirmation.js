import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    CircularProgress,
    Box,
    Stack,
    Divider
} from '@mui/material';
import { Report, Warning, Info } from '@mui/icons-material';

/**
 * Modern, accessible confirmation dialog for enabling edit mode.
 * Shows a styled, icon-enhanced message list for errors/warnings.
 */
export default function EnableEditConfirmation({
    open,
    onClose,
    onConfirm,
    messageList = [],
    loading = false,
    title = 'Confirm Edit Mode',
    message = 'Are you sure you want to enable edit mode? This will allow you to modify the document.',
    confirmText = 'Enable Edit',
    cancelText = 'Cancel',
    confirmColor = 'primary',
}) {


    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            aria-labelledby="enable-edit-dialog-title"
        >
            <DialogTitle id="enable-edit-dialog-title" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                {title}
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ py: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
                        <CircularProgress />
                    </Box>
                ) : messageList && messageList.length > 0 ? (
                    <Box component="ul" sx={{ pl: 0, mb: 0, mt: 0, listStyle: 'none' }}>
                        {messageList.map((item, index) => {
                            let icon = null;
                            let color = 'text.primary';
                            let bg = 'background.paper';
                            if (item.type === 'error') {
                                icon = <Report color="error" sx={{ mr: 1 }} />;
                                color = 'error.main';
                                bg = 'rgba(244,67,54,0.08)';
                            } else if (item.type === 'warning') {
                                icon = <Warning color="warning" sx={{ mr: 1 }} />;
                                color = 'warning.main';
                                bg = 'rgba(255,193,7,0.08)';
                            } else {
                                icon = <Info color="info" sx={{ mr: 1 }} />;
                                color = 'info.main';
                                bg = 'rgba(33,150,243,0.08)';
                            }
                            return (
                                <Box
                                    key={index}
                                    component="li"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        mb: 1.5,
                                        px: 2,
                                        py: 1.2,
                                        borderRadius: 2,
                                        backgroundColor: bg,
                                        color,
                                        boxShadow: 0,
                                        fontSize: '1rem',
                                        transition: 'background 0.2s',
                                    }}
                                >
                                    {icon}
                                    <Typography
                                        variant="body2"
                                        color={color}
                                        fontWeight={item.type === 'error' ? 700 : 500}
                                        component="span"
                                        sx={{ wordBreak: 'break-word', flex: 1 }}
                                    >
                                        {item.message_type && (
                                            <strong>{item.message_type}: </strong>
                                        )}
                                        {item.message}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ px: 1 }}>
                        {message}
                    </Typography>
                )}
            </DialogContent>
            <Divider />
            <DialogActions sx={{ px: 3, py: 2, justifyContent: 'flex-end' }}>
                {messageList && messageList.length > 0 && messageList.some(item => item.type === 'error') ?
                    null : <Button onClick={onClose} disabled={loading} variant="outlined" color="inherit">
                        {cancelText}
                    </Button>}
                <Button
                    onClick={() => {
                        if (messageList && messageList.some(item => item.type === 'error')) {
                            onClose(); // Close dialog if there are errors
                        }
                        else if (messageList && messageList.length > 0 && !messageList.some(item => item.type === 'error')) {
                            onConfirm(messageList);
                        }
                        else {
                            onConfirm([]);
                        }
                    }}
                    color={messageList && messageList.length > 0 && !messageList.some(item => item.type === 'error') ? "warning" :
                        messageList && messageList.length > 0 && messageList.some(item => item.type === 'error') ? "error" :
                            confirmColor}
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                    sx={{ minWidth: 120, ml: 1 }}
                >
                    {messageList && messageList.length > 0 && !messageList.some(item => item.type === 'error') ? " Agree & Continue Editing" :
                        (messageList && messageList.length > 0 && messageList.some(item => item.type === 'error') ? " Close & Review Errors" :
                            confirmText)}
                </Button>
            </DialogActions>
        </Dialog >
    );
}