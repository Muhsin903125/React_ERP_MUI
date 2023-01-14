import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, Typography, Card, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useToast, GenerateRandomKey } from '../../hooks/Common';
// components 
import CountDownTimer from '../../components/CountDownTimer';
import Iconify from '../../components/iconify';
import { post } from '../../hooks/axios';
import { AuthContext } from '../../App';


const FORGOTPASSWORD_APIURL = '/Account/forgotpassword';
const OTPVERIFY_APIURL = '/Account/verifyotp';

export default function ForgotPassword() {
    const { showToast } = useToast();
    const navigate = useNavigate()
    const { setLoadingFull } = useContext(AuthContext)
    // const GenerateRandomKey = GenerateRandomKey(12);
    const [OTPKey, setOTPKey] = useState( "GenerateRandomKey(12)")
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
            if (username === null || username === "") {
                setErrMsg("Enter Username");
                showToast("Username is required", "warning")
                usernameRef.current.focus();
            } else {
                setLoadingFull(true);
                const response = await post(FORGOTPASSWORD_APIURL,
                    JSON.stringify({ "Username": username, "OTPKey": OTPKey })
                );
                if (response?.Success) {

                    setResetTimer(resetTimer + 1);

                    const minutes = 0;
                    const seconds = 5;
                    const resetTimer = 0;
                    const withHour = false;
                    sethoursMinSecs({ minutes, seconds, withHour, resetTimer });

                    setIsOtpSend(true);// for enable timer
                    setIsResendEnable(false)
                    setIsTimerEnable(true);
                    setTimeout(
                        () => {
                            setIsResendEnable(true)
                            setIsTimerEnable(false);
                        },
                        5000
                    );
                    showToast(response?.Message, "success")
                    setLoadingFull(false)
                    otpRef.current.focus();
                }
                else {
                    setLoadingFull(false)
                    const errResp = response?.Data.response?.data
                    if (errResp.statusCode === 400 || errResp.statusCode === 401) {
                        setErrMsg(errResp.message);
                        showToast(errResp.message, "error")
                    } else {
                        setErrMsg("Server no response");
                        showToast("Server no response", "error")
                    }
                    usernameRef.current.focus();
                    setOTPKey(GenerateRandomKey(15));
                }
            }

        } catch (err) {
            setLoadingFull(false)
            if (!err?.response) {
                setErrMsg("Server no response");
            }
            setOTPKey(GenerateRandomKey(15));
            usernameRef.current.focus();
        }
    }
    const VerifyOtp = async (e) => {
        e.preventDefault();

        try {
            if (otp === null || otp === "") {
                setErrMsg("Enter OTP");
                showToast("OTP is required", "warning")
                otpRef.current.focus();
            } else {
                setLoadingFull(true)
                const response = await post(OTPVERIFY_APIURL,
                    JSON.stringify({ "Username": username, "OTPKey": OTPKey, "OTP": otp })
                );
                if (response?.Success) {
                    showToast(response?.Message, "success")
                    navigate('/resetpassword', { state: { OTPKey, username } })
                    setLoadingFull(false)
                }
                else {
                    setLoadingFull(false)
                    const errResp = response?.Data.response?.data
                    if (errResp.statusCode === 400 || errResp.statusCode === 401) {
                        setErrMsg(errResp.message);
                        showToast(errResp.message, "error")
                    } else {
                        setErrMsg("Server no response");
                    }
                    usernameRef.current.focus();
                }
            }
        } catch (err) {
            setLoadingFull(false)
            if (!err?.response) {
                setErrMsg("Server no response");
            }
            usernameRef.current.focus();
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
