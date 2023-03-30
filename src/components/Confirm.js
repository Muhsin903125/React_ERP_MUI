
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { createConfirmation,confirmable } from 'react-confirm';

const Confirmation = ({
  okLabel = 'OK',
  cancelLabel = 'Cancel',
  title = 'Confirmation',
  confirmation,
  show,
  proceed,
  dismiss,
  cancel,
  modal,
}) => {
  return (
    <Dialog modal={modal}
      open={show}
      onClose={dismiss}
      style={{ padding: "20px", borderRadius: "15px" }}   >
      <DialogTitle mt={1} fontWeight={600} >{title}</DialogTitle>
      <DialogContent  >
        <DialogContentText style={{ minWidth: "420px", fontSize: "15px",  }}   >  {confirmation} </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ marginRight: "8px", marginBottom: "8px" }} >
        <Button onClick={proceed} variant="contained" sx={{ minWidth: "80px", paddingLeft: "10px", paddingRight: "10px" }} color="primary" autoFocus>
          {okLabel}
        </Button>
        <Button onClick={cancel} variant="outlined" sx={{ minWidth: "80px", paddingLeft: "10px", paddingRight: "10px" }} color="primary"  >
          {cancelLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
 

const Confirm = createConfirmation(confirmable(Confirmation));

export default function(confirmation, options = {}) {
  return Confirm({ confirmation, ...options });
}