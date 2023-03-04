
import {
    Button,
    Typography,
    Grid,
    TextField,
} from '@mui/material';
import {  useState  } from 'react';


export default function SubTotalSec({addItem,calculateTotal}) {

  const [discount, setDiscount] = useState(0);

  const handleDiscountChange = event => {
    setDiscount(event.target.value);
  };

  const [tax, setTax] = useState(0);

  const handleTaxChange = event => {
    setTax(event.target.value);
  };

  function FormattedNumber(value) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value)
}



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
                        inputProps={{ min: "0"}}
                        size="small"
                        label="Discount"
                        name="Discount"
                        value={discount}
                        onChange={handleDiscountChange}
                    />
                </Grid>
                <Grid item xs={6} md={4}>
                    <TextField
                        fullWidth
                        type="number"
                        inputProps={{ min: "0" }}
                        size="small"
                        label="Tax %"
                        name="Tax"
                        value={tax}
                        onChange={handleTaxChange}
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
                    {FormattedNumber(calculateTotal)}
                    </Typography>
                </Grid>
                <Grid item md={8}>
                    <Typography variant="subtitle2" >
                        Discount:
                    </Typography>
                </Grid>
                <Grid item md={4}>
                    <Typography variant="subtitle2" style={ {color:"#FF5630"}}  >
                        {FormattedNumber(discount * -1)}
                    </Typography>
                </Grid>
                <Grid item md={8}>
                    <Typography variant="subtitle2"  >
                        Tax:
                    </Typography>
                </Grid>
                <Grid item md={4}>
                    <Typography variant="subtitle2"  >
                    {FormattedNumber((calculateTotal - discount) * tax/100.00)}
                    </Typography>
                </Grid>
                <Grid item md={8}>
                    <Typography variant="h6"  >
                        Total Price:
                    </Typography>
                </Grid>
                <Grid item md={4}>
                    <Typography variant="h6"  >
                    {FormattedNumber((calculateTotal - discount) *(1+ tax/100.00))}
                    </Typography>
                </Grid>


            </Grid> 
            </Grid> 
            </Grid> 
         </>
    );
} 