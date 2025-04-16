 
import { Get, Post, PostForm } from './axios';

export async function PostLogin(payload) {
  
  return Post('/Account/Login', payload);
}
export async function PostRefreshToken(payload) {
  
  return Post('/Account/RefreshToken', payload);
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

export async function PostCommonSp(payload) {
  return Post('/General/RouterGatwayV2', payload);
}
export async function GetSingleResult(payload) {
  return Post('/General/RouterGatway', payload);
}
// payload {
//   key:""
//   userId:"",
//   json:"",
//   controller: ""
// }

export async function PostMultiSp(payload) {
  return Post('/General/RouterGatwayV2', payload);
}

export async function PostUpdateUserResgisterAdmin(payload) {
  return PostForm('/User/UpdateProfileDataAdmin',payload );
}

export async function PostUserRegister(payload) {
  return PostForm('/account/register',payload );
}
export async function PostDeactiveUser(payload) {
  return Post(`/User/deactivateUser/${payload}`, );
}export async function PostActiveUser(payload) {
  return Post(`/User/activateUser/${payload}`, );
}

export async function GetUserList() {
  return Get('/User/Userslist', );
}

export async function GetRoleList() {
  return Get('/User/GetRoles', );
}
export async function saveRole(payload) {
  return Post('/User/CreateRole',payload );
}

export async function UpdateRole(payload) {
  return Post('/User/UpdateRole',payload );
}
export async function deleteRole(payload) {
  return Get(`/User/DeleteRole/${payload}`, );
}

export async function PostChangePassword(payload) {
  return Post(`/User/changepassword`,payload );
}

export async function GetInvoice() {
  return Get('/Invoice/getInvoice', );
}
