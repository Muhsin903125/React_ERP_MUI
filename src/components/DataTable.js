import React from 'react'
import MaterialReactTable from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { ExportToCsv } from 'export-to-csv';
 
import RefreshIcon from '@mui/icons-material/Refresh';

// https://www.material-react-table.com/docs/examples

export default function DataTable({
  columns,
  data,
  enableExport=false,
},props) {

   const csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    useKeysAsHeaders: false,
    headers: columns.map((c) => c.header),
  };  
  const csvExporter = new ExportToCsv(csvOptions);

    const handleExportRows = (rows) => {
        csvExporter.generateCsv(rows.map((row) => row.original));
      };
    
      const handleExportData = () => {
        csvExporter.generateCsv(data);
      };

  return (
    <MaterialReactTable columns={columns} data={data}
    {...props}
    //  enableRowSelection={enableRowSelection}

    // renderTopToolbarCustomActions={() => (
    //   <Tooltip arrow title="Refresh Data">
    //     <IconButton onClick={() => refetch()}>
    //       <RefreshIcon />
    //     </IconButton>
    //   </Tooltip>
    // )}

      positionToolbarAlertBanner="bottom"
      renderTopToolbarCustomActions={({ table }) =>enableExport && (
        <Box
          sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}
        >
          <Button
            color="primary"
            //  export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
            onClick={handleExportData}
            startIcon={<FileDownloadIcon />}
            variant="contained"
          >
            Export All Data
          </Button>
          <Button
            disabled={table.getPrePaginationRowModel().rows.length === 0}
            //  export all rows, including from the next page, (still respects filtering and sorting)
            onClick={() =>
              handleExportRows(table.getPrePaginationRowModel().rows)
            }
            startIcon={<FileDownloadIcon />}
            variant="contained"
          >
            Export All Rows
          </Button>
          <Button
            disabled={table.getRowModel().rows.length === 0}
            //  export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
            onClick={() => handleExportRows(table.getRowModel().rows)}
            startIcon={<FileDownloadIcon />}
            variant="contained"
          >
            Export Page Rows
          </Button>
          <Button
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
            //  only export selected rows
            onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
            startIcon={<FileDownloadIcon />}
            variant="contained"
          >
            Export Selected Rows
          </Button>
        </Box>
      )}

      
    />
  )
}
