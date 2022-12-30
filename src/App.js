// routes
import { createContext, useState } from 'react';
import Router from './routes';
// theme
import ThemeProvider from './theme';
// components
import ScrollToTop from './components/scroll-to-top';
import { StyledChart } from './components/chart';
// ----------------------------------------------------------------------

export const AuthContext = createContext();
function App() {

  const [token, setToken] = useState();
  const [username, setUsername] = useState();

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
      <AuthContext.Provider value={{ username, token, login, logout }}>
        <Router />
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
export default App;
