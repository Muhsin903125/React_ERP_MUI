import * as React from 'react';  
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker'; 

export default function DateSelector({ label ,value, onChange,disableFuture,size }) {  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        views={['year', 'month', 'day']}
        disableFuture={disableFuture}
        onChange={onChange}
        renderInput={(params) => <TextField  {...params} size={size} />}
        inputFormat="DD-MM-YYYY"
      />
    </LocalizationProvider>
  );
}