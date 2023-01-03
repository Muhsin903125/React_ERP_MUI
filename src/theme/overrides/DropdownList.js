import React from 'react';
import PropTypes from 'prop-types';
import { InputLabel, MenuItem, Select, TextField } from '@mui/material';

const Dropdownlist = ({ label, options, value, onChange }) => {
    return (
        <>

            <InputLabel id="demo-simple-select-label">{label}</InputLabel >
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={value}
                label={label}
                onChange={onChange}
            >
                {/* <MenuItem value="">
            <em>None</em>
          </MenuItem> */}
                {options.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
            {/* <FormHelperText>Error</FormHelperText> */}

        </>


    );
};

Dropdownlist.propTypes = {
    label: PropTypes.string,
    options: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ).isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default Dropdownlist;
