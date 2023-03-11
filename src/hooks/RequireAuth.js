// import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
// import { AuthContext } from '..App'
import useAuth from './useAuth'
 

export const RequireAuth = ({ children }) => {
  const location = useLocation()
  const {userToken} =useAuth()
  const storeduToken = localStorage.getItem("uToken");
        if (!storeduToken) {
    return <Navigate to='/login' state={{ path: location.pathname }} />
  }
  return children
}
