import axios from 'axios';  

// const BASEURL = 'https://muhsinerpapi.azurewebsites.net/api/';
//  const BASEURL = process.env.REACT_APP_API_BASE_URL
 const BASEURL = 'http://192.168.1.19:7134/api/'


export const Post = async (url, payload) => { 
  const storeduToken = sessionStorage.getItem("uToken");
  const axiosInstance = axios.create({
    baseURL: BASEURL,
    headers: {
      'Content-type':  'application/json' ,
      Authorization: `bearer ${storeduToken}`,
    },
    timeout: 15000,
  });

  try {
    const { data } = await axiosInstance.post(url, payload);

    return {
      Success: data?.success,
      Data: data?.data,
      Message: data?.message,
    };
  } catch (error) {

    return {
      Success: false,
      Data: error?.response?.data,
      Message: await ErrorHandler(error, url, payload)
    };
  }
};
export const PostForm = async (url, payload) => {
  const storeduToken = sessionStorage.getItem("uToken"); 
  const axiosInstance = axios.create({
    baseURL: BASEURL,
    headers: {
      'Content-type':  'multipart/form-data',
      Authorization: `bearer ${storeduToken}`,
    },
    timeout: 15000,
  });

  try {
    const { data } = await axiosInstance.post(url, payload); 
    return {
      Success: data?.success,
      Data: data?.data,
      Message: data?.message,
    };
  } catch (error) {

    return {
      Success: false,
      Data: error?.response?.data,
      Message: await ErrorHandler(error, url, payload)
    };
  }
};

export const Get = async (url, payload) => {
  // const { userToken } =useAuth();// useContext(AuthContext); 
  const storeduToken = sessionStorage.getItem("uToken");

  const axiosInstance = axios.create({
    baseURL: BASEURL,
    headers: {
      'Content-type': 'application/json',
      Authorization: `bearer ${storeduToken}`,
    },
    timeout: 15000,
  });

  try {
    const { data } = await axiosInstance.get(url, payload);

    return {
      Success: data?.success,
      Data: data?.data,
      Message: data?.message,
    };
  } catch (error) {

    return {
      Success: false,
      Data: error?.response?.data,
      Message: await ErrorHandler(error, url, payload)
    };
  }
};

export function ErrorHandler(error, url, payload = {}) {
  console.log("Error:", error);
  let errMsg = "";

  console.log(`REQUEST TO: ${url} with PAYLOAD: ${JSON.stringify(payload)} failed!`);

  if (error.message === 'Network Error') {
    errMsg = 'Network Error. Please check your internet connection.';
  } else if (error.message === 'Server is not responding') {
    errMsg = 'Server is not responding. Please try again later.';
  } else {
    const { response } = error;

    if (response) {
      const { status } = response;
      console.warn(`API ERROR STATUS: ${status}\n`);

      if (status === 401) {
        errMsg = error?.response.data.message || 'Unauthorized access. Please login to continue.';
      } else if (status === 404) {
        errMsg = 'The requested resource was not found. Please check the URL and try again.';
      } else if (status === 500) {
        errMsg = 'Internal server error. Please try again later.';
      } else {
        errMsg = error?.message || 'Something went wrong. Please try again later.';
      }
    }
  }
  return errMsg;
}
