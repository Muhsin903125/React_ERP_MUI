import React, { useState } from 'react'; 
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import {
    Box,
    Grid,
    TextField,
    Paper,
    CircularProgress,
} from '@mui/material';
import ReportHeader from '../../../../components/ReportHeader';
import DataTable from '../../../../components/DataTable';
import DateSelector from '../../../../components/DateSelector';

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

const columns = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'debit', header: 'Debit', muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' } },
    { accessorKey: 'credit', header: 'Credit', muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' } },
    { accessorKey: 'balance', header: 'Balance', muiTableBodyCellProps: { align: 'right' }, headerProps: { align: 'right' } },
];

const mockData = [
    {
        date: '2025-06-01',
        description: 'Opening Balance',
        debit: '',
        credit: '',
        balance: '1000.00',
    },
    {
        date: '2025-06-02',
        description: 'Invoice Payment',
        debit: '500.00',
        credit: '',
        balance: '1500.00',
    },
    {
        date: '2025-06-03',
        description: 'Purchase',
        debit: '',
        credit: '200.00',
        balance: '1300.00',
    },
];

const StatementOfAccount = () => {
    // Initialize with the first day of current month and today
    const [fromDate, setFromDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [toDate, setToDate] = useState(dayjs().format('YYYY-MM-DD'));
    const [searchKey, setSearchKey] = useState('');
    const [data, setData] = useState(mockData);
    const [touched, setTouched] = useState(false);
    const [loader, setLoader] = useState(false);

    const isFormValid = fromDate && toDate;

    const handleSearch = () => {
        setTouched(true);
        if (isFormValid) {
            setLoader(true);
            
          
            const filteredData = mockData.filter(item => {
                try {
                    // Check if the item date is between fromDate and toDate (inclusive)
                    const isInDateRange = dayjs(item.date).isBetween(fromDate, toDate, 'day', '[]');
                    
                    // Account filter
                    const searchKeyMatch = !searchKey ||
                        Object.values(item).some(prop =>
                            prop && prop.toString().toLowerCase().includes(searchKey.toLowerCase())
                        );

                    console.log(`Date check for ${item.date}:`, {
                        fromDate,
                        toDate,
                        isInDateRange
                    });

                    return searchKeyMatch && isInDateRange;
                } catch (error) {
                    console.error('Date comparison error:', error);
                    return false;
                }
            });

            console.log('Filtered Data:', filteredData);
            setData(filteredData);
        }
        setLoader(false);
    };
        const handleReset = () => {
        setFromDate(dayjs().startOf('month').format('YYYY-MM-DD'));
        setToDate(dayjs().format('YYYY-MM-DD'));
        setSearchKey('');
        setData(mockData);
        setTouched(false);
    };

    return (
        <Box p={{ xs: 2, md: 2 }}>
            <ReportHeader
                title="Statement of Account"
                onSearch={handleSearch}
                onReset={handleReset}
                searchDisabled={!isFormValid}
            >
                <Grid 
                    container 
                    spacing={2} 
                    alignItems="center"
                >
                    <Grid item xs={12} md={4}>
                        <TextField
                            label="Search Text"
                            value={searchKey}
                            onChange={e => setSearchKey(e.target.value)}
                            fullWidth
                            size="small"
                            error={touched && !searchKey}
                            helperText={touched && !searchKey ? 'Search Text is required' : ''}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <DateSelector
                            label="From Date"
                            size="small"
                            value={fromDate} 
                            onChange={setFromDate}
                            error={touched && !fromDate}
                            helperText={touched && !fromDate ? 'From Date is required' : ''}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <DateSelector
                            label="To Date"
                            size="small"
                            value={toDate}
                            onChange={setToDate}
                            error={touched && !toDate}
                            helperText={touched && !toDate ? 'To Date is required' : ''}
                        />
                    </Grid>
                </Grid>
            </ReportHeader>
            <Paper elevation={2} sx={{ p: 2 }}>
                {!loader && data ? (
                    <DataTable
                        columns={columns}
                        data={data}
                        enableRowSelection
                        enableGrouping
                        enableExport
                    />
                ) : (
                    <CircularProgress color="inherit" />
                )}
            </Paper>
        </Box>
    );
};

export default StatementOfAccount;