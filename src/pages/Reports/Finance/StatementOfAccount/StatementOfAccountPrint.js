import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Stack } from '@mui/material';
import useAuth from '../../../../hooks/useAuth';
import { extractDateOnly, formatDateCustom, isValidDate } from '../../../../utils/formatDate';

export default function StatementOfAccountPrint({ columns, rows, title, dateRange, statementType, toAccount }) {
  const PrintHeader = ({ dateRange, statementType, toAccount, companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN }) => (
    <Box className="print-header">
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Stack spacing={1}>
            <Box>
              <Typography variant="body2" fontWeight={700}>{companyName}</Typography>
              <Typography variant="body2" fontWeight={300} fontSize={12} py={0.15}>{companyAddress}</Typography>
              <Typography variant="body2" fontWeight={300} fontSize={12} py={0.15}>TRN:{companyTRN}</Typography>
              <Typography variant="body2" fontWeight={300} fontSize={12} py={0.15}>{companyPhone}</Typography>
              <Typography variant="body2" fontWeight={300} fontSize={12} py={0.15}>{companyEmail}</Typography>
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', height: '100%' }}>
            <img src={companyLogoUrl} alt="Company Logo" style={{ maxHeight: 60, maxWidth: 200 }} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="h6" fontWeight={700} fontSize={16}>{title}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} py={1} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="body2" fontWeight={300} >To,</Typography>
            <Typography variant="body2" fontWeight={300} fontSize={13} >Account: {toAccount}</Typography>
          </Box>
        </Grid>
        <Grid item xs={6} py={1} sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <Box sx={{
            textAlign: 'left',
            display: 'flex', flexDirection: 'column',
            alignContent: "flex-end",
            flexWrap: "wrap",
            alignItems: "flex-start",
            height: '100%',
            justifyContent: 'flex-end',
          }} >
            <Typography variant="body1" fontSize={13} py={0.15}>Date Range: {dateRange}</Typography>
            <Typography variant="body1" fontSize={13} py={0.15}>Statement Type: {statementType}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
  const formatValue = (value) => {
    if (value === 0 || value === null || value === undefined) return '';
    return  Math.abs(value)?.toFixed(2);
  };
  const formatBalanceValue = (value) => {
    if (value === 0 || value === null || value === undefined) return '';

    const absValue = Math.abs(value)?.toFixed(2);
    return value < 0 ? `${absValue} CR` : `${absValue} DR`;
  };
  const formatDate = (date) => {
    if (!isValidDate(date)) return date;
    return formatDateCustom(date, 'DD-MMM-YYYY');
  }
  const { companyName, companyAddress, companyPhone, companyEmail, companyLogoUrl, companyTRN } = useAuth();
  return (
    <Box sx={{ p: 2, minWidth: 600 }}>
      <PrintHeader
        headerData={{}}
        companyName={companyName}
        companyAddress={companyAddress}
        companyPhone={companyPhone}
        companyEmail={companyEmail}
        companyLogoUrl={companyLogoUrl}
        companyTRN={companyTRN}
        dateRange={dateRange}
        toAccount={toAccount}
        statementType={statementType}
      />
      <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider', }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.filter(col => col.accessorKey !== "od_days" && col.accessorKey !== "duedate").map((col) => (
                <TableCell key={col.accessorKey} align={col.muiTableBodyCellProps?.align || 'left'} width={col.size || 'auto'}  >
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.filter(col => col.accessorKey !== "od_days" && col.accessorKey !== "duedate").map((col) => (
                  <TableCell key={col.accessorKey} align={col.muiTableBodyCellProps?.align || 'left'} width={col.size || 'auto'}  >
                    {(col.accessorKey === 'docdate' || col.accessorKey === 'duedate') ? formatDate(row[col.accessorKey]) :
                      col.accessorKey === 'balance' ? formatBalanceValue(row[col.accessorKey]) :
                      col.accessorKey === 'credit' ? formatValue(row[col.accessorKey]) :
                         row[col.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
