// routes
import { createContext, useState } from 'react';
import { SnackbarProvider } from 'notistack'; 
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
import Loader from './components/Loader'; 
// import Toast from './hooks/Toast';
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
  //  showToast("Logout Success","info")
  }

  return (
    <ThemeProvider>
      <ScrollToTop />
      <StyledChart />
      <AuthContext.Provider value={{ username, token, login, logout ,setLoadingFull}}>
      <SnackbarProvider maxSnack={3}>
        <Router />
        </SnackbarProvider>
      </AuthContext.Provider>
      {loadingFull && <Loader  />}
    
    </ThemeProvider>
  );
}
export default App;
