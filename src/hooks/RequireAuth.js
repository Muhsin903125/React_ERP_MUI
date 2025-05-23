// import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
// import { AuthContext } from '..App'
import useAuth from './useAuth'


export const RequireAuth = ({ children }) => {
  const location = useLocation()

  const storeduToken = sessionStorage.getItem("uToken");
  const storedexpiry = sessionStorage.getItem("expiry");

  const storedrToken = sessionStorage.getItem("rToken");
  if (!storeduToken || !storedexpiry || !storedrToken) {
    sessionStorage.setItem('redirectUrl', location.pathname + location.search);
    return <Navigate to='/login' state={{ from: location }} replace />
  }
  return children
}
