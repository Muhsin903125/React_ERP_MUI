import { Box, Grid, Typography, useTheme } from '@mui/material'; 
import PropTypes from 'prop-types';

PendingBillsTable.propTypes = {
    detailData: PropTypes.arrayOf(
        PropTypes.shape({
            doc_code: PropTypes.string,
            doc_date: PropTypes.string,
            doc_bal_amount: PropTypes.number,
            allocatedAmount: PropTypes.number,
            amount_type: PropTypes.number
        })
    ).isRequired
};

export default function PendingBillsTable({ detailData }) {
    const theme = useTheme();
    const calculateBalance = (balAmount, allocAmount) => {
        const balance = Number(balAmount) - Number(allocAmount);
        return balance.toFixed(2);
    }
    return (
        <Box sx={{ 
            border: `1px solid ${theme.palette.primary.lighter}`,
            borderRadius: 1,
            overflow: 'hidden',
            mb: 2
        }}>
            <Grid container sx={{ 
                bgcolor: theme.palette.primary.lighter,
                borderBottom: `1px solid ${theme.palette.primary.lighter}`,
                py: 1.5
            }}>
                <Grid item xs={2} md={1}>
                    <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Code</Typography>
                </Grid>
                <Grid item xs={2} md={2}>
                    <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Date</Typography>
                </Grid>
                <Grid item xs={2} md={2}>
                    <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Doc Bal Amount</Typography>
                </Grid>
                <Grid item xs={2} md={2}>
                    <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Allocated Amount</Typography>
                </Grid>
                <Grid item xs={2} md={2}>
                    <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Balance</Typography>
                </Grid>
                <Grid item xs={2} md={1}>
                    <Typography variant="subtitle2" sx={{ px: 2, fontWeight: 600 }}>Amount Type</Typography>
                </Grid>
                
            </Grid>
            {detailData.map((field, index) => (
                <Grid 
                    container 
                    key={index}
                    sx={{   
                        borderBottom: `1px solid ${theme.palette.primary.lighter}`,
                        // '&:hover': {
                        //     bgcolor: theme.palette.primary.light
                        // },
                        transition: 'background-color 0.2s'
                    }}
                >
                    <Grid item xs={2} md={1}>
                        <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{field.doc_code}</Typography>
                    </Grid>
                    <Grid item xs={2} md={2}>
                        <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{field.doc_date}</Typography>
                    </Grid>
                    <Grid item xs={2} md={2}>
                        <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{Number(field.doc_bal_amount).toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={2} md={2}>
                        <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{Number(field.alloc_amount).toFixed(2)}</Typography>
                    </Grid>
                    <Grid item xs={2} md={2}>
                        <Typography variant="body2" sx={{ px: 2, py: 1.5 }}>{calculateBalance(field.doc_bal_amount, field.alloc_amount)}</Typography>
                    </Grid>
                    <Grid item xs={2} md={1}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                px: 2, 
                                py: 1.5,
                                color: field.amount_type === -1 ? 'success.main' : 'error.main',
                                fontWeight: 500
                            }}
                        >
                            {field.amount_type === -1 ? 'Credit' : 'Debit'}
                        </Typography>
                    </Grid>
                    
                </Grid>
            ))}
            {detailData.length === 0 && (
                <Box sx={{ 
                    py: 3, 
                    textAlign: 'center',
                    bgcolor: 'background.paper'
                }}>
                    <Typography variant="body1" color="text.secondary">
                        No Allocated Bills
                    </Typography>
                </Box>
            )}
        </Box>
    );
}