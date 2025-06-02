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
  Alert
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// https://www.material-react-table.com/docs/examples

export default function DataTable({
  columns,
  data,
  enableExport = true,
  fileTitle = "Data"
}, props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

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
    try {      setIsExporting(true);
      const JsPDF = jsPDF;  // Create properly cased constructor alias
      const doc = new JsPDF();
      const columnsToExport = columns.filter((column) => column.excelColumnDisable !== true);
      
      const tableData = rows.map((row) => 
        columnsToExport.map((column) => row.original[column.accessorKey])
      );

      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      
      // Add title to PDF
      doc.setFontSize(15);
      doc.text(fileTitle, margin, margin);

      doc.autoTable({
        head: [columnsToExport.map((column) => column.header)],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: theme.palette.primary.main,
          textColor: theme.palette.primary.contrastText,
          fontSize: 10,
          fontStyle: 'bold',
          cellPadding: 3,
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: 2,
        },
        alternateRowStyles: {
          fillColor: theme.palette.action.hover,
        },
        margin: { top: margin + 10 },
        columnStyles: columnsToExport.reduce((styles, _, index) => {
          styles[index] = { cellWidth: 'auto' };
          return styles;
        }, {}),
        didDrawPage: (data) => {
          // Add page numbers
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${data.pageCount}`,
            data.settings.margin.left,
            pageHeight - 10
          );
        },
      });
      
      doc.save(`${fileTitle}.pdf`);
    } catch (err) {
      setError('Failed to export PDF file. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
            <MenuItem
              disabled={table.getRowModel().rows.length === 0 || isExporting}
              onClick={() => {
                handleExportRows(table.getRowModel().rows);
                handleMenuClose();
              }}
            >
              {isExporting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Export Page to Excel
            </MenuItem>
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
            <MenuItem
              disabled={table.getRowModel().rows.length === 0 || isExporting}
              onClick={() => {
                handleExportPdf(table.getRowModel().rows);
                handleMenuClose();
              }}
            >
              {isExporting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
              Export Page to PDF
            </MenuItem>
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
        <Button
          disabled={table.getRowModel().rows.length === 0 || isExporting}
          onClick={() => handleExportRows(table.getRowModel().rows)}
          startIcon={isExporting ? <CircularProgress size={20} /> : <FileDownloadIcon />}
          variant="outlined"
          size="small"
        >
          Export Page to Excel
        </Button>
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
        <Button
          disabled={table.getRowModel().rows.length === 0 || isExporting}
          onClick={() => handleExportPdf(table.getRowModel().rows)}
          startIcon={isExporting ? <CircularProgress size={20} /> : <PictureAsPdfIcon />}
          variant="outlined"
          size="small"
          color="error"
        >
          Export Page to PDF
        </Button>
      </Stack>
    );
  };

  return (
    <>
      <MaterialReactTable 
        columns={columns} 
        data={data}
        initialState={{
          density: 'compact',
          expanded: true,
          pagination: { pageSize: 10, pageIndex: 0 }
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
        enablePagination
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
    </>
  );
}
