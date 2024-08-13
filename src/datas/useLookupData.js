import { useEffect, useState } from 'react';
import { PostMultiSp } from '../hooks/Api';

export default function useLookupData(type) {
    const [lookupData, setLookupData] = useState([]);

    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const { Success, Data } = await PostMultiSp({
                    key: 'LOOKUP',
                    TYPE: type,
                });

                if (Success) {
                    setLookupData(Data[0]); 
                }
            } catch (err) {
                console.error("Error fetching lookup data:", err);
            }
        };

        fetchLookupData();
    }, [type]); // Added type as a dependency

    return lookupData;
}
