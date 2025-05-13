import { Helmet } from 'react-helmet-async';
import { useContext, useState, useEffect } from 'react';
// @mui
import {
    Card,
    Stack,
    Button,
    Container,
    Typography,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Tooltip,
    FormControl,
    Grid,
    Box,
    Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GetSingleListResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import { AuthContext } from '../../../../App';
import Iconify from '../../../../components/iconify';
import DateSelector from '../../../../components/DateSelector';
import Dropdownlist from '../../../../components/DropdownList';
import Label from '../../../../components/label';
import Scrollbar from '../../../../components/scrollbar';

const TABLE_HEAD = [
    { id: 'cnNo', label: 'CN No', alignRight: false },
    { id: 'cnDate', label: 'Date', alignRight: false },
    { id: 'customer', label: 'Customer', alignRight: false },
    { id: 'invoiceNo', label: 'Invoice No', alignRight: false },
    { id: 'returnReason', label: 'Return Reason', alignRight: false },
    { id: 'amount', label: 'Amount', alignRight: true },
    { id: 'status', label: 'Status', alignRight: false },
    { id: '', label: 'Actions', alignRight: false },
];

const CreditNoteStatusOptions = [
    { value: '', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'posted', label: 'Posted' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function CreditNote() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { setLoadingFull } = useContext(AuthContext);
    const [creditNotes, setCreditNotes] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [filters, setFilters] = useState({
        fromDate: new Date(new Date().setDate(1)), // First day of current month
        toDate: new Date(),
        status: '',
        searchText: '',
    });

    const fetchCreditNotes = async () => {
        try {
            setLoadingFull(true);
            const { Success, Data, TotalCount } = await GetSingleListResult({
                "key": "CN_CRUD",
                "TYPE": "GET_ALL",
                "fromDate": filters.fromDate.toISOString(),
                "toDate": filters.toDate.toISOString(),
                "status": filters.status,
                "searchText": filters.searchText,
                "pageNumber": page + 1,
                "pageSize": rowsPerPage,
            });

            if (Success) {
                setCreditNotes(Data);
                setTotalCount(TotalCount);
            }
        } catch (error) {
            showToast("Error fetching credit notes", "error");
        } finally {
            setLoadingFull(false);
        }
    };

    useEffect(() => {
        fetchCreditNotes();
    }, [page, rowsPerPage, filters]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setPage(0);
    };

    const handleEdit = (id) => {
        navigate(`/creditnote-entry/${id}`);
    };

    const handleAdd = () => {
        // navigate('/dashboard/credit-note-entry');
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'posted':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'warning';
        }
    };

    return (
        <>
            <Helmet>
                <title> Credit Notes | ERP System </title>
            </Helmet>

            <Container maxWidth="xl">
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
                    <Typography variant="h4">Credit Notes</Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<Iconify icon="eva:plus-fill" />}
                        onClick={handleAdd}
                    >
                        New Credit Note
                    </Button>
                </Stack>

                <Card>
                    <Stack p={2.5} spacing={2.5}>
                        {/* Filters */}
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth>
                                    <DateSelector
                                        label="From Date"
                                        value={filters.fromDate}
                                        onChange={(date) => handleFilterChange('fromDate', date)}
                                        size="small"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth>
                                    <DateSelector
                                        label="To Date"
                                        value={filters.toDate}
                                        onChange={(date) => handleFilterChange('toDate', date)}
                                        size="small"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                                <FormControl fullWidth>
                                    <Dropdownlist
                                        options={CreditNoteStatusOptions}
                                        value={filters.status}
                                        label="Status"
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        size="small"
                                    />
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Search"
                                    value={filters.searchText}
                                    onChange={(e) => handleFilterChange('searchText', e.target.value)}
                                    placeholder="Search by CN No, Customer, Invoice No..."
                                />
                            </Grid>
                        </Grid>

                        {/* Table */}
                        <Scrollbar>
                            <TableContainer sx={{ overflow: 'unset' }}>
                                <Table sx={{ minWidth: 800 }}>
                                    <TableHead>
                                        <TableRow>
                                            {TABLE_HEAD.map((headCell) => (
                                                <TableCell 
                                                    key={headCell.id}
                                                    align={headCell.alignRight ? 'right' : 'left'}
                                                >
                                                    {headCell.label}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {creditNotes?.map((row) => (
                                            <TableRow key={row.CNNo} hover>
                                                <TableCell>{row.CNNo}</TableCell>
                                                <TableCell>
                                                    {new Date(row.CNDate).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="subtitle2" noWrap>
                                                        {row.Customer}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{row.InvoiceNo}</TableCell>
                                                <TableCell>{row.ReturnReason}</TableCell>
                                                <TableCell align="right">
                                                    {row.NetAmount.toFixed(2)}
                                                </TableCell>
                                                <TableCell>
                                                    <Label color={getStatusColor(row.Status)}>
                                                        {row.Status}
                                                    </Label>
                                                </TableCell>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1}>
                                                        <IconButton 
                                                            size="small" 
                                                            color="primary"
                                                            onClick={() => handleEdit(row.CnNo)}
                                                        >
                                                            <Iconify icon="eva:edit-fill" />
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small"
                                                            onClick={() => navigate(`/dashboard/credit-note-entry/${row.CnNo}`, { state: { print: true } })}
                                                        >
                                                            <Iconify icon="eva:printer-fill" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        
                                        {creditNotes.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={8} align="center">
                                                    <Box sx={{ py: 3 }}>
                                                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                            No Records Found
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            No credit notes match the current filters
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Scrollbar>

                        <TablePagination
                            page={page}
                            component="div"
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            onPageChange={handleChangePage}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Stack>
                </Card>
            </Container>
        </>
    );
}
