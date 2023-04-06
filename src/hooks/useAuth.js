import { useState, useEffect } from "react";
// import * as CryptoJS from "crypto-js";
import sha256 from 'crypto-js/sha256';
import { useNavigate } from "react-router-dom";
// import { getUniqueId, getManufacturer } from 'react-native-device-info';
const ENCRYPTION_KEY = "my_secret_key";

export default function useAuth() {

    // let plaintext = CryptoJS. enc.utf8.parse(text); 
    // let secSpec = CryptoJS. enc.utf8.parse(process.env.REACT_APP_AES_KEY); 
    // let ivSpec = CryptoJS. enc.utf8.parse(process.env.REACT_APP_AES_IV); 
    // secSpec = CryptoJS.lib.WordArray.create(secSpec.words.slice(0, 16 / 4));   
    // ivspec = CryptoJs.lib.WordArray.create(ivSpec.words.slice(0, 16 / 4)); var encrypted = CryptoJS.AES.encrypt (plaintext, secSpec, { iv: ivSpec });

    // return encrypted.toString()

    const navigate = useNavigate();
    // const deviceID = navigator.userAgent; 
    const [userToken, setUserToken] = useState(sessionStorage.getItem("uToken"));
    const [refreshToken, setRefreshToken] = useState(sessionStorage.getItem("rToken"));
    const [username, setUsername] = useState(sessionStorage.getItem("username"));
    const [displayName, setDisplayName] = useState(sessionStorage.getItem("displayName"));
    const [imageUrl, setImageUrl] = useState(sessionStorage.getItem("imageUrl"));
    const [expiry, setExpiry] = useState(sessionStorage.getItem("expiry"));

    useEffect(() => {
        // const storeduToken = sessionStorage.getItem("uToken");
        // if (storeduToken) {
        //     // const bytes = sha256.AES.decrypt(storeduToken, ENCRYPTION_KEY);
        //     // const decryptedUser = JSON.parse(bytes.toString(sha256.enc.Utf8));
        //     // setUserToken(decryptedUser);          

        //     setUserToken(storeduToken);
        // }
        // const storedrToken = sessionStorage.getItem("rToken");
        // if (storedrToken) {
        //     setRefreshToken(storedrToken);
        // }
        // const storedusername = sessionStorage.getItem("username");
        // if (storedusername) {
        //     setUsername(storedusername);
        // }

        // const storedexpiry = sessionStorage.getItem("expiry");
        // if (storedexpiry) {
        //     setExpiry(storedexpiry);
        // }


    }, []);

    // function getToken(){
    //     const storeduToken = localStorage.getItem("uToken");
    //     // if (storeduToken) {
    //         const bytes = sha256.AES.decrypt(storeduToken, ENCRYPTION_KEY);
    //         const decryptedUser = JSON.parse(bytes.toString(sha256.enc.Utf8));
    //        return decryptedUser;
    //    // }
    // }

    function login(username, token, refreshToken, expiry, firstName, lastName, imageurl, email) {
        // Make a request to your API to authenticate the user
        // const user = { id: 1, username: "example_user" };
        // const token = "your_jwt_token";

        // Encrypt the user object before storing it in local storage
        // const encryptedToken = sha256.AES.encrypt(
        //     JSON.stringify(token),
        //     ENCRYPTION_KEY
        // ).toString();

        // localStorage.setItem("uToken", encryptedToken);
       
        sessionStorage.setItem("uToken", token);
        sessionStorage.setItem("rToken", refreshToken);
        sessionStorage.setItem("username", username);
        sessionStorage.setItem("expiry", expiry);
        sessionStorage.setItem("displayName", `${firstName} ${lastName}`);  
        sessionStorage.setItem("imageUrl", imageurl);

        setUserToken(token);
        setRefreshToken(refreshToken);
        setUsername(username);
        setExpiry(expiry);
        setDisplayName(`${firstName} ${lastName}`);
        setImageUrl(imageurl);
    };

    function logout() {

        sessionStorage.removeItem("uToken");
        sessionStorage.removeItem("rToken");
        sessionStorage.removeItem("username");
        sessionStorage.removeItem("displayName");
        sessionStorage.removeItem("imageUrl"); 


        setUserToken(null);
        setRefreshToken(null);
        setUsername(null);
        setExpiry(null);
        setDisplayName(null);
        // showToast('Successfully Logined !!', 'success');
        navigate("/login", { replace: true })
    };

    return { userToken, refreshToken, username, expiry,displayName,imageUrl, login, logout };
};

// export default useAuth;
