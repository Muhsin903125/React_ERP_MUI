import  {  useEffect, useState } from 'react';
import { PostMultiSp } from '../hooks/Api';


export  default function useLookupData() {

    const [lookupData, setlookupData] = useState([]); 

    useEffect(() => {

        async function fetchCustomerList() {
    
          try {
            const { Success, Data, Message } = await PostMultiSp({
              "key": "string",
              "userId": "string",
              "json": JSON.stringify({
                "json": [],
                "key": "COMMON_LOOKUP",
                "doctype" : "CUS"
              }),
              "controller": "string"
            })
            if (Success) {
                setlookupData(Data[0])
            //  showToast(Message, 'success');
            }
          }
          finally {
            console.log("Lookup Data Failure")
          } 
        }
    
        fetchCustomerList();
    
        },[])

        return lookupData
}