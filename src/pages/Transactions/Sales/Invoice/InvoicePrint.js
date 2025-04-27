import { Box } from '@mui/material';

export default function InvoicePrint({ headerData, items }) {
    return (
        <Box sx={{ p: 2, maxWidth: '800px', margin: '0 auto' }}>
            <div className="container">
                <div className="header">
                    <div className="company-info">
                        <div>
                            <h2 style={{ color: '#113160', marginBottom: '8px', fontSize: '16px' }}>
                                <img src="/assets/logo.png" alt="Company Logo" className="company-logo" />
                            </h2>
                            <p style={{ margin: '3px 0', fontSize: '11px' }}>Address Line 1</p>
                            <p style={{ margin: '3px 0', fontSize: '11px' }}>City, State, Country</p>
                            <p style={{ margin: '3px 0', fontSize: '11px' }}>Phone: +1234567890</p>
                        </div>
                    </div>
                    <div>
                        <div className="invoice-title">INVOICE</div>
                        <p style={{ margin: '3px 0', fontSize: '12px' }}>Invoice #: <span className="value-text">{headerData.InvNo}</span></p>
                        <p style={{ margin: '3px 0', fontSize: '12px' }}>Date: <span className="value-text">{new Date(headerData.InvDate).toLocaleString()}</span></p>
                        <p style={{ margin: '3px 0', fontSize: '12px',textTransform:"capitalize" }}>Status: <span className={`status-badge status-${headerData.Status.toLowerCase()}`}>{headerData.Status.toUpperCase()}</span></p>
                    </div>
                </div>

                <div className="customer-details">
                    <div className="customer-box">
                        <div className="section-title">Bill To:</div>
                        <p style={{ margin: '3px 0', fontSize: '11px' }}><span className="value-text">{headerData.Customer}</span></p>
                        <p style={{ margin: '3px 0', fontSize: '11px' }}>{headerData.Address}</p>
                        <p style={{ margin: '3px 0', fontSize: '11px' }}>TRN: {headerData.TRN}</p>
                        <p style={{ margin: '3px 0', fontSize: '11px' }}>Phone: {headerData.ContactNo}</p>
                        <p style={{ margin: '3px 0', fontSize: '11px' }}>Email: {headerData.Email}</p>
                    </div>
                    <div className="customer-box">
                        <p style={{ margin: '3px 0', fontSize: '11px' }}>LPO No: <span className="value-text">{headerData.LPONo}</span></p>
                        <p style={{ margin: '3px 0', fontSize: '11px' }}>Payment Mode: <span className="value-text">{headerData.PaymentMode}</span></p>
                        <p style={{ margin: '3px 0', fontSize: '11px' }}>Reference: <span className="value-text">{headerData.RefNo}</span></p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Sr No</th>
                            <th>Item Code</th>
                            <th>Description</th>
                            <th>Unit</th>
                            <th style={{ textAlign: 'right' }}>Quantity</th>
                            <th style={{ textAlign: 'right' }}>Price</th>
                            <th style={{ textAlign: 'right' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.name}</td>
                                <td>{item.desc}</td>
                                <td>{item.unit}</td>
                                <td style={{ textAlign: 'right' }}>{item.qty}</td>
                                <td style={{ textAlign: 'right' }}>{item.price.toFixed(2)}</td>
                                <td style={{ textAlign: 'right' }}>{(item.qty * item.price).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="totals">
                    <table>
                        <tr>
                            <td>Gross Amount</td>
                            <td style={{ textAlign: 'right' }}>{headerData.GrossAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Discount</td>
                            <td style={{ textAlign: 'right' }}>{headerData.Discount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td>Tax ({headerData.Tax}%)</td>
                            <td style={{ textAlign: 'right' }}>{headerData.TaxAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 'bold' }}>Net Amount</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>{headerData.NetAmount.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>

                <div className="footer">
                    <p style={{ color: '#113160', fontWeight: 'bold', marginBottom: '3px', fontSize: '11px' }}>Thank you for your business!</p>
                    <p style={{ color: '#666', fontSize: '10px' }}>This is a computer generated invoice, no signature required.</p>
                </div>
            </div>
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .container, .container * {
                            visibility: visible;
                        }
                        .container {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .page-break {
                            page-break-before: always;
                        }
                        .no-break {
                            page-break-inside: avoid;
                        }
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: #fff;
                        padding: 15px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        font-size: 12px;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        page-break-inside: avoid;
                    }
                    .company-info {
                        display: flex;
                        align-items: center;
                    }
                    .company-logo {
                        height: 60px;
                        margin-right: 15px;
                        border-radius: 4px;
                    }
                    .invoice-title {
                        text-align: right;
                        color: #113160;
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 8px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        border-bottom: 2px solid #113160;
                        padding-bottom: 8px;
                    }
                    .customer-details {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                        page-break-inside: avoid;
                    }
                    .customer-box {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 8px;
                        flex: 1;
                        margin: 0 8px;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        background-color: #fff;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        font-size: 11px;
                    }
                    th {
                        background-color: #113160;
                        color: #fff;
                        padding: 8px;
                        text-align: left;
                        font-size: 11px;
                    }
                    td {
                        padding: 8px;
                        border-bottom: 1px solid #eee;
                    }
                    tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    .totals {
                        width: 250px;
                        margin-left: auto;
                        background-color: #fff;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        border-radius: 8px;
                        page-break-inside: avoid;
                    }
                    .totals tr:last-child {
                        background-color: #113160;
                        color: #fff;
                    }
                    .footer {
                        text-align: center;
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        border-top: 2px solid #113160;
                        page-break-inside: avoid;
                    }
                    .section-title {
                        color: #113160;
                        font-size: 14px;
                        font-weight: bold;
                        margin-bottom: 8px;
                        border-bottom: 2px solid #113160;
                        padding-bottom: 4px;
                    }
                    .value-text {
                        font-weight: 500;
                        color: #113160;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 4px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: bold;
                    }
                    .status-paid {
                        background-color: #e8f5e9;
                        color: #2e7d32;
                    }
                    .status-unpaid {
                        background-color: #ffebee;
                        color: #d32f2f;
                    }
                    .status-overdue {
                        background-color: #fff3e0;
                        color: #ed6c02;
                    }
                    .status-draft {
                        background-color: #e3f2fd;
                        color: #113160;
                    }
                `}
            </style>
        </Box>
    );
} 