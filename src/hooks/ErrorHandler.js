import useAuth from "./useAuth";
import { useToast } from "./Common";

export default function ErrorHandler (error, url, payload)  {
    
    console.log(`REQUEST TO: ${url} with PAYLOAD: ${JSON.stringify(payload)} failed!`);
  
    if (error.message === 'Network Error') {
      throw new Error('Network Error. Please check your internet connection.');
    } else if (error.message === 'Server is not responding') {
      throw new Error('Server is not responding.');
    } else {
      const { response } = error;
    
      if (response) {
        const { status, data } = response;
        console.warn(`API ERROR STATUS: ${status}\n`);
  
        if (status === 401) {
          const { logout } =useAuth();// useContext(AuthContext);        
          logout();
          throw new Error({
            message: data.Message,
            status,
          });
        } else {
          const errorMessage = data?.message || 'Something went wrong.';
  console.log("1111");
  const { showToast } = useToast();
    
          showToast(errorMessage, 'error');
          throw new Error(errorMessage);
        }
      } else {
        throw new Error('Something went wrong.');
      }
    }
  };