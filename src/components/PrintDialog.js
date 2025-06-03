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
import html2pdf from 'html2pdf.js';

export default function PrintDialog({
    open,
    onClose,
    title = 'Print Preview',
    children,
    maxWidth = 'md',
    fullWidth = true,
    printRef,
    documentTitle,
    showDownload = true, // NEW: show/hide download button
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
                            th { 
                                    font-size: 12px !important; 
                                    font-weight: bold;
                                }
        
                                td {
                                    font-size: 11px !important;
                                }
                        @media print {
                            body {
                                padding: 0;
                            }
                                th { 
                                    font-size: 12px !important; 
                                    font-weight: bold;
                                }
         
                                td {
                                    font-size: 11px !important;
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

    const handleDownload = async () => {
        const printContent = printRef.current;
        if (!printContent) {
            console.error('Print content not found');
            return;
        }
        // Clone the node to avoid mutation
        const clone = printContent.cloneNode(true);
        // Inline all images as data URLs for html2pdf
        const imgPromises = Array.from(clone.querySelectorAll('img')).map(async (img) => {
            if (img.src && !img.src.startsWith('data:')) {
                try {
                    const response = await fetch(img.src, { mode: 'cors' });
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            img.src = reader.result;
                            resolve();
                        };
                        reader.readAsDataURL(blob);
                    });
                } catch (e) {
                    return Promise.resolve();
                }
            }
            return Promise.resolve();
        });
        await Promise.all(imgPromises);
        await new Promise(res => setTimeout(res, 200));
        // Create a container for html2pdf
        const container = document.createElement('div');
        // Add custom style for th/td before content
        const style = document.createElement('style');
        style.textContent = `
            th { font-size: 12px !important; font-weight: bold; }
            td { font-size: 11px !important; }
        `;
        container.appendChild(style);
        container.appendChild(clone);
        await html2pdf().set({
            margin: [2, 2, 2, 2],
            filename: `${documentTitle || title}.pdf`,
            html2canvas: {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: null
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(container).save();
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
                                onClick={handleDownload}
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