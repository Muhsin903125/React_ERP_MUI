import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Stack } from '@mui/material';
import useAuth from '../../../../hooks/useAuth';

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
        <Grid item xs={6} py={1} sx={{ display: 'flex', alignItems: 'flex-end' ,justifyContent: 'flex-end'}}>
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
              {columns.map((col) => (
                <TableCell key={col.accessorKey} align={col.muiTableBodyCellProps?.align || 'left'}>
                  {col.header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col.accessorKey} align={col.muiTableBodyCellProps?.align || 'left'}>
                    {row[col.accessorKey]}
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
