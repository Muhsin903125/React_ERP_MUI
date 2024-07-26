import * as React from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

export default function DateSelector({ label, value, onChange, disableFuture = true, size, required = false }) {
const handleChange = (newValue) => {
  if (newValue) {
    // Ensure the date is set correctly without timezone issues
    const correctedDate = dayjs(newValue).startOf('day'); // Set to midnight
    onChange(correctedDate.format("YYYY-MM-DD")); // Convert to JavaScript Date object
    console.log("corrected date:", correctedDate.format("YYYY-MM-DD")); // Log the formatted date
  } else {
    onChange(null);
  }
};


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        views={['year', 'month', 'day']}
        disableFuture={disableFuture}
        onChange={(val) => handleChange(val)}
        renderInput={(params) => (
          <TextField fullWidth required={required} {...params} size={size} />
        )}
        inputFormat="DD-MM-YYYY"
      />
    </LocalizationProvider>
  );
}
