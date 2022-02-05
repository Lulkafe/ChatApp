import React, { useState } from 'react';
import useInterval from 'react-useinterval';

export const Timer = (props) => {
    const onExpired = props.onExpired;
    const [second, setSecond] = useState(props.sec | 0);
    const [minute, setMinute] = useState(props.min | 60);
    const [ticking, setTicking] = useState(true);
    const pad0 = (n: number) => n.toString().padStart(2, '0');

    useInterval(() => {
        
        if (second == 0 && minute == 0) {
            setTicking(false);
            if (typeof onExpired === 'function') 
                onExpired();

        } else if (second > 0) {
            setSecond(second - 1);
        } else if (minute > 0) {
            setMinute(minute - 1);
            setSecond(59);
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

