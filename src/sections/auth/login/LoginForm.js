import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// @mui
import { Link as Alink, Stack, IconButton, Typography, InputAdornment, Card, TextField,  } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useToast } from '../../../hooks/Common';
// components 
import Iconify from '../../../components/iconify';
import { AuthContext } from '../../../App'; 
import { PostLogin } from '../../../hooks/Api';
import useAuth from '../../../hooks/useAuth';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const { showToast } = useToast();
  const { setLoadingFull } = useContext(AuthContext);

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const userRef = useRef(); 

  const [user, setUser] = useState('admin@erp.com');
  const [pwd, setPwd] = useState('123456'); 

  useEffect(() => {
    userRef.current.focus();
  }, []) 

  const handleClick = async () => {
    setLoadingFull(true);
    login("username", "accessToken", "refreshToken", "expiry","firstName","lastName","profileImg","email","role");
    navigate("/", { replace: true })
    try {

      // const { Success, Data, Message } = await PostLogin(JSON.stringify({ "Username": user, "Password": pwd })); 
      // if (Success) {
      //   const accessToken = Data?.accessToken;
      //   const refreshToken = Data?.refreshToken;
      //   const firstName = Data?.firstName;
      //   const lastName = Data?.lastName;
      //   const email = Data?.email;
      //   const profileImg = Data?.profileImg;
      //   const expiry = Data?.expiration;
      //   const username = Data?.userName;
      //   const role = Data?.role;
      //   login(username, accessToken, refreshToken, expiry,firstName,lastName,profileImg,email,role);

      //   navigate("/", { replace: true })
      //   showToast(Message, 'success');
      // }
      // else {
      //   logout();
      //   showToast(Message, "error");
      // }
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
