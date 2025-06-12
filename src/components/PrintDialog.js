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
    };

    const handleDownload = async () => {
        const printContent = printRef.current;
        if (!printContent) {
            console.error('Print content not found');
            return;        }
        
        // Clone the node to avoid mutation
        const clone = printContent.cloneNode(true);        // Enhanced image handling - remove CORS-blocked external images
        const handleImages = async () => {
            const images = Array.from(clone.querySelectorAll('img'));
            
            images.forEach((img) => {
                if (img.src && !img.src.startsWith('data:')) {
                    const imgUrl = img.src.startsWith('http') ? img.src : window.location.origin + img.src;
                    
                    // For external images that might be CORS-blocked, replace with placeholder
                    if (imgUrl.startsWith('http') && !imgUrl.startsWith(window.location.origin)) {
                        console.log(`Replacing CORS-blocked external image: ${imgUrl}`);
                        
                        // Create a simple base64 placeholder image (1x1 transparent pixel)
                        const placeholderImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
                        
                        // Keep the original dimensions and styling
                        const originalWidth = img.offsetWidth || img.getAttribute('width') || '100';
                        const originalHeight = img.offsetHeight || img.getAttribute('height') || '50';
                        const originalStyle = img.getAttribute('style') || '';
                        
                        // Replace with placeholder image
                        img.src = placeholderImg;
                        img.style.width = `${originalWidth}px`;
                        img.style.height = `${originalHeight}px`;
                        img.style.backgroundColor = '#f0f0f0';
                        img.style.border = '1px solid #ddd';
                        
                        // Add a text overlay if possible
                        const container = document.createElement('div');
                        container.style.position = 'relative';
                        container.style.display = 'inline-block';
                        container.style.width = `${originalWidth}px`;
                        container.style.height = `${originalHeight}px`;

                        const textOverlay = document.createElement('div');
                        textOverlay.style.position = 'absolute';
                        textOverlay.style.top = '50%';
                        textOverlay.style.left = '50%';
                        textOverlay.style.transform = 'translate(-50%, -50%)';
                        textOverlay.style.fontSize = '12px';
                        textOverlay.style.color = '#666';
                        textOverlay.style.fontWeight = 'bold';
                        textOverlay.textContent = 'LOGO';
                        
                        container.appendChild(img);
                        container.appendChild(textOverlay);
                        
                        // Replace the original image with the container
                        img.parentNode.replaceChild(container, img);
                    }
                }
            });
        };
          // Handle images - remove CORS-blocked external images
        try {
            handleImages();
        } catch (error) {
            console.warn('Image handling failed, proceeding with PDF generation:', error);
        }
        
        // Short wait for any remaining processing
        await new Promise(res => setTimeout(res, 500));
          // Create a container for html2pdf with preserved styling
        const container = document.createElement('div');
        container.style.width = '100%';
        container.style.backgroundColor = 'white';
        container.style.padding = '20px';
        container.style.fontFamily = '"Roboto", "Helvetica", "Arial", sans-serif';
        container.style.minHeight = '200px';
        
        // Debug: Check if clone has content
        console.log('Clone content length:', clone.innerHTML.length);
        console.log('Clone has children:', clone.children.length);
        
        // Add custom styles that preserve the dialog layout
        const style = document.createElement('style');
        style.textContent = `
            body { 
                margin: 0; 
                padding: 0; 
                font-family: "Roboto", "Helvetica", "Arial", sans-serif;
            }
            
            table { 
                width: 100% !important; 
                border-collapse: collapse !important; 
                margin-bottom: 1rem !important; 
            }
            
            th, td { 
                border: 1px solid #ddd !important; 
                padding: 8px !important; 
                text-align: left !important; 
            }
            
            th { 
                font-size: 12px !important; 
                font-weight: bold !important; 
                background-color: #f5f5f5 !important;
            }
            
            td { 
                font-size: 11px !important; 
            }
            
            .MuiPaper-root {
                background-color: white !important;
                box-shadow: none !important;
            }
            
            .MuiCard-root {
                box-shadow: none !important;
                border: 1px solid #e0e0e0 !important;
                margin-bottom: 1rem !important;
            }
            
            .MuiCardContent-root {
                padding: 16px !important;
            }
            
            .MuiGrid-container {
                display: flex !important;
                flex-wrap: wrap !important;
            }
            
            .MuiTypography-root {
                margin: 0 0 0.5rem 0 !important;
            }
            
            /* Enhanced image handling */
            img {
                max-width: 100% !important;
                height: auto !important;
                display: block !important;
                image-rendering: -webkit-optimize-contrast !important;
                image-rendering: crisp-edges !important;
            }
            
            /* Specific logo styling */
            img[alt="Logo"], img[alt="Company Logo"] {
                height: 40px !important;
                width: auto !important;
                margin-bottom: 8px !important;
                margin-left: -5px !important;
            }
        `;
        
        container.appendChild(style);
        container.appendChild(clone);
        
        // Debug: Check final container content
        console.log('Container content length:', container.innerHTML.length);
        
        try {
            await html2pdf().set({
                margin: [10, 10, 10, 10],
                filename: `${documentTitle || title}.pdf`,
                html2canvas: {
                    scale: 1,
                    useCORS: true,
                    allowTaint: true,
                    logging: true,
                    backgroundColor: '#ffffff',
                    width: container.scrollWidth || 800,
                    height: container.scrollHeight || 600,            
                            onclone(clonedDoc) {
                        console.log('html2canvas cloned document');
                    }
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                }
            }).from(container).save();
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDF generation failed. Please check the console for details.');
        }
    };

    // Simple download function as fallback
    const handleSimpleDownload = async () => {
        const printContent = printRef.current;
        if (!printContent) {
            console.error('Print content not found');
            return;
        }

        try {
            await html2pdf().set({
                margin: [10, 10, 10, 10],
                filename: `${documentTitle || title}.pdf`,
                html2canvas: {
                    scale: 1,
                    useCORS: true,
                    allowTaint: true,
                    logging: true,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait'
                }
            }).from(printContent).save();
        } catch (error) {
            console.error('Simple PDF generation failed:', error);
            alert('PDF generation failed. Please try again.');
        }
    };

    return (
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
                            <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Download />}
                                    onClick={handleDownload}
                                    sx={{ minWidth: 120 }}
                                >
                                    Download
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<Download />}
                                    onClick={handleSimpleDownload}
                                    sx={{ minWidth: 120 }}
                                    size="small"
                                >
                                    Simple PDF
                                </Button>
                            </>
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
