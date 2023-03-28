import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import validator from 'validator';
// @mui
import { Link, Stack, IconButton, Typography, Card, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useToast } from '../../hooks/Common';
// components 
import CountDownTimer from '../../components/CountDownTimer';
import Iconify from '../../components/iconify';
import { AuthContext } from '../../App';
import { PostForgotPassword, PostOTPVerify } from '../../hooks/Api';

export default function ForgotPassword() {
   
    const GenerateRandomKey = (min,max) => { 
        return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
    }

    const { showToast } = useToast();
    const navigate = useNavigate()
    const { setLoadingFull } = useContext(AuthContext)
    const [OTPKey, setOTPKey] = useState(GenerateRandomKey(1111111,9999999))
    const [username, setUsername] = useState('');
    const [otp, setOtp] = useState('');
    const [resetTimer, setResetTimer] = useState(-1);
    const [errMsg, setErrMsg] = useState('');
    const [isOtpSend, setIsOtpSend] = useState(false);
    const [isTimerEnable, setIsTimerEnable] = useState(false);
    const [isResendEnable, setIsResendEnable] = useState(false);
    const [hoursMinSecs, sethoursMinSecs] = useState({});


    const usernameRef = useRef();
    const otpRef = useRef();
    const errRef = useRef();


    useEffect(() => {
        usernameRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');

    }, [username, otp]) 

    const SendOtp = async (e) => {
        e.preventDefault(); 

        try {
            if (validator.isEmpty(username) || !validator.isEmail(username)  ) {
                setErrMsg("Enter Valid Email");
                showToast("Enter Valid Email", "warning")
                usernameRef.current.focus();
            } else {
                setLoadingFull(true);
                const { Success, Data, Message } = await PostForgotPassword(JSON.stringify({ "Username": username, "OTPKey": OTPKey }));
                if (Success) { 
                    setResetTimer(resetTimer + 1); 
                    const minutes1 = 1;
                    const seconds1 = 0;
                    const resetTimer1= 0;
                    const withHour1 = false;
                    sethoursMinSecs({ minutes1, seconds1, withHour1, resetTimer1 });

                    setIsOtpSend(true);// for enable timer
                    setIsResendEnable(false)
                    setIsTimerEnable(true);
                    setTimeout(
                        () => {
                            setIsResendEnable(true)
                            setIsTimerEnable(false);
                        },
                        60000 
                    );
                    showToast(Message, "success") 
                    otpRef.current.focus();
                }
                else {
                    setOTPKey(GenerateRandomKey(1111111,9999999));
                    usernameRef.current.focus();
                    showToast(Message, "error");
                }
            } 
        } 
        finally {
            setLoadingFull(false);
        } 
    }
    const VerifyOtp = async (e) => {
        e.preventDefault();

        try {
            if (validator.isEmpty(otp)) {
                showToast("OTP is required", "warning")
                setErrMsg("Enter OTP");
                otpRef.current.focus();
            } else {
                setLoadingFull(true)
                const { Success, Data, Message } = await PostOTPVerify(JSON.stringify({ "Username": username, "OTPKey": OTPKey, "OTP": otp.trim() })
                );
                if (Success) {
                    showToast(Message, "success")
                    navigate('/resetpassword', { state: { OTPKey, username } }) 
                }
                else {  
                    showToast(Message, "error")
                    usernameRef.current.focus();
                }
            }
        }      
        finally {
            setLoadingFull(false);
        } 
    }

    return (
        <Card  >
            <Stack m={3} spacing={2.5} >
                <Stack spacing={2}>
                    <Typography variant="h3" sx={{ px: 1, mt: 2, mb: 2 }}>
                        Forgot Password
                    </Typography>
                    <TextField name="email"
                        id="username"
                        ref={usernameRef}
                        autoComplete="off"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        required
                        label="Email address" />

                    {isOtpSend && (
                        <TextField name="email"
                            id="OTP"
                            label="OTP"
                            ref={otpRef}
                            onChange={(e) => setOtp(e.target.value)}
                            value={otp}
                            required
                            placeholder="OTP"
                        />)}
                </Stack>
                {!isOtpSend &&
                    (<LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={SendOtp}>
                        Send OTP
                    </LoadingButton>)}
                {isOtpSend && (
                    <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={VerifyOtp}>
                        Verify OTP
                    </LoadingButton>

                )}
                <Stack alignItems="center">
                    {isResendEnable && (
                        <Link variant="subtitle2" underline="hover" onClick={SendOtp}>Resend OTP</Link>
                    )}
                    {isTimerEnable && (<CountDownTimer hoursMinSecs={hoursMinSecs} />)}
                </Stack>
            </Stack>

        </Card>
    );
}
