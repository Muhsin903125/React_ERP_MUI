
import {useState } from 'react';
import { useLocation } from 'react-router-dom';
import {useIdleTimer} from 'react-idle-timer'

export default function useIdle({
    onIdle,
    idleTime=2
}){
    const [isIdle, setIsIdle] = useState();
    const location = useLocation()
    const handleOnIdle = event => {
        setIsIdle(true); 
        sessionStorage.setItem('redirectUrl', location.pathname + location.search);
        console.log("user is idle", event)
        console.log("Last Active", getLastActiveTime())
        onIdle();
    }

    const {getRemainingTime, getLastActiveTime} = useIdleTimer({
        timeout: idleTime * 60 * 1000,
        onIdle: handleOnIdle,
        debounce: 500
    });

    return {
        getRemainingTime,
        getLastActiveTime,
        isIdle
    }
}