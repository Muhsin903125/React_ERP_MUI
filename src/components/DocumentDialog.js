import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Avatar,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    DialogTitle,
    Dialog,
    Typography,
    TextField,
    Stack,
    Box,
    Paper,
    InputAdornment,
    IconButton,
    Divider,
    Chip,
    useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { GetSingleListResult } from '../hooks/Api';
import { useToast } from '../hooks/Common';
import Iconify from './iconify';

export default function DocumentDialog(props) {
    const theme = useTheme();
    const { showToast } = useToast();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { onClose, open, onSelect, account } = props;
    const [searchtext, setsearchtext] = useState("");

    useEffect(() => {
        if (account && open) {
            getDocuments();
        }
    }, [account, open]);

    const getDocuments = async () => {
        try {
            setLoading(true);
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "ALLOC_CRUD",
                "TYPE": "GET_DOC_LIST",
                "ac_code": account,
            });
            if (Success) {
                setDocuments(Data);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            console.error("Error:", error);
            showToast("Error fetching documents", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setsearchtext("");
    };

    const handleListItemClick = (value) => {
        onSelect(value);
        handleClose();
    };

    const filteredDocuments = documents.filter(item =>
        Object.values(item).some(
            prop =>
                prop &&
                prop.toString().toLowerCase().includes(searchtext.toLowerCase())
        )
    );

    const EmptyState = () => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 5,
                px: 3,
                minHeight: 300
            }}
        >
            <Iconify
                icon="solar:documents-broken"
                width={80}
                sx={{ color: theme.palette.grey[400], mb: 2, opacity: 0.8 }}
            />
            <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
                No Documents Found
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
                {searchtext ? 
                    "Try adjusting your search terms or clear the search" : 
                    "There are no documents available for this account"}
            </Typography>
            {searchtext && (
                <Button
                    startIcon={<ClearIcon />}
                    onClick={() => setsearchtext("")}
                    sx={{ mt: 2 }}
                >
                    Clear Search
                </Button>
            )}
        </Box>
    );

    return (
        <Dialog 
            fullWidth 
            maxWidth="sm" 
            onClose={handleClose}
            open={open}
            PaperProps={{
                elevation: 0,
                sx: {
                    maxHeight: '80vh',
                }
            }}
        >
            <DialogTitle 
                sx={{ 
                    position: 'sticky', 
                    top: 0, 
                    bgcolor: 'background.paper', 
                    zIndex: 1,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                        Select Document
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Search by document code, date, or amount..."
                        value={searchtext}
                        onChange={(e) => setsearchtext(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: searchtext && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setsearchtext("")}>
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                    />
                </Stack>
            </DialogTitle>

            <Divider />

            {loading ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Loading documents...</Typography>
                </Box>
            ) : filteredDocuments.length === 0 ? (
                <EmptyState />
            ) : (
                <List sx={{ pt: 0, pb: 1 }}>
                    {filteredDocuments.map((document) => (
                        <ListItem 
                            disableGutters 
                            key={document.DM_CODE}
                            sx={{
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: theme.palette.action.hover,
                                }
                            }}
                        >
                            <ListItemButton 
                                onClick={() => handleListItemClick(document)}
                                sx={{ 
                                    display: 'flex',
                                    alignItems: 'center',
                                    py: 1.5,
                                    px: 2
                                }}
                            >
                                <Avatar 
                                    variant="rounded"
                                    sx={{ 
                                        bgcolor: theme.palette.primary.lighter,
                                        color: theme.palette.primary.main,
                                        width: 48,
                                        height: 48,
                                        mr: 2
                                    }}
                                >
                                    <DescriptionOutlinedIcon />
                                </Avatar>

                                <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography 
                                            variant="subtitle1" 
                                            sx={{ 
                                                fontWeight: 600,
                                                color: theme.palette.text.primary,
                                                lineHeight: 1.2
                                            }}
                                        >
                                            {document.fromDocCode}
                                        </Typography>
                                        <Chip 
                                            label={`#${document.fromDocSrNo}`}
                                            size="small"
                                            sx={{ 
                                                bgcolor: theme.palette.primary.lighter,
                                                color: theme.palette.primary.main,
                                                fontWeight: 500
                                            }}
                                        />
                                    </Stack>

                                    <Stack 
                                        direction="row" 
                                        alignItems="center"
                                        spacing={2}
                                        sx={{ mt: 0.5 }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <CalendarMonthIcon 
                                                fontSize="small" 
                                                sx={{ color: theme.palette.text.disabled, fontSize: '1rem' }}
                                            />
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(document.fromDocDate).toLocaleDateString()}
                                            </Typography>
                                        </Stack>
                                        {document?.fromDocAmount > 0 && (
                                            <Typography variant="caption" color="text.secondary">
                                                Amount: {document.fromDocAmount?.toFixed(3)}
                                            </Typography>
                                        )}
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                color: document?.fromDocBalAmount > 0 ? 
                                                    theme.palette.success.main : 
                                                    theme.palette.warning.main,
                                                fontWeight: 500
                                            }}
                                        >
                                            {document?.fromDocBalAmount > 0 
                                                ? `Balance: ${document.fromDocBalAmount?.toFixed(3)}` 
                                                : 'No Balance'}
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Iconify 
                                    icon="eva:arrow-ios-forward-fill"
                                    width={24}
                                    sx={{ color: theme.palette.text.disabled }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            )}
        </Dialog>
    );
}

DocumentDialog.propTypes = {
    onClose: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    account: PropTypes.string,
};
