import * as React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText,Slide, DialogTitle } from '@mui/material';

const Transition = React.forwardRef((props, ref) => {
    return <Slide direction="up" ref={ref} {...props} />;
});

const AlertDialog = ({ Message, OnSuccess }) => {
    const [open, setOpen] = React.useState(true);

    const handleClose = () => {
        setOpen(false);
          OnSuccess(false);
    };
    const handleSuccess = () => {
        setOpen(false);
        OnSuccess(false);
    };
    return (
        <div>
            <Dialog
                open={open}
                TransitionComponent={Transition}
                keepMounted
                onClose={handleClose}
                aria-describedby="alert-dialog-slide-description"
            >
                <DialogTitle>{"Confirm"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-slide-description">
                        {Message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Disagree</Button>
                    <Button onClick={handleSuccess}>Agree</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default AlertDialog;
