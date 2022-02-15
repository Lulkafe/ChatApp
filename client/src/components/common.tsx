import React, { useState } from 'react';
import useInterval from 'react-useinterval';
import { calcTimeDiff } from '../util'

export const Timer = (props) => {
    const onExpired = props.onExpired;
    const initialTime = props.startTime || new Date();
    const endTime = props.endTime || new Date();
    const timeLeft = calcTimeDiff(initialTime, endTime);
    const [second, setSecond] = useState(timeLeft.sec);
    const [minute, setMinute] = useState(timeLeft.min);
    const [ticking, setTicking] = useState(true);
    const pad0 = (n: number) => n.toString().padStart(2, '0');

    useInterval(() => {
        
        if (second <= 0 && minute <= 0) {
            setTicking(false);
            if (typeof onExpired === 'function') 
                onExpired();
        } else {
            const curTime = new Date().toISOString();
            const remaining = calcTimeDiff(curTime, endTime);
            setMinute(remaining.min);
            setSecond(remaining.sec);
        }

    }, ticking? 1000 : null);

    return (
        <span className={props.className}>
            {pad0(minute)}:{pad0(second)}
        </span>
    )
}

export const Header = () => {
    return <header className='site-header'></header>
}

