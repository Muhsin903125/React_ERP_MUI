
import { useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { useToast } from './Common';

// const BASEURL = 'https://muhsinerpapi.azurewebsites.net/api/';
const BASEURL = process.env.REACT_APP_API_BASE_URL

export const Post = async (url, payload) => { 
  
  const { token } = "";// useContext(AuthContext); 
  const axiosInstance = axios.create({
    baseURL: BASEURL,
    headers: {
      'Content-type': 'application/json',
   //   Authorization: `bearer ${token}`,
    },
    timeout: 15000,
  });
 console.log('ss',BASEURL);
  try {
    const { data } = await axiosInstance.post(url, payload);
    
  console.log("logn",payload);
    return {
      Success: true,
      Data: data?.data,
      Message: data?.message,
    };
  } catch (error) {
    
  console.log("logn2",error);
    ErrorHandler(error, url, payload);
    return {
      Success: false,
      Data: error?.response?.data,
      Message: error?.response?.data?.message,
    };
  }
};

export const Get = async (url, payload) => {
  const { token } = useContext(AuthContext);
  const axiosInstance = axios.create({
    baseURL: BASEURL,
    headers: {
      'Content-type': 'application/json',
      Authorization: `bearer ${token}`,
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

// export const del = async (URL, payload, token) => {
//   // console.log({ URL });
//   // let langCode = await AsyncStorage.getItem('LangCode');
//   // let token = await AsyncStorage.getItem('token');
//   let axiosInstanceGet = axios.create({
//     baseURL: BASEURL,
//     headers: {
//       "Content-type": "application/json",
//       "Authorization": "bearer " + token
//     }
//   });
//   try {
//     let result = await axiosInstanceGet.delete(URL, payload ? payload : null, {
//       timeout: 15000,
//       timeoutErrorMessage: 'Server is not responding',
//     });
//     return {
//       Success: true,
//       Data: result?.data?.data,
//       Message: result?.data?.message,
//     };
//   } catch (error) {
//     ErrrHandler(error, URL, payload);
//     return {
//       Success: false,
//       Data: error,
//     };
//   }
// };
// export const put = async (URL, payload, token) => {
//   // console.log({ URL });
//   // let langCode = await AsyncStorage.getItem('LangCode');
//   // let token = await AsyncStorage.getItem('token');
//   let axiosInstanceGet = axios.create({
//     baseURL: BASEURL,
//     headers: {
//       "Content-type": "application/json",
//       "Authorization": "bearer " + token
//     }
//   });
//   try {
//     let result = await axiosInstanceGet.put(URL, payload ? payload : null, {
//       timeout: 15000,
//       timeoutErrorMessage: 'Server is not responding',
//     });
//     return {
//       Success: true,
//       Data: result?.data?.data,
//       Message: result?.data?.message,
//     };
//   } catch (error) {
//     ErrrHandler(error, URL, payload);
//     return {
//       Success: false,
//       Data: error,
//     };
//   }
// };

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
        const { logout } = useContext(AuthContext);        
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



// export const ErrrHandler = (e, URL, PAYLOAD = {}) => {

//   console.log(
//     `REQUEST TO: ${URL} with PAYLOAD: ${JSON.stringify(PAYLOAD)} failed!,`
//   );
//   const { status, data } = e.response;

//   if (e.message === 'Network Error') {
//     throw 'Network Error. Ensure you are connected to internet.';
//   } else if (e.message === 'Server is not responding') {
//     throw 'Server is not responding';
//   } else {
//     ToastAlert(e.response?.data.message, "error")
//     // const { status, data } = e.response;
//     // console.warn(`API ERROR STATUS: ${status}\n`);
//     const { Message } = data;
//     if (status === 401) {
//       const { logout } = useContext(AuthContext)
//       logout()
//       throw {
//         Message,
//         status,
//       };
//     }
//     if (typeof Message === 'string') {
//       // Toast.show(Message);
//       throw Message;
//     } else {
//       throw 'Something went wrong.';
//     }
//   }
// };
