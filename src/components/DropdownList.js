import React from 'react';
import PropTypes from 'prop-types';
import { InputLabel, MenuItem, Select } from '@mui/material';

const Dropdownlist = ({ name, label, options, value, onChange, disable = false }) => {
    return (
        <>         
         <InputLabel id="demo-simple-select-label">{label}</InputLabel >
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                name={name}
                value={value}
                label={label}
                onChange={onChange}
                size="small"
                disabled={disable}
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
