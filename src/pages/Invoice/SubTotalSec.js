
import {
    Card,
    Table,
    Stack,
    Paper,
    Avatar,
    Button,
    Popover,
    Checkbox,
    TableRow,
    MenuItem,
    TableBody,
    TableCell,
    Container,
    Typography,
    IconButton,
    TableContainer,
    TablePagination, Grid,
    TextField,
    FormControl,
    ListItemSecondaryAction,
    ListItem,
    List,
    Divider,
    Input,
} from '@mui/material';

export default function SubTotalSec({addItem}) {
    return (<>
        <Grid container spacing={3.5} direction="row">
            <Grid item xs={12} md={4}>
                <Button   onClick={addItem}>Add Item</Button>
            </Grid>

            <Grid item container md={8} spacing={3.5} justifyContent="flex-end">
                <Grid item xs={6} md={4} >
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ min: "0" }}
                        size="small"
                        label="Discount"
                        name="Discount"
                    />
                </Grid>
                <Grid item xs={6} md={4}>
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ min: "0" }}
                        size="small"
                        label="Tax"
                        name="Tax"
                    />
                </Grid>
           
          
            <Grid container md={6} spacing={1} mt={1} align='right' justifyContent="flex-end"  >
                <Grid item md={8}>
                    <Typography variant="subtitle2"  >
                        Gross Amount:
                    </Typography>
                </Grid>
                <Grid item md={4}>
                    <Typography variant="subtitle2"   >
                    $ 1.36
                    </Typography>
                </Grid>
                <Grid item md={8}>
                    <Typography variant="subtitle2" >
                        Discount:
                    </Typography>
                </Grid>
                <Grid item md={4}>
                    <Typography variant="subtitle2"   >
                        $ 1.36
                    </Typography>
                </Grid>
                <Grid item md={8}>
                    <Typography variant="subtitle2"  >
                        Tax:
                    </Typography>
                </Grid>
                <Grid item md={4}>
                    <Typography variant="subtitle2"  >
                        $ 1.36
                    </Typography>
                </Grid>
                <Grid item md={8}>
                    <Typography variant="h6"  >
                        Total Price:
                    </Typography>
                </Grid>
                <Grid item md={4}>
                    <Typography variant="h6"  >
                        $ 143.36
                    </Typography>
                </Grid>


            </Grid> 
            </Grid> 
            </Grid> 
         </>
    );
} 