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

        const printWindow = window.open('', '', 'width=1200,height=800');
        if (!printWindow) {
            console.error('Could not open print window');
            return;
        }

        // Get all styles from the current document
        const styles = Array.from(document.styleSheets)
            .map(styleSheet => {
                try {
                    return Array.from(styleSheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    // Handle cross-origin stylesheets
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = styleSheet.href;
                    return link.outerHTML;
                }
            })
            .join('\n');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${documentTitle || title}</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        ${styles}
                        
                        /* Preserve dialog layout for print */
                        body {
                            margin: 0;
                            padding: 20px;
                            font-family: "Roboto", "Helvetica", "Arial", sans-serif;
                            background: white;
                        }
                        
                        /* Preserve original styling */
                        .print-container {
                            width: 100%;
                            max-width: none;
                            margin: 0;
                            background: white;
                        }
                        
                        /* Maintain table layouts */
                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                            margin-bottom: 1rem !important;
                        }
                        
                        th, td {
                            border: 1px solid #ddd !important;
                            padding: 8px !important;
                            text-align: left !important;
                            vertical-align: top !important;
                        }
                        
                        th { 
                            font-size: 12px !important; 
                            font-weight: bold !important;
                            background-color: #f5f5f5 !important;
                        }
                        
                        td { 
                            font-size: 11px !important; 
                        }
                        
                        @media print {
                            th {
                                font-size: 10px !important;
                            }
                            
                            td {
                                font-size: 9px !important;
                            }
                            
                            /* Prevent page breaks in important sections */
                            .MuiCard-root,
                            .print-section {
                                page-break-inside: avoid;
                                break-inside: avoid;
                            }
                        }
                        
                        /* Hide scrollbars */
                        * {
                            scrollbar-width: none;
                            -ms-overflow-style: none;
                        }
                        *::-webkit-scrollbar {
                            display: none;
                        }
                    </style>
                </head>
                <body>
                    <div class="print-container">
                        ${printContent.innerHTML}
                    </div>
                </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        // Wait for styles to load before printing
        setTimeout(() => {
            printWindow.print();
            setTimeout(() => {
                printWindow.close();
            }, 100);
        }, 1000);
    };    const handleDownload = async () => {
        const printContent = printRef.current;
        if (!printContent) {
            console.error('Print content not found');
            return;
        }

        try {
            // Get all styles from the current document (same as print function)
            const styles = Array.from(document.styleSheets)
                .map(styleSheet => {
                    try {
                        return Array.from(styleSheet.cssRules)
                            .map(rule => rule.cssText)
                            .join('\n');
                    } catch (e) {
                        // Handle cross-origin stylesheets
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = styleSheet.href;
                        return link.outerHTML;
                    }
                })
                .join('\n');

            // Create HTML content with the exact same structure as print
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>${documentTitle || title}</title>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1">
                        <style>
                            ${styles}
                            
                            /* Preserve dialog layout for PDF */
                            body {
                                margin: 0;
                                padding: 20px;
                                font-family: "Roboto", "Helvetica", "Arial", sans-serif;
                                background: white;
                            }
                            
                            /* Preserve original styling */
                            .print-container {
                                width: 100%;
                                max-width: none;
                                margin: 0;
                                background: white;
                            }
                            
                            /* Maintain table layouts */
                            table {
                                width: 100% !important;
                                border-collapse: collapse !important;
                                margin-bottom: 1rem !important;
                            }
                            
                            th, td {
                                border: 1px solid #ddd !important;
                                padding: 8px !important;
                                text-align: left !important;
                                vertical-align: top !important;
                            }
                            
                            th { 
                                font-size: 12px !important; 
                                font-weight: bold !important;
                                background-color: #f5f5f5 !important;
                            }
                            
                            td { 
                                font-size: 11px !important; 
                            }
                            
                            /* Hide scrollbars */
                            * {
                                scrollbar-width: none;
                                -ms-overflow-style: none;
                            }
                            *::-webkit-scrollbar {
                                display: none;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="print-container">
                            ${printContent.innerHTML}
                        </div>
                    </body>
                </html>
            `;

            // Create a temporary element for html2pdf
            const tempElement = document.createElement('div');
            tempElement.innerHTML = htmlContent;

            // Use html2pdf with the same content structure as print
            await html2pdf().set({
                margin: [10, 10, 10, 10],
                filename: `${documentTitle || title}.pdf`,
                html2canvas: {
                    scale: 1,
                    useCORS: true,
                    allowTaint: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                }
            }).from(tempElement).save();
            
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDF generation failed. Please try again.');
        }
    };    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth={maxWidth} 
            fullWidth={fullWidth}
            PaperProps={{
                sx: {
                    width: '100%',
                    height: '90vh',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Header with controls */}
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
                        </Button>                        {showDownload && (
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
