import { useState, useEffect } from "react";
// import * as CryptoJS from "crypto-js";
import sha256 from 'crypto-js/sha256';
import { useNavigate } from "react-router-dom";
// import { getUniqueId, getManufacturer } from 'react-native-device-info';
const ENCRYPTION_KEY = "my_secret_key";

export default function  useAuth (){
    const navigate = useNavigate();
    // const deviceID = navigator.userAgent; 
    const [userToken, setUserToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [username, setUsername] = useState(null);
    const [expiry, setExpiry] = useState(null);

    useEffect(() => {
        const storeduToken = localStorage.getItem("uToken");
        if (storeduToken) {
            // const bytes = sha256.AES.decrypt(storeduToken, ENCRYPTION_KEY);
            // const decryptedUser = JSON.parse(bytes.toString(sha256.enc.Utf8));
            // setUserToken(decryptedUser);          
            
            setUserToken(storeduToken);
        }
        const storedrToken = localStorage.getItem("rToken");
        if (storedrToken) {
            setRefreshToken(storedrToken);
        }
        const storedusername = localStorage.getItem("username");
        if (storedusername) {
            setUsername(storedusername);
        } 
        
        const storedexpiry = localStorage.getItem("expiry");
        if ( storedexpiry) {
            setExpiry(storedexpiry );
        }

        
    }, []);

// function getToken(){
//     const storeduToken = localStorage.getItem("uToken");
//     // if (storeduToken) {
//         const bytes = sha256.AES.decrypt(storeduToken, ENCRYPTION_KEY);
//         const decryptedUser = JSON.parse(bytes.toString(sha256.enc.Utf8));
//        return decryptedUser;
//    // }
// }

function login (username, token, refreshToken, expiry)   {
        // Make a request to your API to authenticate the user
        // const user = { id: 1, username: "example_user" };
        // const token = "your_jwt_token";
       
        // Encrypt the user object before storing it in local storage
        // const encryptedToken = sha256.AES.encrypt(
        //     JSON.stringify(token),
        //     ENCRYPTION_KEY
        // ).toString();

        // localStorage.setItem("uToken", encryptedToken);
        localStorage.setItem("uToken", token);
        localStorage.setItem("rToken", refreshToken);
        localStorage.setItem("username", username);
        localStorage.setItem("expiry", expiry);
         
        setUserToken(token);
        setRefreshToken(refreshToken);
        setUsername(username);
        setExpiry(expiry);
    };

    function logout() {
        localStorage.removeItem("uToken");
        localStorage.removeItem("rToken");
        localStorage.removeItem("username");
        localStorage.removeItem("expiry");


        setUserToken(null);
        setRefreshToken(null);
        setUsername(null);
        setExpiry(null);

         navigate("/login", { replace: true })
    };

    return { userToken,refreshToken,username,expiry, login, logout };
};

// export default useAuth;
