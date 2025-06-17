 
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
  // payload = { key: "", userId: "", json: "" }
  // response = { Success: true, "data": {
  //   "LAST_NO": "C0033",
  //   "IS_EDITABLE": false
  // }, Message: "" }
}
export async function GetSingleListResult(payload) {
  return Post('/General/RouterGatwayV1', payload);
  // payload = { key: "", userId: "", json: "" }

  // response = { Success: true, Data:  "data": [
  //   {
  //     "LAST_NO": "C0033",
  //     "IS_EDITABLE": false
  //   }
  // ], Message: "" }
}
export async function GetMultipleResult(payload) {
  return Post('/General/RouterGatwayV2', payload);
  // payload = { key: "", userId: "", json: "" }
  // response = { Success: true,"data": [
  //   [
  //     {
  //       "LAST_NO": "C0033",
  //       "IS_EDITABLE": false
  //     }
  //   ]
  // ], Message: "" }
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
  return PostForm('/Account/UpdateProfileDataAdmin',payload );
}

export async function PostUserRegister(payload) {
  return Post('/Account/UserRegister',payload );
}
export async function PostDeactiveUser(payload) {
  return Post(`/Account/deactivateUser/${payload}`, );
}
export async function PostActiveUser(payload) {
  return Post(`/Account/activateUser/${payload}`, );
}

export async function GetUserList() {
  return Get('/Account/Userslist', );
}

export async function GetRoleList() {
  return Get('/Account/GetRoles', );
}
export async function saveRole(payload) {
  return Post('/Account/CreateRole',payload );
}

export async function UpdateRole(payload) {
  return Post('/User/UpdateRole',payload );
}
export async function deleteRole(payload) {
  return Get(`/User/DeleteRole/${payload}`, );
}

export async function PostChangePassword(payload) {
  return Post(`/Account/changepassword`,payload );
}

export async function GetInvoice() {
  return Get('/Invoice/getInvoice', );
}
