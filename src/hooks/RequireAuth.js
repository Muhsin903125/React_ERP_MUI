import { useContext } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '..App'
 

export const RequireAuth = ({ children }) => {
  const location = useLocation()
  const {username} =useContext(AuthContext)
  if (!username) {
    return <Navigate to='/login' state={{ path: location.pathname }} />
  }
  return children
}
