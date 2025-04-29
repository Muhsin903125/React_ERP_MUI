            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }

                    html, body {
                        width: 210mm;
                        height: auto !important;
                        margin: 0;
                        padding: 0;
                        overflow: visible !important;
                        position: static !important;
                    }

                    .print-container {
                        width: 210mm !important;
                        margin: 0 auto !important;
                        padding: 0 !important;
                        background: white !important;
                        overflow: visible !important;
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                    }

                    .print-page {
                        width: 210mm;
                        height: auto !important;
                        padding: 20px;
                        margin: 0 auto;
                        position: relative;
                        background: white;
                        box-shadow: none;
                        break-after: avoid !important;
                        page-break-after: avoid !important;
                        overflow: visible !important;
                    }

                    /* Essential fix for Chrome (breaks trailing blank page) */
                    .print-page:last-child {
                        page-break-after: avoid !important; 
                        break-after: avoid !important;
                        height: auto !important;
                        position: relative !important;
                    }

                    .print-page:last-child::after {
                        content: "";
                        display: block;
                        height: 0;
                        clear: both;
                    }

                    .print-header {
                        position: relative;
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        border-bottom: 1px solid #e3f2fd;
                        background-color: #fafafa;
                        padding: 20px;
                        border-radius: 4px;
                    }

                    .content-section {
                        position: relative;
                        padding-top: 10px;
                    }

                    .summary-section {
                        margin-top: 20px;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        background-color: #f0f7ff !important;
                        border: 1px solid #e3f2fd !important;
                        border-radius: 4px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .remarks-section {
                        margin-top: 20px;
                        break-inside: avoid;
                        page-break-inside: avoid;
                        background-color: #fff8e1 !important;
                        border: 1px solid #ffecb3 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        table-layout: fixed;
                        margin-bottom: 0;
                        background-color: white;
                    }

                    thead {
                        display: table-header-group;
                    }

                    tr {
                        page-break-inside: avoid;
                        break-inside: avoid;
                    }

                    tr:nth-child(even) {
                        background-color: #fafafa !important;
                    }

                    th {
                        background-color: #e3f2fd !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        font-weight: 600;
                        padding: 5px;
                        border: 1px solid #bbdefb;
                        font-size: 11px;
                        color: #1976d2;
                    }

                    td {
                        padding: 5px;
                        border: 1px solid #e3f2fd;
                        font-size: 10px;
                        vertical-align: top;
                    }

                    img {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Critical fix for Chrome */
                    @media print and (-webkit-min-device-pixel-ratio:0) {
                        html, body {
                            width: 100% !important;
                            height: auto !important;
                            overflow: visible !important;
                            position: static !important;
                        }
                        
                        .print-container {
                            width: 100% !important;
                            height: auto !important;
                            break-after: avoid !important;
                            page-break-after: avoid !important;
                            overflow: visible !important;
                        }
                        
                        .print-page {
                            break-after: avoid !important;
                            page-break-after: avoid !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }
                        
                        .print-page:last-child {
                            page-break-after: auto !important;
                        }
                        
                        body::after {
                            content: "";
                            display: block;
                            height: 0;
                            page-break-after: avoid;
                            margin-bottom: -100px;
                        }
                    }

                    /* Enhanced fix for Safari */
                    @media not all and (min-resolution:.001dpcm) {
                        @supports (-webkit-appearance:none) {
                            body {
                                height: auto !important;
                            }
                            .print-page:last-child {
                                margin-bottom: -1px !important;
                                border-bottom: none !important;
                            }
                            
                            /* Force minimum height for single items */
                            .print-container {
                                min-height: 0 !important;
                                height: auto !important;
                            }
                        }
                    }

                    /* Fix for Firefox */
                    @-moz-document url-prefix() {
                        body {
                            size: auto;
                            margin: 0mm;
                        }
                        
                        /* Specific Fix for Firefox blank page */
                        html, body {
                            height: auto !important;
                        }
                        
                        .print-container, .print-page {
                            height: auto !important;
                            position: static !important;
                        }
                        
                        .print-page:last-child {
                            page-break-after: avoid !important;
                            break-after: avoid !important;
                        }
                    }
                }

                /* Preview styling (non-print) */
                .print-container {
                    background: white;
                    min-height: auto;
                    width: 210mm;
                    margin: 20px auto;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                }

                .print-page {
                    padding: 20px;
                    background: white;
                }
            `}</style> 