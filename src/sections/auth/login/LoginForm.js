import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox, CircularProgress } from '@mui/material';
import { LoadingButton } from '@mui/lab';  
import   { useToast }  from '../../../hooks/Common';
import { post } from '../../../hooks/axios';
// components 
import Iconify from '../../../components/iconify';
import { AuthContext } from '../../../App';  

// ----------------------------------------------------------------------
const LOGIN_URL = '/Account/login';
export default function LoginForm() {
  const { showToast } = useToast(); 
  const { login, setLoadingFull } = useContext(AuthContext);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const userRef = useRef();
  const errRef = useRef();

  const [user, setUser] = useState('admin@erp.com');
  const [pwd, setPwd] = useState('123456');
  const [errMsg, setErrMsg] = useState('');
  useEffect(() => {
    userRef.current.focus();
  }, [])

  useEffect(() => {
    setErrMsg('');
  }, [user, pwd])

  const handleClick = async (e) => {
    setLoadingFull(true);
   
    try {
      const response = await post(LOGIN_URL,
        JSON.stringify({ "Username": user, "Password": pwd })
      );
      if (response?.Success) {
        const accessToken = response?.Data?.access_token;
        login(user, accessToken);
        setLoadingFull(false); 
        
        showToast('Successfully Logined !!', 'success');
        navigate("/dashboard", { replace: true })
      }
      else {
        setLoadingFull(false);
        const errResp = response?.Data.response?.data
        if (errResp.statusCode === 400 || errResp.statusCode === 401) {
          setErrMsg(errResp.message);    //
          showToast(errResp.message,  "error" );
        } else {
          setErrMsg('Login Failed');
          showToast("Login Failed !!",  "error" );
        }
      }
    } catch (err) { 
      if (!err?.response) {
        setErrMsg("Server no response");
        showToast("Server no response",  "error" );
      } else if (err.response?.status === 400) {
        setErrMsg('Missing Username or Password');
      } else {
        setErrMsg('Login Failed');
      }
      // errRef.current.focus();
    }


  };

  return (
    <>
      <Stack spacing={3}>
        <TextField name="email"
          id="email"
          autoComplete="off"
          onChange={(e) => setUser(e.target.value)}
          value={user}
          required
          label="Email address" />

        <TextField
          name="password"
          label="Password"
          onChange={(e) => setPwd(e.target.value)}
          value={pwd}
          ref={userRef}
          required
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        {/* <Checkbox name="remember" label="Remember me" /> */}
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Login
      </LoadingButton>
    </>
  );
}
