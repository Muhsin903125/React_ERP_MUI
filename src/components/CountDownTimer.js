import React from 'react'

const tick = (time, setTime) => {
    const [hrs, mins, secs] = time;
    if (hrs === 0 && mins === 0 && secs === 0)
        reset(time, setTime)
    else if (mins === 0 && secs === 0) {
        setTime([hrs - 1, 59, 59]);
    } else if (secs === 0) {
        setTime([hrs, mins - 1, 59]);
    } else {
        setTime([hrs, mins, secs - 1]);
    }
};

const reset = (time, setTime) => setTime(time);

const CountDownTimer = ({ hoursMinSecs }) => {
    const { hours = 0, minutes = 0, seconds = 60, withHour = false, resetTimer = 0 } = hoursMinSecs;
    const [time, setTime] = React.useState([hours, minutes, seconds]);
    const tickCallback = React.useCallback(() => tick(time, setTime), [time, setTime]);
    React.useEffect(() => {
        const timerId = setInterval(tickCallback, 1000);
        return () => clearInterval(timerId);
    }, [tickCallback]);

    React.useEffect(() => {
        reset(time, setTime);
    }, [resetTimer]);
   
    return (
        withHour
            ?
            (
                <div>
                    <>{`${time[0].toString().padStart(2, '0')}:${time[1].toString().padStart(2, '0')}:${time[2].toString().padStart(2, '0')}`}</>
                </div>)
            :
            (
                <div>
                    <>{`${time[1].toString().padStart(2, '0')}:${time[2].toString().padStart(2, '0')}`}</>
                </div>
            )
    );
}

export default CountDownTimer;