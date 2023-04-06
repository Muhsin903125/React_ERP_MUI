// ----------------------------------------------------------------------

const account = {
    displayName:`${sessionStorage.getItem("firstName")} ${sessionStorage.getItem("lastName")}`,
  email: sessionStorage.getItem("email"),
  photoURL: '/assets/images/avatars/avatar_default.jpg',
  role: 'Admin'
};

export default account;
