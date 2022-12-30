// routes
import { createContext, useState } from 'react';
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
import Loader from './components/Loader';
import ToastAlert from './components/ToastAlert';
// ----------------------------------------------------------------------

export const AuthContext = createContext();
function App() {

  const [token, setToken] = useState();
  const [username, setUsername] = useState();

  const [loadingFull, setLoadingFull] = useState(false);
  const login = (user, token, roles) => {
    // console.log("adas " + user, "tt " + token + " rr  " + roles);
      console.log(`adas ${user}`)
    setUsername(user);
    setToken(token);
  }

  const logout = () => {
    setUsername(null);
    setToken(null);
    // ToastAlert("Logout Success", "success")
  }

  return (
    <ThemeProvider>
      <ScrollToTop />
      <StyledChart />
      <AuthContext.Provider value={{ username, token, login, logout ,setLoadingFull}}>
        <Router />
      </AuthContext.Provider>
      {loadingFull && <Loader  />}
      <ToastAlert type="success" message="123 test dd"/>
    </ThemeProvider>
  );
}
export default App;
