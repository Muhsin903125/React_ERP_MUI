import { useEffect, useState } from 'react';
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
import TextField from '@mui/material/TextField';
import { Stack, Toolbar } from '@mui/material'; 
import { GetSingleListResult, PostMultiSp } from '../hooks/Api';
import { useToast } from '../hooks/Common';

export default function SupplierDialog(props) {
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  useEffect(() => {
    getSuppliers(); // Fetch customers when the component mounts
  }, []);

  const getSuppliers = async () => {
    try {
      const { Success, Data, Message } = await GetSingleListResult({
        "key": "SUP_CRUD",
        "TYPE": "GET_ALL",
      });
      if (Success) {
        setSuppliers(Data);
      } else {
        showToast(Message, "error");
      }
    } catch (error) {
      console.error("Error:", error); // More informative error handling
    }
  };
  // const customers = useLookupData("CUS");
  const { onClose, open, onSelect } = props;

  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (value) => {
    onSelect(value);
  };

  const [searchtext, setsearchtext] = useState("");

  const filteredSupplier = suppliers.filter(item =>
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

    <Dialog fullWidth maxWidth={"sm"} m={15} onClose={handleClose}
      open={open}>
      <div style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: '1', boxShadow: '#dbdbdb4f -1px 9px 20px 0px' }}>    <DialogTitle elevation={2}  >
        <Typography variant="h5" style={{ fontWeight: 'bold' }} mb={2}>
          Select Customer
        </Typography>
        <TextField
          fullWidth
          label="Search"
          value={searchtext}
          onChange={event => setsearchtext(event.target.value)}
        />
      </DialogTitle>

      </div>
      <List sx={{ pt: 0 }} >
        {filteredSupplier.map((supplier) => (
          <ListItem disableGutters key={supplier.SUP_DOCNO}>
            <ListItemButton onClick={() => handleListItemClick(supplier)}>
              <ListItemText
                primary={
                  <Typography ml={1} variant="subtitle1" component="span" style={{ fontWeight: 'bold' }}>
                    {`${supplier.SUP_DOCNO} - ${supplier.SUP_DESC}`}
                  </Typography>
                }
                secondary={
                  <>
                    <Stack>
                      <Typography ml={1}>
                        {supplier.SUP_ADDRESS}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography ml={1}>
                        {`TRN ${supplier.SUP_TRN}`}
                      </Typography>
                    </Stack>
                  </>
                } />
            </ListItemButton>
          </ListItem>
        ))}

      </List>
    </Dialog>
  );
}
