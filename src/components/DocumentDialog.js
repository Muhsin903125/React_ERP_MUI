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

export default function DocumentDialog(props) {
  const { showToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const { onClose, open, onSelect, account } = props;
  useEffect(() => {
    if (account) {

      getDocuments(); // Fetch documents when the component mounts
    }
  }, [account]);

  const getDocuments = async () => {
    try {
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
      console.error("Error:", error); // More informative error handling
    }
  };
  // const customers = useLookupData("CUS");


  const handleClose = () => {
    onClose();
  };

  const handleListItemClick = (value) => {
    onSelect(value);
  };

  const [searchtext, setsearchtext] = useState("");

  const filteredDocuments = documents.filter(item =>
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
          Select Document
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
        {filteredDocuments.map((document) => (
          <ListItem disableGutters key={document.DM_CODE}>
            <ListItemButton onClick={() => handleListItemClick(document)}>
              <ListItemText
                primary={
                  <Typography ml={1} variant="subtitle1" component="span" style={{ fontWeight: 'bold' }}>
                    {`${document.fromDocCode}  `}
                  </Typography>
                }
                secondary={
                  <>
                    <Stack>
                      <Typography ml={1}>
                        Sr No: {document.fromDocSrNo}
                      </Typography>
                      <Typography ml={1}>
                        Date: {document.fromDocDate}
                      </Typography>
                      {document?.fromDocAmount > 0 &&
                        <Typography ml={1}>
                          Amount: {document.fromDocAmount?.toFixed(2)}
                        </Typography>
                      }
                      <Typography ml={1}>
                        {document?.fromDocBalAmount > 0 ? `Balance Amount: ${document.fromDocBalAmount?.toFixed(2)}` : 'No Pending Balance'}
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
