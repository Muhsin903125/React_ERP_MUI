import { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, Typography, Card, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useToast } from '../../hooks/Common';
// components 
import CountDownTimer from '../../components/CountDownTimer';
import Iconify from '../../components/iconify'; 
import { AuthContext } from '../../App';
import { PostResetPassword } from '../../hooks/Api';

 
export default function ResetPassword() {
    
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { setLoadingFull } = useContext(AuthContext)
    const [OTPKey] = useState(location.state.OTPKey);
    const [username] = useState(location.state.username);
    const [password, setpassword] = useState('');
    const [confirmPassword, setconfirmPassword] = useState('');

    const [errMsg, setErrMsg] = useState('');


    const passwordRef = useRef();
    const confirmpPasswordRef = useRef();
    const errRef = useRef();

    const redirectPath = location.state?.path || '/login'
    useEffect(() => {
        passwordRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [confirmpPasswordRef, passwordRef])


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (password === null || password === "") {
                showToast("Password is Required", 'warning');
                setErrMsg("Password is Required");
                passwordRef.current.focus();
            }
            else if (password.length < 6) {
                showToast("Password should have 6 characters", 'warning');
                setErrMsg("Password should have 6 characters");
                passwordRef.current.focus();
            } else if (password !== confirmPassword) {
                showToast("Passwords don't match", 'warning');
                setErrMsg("Passwords don't match");
                confirmpPasswordRef.current.focus();
            }
            else {
                setLoadingFull(true)
                const { Success, Data, Message } = await PostResetPassword( JSON.stringify({ "UserName": username, "OTPKey": OTPKey, "newPassword": password }));
                if (Success) {
                    showToast(Message, "success") 
                    navigate(redirectPath, { replace: true })
                }
                else { 
                    showToast(Message, "error") 
                    errRef.current.focus();
                }
            }
        }   finally {
            setLoadingFull(false);
        } 
    }

    return (
        <Card  >
            <Stack m={3} spacing={2.5} >
                <Stack spacing={2}>
                    <Typography variant="h3" sx={{ px: 1, mt: 2, mb: 2 }}>
                        Reset Password
                    </Typography>
                    <TextField 
                        id="password"
                        ref={passwordRef}
                        autoComplete="off"
                        type="password"

                        onChange={(e) => setpassword(e.target.value)}
                        value={password}
                        required
                        placeholder="Password" 
                        label="Password" 
                        />
                        
                    <TextField 
                        id="confirmPassword"
                        ref={confirmpPasswordRef}
                        type="password"
                        autoComplete="off"
                        onChange={(e) => setconfirmPassword(e.target.value)}
                        value={confirmPassword}
                        required
                        placeholder="Confirm Password"
                        label="Confirm Password"
                         /> 
                </Stack>

                <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit}>
                    Reset Password
                </LoadingButton> 
            </Stack>

        </Card>
    );
}
