 
import axios from 'axios';
 
const BASEURL = 'https://muhsinerpapi.azurewebsites.net/api/';

export const post = async (URL, payload, token) => {

  let axiosInstancePost = axios.create({
    baseURL: BASEURL,
    headers: {
      "Content-type": "application/json",
      "Authorization": `bearer ${token}`
    }
  });
  try {
    const result = await axiosInstancePost.post(URL, payload, {
      timeout: 15000,
      timeoutErrorMessage: 'Server is not responding',
    });
    return {
      Success: true,
      Data: result?.data?.data,
      Message: result?.data?.message,
    };
  } catch (error) {
  //  ErrrHandler(error, URL, payload);
    return {
      Success: false,
      Data: error,
    };
  }
};
// export const get = async (URL, payload, token) => {
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
//     let result = await axiosInstanceGet.get(URL, payload ? payload : null, {
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
//       const {logout}=useContext(AuthContext)
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
