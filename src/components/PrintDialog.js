import React from 'react';
import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
    Typography,
    Button,
    Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PrintIcon from '@mui/icons-material/Print';
import Link from '@mui/material/Link';
import { Download } from '@mui/icons-material';

export default function PrintDialog({ 
    open, 
    onClose, 
    title = 'Print Preview',
    children,
    maxWidth = 'md',
    fullWidth = true,
    printRef,
    documentTitle,
    showDownload = false, // NEW: show/hide download button
    onDownload 
}) {
    const handlePrint = () => {
        const printContent = printRef.current;
        if (!printContent) {
            console.error('Print content not found');
            return;
        }

        const printWindow = window.open('', '', 'width=800,height=600');
        if (!printWindow) {
            console.error('Could not open print window');
            return;
        }

        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${documentTitle || title}</title>
                    <style>
                        ${styles}
                        body {
                            padding: 20px;
                        }
                        @media print {
                            body {
                                padding: 0;
                            }
                            @page {
                                size: A4;
                                margin: 1cm;
                            }
                            .no-print {
                                display: none !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            PaperProps={{
                sx: {
                    minHeight: '80vh',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogContent sx={{ p: 0, position: 'relative' }}>
                {/* Header */}
                <Box sx={{ 
                    p: 2, 
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1
                }} className="no-print">
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={onClose}
                        >
                            Close
                        </Button>
                        {showDownload && (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Download />}
                                onClick={onDownload}
                                sx={{ minWidth: 120 }}
                            >
                                Download
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            startIcon={<PrintIcon />}
                            onClick={handlePrint}
                        >
                            Print
                        </Button>
                    </Stack>
                </Box>

                {/* Print Content */}
                <Box 
                    ref={printRef}
                    sx={{ 
                        p: 3,
                        height: 'calc(100% - 64px)',
                        overflow: 'auto'
                    }}
                >
                    {children}
                </Box>
            </DialogContent>
        </Dialog>
    );
}