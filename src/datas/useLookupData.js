import { useEffect, useState } from 'react';
import { GetSingleListResult, PostMultiSp } from '../hooks/Api';
import { useToast } from '../hooks/Common';

export default function useLookupData(type) {
    const [lookupData, setLookupData] = useState([]);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const { Success, Data, Message } = await GetSingleListResult({
                    key: 'LOOKUP',
                    TYPE: type,
                });

                if (Success) {
                    setLookupData(Data); 
                }
                else {
                    showToast(Message, "error");
                }
            } catch (err) {
                console.error("Error fetching lookup data:", err);
            }
        };

        fetchLookupData();
    }, [type]); // Added type as a dependency

    return lookupData;
}
