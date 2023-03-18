import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// @mui
import { Link as Alink, Stack, IconButton, Typography, InputAdornment, Card, TextField, Checkbox, CircularProgress } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useToast } from '../../../hooks/Common';
// components 
import Iconify from '../../../components/iconify';
import { AuthContext } from '../../../App';
import Logo from '../../../components/logo/Logo';
import { PostLogin } from '../../../hooks/Api';
import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const { showToast } = useToast(); 
  const { setLoadingFull } = useContext(AuthContext);
  
  const { login,logout } = useAuth();
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
 
      const response = await PostLogin(JSON.stringify({ "Username": user, "Password": pwd }));
  
      if (response?.Success) {
        const accessToken = response?.Data?.accessToken;
        const refreshToken = response?.Data?.refreshToken;
        const expiry = response?.Data?.expiration;
        const username = response?.Data?.userName;

        login(username, accessToken,refreshToken,expiry);
        setLoadingFull(false);

        navigate("/", { replace: true })
        showToast('Successfully Logined !!', 'success');
      }
      else {
        logout();
        setLoadingFull(false);
        const errResp = response?.Data.response?.data
        if (errResp.statusCode === 400 || errResp.statusCode === 401) {
          setErrMsg(errResp.message);    //
          showToast(errResp.message, "error");
        } else {
          setErrMsg('Login Failed');
          showToast("Login Failed !!", "error");
        }
      }
    }
    catch (err) {
      console.log("errrrrrrrrrrrrrrrrrrrrr",err);
      setLoadingFull(false);
    }
    finally {
      setLoadingFull(false);
    }

  };

  return (
    <Card  >
      <Stack m={2.5}>
        <Stack spacing={3} >
          <Typography variant="h3" sx={{ px: 1, mt: 2, mb: 2 }}>
            Login
          </Typography>
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
          <Alink variant="subtitle2" underline="hover">
            <Link to='/forgotpassword' >
              Forgot password?
            </Link>
          </Alink>
        </Stack>

        <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
          Login
        </LoadingButton>
      </Stack>

    </Card>
  );
}
