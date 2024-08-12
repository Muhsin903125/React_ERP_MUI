import { createSlice } from '@reduxjs/toolkit';
import { useNavigate } from 'react-router-dom';

const initialState = {
  userToken: sessionStorage.getItem('uToken'),
  refreshToken: sessionStorage.getItem('rToken'),
  username: sessionStorage.getItem('username'),
  displayName: sessionStorage.getItem('displayName'),
  profileImg: sessionStorage.getItem('profileImg'),
  expiry: sessionStorage.getItem('expiry'),
  role: sessionStorage.getItem('role'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { username, token, refreshToken, expiry, firstName, lastName, profileImg, role } = action.payload;
      state.userToken = token;
      state.refreshToken = refreshToken;
      state.username = username;
      state.expiry = expiry;
      state.displayName = `${firstName} ${lastName}`;
      state.profileImg = profileImg;
      state.role = role;

      // Assuming you want to persist data in sessionStorage
      sessionStorage.setItem('uToken', token);
      sessionStorage.setItem('rToken', refreshToken);
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('expiry', expiry);
      sessionStorage.setItem('displayName', `${firstName} ${lastName}`);
      sessionStorage.setItem('profileImg', profileImg);
      sessionStorage.setItem('role', role);
    },
    logout: (state) => {
      // Clear state and sessionStorage
      state.userToken = null;
      state.refreshToken = null;
      state.username = null;
      state.expiry = null;
      state.displayName = null;
      state.profileImg = null;
      state.role = null;

      sessionStorage.removeItem('uToken');
      sessionStorage.removeItem('rToken');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('displayName');
      sessionStorage.removeItem('profileImg');
      sessionStorage.removeItem('role');

      // Navigate to login page
      const navigate = useNavigate();
      navigate('/login', { replace: true });
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
