import { Backdrop, CircularProgress } from "@mui/material";


export default function Loader() {
    return (
       
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={!false}
            // onClick={handleClose}
        >
            <CircularProgress color="inherit" />
        </Backdrop>
    )
}
