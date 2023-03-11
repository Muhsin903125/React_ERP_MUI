import axios from 'axios'; 
import { useToast } from './Common';
import useAuth from './useAuth';

// const BASEURL = 'https://muhsinerpapi.azurewebsites.net/api/';
const BASEURL = process.env.REACT_APP_API_BASE_URL

export const Post = async (url, payload,userToken) => { 
   console.log("xxxxx");
  // const { getToken } =useAuth();// useContext(AuthContext); 
  // const token=getToken();
 
  const axiosInstance = axios.create({
    baseURL: BASEURL,
    headers: {
      'Content-type': 'application/json',
        Authorization: `bearer ${userToken}`,
    },
    timeout: 15000,
  });
 
  try {
    const { data } = await axiosInstance.post(url, payload);
    
   
    return {
      Success: true,
      Data: data?.data,
      Message: data?.message,
    };
  } catch (error) {
    
  console.log("err",error);
    ErrorHandler(error, url, payload);
    return {
      Success: false,
      Data: error?.response?.data,
      Message: error?.response?.data?.message,
    };
  }
};

export const Get = async (url, payload) => {
  const { userToken } =useAuth();// useContext(AuthContext); 
  const axiosInstance = axios.create({
    baseURL: BASEURL,
    headers: {
      'Content-type': 'application/json',
      Authorization: `bearer ${userToken}`,
    },
    timeout: 15000,
  });

  try {
    const { data } = await axiosInstance.get(url, {
      params: payload,
    });
    return {
      Success: true,
      Data: data?.data,
      Message: data?.message,
    };
  } catch (error) {
    ErrorHandler(error, url, payload);
    return {
      Success: false,
      Data: error?.response?.data,
      Message: error?.response?.data?.message,
    };
  }
};
 

export const ErrorHandler = (error, url, payload = {}) => {
  const { showToast } = useToast();
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
        showToast(errorMessage, 'error');
        throw new Error(errorMessage);
      }
    } else {
      throw new Error('Something went wrong.');
    }
  }
};