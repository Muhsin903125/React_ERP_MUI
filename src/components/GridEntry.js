import React, { useContext, useState, useEffect } from 'react';
import MaterialReactTable from 'material-react-table';
import { Box, Button, IconButton, Tooltip,Select,MenuItem,InputLabel,FormControl } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Delete, Edit } from '@mui/icons-material';
import { useToast } from '../hooks/Common';
import { deleteRole, saveRole, UpdateRole, PostMultiSp, PostCommonSp } from '../hooks/Api';

const columns = [
  // {
  //   header: 'Delete',
  //   Cell: ({ row }) => (
  //     <div>
  //       {/* <Tooltip title="Edit">
  //         <IconButton onClick={() => handleEdit(row.original.IM_CODE)}>
  //           <EditIcon />
  //         </IconButton>
  //       </Tooltip> */}
  //       <Tooltip title="Delete">
  //         <IconButton onClick={() => console.log("delete clicked")}>
  //           <DeleteIcon />
  //         </IconButton>
  //       </Tooltip>
  //     </div>
  //   ),
  //   size: 0,
  //   enableEditing: false,
  // },
    {
        accessorKey: 'baseQty',
        header: 'Base Qty',
      },
      {
        accessorKey: 'baseUnit',
        header: 'Base Unit',
        enableEditing: false,
      },

      {
        accessorKey: 'toQty',
        header: 'To Qty',
      },
      {
        accessorKey: 'toUnit',
        header: 'To Unit',
      },
]

// const data = [
//     {
//         baseQty: 1,
//         baseUnit: 'KG',
//         toQty: 1000,
//         toUnit: 'TON',
//       },
// ]
export default function GridEntry(props) {

    const { showToast } = useToast();

    const [tableData, setTableData] = useState(() =>  props.data);

    console.log(tableData)

    // for edit Save
  const handleSaveRowEdits = async ({ exitEditingMode, row, values }) => {
    // if (!Object.keys(validationErrors).length) {
        tableData[row.index] = values;
      // send/receive api updates here, then refetch or update local table data for re-render
      const response = await PostCommonSp({
        "key": "string",
        "userId": "string",
        "json": JSON.stringify({
          "json": values,
          "key": props.key
        }),
        "controller": "string"
      })
      if (response.Success) {
        setTableData([...tableData]);
        exitEditingMode(); // required to exit editing mode and close modal
      }
      else {
        setTableData([...tableData]);
        showToast(response.Message, "error");
      }
    // }
  };

    return (
        <MaterialReactTable
          columns={columns}  //  {props.columns}
          data={tableData} //  {props.data}
          // editingMode="row"
          enableEditing
          enableRowActions
          onEditingRowSave={handleSaveRowEdits}
          renderRowActions={({ row, table }) => (
            <Box sx={{ display: 'flex', gap: '1rem' }}>
              <Tooltip arrow placement="left" title="Edit">
                <IconButton onClick={() => table.setEditingRow(row)}>
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip arrow placement="right" title="Delete">
                <IconButton color="error" onClick={() => console.log(row)}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        />
      );  

}
