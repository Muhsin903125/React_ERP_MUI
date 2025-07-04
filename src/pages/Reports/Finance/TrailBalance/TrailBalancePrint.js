import React from 'react';
import { 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableCell,
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Grid, 
    Stack,
    Chip,
    alpha,
    useTheme
} from '@mui/material';
import useAuth from '../../../../hooks/useAuth';
import { extractDateOnly, formatDateCustom, isValidDate } from '../../../../utils/formatDate';

export default function TrailBalancePrint({ columns, rows, title, dateRange, accountType, reportFormat, fromDate, toDate, summary }) {
  const theme = useTheme();
  
  const PrintHeader = ({ dateRange, accountType, companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN }) => (
    <Box className="print-header" sx={{ mb: 4 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Stack spacing={1}>
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.main">
                {companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {companyAddress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                TRN: {companyTRN}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {companyPhone}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {companyEmail}
              </Typography>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', height: '100%' }}>
            <img 
              src={companyLogoUrl} 
              alt="Company Logo" 
              style={{ 
                maxHeight: 80, 
                maxWidth: 200,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))'
              }} 
            />
          </Box>
        </Grid>
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Paper 
            elevation={0} 
            sx={{ 
              textAlign: 'center', 
              py: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              borderRadius: 2,
              border: `2px solid ${theme.palette.primary.main}`
            }}
          >
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {title}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} py={2}>
          <Stack spacing={1}>
            <Typography variant="body1" fontWeight={600}>Report Details:</Typography>
            <Typography variant="body2">Date Range: {dateRange}</Typography>
            <Typography variant="body2">Account Type: {accountType}</Typography>
          </Stack>
        </Grid>
        <Grid item xs={6} py={2} sx={{ textAlign: 'right' }}>
          <Stack spacing={1} alignItems="flex-end">
            <Typography variant="body1" fontWeight={600}>Generated:</Typography>
            <Typography variant="body2">{new Date().toLocaleDateString()}</Typography>
            <Typography variant="body2">{new Date().toLocaleTimeString()}</Typography>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const formatValue = (value) => {
    if (value === 0 || value === null || value === undefined) return '-';
    return Math.abs(value)?.toFixed(2);
  };

  const formatBalanceValue = (value) => {
    if (value === 0 || value === null || value === undefined) return '0.00';
    const absValue = Math.abs(value)?.toFixed(2);
    return value < 0 ? `${absValue} CR` : `${absValue} DR`;
  };

  const { companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN } = useAuth();

  // Calculate totals for the table footer with null safety
  const totals = Array.isArray(rows) && rows.length > 0 ? rows.reduce((acc, row) => {
    acc.totalDebit += parseFloat(row?.debit || 0);
    acc.totalCredit += parseFloat(row?.credit || 0);
    acc.totalOpeningDebit += parseFloat(row?.opening_balance > 0 ? row.opening_balance : 0);
    acc.totalOpeningCredit += parseFloat(row?.opening_balance < 0 ? Math.abs(row.opening_balance) : 0);
    acc.totalClosingDebit += parseFloat(row?.closing_balance > 0 ? row.closing_balance : 0);
    acc.totalClosingCredit += parseFloat(row?.closing_balance < 0 ? Math.abs(row.closing_balance) : 0);
    return acc;
  }, { 
    totalDebit: 0, 
    totalCredit: 0, 
    totalOpeningDebit: 0, 
    totalOpeningCredit: 0, 
    totalClosingDebit: 0, 
    totalClosingCredit: 0 
  }) : { 
    totalDebit: 0, 
    totalCredit: 0, 
    totalOpeningDebit: 0, 
    totalOpeningCredit: 0, 
    totalClosingDebit: 0, 
    totalClosingCredit: 0 
  };

  const isBalanced = Math.abs(totals.totalDebit - totals.totalCredit) < 0.01;

  // Helper function to render cell values based on column type
  const renderCellValue = (row, col) => {
    const value = row[col.accessorKey];
    
    // Handle special computed columns
    if (col.accessorKey === 'opening_balance_debit') {
      const openingBalance = row.opening_balance || 0;
      return openingBalance > 0 ? openingBalance.toFixed(2) : '0.00';
    }
    
    if (col.accessorKey === 'opening_balance_credit') {
      const openingBalance = row.opening_balance || 0;
      return openingBalance < 0 ? Math.abs(openingBalance).toFixed(2) : '0.00';
    }
    
    if (col.accessorKey === 'closing_balance_debit') {
      const closingBalance = row.closing_balance || 0;
      return closingBalance > 0 ? closingBalance.toFixed(2) : '0.00';
    }
    
    if (col.accessorKey === 'closing_balance_credit') {
      const closingBalance = row.closing_balance || 0;
      return closingBalance < 0 ? Math.abs(closingBalance).toFixed(2) : '0.00';
    }
    
    if (col.accessorKey === 'transaction_net') {
      const debit = row.debit || 0;
      const credit = row.credit || 0;
      const netValue = debit - credit;
      return netValue === 0 ? '0.00' : netValue < 0 ? `${Math.abs(netValue).toFixed(2)} CR` : `${netValue.toFixed(2)} DR`;
    }
    
    // Handle balance columns with DR/CR
    if (col.accessorKey === 'opening_balance' || col.accessorKey === 'closing_balance') {
      return formatBalanceValue(value);
    }
    
    // Handle debit/credit columns
    if (col.accessorKey === 'debit' || col.accessorKey === 'credit') {
      return formatValue(value);
    }
    
    // Default case
    return value || '';
  };

  return (
    <Box sx={{ p: 2, minWidth: 600 }}>
      <PrintHeader
        companyName={companyName}
        companyAddress={companyAddress}
        companyPhone={companyPhone}
        companyEmail={companyEmail}
        companyLogoUrl={companyLogoUrl}
        companyTRN={companyTRN}
        dateRange={dateRange}
        accountType={accountType}
      />
      
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.100' }}>
              {columns.map((col) => (
                <TableCell 
                  key={col.accessorKey} 
                  align={col.muiTableBodyCellProps?.align || 'left'} 
                  width={col.size || 'auto'}
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx} sx={{ '&:nth-of-type(odd)': { bgcolor: 'grey.50' } }}>
                {columns.map((col) => (
                  <TableCell 
                    key={col.accessorKey} 
                    align={col.muiTableBodyCellProps?.align || 'left'} 
                    width={col.size || 'auto'}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {renderCellValue(row, col)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {/* Dynamic Totals Row */}
            <TableRow sx={{ bgcolor: 'primary.lighter', fontWeight: 'bold' }}>
              {columns.map((col, index) => (
                <TableCell 
                  key={col.accessorKey}
                  align={col.muiTableBodyCellProps?.align || 'left'} 
                  sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                >
                  {index === 0 ? <strong>TOTALS</strong> : 
                   index === 1 ? '' : // Account code column
                   col.accessorKey === 'opening_balance_debit' ? <strong>{totals.totalOpeningDebit.toFixed(2)}</strong> :
                   col.accessorKey === 'opening_balance_credit' ? <strong>{totals.totalOpeningCredit.toFixed(2)}</strong> :
                   col.accessorKey === 'debit' ? <strong>{totals.totalDebit.toFixed(2)}</strong> :
                   col.accessorKey === 'credit' ? <strong>{totals.totalCredit.toFixed(2)}</strong> :
                   col.accessorKey === 'closing_balance_debit' ? <strong>{totals.totalClosingDebit.toFixed(2)}</strong> :
                   col.accessorKey === 'closing_balance_credit' ? <strong>{totals.totalClosingCredit.toFixed(2)}</strong> :
                   col.accessorKey === 'opening_balance' ? (
                     <strong>
                       {totals.totalOpeningDebit > totals.totalOpeningCredit 
                         ? `${(totals.totalOpeningDebit - totals.totalOpeningCredit).toFixed(2)} DR`
                         : `${(totals.totalOpeningCredit - totals.totalOpeningDebit).toFixed(2)} CR`
                       }
                     </strong>
                   ) :
                   col.accessorKey === 'closing_balance' ? (
                     <strong>
                       {totals.totalClosingDebit > totals.totalClosingCredit 
                         ? `${(totals.totalClosingDebit - totals.totalClosingCredit).toFixed(2)} DR`
                         : `${(totals.totalClosingCredit - totals.totalClosingDebit).toFixed(2)} CR`
                       }
                     </strong>
                   ) :
                   col.accessorKey === 'transaction_net' ? (
                     <strong>
                       {(totals.totalDebit - totals.totalCredit) === 0 ? '0.00' :
                        (totals.totalDebit - totals.totalCredit) < 0 ? 
                        `${Math.abs(totals.totalDebit - totals.totalCredit).toFixed(2)} CR` : 
                        `${(totals.totalDebit - totals.totalCredit).toFixed(2)} DR`
                       }
                     </strong>
                   ) : ''
                  }
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary Section */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Total Debit:</strong> {totals.totalDebit.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              <strong>Total Credit:</strong> {totals.totalCredit.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2">
              <strong>Difference:</strong> {Math.abs(totals.totalDebit - totals.totalCredit).toFixed(2)}
            </Typography>
            <Typography variant="body2" color={totals.totalDebit === totals.totalCredit ? 'success.main' : 'error.main'}>
              <strong>Status:</strong> {totals.totalDebit === totals.totalCredit ? 'Balanced' : 'Not Balanced'}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          This is a computer generated report and does not require signature.
        </Typography>
      </Box>
    </Box>
  );
}
