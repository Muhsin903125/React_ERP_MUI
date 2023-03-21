import {  useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import { blue } from '@mui/material/colors';
import  TextField from '@mui/material/TextField';
import { Stack,Toolbar } from '@mui/material';
import useLookupData from '../datas/useLookupData';



// const customers = [
//     { name: "Facts Computer Software House LLC", address: "Dubai" },
//     { name: "Safe Line Electrical & Mechanical LLC", address: "Abu Dhabi" },
//     { name: "Monarch Builders", address: 'Kerala \nIndia' },
//     { name: "Dream Company LLC", address: "Dubai" }
// ];

export default function CustomerDialog(props) {

  const customers = useLookupData();
  const { onClose, selectedValue, open } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value) => {
    onClose(value);
  };

  const [searchtext, setsearchtext] = useState("");
  
  const filteredCustomer = customers.filter( item =>
    Object.values(item).some(
      prop =>
        prop &&
        prop
          .toString()
          .toLowerCase()
          .includes(searchtext.toLowerCase())
    )
    // item => item.name.toLowerCase().toString().includes(searchtext.toLowerCase()) || item.address.toLowerCase().includes(searchtext.toLowerCase())
  );

  return (

    <Dialog fullWidth maxWidth={"sm"} onClose={handleClose} 
            open={open}>
      <DialogTitle>Select Customer</DialogTitle>
      <TextField style={{ marginLeft: 20 ,marginRight: 20}}
        label="Search"
        value={searchtext}
        onChange={event => setsearchtext(event.target.value)}
      /> 
      
      
      <List sx={{ pt: 0 }}>
        {filteredCustomer.map((customer) => (
          <ListItem disableGutters>
            <ListItemButton onClick={() => handleListItemClick(customer.name)} key={customer.name}>
              {/* <ListItemAvatar>
                <Avatar sx={{ bgcolor: blue[100], color: blue[600] }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar> */}
              <ListItemText 
                // primary={customer.name} 
                primary={
                  <Typography variant="subtitle1" component="span" style={{ fontWeight: 'bold' }}>
                    {`${customer.CUS_DOCNO} - ${customer.name}`}
                  </Typography>
                }
                secondary={
                  <>
                  <Stack>
                    <Typography >
                    {customer.address}
                    </Typography>
                  </Stack>
                  <Stack>
                  <Typography >
                  {`TRN ${customer.CUS_TRN}`}
                  </Typography>
                </Stack>
                </>
                  // `${customer.address} \nTRN ${customer.CUS_TRN}`
                  } />
            </ListItemButton>
          </ListItem>
        ))}

        {/* <ListItem disableGutters>
          <ListItemButton
            autoFocus
            onClick={() => handleListItemClick('Cash Customer')}
          >
            <ListItemAvatar>
              <Avatar>
                <AddIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Cash Customer" />
          </ListItemButton>
        </ListItem> */}
      </List>
    </Dialog>
  );
}
