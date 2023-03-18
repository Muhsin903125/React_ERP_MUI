// routes
import { createContext, useEffect, useState } from 'react';
import { SnackbarProvider } from 'notistack';
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
import Loader from './components/Loader';
import useAuth from './hooks/useAuth';
import useIdle from './hooks/useIdleTimer';
import { PostRefreshToken } from './hooks/Api';
// import Toast from './hooks/Toast';
// ----------------------------------------------------------------------

export const AuthContext = createContext();
function App() {
  const { logout, userToken, refreshToken } = useAuth();
  const [loadingFull, setLoadingFull] = useState(false);
  const [tkn] = useState(userToken);
  const [rtkn] = useState(refreshToken);

  useIdle({ onIdle: logout, idleTime: 15 })// 5 min idle timeout


  async function fetchToken() {
    const storeduToken = sessionStorage.getItem("uToken");
    const storedrToken = sessionStorage.getItem("rToken");
    if (storedrToken && storeduToken) {
      try {
        const response = await PostRefreshToken(
          JSON.stringify({ "AccessToken": storeduToken, "RefreshToken": storedrToken }), userToken);
        if (response?.Success) {
          const accessToken = response?.Data?.accessToken;
          const refreshToken = response?.Data?.refreshToken;
          sessionStorage.setItem("uToken", accessToken);
          sessionStorage.setItem("rToken", refreshToken);
        }
        else { 
          logout();
        }
      } catch {
        logout();
        console.log("refreshtoken failed");
      }
    }
  }

  useEffect(() => {
    // fetchToken();
    const interval = setInterval(() => {
      fetchToken();
    }, 2* 60000);


    return () => clearInterval(interval);
  }, []);



  return (
    <ThemeProvider>
      <ScrollToTop />
      <StyledChart />
      <AuthContext.Provider value={{ setLoadingFull }}>
        <SnackbarProvider maxSnack={3}>
          <Router />
        </SnackbarProvider>
      </AuthContext.Provider>
      {loadingFull && <Loader />}

    </ThemeProvider>
  );
}
export default App;
