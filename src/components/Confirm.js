
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material'; 
import { createConfirmation,confirmable } from 'react-confirm';
import { styled  } from '@mui/material/styles';
import { LoadingButton } from '@mui/lab';
import palette from '../theme/palette'; 

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

  const PrimaryLoadingButton = styled(LoadingButton)(() => ({
    color: palette.primary.contrastText,
    backgroundColor: palette.primary.main,
    '&:hover': {
      backgroundColor:  palette.primary.dark,
    },
  }));
  
  const SecondaryButton = styled(Button)(() => ({
    color: palette.secondary.darker,
    borderColor: palette.secondary.main,
    '&:hover': {
      backgroundColor: palette.secondary.contrastText,
      color: palette.secondary.darker,
    },
  }));
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
      <PrimaryLoadingButton onClick={proceed} variant="contained" sx={{ minWidth: "80px", paddingLeft: "10px", paddingRight: "10px"}} autoFocus>
          {okLabel}
        </PrimaryLoadingButton>
        <SecondaryButton onClick={cancel} variant="outlined" sx={{ minWidth: "80px", paddingLeft: "10px", paddingRight: "10px"}} >
          {cancelLabel}
        </SecondaryButton>
      </DialogActions>
    </Dialog>
  );
}
 

const Confirm = createConfirmation(confirmable(Confirmation));

export default function(confirmation, options = {}) { 
  return Confirm({ confirmation, ...options });
}