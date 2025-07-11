import React, { useState } from 'react';
import MaterialReactTable from 'material-react-table';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack,
  Menu,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2pdf from 'html2pdf.js';
import PrintComponent from './PrintComponent';
import PrintDialog from './PrintDialog';

// https://www.material-react-table.com/docs/examples

export default function DataTable({
  columns,
  data,
  enablePagination = true,
  enableSorting = true,
  enableExport = true,
  enablePageExport = true,
  enableColumnHiding = true,
  fileTitle = "Data",
  PrintPreviewComponent, // NEW: custom print preview component
  printPreviewProps = {}, // NEW: extra props for print preview
}, props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printRows, setPrintRows] = useState([]);
  const printRef = React.useRef();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleExportRows = async (rows) => {
    try {
      setIsExporting(true);
      const columnsToExport = columns.filter((column) => column.excelColumnDisable !== true);

      const worksheet = XLSX.utils.json_to_sheet(
        rows.map((row) => {
          return columnsToExport.reduce((obj, column) => {
            obj[column.accessorKey] = row.original[column.accessorKey];
            return obj;
          }, {});
        })
      );

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      XLSX.writeFile(workbook, `${fileTitle}.xlsx`);
    } catch (err) {
      setError('Failed to export Excel file. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };
  const handleExportPdf = async (rows) => {
    setPrintRows(rows);
    setPrintPreviewOpen(true);
  };

  const handlePrintDialogClose = () => {
    setPrintPreviewOpen(false);
    setPrintRows([]);
  };


  const handleCloseError = () => {
    setError(null);
  };

  const renderExportActions = ({ table }) => {
    if (!enableExport) return null;

    if (isMobile) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={handleMenuClick}
            disabled={isExporting}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              disabled={table.getPrePaginationRowModel().rows.length === 0 || isExporting}
              onClick={() => {
                handleExportRows(table.getPrePaginationRowModel().rows);
                handleMenuClose();
              }}
            >
              {isExporting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Export All to Excel
            </MenuItem>
            {enablePageExport && <MenuItem
              disabled={table.getRowModel().rows.length === 0 || isExporting}
              onClick={() => {
                handleExportRows(table.getRowModel().rows);
                handleMenuClose();
              }}
            >
              {isExporting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Export Page to Excel
            </MenuItem>}
            <MenuItem
              disabled={table.getPrePaginationRowModel().rows.length === 0 || isExporting}
              onClick={() => {
                handleExportPdf(table.getPrePaginationRowModel().rows);
                handleMenuClose();
              }}
            >
              {isExporting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Export All to PDF
            </MenuItem>
            {enablePageExport && <MenuItem
              disabled={table.getRowModel().rows.length === 0 || isExporting}
              onClick={() => {
                handleExportPdf(table.getRowModel().rows);
                handleMenuClose();
              }}
            >
              {isExporting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Export Page to PDF
            </MenuItem>}
          </Menu>
        </Box>
      );
    }

    return (
      <Stack
        direction="row"
        spacing={1}
        sx={{
          p: '0.5rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0 || isExporting}
          onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}
          startIcon={isExporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          variant="outlined"
          size="small"
        >
          Export All to Excel
        </Button>
        {enablePageExport && <Button
          disabled={table.getRowModel().rows.length === 0 || isExporting}
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={isExporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          variant="outlined"
          size="small"
        >
          Export Page to Excel
        </Button>}
        <Button
          disabled={table.getPrePaginationRowModel().rows.length === 0 || isExporting}
          onClick={() => handleExportPdf(table.getPrePaginationRowModel().rows)}
          startIcon={isExporting ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
          variant="outlined"
          size="small"
          color="error"
        >
          Export All to PDF
        </Button>
        {enablePageExport && <Button
          disabled={table.getRowModel().rows.length === 0 || isExporting}
          onClick={() => handleExportPdf(table.getRowModel().rows)}
          startIcon={isExporting ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
          variant="outlined"
          size="small"
          color="error"
        >
          Export Page to PDF
        </Button>}
      </Stack>
    );
  };

  return (
    <>      <MaterialReactTable
        columns={columns}
        data={data}
        initialState={{
          density: 'compact',
          expanded: true,
          columnVisibility: columns.reduce((acc, column) => {
            // Hide columns by default if they have hideByDefault: true
            if (column.hideByDefault) {
              acc[column.accessorKey] = false;
            }
            return acc;
          }, {})
        }}
        muiTablePaperProps={{
          sx: {
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
        muiTableProps={{
          sx: {
            tableLayout: 'auto'
          }
        }}
        enableColumnResizing
        columnResizeMode="onChange"
        positionToolbarAlertBanner="bottom"
        renderTopToolbarCustomActions={renderExportActions}
        enablePagination={enablePagination}
        enableSorting={enableSorting}
        enableHiding={enableColumnHiding}
        muiTableBodyCellProps={{
          sx: {
            wordBreak: 'break-word',
          },
      }}
      displayColumnDefOptions={{
        'mrt-row-expand': {
          size: 40,
          minSize: 40,
          maxSize: 40,
        },
      }}
      {...props}
    />
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={handleCloseError}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      <PrintDialog
        open={printPreviewOpen}
        onClose={handlePrintDialogClose}
        title={' Print Preview'}
        printRef={printRef}
        documentTitle={fileTitle}
        showDownload
        maxWidth="lg"
        fullWidth
      >
        <div ref={printRef} style={{ width: '100%' }}>
          {PrintPreviewComponent ? (
            <PrintPreviewComponent
              columns={columns.filter((column) => column.excelColumnDisable !== true)}
              rows={printRows.map(row => row.original)}
              title={fileTitle}
              {...printPreviewProps}
            />
          ) : (
            <PrintComponent
              columns={columns.filter((column) => column.excelColumnDisable !== true)}
              rows={printRows.map(row => row.original)}
              title={fileTitle}
            />
          )}
        </div>
      </PrintDialog>
    </>
  );
}
