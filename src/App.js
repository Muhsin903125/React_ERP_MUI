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

  const [loadingFull, setLoadingFull] = useState(false); 

  return (
    <ThemeProvider>
      <ScrollToTop />
      <StyledChart />
      <AuthContext.Provider value={{  setLoadingFull }}>
        <SnackbarProvider maxSnack={3}>
          <Router />
        </SnackbarProvider>
      </AuthContext.Provider>
      {loadingFull && <Loader />}

    </ThemeProvider>
  );
}
export default App;
