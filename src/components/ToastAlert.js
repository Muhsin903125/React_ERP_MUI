 
 
import { useState } from 'react';

import * as React from 'react';
import Stack from '@mui/material/Stack'; 
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ToastAlert({type,message}) {
    const [vertical, setv] = useState("bottom");
    const [horizontal, seth] = useState("right");
    const [open, setOpen] = useState(true);

    const handleClose = (event, reason) => {
        // if (reason === 'clickaway') {
        //   return;
        // }
    
        setOpen(false);
      };
    
    
    return (
        <Stack>

            <Snackbar
                anchorOrigin={{ vertical, horizontal }}
                open={open}
                autoHideDuration={1000} 
                onClose={handleClose}
            >
                <Alert
                    onClose={handleClose}
                    severity={type}
                    sx={{ width: '100%' }}>
                    {message}
                </Alert>
            </Snackbar>

        </Stack>
    );
} 