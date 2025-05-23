import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    List,
    ListItem,
    ListItemText,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { GetSingleListResult } from '../../../../hooks/Api';
import Iconify from '../../../../components/iconify';

export default function PayerDialog({ open, onClose, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [payers, setPayers] = useState([]);
    const [filteredPayers, setFilteredPayers] = useState([]);

    useEffect(() => {
        if (open) {
            fetchPayers();
        }
    }, [open]);

    useEffect(() => {
        setFilteredPayers(
            payers.filter(
                (payer) =>
                    payer.PAYER_CODE.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    payer.PAYER_NAME.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [searchTerm, payers]);

    const fetchPayers = async () => {
        try {
            const { Success, Data } = await GetSingleListResult({
                "key": "PAYER_CRUD",
                "TYPE": "GET_ALL"
            });
            if (Success) {
                setPayers(Data);
                setFilteredPayers(Data);
            }
        } catch (error) {
            console.error('Error fetching payers:', error);
        }
    };

    const handleSelect = (payer) => {
        onSelect({
            PAYER_CODE: payer.PAYER_CODE,
            PAYER_NAME: payer.PAYER_NAME,
            PAYER_ADDRESS: payer.PAYER_ADDRESS,
            PAYER_TRN: payer.PAYER_TRN,
            PAYER_MOB: payer.PAYER_MOB,
            PAYER_EMAIL: payer.PAYER_EMAIL
        });
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Select Payer</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Search Payer"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton edge="start">
                                    <Iconify icon="eva:search-fill" />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <List sx={{ pt: 1 }}>
                    {filteredPayers.map((payer) => (
                        <ListItem
                            button
                            onClick={() => handleSelect(payer)}
                            key={payer.PAYER_CODE}
                        >
                            <ListItemText
                                primary={payer.PAYER_NAME}
                                secondary={`${payer.PAYER_CODE} | ${payer.PAYER_TRN || 'No TRN'}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    );
} 