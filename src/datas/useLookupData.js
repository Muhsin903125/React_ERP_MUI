import { useEffect, useState } from 'react';
import { GetSingleListResult, PostMultiSp } from '../hooks/Api';

export default function useLookupData(type) {
    const [lookupData, setLookupData] = useState([]);

    useEffect(() => {
        const fetchLookupData = async () => {
            try {
                const { Success, Data } = await GetSingleListResult({
                    key: 'LOOKUP',
                    TYPE: type,
                });

                if (Success) {
                    setLookupData(Data); 
                }
            } catch (err) {
                console.error("Error fetching lookup data:", err);
            }
        };

        fetchLookupData();
    }, [type]); // Added type as a dependency

    return lookupData;
}
