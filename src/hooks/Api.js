import { Post } from './axios';

export async function PostLogin(payload) {
  
  return Post('/Account/login', payload);
}


export async function PostForgotPassword(payload) {
  return Post('/Account/forgotpassword', payload);
}
export async function PostOTPVerify(payload) {
  return Post('/Account/verifyotp', payload);
}
export async function PostResetPassword(payload) {
  return Post('/Account/resetpassword', payload);
}

export async function PostCommonSp(payload,userToken) {
  return Post('/User/SPCALL', payload, userToken);
}
// payload {
//   key:""
//   userId:"",
//   json:"",
//   controller: ""
// }

export async function PostMultiSp(payload,userToken) {
  return Post('/User/CallGETMULTISP', payload,userToken);
}